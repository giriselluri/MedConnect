import { NextRequest, NextResponse } from 'next/server';
import { serverDb } from '@/lib/server-db';
import { generateCaseAssistantDraft } from '@/lib/gemini';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const currentUser = await serverDb.getCurrentUser();
    if (!currentUser) {
      return NextResponse.json(
        { error: 'Unauthorized: Please sign in to use the AI Case Assistant' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const notes = (body.roughNotes || body.notes)?.trim();

    if (!notes || notes.length < 20) {
      return NextResponse.json(
        { error: 'Please enter rough clinical notes of at least 20 characters to draft a case study.' },
        { status: 400 }
      );
    }

    const draft = await generateCaseAssistantDraft(notes);
    return NextResponse.json({ success: true, draft });
  } catch (error: any) {
    console.error('AI Case Assistant Error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to generate case draft from notes' },
      { status: 500 }
    );
  }
}
