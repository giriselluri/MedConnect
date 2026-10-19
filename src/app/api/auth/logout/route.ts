import { NextResponse } from 'next/server';
import { serverDb } from '@/lib/server-db';

export async function POST() {
  try {
    // Reset to default first profile (Dr. Sarah Jenkins)
    const profiles = serverDb.getProfiles();
    if (profiles.length > 0) {
      serverDb.switchUser(profiles[0].id);
    }
    return NextResponse.json({ success: true, message: 'Logged out successfully' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Logout failed' }, { status: 500 });
  }
}
