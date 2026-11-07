import { NextRequest, NextResponse } from 'next/server';
import { serverDb } from '@/lib/server-db';
import { summarizeCaseDiscussion } from '@/lib/gemini';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const currentUser = await serverDb.getCurrentUser();
    if (!currentUser) {
      return NextResponse.json(
        { error: 'Unauthorized: Please sign in to summarize discussion' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const caseId = body.caseId || body.case_id || body.caseStudyId || body.case_study_id;

    if (!caseId) {
      return NextResponse.json(
        { error: 'Case ID is required to summarize discussion' },
        { status: 400 }
      );
    }

    const isAdmin = Boolean(currentUser.is_admin || currentUser.role === 'admin');
    const caseStudy = await serverDb.getCaseStudyById(caseId, isAdmin, undefined, false, currentUser.id);

    if (!caseStudy) {
      return NextResponse.json(
        { error: 'Case study not found or unauthorized' },
        { status: 404 }
      );
    }

    const responses = await serverDb.getCaseStudyResponses(caseId);

    const summary = await summarizeCaseDiscussion(
      caseStudy.title,
      caseStudy.question_for_specialists || caseStudy.short_summary,
      responses
    );

    return NextResponse.json({ success: true, summary });
  } catch (error: any) {
    console.error('Discussion Summary Error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to summarize case discussion' },
      { status: 500 }
    );
  }
}
