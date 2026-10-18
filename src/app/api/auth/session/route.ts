import { NextResponse } from 'next/server';
import { serverDb } from '@/lib/server-db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const user = serverDb.getCurrentUser();
    return NextResponse.json({ user, allProfiles: serverDb.getProfiles() });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to fetch session' }, { status: 500 });
  }
}
