import { NextRequest, NextResponse } from 'next/server';
import { serverDb } from '@/lib/server-db';
import { generateSpecialistRecommendations } from '@/lib/gemini';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const currentUser = await serverDb.getCurrentUser();
    if (!currentUser) {
      return NextResponse.json(
        { error: 'Unauthorized: Please sign in to match specialists' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const caseId = body.caseId || body.case_id || body.caseStudyId || body.case_study_id;

    let targetCase: {
      id?: string;
      title: string;
      clinical_background?: string;
      clinical_findings?: string;
      question_for_specialists?: string;
      short_summary?: string;
      educational_content?: string;
      specialties: any[];
      author_id?: string;
    };

    if (caseId) {
      const isAdmin = Boolean(currentUser.is_admin || currentUser.role === 'admin');
      const foundCase = await serverDb.getCaseStudyById(caseId, isAdmin, undefined, false, currentUser.id);
      if (!foundCase) {
        return NextResponse.json(
          { error: 'Case study not found or unauthorized' },
          { status: 404 }
        );
      }
      targetCase = foundCase;
    } else if (body.title && body.specialties) {
      targetCase = {
        title: body.title,
        clinical_background: body.clinical_background || body.clinicalBackground,
        clinical_findings: body.clinical_findings || body.clinicalFindings,
        question_for_specialists: body.question_for_specialists || body.questionForSpecialists,
        short_summary: body.short_summary || body.shortSummary,
        educational_content: body.educational_content || body.educationalContent,
        specialties: Array.isArray(body.specialties) ? body.specialties : [],
        author_id: currentUser.id,
      };
    } else {
      return NextResponse.json(
        { error: 'Either caseId or case details (title & specialties) are required' },
        { status: 400 }
      );
    }

    // Fetch candidate profiles, excluding the case author
    const allProfiles = await serverDb.getProfiles({});
    const authorId = targetCase.author_id || currentUser.id;
    const candidateProfiles = allProfiles.filter((p) => p.id !== authorId);

    const result = await generateSpecialistRecommendations(targetCase, candidateProfiles);

    return NextResponse.json({
      success: true,
      case_id: targetCase.id,
      case_title: targetCase.title,
      total_candidates_evaluated: result.total_candidates_evaluated,
      recommendations: result.recommendations,
      disclaimer: result.disclaimer,
      model_used: result.model_used,
    });
  } catch (error: any) {
    console.error('Specialist Matching Error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to match specialists' },
      { status: 500 }
    );
  }
}
