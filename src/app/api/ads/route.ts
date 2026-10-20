import { NextRequest, NextResponse } from 'next/server';
import { serverDb } from '@/lib/server-db';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const specialty_id = searchParams.get('specialty_id') || undefined;
    const is_active_param = searchParams.get('is_active');
    const search = searchParams.get('search') || undefined;

    const is_active = is_active_param !== null ? is_active_param === 'true' : undefined;

    const ads = await serverDb.getAdvertisements({ specialty_id, is_active, search });
    return NextResponse.json({ ads });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to fetch advertisements' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const sponsor = body.sponsor || body.advertiser_name;
    const target_url = body.target_url || body.destination_url || 'https://medconnect.local';

    if (!body.title || body.title.trim().length === 0) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 });
    }
    if (!sponsor || sponsor.trim().length === 0) {
      return NextResponse.json({ error: 'Sponsor name is required' }, { status: 400 });
    }
    if (!body.headline || body.headline.trim().length === 0) {
      return NextResponse.json({ error: 'Headline is required' }, { status: 400 });
    }

    const ad = await serverDb.createAdvertisement({
      ...body,
      sponsor,
      target_url,
    });
    return NextResponse.json({ ad, message: 'Advertisement created successfully' }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to create advertisement' }, { status: 500 });
  }
}
