import { NextRequest, NextResponse } from 'next/server';
import { generatePayHereHash, PAYHERE_CONFIG } from '@/lib/payhere';
import { getCustomerFromRequest } from '@/lib/auth';
import { SimpleOrderModel } from '@/lib/models/OrderSimple';
import { supabaseAdmin } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const customer = await getCustomerFromRequest(request);
    if (!customer) {
      return NextResponse.json(
        { error: 'Customer not authenticated' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');
    const body = await request.json();

    const merchant_id = PAYHERE_CONFIG.MERCHANT_ID;
    const merchant_secret = PAYHERE_CONFIG.MERCHANT_SECRET;

    if (!merchant_id || !merchant_secret) {
      return NextResponse.json(
        { error: 'PayHere credentials not configured' },
        { status: 500 }
      );
    }

    // Generate hash for payment start
    if (action === 'start') {
      const { order_id, amount, items } = body;

      if (!order_id || !amount) {
        return NextResponse.json(
          { error: 'Missing required fields' },
          { status: 400 }
        );
      }

      // Verify order exists and belongs to customer
      const order = await SimpleOrderModel.findById(order_id);
      if (!order || order.customer_id !== customer.id) {
        return NextResponse.json(
          { error: 'Order not found or unauthorized' },
          { status: 404 }
        );
      }

      // Create payment record in database
      const { data: payment, error: paymentError } = await supabaseAdmin
        .from('payment_transactions')
        .insert({
          order_id: order_id,
          amount: amount,
          currency: 'LKR',
          status: 'pending',
          payment_method: 'payhere'
        })
        .select()
        .single();

      if (paymentError) {
        console.error('Payment creation error:', paymentError);
        return NextResponse.json(
          { error: 'Failed to create payment record' },
          { status: 500 }
        );
      }

      // Generate PayHere hash using order ID
      const hash = generatePayHereHash(order.id, amount);

      return NextResponse.json({ 
        hash, 
        merchant_id,
        order_id: order.id,
        amount: parseFloat(amount.toString()).toFixed(2),
        payment_record_id: payment.id
      });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });

  } catch (error) {
    console.error('PayHere API error:', error);
    return NextResponse.json(
      { error: 'Failed to process payment request' },
      { status: 500 }
    );
  }
}