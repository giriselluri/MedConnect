import { NextRequest, NextResponse } from 'next/server';
import { serverDb } from '@/lib/server-db';

export async function GET(req: NextRequest, { params }: { params: { slug: string } }) {
  try {
    const currentUser = serverDb.getCurrentUser();
    const group = serverDb.getGroupBySlug(params.slug, currentUser.id);
    if (!group) {
      return NextResponse.json({ error: 'Group not found' }, { status: 404 });
    }
    const posts = serverDb.getPosts(currentUser.id, group.id);
    return NextResponse.json({ group, posts });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to fetch group' }, { status: 500 });
  }
}
