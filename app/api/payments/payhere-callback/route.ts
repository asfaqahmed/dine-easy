import { NextRequest, NextResponse } from 'next/server';
import { verifyPayHereCallback } from '@/lib/payhere';
import { SimpleOrderModel } from '@/lib/models/OrderSimple';
import { supabaseAdmin } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('PayHere callback received:', body);

    const {
      merchant_id,
      order_id,
      payment_id,
      payhere_amount,
      payhere_currency,
      status_code,
      md5sig
    } = body;

    if (!merchant_id || !order_id || !payhere_amount || !payhere_currency || !status_code || !md5sig) {
      return NextResponse.json(
        { error: 'Missing required callback parameters' },
        { status: 400 }
      );
    }

    // Verify the callback using PayHere utilities
    const verification = verifyPayHereCallback({
      merchant_id,
      order_id,
      payhere_amount,
      payhere_currency,
      status_code,
      md5sig
    });

    if (!verification.isValid) {
      console.log('PayHere callback verification failed for order:', order_id);
      return NextResponse.json(
        { error: 'Invalid payment verification' },
        { status: 400 }
      );
    }

    // Update payment transaction status in database
    const { data: paymentTransaction, error: paymentError } = await supabaseAdmin
      .from('payment_transactions')
      .update({
        status: verification.status,
        payhere_payment_id: payment_id,
        updated_at: new Date().toISOString()
      })
      .eq('order_id', (await supabaseAdmin.from('orders').select('id').eq('order_number', order_id).single()).data?.id)
      .select(`
        *,
        orders!inner(id, customer_id, total_amount, order_number)
      `)
      .single();

    if (paymentError) {
      console.error('Payment transaction update error:', paymentError);
      return NextResponse.json(
        { error: 'Failed to update payment transaction' },
        { status: 500 }
      );
    }

    if (verification.status === 'paid' && paymentTransaction) {
      // Update order payment status to completed
      await SimpleOrderModel.updatePaymentStatus(
        paymentTransaction.orders.id,
        'completed',
        payment_id
      );

      // Update order status to confirmed if it's still pending
      const { data: currentOrder } = await supabaseAdmin
        .from('orders')
        .select('status')
        .eq('id', paymentTransaction.orders.id)
        .single();

      if (currentOrder?.status === 'pending') {
        await SimpleOrderModel.updateStatus(
          paymentTransaction.orders.id,
          'confirmed'
        );
      }

      console.log(`✅ Payment successful for order: ${order_id}, amount: ${payhere_amount} ${payhere_currency}`);

      // TODO: Send SMS notification to customer about successful payment
      // This would integrate with Send.lk API when implemented
      
      return NextResponse.json({ 
        status: 'success',
        message: 'Payment processed successfully'
      });
    }

    // Handle failed payments
    if (verification.status === 'failed' || verification.status === 'cancelled') {
      await SimpleOrderModel.updatePaymentStatus(
        paymentTransaction.orders.id,
        verification.status === 'cancelled' ? 'cancelled' : 'failed'
      );

      console.log(`❌ Payment ${verification.status} for order: ${order_id}`);
    }

    return NextResponse.json({
      status: 'processed',
      payment_status: verification.status
    });

  } catch (error) {
    console.error('PayHere callback processing error:', error);
    return NextResponse.json(
      { error: 'Failed to process payment callback' },
      { status: 500 }
    );
  }
}