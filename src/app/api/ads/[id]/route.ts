import { NextRequest, NextResponse } from 'next/server';
import { serverDb } from '@/lib/server-db';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const ad = serverDb.getAdvertisementById(params.id);
    if (!ad) {
      return NextResponse.json({ error: 'Advertisement not found' }, { status: 404 });
    }
    return NextResponse.json({ ad });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to fetch advertisement' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await req.json();
    const updated = serverDb.updateAdvertisement(params.id, body);
    return NextResponse.json({ ad: updated, message: 'Advertisement updated successfully' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to update advertisement' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const success = serverDb.deleteAdvertisement(params.id);
    if (!success) {
      return NextResponse.json({ error: 'Advertisement not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, message: 'Advertisement deleted successfully' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to delete advertisement' }, { status: 500 });
  }
}
