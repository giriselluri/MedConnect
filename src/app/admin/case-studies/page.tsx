'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { useApp } from '@/lib/context';
import { AdminNav } from '@/components/admin-nav';
import { CaseStudy, CaseStudyStatus } from '@/types';
import { SpecialtyBadge } from '@/components/specialty-badge';
import {
  BookOpen,
  PlusCircle,
  Search,
  Filter,
  Eye,
  Edit,
  Trash2,
  CheckCircle2,
  Clock,
  Archive,
  RefreshCw,
  Loader2,
  ExternalLink,
} from 'lucide-react';

export default function AdminCaseStudiesPage() {
  const { currentUser, specialties, switchUser } = useApp();
  const [caseStudies, setCaseStudies] = useState<CaseStudy[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [error, setError] = useState<string | null>(null);

  const isAdmin = Boolean(currentUser?.is_admin || currentUser?.role === 'admin');

  const fetchCases = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      params.set('includeDrafts', 'true');
      if (selectedSpecialty) params.set('specialty', selectedSpecialty);
      if (search) params.set('search', search);

      const res = await fetch(`/api/case-studies?${params.toString()}`);
      if (!res.ok) throw new Error('Failed to load case studies');
      const data = await res.json();

      let list: CaseStudy[] = data.caseStudies || [];
      if (statusFilter !== 'all') {
        list = list.filter((c) => c.status === statusFilter);
      }
      setCaseStudies(list);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setIsLoading(false);
    }
  }, [selectedSpecialty, search, statusFilter]);

  useEffect(() => {
    if (isAdmin) {
      fetchCases();
    }
  }, [isAdmin, fetchCases]);

  const handleStatusChange = async (id: string, newStatus: CaseStudyStatus) => {
    try {
      const res = await fetch(`/api/case-studies/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        await fetchCases();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to permanently delete this case study?')) return;
    try {
      const res = await fetch(`/api/case-studies/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setCaseStudies((prev) => prev.filter((c) => c.id !== id));
      }
    } catch (e) {
      console.error(e);
    }
  };

  if (!isAdmin) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center space-y-4">
        <h2 className="text-xl font-bold text-slate-900">Admin Permissions Required</h2>
        <p className="text-xs text-slate-500">
          Case study management requires administrative rights.
        </p>
        <button
          onClick={() => switchUser('00000000-0000-0000-0000-000000000001')}
          className="px-4 py-2 bg-amber-600 text-white rounded-xl text-xs font-bold"
        >
          Switch to Dr. Sarah Jenkins (Admin)
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <AdminNav />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Header Bar */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-teal-100 text-teal-800">
                <BookOpen className="w-5 h-5" />
              </span>
              <h2 className="text-xl font-extrabold text-slate-900">
                Case Study Management
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Curate, author, edit, tag, publish, and archive clinical case studies across the network.
            </p>
          </div>

          <Link
            href="/admin/case-studies/new"
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold rounded-xl shadow-xs transition"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Create New Case Study</span>
          </Link>
        </div>

        {/* Filters Bar */}
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex flex-wrap items-center gap-2 flex-1 min-w-[280px]">
            {/* Search */}
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Filter by title or keyword..."
                className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-none focus:border-teal-500"
              />
            </div>

            {/* Specialty filter */}
            <select
              value={selectedSpecialty}
              onChange={(e) => setSelectedSpecialty(e.target.value)}
              className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700 focus:outline-none"
            >
              <option value="">All Specialties</option>
              {specialties.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>

            {/* Status filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700 focus:outline-none font-medium"
            >
              <option value="all">All Statuses</option>
              <option value="published">Published Only</option>
              <option value="draft">Drafts Only</option>
              <option value="archived">Archived Only</option>
            </select>
          </div>

          <span className="text-slate-400 font-medium">
            {caseStudies.length} {caseStudies.length === 1 ? 'case study' : 'case studies'}
          </span>
        </div>

        {/* Case Studies Table */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          {isLoading ? (
            <div className="p-16 text-center">
              <Loader2 className="w-8 h-8 text-teal-600 animate-spin mx-auto mb-2" />
              <p className="text-xs text-slate-500">Loading case study registry...</p>
            </div>
          ) : caseStudies.length === 0 ? (
            <div className="p-12 text-center space-y-2">
              <BookOpen className="w-8 h-8 text-slate-400 mx-auto" />
              <p className="text-sm font-bold text-slate-700">No case studies found</p>
              <p className="text-xs text-slate-400">
                Click "Create New Case Study" to author and publish a new case.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-600">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="py-3 px-4">Title & Educational Summary</th>
                    <th className="py-3 px-4">Specialties</th>
                    <th className="py-3 px-4">Author</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {caseStudies.map((cs) => {
                    return (
                      <tr key={cs.id} className="hover:bg-slate-50/70 transition">
                        <td className="py-3.5 px-4 max-w-sm">
                          <Link
                            href={`/admin/case-studies/${cs.id}`}
                            className="font-bold text-slate-900 hover:text-teal-700 text-xs line-clamp-1"
                          >
                            {cs.title}
                          </Link>
                          <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                            {cs.short_summary}
                          </p>
                        </td>

                        <td className="py-3.5 px-4">
                          <div className="flex flex-wrap gap-1 max-w-xs">
                            {cs.specialties?.map((s) => (
                              <SpecialtyBadge key={s.id} id={s.id} name={s.name} size="sm" />
                            ))}
                          </div>
                        </td>

                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <span className="font-semibold text-slate-800 block text-xs">
                            {cs.author_name}
                          </span>
                          <span className="text-[10px] text-slate-400">{cs.author_title}</span>
                        </td>

                        <td className="py-3.5 px-4 whitespace-nowrap">
                          {cs.status === 'published' && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-teal-100 text-teal-800">
                              <CheckCircle2 className="w-3 h-3 text-teal-600" />
                              Published
                            </span>
                          )}
                          {cs.status === 'draft' && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-amber-100 text-amber-800">
                              <Clock className="w-3 h-3 text-amber-600" />
                              Draft
                            </span>
                          )}
                          {cs.status === 'archived' && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-slate-100 text-slate-600">
                              <Archive className="w-3 h-3 text-slate-500" />
                              Archived
                            </span>
                          )}
                        </td>

                        <td className="py-3.5 px-4 text-right whitespace-nowrap">
                          <div className="inline-flex items-center gap-1.5">
                            {/* Preview user view */}
                            {cs.status === 'published' && (
                              <Link
                                href={`/case-studies/${cs.id}`}
                                className="p-1.5 text-slate-500 hover:text-teal-700 hover:bg-slate-100 rounded-lg transition"
                                title="Preview published patient experience"
                              >
                                <Eye className="w-4 h-4" />
                              </Link>
                            )}

                            {/* Edit */}
                            <Link
                              href={`/admin/case-studies/${cs.id}`}
                              className="p-1.5 text-slate-500 hover:text-blue-700 hover:bg-slate-100 rounded-lg transition"
                              title="Edit Case Study"
                            >
                              <Edit className="w-4 h-4" />
                            </Link>

                            {/* Quick status toggles */}
                            {cs.status !== 'published' ? (
                              <button
                                onClick={() => handleStatusChange(cs.id, 'published')}
                                className="px-2 py-1 bg-teal-50 text-teal-800 hover:bg-teal-100 rounded font-semibold text-[11px]"
                              >
                                Publish
                              </button>
                            ) : (
                              <button
                                onClick={() => handleStatusChange(cs.id, 'archived')}
                                className="px-2 py-1 bg-slate-100 text-slate-600 hover:bg-slate-200 rounded font-semibold text-[11px]"
                              >
                                Archive
                              </button>
                            )}

                            {/* Delete */}
                            <button
                              onClick={() => handleDelete(cs.id)}
                              className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                              title="Delete case study"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
