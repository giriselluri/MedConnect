import { NextRequest, NextResponse } from 'next/server';
import { serverDb } from '@/lib/server-db';

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const currentUser = await serverDb.getCurrentUser();
    if (!currentUser) {
      return NextResponse.json(
        { error: 'Unauthorized: Please sign in to share a case study' },
        { status: 401 }
      );
    }
    const isAdmin = Boolean(currentUser.is_admin || currentUser.role === 'admin');
    const body = await req.json();
    const recipientId = body.recipient_user_id || body.recipient_id;

    if (!recipientId) {
      return NextResponse.json(
        { error: 'Recipient user ID is required to share a case study' },
        { status: 400 }
      );
    }

    const result = await serverDb.shareCaseStudy(params.id, recipientId, currentUser.id, isAdmin);
    return NextResponse.json(result);
  } catch (error: any) {
    const status = error.message?.includes('Forbidden')
      ? 403
      : error.message?.includes('not found')
      ? 404
      : 500;
    return NextResponse.json(
      { error: error.message || 'Failed to share case study' },
      { status }
    );
  }
}
