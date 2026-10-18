import { NextResponse } from 'next/server';
import { serverDb } from '@/lib/server-db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const currentUser = serverDb.getCurrentUser();
    const groups = serverDb.getGroups(currentUser.id);
    return NextResponse.json({ groups });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to fetch groups' }, { status: 500 });
  }
}
