'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useApp } from '@/lib/context';
import { CaseStudy, Profile } from '@/types';
import { SpecialtyBadge } from '@/components/specialty-badge';
import { MarkdownRenderer } from '@/components/markdown-renderer';
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

  const isAdmin = Boolean((currentUser?.is_admin || currentUser?.role === 'admin') && isDemoUser);

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
      } catch (e: any) {
        setError(e.message || 'Error loading case study');
      } finally {
        setIsLoading(false);
      }
    }
    loadCase();
  }, [params.id]);

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
