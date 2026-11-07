import { NextRequest, NextResponse } from 'next/server';
import { serverDb } from '@/lib/server-db';
import { generatePubMedResearchSynthesis } from '@/lib/gemini';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const currentUser = await serverDb.getCurrentUser();
    if (!currentUser) {
      return NextResponse.json(
        { error: 'Unauthorized: Please sign in to search research' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const query = body.query?.trim();

    if (!query || query.length < 5) {
      return NextResponse.json(
        { error: 'Please enter a clinical research question or medical topic of at least 5 characters.' },
        { status: 400 }
      );
    }

    const result = await generatePubMedResearchSynthesis(query);
    return NextResponse.json({
      success: true,
      result,
      articles: result.articles,
      ai_synthesis: result.ai_synthesis,
      synthesis: result.ai_synthesis?.overview || result.synthesis,
      total_found: result.total_found,
      disclaimer: result.disclaimer,
    });
  } catch (error: any) {
    console.error('PubMed AI Research Error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to search PubMed research' },
      { status: 500 }
    );
  }
}
