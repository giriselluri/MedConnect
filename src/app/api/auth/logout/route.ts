import { NextResponse } from 'next/server';
import { serverDb } from '@/lib/server-db';

export async function POST() {
  try {
    // Reset to default first profile (Dr. Sarah Jenkins)
    const profiles = await serverDb.getProfiles();
    if (profiles.length > 0) {
      await serverDb.switchUser(profiles[0].id);
    }
    const response = NextResponse.json({ success: true, message: 'Logged out successfully' });
    response.cookies.set('medconnect_logged_in', '', {
      path: '/',
      expires: new Date(0),
      maxAge: 0,
    });
    response.cookies.set('medconnect_session_user_id', '', {
      path: '/',
      expires: new Date(0),
      maxAge: 0,
    });
    return response;
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Logout failed' }, { status: 500 });
  }
}
