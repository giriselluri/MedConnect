import { NextRequest, NextResponse } from 'next/server';
import { serverDb } from '@/lib/server-db';
import { generateResearchSummary } from '@/lib/gemini';

export async function GET() {
  try {
    const currentUser = serverDb.getCurrentUser();
    const sessions = serverDb.getAISessions(currentUser.id);
    return NextResponse.json({ sessions });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to fetch AI sessions' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const currentUser = serverDb.getCurrentUser();
    const body = await req.json();

    const { text, title, source_url } = body;

    if (!text || text.trim().length < 30) {
      return NextResponse.json(
        { error: 'Please provide a scientific abstract or research text of at least 30 characters.' },
        { status: 400 }
      );
    }

    // Patient privacy / PHI safety check
    const phiRegex = /\b(ssn|\d{3}-\d{2}-\d{4}|mrn:\s*\d+|dob:\s*\d{2}\/\d{2}\/\d{4})\b/i;
    if (phiRegex.test(text)) {
      return NextResponse.json(
        { error: 'Potential Protected Health Information (PHI) detected. Please do not submit patient-identifiable data.' },
        { status: 400 }
      );
    }

    const structuredSummary = await generateResearchSummary(text, title);

    const session = serverDb.saveAISession({
      user_id: currentUser.id,
      title: title || 'Research Synthesis Session',
      source_text: text,
      source_url: source_url || undefined,
      structured_summary: structuredSummary,
    });

    return NextResponse.json({
      session,
      summary: structuredSummary,
    });
  } catch (error: any) {
    console.error('AI Research API error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to generate research synthesis' },
      { status: 500 }
    );
  }
}
