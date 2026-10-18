'use client';

import React, { useEffect, useState } from 'react';
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
  Eye,
  Loader2,
  Archive,
} from 'lucide-react';
import { CaseStudy, CaseStudyStatus } from '@/types';

export default function EditCaseStudyPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { currentUser, specialties } = useApp();

  const [caseStudy, setCaseStudy] = useState<CaseStudy | null>(null);
  const [title, setTitle] = useState('');
  const [shortSummary, setShortSummary] = useState('');
  const [educationalContent, setEducationalContent] = useState('');
  const [learningObjectives, setLearningObjectives] = useState<string[]>([]);
  const [newObjective, setNewObjective] = useState('');
  const [sourceReferences, setSourceReferences] = useState<string[]>([]);
  const [newReference, setNewReference] = useState('');
  const [selectedSpecialties, setSelectedSpecialties] = useState<string[]>([]);
  const [status, setStatus] = useState<CaseStudyStatus>('published');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      setIsLoading(true);
      try {
        const res = await fetch(`/api/case-studies/${params.id}`);
        if (!res.ok) throw new Error('Case study not found');
        const data = await res.json();
        const cs: CaseStudy = data.caseStudy;
        setCaseStudy(cs);
        setTitle(cs.title);
        setShortSummary(cs.short_summary);
        setEducationalContent(cs.educational_content);
        setLearningObjectives(cs.learning_objectives || []);
        setSourceReferences(cs.source_references || []);
        setSelectedSpecialties(cs.specialties?.map((s) => s.id) || []);
        setStatus(cs.status);
      } catch (e: any) {
        setError(e.message);
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, [params.id]);

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

  const handleSave = async (newStatus?: CaseStudyStatus) => {
    const targetStatus = newStatus || status;
    if (!title.trim() || !shortSummary.trim() || !educationalContent.trim()) {
      setError('Please fill in title, short summary, and educational content.');
      return;
    }
    if (selectedSpecialties.length === 0) {
      setError('Please assign at least one clinical specialty tag.');
      return;
    }

    setIsSubmitting(true);
    setError(null);
    setSuccessMsg(null);

    try {
      const res = await fetch(`/api/case-studies/${params.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title.trim(),
          short_summary: shortSummary.trim(),
          educational_content: educationalContent.trim(),
          learning_objectives: learningObjectives,
          source_references: sourceReferences,
          specialty_ids: selectedSpecialties,
          status: targetStatus,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to update case study');
      }

      setStatus(targetStatus);
      setSuccessMsg(`Case study updated successfully (Status: ${targetStatus}).`);
      setTimeout(() => setSuccessMsg(null), 3500);
    } catch (err: any) {
      setError(err.message || 'An error occurred while saving.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <AdminNav />
        <div className="max-w-4xl mx-auto px-4 py-16 text-center">
          <Loader2 className="w-8 h-8 text-teal-600 animate-spin mx-auto mb-2" />
          <p className="text-xs text-slate-500">Loading case study for editing...</p>
        </div>
      </div>
    );
  }

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
            <Link
              href={`/case-studies/${params.id}`}
              className="inline-flex items-center gap-1.5 px-3 py-2 border border-slate-300 hover:bg-slate-100 text-slate-700 rounded-xl text-xs font-semibold transition"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Preview User Experience</span>
            </Link>

            <button
              type="button"
              onClick={() => handleSave(status === 'published' ? 'published' : 'draft')}
              disabled={isSubmitting}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-teal-700 hover:bg-teal-800 text-white rounded-xl text-xs font-bold shadow-xs transition"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Save className="w-3.5 h-3.5" />
                  <span>Save Changes</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Edit Form */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider bg-teal-100 text-teal-800 px-2 py-0.5 rounded-full">
                Editing Mode
              </span>
              <h2 className="text-xl font-extrabold text-slate-900 mt-1">
                Edit Case Study
              </h2>
            </div>

            {/* Status Selector */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-600">Status:</span>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as CaseStudyStatus)}
                className="text-xs font-bold bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-slate-800 focus:outline-none"
              >
                <option value="draft">Draft (Admin Only)</option>
                <option value="published">Published (Public Feed)</option>
                <option value="archived">Archived (Hidden)</option>
              </select>
            </div>
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl font-medium">
              {error}
            </div>
          )}

          {successMsg && (
            <div className="p-3 bg-teal-50 border border-teal-200 text-teal-800 text-xs rounded-xl font-medium flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-teal-600" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Title */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Title *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3.5 py-2.5 text-sm bg-slate-50 focus:bg-white border border-slate-200 rounded-xl focus:border-teal-500 focus:outline-none transition text-slate-900 font-semibold"
            />
          </div>

          {/* Specialty Assignment */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Clinical Specialties *
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
              className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-slate-50 focus:bg-white border border-slate-200 rounded-xl focus:border-teal-500 focus:outline-none transition text-slate-900"
            />
          </div>

          {/* Educational Content */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Educational Clinical Content *
            </label>
            <textarea
              value={educationalContent}
              onChange={(e) => setEducationalContent(e.target.value)}
              rows={12}
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
                  <span>{obj}</span>
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
                placeholder="Add learning objective..."
                className="flex-1 px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none"
              />
              <button
                type="button"
                onClick={handleAddObjective}
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold"
              >
                Add
              </button>
            </div>
          </div>

          {/* Bottom controls */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
            <button
              type="button"
              onClick={() => handleSave(status === 'published' ? 'archived' : 'published')}
              className="text-xs font-semibold text-slate-600 hover:text-slate-900 underline"
            >
              {status === 'published' ? 'Archive Case' : 'Publish to Feed'}
            </button>

            <button
              type="button"
              onClick={() => handleSave()}
              disabled={isSubmitting}
              className="px-5 py-2 bg-teal-700 hover:bg-teal-800 text-white rounded-xl text-xs font-bold shadow-xs transition"
            >
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
