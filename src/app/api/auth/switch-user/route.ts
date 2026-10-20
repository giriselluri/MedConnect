import { NextRequest, NextResponse } from 'next/server';
import { serverDb } from '@/lib/server-db';

export async function POST(req: NextRequest) {
  try {
    const { userId } = await req.json();
    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }
    const updatedUser = await serverDb.switchUser(userId);
    if (!updatedUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    const response = NextResponse.json({ user: updatedUser });
    response.cookies.set('medconnect_session_user_id', updatedUser.id, {
      path: '/',
      httpOnly: true,
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30,
    });
    return response;
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to switch user' }, { status: 500 });
  }
}
