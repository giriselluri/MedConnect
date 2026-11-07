import { NextRequest, NextResponse } from 'next/server';
import { serverDb } from '@/lib/server-db';

export const dynamic = 'force-dynamic';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const responses = await serverDb.getCaseStudyResponses(params.id);
    return NextResponse.json({ responses, total: responses.length });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to fetch case study responses' },
      { status: 500 }
    );
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const currentUser = await serverDb.getCurrentUser();
    if (!currentUser) {
      return NextResponse.json(
        { error: 'Unauthorized: Please sign in to submit a specialist response' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const content = body.content?.trim();

    if (!content || content.length < 5) {
      return NextResponse.json(
        { error: 'Please enter a clinical response of at least 5 characters.' },
        { status: 400 }
      );
    }

    const response = await serverDb.createCaseStudyResponse(
      params.id,
      currentUser.id,
      content
    );

    return NextResponse.json({ success: true, response }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to submit specialist response' },
      { status: 500 }
    );
  }
}
