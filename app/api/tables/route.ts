import { NextRequest, NextResponse } from 'next/server';
import { TableModel } from '@/lib/models/Table';
import { getAdminFromRequest } from '@/lib/auth';

export async function GET() {
  try {
    const tables = await TableModel.getAll();
    return NextResponse.json({ tables });
  } catch (error) {
    console.error('Error fetching tables:', error);
    return NextResponse.json(
      { error: 'Failed to fetch tables' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const admin = await getAdminFromRequest(request);
    if (!admin) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { table_number, capacity } = await request.json();

    if (!table_number) {
      return NextResponse.json(
        { error: 'Table number is required' },
        { status: 400 }
      );
    }

    // Check if table number already exists
    const existingTable = await TableModel.findByTableNumber(table_number);
    if (existingTable) {
      return NextResponse.json(
        { error: 'Table number already exists' },
        { status: 400 }
      );
    }

    // Generate QR code URL for the table
    const menuUrl = `${process.env.NEXT_PUBLIC_APP_URL}/menu?table=${table_number}`;
    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(menuUrl)}`;

    const table = await TableModel.create({
      table_number,
      capacity: capacity || 4,
      qr_code: qrCodeUrl
    });

    return NextResponse.json({ 
      success: true, 
      table 
    });
  } catch (error) {
    console.error('Error creating table:', error);
    return NextResponse.json(
      { error: 'Failed to create table' },
      { status: 500 }
    );
  }
}