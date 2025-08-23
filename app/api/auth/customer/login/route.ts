import { NextRequest, NextResponse } from 'next/server';
import { CustomerModel } from '@/lib/models/Customer';
import { encrypt } from '@/lib/auth';
import { validateSriLankanPhone, formatPhoneNumber } from '@/lib/utils';

export async function POST(request: NextRequest) {
  try {
    const { name, phone, table_number } = await request.json();

    if (!name || !phone) {
      return NextResponse.json(
        { error: 'Name and phone are required' },
        { status: 400 }
      );
    }

    if (!validateSriLankanPhone(phone)) {
      return NextResponse.json(
        { error: 'Please enter a valid Sri Lankan phone number' },
        { status: 400 }
      );
    }

    const formattedPhone = formatPhoneNumber(phone);

    // Find or create customer
    let customer = await CustomerModel.findByPhone(formattedPhone);
    
    if (!customer) {
      customer = await CustomerModel.create({
        name: name.trim(),
        phone: formattedPhone
      });
    }

    // Create JWT token
    const token = await encrypt({ 
      customer: { 
        id: customer.id, 
        name: customer.name, 
        phone: customer.phone,
        table_number: table_number || 'takeaway'
      } 
    });

    // Set cookie
    const response = NextResponse.json({
      success: true,
      customer: {
        id: customer.id,
        name: customer.name,
        phone: customer.phone,
        table_number: table_number || 'takeaway'
      }
    });

    response.cookies.set('customer-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 4 // 4 hours
    });

    return response;
  } catch (error) {
    console.error('Customer login error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}