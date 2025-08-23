import { NextRequest, NextResponse } from 'next/server';
import { getAdminFromRequest } from '@/lib/auth';
import { AdminModel } from '@/lib/models/Admin';

export async function GET(
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

    // Only admins can view user details
    if (admin.role !== 'admin') {
      return NextResponse.json(
        { error: 'Forbidden - Admin role required' },
        { status: 403 }
      );
    }

    const user = await AdminModel.findById(params.id);
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Remove password_hash from response
    const { password_hash, ...userResponse } = user;

    return NextResponse.json({ user: userResponse });
  } catch (error) {
    console.error('Error fetching admin user:', error);
    return NextResponse.json(
      { error: 'Failed to fetch admin user' },
      { status: 500 }
    );
  }
}

export async function PUT(
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

    // Only admins can update users, or users can update themselves
    if (admin.role !== 'admin' && admin.id !== params.id) {
      return NextResponse.json(
        { error: 'Forbidden - Can only update your own profile or be an admin' },
        { status: 403 }
      );
    }

    const { email, full_name, role, is_active, password } = await request.json();
    
    const updateData: any = {};
    if (email !== undefined) updateData.email = email;
    if (full_name !== undefined) updateData.full_name = full_name;
    
    // Only admins can change role and active status
    if (admin.role === 'admin') {
      if (role !== undefined) updateData.role = role;
      if (is_active !== undefined) updateData.is_active = is_active;
    }

    // Handle password update separately
    if (password) {
      await AdminModel.updatePassword(params.id, password);
    }

    if (Object.keys(updateData).length > 0) {
      const user = await AdminModel.update(params.id, updateData);
      
      if (!user) {
        return NextResponse.json(
          { error: 'User not found' },
          { status: 404 }
        );
      }

      // Remove password_hash from response
      const { password_hash, ...userResponse } = user;
      return NextResponse.json({ user: userResponse });
    } else {
      // If only password was updated, fetch the updated user
      const user = await AdminModel.findById(params.id);
      if (!user) {
        return NextResponse.json(
          { error: 'User not found' },
          { status: 404 }
        );
      }

      const { password_hash, ...userResponse } = user;
      return NextResponse.json({ user: userResponse });
    }
  } catch (error) {
    console.error('Error updating admin user:', error);
    return NextResponse.json(
      { error: 'Failed to update admin user' },
      { status: 500 }
    );
  }
}

export async function DELETE(
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

    // Only admins can delete users
    if (admin.role !== 'admin') {
      return NextResponse.json(
        { error: 'Forbidden - Admin role required' },
        { status: 403 }
      );
    }

    // Prevent self-deletion
    if (admin.id === params.id) {
      return NextResponse.json(
        { error: 'Cannot delete your own account' },
        { status: 400 }
      );
    }

    const success = await AdminModel.delete(params.id);
    
    if (!success) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting admin user:', error);
    return NextResponse.json(
      { error: 'Failed to delete admin user' },
      { status: 500 }
    );
  }
}