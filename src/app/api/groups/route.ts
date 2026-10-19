import { NextRequest, NextResponse } from 'next/server';
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

export async function POST(req: NextRequest) {
  try {
    const currentUser = serverDb.getCurrentUser();
    const body = await req.json();

    if (!body.name || body.name.trim().length === 0) {
      return NextResponse.json({ error: 'Community name is required' }, { status: 400 });
    }
    if (!body.description || body.description.trim().length === 0) {
      return NextResponse.json({ error: 'Community description is required' }, { status: 400 });
    }

    const newGroup = serverDb.createGroup(
      {
        name: body.name.trim(),
        description: body.description.trim(),
        specialty_id: body.specialty_id,
        avatar_url: body.avatar_url || body.banner_url,
        is_private: !!body.is_private,
      },
      currentUser.id
    );

    return NextResponse.json({ group: newGroup, message: 'Community created successfully' }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to create community' }, { status: 500 });
  }
}
