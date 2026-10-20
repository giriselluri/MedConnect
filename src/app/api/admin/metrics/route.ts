import { NextResponse } from 'next/server';
import { serverDb } from '@/lib/server-db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const currentUser = await serverDb.getCurrentUser();
    const isAdmin = Boolean(currentUser.is_admin || currentUser.role === 'admin');

    if (!isAdmin) {
      return NextResponse.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    const metrics = await serverDb.getAdminMetrics();
    return NextResponse.json({ metrics });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to fetch admin metrics' }, { status: 500 });
  }
}
