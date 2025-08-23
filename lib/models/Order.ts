import { supabaseAdmin } from '../supabase';

export interface Order {
  id: string;
  customer_id: string;
  table_id?: string;
  order_number: string;
  status: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'completed' | 'cancelled';
  order_type: 'dine_in' | 'takeaway';
  subtotal: number;
  tax_amount: number;
  total_amount: number;
  payment_status: 'pending' | 'completed' | 'failed' | 'refunded';
  payment_method: string;
  special_instructions?: string;
  estimated_ready_time?: Date;
  created_at: Date;
  updated_at: Date;
}

export interface OrderItem {
  id: string;
  order_id: string;
  menu_item_id: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  special_instructions?: string;
  created_at: Date;
}

export interface OrderWithItems extends Order {
  items: (OrderItem & {
    menu_item_name: string;
    menu_item_description: string;
  })[];
  customer_name: string;
  customer_phone: string;
  table_number?: string;
}

export class OrderModel {
  static async create(orderData: {
    customer_id: string;
    table_id?: string;
    order_type: 'dine_in' | 'takeaway';
    subtotal: number;
    tax_amount: number;
    total_amount: number;
    special_instructions?: string;
  }, items: {
    menu_item_id: string;
    quantity: number;
    unit_price: number;
    special_instructions?: string;
  }[]): Promise<OrderWithItems> {
    try {
      // Generate order number
      const orderNumber = `ORD${Date.now()}`;
      
      // Create order
      const { data: order, error: orderError } = await supabaseAdmin
        .from('orders')
        .insert({
          customer_id: orderData.customer_id,
          table_id: orderData.table_id,
          order_number: orderNumber,
          order_type: orderData.order_type,
          subtotal: orderData.subtotal,
          tax_amount: orderData.tax_amount,
          total_amount: orderData.total_amount,
          special_instructions: orderData.special_instructions
        })
        .select()
        .single();

      if (orderError) {
        throw new Error(`Order creation failed: ${orderError.message}`);
      }
      
      // Create order items
      const orderItems: any[] = [];
      for (const item of items) {
        const totalPrice = item.quantity * item.unit_price;
        
        const { data: orderItem, error: itemError } = await supabaseAdmin
          .from('order_items')
          .insert({
            order_id: order.id,
            menu_item_id: item.menu_item_id,
            quantity: item.quantity,
            unit_price: item.unit_price,
            total_price: totalPrice,
            special_instructions: item.special_instructions
          })
          .select()
          .single();

        if (itemError) {
          throw new Error(`Order item creation failed: ${itemError.message}`);
        }
        
        orderItems.push(orderItem);
      }
      
      // Return order with items
      return await this.findByIdWithItems(order.id);
      
    } catch (error) {
      throw error;
    }
  }

  static async findByIdWithItems(id: string): Promise<OrderWithItems> {
    // Get order with customer and table info
    const { data: order, error: orderError } = await supabaseAdmin
      .from('orders')
      .select(`
        *,
        customers!inner(name, phone),
        restaurant_tables(table_number)
      `)
      .eq('id', id)
      .single();
    
    if (orderError || !order) {
      throw new Error('Order not found');
    }
    
    // Get order items with menu item details
    const { data: items, error: itemsError } = await supabaseAdmin
      .from('order_items')
      .select(`
        *,
        menu_items!inner(name, description)
      `)
      .eq('order_id', id);
    
    if (itemsError) {
      throw new Error('Failed to fetch order items');
    }
    
    return {
      ...order,
      customer_name: order.customers.name,
      customer_phone: order.customers.phone,
      table_number: order.restaurant_tables?.table_number,
      items: items.map(item => ({
        ...item,
        menu_item_name: item.menu_items.name,
        menu_item_description: item.menu_items.description
      }))
    };
  }

