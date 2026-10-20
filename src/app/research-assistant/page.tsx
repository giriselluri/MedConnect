'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useApp } from '@/lib/context';
import { AISession } from '@/types';
import { StructuredResearchSummary } from '@/lib/gemini';
import { trackAppEvent } from '@/lib/analytics';
import {
  Sparkles,
  BookOpen,
  Send,
  Copy,
  Check,
  Share2,
  FileText,
  AlertTriangle,
  History,
  ShieldAlert,
  Loader2,
  ExternalLink,
  MessageSquare,
  HelpCircle,
} from 'lucide-react';

const SAMPLE_ABSTRACT = `Background: Transcatheter aortic valve replacement (TAVR) in patients with bicuspid aortic stenosis has traditionally raised concerns regarding asymmetric calcification, paravalvular leak, and conduction abnormalities.
Methods: We conducted an international, prospective registry analysis across 14 academic centers comparing balloon-expandable TAVR versus self-expanding TAVR in 842 consecutive bicuspid patients with Society of Thoracic Surgeons (STS) scores between 3% and 6%.
Results: The 30-day primary safety composite occurred in 8.2% of the balloon-expandable cohort compared to 7.9% in the self-expanding cohort (p=0.88). Moderate-to-severe paravalvular regurgitation was 1.4% vs 2.1%. Permanent pacemaker implantation rates were 9.4% vs 14.2% respectively (p=0.03). One-year all-cause mortality did not differ significantly (4.1% vs 4.6%, hazard ratio 0.89; 95% CI 0.52-1.52).
Conclusions: In selected intermediate-risk bicuspid patients, modern-generation TAVR yields acceptable 1-year hemodynamic and survival outcomes, though balloon-expandable valves showed lower new pacemaker requirement.`;

function ResearchAssistantContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { currentUser, isDemoUser } = useApp();

  const [title, setTitle] = useState('');
  const [sourceUrl, setSourceUrl] = useState('');
  const [text, setText] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [summary, setSummary] = useState<StructuredResearchSummary | null>(null);
  const [savedSessions, setSavedSessions] = useState<AISession[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // Read URL query params if linked from news/journals/case studies
  useEffect(() => {
    const qTitle = searchParams.get('title');
    const qText = searchParams.get('text');
    const qUrl = searchParams.get('url');
    if (qTitle) setTitle(qTitle);
    if (qText) setText(qText);
    if (qUrl) setSourceUrl(qUrl);
  }, [searchParams]);

  // Load previous saved AI sessions
  useEffect(() => {
    async function loadSessions() {
      try {
        const res = await fetch('/api/ai/research-summary');
        if (res.ok) {
          const data = await res.json();
          setSavedSessions(data.sessions || []);
        }
      } catch (e) {
        console.error(e);
      }
    }
    loadSessions();
  }, []);

  const handleSynthesize = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!text.trim() || text.trim().length < 30) {
      setError('Please provide a research abstract or clinical study text of at least 30 characters.');
      return;
    }

    setIsAnalyzing(true);
    setError(null);

    try {
      const res = await fetch('/api/ai/research-summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: text.trim(),
          title: title.trim() || 'Clinical Trial Analysis',
          source_url: sourceUrl.trim() || undefined,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to synthesize research');
      }

      const data = await res.json();
      setSummary(data.summary);
      if (data.session) {
        setSavedSessions((prev) => [data.session, ...prev]);
      }

      // Track AI Research Assistant usage event (strictly on success, excluding demo)
      trackAppEvent(
        'ai_research_assistant_used',
        {
          model_used: data.summary?.model_used || 'gemini-1.5-flash',
          has_source_url: Boolean(sourceUrl.trim()),
          findings_count: data.summary?.key_findings?.length || 0,
        },
        isDemoUser
      );
    } catch (err: any) {
      setError(err.message || 'An error occurred during AI analysis.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleCopySummary = () => {
    if (!summary) return;
    const formatted = `**MedConnect AI Research Synthesis: ${title || 'Study Analysis'}**\n\n` +
      `**Plain Language Summary:**\n${summary.plain_language_summary}\n\n` +
      `**Research Question:**\n${summary.research_question}\n\n` +
      `**Methodology:**\n${summary.methodology}\n\n` +
      `**Key Findings:**\n${summary.key_findings.map((f) => `- ${f}`).join('\n')}\n\n` +
      `**Limitations:**\n${summary.limitations.map((l) => `- ${l}`).join('\n')}\n\n` +
      `**Discussion Questions for Rounds:**\n${summary.discussion_questions.map((q) => `- ${q}`).join('\n')}\n\n` +
      `*Disclaimer: ${summary.disclaimer}*`;

    navigator.clipboard.writeText(formatted);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleConvertToPost = () => {
    if (!summary) return;
    const postDraft = `📊 Clinical Evidence Breakdown: ${title || 'Recent Trial Findings'}\n\n` +
      `${summary.plain_language_summary}\n\n` +
      `Key Trial Takeaways:\n` +
      summary.key_findings.map((f) => `• ${f}`).join('\n') + '\n\n' +
      (summary.methodology ? `Methodology: ${summary.methodology}\n\n` : '') +
      (summary.limitations && summary.limitations.length > 0 ? `Limitations:\n${summary.limitations.map((l) => `• ${l}`).join('\n')}\n\n` : '') +
      (summary.discussion_questions && summary.discussion_questions.length > 0 ? `Discussion Question for Colleagues:\n${summary.discussion_questions[0]}\n\n` : '') +
      (sourceUrl ? `Source: ${sourceUrl}\n\n` : '') +
      (summary.relevant_keywords || []).map((k) => `#${k.replace(/[^a-zA-Z0-9]/g, '')}`).join(' ');

    if (typeof window !== 'undefined') {
      sessionStorage.setItem(
        'medconnect_pending_post',
        JSON.stringify({
          content: postDraft,
          article_title: title || 'Clinical Research Synthesis',
          article_url: sourceUrl || undefined,
          tags: summary.relevant_keywords || [],
        })
      );
    }
    router.push('/feed?compose=1');
  };

  const loadSample = () => {
    setTitle('TAVR in Bicuspid Aortic Stenosis: Multicenter Comparative Registry');
    setSourceUrl('https://www.jacc.org/doi/10.1016/j.jacc.2024.01.002');
    setText(SAMPLE_ABSTRACT);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Page Header */}
      <div className="bg-gradient-to-r from-slate-900 via-teal-950 to-slate-900 rounded-2xl p-6 sm:p-8 text-white shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6 border border-teal-800/40">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="p-1.5 rounded-lg bg-teal-500/20 text-teal-300 border border-teal-400/30">
              <Sparkles className="w-5 h-5 text-teal-400" />
            </span>
            <span className="text-xs font-bold uppercase tracking-wider text-teal-300">
              Gemini-Powered Clinical Evidence Synthesizer
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            AI Research Assistant
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-1.5 max-w-2xl leading-relaxed">
            Extract research objectives, clinical methodologies, primary statistical endpoints, study limitations, and discussion questions from medical abstracts and preprints.
          </p>
        </div>

        <button
          onClick={loadSample}
          className="flex-shrink-0 inline-flex items-center gap-2 px-4 py-2.5 bg-teal-600 hover:bg-teal-500 text-white rounded-xl text-xs font-bold shadow-xs transition"
        >
          <BookOpen className="w-4 h-4" />
          <span>Load Sample Clinical Abstract</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Input Form (Col 1-7) */}
        <div className="lg:col-span-7 space-y-6">
          <form onSubmit={handleSynthesize} className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-teal-600" />
                Input Research Abstract or Article Text
              </h2>
              <span className="text-[11px] text-slate-400">
                Supports PubMed, NEJM, Lancet, JAMA text
              </span>
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl font-medium flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {/* Title & URL Inputs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1">
                  Study or Paper Title (Optional)
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. SGLT2i in Non-Diabetic Kidney Disease"
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-teal-500 focus:outline-none transition"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1">
                  Source DOI or URL (Optional)
                </label>
                <input
                  type="url"
                  value={sourceUrl}
                  onChange={(e) => setSourceUrl(e.target.value)}
                  placeholder="https://doi.org/10.1056/..."
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-teal-500 focus:outline-none transition"
                />
              </div>
            </div>

            {/* Abstract Text Area */}
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1">
                Scientific Abstract or Body Text *
              </label>
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                rows={11}
                placeholder="Paste the research abstract, trial methodology, and findings here..."
                className="w-full p-3.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-teal-500 focus:outline-none transition resize-none leading-relaxed text-slate-800"
              />
            </div>

            {/* Privacy notice as required by Section 11 & 14 */}
            <div className="flex items-start gap-2 p-3 bg-amber-50/70 border border-amber-200 rounded-xl text-[11px] text-amber-900 leading-relaxed">
              <ShieldAlert className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
              <span>
                <strong>Privacy Guard:</strong> Do NOT submit Protected Health Information (PHI) or patient-identifiable data. This service is intended for public scientific literature, abstracts, and preclinical datasets.
              </span>
            </div>

            {/* Submit button */}
            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={loadSample}
                className="text-xs font-semibold text-teal-700 hover:underline"
              >
                Insert Sample Abstract
              </button>

              <button
                type="submit"
                disabled={isAnalyzing || !text.trim()}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-teal-700 hover:bg-teal-800 disabled:opacity-50 text-white rounded-xl text-xs font-bold shadow-xs transition"
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Synthesizing Evidence...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Generate Structured Synthesis</span>
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Previous Saved Sessions */}
          {savedSessions.length > 0 && (
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5 mb-3">
                <History className="w-4 h-4 text-teal-600" />
                Saved Research Sessions ({savedSessions.length})
              </h3>

              <div className="space-y-2 max-h-56 overflow-y-auto">
                {savedSessions.map((session) => (
                  <div
                    key={session.id}
                    onClick={() => {
                      setTitle(session.title);
                      setText(session.source_text);
                      if (session.source_url) setSourceUrl(session.source_url);
                      setSummary(session.structured_summary as StructuredResearchSummary);
                    }}
                    className="p-2.5 bg-slate-50 hover:bg-teal-50 border border-slate-200 rounded-xl cursor-pointer transition flex items-center justify-between gap-2"
                  >
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-slate-900 truncate">
                        {session.title}
                      </p>
                      <p className="text-[10px] text-slate-400">
                        {new Date(session.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <span className="text-[10px] font-semibold text-teal-700">Load</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Structured Output (Col 8-12) */}
        <div className="lg:col-span-5 space-y-6">
          {summary ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-5 animate-fade-in">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-teal-800 bg-teal-50 px-2.5 py-0.5 rounded-full border border-teal-200 flex items-center gap-1">
                  <Check className="w-3.5 h-3.5 text-teal-600" />
                  Clinical Synthesis Ready
                </span>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={handleCopySummary}
                    className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition"
                    title="Copy full synthesis"
                  >
                    {copied ? <Check className="w-4 h-4 text-teal-600" /> : <Copy className="w-4 h-4" />}
                  </button>
                  <button
                    onClick={handleConvertToPost}
                    className="inline-flex items-center gap-1 px-2.5 py-1 bg-teal-700 hover:bg-teal-800 text-white rounded-lg text-xs font-bold shadow-2xs transition"
                    title="Create draft post for professional feed"
                  >
                    <Share2 className="w-3 h-3" />
                    <span>Create Post</span>
                  </button>
                </div>
              </div>

              {/* Model Source Badge */}
              <div className="flex items-center justify-between text-[11px] p-2.5 rounded-xl border bg-slate-50">
                <span className="font-semibold text-slate-600">Synthesis Engine:</span>
                {summary.model_used === 'gemini-1.5-flash' ? (
                  <span className="inline-flex items-center gap-1.5 font-bold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-300">
                    <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                    Gemini 1.5 Flash (Live AI)
                  </span>
                ) : (
                  <span
                    className="inline-flex items-center gap-1.5 font-bold text-amber-900 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-300"
                    title="Processed via validated high-fidelity clinical heuristic parser"
                  >
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                    Clinical Heuristic Fallback
                  </span>
                )}
              </div>

              {/* 1. Plain Language Summary */}
              <div className="space-y-1">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                  Plain-Language Summary
                </h4>
                <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-normal bg-teal-50/50 p-3 rounded-xl border border-teal-100">
                  {summary.plain_language_summary}
                </p>
              </div>

              {/* 2. Research Question */}
              <div className="space-y-1">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                  Primary Research Objective
                </h4>
                <p className="text-xs text-slate-700 leading-relaxed">
                  {summary.research_question}
                </p>
              </div>

              {/* 3. Methodology */}
              <div className="space-y-1">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                  Methodology & Study Cohort
                </h4>
                <p className="text-xs text-slate-700 leading-relaxed">
                  {summary.methodology}
                </p>
              </div>

              {/* 4. Key Findings */}
              <div className="space-y-1.5">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                  Key Findings & Quantitative Outcomes
                </h4>
                <ul className="space-y-1 text-xs text-slate-700">
                  {summary.key_findings.map((finding, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-teal-600 font-bold mt-0.5">•</span>
                      <span>{finding}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* 5. Limitations */}
              <div className="space-y-1.5">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                  Investigational Limitations
                </h4>
                <ul className="space-y-1 text-xs text-slate-700">
                  {summary.limitations.map((limit, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-amber-500 font-bold mt-0.5">•</span>
                      <span>{limit}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* 6. Discussion Questions */}
              <div className="space-y-1.5 p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
                  <HelpCircle className="w-3.5 h-3.5 text-teal-600" />
                  Discussion Prompts for Hospital Rounds
                </h4>
                <ul className="space-y-1.5 text-xs text-slate-700">
                  {summary.discussion_questions.map((q, i) => (
                    <li key={i} className="italic text-slate-800">
                      "{q}"
                    </li>
                  ))}
                </ul>
              </div>

              {/* Keywords */}
              {summary.relevant_keywords && (
                <div className="flex flex-wrap gap-1 pt-1">
                  {summary.relevant_keywords.map((kw) => (
                    <span
                      key={kw}
                      className="text-[10px] font-semibold bg-slate-100 text-slate-600 px-2 py-0.5 rounded"
                    >
                      #{kw}
                    </span>
                  ))}
                </div>
              )}

              {/* Strict Medical Disclaimer */}
              <div className="pt-3 border-t border-slate-100 text-[10px] text-slate-400 leading-relaxed italic">
                {summary.disclaimer}
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-12 text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-700 flex items-center justify-center mx-auto">
                <Sparkles className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-slate-800 text-sm">
                Awaiting Research Input
              </h3>
              <p className="text-xs text-slate-500 max-w-xs mx-auto leading-relaxed">
                Paste an abstract or click "Load Sample Clinical Abstract" to generate structured evidence extraction.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ResearchAssistantPage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-4xl mx-auto px-4 py-20 text-center">
          <Loader2 className="w-8 h-8 text-teal-600 animate-spin mx-auto mb-2" />
          <p className="text-xs text-slate-500 font-medium">Loading AI Research Assistant...</p>
        </div>
      }
    >
      <ResearchAssistantContent />
    </Suspense>
  );
}
