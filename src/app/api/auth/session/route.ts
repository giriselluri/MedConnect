import { NextResponse } from 'next/server';
import { serverDb } from '@/lib/server-db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const user = await serverDb.getCurrentUser();
    const isDemo = Boolean(user?.is_demo !== false && user?.id?.startsWith('00000000-'));
    // Demo testing users see all seeded profiles; newly registered users see only their own profile
    const allProfiles = isDemo ? await serverDb.getProfiles() : [user];
    return NextResponse.json({ user, allProfiles, isDemo });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to fetch session' }, { status: 500 });
  }
}
