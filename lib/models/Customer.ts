import { supabaseAdmin } from '../supabase';

export interface Customer {
  id: string;
  name: string;
  phone: string;
  last_order_date: Date;
  created_at: Date;
}

export class CustomerModel {
  static async create(data: { name: string; phone: string }): Promise<Customer> {
    const { data: customer, error } = await supabaseAdmin
      .from('customers')
      .insert({
        name: data.name,
        phone: data.phone
      })
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return customer;
  }

  static async findByPhone(phone: string): Promise<Customer | null> {
    const { data: customer, error } = await supabaseAdmin
      .from('customers')
      .select('*')
      .eq('phone', phone)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw new Error(error.message);
    }

    return customer;
  }

  static async findById(id: string): Promise<Customer | null> {
    const { data: customer, error } = await supabaseAdmin
      .from('customers')
      .select('*')
      .eq('id', id)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw new Error(error.message);
    }

    return customer;
  }

  static async updateLastOrderDate(id: string): Promise<void> {
    try {
      const { error } = await supabaseAdmin
        .from('customers')
        .update({ last_order_date: new Date().toISOString() })
        .eq('id', id);

      if (error) {
        // If column doesn't exist, just log and continue (non-critical)
        console.log('Note: last_order_date column not found in customers table');
      }
    } catch (error) {
      // Non-critical update, don't throw error
      console.log('Note: Could not update customer last order date');
    }
  }

  static async getAll(): Promise<Customer[]> {
    const { data: customers, error } = await supabaseAdmin
      .from('customers')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(error.message);
    }

    return customers || [];
  }

  static async delete(id: string): Promise<boolean> {
    const { error } = await supabaseAdmin
      .from('customers')
      .delete()
      .eq('id', id);

    return !error;
  }
}