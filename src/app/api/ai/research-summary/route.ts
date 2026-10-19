import { NextRequest, NextResponse } from 'next/server';
import { serverDb } from '@/lib/server-db';
import { generateResearchSummary } from '@/lib/gemini';

// In-memory sliding-window rate limiter suitable for Node.js / edge container runtime
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 15; // 15 requests/min
const requestTracker = new Map<string, number[]>();

function checkRateLimit(key: string): { allowed: boolean; remaining: number; resetInSec: number } {
  const now = Date.now();
  const timestamps = (requestTracker.get(key) || []).filter((t) => now - t < RATE_LIMIT_WINDOW_MS);

  if (timestamps.length >= MAX_REQUESTS_PER_WINDOW) {
    const oldest = timestamps[0];
    const resetInSec = Math.ceil((oldest + RATE_LIMIT_WINDOW_MS - now) / 1000);
    return { allowed: false, remaining: 0, resetInSec: Math.max(1, resetInSec) };
  }

  timestamps.push(now);
  requestTracker.set(key, timestamps);
  return {
    allowed: true,
    remaining: MAX_REQUESTS_PER_WINDOW - timestamps.length,
    resetInSec: Math.ceil(RATE_LIMIT_WINDOW_MS / 1000),
  };
}

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

    // Client identifier for rate limiting: IP address or User ID
    const clientIp = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || req.headers.get('x-real-ip') || currentUser.id;
    const rateLimit = checkRateLimit(clientIp);

    if (!rateLimit.allowed) {
      return NextResponse.json(
        {
          error: `Rate limit exceeded. Maximum ${MAX_REQUESTS_PER_WINDOW} AI syntheses per minute. Please retry in ${rateLimit.resetInSec} seconds.`,
        },
        {
          status: 429,
          headers: {
            'Retry-After': String(rateLimit.resetInSec),
            'X-RateLimit-Limit': String(MAX_REQUESTS_PER_WINDOW),
            'X-RateLimit-Remaining': '0',
          },
        }
      );
    }

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

    return NextResponse.json(
      {
        session,
        summary: structuredSummary,
      },
      {
        headers: {
          'X-RateLimit-Limit': String(MAX_REQUESTS_PER_WINDOW),
          'X-RateLimit-Remaining': String(rateLimit.remaining),
        },
      }
    );
  } catch (error: any) {
    console.error('AI Research API error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to generate research synthesis' },
      { status: 500 }
    );
  }
}
