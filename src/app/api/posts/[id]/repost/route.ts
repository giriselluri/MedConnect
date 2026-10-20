import { NextRequest, NextResponse } from 'next/server';
import { serverDb } from '@/lib/server-db';

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const currentUser = await serverDb.getCurrentUser();
    let quoteComment: string | undefined = undefined;
    try {
      const body = await req.json();
      quoteComment = body.quote_comment;
    } catch {
      // Body may be empty if simple repost without quote
    }

    const post = await serverDb.repostPost(params.id, currentUser.id, quoteComment);
    return NextResponse.json({ post, message: 'Post reposted successfully' }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to repost' }, { status: 500 });
  }
}
