'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { useApp } from '@/lib/context';
import { CaseStudy } from '@/types';
import { CaseStudyCard } from '@/components/case-study-card';
import { LeftSidebar } from '@/components/left-sidebar';
import { SpecialtyBadge } from '@/components/specialty-badge';
import {
  BookOpen,
  Search,
  Filter,
  ShieldCheck,
  RefreshCw,
  Loader2,
  AlertCircle,
  PlusCircle,
} from 'lucide-react';

export default function CaseStudiesPage() {
  const { specialties, currentUser } = useApp();
  const [caseStudies, setCaseStudies] = useState<CaseStudy[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSpecialties, setSelectedSpecialties] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  const isAdmin = Boolean(currentUser?.is_admin || currentUser?.role === 'admin');

  const fetchCaseStudies = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (selectedSpecialties.length > 0) {
        params.set('specialty', selectedSpecialties.join(','));
      }
      if (searchQuery.trim().length > 0) {
        params.set('search', searchQuery.trim());
      }
      // Public users NEVER include drafts/archived
      params.set('includeDrafts', 'false');

      const res = await fetch(`/api/case-studies?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setCaseStudies(data.caseStudies || []);
      } else {
        throw new Error('Failed to load published case studies');
      }
    } catch (e: any) {
      setError(e.message || 'Error fetching case studies');
    } finally {
      setIsLoading(false);
    }
  }, [selectedSpecialties, searchQuery]);

  useEffect(() => {
    fetchCaseStudies();
  }, [fetchCaseStudies]);

  const toggleSpecialtyFilter = (specialtyId: string) => {
    setSelectedSpecialties((prev) =>
      prev.includes(specialtyId)
        ? prev.filter((id) => id !== specialtyId)
        : [...prev, specialtyId]
    );
  };

  const clearFilters = () => {
    setSelectedSpecialties([]);
    setSearchQuery('');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Navigation Sidebar */}
        <div className="hidden lg:block lg:col-span-3">
          <LeftSidebar />
        </div>

        {/* Main Content Column */}
        <div className="lg:col-span-9 space-y-6">
          {/* Page Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="p-2 rounded-xl bg-teal-100 text-teal-800">
              <BookOpen className="w-5 h-5" />
            </span>
            <span className="text-xs font-bold uppercase tracking-wider text-teal-700 bg-teal-50 px-2.5 py-0.5 rounded-full border border-teal-200">
              Clinical Case Repository
            </span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Peer-Reviewed Clinical Case Studies
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-2xl leading-relaxed">
            Illustrative clinical case presentations, diagnostic dilemmas, and evidence-based management
            rationales for healthcare professionals and medical trainees.
          </p>
        </div>

        {isAdmin && (
          <div className="flex-shrink-0">
            <Link
              href="/admin/case-studies/new"
              className="inline-flex items-center gap-2 px-4 py-2 bg-teal-700 hover:bg-teal-800 text-white rounded-xl text-xs font-bold shadow-xs transition"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Publish New Case Study (Admin)</span>
            </Link>
          </div>
        )}
      </div>

      {/* Search and Filters Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
        {/* Search input */}
        <div className="relative">
          <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search case studies by condition, drug, author, or keyword (e.g., 'Cardiology', 'Troponin', 'Stent', 'Colitis')..."
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 focus:bg-white text-xs sm:text-sm border border-slate-200 rounded-xl focus:border-teal-500 focus:outline-none transition text-slate-900 placeholder:text-slate-400"
          />
        </div>

        {/* Multi-Select Specialty Tag Catalogue */}
        <div>
          <div className="flex items-center justify-between gap-2 mb-2">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
              <Filter className="w-3.5 h-3.5 text-teal-600" />
              <span>Filter by Clinical Specialty (Multi-select)</span>
              {selectedSpecialties.length > 0 && (
                <span className="ml-1 px-1.5 py-0.2 bg-teal-100 text-teal-800 text-[10px] font-bold rounded-full">
                  {selectedSpecialties.length} active
                </span>
              )}
            </div>

            {(selectedSpecialties.length > 0 || searchQuery) && (
              <button
                onClick={clearFilters}
                className="text-xs font-semibold text-teal-700 hover:underline"
              >
                Clear all filters
              </button>
            )}
          </div>

          <div className="flex flex-wrap gap-1.5">
            {specialties.map((s) => {
              const isSelected = selectedSpecialties.includes(s.id);
              return (
                <SpecialtyBadge
                  key={s.id}
                  id={s.id}
                  name={s.name}
                  size="md"
                  active={isSelected}
                  onClick={() => toggleSpecialtyFilter(s.id)}
                />
              );
            })}
          </div>
        </div>
      </div>

      {/* Case Studies Grid or State */}
      {isLoading ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-16 text-center">
          <Loader2 className="w-8 h-8 text-teal-600 animate-spin mx-auto mb-2" />
          <p className="text-xs text-slate-500 font-medium">
            Filtering published educational case studies...
          </p>
        </div>
      ) : error ? (
        <div className="bg-white rounded-2xl border border-red-200 p-8 text-center text-red-600">
          <AlertCircle className="w-6 h-6 mx-auto mb-2" />
          <p className="text-xs font-semibold">{error}</p>
          <button
            onClick={fetchCaseStudies}
            className="mt-3 px-3 py-1.5 text-xs bg-slate-100 rounded-lg text-slate-700 inline-flex items-center gap-1.5"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Retry
          </button>
        </div>
      ) : caseStudies.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-3">
          <BookOpen className="w-10 h-10 text-slate-400 mx-auto" />
          <h3 className="text-base font-bold text-slate-800">
            No Published Case Studies Match Your Filters
          </h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
            There are currently no published educational cases matching{' '}
            {selectedSpecialties.length > 0 ? (
              <span className="font-semibold text-slate-700">
                "{selectedSpecialties.join(', ')}"
              </span>
            ) : (
              'your search criteria'
            )}
            . Note that internal drafts and archived cases remain private to administrators.
          </p>
          <button
            onClick={clearFilters}
            className="mt-2 px-4 py-2 bg-teal-700 hover:bg-teal-800 text-white rounded-xl text-xs font-semibold shadow-xs transition"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div>
          <div className="flex items-center justify-between text-xs text-slate-500 mb-3 px-1">
            <span>
              Showing <strong className="text-slate-800">{caseStudies.length}</strong> published educational case {caseStudies.length === 1 ? 'study' : 'studies'}
            </span>
            <span className="text-[11px] text-teal-700 font-medium">
              Verified for peer clinical review
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {caseStudies.map((caseStudy) => (
              <CaseStudyCard
                key={caseStudy.id}
                caseStudy={caseStudy}
                onSpecialtyClick={(id) => toggleSpecialtyFilter(id)}
              />
            ))}
          </div>
        </div>
      )}
        </div>
      </div>
    </div>
  );
}
