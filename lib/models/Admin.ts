import { supabaseAdmin } from '../supabase';
import bcrypt from 'bcryptjs';

export interface AdminUser {
  id: string;
  email: string;
  password_hash: string;
  full_name: string;
  role: 'admin' | 'kitchen' | 'manager';
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

export class AdminModel {
  static async create(data: {
    email: string;
    password: string;
    full_name: string;
    role?: 'admin' | 'kitchen' | 'manager';
  }): Promise<AdminUser> {
    const hashedPassword = await bcrypt.hash(data.password, 12);
    
    const { data: user, error } = await supabaseAdmin
      .from('admin_users')
      .insert({
        email: data.email,
        password_hash: hashedPassword,
        full_name: data.full_name,
        role: data.role || 'admin'
      })
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return user;
  }

  static async findByEmail(email: string): Promise<AdminUser | null> {
    const { data: user, error } = await supabaseAdmin
      .from('admin_users')
      .select('*')
      .eq('email', email)
      .eq('is_active', true)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw new Error(error.message);
    }

    return user;
  }

  static async findById(id: string): Promise<AdminUser | null> {
    const { data: user, error } = await supabaseAdmin
      .from('admin_users')
      .select('*')
      .eq('id', id)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw new Error(error.message);
    }

    return user;
  }

  static async verifyPassword(plainPassword: string, hashedPassword: string): Promise<boolean> {
    return await bcrypt.compare(plainPassword, hashedPassword);
  }

  static async authenticate(email: string, password: string): Promise<AdminUser | null> {
    const user = await this.findByEmail(email);
    if (!user) return null;
    
    const isValid = await this.verifyPassword(password, user.password_hash);
    if (!isValid) return null;
    
    return user;
  }

  static async getAll(): Promise<Omit<AdminUser, 'password_hash'>[]> {
    const { data: users, error } = await supabaseAdmin
      .from('admin_users')
      .select('id, email, full_name, role, is_active, created_at, updated_at')
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(error.message);
    }

    return users || [];
  }

  static async update(id: string, data: Partial<Omit<AdminUser, 'id' | 'password_hash' | 'created_at' | 'updated_at'>>): Promise<AdminUser | null> {
    const { data: user, error } = await supabaseAdmin
      .from('admin_users')
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

    return user;
  }

  static async updatePassword(id: string, newPassword: string): Promise<boolean> {
    const hashedPassword = await bcrypt.hash(newPassword, 12);
    
    const { error } = await supabaseAdmin
      .from('admin_users')
      .update({ password_hash: hashedPassword })
      .eq('id', id);

    return !error;
  }

  static async toggleActive(id: string): Promise<AdminUser | null> {
    // First get the current user to know their status
    const current = await this.findById(id);
    if (!current) return null;

    const { data: user, error } = await supabaseAdmin
      .from('admin_users')
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

    return user;
  }

  static async delete(id: string): Promise<boolean> {
    const { error } = await supabaseAdmin
      .from('admin_users')
      .delete()
      .eq('id', id);

    return !error;
  }
}