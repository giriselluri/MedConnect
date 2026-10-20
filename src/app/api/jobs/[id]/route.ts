import { NextRequest, NextResponse } from 'next/server';
import { serverDb } from '@/lib/server-db';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const job = await serverDb.getJobById(params.id);
    if (!job) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 });
    }
    return NextResponse.json({ job });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to fetch job' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await req.json();
    const updated = await serverDb.updateJob(params.id, body);
    return NextResponse.json({ job: updated, message: 'Job updated successfully' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to update job' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const success = await serverDb.deleteJob(params.id);
    if (!success) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, message: 'Job deleted successfully' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to delete job' }, { status: 500 });
  }
}
