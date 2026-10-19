import { NextRequest, NextResponse } from 'next/server';
import { serverDb } from '@/lib/server-db';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const currentUser = serverDb.getCurrentUser();
    const is_following = serverDb.isFollowing(currentUser.id, params.id);
    const stats = serverDb.getFollowStats(params.id);

    return NextResponse.json({
      is_following,
      followers_count: stats.followersCount,
      following_count: stats.followingCount,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to check follow status' }, { status: 500 });
  }
}

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const currentUser = serverDb.getCurrentUser();
    if (currentUser.id === params.id) {
      return NextResponse.json({ error: 'You cannot follow yourself' }, { status: 400 });
    }

    let action: 'follow' | 'unfollow' | 'toggle' = 'toggle';
    try {
      const body = await req.json();
      if (body.action) action = body.action;
    } catch {
      // Body is optional, default to toggle
    }

    const currentlyFollowing = serverDb.isFollowing(currentUser.id, params.id);
    let is_following: boolean;

    if (action === 'follow' || (action === 'toggle' && !currentlyFollowing)) {
      serverDb.followUser(currentUser.id, params.id);
      is_following = true;
    } else {
      serverDb.unfollowUser(currentUser.id, params.id);
      is_following = false;
    }

    const stats = serverDb.getFollowStats(params.id);
    return NextResponse.json({
      is_following,
      followers_count: stats.followersCount,
      following_count: stats.followingCount,
      message: is_following ? 'Followed successfully' : 'Unfollowed successfully',
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to update follow status' }, { status: 500 });
  }
}
