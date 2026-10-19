import { NextRequest, NextResponse } from 'next/server';
import { serverDb } from '@/lib/server-db';

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const currentUser = serverDb.getCurrentUser();
    const { content } = await req.json();

    if (!content || content.trim().length === 0) {
      return NextResponse.json({ error: 'Comment content cannot be empty' }, { status: 400 });
    }

    const comment = serverDb.addComment(params.id, currentUser.id, content.trim());
    return NextResponse.json({ comment }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to add comment' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const currentUser = serverDb.getCurrentUser();
    const { comment_id, content } = await req.json();

    if (!comment_id) {
      return NextResponse.json({ error: 'Comment ID is required' }, { status: 400 });
    }
    if (!content || content.trim().length === 0) {
      return NextResponse.json({ error: 'Comment content cannot be empty' }, { status: 400 });
    }

    const updated = serverDb.updateComment(comment_id, content.trim(), currentUser.id, !!currentUser.is_admin);
    return NextResponse.json({ comment: updated });
  } catch (error: any) {
    const status = error.message.includes('Unauthorized') ? 403 : 500;
    return NextResponse.json({ error: error.message || 'Failed to edit comment' }, { status });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const currentUser = serverDb.getCurrentUser();
    const { searchParams } = new URL(req.url);
    let comment_id = searchParams.get('comment_id');

    if (!comment_id) {
      try {
        const body = await req.json();
        comment_id = body.comment_id;
      } catch {
        // ignore JSON parse error if passed via query
      }
    }

    if (!comment_id) {
      return NextResponse.json({ error: 'Comment ID is required' }, { status: 400 });
    }

    const success = serverDb.deleteComment(comment_id, currentUser.id, !!currentUser.is_admin);
    if (!success) {
      return NextResponse.json({ error: 'Comment not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'Comment deleted successfully' });
  } catch (error: any) {
    const status = error.message.includes('Unauthorized') ? 403 : 500;
    return NextResponse.json({ error: error.message || 'Failed to delete comment' }, { status });
  }
}
