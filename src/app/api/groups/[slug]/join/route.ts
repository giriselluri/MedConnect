import { NextRequest, NextResponse } from 'next/server';
import { serverDb } from '@/lib/server-db';

export async function POST(req: NextRequest, { params }: { params: { slug: string } }) {
  try {
    const currentUser = serverDb.getCurrentUser();
    const group = serverDb.getGroupBySlug(params.slug, currentUser.id);
    if (!group) {
      return NextResponse.json({ error: 'Group not found' }, { status: 404 });
    }

    const result = serverDb.toggleJoinGroup(group.id, currentUser.id);
    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to toggle group membership' }, { status: 500 });
  }
}
