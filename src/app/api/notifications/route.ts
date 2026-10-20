import { NextRequest, NextResponse } from 'next/server';
import { serverDb } from '@/lib/server-db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const currentUser = await serverDb.getCurrentUser();
    const result = await serverDb.getNotifications(currentUser.id);
    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to fetch notifications' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const currentUser = await serverDb.getCurrentUser();
    const body = await req.json();

    if (body.mark_all) {
      await serverDb.markAllNotificationsRead(currentUser.id);
      return NextResponse.json({ success: true, unread_count: 0, message: 'All notifications marked as read' });
    }

    if (body.id) {
      const success = await serverDb.markNotificationRead(body.id, currentUser.id);
      return NextResponse.json({ success });
    }

    return NextResponse.json({ error: 'Specify notification id or mark_all: true' }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to update notifications' }, { status: 500 });
  }
}
