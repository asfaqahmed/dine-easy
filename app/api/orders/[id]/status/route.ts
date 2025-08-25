import { NextRequest, NextResponse } from 'next/server';
import { SimpleOrderModel } from '@/lib/models/OrderSimple';
import { getAdminFromRequest } from '@/lib/auth';
import { smsService } from '@/lib/sms';
import { supabaseAdmin } from '@/lib/supabase';

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const admin = await getAdminFromRequest(request);
    if (!admin) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { status } = await request.json();
    const orderId = params.id;

    if (!status || !orderId) {
      return NextResponse.json(
        { error: 'Status and order ID are required' },
        { status: 400 }
      );
    }

    // Validate status value
    const validStatuses = ['pending', 'confirmed', 'preparing', 'ready', 'completed', 'cancelled'];
    if (!validStatuses.includes(status)) {
      console.error('Invalid status received:', status);
      return NextResponse.json(
        { error: `Invalid status. Must be one of: ${validStatuses.join(', ')}` },
        { status: 400 }
      );
    }

    console.log('Updating order status:', { orderId, status });

    // Get current order to access customer info
    const currentOrder = await SimpleOrderModel.findById(orderId);
    if (!currentOrder) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    // Update order status
    const updatedOrder = await SimpleOrderModel.updateStatus(orderId, status);
    if (!updatedOrder) {
      return NextResponse.json(
        { error: 'Failed to update order status' },
        { status: 500 }
      );
    }

    // Send SMS notification for status updates
    try {
      if (status === 'preparing' || status === 'ready' || status === 'completed') {
        // Get customer phone number from the order
        const { data: customerData } = await supabaseAdmin
          .from('customers')
          .select('phone, name')
          .eq('id', currentOrder.customer_id)
          .single();
        
        if (customerData?.phone) {
          // Use the order_number from the order, or fallback to a generated one
          const orderNumber = currentOrder.order_number || `ORD${orderId.substring(0, 8)}`;
          
          await smsService.sendOrderStatusUpdate(
            customerData.phone,
            orderNumber,
            status,
            orderId
          );
          
          console.log(`SMS sent to ${customerData.phone} for order ${orderId} status: ${status}`);
        }
      }
    } catch (smsError) {
      console.error('SMS sending failed:', smsError);
      // Don't fail the update if SMS fails
    }

    return NextResponse.json({ 
      success: true, 
      order: updatedOrder 
    });
  } catch (error) {
    console.error('Error updating order status:', error);
    return NextResponse.json(
      { error: 'Failed to update order status' },
      { status: 500 }
    );
  }
}