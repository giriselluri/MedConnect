import { NextRequest, NextResponse } from 'next/server';
import { serverDb } from '@/lib/server-db';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const specialtyParam = searchParams.get('specialty');
    const search = searchParams.get('search') || undefined;
    const includeDrafts = searchParams.get('includeDrafts') === 'true';
    const personalized = searchParams.get('personalized') === 'true';

    const currentUser = await serverDb.getCurrentUser();
    const isAdmin = Boolean(currentUser.is_admin || currentUser.role === 'admin');

    const specialtyIds = specialtyParam
      ? specialtyParam.split(',').map((s) => s.trim()).filter(Boolean)
      : undefined;

    // Public users see ONLY published case studies
    const caseStudies = await serverDb.getCaseStudies({
      specialtyIds,
      search,
      includeDraftsAndArchived: includeDrafts && isAdmin,
      currentUserId: currentUser.id,
      isAdmin,
      personalized,
    });

    return NextResponse.json({ caseStudies });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to fetch case studies' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const currentUser = await serverDb.getCurrentUser();
    if (!currentUser) {
      return NextResponse.json(
        { error: 'Unauthorized: Please sign in to create a case study' },
        { status: 401 }
      );
    }
    const isAdmin = Boolean(currentUser.is_admin || currentUser.role === 'admin');

    const body = await req.json();

    const short_summary =
      body.short_summary?.trim() ||
      body.question_for_specialists?.trim() ||
      body.clinical_background?.trim()?.slice(0, 160) ||
      '';

    const educational_content =
      body.educational_content?.trim() ||
      [
        body.clinical_background && `### Clinical Background & Presentation\n${body.clinical_background.trim()}`,
        body.clinical_findings && `### Diagnostic & Clinical Findings\n${body.clinical_findings.trim()}`,
        body.question_for_specialists && `### Specific Question for Specialists\n${body.question_for_specialists.trim()}`,
      ]
        .filter(Boolean)
        .join('\n\n');

    if (!body.title || !short_summary || !educational_content) {
      return NextResponse.json(
        { error: 'Title, clinical background, findings, and question for specialists (or educational content) are required.' },
        { status: 400 }
      );
    }

    if (!body.specialty_ids || body.specialty_ids.length === 0) {
      return NextResponse.json(
        { error: 'At least one clinical specialty tag must be assigned' },
        { status: 400 }
      );
    }

    const caseStudy = await serverDb.createCaseStudy(
      {
        title: body.title.trim(),
        short_summary,
        educational_content,
        clinical_background: body.clinical_background?.trim(),
        clinical_findings: body.clinical_findings?.trim(),
        question_for_specialists: body.question_for_specialists?.trim(),
        learning_objectives: Array.isArray(body.learning_objectives)
          ? body.learning_objectives
          : [body.learning_objectives || 'Demonstrate evidence-based clinical reasoning'],
        source_references: Array.isArray(body.source_references)
          ? body.source_references
          : body.source_references ? [body.source_references] : [],
        specialty_ids: body.specialty_ids,
        status: body.status || 'published',
        author_id: currentUser.id,
        is_private: Boolean(body.is_private),
        shared_with_user_ids: Array.isArray(body.shared_with_user_ids) ? body.shared_with_user_ids : [],
        visibility: body.visibility || 'everyone',
        group_id: body.group_id,
        password_protected: Boolean(body.password_protected),
        access_password: body.access_password,
      },
      currentUser.id,
      isAdmin
    );

    return NextResponse.json({ caseStudy }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to create case study' }, { status: 500 });
  }
}
