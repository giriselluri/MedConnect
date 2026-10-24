import { NextRequest, NextResponse } from 'next/server';
import { serverDb } from '@/lib/server-db';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { searchParams } = new URL(req.url);
    const password = searchParams.get('password') || undefined;
    const bypass = searchParams.get('bypass') === 'true';
    const currentUser = await serverDb.getCurrentUser();
    const isAdmin = Boolean(currentUser.is_admin || currentUser.role === 'admin');
    const caseStudy = await serverDb.getCaseStudyById(params.id, isAdmin, password, bypass, currentUser?.id);

    if (!caseStudy) {
      return NextResponse.json({ error: 'Case study not found or not published' }, { status: 404 });
    }

    return NextResponse.json({ caseStudy });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to fetch case study' }, { status: 500 });
  }
}

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const currentUser = await serverDb.getCurrentUser();
    const isAdmin = Boolean(currentUser?.is_admin || currentUser?.role === 'admin');
    const body = await req.json();
    const password = body.password || '';
    const result = await serverDb.verifyCaseStudyPassword(params.id, password, currentUser?.id, isAdmin);

    if (!result.valid) {
      return NextResponse.json({ error: result.error || 'Incorrect access password' }, { status: 401 });
    }

    return NextResponse.json({ success: true, caseStudy: result.caseStudy });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to verify case study password' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const currentUser = await serverDb.getCurrentUser();
    const isAdmin = Boolean(currentUser.is_admin || currentUser.role === 'admin');

    if (!isAdmin) {
      return NextResponse.json(
        { error: 'Forbidden: Only administrators can update case studies' },
        { status: 403 }
      );
    }

    const updates = await req.json();
    const updated = await serverDb.updateCaseStudy(params.id, updates, currentUser.id, isAdmin);
    return NextResponse.json({ caseStudy: updated });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to update case study' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const currentUser = await serverDb.getCurrentUser();
    const isAdmin = Boolean(currentUser.is_admin || currentUser.role === 'admin');

    if (!isAdmin) {
      return NextResponse.json(
        { error: 'Forbidden: Only administrators can delete case studies' },
        { status: 403 }
      );
    }

    const success = await serverDb.deleteCaseStudy(params.id, currentUser.id, isAdmin);
    if (!success) {
      return NextResponse.json({ error: 'Case study not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to delete case study' }, { status: 500 });
  }
}
