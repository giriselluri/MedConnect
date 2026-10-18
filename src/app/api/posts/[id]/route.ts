import { NextRequest, NextResponse } from 'next/server';
import { serverDb } from '@/lib/server-db';

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const currentUser = serverDb.getCurrentUser();
    const success = serverDb.deletePost(params.id, currentUser.id, currentUser.is_admin);
    if (!success) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to delete post' }, { status: 403 });
  }
}
