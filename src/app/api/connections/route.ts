import { NextRequest, NextResponse } from 'next/server';
import { serverDb } from '@/lib/server-db';

export async function GET() {
  try {
    const currentUser = await serverDb.getCurrentUser();
    const data = await serverDb.getConnections(currentUser.id);
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to fetch connections' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const currentUser = await serverDb.getCurrentUser();
    const body = await req.json();
    const recipientId = body.recipientId || body.recipient_id;

    if (!recipientId) {
      return NextResponse.json({ error: 'Recipient ID is required' }, { status: 400 });
    }

    const connection = await serverDb.sendConnectionRequest(currentUser.id, recipientId);
    return NextResponse.json({ connection }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to send connection request' }, { status: 400 });
  }
}
