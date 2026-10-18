import { NextResponse } from 'next/server';
import { serverDb } from '@/lib/server-db';

export async function GET() {
  try {
    const specialties = serverDb.getSpecialties();
    return NextResponse.json({ specialties });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to fetch specialties' }, { status: 500 });
  }
}
