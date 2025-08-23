import { NextRequest, NextResponse } from 'next/server';
import { SimpleOrderModel, OrderItemData } from '@/lib/models/OrderSimple';
import { CustomerModel } from '@/lib/models/Customer';
import { MenuItemModel } from '@/lib/models/MenuItem';
import { TableModel } from '@/lib/models/Table';
import { getCustomerFromRequest, getAdminFromRequest } from '@/lib/auth';
import { calculateTax, calculateTotal, estimateReadyTime } from '@/lib/utils';
import { smsService } from '@/lib/sms';

export async function GET(request: NextRequest) {
  try {
    const admin = await getAdminFromRequest(request);
    if (!admin) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');

    let orders;
    if (status) {
      orders = await SimpleOrderModel.getByStatus(status);
    } else {
      orders = await SimpleOrderModel.getTodaysOrders();
    }

    // Transform orders to parse items JSON string to array for frontend compatibility
    const transformedOrders = orders.map(order => {
      let parsedItems = typeof order.items === 'string' ? JSON.parse(order.items) : order.items;
      
      // Transform item fields to match frontend expectations
      if (Array.isArray(parsedItems)) {
        parsedItems = parsedItems.map((item, index) => ({
          id: item.menu_item_id || `item-${index}`,
          menu_item_id: item.menu_item_id,
          menu_item_name: item.name,
          quantity: item.quantity,
          unit_price: item.price,
          total_price: item.price * item.quantity,
          special_instructions: item.special_instructions
        }));
      }
      
      return {
        ...order,
        items: parsedItems
      };
    });

    return NextResponse.json({ orders: transformedOrders });
  } catch (error) {
    console.error('Error fetching orders:', error);
    return NextResponse.json(
      { error: 'Failed to fetch orders' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const customer = await getCustomerFromRequest(request);
    if (!customer) {
      return NextResponse.json(
        { error: 'Customer not authenticated' },
        { status: 401 }
      );
    }

    const { items, table_number, special_instructions } = await request.json();

    if (!items || items.length === 0) {
      return NextResponse.json(
        { error: 'No items in order' },
        { status: 400 }
      );
    }

    // Validate items and calculate totals
    let subtotal = 0;
    const orderItems: OrderItemData[] = [];

    for (const item of items) {
      const menuItem = await MenuItemModel.findById(item.menu_item_id);
      if (!menuItem || !menuItem.is_available) {
        return NextResponse.json(
          { error: `Item ${item.menu_item_id} is not available` },
          { status: 400 }
        );
      }

      const itemTotal = menuItem.price * item.quantity;
      subtotal += itemTotal;

      orderItems.push({
        menu_item_id: item.menu_item_id,
        quantity: item.quantity,
        name: menuItem.name,
        price: menuItem.price,
        special_instructions: item.special_instructions
      });
    }

    const taxAmount = calculateTax(subtotal);
    const totalAmount = calculateTotal(subtotal, taxAmount);

    // Find table if dine-in
    let table_id: string | undefined = undefined;
    const order_type = table_number && table_number !== 'takeaway' ? 'dine_in' : 'takeaway';
    
    if (order_type === 'dine_in') {
      const table = await TableModel.findByTableNumber(table_number);
      if (table) {
        table_id = table.id;
      }
    }

    // Create order
    const order = await SimpleOrderModel.create({
      customer_id: customer.id,
      table_id,
      items: orderItems,
      total_amount: totalAmount
    });

    // Update customer last order date
    await CustomerModel.updateLastOrderDate(customer.id);

    // Send SMS confirmation
    try {
      await smsService.sendOrderConfirmation(
        customer.phone,
        order.id, // Use order ID instead of order_number
        totalAmount
      );
    } catch (smsError) {
      console.error('SMS sending failed:', smsError);
      // Don't fail the order if SMS fails
    }

    return NextResponse.json({ 
      success: true, 
      order 
    });
  } catch (error) {
    console.error('Error creating order:', error);
    return NextResponse.json(
      { error: 'Failed to create order' },
      { status: 500 }
    );
  }
}