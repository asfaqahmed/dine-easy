import { NextRequest, NextResponse } from 'next/server';
import { getCustomerFromRequest } from '@/lib/auth';
import { CustomerModel } from '@/lib/models/Customer';

export async function GET(request: NextRequest) {
  try {
    const customer = await getCustomerFromRequest(request);
    
    if (!customer) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    // Get fresh customer data from database
    const customerData = await CustomerModel.findById(customer.id);
    
    if (!customerData) {
      return NextResponse.json(
        { error: 'Customer not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      customer: {
        id: customerData.id,
        name: customerData.name,
        phone: customerData.phone,
        table_number: customer.table_number
      }
    });
  } catch (error) {
    console.error('Error getting customer:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}