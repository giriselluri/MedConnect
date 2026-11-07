'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useApp } from '@/lib/context';
import { CaseStudy, Profile, CaseResponse, DiscussionSummaryResult, SpecialistRecommendation } from '@/types';
import { SpecialtyBadge } from '@/components/specialty-badge';
import { MarkdownRenderer } from '@/components/markdown-renderer';
import { trackAppEvent } from '@/lib/analytics';
import {
  ArrowLeft,
  Calendar,
  User,
  Bookmark,
  Share2,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  BookOpen,
  FileText,
  AlertTriangle,
  Loader2,
  Check,
  Building2,
  Lock,
  LockOpen,
  Eye,
  EyeOff,
  KeyRound,
  ShieldAlert,
  X,
  Send,
  Copy,
  MessageSquare,
  Stethoscope,
  HelpCircle,
  Award,
  ExternalLink,
  ChevronRight,
  UserCheck,
} from 'lucide-react';

export default function CaseStudyDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { toggleBookmark, currentUser, isDemoUser } = useApp();
  const [caseStudy, setCaseStudy] = useState<CaseStudy | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [copied, setCopied] = useState(false);

  // Password unlock state
  const [passwordInput, setPasswordInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isUnlocking, setIsUnlocking] = useState(false);
  const [unlockError, setUnlockError] = useState<string | null>(null);
  const [unlockSuccess, setUnlockSuccess] = useState(false);

  // Specialist Responses & Discussion State
  const [responses, setResponses] = useState<CaseResponse[]>([]);
  const [isLoadingResponses, setIsLoadingResponses] = useState(false);
  const [newResponse, setNewResponse] = useState('');
  const [isSubmittingResponse, setIsSubmittingResponse] = useState(false);
  const [responseError, setResponseError] = useState<string | null>(null);
  const [responseSuccess, setResponseSuccess] = useState<string | null>(null);

  // AI Discussion Summariser State
  const [discussionSummary, setDiscussionSummary] = useState<DiscussionSummaryResult | null>(null);
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [summaryError, setSummaryError] = useState<string | null>(null);

  // AI Specialist Matching State
  const [matchingResult, setMatchingResult] = useState<SpecialistRecommendation[]>([]);
  const [isLoadingMatching, setIsLoadingMatching] = useState(false);
  const [matchingError, setMatchingError] = useState<string | null>(null);
  const [matchingDisclaimer, setMatchingDisclaimer] = useState<string | null>(null);

  const isAdmin = Boolean((currentUser?.is_admin || currentUser?.role === 'admin') && isDemoUser);

  const loadSpecialistMatches = async () => {
    setIsLoadingMatching(true);
    setMatchingError(null);
    try {
      const res = await fetch('/api/ai/specialist-matching', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ caseStudyId: params.id }),
      });
      if (res.ok) {
        const data = await res.json();
        setMatchingResult(data.recommendations || []);
        setMatchingDisclaimer(data.disclaimer || null);
        trackAppEvent(
          'ai_specialist_matching_used',
          {
            case_id: params.id,
            matches_count: (data.recommendations || []).length,
          },
          isDemoUser
        );
      } else {
        const err = await res.json();
        setMatchingError(err.error || 'Failed to match specialists');
      }
    } catch (e: any) {
      setMatchingError(e.message || 'Error running specialist matching');
    } finally {
      setIsLoadingMatching(false);
    }
  };

  const loadResponses = async () => {
    setIsLoadingResponses(true);
    try {
      const res = await fetch(`/api/case-studies/${params.id}/responses`);
      if (res.ok) {
        const data = await res.json();
        setResponses(data.responses || []);
      }
    } catch (e) {
      console.error('Error fetching responses:', e);
    } finally {
      setIsLoadingResponses(false);
    }
  };

  useEffect(() => {
    async function loadCase() {
      setIsLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/case-studies/${params.id}`);
        if (!res.ok) {
          throw new Error('Case study not found or not published');
        }
        const data = await res.json();
        setCaseStudy(data.caseStudy);
        setIsBookmarked(Boolean(data.caseStudy.is_bookmarked));
        if (data.caseStudy.responses) {
          setResponses(data.caseStudy.responses);
        } else {
          loadResponses();
        }
        if (!data.caseStudy.is_locked) {
          loadSpecialistMatches();
        }
      } catch (e: any) {
        setError(e.message || 'Error loading case study');
      } finally {
        setIsLoading(false);
      }
    }
    loadCase();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.id]);

  const handleSubmitResponse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newResponse.trim() || newResponse.trim().length < 15) {
      setResponseError('Please enter a clinical response of at least 15 characters.');
      return;
    }
    setIsSubmittingResponse(true);
    setResponseError(null);
    setResponseSuccess(null);
    try {
      const res = await fetch(`/api/case-studies/${params.id}/responses`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: newResponse.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to submit response');
      }
      setResponses((prev) => [...prev, data.response]);
      setNewResponse('');
      setResponseSuccess('Your specialist response has been submitted! The case author was notified.');
      // Update caseStudy response count locally
      setCaseStudy((prev) => (prev ? { ...prev, responses_count: (prev.responses_count || 0) + 1 } : prev));
      trackAppEvent(
        'case_response_submitted',
        { case_id: params.id },
        isDemoUser
      );
      setTimeout(() => setResponseSuccess(null), 4000);
    } catch (err: any) {
      setResponseError(err.message || 'Error submitting response');
    } finally {
      setIsSubmittingResponse(false);
    }
  };

  const handleSummarizeDiscussion = async () => {
    setIsSummarizing(true);
    setSummaryError(null);
    try {
      const res = await fetch('/api/ai/discussion-summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ caseStudyId: params.id }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to generate discussion summary');
      }
      setDiscussionSummary(data.summary);
      trackAppEvent(
        'ai_discussion_summary_used',
        { case_id: params.id, responses_count: responses.length },
        isDemoUser
      );
    } catch (err: any) {
      setSummaryError(err.message || 'Error summarizing discussion');
    } finally {
      setIsSummarizing(false);
    }
  };

  const handleUnlock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passwordInput.trim()) {
      setUnlockError('Please enter the case study access password');
      return;
    }
    setIsUnlocking(true);
    setUnlockError(null);
    try {
      const res = await fetch(`/api/case-studies/${params.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: passwordInput.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Incorrect access password');
      }
      setCaseStudy(data.caseStudy);
      setUnlockSuccess(true);
      setTimeout(() => setUnlockSuccess(false), 3000);
    } catch (err: any) {
      setUnlockError(err.message || 'Incorrect password. Please try again.');
    } finally {
      setIsUnlocking(false);
    }
  };

  const handleAdminBypass = async () => {
    setIsUnlocking(true);
    setUnlockError(null);
    try {
      const res = await fetch(`/api/case-studies/${params.id}?bypass=true`);
      if (res.ok) {
        const data = await res.json();
        setCaseStudy({ ...data.caseStudy, is_locked: false });
        setUnlockSuccess(true);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsUnlocking(false);
    }
  };

  const handleBookmark = async () => {
    if (!caseStudy) return;
    const next = !isBookmarked;
    setIsBookmarked(next);
    await toggleBookmark('case_study', caseStudy.id, {
      title: caseStudy.title,
      summary: caseStudy.short_summary,
    });
  };

  // Share modal state
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [connections, setConnections] = useState<Profile[]>([]);
  const [isLoadingConnections, setIsLoadingConnections] = useState(false);
  const [sharingWithId, setSharingWithId] = useState<string | null>(null);
  const [shareSuccessMsg, setShareSuccessMsg] = useState<string | null>(null);
  const [shareErrorMsg, setShareErrorMsg] = useState<string | null>(null);

  const isAuthor = Boolean(currentUser?.id && caseStudy?.author_id === currentUser.id);
  const canSharePrivately = isAuthor || isAdmin;

  const handleShareClick = async () => {
    if (canSharePrivately) {
      setIsShareModalOpen(true);
      if (connections.length === 0) {
        setIsLoadingConnections(true);
        try {
          const res = await fetch('/api/connections');
          if (res.ok) {
            const data = await res.json();
            const connectedProfiles: Profile[] = (data.connections || [])
              .map((c: any) => (c.requester_id === currentUser?.id ? c.recipient : c.requester))
              .filter(Boolean);
            setConnections(connectedProfiles);
          }
        } catch (e) {
          console.error(e);
        } finally {
          setIsLoadingConnections(false);
        }
      }
    } else {
      if (typeof window !== 'undefined') {
        navigator.clipboard.writeText(window.location.href);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    }
  };

  const handleShareWithPeer = async (peerId: string) => {
    setSharingWithId(peerId);
    setShareSuccessMsg(null);
    setShareErrorMsg(null);
    try {
      const res = await fetch(`/api/case-studies/${params.id}/share`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ recipient_id: peerId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to share case study');
      setShareSuccessMsg('Case study shared successfully! In-app notification sent.');
      trackAppEvent(
        'case_shared_with_peer',
        { case_id: params.id, recipient_id: peerId },
        isDemoUser
      );
      if (data.caseStudy) {
        setCaseStudy(data.caseStudy);
      }
      setTimeout(() => setShareSuccessMsg(null), 4000);
    } catch (err: any) {
      setShareErrorMsg(err.message || 'Failed to share case study');
    } finally {
      setSharingWithId(null);
    }
  };

  const handleShare = () => {
    handleShareClick();
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <Loader2 className="w-8 h-8 text-teal-600 animate-spin mx-auto mb-2" />
        <p className="text-xs text-slate-500 font-medium">Loading clinical case study...</p>
      </div>
    );
  }

  if (error || !caseStudy) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center space-y-4">
        <div className="p-3 bg-red-50 text-red-700 rounded-2xl border border-red-200 inline-block">
          <AlertTriangle className="w-8 h-8 mx-auto" />
        </div>
        <h2 className="text-xl font-bold text-slate-900">Case Study Unavailable</h2>
        <p className="text-xs text-slate-500 max-w-md mx-auto">
          {error || 'This case study does not exist or has not been published for public review.'}
        </p>
        <Link
          href="/case-studies"
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-teal-700 text-white rounded-xl text-xs font-semibold"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Case Studies</span>
        </Link>
      </div>
    );
  }

  const formattedDate = caseStudy.published_at
    ? new Date(caseStudy.published_at).toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      })
    : 'Draft Preview';

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      {/* Top back navigation */}
      <div className="flex items-center justify-between">
        <Link
          href="/case-studies"
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 hover:text-teal-700 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Case Studies</span>
        </Link>

        <div className="flex items-center gap-2">
          <button
            onClick={handleShare}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-slate-200 hover:bg-slate-50 rounded-lg text-xs font-medium text-slate-700 transition"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-teal-600" /> : <Share2 className="w-3.5 h-3.5" />}
            <span>{copied ? 'Link Copied' : 'Share'}</span>
          </button>
          <button
            onClick={handleBookmark}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition ${
              isBookmarked
                ? 'bg-teal-50 text-teal-800 border border-teal-200'
                : 'border border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
          >
            <Bookmark className={`w-3.5 h-3.5 ${isBookmarked ? 'fill-teal-700 text-teal-700' : ''}`} />
            <span>{isBookmarked ? 'Saved' : 'Save'}</span>
          </button>
        </div>
      </div>

      {/* Main Case Study Article Card */}
      <article className="bg-white rounded-2xl shadow-xs border border-slate-200 p-6 sm:p-8 space-y-6">
        {/* Header Metadata */}
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-3">
            {caseStudy.specialties?.map((s) => (
              <SpecialtyBadge key={s.id} id={s.id} name={s.name} size="md" />
            ))}
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-teal-50 text-teal-800 border border-teal-200">
              <ShieldCheck className="w-3.5 h-3.5 text-teal-600" />
              Educational Clinical Case
            </span>
            {caseStudy.is_private && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-amber-50 text-amber-800 border border-amber-300">
                <Lock className="w-3 h-3 text-amber-600" />
                Private Case (Shared with Connections)
              </span>
            )}
            {caseStudy.password_protected && !caseStudy.is_private && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-amber-50 text-amber-800 border border-amber-300">
                <Lock className="w-3 h-3 text-amber-600" />
                Protected Case
              </span>
            )}
            {caseStudy.visibility === 'group' && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-purple-50 text-purple-800 border border-purple-200">
                Community Case
              </span>
            )}
            {caseStudy.visibility === 'connections' && !caseStudy.is_private && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-blue-50 text-blue-800 border border-blue-200">
                Connections Only
              </span>
            )}
            {caseStudy.status !== 'published' && (
              <span className="px-2 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-amber-100 text-amber-900 border border-amber-300">
                {caseStudy.status}
              </span>
            )}
          </div>

          <h1 className="text-xl sm:text-3xl font-extrabold text-slate-900 tracking-tight leading-snug">
            {caseStudy.title}
          </h1>

          <p className="text-sm sm:text-base text-slate-600 font-normal leading-relaxed mt-3 border-l-4 border-teal-500 pl-3.5 py-0.5 bg-slate-50/70 rounded-r-lg">
            {caseStudy.short_summary}
          </p>

          {/* Highlighted Question for Specialists */}
          {caseStudy.question_for_specialists && (
            <div className="mt-4 p-4 sm:p-5 bg-gradient-to-r from-amber-50 to-orange-50/60 border-2 border-amber-300 rounded-2xl shadow-2xs space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-amber-600 text-white shadow-2xs">
                  <HelpCircle className="w-4 h-4" />
                </span>
                <span className="text-xs font-bold uppercase tracking-wider text-amber-900">
                  Specific Question for Specialists
                </span>
              </div>
              <p className="text-sm font-semibold text-amber-950 sm:pl-7 leading-relaxed">
                "{caseStudy.question_for_specialists}"
              </p>
            </div>
          )}

          {/* Author bar */}
          <div className="flex flex-wrap items-center gap-4 mt-5 pt-4 border-t border-slate-100 text-xs text-slate-500">
            <Link
              href={caseStudy.author_id ? `/profile/${caseStudy.author_id}` : '#'}
              className="flex items-center gap-2 group/author"
            >
              <img
                src={
                  caseStudy.author_avatar_url ||
                  `https://ui-avatars.com/api/?name=${encodeURIComponent(caseStudy.author_name || 'Clinician')}&background=0d9488&color=fff&bold=true`
                }
                alt={caseStudy.author_name}
                className="w-8 h-8 rounded-full object-cover border border-slate-200 group-hover/author:ring-2 group-hover/author:ring-teal-500 transition"
                onError={(e) => {
                  const target = e.currentTarget;
                  target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(caseStudy.author_name || 'Clinician')}&background=0d9488&color=fff&bold=true`;
                }}
              />
              <div>
                <span className="font-bold text-slate-900 group-hover/author:text-teal-700 block transition">
                  {caseStudy.author_name}
                </span>
                <span className="text-[11px] text-slate-500 block">
                  {caseStudy.author_title || 'Clinical Faculty'}
                  {caseStudy.author_institution ? ` • ${caseStudy.author_institution}` : ''}
                </span>
              </div>
            </Link>
            <div className="h-4 w-px bg-slate-200 hidden sm:block" />
            <div className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <span>Published: {formattedDate}</span>
            </div>
            <div className="h-4 w-px bg-slate-200 hidden sm:block" />
            <div>
              <span>Status: <strong className="text-slate-800 capitalize">{caseStudy.status}</strong></span>
            </div>
          </div>
        </div>

        {caseStudy.is_locked ? (
          /* Password Gate UI */
          <div className="bg-slate-50 border-2 border-dashed border-teal-200/90 rounded-2xl p-6 sm:p-10 text-center space-y-5 my-6">
            <div className="w-16 h-16 rounded-2xl bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-700 shadow-sm mx-auto">
              <Lock className="w-8 h-8" />
            </div>

            <div className="max-w-md mx-auto space-y-1.5">
              <span className="inline-flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-wider bg-amber-100 text-amber-900 border border-amber-300 px-2.5 py-0.5 rounded-full">
                <KeyRound className="w-3 h-3 text-amber-700" />
                Protected Clinical Content
              </span>
              <h3 className="text-lg sm:text-xl font-bold text-slate-900">
                Access Password Required
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                This case study has been restricted with password protection. Please enter the clinical access password to view patient findings, diagnostic evaluation, and management pearls.
              </p>
            </div>

            {unlockError && (
              <div className="max-w-md mx-auto p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl font-medium flex items-center justify-center gap-2">
                <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                <span>{unlockError}</span>
              </div>
            )}

            {unlockSuccess && (
              <div className="max-w-md mx-auto p-3 bg-teal-50 border border-teal-200 text-teal-800 text-xs rounded-xl font-semibold flex items-center justify-center gap-2 animate-fade-in">
                <CheckCircle2 className="w-4 h-4 text-teal-600" />
                <span>Case study unlocked successfully!</span>
              </div>
            )}

            <form onSubmit={handleUnlock} className="max-w-md mx-auto space-y-3">
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  placeholder="Enter case study password..."
                  className="w-full pl-4 pr-10 py-2.5 bg-white border border-slate-300 rounded-xl text-xs sm:text-sm focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 text-slate-900"
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="submit"
                  disabled={isUnlocking}
                  className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-teal-700 hover:bg-teal-800 disabled:opacity-50 text-white rounded-xl text-xs sm:text-sm font-bold shadow-xs transition"
                >
                  {isUnlocking ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Verifying...</span>
                    </>
                  ) : (
                    <>
                      <LockOpen className="w-4 h-4" />
                      <span>Unlock Case Study</span>
                    </>
                  )}
                </button>
              </div>

              {isDemoUser && !caseStudy.is_private && (
                <div className="pt-2 text-[11px] text-slate-500 flex items-center justify-center gap-2">
                  <span>💡 Demo passcode:</span>
                  <code className="bg-slate-200 px-1.5 py-0.5 rounded text-slate-800 font-mono font-bold">clinical2024</code>
                </div>
              )}

              {isAdmin && (
                <div className="pt-2 border-t border-slate-200">
                  <button
                    type="button"
                    onClick={handleAdminBypass}
                    className="text-xs text-amber-800 hover:text-amber-950 font-semibold inline-flex items-center gap-1 hover:underline"
                  >
                    <ShieldAlert className="w-3.5 h-3.5 text-amber-600" />
                    <span>Bypass as Administrator (Dr. Sarah Jenkins)</span>
                  </button>
                </div>
              )}
            </form>
          </div>
        ) : (
          <>
            {/* Learning Objectives Callout */}
            {caseStudy.learning_objectives && caseStudy.learning_objectives.length > 0 && (
              <div className="bg-teal-50/80 border border-teal-200 rounded-xl p-4 sm:p-5">
                <h4 className="text-xs font-bold uppercase tracking-wider text-teal-900 flex items-center gap-1.5 mb-2.5">
                  <CheckCircle2 className="w-4 h-4 text-teal-700" />
                  Key Learning Objectives
                </h4>
                <ul className="space-y-1.5 text-xs sm:text-sm text-teal-950">
                  {caseStudy.learning_objectives.map((obj, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="font-bold text-teal-700 mt-0.5">•</span>
                      <span>{obj}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Full Educational Content with Rich Markdown Rendering */}
            <div className="border-t border-slate-100 pt-6">
              <MarkdownRenderer content={caseStudy.educational_content} />
            </div>

            {/* Source References */}
            {caseStudy.source_references && caseStudy.source_references.length > 0 && (
              <div className="border-t border-slate-100 pt-5 space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-slate-400" />
                  Evidence References & Guidelines
                </h4>
                <ol className="list-decimal list-inside space-y-1 text-xs text-slate-600">
                  {caseStudy.source_references.map((ref, idx) => (
                    <li key={idx} className="leading-normal">
                      {ref}
                    </li>
                  ))}
                </ol>
              </div>
            )}

            {/* Action Callout: AI Assistant */}
            <div className="bg-gradient-to-r from-slate-900 via-teal-950 to-slate-900 rounded-xl p-5 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Sparkles className="w-4 h-4 text-teal-300" />
                  <span className="text-xs font-bold uppercase tracking-wider text-teal-300">
                    AI Clinical Synthesis
                  </span>
                </div>
                <h5 className="font-bold text-sm text-white">
                  Synthesize this case with MedConnect AI
                </h5>
                <p className="text-xs text-slate-300 mt-0.5">
                  Generate discussion prompts for hospital rounds or draft a peer reflection post.
                </p>
              </div>
              <Link
                href={`/research-assistant?title=${encodeURIComponent(caseStudy.title)}&text=${encodeURIComponent(
                  caseStudy.short_summary + '\n\n' + caseStudy.educational_content.slice(0, 1500)
                )}`}
                className="flex-shrink-0 inline-flex items-center gap-2 px-4 py-2 bg-teal-600 hover:bg-teal-500 text-white rounded-xl text-xs font-bold shadow transition"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Analyze with AI</span>
              </Link>
            </div>
          </>
        )}

        {/* Disclaimer as required by Section 14 */}
        <div className="border-t border-slate-100 pt-4 text-[11px] text-slate-400 leading-relaxed italic">
          Disclaimer: This educational case study is a synthetic clinical example intended solely for professional peer education and diagnostic reasoning review. It does not contain protected health information (PHI) or identifiable patient details.
        </div>
      </article>

      {/* AI Specialist Matching Section */}
      <section className="bg-white rounded-2xl shadow-xs border border-slate-200 p-6 sm:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-teal-50 text-teal-700 border border-teal-200">
              <Sparkles className="w-5 h-5" />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-extrabold text-slate-900">
                  Recommended Specialists for This Case
                </h3>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-teal-100 text-teal-800">
                  {matchingResult.length} Matches
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Matched based strictly on declared specialty, subspecialty expertise, and verified clinical appointments.
              </p>
            </div>
          </div>

          <button
            type="button"
            disabled={isLoadingMatching}
            onClick={loadSpecialistMatches}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition"
          >
            {isLoadingMatching ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin text-teal-600" />
            ) : (
              <Sparkles className="w-3.5 h-3.5 text-teal-600" />
            )}
            <span>Refresh Matching</span>
          </button>
        </div>

        {matchingError && (
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 font-medium flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 flex-shrink-0" />
            <span>{matchingError}</span>
          </div>
        )}

        {isLoadingMatching ? (
          <div className="py-8 text-center text-xs text-slate-500 flex flex-col items-center justify-center gap-2">
            <Loader2 className="w-6 h-6 animate-spin text-teal-600" />
            <span>Analyzing clinical case parameters against verified specialists...</span>
          </div>
        ) : matchingResult.length === 0 ? (
          <div className="p-6 bg-slate-50 rounded-2xl text-center space-y-2 border border-slate-200">
            <UserCheck className="w-8 h-8 text-slate-400 mx-auto" />
            <p className="text-xs font-semibold text-slate-700">No matching specialists found yet</p>
            <p className="text-[11px] text-slate-500 max-w-md mx-auto">
              Explore the professional network directory or invite colleagues in this clinical discipline.
            </p>
            <Link
              href="/network"
              className="inline-flex items-center gap-1 text-xs font-bold text-teal-700 hover:underline mt-1"
            >
              <span>Browse Full Specialist Directory</span>
              <ChevronRight className="w-3 h-3" />
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {matchingResult.map((rec) => {
              const spec = rec.specialist;
              const isAlreadyShared = caseStudy.shared_with_user_ids?.includes(spec.id);
              const isSharing = sharingWithId === spec.id;

              return (
                <div
                  key={rec.specialist_id}
                  className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 hover:bg-white hover:border-teal-300 transition shadow-2xs space-y-3 flex flex-col justify-between"
                >
                  <div className="space-y-2.5">
                    <div className="flex items-start justify-between gap-2">
                      <Link
                        href={`/profile/${spec.id}`}
                        className="flex items-center gap-2.5 group min-w-0"
                      >
                        <img
                          src={
                            spec.avatar_url ||
                            `https://ui-avatars.com/api/?name=${encodeURIComponent(spec.full_name)}&background=0d9488&color=fff&bold=true`
                          }
                          alt={spec.full_name}
                          className="w-10 h-10 rounded-full object-cover border border-slate-200 group-hover:ring-2 group-hover:ring-teal-500 transition flex-shrink-0"
                        />
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-bold text-slate-900 group-hover:text-teal-700 transition truncate">
                              {spec.full_name}
                            </span>
                            {spec.is_verified && (
                              <span className="p-0.5 rounded-full bg-teal-100 text-teal-800 text-[10px]">
                                <Check className="w-3 h-3 stroke-[3]" />
                              </span>
                            )}
                          </div>
                          <span className="text-[11px] text-slate-500 block truncate">
                            {spec.title || 'Specialist Physician'}
                            {spec.institution ? ` • ${spec.institution}` : ''}
                          </span>
                        </div>
                      </Link>

                      <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 flex-shrink-0">
                        {rec.match_score}% Match
                      </span>
                    </div>

                    {/* Match Reasons Badges */}
                    <div className="flex flex-wrap gap-1.5">
                      {rec.match_reasons.map((reason, idx) => (
                        <span
                          key={idx}
                          className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-teal-50 text-teal-800 border border-teal-200"
                        >
                          {reason}
                        </span>
                      ))}
                    </div>

                    {/* Relevance Explanation */}
                    <div className="p-2.5 bg-white rounded-xl border border-slate-200 text-[11px] text-slate-700 leading-snug">
                      <p className="font-semibold text-slate-900 text-[10px] uppercase tracking-wider mb-0.5 flex items-center gap-1">
                        <Sparkles className="w-3 h-3 text-teal-600" />
                        <span>Why Recommended</span>
                      </p>
                      {rec.relevance_explanation}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                    <Link
                      href={`/profile/${spec.id}`}
                      className="text-[11px] font-semibold text-slate-600 hover:text-slate-900 flex items-center gap-1"
                    >
                      <span>View Profile</span>
                      <ExternalLink className="w-3 h-3" />
                    </Link>

                    {canSharePrivately && (
                      isAlreadyShared ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                          <Check className="w-3 h-3" />
                          <span>Case Shared</span>
                        </span>
                      ) : (
                        <button
                          type="button"
                          disabled={isSharing}
                          onClick={() => handleShareWithPeer(spec.id)}
                          className="inline-flex items-center gap-1 px-3 py-1 bg-teal-700 hover:bg-teal-800 disabled:opacity-50 text-white rounded-lg text-xs font-semibold shadow-xs transition"
                        >
                          {isSharing ? (
                            <Loader2 className="w-3 h-3 animate-spin" />
                          ) : (
                            <Send className="w-3 h-3" />
                          )}
                          <span>Share Case</span>
                        </button>
                      )
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {matchingDisclaimer && (
          <div className="border-t border-slate-100 pt-3 text-[10px] text-slate-400 leading-relaxed italic">
            {matchingDisclaimer}
          </div>
        )}
      </section>

      {/* Specialist Responses & Clinical Discussion Section */}
      <section className="bg-white rounded-2xl shadow-xs border border-slate-200 p-6 sm:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-teal-50 text-teal-700 border border-teal-200">
              <MessageSquare className="w-5 h-5" />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-extrabold text-slate-900">
                  Specialist Responses & Consultation
                </h3>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-teal-100 text-teal-800">
                  {responses.length}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Professional input from verified specialists and medical colleagues.
              </p>
            </div>
          </div>

          {/* AI Discussion Summariser Button */}
          {responses.length >= 1 && (
            <button
              type="button"
              disabled={isSummarizing}
              onClick={handleSummarizeDiscussion}
              className="inline-flex items-center gap-2 px-3.5 py-2 bg-gradient-to-r from-teal-700 to-slate-900 hover:from-teal-800 hover:to-slate-950 text-white rounded-xl text-xs font-bold shadow-xs transition disabled:opacity-50"
            >
              {isSummarizing ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Summarising Discussion...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5 text-teal-300" />
                  <span>AI Discussion Summary</span>
                </>
              )}
            </button>
          )}
        </div>

        {summaryError && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 font-medium flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 flex-shrink-0" />
            <span>{summaryError}</span>
          </div>
        )}

        {/* AI Discussion Summary Box */}
        {discussionSummary && (
          <div className="p-5 bg-gradient-to-br from-teal-50/90 via-cyan-50/50 to-slate-50 rounded-2xl border-2 border-teal-200/90 space-y-4 shadow-2xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-teal-700" />
                <h4 className="text-xs font-bold uppercase tracking-wider text-teal-900">
                  AI Specialist Discussion Synthesis
                </h4>
              </div>
              <span className="text-[10px] text-teal-700 bg-teal-100 px-2 py-0.5 rounded-md font-semibold">
                Synthesized across {responses.length} responses
              </span>
            </div>

            <p className="text-xs sm:text-sm text-slate-800 leading-relaxed font-medium">
              {discussionSummary.executive_summary || discussionSummary.overview}
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
              {((discussionSummary.clinical_consensus || discussionSummary.consensus_points)?.length ?? 0) > 0 && (
                <div className="p-3.5 bg-white/90 rounded-xl border border-teal-200 space-y-1.5">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-teal-800 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-teal-600" />
                    Key Specialist Consensus
                  </span>
                  <ul className="space-y-1 text-xs text-slate-700">
                    {(discussionSummary.clinical_consensus || discussionSummary.consensus_points || []).map((c: string, idx: number) => (
                      <li key={idx} className="flex items-start gap-1.5">
                        <span className="text-teal-600 font-bold">•</span>
                        <span>{c}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {discussionSummary.differing_perspectives?.length > 0 && (
                <div className="p-3.5 bg-white/90 rounded-xl border border-amber-200 space-y-1.5">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-amber-900 flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                    Differing Perspectives & Nuances
                  </span>
                  <ul className="space-y-1 text-xs text-slate-700">
                    {discussionSummary.differing_perspectives.map((p, idx) => (
                      <li key={idx} className="flex items-start gap-1.5">
                        <span className="text-amber-600 font-bold">•</span>
                        <span>{p}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {discussionSummary.unanswered_questions?.length > 0 && (
              <div className="p-3.5 bg-white/90 rounded-xl border border-slate-200 space-y-1.5">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                  <HelpCircle className="w-3.5 h-3.5 text-slate-500" />
                  Remaining / Unanswered Questions
                </span>
                <ul className="space-y-1 text-xs text-slate-700">
                  {discussionSummary.unanswered_questions.map((q, idx) => (
                    <li key={idx} className="flex items-start gap-1.5">
                      <span className="text-slate-500 font-bold">•</span>
                      <span>{q}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="text-[10px] text-slate-500 italic pt-1 border-t border-teal-200/50">
              Disclaimer: {discussionSummary.disclaimer}
            </div>
          </div>
        )}

        {/* Responses List */}
        {responses.length === 0 ? (
          <div className="py-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200 space-y-2">
            <Stethoscope className="w-8 h-8 text-slate-400 mx-auto" />
            <h4 className="text-xs font-bold text-slate-800">No specialist responses yet</h4>
            <p className="text-[11px] text-slate-500 max-w-sm mx-auto">
              Are you a specialist in this field? Provide your diagnostic reasoning, procedural suggestions, or guideline-directed input below.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {responses.map((resp) => {
              const respDate = resp.created_at
                ? new Date(resp.created_at).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })
                : 'Just now';

              const authorName = resp.author?.full_name || resp.author_name || 'Specialist';
              const authorAvatar =
                resp.author?.avatar_url ||
                resp.author_avatar_url ||
                `https://ui-avatars.com/api/?name=${encodeURIComponent(authorName)}&background=0d9488&color=fff&bold=true`;
              const authorTitle = resp.author?.title || resp.author_title || 'Clinical Specialist';
              const authorInst = resp.author?.institution || resp.author_institution;

              return (
                <div
                  key={resp.id}
                  className="p-4 sm:p-5 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-3 transition hover:border-teal-300"
                >
                  <div className="flex items-center justify-between gap-2">
                    <Link
                      href={resp.author_id ? `/profile/${resp.author_id}` : '#'}
                      className="flex items-center gap-2.5 group"
                    >
                      <img
                        src={authorAvatar}
                        alt={authorName}
                        className="w-9 h-9 rounded-full object-cover border border-slate-200 group-hover:ring-2 group-hover:ring-teal-500 transition"
                        onError={(e) => {
                          e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(authorName)}&background=0d9488&color=fff&bold=true`;
                        }}
                      />
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-bold text-slate-900 group-hover:text-teal-700 transition">
                            {authorName}
                          </span>
                          <span className="p-0.5 rounded-full bg-teal-100 text-teal-800 text-[10px]">
                            <Check className="w-3 h-3 stroke-[3]" />
                          </span>
                        </div>
                        <span className="text-[11px] text-slate-500 block">
                          {authorTitle}
                          {authorInst ? ` • ${authorInst}` : ''}
                        </span>
                      </div>
                    </Link>

                    <span className="text-[10px] text-slate-400 font-medium">
                      {respDate}
                    </span>
                  </div>

                  <div className="pl-0 sm:pl-11 pt-1 text-xs sm:text-sm text-slate-800">
                    <MarkdownRenderer content={resp.content} />
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Submit Response Form */}
        <div className="pt-4 border-t border-slate-100 space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
              <Stethoscope className="w-3.5 h-3.5 text-teal-600" />
              <span>Contribute Specialist Input</span>
            </h4>
            <span className="text-[11px] text-slate-500">
              Responding as: <strong>{currentUser?.full_name || 'Verified Clinician'}</strong>
            </span>
          </div>

          {responseSuccess && (
            <div className="p-3 bg-teal-50 border border-teal-200 rounded-xl text-teal-800 text-xs font-semibold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-teal-600 flex-shrink-0" />
              <span>{responseSuccess}</span>
            </div>
          )}

          {responseError && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs font-medium flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 flex-shrink-0" />
              <span>{responseError}</span>
            </div>
          )}

          <form onSubmit={handleSubmitResponse} className="space-y-3">
            <textarea
              rows={4}
              value={newResponse}
              onChange={(e) => setNewResponse(e.target.value)}
              placeholder="Share your diagnostic rationale, recommendations, alternative differentials, or guideline citations..."
              className="w-full px-3.5 py-2.5 bg-slate-50 focus:bg-white border border-slate-200 focus:border-teal-500 rounded-xl text-xs sm:text-sm text-slate-900 focus:outline-none"
            />
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-slate-400">
                Markdown headings and bullet points supported. Responses notify the case author.
              </span>
              <button
                type="submit"
                disabled={isSubmittingResponse}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-teal-700 hover:bg-teal-800 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition shadow-xs"
              >
                {isSubmittingResponse ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Submitting...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    <span>Submit Specialist Response</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </section>

      {/* Share Modal for Author / Admin */}
      {isShareModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 max-w-lg w-full p-6 space-y-5 animate-scale-in">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-700">
                  <Share2 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Share Case Study</h3>
                  <p className="text-[11px] text-slate-500">Share with colleagues and connections</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsShareModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {shareSuccessMsg && (
              <div className="p-3 bg-teal-50 border border-teal-200 rounded-xl text-teal-800 text-xs font-semibold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-teal-600 flex-shrink-0" />
                <span>{shareSuccessMsg}</span>
              </div>
            )}

            {shareErrorMsg && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs font-medium flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                <span>{shareErrorMsg}</span>
              </div>
            )}

            {/* Direct Link Section */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">Case Study Link</label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={typeof window !== 'undefined' ? window.location.href : ''}
                  className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => {
                    if (typeof window !== 'undefined') {
                      navigator.clipboard.writeText(window.location.href);
                      setCopied(true);
                      setTimeout(() => setCopied(false), 2000);
                    }
                  }}
                  className="inline-flex items-center gap-1 px-3 py-2 bg-slate-100 hover:bg-slate-200 rounded-xl text-xs font-semibold text-slate-700 transition"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-teal-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
            </div>

            {/* Share Privately with Connections */}
            <div className="space-y-2 pt-2 border-t border-slate-100">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-slate-900">Share Privately with Connection</h4>
                  <p className="text-[10px] text-slate-500">
                    Recipient will receive an in-app notification with the access link and password.
                  </p>
                </div>
              </div>

              {isLoadingConnections ? (
                <div className="py-6 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin text-teal-600" />
                  <span>Loading connections...</span>
                </div>
              ) : connections.length === 0 ? (
                <div className="py-4 text-center text-xs text-slate-400 bg-slate-50 rounded-xl">
                  No accepted connections found to share with.
                </div>
              ) : (
                <div className="max-h-48 overflow-y-auto space-y-1.5 pr-1 divide-y divide-slate-100">
                  {connections.map((peer) => {
                    const isAlreadyShared = caseStudy.shared_with_user_ids?.includes(peer.id);
                    const isSharingThis = sharingWithId === peer.id;

                    return (
                      <div key={peer.id} className="pt-1.5 first:pt-0 flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <img
                            src={
                              peer.avatar_url ||
                              `https://ui-avatars.com/api/?name=${encodeURIComponent(peer.full_name)}&background=0d9488&color=fff&bold=true`
                            }
                            alt={peer.full_name}
                            className="w-7 h-7 rounded-full object-cover border border-slate-200 flex-shrink-0"
                          />
                          <div className="min-w-0">
                            <p className="text-xs font-bold text-slate-900 truncate">{peer.full_name}</p>
                            <p className="text-[10px] text-slate-500 truncate">{peer.title || peer.institution}</p>
                          </div>
                        </div>

                        {isAlreadyShared ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                            <Check className="w-3 h-3" />
                            <span>Shared</span>
                          </span>
                        ) : (
                          <button
                            type="button"
                            disabled={isSharingThis}
                            onClick={() => handleShareWithPeer(peer.id)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 bg-teal-700 hover:bg-teal-800 disabled:opacity-50 text-white rounded-lg text-xs font-semibold shadow-xs transition"
                          >
                            {isSharingThis ? (
                              <Loader2 className="w-3 h-3 animate-spin" />
                            ) : (
                              <Send className="w-3 h-3" />
                            )}
                            <span>Share</span>
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="pt-2 border-t border-slate-100 flex justify-end">
              <button
                type="button"
                onClick={() => setIsShareModalOpen(false)}
                className="px-4 py-2 border border-slate-200 hover:bg-slate-50 rounded-xl text-xs font-semibold text-slate-700 transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
