import { supabaseAdmin } from '../supabase';
import pool from '../db';

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: 'appetizers' | 'mains' | 'desserts' | 'beverages' | 'specials';
  image_url?: string;
  is_available: boolean;
  preparation_time: number;
  ingredients?: string;
  created_at: Date;
  updated_at: Date;
}

export class MenuItemModel {
  static async create(data: Omit<MenuItem, 'id' | 'created_at' | 'updated_at'>): Promise<MenuItem> {
    const { data: menuItem, error } = await supabaseAdmin
      .from('menu_items')
      .insert({
        name: data.name,
        description: data.description,
        price: data.price,
        category: data.category,
        image_url: data.image_url,
        is_available: data.is_available !== undefined ? data.is_available : true,
        preparation_time: data.preparation_time || 15,
        ingredients: data.ingredients
      })
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return menuItem;
  }

  static async findById(id: string): Promise<MenuItem | null> {
    const { data: menuItem, error } = await supabaseAdmin
      .from('menu_items')
      .select('*')
      .eq('id', id)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw new Error(error.message);
    }

    return menuItem;
  }

  static async getAll(): Promise<MenuItem[]> {
    const { data: menuItems, error } = await supabaseAdmin
      .from('menu_items')
      .select('*')
      .order('category')
      .order('name');

    if (error) {
      throw new Error(error.message);
    }

    return menuItems || [];
  }

  static async getAvailable(): Promise<MenuItem[]> {
    const { data: menuItems, error } = await supabaseAdmin
      .from('menu_items')
      .select('*')
      .eq('is_available', true)
      .order('category')
      .order('name');

    if (error) {
      throw new Error(error.message);
    }

    return menuItems || [];
  }

  static async getByCategory(category: string): Promise<MenuItem[]> {
    const { data: menuItems, error } = await supabaseAdmin
      .from('menu_items')
      .select('*')
      .eq('category', category)
      .eq('is_available', true)
      .order('name');

    if (error) {
      throw new Error(error.message);
    }

    return menuItems || [];
  }

  static async update(id: string, data: Partial<MenuItem>): Promise<MenuItem | null> {
    const updateData = {
      ...data,
      updated_at: new Date().toISOString()
    };
    
    const { data: menuItem, error } = await supabaseAdmin
      .from('menu_items')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return menuItem;
  }

  static async delete(id: string): Promise<boolean> {
    const { error } = await supabaseAdmin
      .from('menu_items')
      .delete()
      .eq('id', id);

    return !error;
  }

  static async toggleAvailability(id: string): Promise<MenuItem | null> {
    // First get current item to toggle its availability
    const currentItem = await this.findById(id);
    if (!currentItem) return null;
    
    const { data: menuItem, error } = await supabaseAdmin
      .from('menu_items')
      .update({ 
        is_available: !currentItem.is_available,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return menuItem;
  }
}