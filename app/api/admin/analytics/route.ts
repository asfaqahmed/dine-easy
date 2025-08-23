import { NextRequest, NextResponse } from 'next/server';
import { getAdminFromRequest } from '@/lib/auth';
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

    // Get query parameters for date range
    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || '7d'; // 7d, 30d, 90d, 1y

    // Calculate date range
    let startDate = new Date();
    switch (period) {
      case '7d':
        startDate.setDate(startDate.getDate() - 7);
        break;
      case '30d':
        startDate.setDate(startDate.getDate() - 30);
        break;
      case '90d':
        startDate.setDate(startDate.getDate() - 90);
        break;
      case '1y':
        startDate.setFullYear(startDate.getFullYear() - 1);
        break;
    }

    // Get orders data
    const { data: orders, error: ordersError } = await supabaseAdmin
      .from('orders')
      .select('*')
      .gte('created_at', startDate.toISOString());

    if (ordersError) {
      throw new Error(ordersError.message);
    }

    // Get menu items data
    const { data: menuItems, error: menuError } = await supabaseAdmin
      .from('menu_items')
      .select('*');

    if (menuError) {
      throw new Error(menuError.message);
    }

    // Get customers data
    const { data: customers, error: customersError } = await supabaseAdmin
      .from('customers')
      .select('*')
      .gte('created_at', startDate.toISOString());

    if (customersError) {
      throw new Error(customersError.message);
    }

    // Calculate analytics
    const totalOrders = orders.length;
    const totalRevenue = orders.reduce((sum, order) => sum + (order.total_amount || 0), 0);
    const completedOrders = orders.filter(o => o.status === 'completed').length;
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    // Order status distribution
    const statusDistribution = orders.reduce((acc: any, order) => {
      acc[order.status] = (acc[order.status] || 0) + 1;
      return acc;
    }, {});

    // Daily revenue (for charts)
    const dailyRevenue = orders.reduce((acc: any, order) => {
      const date = new Date(order.created_at).toISOString().split('T')[0];
      acc[date] = (acc[date] || 0) + (order.total_amount || 0);
      return acc;
    }, {});

    // Most popular items
    const itemSales: any = {};
    orders.forEach(order => {
      if (order.items) {
        let items;
        try {
          items = typeof order.items === 'string' ? JSON.parse(order.items) : order.items;
        } catch (e) {
          return;
        }
        
        if (Array.isArray(items)) {
          items.forEach((item: any) => {
            const itemName = item.menu_item_name || item.name;
            if (itemName) {
              itemSales[itemName] = (itemSales[itemName] || 0) + (item.quantity || 1);
            }
          });
        }
      }
    });

    const popularItems = Object.entries(itemSales)
      .sort(([,a], [,b]) => (b as number) - (a as number))
      .slice(0, 10)
      .map(([name, quantity]) => ({ name, quantity }));

    // Payment method distribution
    const paymentMethods = orders.reduce((acc: any, order) => {
      const method = order.payment_method || 'unknown';
      acc[method] = (acc[method] || 0) + 1;
      return acc;
    }, {});

    // Customer growth
    const newCustomers = customers.length;

    return NextResponse.json({
      analytics: {
        overview: {
          totalOrders,
          totalRevenue,
          completedOrders,
          averageOrderValue,
          newCustomers,
          completionRate: totalOrders > 0 ? (completedOrders / totalOrders) * 100 : 0
        },
        charts: {
          dailyRevenue: Object.entries(dailyRevenue).map(([date, revenue]) => ({
            date,
            revenue
          })).sort((a, b) => a.date.localeCompare(b.date)),
          statusDistribution: Object.entries(statusDistribution).map(([status, count]) => ({
            status,
            count
          })),
          popularItems,
          paymentMethods: Object.entries(paymentMethods).map(([method, count]) => ({
            method,
            count
          }))
        },
        period
      }
    });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch analytics data' },
      { status: 500 }
    );
  }
}