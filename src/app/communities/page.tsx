'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useApp } from '@/lib/context';
import { Group } from '@/types';
import { SpecialtyBadge } from '@/components/specialty-badge';
import { LeftSidebar } from '@/components/left-sidebar';
import {
  Compass,
  Users,
  Search,
  Check,
  UserPlus,
  ArrowRight,
  Loader2,
  Plus,
  X,
  AlertCircle,
} from 'lucide-react';

export default function CommunitiesPage() {
  const { currentUser, specialties } = useApp();
  const [groups, setGroups] = useState<Group[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [togglingId, setTogglingId] = useState<string | null>(null);

  // Create community modal state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [specialtyId, setSpecialtyId] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  const fetchGroups = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/groups');
      if (res.ok) {
        const data = await res.json();
        setGroups(data.groups || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateCommunity = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setCreateError('Community name is required');
      return;
    }
    if (!description.trim()) {
      setCreateError('Community description is required');
      return;
    }

    setIsCreating(true);
    setCreateError(null);
    try {
      const res = await fetch('/api/groups', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          description: description.trim(),
          specialty_id: specialtyId || undefined,
          is_private: isPrivate,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to create community');
      }

      const data = await res.json();
      setGroups((prev) => [data.group, ...prev]);
      setIsCreateModalOpen(false);
      setName('');
      setDescription('');
      setSpecialtyId('');
      setIsPrivate(false);
    } catch (err: any) {
      setCreateError(err.message || 'Failed to create community');
    } finally {
      setIsCreating(false);
    }
  };

  useEffect(() => {
    fetchGroups();
  }, []);

  const handleToggleJoin = async (group: Group, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setTogglingId(group.id);
    try {
      const res = await fetch(`/api/groups/${group.slug}/join`, {
        method: 'POST',
      });
      if (res.ok) {
        const data = await res.json();
        setGroups((prev) =>
          prev.map((g) =>
            g.id === group.id
              ? { ...g, is_member: data.is_member, members_count: data.members_count }
              : g
          )
        );
      }
    } catch (e) {
      console.error(e);
    } finally {
      setTogglingId(null);
    }
  };

  const filteredGroups = groups.filter((g) =>
    g.name.toLowerCase().includes(search.toLowerCase()) ||
    g.description.toLowerCase().includes(search.toLowerCase()) ||
    g.topic_tags?.some((t) => t.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Navigation Sidebar */}
        <div className="hidden lg:block lg:col-span-3">
          <LeftSidebar />
        </div>

        {/* Main Communities Column */}
        <div className="lg:col-span-9 space-y-6">
          {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="p-2 rounded-xl bg-teal-100 text-teal-800">
              <Compass className="w-5 h-5" />
            </span>
            <span className="text-xs font-bold uppercase tracking-wider text-teal-700 bg-teal-50 px-2.5 py-0.5 rounded-full border border-teal-200">
              Departmental Communities
            </span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Specialty Groups & Medical Circles
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-xl">
            Join specialty forums to share specialized patient scenarios, guidelines, and fellowship experiences.
          </p>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search communities..."
              className="w-full pl-8 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-teal-500"
            />
          </div>

          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="flex-shrink-0 inline-flex items-center gap-1.5 px-4 py-2 bg-teal-700 hover:bg-teal-800 text-white rounded-xl text-xs font-bold shadow-xs transition"
          >
            <Plus className="w-4 h-4" />
            <span>Create Community</span>
          </button>
        </div>
      </div>

      {/* Grid */}
      {isLoading ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-16 text-center">
          <Loader2 className="w-8 h-8 text-teal-600 animate-spin mx-auto mb-2" />
          <p className="text-xs text-slate-500">Loading communities...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredGroups.map((group) => {
            const isJoining = togglingId === group.id;
            return (
              <Link
                key={group.id}
                href={`/communities/${group.slug}`}
                className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs hover:border-teal-400 hover:shadow-md transition flex flex-col justify-between group"
              >
                <div>
                  {/* Banner */}
                  <div className="h-28 relative overflow-hidden bg-slate-800">
                    <img
                      src={group.banner_url || 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&q=80&w=800'}
                      alt={group.name}
                      className="w-full h-full object-cover opacity-80 group-hover:scale-105 transition duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent" />
                    <div className="absolute bottom-2.5 left-3.5 right-3.5 flex items-center justify-between text-white">
                      <span className="text-xs font-semibold flex items-center gap-1.5 drop-shadow">
                        <Users className="w-3.5 h-3.5" />
                        {group.members_count.toLocaleString()} Members
                      </span>
                      {group.specialty && (
                        <SpecialtyBadge id={group.specialty.id} name={group.specialty.name} size="sm" />
                      )}
                    </div>
                  </div>

                  {/* Body */}
                  <div className="p-5">
                    <h3 className="font-bold text-slate-900 group-hover:text-teal-700 transition text-base line-clamp-1 leading-snug">
                      {group.name}
                    </h3>
                    <p className="text-xs text-slate-600 mt-2 line-clamp-3 leading-relaxed font-normal">
                      {group.description}
                    </p>

                    {/* Topic Tags */}
                    {group.topic_tags && group.topic_tags.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-3 pt-3 border-t border-slate-100">
                        {group.topic_tags.map((tag) => (
                          <span
                            key={tag}
                            className="text-[10px] font-semibold bg-slate-100 text-slate-600 px-2 py-0.5 rounded"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Footer Join Action */}
                <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-xs font-semibold text-teal-800 group-hover:underline flex items-center gap-1">
                    Open Forum <ArrowRight className="w-3.5 h-3.5" />
                  </span>

                  <button
                    onClick={(e) => handleToggleJoin(group, e)}
                    disabled={isJoining}
                    className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                      group.is_member
                        ? 'bg-teal-100 text-teal-800 border border-teal-300'
                        : 'bg-teal-700 hover:bg-teal-800 text-white shadow-2xs'
                    }`}
                  >
                    {group.is_member ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>Joined</span>
                      </>
                    ) : (
                      <>
                        <UserPlus className="w-3.5 h-3.5" />
                        <span>Join Group</span>
                      </>
                    )}
                  </button>
                </div>
              </Link>
            );
          })}
        </div>
      )}
        </div>
      </div>

      {/* Create Community Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-teal-100 text-teal-800">
                  <Compass className="w-4 h-4" />
                </span>
                <h3 className="text-sm font-bold text-slate-900">Create Specialty Community</h3>
              </div>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {createError && (
              <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
                <span>{createError}</span>
              </div>
            )}

            <form onSubmit={handleCreateCommunity} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Community Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Critical Care Resuscitation Society"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Description *</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Specialty clinical objectives, discussion norms, case sharing guidelines..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Specialty Alignment</label>
                <select
                  value={specialtyId}
                  onChange={(e) => setSpecialtyId(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-teal-500"
                >
                  <option value="">Cross-Specialty / Interdisciplinary</option>
                  {specialties.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="pt-1">
                <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-slate-700">
                  <input
                    type="checkbox"
                    checked={isPrivate}
                    onChange={(e) => setIsPrivate(e.target.checked)}
                    className="rounded text-teal-600 focus:ring-teal-500"
                  />
                  <span>Private Community (Requires invitation to join)</span>
                </label>
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-3.5 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreating}
                  className="px-4 py-1.5 text-xs font-bold text-white bg-teal-700 hover:bg-teal-800 rounded-lg shadow-xs transition disabled:opacity-50 inline-flex items-center gap-1.5"
                >
                  {isCreating && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>Create Community</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
