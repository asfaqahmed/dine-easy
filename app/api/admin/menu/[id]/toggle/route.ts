import { NextRequest, NextResponse } from 'next/server';
import { getAdminFromRequest } from '@/lib/auth';
import { MenuItemModel } from '@/lib/models/MenuItem';

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const admin = await getAdminFromRequest(request);
    if (!admin) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { is_available } = await request.json();
    
    const menuItem = await MenuItemModel.update(params.id, { is_available });
    
    if (!menuItem) {
      return NextResponse.json(
        { error: 'Menu item not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ menuItem });
  } catch (error) {
    console.error('Error toggling menu item availability:', error);
    return NextResponse.json(
      { error: 'Failed to update menu item availability' },
      { status: 500 }
    );
  }
}