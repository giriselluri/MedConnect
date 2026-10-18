'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useApp } from '@/lib/context';
import { Profile, Group } from '@/types';
import { UserPlus, Sparkles, TrendingUp, Check, ArrowRight } from 'lucide-react';
import { SpecialtyBadge } from './specialty-badge';

export function RightSidebar() {
  const { currentUser, allProfiles } = useApp();
  const [groups, setGroups] = useState<Group[]>([]);
  const [connectingIds, setConnectingIds] = useState<Record<string, boolean>>({});
  const [sentRequests, setSentRequests] = useState<Record<string, boolean>>({});

  useEffect(() => {
    async function loadGroups() {
      try {
        const res = await fetch('/api/groups');
        if (res.ok) {
          const data = await res.json();
          setGroups((data.groups || []).slice(0, 3));
        }
      } catch (e) {
        console.error(e);
      }
    }
    loadGroups();
  }, []);

  // Filter suggested professionals: exclude current user
  const suggestedProfiles = allProfiles
    .filter((p) => p.id !== currentUser?.id)
    .slice(0, 4);

  const handleConnect = async (profileId: string) => {
    setConnectingIds((prev) => ({ ...prev, [profileId]: true }));
    try {
      const res = await fetch('/api/connections', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ recipientId: profileId }),
      });
      if (res.ok) {
        setSentRequests((prev) => ({ ...prev, [profileId]: true }));
      }
    } catch (e) {
      console.error(e);
    } finally {
      setConnectingIds((prev) => ({ ...prev, [profileId]: false }));
    }
  };

  const trendingTopics = [
    { tag: 'TAVR2026', count: '1,420 clinicians', specialty: 'Cardiology' },
    { tag: 'ADCMechanisms', count: '980 oncologists', specialty: 'Oncology' },
    { tag: 'POCUSResuscitation', count: '840 physicians', specialty: 'Internal Med' },
    { tag: 'SingleCellGenomics', count: '610 researchers', specialty: 'Genomics' },
    { tag: 'PediatricCFModulators', count: '430 specialists', specialty: 'Pediatrics' },
  ];

  return (
    <aside className="space-y-4">
      {/* AI Research Assistant Promo Widget */}
      <div className="bg-gradient-to-br from-slate-900 via-teal-950 to-slate-900 rounded-xl p-4 text-white shadow-sm border border-teal-800/40 relative overflow-hidden">
        <div className="absolute top-0 right-0 -mt-2 -mr-2 w-20 h-20 bg-teal-500/10 rounded-full blur-xl pointer-events-none" />
        <div className="flex items-center gap-2 mb-2">
          <div className="p-1.5 rounded-lg bg-teal-600/30 text-teal-300 border border-teal-500/30">
            <Sparkles className="w-4 h-4" />
          </div>
          <span className="text-xs font-bold uppercase tracking-wider text-teal-300">
            AI Research Assistant
          </span>
        </div>
        <h4 className="text-sm font-bold text-white leading-snug">
          Synthesize Medical Abstracts & Trials
        </h4>
        <p className="text-[11px] text-slate-300 mt-1 leading-relaxed">
          Extract methodology, clinical endpoints, limitations, and discussion prompts from study abstracts in seconds.
        </p>
        <Link
          href="/research-assistant"
          className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-500 text-white text-xs font-semibold transition shadow-xs"
        >
          <span>Launch Assistant</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Suggested Healthcare Colleagues */}
      <div className="bg-white rounded-xl shadow-xs border border-slate-200 p-4">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
            Suggested Colleagues
          </h4>
          <Link href="/network" className="text-[11px] text-teal-700 hover:underline font-medium">
            View All
          </Link>
        </div>

        <div className="space-y-3.5">
          {suggestedProfiles.map((profile) => {
            const isSent = sentRequests[profile.id];
            const isConnecting = connectingIds[profile.id];
            return (
              <div key={profile.id} className="flex items-start justify-between gap-3">
                <Link href={`/profile/${profile.id}`} className="flex items-center gap-2.5 flex-1 min-w-0 group">
                  <img
                    src={profile.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.full_name)}&background=0d9488&color=fff`}
                    alt={profile.full_name}
                    className="w-10 h-10 rounded-full object-cover border border-slate-100 flex-shrink-0"
                  />
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-900 group-hover:text-teal-700 truncate leading-tight">
                      {profile.full_name}
                    </p>
                    <p className="text-[11px] text-slate-500 truncate mt-0.5 leading-tight">
                      {profile.title}
                    </p>
                    <p className="text-[10px] text-slate-400 truncate mt-0.5">
                      {profile.institution}
                    </p>
                  </div>
                </Link>

                <button
                  onClick={() => handleConnect(profile.id)}
                  disabled={isSent || isConnecting}
                  className={`flex-shrink-0 inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold transition border ${
                    isSent
                      ? 'bg-teal-50 text-teal-800 border-teal-200 cursor-default'
                      : 'bg-white hover:bg-teal-50 text-slate-700 hover:text-teal-800 border-slate-300 hover:border-teal-400'
                  }`}
                >
                  {isSent ? (
                    <>
                      <Check className="w-3 h-3 text-teal-600" />
                      Sent
                    </>
                  ) : (
                    <>
                      <UserPlus className="w-3 h-3" />
                      Connect
                    </>
                  )}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Trending Clinical Topics */}
      <div className="bg-white rounded-xl shadow-xs border border-slate-200 p-4">
        <div className="flex items-center gap-1.5 mb-3">
          <TrendingUp className="w-4 h-4 text-teal-600" />
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
            Trending Medical Topics
          </h4>
        </div>

        <div className="space-y-2.5">
          {trendingTopics.map((item) => (
            <div key={item.tag} className="flex items-center justify-between text-xs group cursor-pointer">
              <div>
                <span className="font-semibold text-slate-800 group-hover:text-teal-700 transition">
                  #{item.tag}
                </span>
                <p className="text-[10px] text-slate-400">{item.count}</p>
              </div>
              <SpecialtyBadge name={item.specialty} size="sm" showIcon={false} />
            </div>
          ))}
        </div>
      </div>

      {/* Medical Communities Preview */}
      {groups.length > 0 && (
        <div className="bg-white rounded-xl shadow-xs border border-slate-200 p-4">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Active Communities
            </h4>
            <Link href="/communities" className="text-[11px] text-teal-700 hover:underline font-medium">
              Explore
            </Link>
          </div>

          <div className="space-y-3">
            {groups.map((group) => (
              <Link
                key={group.id}
                href={`/communities/${group.slug}`}
                className="block p-2 rounded-lg hover:bg-slate-50 transition border border-transparent hover:border-slate-200"
              >
                <p className="text-xs font-bold text-slate-900 truncate">{group.name}</p>
                <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                  {group.description}
                </p>
                <div className="flex items-center gap-2 mt-1 text-[10px] text-slate-400">
                  <span>{group.members_count.toLocaleString()} members</span>
                  {group.specialty && <span>• {group.specialty.name}</span>}
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </aside>
  );
}
