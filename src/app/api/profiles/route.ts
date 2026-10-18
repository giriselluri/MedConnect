import { NextRequest, NextResponse } from 'next/server';
import { serverDb } from '@/lib/server-db';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const role = searchParams.get('role') || undefined;
    const specialty = searchParams.get('specialty') || undefined;
    const search = searchParams.get('search') || undefined;

    const profiles = serverDb.getProfiles({ role, specialty, search });
    return NextResponse.json({ profiles });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to fetch profiles' }, { status: 500 });
  }
}
