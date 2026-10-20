import { NextRequest, NextResponse } from 'next/server';
import { serverDb } from '@/lib/server-db';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const profile = await serverDb.getProfileById(params.id);
    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }
    return NextResponse.json({ profile });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to fetch profile' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const currentUser = await serverDb.getCurrentUser();
    // Verify user owns profile or is admin
    if (currentUser.id !== params.id && !currentUser.is_admin) {
      return NextResponse.json({ error: 'Unauthorized to edit this profile' }, { status: 403 });
    }

    const updates = await req.json();
    const updated = await serverDb.updateProfile(params.id, updates);
    return NextResponse.json({ profile: updated });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to update profile' }, { status: 500 });
  }
}