  static async getAll(): Promise<OrderWithItems[]> {
    const { data: orders, error: ordersError } = await supabaseAdmin
      .from('orders')
      .select(`
        *,
        customers!inner(name, phone),
        restaurant_tables(table_number)
      `)
      .order('created_at', { ascending: false });
    
    if (ordersError) {
      throw new Error('Failed to fetch orders');
    }
    
    // Handle empty results  
    if (!orders || orders.length === 0) {
      return [];
    }
    
    const ordersWithItems: OrderWithItems[] = [];
    
    for (const order of orders) {
      const { data: items, error: itemsError } = await supabaseAdmin
        .from('order_items')
        .select(`
          *,
          menu_items!inner(name, description)
        `)
        .eq('order_id', order.id);
      
      if (itemsError) {
        throw new Error('Failed to fetch order items');
      }
      
      ordersWithItems.push({
        ...order,
        customer_name: order.customers.name,
        customer_phone: order.customers.phone,
        table_number: order.restaurant_tables?.table_number,
        items: items.map(item => ({
          ...item,
          menu_item_name: item.menu_items.name,
          menu_item_description: item.menu_items.description
        }))
      });
    }
    
    return ordersWithItems;
  }

  static async getByStatus(status: string): Promise<OrderWithItems[]> {
    const { data: orders, error: ordersError } = await supabaseAdmin
      .from('orders')
      .select(`
        *,
        customers!inner(name, phone),
        restaurant_tables(table_number)
      `)
      .eq('status', status)
      .order('created_at', { ascending: true });
    
    if (ordersError) {
      throw new Error('Failed to fetch orders by status');
    }
    
    // Handle empty results
    if (!orders || orders.length === 0) {
      return [];
    }
    
    const ordersWithItems: OrderWithItems[] = [];
    
    for (const order of orders) {
      const { data: items, error: itemsError } = await supabaseAdmin
        .from('order_items')
        .select(`
          *,
          menu_items!inner(name, description)
        `)
        .eq('order_id', order.id);
      
      if (itemsError) {
        throw new Error('Failed to fetch order items');
      }
      
      ordersWithItems.push({
        ...order,
        customer_name: order.customers.name,
        customer_phone: order.customers.phone,
        table_number: order.restaurant_tables?.table_number,
        items: items.map(item => ({
          ...item,
          menu_item_name: item.menu_items.name,
          menu_item_description: item.menu_items.description
        }))
      });
    }
    
    return ordersWithItems;
  }

  static async updateStatus(id: string, status: string): Promise<Order | null> {
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
      throw new Error('Failed to update order status');
    }
    
    return order;
  }

  static async updatePaymentStatus(id: string, paymentStatus: string): Promise<Order | null> {
    const { data: order, error } = await supabaseAdmin
      .from('orders')
      .update({ 
        payment_status: paymentStatus, 
        updated_at: new Date().toISOString() 
      })
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      throw new Error('Failed to update payment status');
    }
    
    return order;
  }

  static async getTodaysOrders(): Promise<OrderWithItems[]> {
    const today = new Date().toISOString().split('T')[0];
    
    const { data: orders, error: ordersError } = await supabaseAdmin
      .from('orders')
      .select(`
        *,
        customers!inner(name, phone),
        restaurant_tables(table_number)
      `)
      .gte('created_at', `${today}T00:00:00.000Z`)
      .lt('created_at', `${today}T23:59:59.999Z`)
      .order('created_at', { ascending: false });
    
    if (ordersError) {
      throw new Error('Failed to fetch today\'s orders');
    }
    
    // Handle empty results
    if (!orders || orders.length === 0) {
      return [];
    }
    
    const ordersWithItems: OrderWithItems[] = [];
    
    for (const order of orders) {
      const { data: items, error: itemsError } = await supabaseAdmin
        .from('order_items')
        .select(`
          *,
          menu_items!inner(name, description)
        `)
        .eq('order_id', order.id);
      
      if (itemsError) {
        throw new Error('Failed to fetch order items');
      }
      
      ordersWithItems.push({
        ...order,
        customer_name: order.customers.name,
        customer_phone: order.customers.phone,
        table_number: order.restaurant_tables?.table_number,
        items: items.map(item => ({
          ...item,
          menu_item_name: item.menu_items.name,
          menu_item_description: item.menu_items.description
        }))
      });
    }
    
    return ordersWithItems;
  }
}