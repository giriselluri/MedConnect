import { NextRequest, NextResponse } from 'next/server';
import { serverDb } from '@/lib/server-db';

export async function GET() {
  try {
    const currentUser = await serverDb.getCurrentUser();
    const bookmarks = await serverDb.getBookmarks(currentUser.id);
    return NextResponse.json({ bookmarks });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to fetch bookmarks' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const currentUser = await serverDb.getCurrentUser();
    const body = await req.json();

    if (!body.item_type || !body.item_id) {
      return NextResponse.json({ error: 'item_type and item_id are required' }, { status: 400 });
    }

    const result = await serverDb.toggleBookmark({
      user_id: currentUser.id,
      item_type: body.item_type,
      item_id: body.item_id,
      item_title: body.item_title,
      item_summary: body.item_summary,
      item_url: body.item_url,
    });

    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to toggle bookmark' }, { status: 500 });
  }
}
