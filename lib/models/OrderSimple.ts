import { supabaseAdmin } from '../supabase';

export interface SimpleOrder {
  id: string;
  customer_id: string;
  table_id?: string;
  order_number: string;
  items: any; // JSON data
  subtotal?: number;
  tax_amount?: number;
  total_amount: number;
  status: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'completed' | 'cancelled';
  payment_status: 'pending' | 'completed' | 'failed' | 'cancelled';
  payment_method?: string;
  payment_id?: string;
  special_instructions?: string;
  estimated_ready_time?: Date;
  estimated_time?: number;
  created_at: Date;
  updated_at: Date;
}

export interface OrderItemData {
  menu_item_id: string;
  quantity: number;
  name: string;
  price: number;
  special_instructions?: string;
}

export class SimpleOrderModel {
  static async create(orderData: {
    customer_id: string;
    table_id?: string;
    items: OrderItemData[];
    total_amount: number;
  }): Promise<SimpleOrder> {
    try {
      // Generate order number
      const orderNumber = `ORD${Date.now()}`;
      
      const { data: order, error: orderError } = await supabaseAdmin
        .from('orders')
        .insert({
          customer_id: orderData.customer_id,
          table_id: orderData.table_id,
          order_number: orderNumber,
          items: orderData.items,
          subtotal: orderData.total_amount,
          total_amount: orderData.total_amount,
          status: 'pending',
          payment_status: 'pending',
          payment_method: 'payhere'
        })
        .select()
        .single();

      if (orderError) {
        throw new Error(`Order creation failed: ${orderError.message}`);
      }

      return order;
    } catch (error) {
      throw error;
    }
  }

  static async findById(id: string): Promise<SimpleOrder | null> {
    const { data: order, error } = await supabaseAdmin
      .from('orders')
      .select('*')
      .eq('id', id)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw new Error(error.message);
    }

    return order;
  }

  static async updateStatus(id: string, status: string): Promise<SimpleOrder | null> {
    const { data: order, error } = await supabaseAdmin
      .from('orders')
      .update({ 
        status: status, 
        updated_at: new Date().toISOString() 
      })
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      console.error('Database error in updateStatus:', error);
      throw new Error(`Failed to update order status: ${error.message} (Code: ${error.code})`);
    }
    
    return order;
  }

  static async updatePaymentStatus(id: string, paymentStatus: string, paymentId?: string): Promise<SimpleOrder | null> {
    const updateData: any = { 
      payment_status: paymentStatus, 
      updated_at: new Date().toISOString() 
    };
    
    if (paymentId) {
      updateData.payment_id = paymentId;
    }

    const { data: order, error } = await supabaseAdmin
      .from('orders')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      throw new Error('Failed to update payment status');
    }
    
    return order;
  }

  static async getTodaysOrders(): Promise<SimpleOrder[]> {
    const today = new Date().toISOString().split('T')[0];
    
    const { data: orders, error } = await supabaseAdmin
      .from('orders')
      .select('*')
      .gte('created_at', `${today}T00:00:00.000Z`)
      .lt('created_at', `${today}T23:59:59.999Z`)
      .order('created_at', { ascending: false });
    
    if (error) {
      throw new Error('Failed to fetch today\'s orders');
    }
    
    return orders || [];
  }

  static async getByStatus(status: string): Promise<SimpleOrder[]> {
    const { data: orders, error } = await supabaseAdmin
      .from('orders')
      .select('*')
      .eq('status', status)
      .order('created_at', { ascending: true });
    
    if (error) {
      throw new Error('Failed to fetch orders by status');
    }
    
    return orders || [];
  }
}