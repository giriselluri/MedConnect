import { track } from '@vercel/analytics';

export type AnalyticsEventName =
  | 'signup_started'
  | 'signup_completed'
  | 'profile_completed'
  | 'post_created'
  | 'connection_requested'
  | 'ai_research_assistant_used';

export type AnalyticsPropertyValue = string | number | boolean | null;

/**
 * Disallowed property keys to strictly enforce HIPAA, GDPR, and medical credential privacy.
 * Passwords, emails, raw patient content, clinical notes, and tokens are NEVER tracked.
 */
const SENSITIVE_KEY_PATTERNS = [
  'password',
  'token',
  'secret',
  'credential',
  'auth',
  'email',
  'phi',
  'patient',
  'text',
  'content',
  'bio',
];

/**
 * High-level wrapper around Vercel Web Analytics custom event tracking.
 * - Safely checks for browser runtime.
 * - Excludes demo/testing accounts to avoid polluting production analytics.
 * - Enforces zero-sensitive-data scrubbing.
 * - Gracefully catches any transmission errors without impacting UI execution.
 */
export function trackAppEvent(
  name: AnalyticsEventName,
  properties?: Record<string, AnalyticsPropertyValue | undefined>,
  isDemo?: boolean
): void {
  if (typeof window === 'undefined') {
    return;
  }

  // Exclude demo personas & automated test environments where feasible
  const isLocalStorageTest =
    window.localStorage.getItem('medconnect_e2e_test') === 'true';
  const isAutomatedAgent =
    typeof navigator !== 'undefined' &&
    (navigator.userAgent.includes('Headless') || navigator.userAgent.includes('AutomatedTest'));

  if (isDemo || isLocalStorageTest || isAutomatedAgent) {
    if (process.env.NODE_ENV !== 'production') {
      // In dev mode, log excluded activity for local verification
      console.debug(`[Vercel Analytics (Excluded Demo/Test)] ${name}:`, properties);
    }
    return;
  }

  // Sanitize properties to prevent sensitive leakage
  const cleanProperties: Record<string, AnalyticsPropertyValue> = {};

  if (properties) {
    for (const [key, value] of Object.entries(properties)) {
      if (value === undefined) continue;

      const lowerKey = key.toLowerCase();
      const isSensitive = SENSITIVE_KEY_PATTERNS.some((pattern) =>
        lowerKey.includes(pattern)
      );

      if (isSensitive) {
        if (process.env.NODE_ENV !== 'production') {
          console.warn(`[Vercel Analytics] Blocked sensitive property key: "${key}"`);
        }
        continue;
      }

      cleanProperties[key] = value;
    }
  }

  try {
    track(name, cleanProperties);

    if (process.env.NODE_ENV !== 'production') {
      console.log(`[Vercel Analytics (Dispatched)] ${name}:`, cleanProperties);
    }
  } catch (err) {
    // Fail silently in production so analytics never disrupts clinician workflow
    if (process.env.NODE_ENV !== 'production') {
      console.warn('[Vercel Analytics] Track failed:', err);
    }
  }
}
