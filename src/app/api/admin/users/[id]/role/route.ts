import { NextRequest, NextResponse } from 'next/server';
import { serverDb } from '@/lib/server-db';
import { UserRole } from '@/types';

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const currentUser = await serverDb.getCurrentUser();
    const isAdmin = Boolean(currentUser.is_admin || currentUser.role === 'admin');

    if (!isAdmin) {
      return NextResponse.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    const { role } = await req.json();
    const validRoles: UserRole[] = [
      'admin',
      'healthcare_professional',
      'medical_student',
      'researcher',
      'pharmaceutical_professional',
      'other_healthcare_professional',
    ];

    if (!validRoles.includes(role)) {
      return NextResponse.json({ error: 'Invalid user role' }, { status: 400 });
    }

    const is_admin = role === 'admin';
    const updated = await serverDb.updateProfile(params.id, { role, is_admin });

    return NextResponse.json({ user: updated });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to update user role' }, { status: 500 });
  }
}
