'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useApp } from '@/lib/context';
import { AdminNav } from '@/components/admin-nav';
import { SpecialtyBadge } from '@/components/specialty-badge';
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
} from 'lucide-react';
import { CaseStudyStatus } from '@/types';

export default function NewCaseStudyPage() {
  const router = useRouter();
  const { currentUser, specialties } = useApp();

  const [title, setTitle] = useState('');
  const [shortSummary, setShortSummary] = useState('');
  const [educationalContent, setEducationalContent] = useState('');
  const [learningObjectives, setLearningObjectives] = useState<string[]>([
    'Evaluate clinical and diagnostic findings in the acute setting',
    'Formulate evidence-based guideline-directed pharmacotherapy',
  ]);
  const [newObjective, setNewObjective] = useState('');
  const [sourceReferences, setSourceReferences] = useState<string[]>([
    'ACC/AHA Clinical Practice Guidelines',
  ]);
  const [newReference, setNewReference] = useState('');
  const [selectedSpecialties, setSelectedSpecialties] = useState<string[]>(['cardiology']);
  const [status, setStatus] = useState<CaseStudyStatus>('published');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const toggleSpecialty = (id: string) => {
    setSelectedSpecialties((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
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

  const handleSubmit = async (submitStatus: CaseStudyStatus) => {
    if (!title.trim() || !shortSummary.trim() || !educationalContent.trim()) {
      setError('Please fill in title, short summary, and educational clinical content.');
      return;
    }
    if (selectedSpecialties.length === 0) {
      setError('Please assign at least one clinical specialty tag.');
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
          educational_content: educationalContent.trim(),
          learning_objectives: learningObjectives,
          source_references: sourceReferences,
          specialty_ids: selectedSpecialties,
          status: submitStatus,
          author_id: currentUser?.id,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to save case study');
      }

      const data = await res.json();
      router.push('/admin/case-studies');
    } catch (err: any) {
      setError(err.message || 'An error occurred while publishing the case study.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <AdminNav />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-6">
        {/* Top bar */}
        <div className="flex items-center justify-between">
          <Link
            href="/admin/case-studies"
            className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 hover:text-teal-700 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Case Management</span>
          </Link>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => handleSubmit('draft')}
              disabled={isSubmitting}
              className="inline-flex items-center gap-1.5 px-4 py-2 border border-slate-300 hover:bg-slate-100 text-slate-700 rounded-xl text-xs font-semibold transition"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Save as Draft</span>
            </button>
            <button
              type="button"
              onClick={() => handleSubmit('published')}
              disabled={isSubmitting}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-teal-700 hover:bg-teal-800 text-white rounded-xl text-xs font-bold shadow-xs transition"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Publishing...</span>
                </>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" />
                  <span>Publish Case Study</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Form Container */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider bg-teal-100 text-teal-800 px-2 py-0.5 rounded-full">
              Authoring Workspace
            </span>
            <h2 className="text-xl font-extrabold text-slate-900 mt-1">
              Create Clinical Case Study
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Draft educational content, clinical vignettes, and learning outcomes for peer discussion.
            </p>
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl font-medium">
              {error}
            </div>
          )}

          {/* Title */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Case Study Title *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Illustrative Cardiology Case Study"
              className="w-full px-3.5 py-2.5 text-sm bg-slate-50 focus:bg-white border border-slate-200 rounded-xl focus:border-teal-500 focus:outline-none transition text-slate-900 font-semibold"
            />
          </div>

          {/* Specialty Assignment */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Assign Clinical Specialties (Multi-Select) *
            </label>
            <div className="flex flex-wrap gap-1.5 p-3 bg-slate-50 rounded-xl border border-slate-200">
              {specialties.map((s) => {
                const isSelected = selectedSpecialties.includes(s.id);
                return (
                  <SpecialtyBadge
                    key={s.id}
                    id={s.id}
                    name={s.name}
                    size="md"
                    active={isSelected}
                    onClick={() => toggleSpecialty(s.id)}
                  />
                );
              })}
            </div>
            {selectedSpecialties.length === 0 && (
              <p className="text-[11px] text-amber-600 mt-1">Select at least one specialty.</p>
            )}
          </div>

          {/* Short Summary */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Short Educational Summary *
            </label>
            <textarea
              value={shortSummary}
              onChange={(e) => setShortSummary(e.target.value)}
              rows={2}
              placeholder="A brief 1-2 sentence overview of the presentation, key clinical challenge, and core learning takeaway..."
              className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-slate-50 focus:bg-white border border-slate-200 rounded-xl focus:border-teal-500 focus:outline-none transition text-slate-900"
            />
          </div>

          {/* Educational Content */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Full Educational Content (Markdown Supported) *
            </label>
            <p className="text-[11px] text-slate-500 mb-2">
              Structure into: ### Clinical Presentation, ### Diagnostic Evaluation, ### Management & Clinical Decision-Making, ### Outcome & Teaching Pearls.
            </p>
            <textarea
              value={educationalContent}
              onChange={(e) => setEducationalContent(e.target.value)}
              rows={12}
              placeholder="### Clinical Presentation&#10;An illustrative 68-year-old patient presents with...&#10;&#10;### Diagnostic Evaluation&#10;- ECG: ...&#10;- Laboratory Findings: ...&#10;&#10;### Management & Clinical Decision-Making&#10;The cardiology care team decided...&#10;&#10;### Outcome & Teaching Pearls&#10;The patient showed improvement after..."
              className="w-full px-3.5 py-2.5 font-mono text-xs bg-slate-50 focus:bg-white border border-slate-200 rounded-xl focus:border-teal-500 focus:outline-none transition text-slate-900"
            />
          </div>

          {/* Learning Objectives */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Learning Objectives
            </label>
            <div className="space-y-2 mb-3">
              {learningObjectives.map((obj, i) => (
                <div key={i} className="flex items-center justify-between gap-2 p-2 bg-slate-50 rounded-lg border border-slate-200 text-xs">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-teal-600 flex-shrink-0" />
                    <span>{obj}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveObjective(i)}
                    className="text-slate-400 hover:text-red-600 p-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                value={newObjective}
                onChange={(e) => setNewObjective(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddObjective();
                  }
                }}
                placeholder="Add another learning objective..."
                className="flex-1 px-3 py-1.5 text-xs bg-slate-50 focus:bg-white border border-slate-200 rounded-lg focus:outline-none"
              />
              <button
                type="button"
                onClick={handleAddObjective}
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                Add
              </button>
            </div>
          </div>

          {/* Source References */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Source References & Guidelines
            </label>
            <div className="space-y-2 mb-3">
              {sourceReferences.map((ref, i) => (
                <div key={i} className="flex items-center justify-between gap-2 p-2 bg-slate-50 rounded-lg border border-slate-200 text-xs">
                  <span>{ref}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveReference(i)}
                    className="text-slate-400 hover:text-red-600 p-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                value={newReference}
                onChange={(e) => setNewReference(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddReference();
                  }
                }}
                placeholder="Add guideline citation (e.g. ACC/AHA Guideline 2024)..."
                className="flex-1 px-3 py-1.5 text-xs bg-slate-50 focus:bg-white border border-slate-200 rounded-lg focus:outline-none"
              />
              <button
                type="button"
                onClick={handleAddReference}
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                Add
              </button>
            </div>
          </div>

          {/* Bottom Actions */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
            <Link
              href="/admin/case-studies"
              className="px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-semibold transition"
            >
              Cancel
            </Link>
            <button
              type="button"
              onClick={() => handleSubmit('draft')}
              disabled={isSubmitting}
              className="px-4 py-2 border border-slate-300 hover:bg-slate-100 text-slate-700 rounded-xl text-xs font-semibold transition"
            >
              Save as Draft
            </button>
            <button
              type="button"
              onClick={() => handleSubmit('published')}
              disabled={isSubmitting}
              className="px-5 py-2 bg-teal-700 hover:bg-teal-800 text-white rounded-xl text-xs font-bold shadow-xs transition"
            >
              Publish Now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
