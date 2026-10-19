import { NextRequest, NextResponse } from 'next/server';
import { serverDb } from '@/lib/server-db';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, userId, identifier } = body;

    const target = userId || email || identifier;

    if (!target) {
      return NextResponse.json(
        { error: 'Email, username, or persona ID is required to sign in' },
        { status: 400 }
      );
    }

    const user = serverDb.loginUser(target);

    if (!user) {
      return NextResponse.json(
        {
          error:
            'No verified clinical profile found with this email or identifier. Please select a demo persona or create a new account.',
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Signed in as ${user.full_name}`,
      user,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Login failed' },
      { status: 500 }
    );
  }
}
