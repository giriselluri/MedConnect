'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useApp } from '@/lib/context';
import { SpecialtyBadge } from '@/components/specialty-badge';
import { MarkdownRenderer } from '@/components/markdown-renderer';
import { Group, Connection, Profile } from '@/types';
import {
  ArrowLeft,
  Save,
  Send,
  Plus,
  Trash2,
  CheckCircle2,
  BookOpen,
  Sparkles,
  Loader2,
  Lock,
  Globe,
  Users,
  Compass,
  Building2,
  AlertTriangle,
  UserCheck,
  Check,
  KeyRound,
  ShieldCheck,
} from 'lucide-react';

export default function CreateCaseStudyPage() {
  const router = useRouter();
  const { currentUser, specialties } = useApp();

  // Basic Case Fields
  const [title, setTitle] = useState('');
  const [shortSummary, setShortSummary] = useState('');
  const [clinicalBackground, setClinicalBackground] = useState('');
  const [clinicalFindings, setClinicalFindings] = useState('');
  const [questionForSpecialists, setQuestionForSpecialists] = useState('');
  const [educationalContent, setEducationalContent] = useState('');
  const [selectedSpecialties, setSelectedSpecialties] = useState<string[]>(['cardiology']);
  const [learningObjectives, setLearningObjectives] = useState<string[]>([
    'Evaluate clinical and diagnostic findings in the acute presentation',
    'Formulate guideline-directed evidence-based management strategy',
  ]);
  const [newObjective, setNewObjective] = useState('');
  const [sourceReferences, setSourceReferences] = useState<string[]>([
    'ACC/AHA Clinical Practice Guidelines',
  ]);
  const [newReference, setNewReference] = useState('');
  const [contentTab, setContentTab] = useState<'write' | 'preview'>('write');
  const [isAnonymizedConfirmed, setIsAnonymizedConfirmed] = useState(false);

  // AI Case Study Assistant state
  const [roughNotes, setRoughNotes] = useState('');
  const [isGeneratingDraft, setIsGeneratingDraft] = useState(false);
  const [aiAssistantDraft, setAiAssistantDraft] = useState<any | null>(null);
  const [aiAssistantError, setAiAssistantError] = useState<string | null>(null);
  const [showAiAssistant, setShowAiAssistant] = useState(false);

  // Privacy & Audience State (Core Feature)
  const [isPrivate, setIsPrivate] = useState(false);
  const [visibility, setVisibility] = useState<'everyone' | 'connections' | 'followers' | 'group'>('everyone');
  const [selectedGroupId, setSelectedGroupId] = useState<string>('');
  const [sharedConnectionIds, setSharedConnectionIds] = useState<string[]>([]);
  const [passwordProtected, setPasswordProtected] = useState(false);
  const [accessPassword, setAccessPassword] = useState('clinical2024');

  // Loaded Connections & Groups
  const [connections, setConnections] = useState<Profile[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [isLoadingConnections, setIsLoadingConnections] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch user's connections and communities
  useEffect(() => {
    async function loadMetadata() {
      setIsLoadingConnections(true);
      try {
        // Load connections
        const connRes = await fetch('/api/connections');
        if (connRes.ok) {
          const connData = await connRes.json();
          // Extract connected profiles
          const connectedProfiles: Profile[] = (connData.connections || []).map((c: any) => {
            return c.requester_id === currentUser?.id ? c.recipient : c.requester;
          }).filter(Boolean);
          setConnections(connectedProfiles);
          // Default to selecting all connections if private
          setSharedConnectionIds(connectedProfiles.map((p) => p.id));
        }

        // Load groups
        const groupsRes = await fetch('/api/groups');
        if (groupsRes.ok) {
          const groupData = await groupsRes.json();
          setGroups(groupData.groups || []);
          if (groupData.groups?.length > 0) {
            setSelectedGroupId(groupData.groups[0].id);
          }
        }
      } catch (e) {
        console.error('Error loading connections/groups:', e);
      } finally {
        setIsLoadingConnections(false);
      }
    }
    loadMetadata();
  }, [currentUser?.id]);

  const toggleSpecialty = (id: string) => {
    setSelectedSpecialties((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const toggleConnectionSelection = (profileId: string) => {
    setSharedConnectionIds((prev) =>
      prev.includes(profileId)
        ? prev.filter((id) => id !== profileId)
        : [...prev, profileId]
    );
  };

  const selectAllConnections = () => {
    setSharedConnectionIds(connections.map((p) => p.id));
  };

  const clearAllConnections = () => {
    setSharedConnectionIds([]);
  };

  const handleAddObjective = () => {
    if (newObjective.trim()) {
      setLearningObjectives([...learningObjectives, newObjective.trim()]);
      setNewObjective('');
    }
  };

  const handleRemoveObjective = (idx: number) => {
    setLearningObjectives(learningObjectives.filter((_, i) => i !== idx));
  };

  const handleAddReference = () => {
    if (newReference.trim()) {
      setSourceReferences([...sourceReferences, newReference.trim()]);
      setNewReference('');
    }
  };

  const handleRemoveReference = (idx: number) => {
    setSourceReferences(sourceReferences.filter((_, i) => i !== idx));
  };

  const handleGenerateAiDraft = async () => {
    if (!roughNotes.trim() || roughNotes.trim().length < 20) {
      setAiAssistantError('Please enter at least 20 characters of rough clinical notes.');
      return;
    }
    setIsGeneratingDraft(true);
    setAiAssistantError(null);
    try {
      const res = await fetch('/api/ai/case-assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roughNotes: roughNotes.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to generate case draft');
      }
      setAiAssistantDraft(data.draft);
    } catch (e: any) {
      setAiAssistantError(e.message || 'Error running AI Case Study Assistant');
    } finally {
      setIsGeneratingDraft(false);
    }
  };

  const handleApplyAiDraft = () => {
    if (!aiAssistantDraft) return;
    if (aiAssistantDraft.title) setTitle(aiAssistantDraft.title);
    if (aiAssistantDraft.shortSummary) setShortSummary(aiAssistantDraft.shortSummary);
    if (aiAssistantDraft.clinicalBackground) setClinicalBackground(aiAssistantDraft.clinicalBackground);
    if (aiAssistantDraft.clinicalFindings) setClinicalFindings(aiAssistantDraft.clinicalFindings);
    if (aiAssistantDraft.questionForSpecialists) setQuestionForSpecialists(aiAssistantDraft.questionForSpecialists);
    if (aiAssistantDraft.suggestedSpecialtyIds && aiAssistantDraft.suggestedSpecialtyIds.length > 0) {
      setSelectedSpecialties(aiAssistantDraft.suggestedSpecialtyIds);
    }
    if (aiAssistantDraft.learningObjectives && aiAssistantDraft.learningObjectives.length > 0) {
      setLearningObjectives(aiAssistantDraft.learningObjectives);
    }
    // Auto-compose educational content
    const composed = `### Clinical Background & Presentation\n${aiAssistantDraft.clinicalBackground || ''}\n\n### Diagnostic & Clinical Findings\n${aiAssistantDraft.clinicalFindings || ''}\n\n### Specific Question for Specialists\n${aiAssistantDraft.questionForSpecialists || ''}`;
    setEducationalContent(composed);
    setShowAiAssistant(false);
  };

  const handleSubmit = async (submitStatus: 'published' | 'draft') => {
    // If educationalContent is empty but structured fields exist, compose them
    let finalContent = educationalContent.trim();
    if (!finalContent && (clinicalBackground.trim() || clinicalFindings.trim() || questionForSpecialists.trim())) {
      finalContent = `### Clinical Background & Presentation\n${clinicalBackground.trim()}\n\n### Diagnostic Findings\n${clinicalFindings.trim()}\n\n### Question for Specialists\n${questionForSpecialists.trim()}`;
      setEducationalContent(finalContent);
    }

    if (!title.trim() || !shortSummary.trim() || !finalContent) {
      setError('Please provide title, short summary, and case content (or complete the clinical sections).');
      return;
    }
    if (selectedSpecialties.length === 0) {
      setError('Please select at least one clinical specialty tag for relevant specialists to discover your case.');
      return;
    }
    if (submitStatus === 'published' && !isAnonymizedConfirmed) {
      setError('Please confirm that this case study is strictly anonymised and contains no patient-identifiable data before publishing.');
      return;
    }
    if (isPrivate && sharedConnectionIds.length === 0 && !passwordProtected) {
      setError('Please select at least one connection to share this private case with, or enable password protection.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const res = await fetch('/api/case-studies', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title.trim(),
          short_summary: shortSummary.trim(),
          clinical_background: clinicalBackground.trim() || undefined,
          clinical_findings: clinicalFindings.trim() || undefined,
          question_for_specialists: questionForSpecialists.trim() || undefined,
          educational_content: finalContent,
          learning_objectives: learningObjectives,
          source_references: sourceReferences,
          specialty_ids: selectedSpecialties,
          status: submitStatus,
          is_private: isPrivate,
          shared_with_user_ids: isPrivate ? sharedConnectionIds : [],
          visibility: isPrivate ? undefined : visibility,
          group_id: isPrivate ? undefined : (visibility === 'group' ? selectedGroupId : undefined),
          password_protected: passwordProtected,
          access_password: passwordProtected ? accessPassword.trim() : undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to create case study');
      }

      router.push(`/case-studies/${data.caseStudy.id}`);
    } catch (err: any) {
      setError(err.message || 'Error publishing case study');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      {/* Top Navigation */}
      <div className="flex items-center justify-between">
        <Link
          href="/case-studies"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-teal-700 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Case Studies</span>
        </Link>
        <span className="text-xs text-slate-500 font-medium">
          Author: <strong className="text-slate-800">{currentUser?.full_name}</strong>
        </span>
      </div>

      {/* Header Banner */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="p-2 rounded-xl bg-teal-100 text-teal-800">
              <BookOpen className="w-5 h-5" />
            </span>
            <span className="text-xs font-bold uppercase tracking-wider text-teal-700 bg-teal-50 px-2.5 py-0.5 rounded-full border border-teal-200">
              Clinical Case Authoring
            </span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Create Clinical Case Study
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-1 leading-relaxed">
            Document illustrative clinical presentations, diagnostic decision-making, and evidence-based management rationales.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            type="button"
            disabled={isSubmitting}
            onClick={() => handleSubmit('draft')}
            className="inline-flex items-center gap-1.5 px-4 py-2 border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-semibold transition"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Save Draft</span>
          </button>
          <button
            type="button"
            disabled={isSubmitting}
            onClick={() => handleSubmit('published')}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-teal-700 hover:bg-teal-800 disabled:opacity-50 text-white rounded-xl text-xs font-bold shadow-xs transition"
          >
            {isSubmitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
            <span>Publish Case Study</span>
          </button>
        </div>
      </div>

      {/* AI Case Study Assistant Banner */}
      <div className="bg-gradient-to-r from-teal-900 via-slate-900 to-teal-950 rounded-2xl p-5 text-white border border-teal-800/60 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-start gap-3">
            <span className="p-2 rounded-xl bg-teal-500/20 text-teal-300 border border-teal-400/30">
              <Sparkles className="w-5 h-5 text-teal-300" />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-white">AI Case Study Assistant</h3>
                <span className="text-[10px] uppercase tracking-wider font-extrabold bg-teal-500/20 text-teal-300 px-2 py-0.5 rounded-full border border-teal-400/30">
                  Doctor Review Required
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                Paste rough clinic notes. AI converts them into a structured draft, scans for patient identifiers (PHI), and recommends specialty tags. You review and approve before publishing.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setShowAiAssistant(!showAiAssistant)}
            className="flex-shrink-0 inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-teal-600 hover:bg-teal-500 text-white rounded-xl text-xs font-bold transition shadow-xs"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{showAiAssistant ? 'Hide Assistant' : 'Open Case Assistant'}</span>
          </button>
        </div>

        {showAiAssistant && (
          <div className="space-y-3 pt-3 border-t border-teal-800/80">
            <div>
              <label className="block text-xs font-semibold text-teal-200 mb-1">
                Rough Clinical Notes / Patient Presentation
              </label>
              <textarea
                rows={4}
                value={roughNotes}
                onChange={(e) => setRoughNotes(e.target.value)}
                placeholder="e.g. 54yo M with sudden right-sided hemiparesis and aphasia. Last known well 2 hrs ago. CT head no acute bleed. BP 170/95. History of paroxysmal atrial fibrillation on apixaban. Want neurology input on IV thrombolysis eligibility and endovascular thrombectomy criteria..."
                className="w-full px-3.5 py-2.5 bg-slate-950/70 border border-teal-700/60 focus:border-teal-400 rounded-xl text-xs font-mono text-slate-100 placeholder:text-slate-500 focus:outline-none"
              />
            </div>

            {aiAssistantError && (
              <div className="p-3 bg-red-900/60 border border-red-700 text-red-200 text-xs rounded-xl flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                <span>{aiAssistantError}</span>
              </div>
            )}

            <div className="flex items-center justify-between">
              <span className="text-[11px] text-slate-400">
                Note: External AI services never auto-publish. Patient details remain de-identified.
              </span>
              <button
                type="button"
                disabled={isGeneratingDraft}
                onClick={handleGenerateAiDraft}
                className="inline-flex items-center gap-2 px-4 py-2 bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold rounded-xl text-xs shadow transition disabled:opacity-50"
              >
                {isGeneratingDraft ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Analyzing & Structuring...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Generate Structured Case Draft</span>
                  </>
                )}
              </button>
            </div>

            {/* AI Assistant Generated Draft Preview */}
            {aiAssistantDraft && (
              <div className="mt-4 p-4 bg-slate-950/90 rounded-xl border border-teal-600/50 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <span className="text-xs font-bold text-teal-300 uppercase tracking-wider">
                    Generated Case Draft (Preview)
                  </span>
                  <button
                    type="button"
                    onClick={handleApplyAiDraft}
                    className="inline-flex items-center gap-1.5 px-3 py-1 bg-teal-600 hover:bg-teal-500 text-white rounded-lg text-xs font-bold transition"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Apply to Case Form</span>
                  </button>
                </div>

                {/* PHI Warning */}
                {aiAssistantDraft.phiFound && (
                  <div className="p-3 bg-amber-950/80 border border-amber-600/80 rounded-lg text-amber-200 text-xs space-y-1">
                    <div className="flex items-center gap-1.5 font-bold text-amber-300">
                      <AlertTriangle className="w-4 h-4 text-amber-400" />
                      <span>Potential Patient Identifiers Detected (PHI Audit)</span>
                    </div>
                    <ul className="list-disc list-inside space-y-0.5 text-[11px] text-amber-200/90 pl-1">
                      {aiAssistantDraft.phiWarnings.map((w: string, idx: number) => (
                        <li key={idx}>{w}</li>
                      ))}
                    </ul>
                    <p className="text-[10px] text-amber-300 italic pt-1">
                      Please remove any real names, MRNs, or specific dates before publishing this case study.
                    </p>
                  </div>
                )}

                <div className="space-y-2 text-xs text-slate-200">
                  <div>
                    <strong className="text-teal-400">Proposed Title:</strong>{' '}
                    <span>{aiAssistantDraft.title}</span>
                  </div>
                  <div>
                    <strong className="text-teal-400">Question for Specialists:</strong>{' '}
                    <span className="text-amber-300 font-semibold">{aiAssistantDraft.questionForSpecialists}</span>
                  </div>
                  {aiAssistantDraft.suggestedSpecialtyIds?.length > 0 && (
                    <div className="flex items-center gap-1.5">
                      <strong className="text-teal-400">Recommended Specialties:</strong>
                      <div className="flex flex-wrap gap-1">
                        {aiAssistantDraft.suggestedSpecialtyIds.map((sId: string) => (
                          <span key={sId} className="px-2 py-0.5 rounded bg-teal-900 text-teal-200 text-[10px] font-bold">
                            {sId}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl font-medium flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Main Authoring Form */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 sm:p-8 space-y-8">
        {/* 1. Title & Abstract */}
        <div className="space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500 border-b border-slate-100 pb-2 flex items-center gap-2">
            <span>1. Case Presentation Overview</span>
          </h2>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Case Study Title *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Acute Limb Ischemia Secondary to Paradoxical Embolism in Patent Foramen Ovale"
              className="w-full px-3.5 py-2.5 bg-slate-50 focus:bg-white border border-slate-200 focus:border-teal-500 focus:ring-1 focus:ring-teal-500 rounded-xl text-xs sm:text-sm text-slate-900 font-semibold"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Executive Abstract / Short Summary *
            </label>
            <textarea
              rows={2}
              value={shortSummary}
              onChange={(e) => setShortSummary(e.target.value)}
              placeholder="A concise 2-3 sentence clinical summary highlighting presentation, diagnostic crux, and key intervention..."
              className="w-full px-3.5 py-2.5 bg-slate-50 focus:bg-white border border-slate-200 focus:border-teal-500 focus:ring-1 focus:ring-teal-500 rounded-xl text-xs sm:text-sm text-slate-900 resize-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-2">
              Clinical Specialties * ({selectedSpecialties.length} selected)
            </label>
            <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto p-2 bg-slate-50 rounded-xl border border-slate-200">
              {specialties.map((s) => {
                const isSelected = selectedSpecialties.includes(s.id);
                return (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => toggleSpecialty(s.id)}
                    className={`text-xs px-2.5 py-1 rounded-full font-medium transition ${
                      isSelected
                        ? 'bg-teal-700 text-white shadow-2xs font-semibold'
                        : 'bg-white border border-slate-200 text-slate-700 hover:border-teal-400'
                    }`}
                  >
                    {s.name}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Structured Clinical Sections */}
          <div className="pt-2 border-t border-slate-100 space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Clinical Background & Patient Presentation (Anonymised)
              </label>
              <textarea
                rows={3}
                value={clinicalBackground}
                onChange={(e) => setClinicalBackground(e.target.value)}
                placeholder="Patient age bracket, relevant comorbidities, timeline of presentation, acute symptoms..."
                className="w-full px-3.5 py-2 bg-slate-50 focus:bg-white border border-slate-200 focus:border-teal-500 rounded-xl text-xs sm:text-sm text-slate-900"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Diagnostic & Clinical Findings (Labs, ECG, Imaging, Pathology)
              </label>
              <textarea
                rows={3}
                value={clinicalFindings}
                onChange={(e) => setClinicalFindings(e.target.value)}
                placeholder="Pertinent physical exam findings, biomarker levels, imaging results, initial interventions..."
                className="w-full px-3.5 py-2 bg-slate-50 focus:bg-white border border-slate-200 focus:border-teal-500 rounded-xl text-xs sm:text-sm text-slate-900"
              />
            </div>

            {/* Crucial: Question for Specialists */}
            <div className="p-4 bg-teal-50/70 border-2 border-teal-200 rounded-2xl space-y-1.5">
              <label className="block text-xs font-bold text-teal-950 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-teal-700" />
                <span>Specific Question for Specialists * (Core Clinical Inquiry)</span>
              </label>
              <p className="text-[11px] text-teal-800/80">
                Clearly state what diagnostic dilemma, surgical rationale, or therapeutic strategy you need input on from specialists.
              </p>
              <textarea
                rows={2}
                value={questionForSpecialists}
                onChange={(e) => setQuestionForSpecialists(e.target.value)}
                placeholder="e.g. Would you recommend urgent transesophageal echocardiogram (TEE) prior to initiating direct oral anticoagulation in this setting?"
                className="w-full px-3.5 py-2 bg-white border border-teal-300 focus:border-teal-600 focus:ring-1 focus:ring-teal-600 rounded-xl text-xs sm:text-sm text-slate-900 font-medium"
              />
            </div>
          </div>
        </div>

        {/* 2. Privacy & Audience Controls (Core User Requirement) */}
        <div className="space-y-5 p-5 bg-slate-50/70 rounded-2xl border border-slate-200">
          <div>
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-teal-600" />
              <span>2. Privacy & Audience Access Settings</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Choose whether this case study is public across MedConnect or restricted privately to your clinical connections.
            </p>
          </div>

          {/* Privacy Toggle: Public vs Private */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setIsPrivate(false)}
              className={`p-4 rounded-xl border text-left flex items-start gap-3 transition ${
                !isPrivate
                  ? 'bg-white border-teal-600 shadow-sm ring-1 ring-teal-600'
                  : 'bg-slate-100/60 border-slate-200 hover:bg-white text-slate-600'
              }`}
            >
              <div className={`p-2 rounded-lg ${!isPrivate ? 'bg-teal-700 text-white' : 'bg-slate-200 text-slate-600'}`}>
                <Globe className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900">Public Case Study</p>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Publish to network, home feed, or specialized medical communities.
                </p>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setIsPrivate(true)}
              className={`p-4 rounded-xl border text-left flex items-start gap-3 transition ${
                isPrivate
                  ? 'bg-white border-amber-500 shadow-sm ring-1 ring-amber-500'
                  : 'bg-slate-100/60 border-slate-200 hover:bg-white text-slate-600'
              }`}
            >
              <div className={`p-2 rounded-lg ${isPrivate ? 'bg-amber-600 text-white' : 'bg-slate-200 text-slate-600'}`}>
                <Lock className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900">Private Case Study</p>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Confidential case restricted to specific selected connections and peers.
                </p>
              </div>
            </button>
          </div>

          {/* If PUBLIC: Show audience dropdown matching home feed */}
          {!isPrivate ? (
            <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-3">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Select Public Audience
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
                {[
                  { id: 'everyone', label: 'All Users', icon: Globe, desc: 'Public to all doctors' },
                  { id: 'connections', label: 'Connections', icon: Users, desc: 'Accepted connections only' },
                  { id: 'followers', label: 'Followers', icon: UserCheck, desc: 'Followers & connections' },
                  { id: 'group', label: 'Community', icon: Compass, desc: 'Specific medical group' },
                ].map((aud) => {
                  const Icon = aud.icon;
                  const isSelected = visibility === aud.id;
                  return (
                    <button
                      key={aud.id}
                      type="button"
                      onClick={() => setVisibility(aud.id as any)}
                      className={`p-2.5 rounded-xl border text-left transition ${
                        isSelected
                          ? 'border-teal-600 bg-teal-50/60 ring-1 ring-teal-600 text-teal-900'
                          : 'border-slate-200 hover:border-slate-300 text-slate-700 bg-slate-50/50'
                      }`}
                    >
                      <div className="flex items-center gap-1.5 font-bold text-xs">
                        <Icon className="w-3.5 h-3.5 text-teal-600" />
                        <span>{aud.label}</span>
                      </div>
                      <p className="text-[10px] text-slate-500 mt-1 leading-snug">{aud.desc}</p>
                    </button>
                  );
                })}
              </div>

              {/* Group Dropdown if 'group' selected */}
              {visibility === 'group' && (
                <div className="pt-2 border-t border-slate-100">
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Select Medical Community / Group *
                  </label>
                  <select
                    value={selectedGroupId}
                    onChange={(e) => setSelectedGroupId(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-teal-500 font-medium"
                  >
                    {groups.map((g) => (
                      <option key={g.id} value={g.id}>
                        {g.name} ({g.members_count || 10} members)
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          ) : (
            /* If PRIVATE: Show connection selector */
            <div className="bg-white p-4 sm:p-5 rounded-xl border border-amber-200/90 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                <div>
                  <div className="flex items-center gap-1.5">
                    <Lock className="w-4 h-4 text-amber-600" />
                    <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                      Share with Specific Connections
                    </h3>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Select which of your clinical colleagues can view and discuss this case study.
                  </p>
                </div>

                <div className="flex items-center gap-2 text-xs">
                  <button
                    type="button"
                    onClick={selectAllConnections}
                    className="text-teal-700 hover:text-teal-900 font-bold hover:underline"
                  >
                    Select All ({connections.length})
                  </button>
                  <span className="text-slate-300">•</span>
                  <button
                    type="button"
                    onClick={clearAllConnections}
                    className="text-slate-500 hover:text-slate-700 font-medium hover:underline"
                  >
                    Clear Selection
                  </button>
                </div>
              </div>

              {/* Connections list with checkboxes */}
              {connections.length === 0 ? (
                <div className="py-6 text-center text-xs text-slate-500">
                  <p>You do not have any accepted connections yet.</p>
                  <Link href="/network" className="text-teal-700 font-bold hover:underline mt-1 inline-block">
                    Connect with colleagues in My Network →
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-56 overflow-y-auto pr-1">
                  {connections.map((doc) => {
                    const isSelected = sharedConnectionIds.includes(doc.id);
                    return (
                      <button
                        key={doc.id}
                        type="button"
                        onClick={() => toggleConnectionSelection(doc.id)}
                        className={`p-2.5 rounded-xl border text-left flex items-center justify-between gap-3 transition ${
                          isSelected
                            ? 'bg-amber-50/60 border-amber-400 ring-1 ring-amber-400'
                            : 'bg-slate-50/50 border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <img
                            src={doc.avatar_url || 'https://images.unsplash.com/photo-1551601651-2a8555f1a136?auto=format&fit=crop&q=80&w=100'}
                            alt={doc.full_name}
                            onError={(e) => {
                              e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(doc.full_name)}&background=0d9488&color=fff&bold=true`;
                            }}
                            className="w-8 h-8 rounded-full object-cover border border-slate-200 flex-shrink-0"
                          />
                          <div className="min-w-0">
                            <p className="text-xs font-bold text-slate-900 truncate">
                              {doc.full_name}
                            </p>
                            <p className="text-[10px] text-slate-500 truncate">
                              {doc.title || doc.institution}
                            </p>
                          </div>
                        </div>

                        <div
                          className={`w-5 h-5 rounded-md flex items-center justify-center flex-shrink-0 transition ${
                            isSelected ? 'bg-amber-600 text-white' : 'border border-slate-300 bg-white'
                          }`}
                        >
                          {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Optional Passcode Layer */}
              <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={passwordProtected}
                    onChange={(e) => setPasswordProtected(e.target.checked)}
                    className="w-4 h-4 text-amber-600 rounded border-slate-300 focus:ring-amber-500"
                  />
                  <span className="text-xs font-semibold text-slate-800">
                    Require Access Password as well
                  </span>
                </label>

                {passwordProtected && (
                  <div className="flex items-center gap-2">
                    <KeyRound className="w-3.5 h-3.5 text-amber-600 flex-shrink-0" />
                    <input
                      type="text"
                      value={accessPassword}
                      onChange={(e) => setAccessPassword(e.target.value)}
                      placeholder="e.g. clinical2024"
                      className="px-2.5 py-1 bg-slate-50 border border-slate-300 rounded-lg text-xs font-mono font-bold text-slate-800 focus:outline-none focus:border-amber-500"
                    />
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* 3. Detailed Educational Narrative */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-2 gap-2">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500">
              3. Full Educational Clinical Narrative
            </h2>
            <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg text-xs font-semibold">
              <button
                type="button"
                onClick={() => setContentTab('write')}
                className={`px-3 py-1 rounded-md transition ${
                  contentTab === 'write'
                    ? 'bg-white text-slate-900 shadow-2xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Write (Markdown)
              </button>
              <button
                type="button"
                onClick={() => setContentTab('preview')}
                className={`px-3 py-1 rounded-md transition ${
                  contentTab === 'preview'
                    ? 'bg-white text-slate-900 shadow-2xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Preview Rendered
              </button>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-bold text-slate-700">
                Detailed Case Content (Markdown headings, lists, bold text supported) *
              </label>
              {contentTab === 'write' && (
                <button
                  type="button"
                  onClick={() =>
                    setEducationalContent(
                      `### Clinical Presentation\nA 68-year-old patient with a history of hypertension and hyperlipidemia presents with acute chest discomfort...\n\n### Diagnostic Evaluation\n- ECG: Sinus rhythm with hyperacute T waves in leads V2-V4\n- High-sensitivity Troponin I: 3.8 ng/mL\n- Bedside Echocardiogram: Anterior wall hypokinesis, EF 45%\n\n### Management & Clinical Decision-Making\nEmergency coronary angiography was initiated. Guideline-directed dual antiplatelet therapy (DAPT) and high-intensity statin were administered...\n\n### Teaching Pearls & Outcome\nEarly identification of subtle ischemic changes prevents cardiogenic decompensation.`
                    )
                  }
                  className="text-[11px] text-teal-700 hover:text-teal-900 font-semibold hover:underline"
                >
                  Insert Clinical Template
                </button>
              )}
            </div>

            {contentTab === 'write' ? (
              <textarea
                rows={12}
                value={educationalContent}
                onChange={(e) => setEducationalContent(e.target.value)}
                placeholder="Structure the case using headers like:
### Clinical Presentation
- ECG findings and vital signs

### Diagnostic Evaluation
- High-sensitivity biomarker analysis

### Management & Clinical Decision-Making
- Primary catheterization or pharmacological rationale

### Teaching Pearls & Outcome
- Summary take-aways for clinical rounds"
                className="w-full px-3.5 py-2.5 bg-slate-50 focus:bg-white border border-slate-200 focus:border-teal-500 focus:ring-1 focus:ring-teal-500 rounded-xl text-xs sm:text-sm font-mono text-slate-800 leading-relaxed"
              />
            ) : (
              <div className="p-5 bg-white border border-slate-200 rounded-xl min-h-[220px]">
                <MarkdownRenderer content={educationalContent} />
              </div>
            )}
          </div>
        </div>

        {/* 4. Learning Objectives */}
        <div className="space-y-3">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500 border-b border-slate-100 pb-2">
            4. Key Learning Objectives
          </h2>

          <div className="space-y-2">
            {learningObjectives.map((obj, i) => (
              <div key={i} className="flex items-center gap-2 p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                <CheckCircle2 className="w-4 h-4 text-teal-600 flex-shrink-0" />
                <span className="text-xs text-slate-800 flex-1">{obj}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveObjective(i)}
                  className="p-1 text-slate-400 hover:text-red-600 rounded transition"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}

            <div className="flex gap-2">
              <input
                type="text"
                value={newObjective}
                onChange={(e) => setNewObjective(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddObjective())}
                placeholder="Add another learning objective (e.g. 'Differentiate cardiogenic vs septic hemodynamics')..."
                className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-teal-500"
              />
              <button
                type="button"
                onClick={handleAddObjective}
                className="px-3 py-2 bg-teal-700 hover:bg-teal-800 text-white rounded-xl text-xs font-semibold flex items-center gap-1 transition"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add</span>
              </button>
            </div>
          </div>
        </div>

        {/* 5. References */}
        <div className="space-y-3">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500 border-b border-slate-100 pb-2">
            5. Clinical Guidelines & Literature Citations
          </h2>

          <div className="space-y-2">
            {sourceReferences.map((ref, i) => (
              <div key={i} className="flex items-center gap-2 p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                <span className="w-4 h-4 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center text-[10px] font-bold flex-shrink-0">
                  {i + 1}
                </span>
                <span className="text-xs text-slate-800 flex-1">{ref}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveReference(i)}
                  className="p-1 text-slate-400 hover:text-red-600 rounded transition"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}

            <div className="flex gap-2">
              <input
                type="text"
                value={newReference}
                onChange={(e) => setNewReference(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddReference())}
                placeholder="Add reference (e.g. 'ESC 2024 Guidelines for the Management of Acute Coronary Syndromes')..."
                className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-teal-500"
              />
              <button
                type="button"
                onClick={handleAddReference}
                className="px-3 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-semibold flex items-center gap-1 transition"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add</span>
              </button>
            </div>
          </div>
        </div>

        {/* De-identification & Compliance Declaration */}
        <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
          <label className="flex items-start gap-2.5 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={isAnonymizedConfirmed}
              onChange={(e) => setIsAnonymizedConfirmed(e.target.checked)}
              className="mt-0.5 w-4 h-4 text-teal-600 rounded border-slate-300 focus:ring-teal-500"
            />
            <div className="text-xs text-slate-700 leading-relaxed">
              <strong className="text-slate-900 block font-bold">Clinical De-identification & Patient Privacy Confirmation *</strong>
              <span>
                I confirm that this case study has been completely de-identified in compliance with clinical privacy guidelines (HIPAA/GDPR), containing no patient names, medical record numbers, specific dates of birth, or identifiable patient details.
              </span>
            </div>
          </label>
        </div>

        {/* Bottom Submission Bar */}
        <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
          <Link
            href="/case-studies"
            className="text-xs text-slate-500 hover:text-slate-700 font-medium"
          >
            Cancel and Return
          </Link>

          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={isSubmitting}
              onClick={() => handleSubmit('draft')}
              className="px-4 py-2 border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-semibold transition"
            >
              Save as Draft
            </button>
            <button
              type="button"
              disabled={isSubmitting}
              onClick={() => handleSubmit('published')}
              className="inline-flex items-center gap-2 px-5 py-2 bg-teal-700 hover:bg-teal-800 disabled:opacity-50 text-white rounded-xl text-xs font-bold shadow-xs transition"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Publishing...</span>
                </>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" />
                  <span>Publish Clinical Case Study</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
