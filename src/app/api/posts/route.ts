import { NextRequest, NextResponse } from 'next/server';
import { serverDb } from '@/lib/server-db';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const groupId = searchParams.get('groupId') || undefined;
    const currentUser = await serverDb.getCurrentUser();
    const posts = await serverDb.getPosts(currentUser.id, groupId);
    return NextResponse.json({ posts });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to fetch posts' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const currentUser = await serverDb.getCurrentUser();
    const body = await req.json();

    if (!body.content || body.content.trim().length === 0) {
      return NextResponse.json({ error: 'Post content cannot be empty' }, { status: 400 });
    }

    const post = await serverDb.createPost({
      content: body.content,
      author_id: currentUser.id,
      specialty_id: body.specialty_id,
      topic_tags: body.topic_tags,
      article_url: body.article_url,
      article_title: body.article_title,
      article_source: body.article_source,
      group_id: body.group_id,
      visibility: body.visibility,
    });

    return NextResponse.json({ post }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to create post' }, { status: 500 });
  }
}
