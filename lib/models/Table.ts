import { supabaseAdmin } from '../supabase';

export interface Table {
  id: string;
  table_number: string;
  qr_code?: string;
  capacity: number;
  is_active: boolean;
  created_at: Date;
}

export class TableModel {
  static async create(data: { 
    table_number: string; 
    capacity: number; 
    qr_code?: string;
  }): Promise<Table> {
    const { data: table, error } = await supabaseAdmin
      .from('restaurant_tables')
      .insert({
        table_number: data.table_number,
        qr_code: data.qr_code,
        capacity: data.capacity
      })
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return table;
  }

  static async findById(id: string): Promise<Table | null> {
    const { data: table, error } = await supabaseAdmin
      .from('restaurant_tables')
      .select('*')
      .eq('id', id)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw new Error(error.message);
    }

    return table;
  }

  static async findByTableNumber(tableNumber: string): Promise<Table | null> {
    const { data: table, error } = await supabaseAdmin
      .from('restaurant_tables')
      .select('*')
      .eq('table_number', tableNumber)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw new Error(error.message);
    }

    return table;
  }

  static async getAll(): Promise<Table[]> {
    const { data: tables, error } = await supabaseAdmin
      .from('restaurant_tables')
      .select('*')
      .order('table_number');

    if (error) {
      throw new Error(error.message);
    }

    return tables || [];
  }

  static async getActive(): Promise<Table[]> {
    const { data: tables, error } = await supabaseAdmin
      .from('restaurant_tables')
      .select('*')
      .eq('is_active', true)
      .order('table_number');

    if (error) {
      throw new Error(error.message);
    }

    return tables || [];
  }

  static async update(id: string, data: Partial<Omit<Table, 'id' | 'created_at'>>): Promise<Table | null> {
    const { data: table, error } = await supabaseAdmin
      .from('restaurant_tables')
      .update(data)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      throw new Error(error.message);
    }

    return table;
  }

  static async updateQRCode(id: string, qrCode: string): Promise<Table | null> {
    const { data: table, error } = await supabaseAdmin
      .from('restaurant_tables')
      .update({ qr_code: qrCode })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      throw new Error(error.message);
    }

    return table;
  }

  static async toggleActive(id: string): Promise<Table | null> {
    // First get the current table to know its status
    const current = await this.findById(id);
    if (!current) return null;

    const { data: table, error } = await supabaseAdmin
      .from('restaurant_tables')
      .update({ is_active: !current.is_active })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      throw new Error(error.message);
    }

    return table;
  }

  static async delete(id: string): Promise<boolean> {
    const { error } = await supabaseAdmin
      .from('restaurant_tables')
      .delete()
      .eq('id', id);

    return !error;
  }
}