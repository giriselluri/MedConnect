import { NextRequest, NextResponse } from 'next/server';
import { serverDb } from '@/lib/server-db';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const currentUser = serverDb.getCurrentUser();
    const isAdmin = Boolean(currentUser.is_admin || currentUser.role === 'admin');
    const caseStudy = serverDb.getCaseStudyById(params.id, isAdmin);

    if (!caseStudy) {
      return NextResponse.json({ error: 'Case study not found or not published' }, { status: 404 });
    }

    return NextResponse.json({ caseStudy });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to fetch case study' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const currentUser = serverDb.getCurrentUser();
    const isAdmin = Boolean(currentUser.is_admin || currentUser.role === 'admin');

    if (!isAdmin) {
      return NextResponse.json(
        { error: 'Forbidden: Only administrators can update case studies' },
        { status: 403 }
      );
    }

    const updates = await req.json();
    const updated = serverDb.updateCaseStudy(params.id, updates, currentUser.id, isAdmin);
    return NextResponse.json({ caseStudy: updated });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to update case study' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const currentUser = serverDb.getCurrentUser();
    const isAdmin = Boolean(currentUser.is_admin || currentUser.role === 'admin');

    if (!isAdmin) {
      return NextResponse.json(
        { error: 'Forbidden: Only administrators can delete case studies' },
        { status: 403 }
      );
    }

    const success = serverDb.deleteCaseStudy(params.id, currentUser.id, isAdmin);
    if (!success) {
      return NextResponse.json({ error: 'Case study not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to delete case study' }, { status: 500 });
  }
}
