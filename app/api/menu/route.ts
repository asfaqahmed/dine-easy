import { NextRequest, NextResponse } from 'next/server';
import { MenuItemModel } from '@/lib/models/MenuItem';
import { getAdminFromRequest } from '@/lib/auth';

export async function GET() {
  try {
    const menuItems = await MenuItemModel.getAvailable();
    return NextResponse.json({ menuItems });
  } catch (error) {
    console.error('Error fetching menu items:', error);
    return NextResponse.json(
      { error: 'Failed to fetch menu items' },
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

    const data = await request.json();
    const menuItem = await MenuItemModel.create(data);
    
    return NextResponse.json({ 
      success: true, 
      menuItem 
    });
  } catch (error) {
    console.error('Error creating menu item:', error);
    return NextResponse.json(
      { error: 'Failed to create menu item' },
      { status: 500 }
    );
  }
}