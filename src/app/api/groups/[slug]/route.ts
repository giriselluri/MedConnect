import { NextRequest, NextResponse } from 'next/server';
import { serverDb } from '@/lib/server-db';

export async function GET(req: NextRequest, { params }: { params: { slug: string } }) {
  try {
    const currentUser = await serverDb.getCurrentUser();
    const group = await serverDb.getGroupBySlug(params.slug, currentUser.id);
    if (!group) {
      return NextResponse.json({ error: 'Group not found' }, { status: 404 });
    }
    const posts = await serverDb.getPosts(currentUser.id, group.id);
    return NextResponse.json({ group, posts });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to fetch group' }, { status: 500 });
  }
}
