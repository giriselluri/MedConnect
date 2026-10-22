'use client';

import React, { useState, useEffect, Suspense, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useApp } from '@/lib/context';
import { Profile, CaseStudy, Post, Group } from '@/types';
import { LeftSidebar } from '@/components/left-sidebar';
import { CaseStudyCard } from '@/components/case-study-card';
import { PostCard } from '@/components/post-card';
import { SpecialtyBadge } from '@/components/specialty-badge';
import { SearchableSpecialtyFilter } from '@/components/searchable-specialty-filter';
import {
  Search,
  Users,
  BookOpen,
  MessageSquare,
  Compass,
  Filter,
  X,
  Loader2,
  Building2,
  MapPin,
  ExternalLink,
  Sparkles,
} from 'lucide-react';

function SearchPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { specialties, currentUser } = useApp();

  const initialQuery = searchParams.get('q') || searchParams.get('search') || '';
  const initialSpecialty = searchParams.get('specialty') || '';
  const initialTab = searchParams.get('type') || 'all';

  const [query, setQuery] = useState(initialQuery);
  const [selectedSpecialty, setSelectedSpecialty] = useState(initialSpecialty);
  const [activeTab, setActiveTab] = useState<'all' | 'profiles' | 'case_studies' | 'posts' | 'groups'>(
    (initialTab as any) || 'all'
  );

  const [results, setResults] = useState<{
    profiles: Profile[];
    caseStudies: CaseStudy[];
    posts: Post[];
    groups: Group[];
    total: number;
  }>({
    profiles: [],
    caseStudies: [],
    posts: [],
    groups: [],
    total: 0,
  });

  const [isLoading, setIsLoading] = useState(false);

  // Sync state when URL params change
  useEffect(() => {
    const q = searchParams.get('q') || searchParams.get('search') || '';
    const s = searchParams.get('specialty') || '';
    const t = searchParams.get('type') || 'all';
    setQuery(q);
    setSelectedSpecialty(s);
    setActiveTab(t as any);
  }, [searchParams]);

  const executeSearch = useCallback(async (q: string, spec: string, tab: string) => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (q.trim()) params.set('q', q.trim());
      if (spec) params.set('specialty', spec);
      if (tab && tab !== 'all') params.set('type', tab);

      const res = await fetch(`/api/search?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setResults({
          profiles: data.profiles || [],
          caseStudies: data.caseStudies || [],
          posts: data.posts || [],
          groups: data.groups || [],
          total: data.total || 0,
        });
      }
    } catch (e) {
      console.error('Search error:', e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    executeSearch(query, selectedSpecialty, activeTab);
  }, [query, selectedSpecialty, activeTab, executeSearch]);

  const updateUrl = (newQuery: string, newSpecialty: string, newTab: string) => {
    const params = new URLSearchParams();
    if (newQuery.trim()) params.set('q', newQuery.trim());
    if (newSpecialty) params.set('specialty', newSpecialty);
    if (newTab && newTab !== 'all') params.set('type', newTab);
    router.replace(`/search?${params.toString()}`);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateUrl(query, selectedSpecialty, activeTab);
    executeSearch(query, selectedSpecialty, activeTab);
  };

  const handleSpecialtyChange = (specId: string) => {
    setSelectedSpecialty(specId);
    updateUrl(query, specId, activeTab);
  };

  const handleTabChange = (tab: 'all' | 'profiles' | 'case_studies' | 'posts' | 'groups') => {
    setActiveTab(tab);
    updateUrl(query, selectedSpecialty, tab);
  };

  const clearAllFilters = () => {
    setQuery('');
    setSelectedSpecialty('');
    updateUrl('', '', activeTab);
  };

  const hasActiveFilters = Boolean(query.trim() || selectedSpecialty);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Navigation Sidebar */}
        <div className="hidden lg:block lg:col-span-3">
          <LeftSidebar />
        </div>

        {/* Main Search Column */}
        <div className="lg:col-span-9 space-y-6">
          {/* Header & Search Bar */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="p-2 rounded-xl bg-teal-100 text-teal-800">
                  <Search className="w-5 h-5" />
                </span>
                <span className="text-xs font-bold uppercase tracking-wider text-teal-700 bg-teal-50 px-2.5 py-0.5 rounded-full border border-teal-200">
                  Global Discovery
                </span>
              </div>
              <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                Search MedConnect AI
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                Search across attending doctors, peer-reviewed clinical cases, scientific discussions, and medical communities.
              </p>
            </div>

            {/* Search Input Bar & Specialty Selector */}
            <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-2.5">
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search doctors, clinical topics, trial titles, or keywords..."
                  className="w-full pl-10 pr-9 py-2.5 bg-slate-50 focus:bg-white text-xs sm:text-sm border border-slate-200 rounded-xl focus:border-teal-500 focus:outline-none transition text-slate-900 placeholder:text-slate-400 font-medium"
                />
                {query && (
                  <button
                    type="button"
                    onClick={() => {
                      setQuery('');
                      updateUrl('', selectedSpecialty, activeTab);
                    }}
                    className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Searchable Specialty Filter */}
              <SearchableSpecialtyFilter
                specialties={specialties}
                selectedSpecialtyId={selectedSpecialty}
                onSelectSpecialty={handleSpecialtyChange}
                placeholder="All Specialties"
                className="flex-shrink-0"
              />

              <button
                type="submit"
                className="px-5 py-2.5 bg-teal-700 hover:bg-teal-800 text-white rounded-xl text-xs sm:text-sm font-bold shadow-xs transition flex-shrink-0"
              >
                Search
              </button>
            </form>

            {/* Active Filter Pills */}
            {hasActiveFilters && (
              <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100 text-xs">
                <span className="text-slate-400 font-medium">Active filters:</span>
                {query.trim() && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-slate-100 text-slate-800 rounded-lg text-xs font-semibold">
                    <span>Query: &quot;{query}&quot;</span>
                    <button
                      type="button"
                      onClick={() => {
                        setQuery('');
                        updateUrl('', selectedSpecialty, activeTab);
                      }}
                      className="text-slate-400 hover:text-slate-700"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}
                {selectedSpecialty && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-teal-50 border border-teal-200 text-teal-800 rounded-lg text-xs font-semibold">
                    <span>
                      Specialty: {specialties.find((s) => s.id === selectedSpecialty)?.name || selectedSpecialty}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleSpecialtyChange('')}
                      className="text-teal-600 hover:text-teal-900"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}
                <button
                  type="button"
                  onClick={clearAllFilters}
                  className="text-teal-700 hover:underline font-semibold ml-auto"
                >
                  Clear all
                </button>
              </div>
            )}
          </div>

          {/* Navigation Category Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 border-b border-slate-200 text-xs font-semibold">
            {[
              { id: 'all', label: 'All Results', count: results.total, icon: Sparkles },
              { id: 'profiles', label: 'Colleagues', count: results.profiles.length, icon: Users },
              { id: 'case_studies', label: 'Case Studies', count: results.caseStudies.length, icon: BookOpen },
              { id: 'posts', label: 'Discussions', count: results.posts.length, icon: MessageSquare },
              { id: 'groups', label: 'Communities', count: results.groups.length, icon: Compass },
            ].map((tab) => {
              const Icon = tab.icon;
              const isSelected = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => handleTabChange(tab.id as any)}
                  className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl transition whitespace-nowrap ${
                    isSelected
                      ? 'bg-teal-700 text-white shadow-xs font-bold'
                      : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                  <span
                    className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                      isSelected ? 'bg-teal-800 text-white' : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {tab.count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Results Area */}
          {isLoading ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-16 text-center">
              <Loader2 className="w-8 h-8 text-teal-600 animate-spin mx-auto mb-2" />
              <p className="text-xs text-slate-500 font-medium">Searching clinical evidence and colleagues...</p>
            </div>
          ) : results.total === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                <Search className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-base">No results found</h3>
                <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
                  We couldn&apos;t find any matches for your query. Try broadening your terms or clear the specialty filter.
                </p>
              </div>

              {/* Suggestions */}
              <div className="pt-2">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                  Try searching for:
                </p>
                <div className="flex flex-wrap justify-center gap-1.5">
                  {['Cardiology', 'Oncology', 'Neurology', 'Troponin', 'Dr. Jenkins', 'Dr. Marcus Chen', 'Echocardiogram'].map(
                    (sugg) => (
                      <button
                        key={sugg}
                        type="button"
                        onClick={() => {
                          setQuery(sugg);
                          updateUrl(sugg, selectedSpecialty, activeTab);
                        }}
                        className="px-3 py-1 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 transition"
                      >
                        {sugg}
                      </button>
                    )
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* SECTION: Healthcare Professionals / Colleagues */}
              {(activeTab === 'all' || activeTab === 'profiles') && results.profiles.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h2 className="text-sm font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
                      <Users className="w-4 h-4 text-teal-600" />
                      <span>Healthcare Professionals ({results.profiles.length})</span>
                    </h2>
                    {activeTab === 'all' && results.profiles.length > 3 && (
                      <button
                        onClick={() => handleTabChange('profiles')}
                        className="text-xs font-semibold text-teal-700 hover:underline"
                      >
                        View all colleagues →
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {(activeTab === 'all' ? results.profiles.slice(0, 4) : results.profiles).map((p) => (
                      <div
                        key={p.id}
                        className="p-4 bg-white rounded-xl border border-slate-200 hover:border-teal-300 transition flex items-start gap-3 shadow-xs"
                      >
                        <Link href={`/profile/${p.id}`} className="flex-shrink-0">
                          <img
                            src={
                              p.avatar_url ||
                              `https://ui-avatars.com/api/?name=${encodeURIComponent(p.full_name)}&background=0d9488&color=fff&bold=true`
                            }
                            alt={p.full_name}
                            className="w-12 h-12 rounded-full object-cover border border-slate-200"
                          />
                        </Link>
                        <div className="min-w-0 flex-1">
                          <Link href={`/profile/${p.id}`}>
                            <h3 className="font-bold text-slate-900 hover:text-teal-700 text-sm truncate">
                              {p.full_name}
                            </h3>
                          </Link>
                          <p className="text-xs text-slate-600 truncate">{p.title}</p>
                          {p.institution && (
                            <p className="text-[11px] text-teal-700 font-medium truncate flex items-center gap-1 mt-0.5">
                              <Building2 className="w-3 h-3 text-slate-400 flex-shrink-0" />
                              <span className="truncate">{p.institution}</span>
                            </p>
                          )}
                          <div className="flex flex-wrap gap-1 mt-2">
                            {p.specialties?.slice(0, 2).map((s) => (
                              <SpecialtyBadge key={s.id} id={s.id} name={s.name} size="sm" />
                            ))}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* SECTION: Published Case Studies */}
              {(activeTab === 'all' || activeTab === 'case_studies') && results.caseStudies.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h2 className="text-sm font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
                      <BookOpen className="w-4 h-4 text-teal-600" />
                      <span>Clinical Case Studies ({results.caseStudies.length})</span>
                    </h2>
                    {activeTab === 'all' && results.caseStudies.length > 2 && (
                      <button
                        onClick={() => handleTabChange('case_studies')}
                        className="text-xs font-semibold text-teal-700 hover:underline"
                      >
                        View all case studies →
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {(activeTab === 'all' ? results.caseStudies.slice(0, 4) : results.caseStudies).map((cs) => (
                      <CaseStudyCard
                        key={cs.id}
                        caseStudy={cs}
                        onSpecialtyClick={(id) => handleSpecialtyChange(id)}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* SECTION: Posts & Peer Discussions */}
              {(activeTab === 'all' || activeTab === 'posts') && results.posts.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h2 className="text-sm font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
                      <MessageSquare className="w-4 h-4 text-teal-600" />
                      <span>Scientific Discussions ({results.posts.length})</span>
                    </h2>
                    {activeTab === 'all' && results.posts.length > 3 && (
                      <button
                        onClick={() => handleTabChange('posts')}
                        className="text-xs font-semibold text-teal-700 hover:underline"
                      >
                        View all discussions →
                      </button>
                    )}
                  </div>

                  <div className="space-y-3">
                    {(activeTab === 'all' ? results.posts.slice(0, 3) : results.posts).map((p) => (
                      <PostCard key={p.id} post={p} />
                    ))}
                  </div>
                </div>
              )}

              {/* SECTION: Medical Communities */}
              {(activeTab === 'all' || activeTab === 'groups') && results.groups.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h2 className="text-sm font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
                      <Compass className="w-4 h-4 text-teal-600" />
                      <span>Specialty Communities ({results.groups.length})</span>
                    </h2>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {results.groups.map((g) => (
                      <div
                        key={g.id}
                        className="p-4 bg-white rounded-xl border border-slate-200 hover:border-teal-300 transition shadow-xs flex items-center justify-between gap-3"
                      >
                        <div className="min-w-0">
                          <Link href={`/communities/${g.slug}`}>
                            <h3 className="font-bold text-slate-900 hover:text-teal-700 text-sm truncate">
                              {g.name}
                            </h3>
                          </Link>
                          <p className="text-xs text-slate-500 line-clamp-1 mt-0.5">{g.description}</p>
                          <p className="text-[10px] text-teal-700 font-bold uppercase tracking-wider mt-1.5">
                            {g.members_count} members • {g.specialty?.name || 'General'}
                          </p>
                        </div>
                        <Link
                          href={`/communities/${g.slug}`}
                          className="px-3 py-1.5 bg-teal-50 hover:bg-teal-100 text-teal-800 text-xs font-bold rounded-lg transition flex-shrink-0"
                        >
                          View
                        </Link>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense
      fallback={
        <div className="p-16 text-center">
          <Loader2 className="w-8 h-8 text-teal-600 animate-spin mx-auto mb-2" />
          <p className="text-xs text-slate-500 font-medium">Loading search...</p>
        </div>
      }
    >
      <SearchPageContent />
    </Suspense>
  );
}
