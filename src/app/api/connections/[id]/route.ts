import { NextRequest, NextResponse } from 'next/server';
import { serverDb } from '@/lib/server-db';

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const currentUser = await serverDb.getCurrentUser();
    const { status } = await req.json();

    if (!['accepted', 'declined', 'blocked'].includes(status)) {
      return NextResponse.json({ error: 'Invalid connection status' }, { status: 400 });
    }

    const updated = await serverDb.updateConnectionStatus(params.id, status, currentUser.id);
    return NextResponse.json({ connection: updated });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to update connection' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const currentUser = await serverDb.getCurrentUser();
    const success = await serverDb.removeConnection(params.id, currentUser.id);

    if (!success) {
      return NextResponse.json({ error: 'Connection not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'Connection removed successfully' });
  } catch (error: any) {
    const status = error.message.includes('Unauthorized') ? 403 : 500;
    return NextResponse.json({ error: error.message || 'Failed to remove connection' }, { status });
  }
}
