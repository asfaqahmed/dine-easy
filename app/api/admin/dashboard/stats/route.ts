import { NextRequest, NextResponse } from 'next/server';
import { getAdminFromRequest } from '@/lib/auth';
import { SimpleOrderModel } from '@/lib/models/OrderSimple';
import { CustomerModel } from '@/lib/models/Customer';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const admin = await getAdminFromRequest(request);
    if (!admin) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get today's date
    const today = new Date().toISOString().split('T')[0];

    // Fetch today's orders
    const todaysOrders = await SimpleOrderModel.getTodaysOrders();
    
    // Calculate today's revenue
    const todaysRevenue = todaysOrders.reduce((total, order) => total + order.total_amount, 0);

    // Get total customers count
    const customers = await CustomerModel.getAll();
    const totalCustomers = customers.length;

    // Calculate average prep time (mock for now)
    const avgPrepTime = 15;

    // Calculate weekly growth (simplified)
    const weeklyGrowth = todaysOrders.length > 0 ? 
      Math.round(((todaysOrders.length / 7) - 1) * 100) : 0;

    // Get popular items from today's orders
    const popularItemsMap = new Map();
    todaysOrders.forEach(order => {
      try {
        const items = typeof order.items === 'string' ? JSON.parse(order.items) : order.items;
        if (Array.isArray(items)) {
          items.forEach(item => {
            const key = item.name || item.menu_item_id;
            if (popularItemsMap.has(key)) {
              const existing = popularItemsMap.get(key);
              existing.orders += item.quantity;
              existing.revenue += item.price * item.quantity;
            } else {
              popularItemsMap.set(key, {
                name: key,
                orders: item.quantity,
                revenue: item.price * item.quantity
              });
            }
          });
        }
      } catch (e) {
        console.error('Error parsing order items:', e);
      }
    });

    const popularItems = Array.from(popularItemsMap.values())
      .sort((a, b) => b.orders - a.orders);

    // Get recent orders with customer info
    const recentOrders = await Promise.all(
      todaysOrders.slice(0, 10).map(async (order) => {
        try {
          const customer = await CustomerModel.findById(order.customer_id);
          return {
            ...order,
            customer_name: customer?.name || 'Unknown Customer'
          };
        } catch {
          return {
            ...order,
            customer_name: 'Unknown Customer'
          };
        }
      })
    );

    return NextResponse.json({
      todaysOrders: todaysOrders.length,
      todaysRevenue,
      totalCustomers,
      avgPrepTime,
      weeklyGrowth,
      popularItems,
      recentOrders
    });

  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dashboard stats' },
      { status: 500 }
    );
  }
}