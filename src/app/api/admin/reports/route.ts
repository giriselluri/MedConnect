import { NextRequest, NextResponse } from 'next/server';
import { serverDb } from '@/lib/server-db';

export async function GET() {
  try {
    const currentUser = serverDb.getCurrentUser();
    const isAdmin = Boolean(currentUser.is_admin || currentUser.role === 'admin');

    if (!isAdmin) {
      return NextResponse.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    const reports = serverDb.getReports();
    return NextResponse.json({ reports });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to fetch content reports' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const currentUser = serverDb.getCurrentUser();
    const isAdmin = Boolean(currentUser.is_admin || currentUser.role === 'admin');

    if (!isAdmin) {
      return NextResponse.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    const { reportId, status } = await req.json();
    if (!reportId || !['reviewed', 'dismissed', 'action_taken'].includes(status)) {
      return NextResponse.json({ error: 'Invalid report status' }, { status: 400 });
    }

    const updated = serverDb.updateReportStatus(reportId, status, currentUser.id);
    return NextResponse.json({ report: updated });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to update report status' }, { status: 500 });
  }
}
