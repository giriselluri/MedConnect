import { NextRequest, NextResponse } from 'next/server';
import { serverDb } from '@/lib/server-db';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const specialty_id = searchParams.get('specialty_id') || undefined;
    const is_active_param = searchParams.get('is_active');
    const search = searchParams.get('search') || undefined;

    const is_active = is_active_param !== null ? is_active_param === 'true' : undefined;

    const jobs = serverDb.getJobs({ specialty_id, is_active, search });
    return NextResponse.json({ jobs });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to fetch jobs' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    if (!body.title || body.title.trim().length === 0) {
      return NextResponse.json({ error: 'Job title is required' }, { status: 400 });
    }
    if (!body.organization || body.organization.trim().length === 0) {
      return NextResponse.json({ error: 'Organization name is required' }, { status: 400 });
    }
    if (!body.description || body.description.trim().length === 0) {
      return NextResponse.json({ error: 'Job description is required' }, { status: 400 });
    }

    const job = serverDb.createJob(body);
    return NextResponse.json({ job, message: 'Job listing created successfully' }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to create job listing' }, { status: 500 });
  }
}
