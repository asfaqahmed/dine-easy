import { NextRequest, NextResponse } from 'next/server';
import { verifyPayHereCallback } from '@/lib/payhere';
import { SimpleOrderModel } from '@/lib/models/OrderSimple';
import { supabaseAdmin } from '@/lib/supabase';
import { smsService } from '@/lib/sms';

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

    // Find order by ID (PayHere sends the actual order ID, not order_number)
    let actualOrderId = order_id;
    
    // Try to find order directly by ID first
    const { data: orderCheck } = await supabaseAdmin
      .from('orders')
      .select('id')
      .eq('id', order_id)
      .single();
    
    // If not found by ID, try by order_number
    if (!orderCheck) {
      const { data: orderByNumber } = await supabaseAdmin
        .from('orders')
        .select('id')
        .eq('order_number', order_id)
        .single();
      
      if (orderByNumber) {
        actualOrderId = orderByNumber.id;
      }
    }

    // Update payment transaction status in database
    const { data: paymentTransaction, error: paymentError } = await supabaseAdmin
      .from('payment_transactions')
      .update({
        status: verification.status,
        payment_id: payment_id,
        updated_at: new Date().toISOString()
      })
      .eq('order_id', actualOrderId)
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

      // Send SMS notification to customer about successful payment
      try {
        // Get customer phone number from the order
        const { data: customerData } = await supabaseAdmin
          .from('customers')
          .select('phone, name')
          .eq('id', paymentTransaction.orders.customer_id)
          .single();
        
        if (customerData?.phone) {
          await smsService.sendPaymentConfirmation(
            customerData.phone, 
            paymentTransaction.orders.order_number, 
            parseFloat(payhere_amount),
            payment_id,
            paymentTransaction.orders.id
          );
          
          // Also send order confirmation SMS
          await smsService.sendOrderConfirmation(
            customerData.phone,
            paymentTransaction.orders.order_number,
            paymentTransaction.orders.total_amount,
            paymentTransaction.orders.id
          );
        }
      } catch (smsError) {
        console.error('SMS sending failed:', smsError);
        // Don't fail the payment process if SMS fails
      }
      
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