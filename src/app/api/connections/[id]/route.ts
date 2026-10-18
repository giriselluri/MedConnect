import { NextRequest, NextResponse } from 'next/server';
import { serverDb } from '@/lib/server-db';

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const currentUser = serverDb.getCurrentUser();
    const { status } = await req.json();

    if (!['accepted', 'declined', 'blocked'].includes(status)) {
      return NextResponse.json({ error: 'Invalid connection status' }, { status: 400 });
    }

    const updated = serverDb.updateConnectionStatus(params.id, status, currentUser.id);
    return NextResponse.json({ connection: updated });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to update connection' }, { status: 500 });
  }
}
