'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useApp } from '@/lib/context';
import { Profile, Connection } from '@/types';
import { SpecialtyBadge } from '@/components/specialty-badge';
import { SearchableSpecialtyFilter } from '@/components/searchable-specialty-filter';
import { LeftSidebar } from '@/components/left-sidebar';
import { trackAppEvent } from '@/lib/analytics';
import {
  Users,
  Search,
  Filter,
  UserCheck,
  UserPlus,
  Check,
  X,
  Clock,
  Building2,
  MapPin,
  ShieldCheck,
  Loader2,
} from 'lucide-react';

export default function NetworkPage() {
  const { currentUser, specialties, isDemoUser } = useApp();
  const [activeTab, setActiveTab] = useState<'directory' | 'connections' | 'invitations'>('directory');
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [connections, setConnections] = useState<Connection[]>([]);
  const [pendingIncoming, setPendingIncoming] = useState<Connection[]>([]);
  const [pendingOutgoing, setPendingOutgoing] = useState<Connection[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [specialtyFilter, setSpecialtyFilter] = useState('');
  const [actionLoading, setActionLoading] = useState<Record<string, boolean>>({});

  const loadNetworkData = async () => {
    setIsLoading(true);
    try {
      const [profilesRes, connRes] = await Promise.all([
        fetch('/api/profiles'),
        fetch('/api/connections'),
      ]);

      if (profilesRes.ok) {
        const pData = await profilesRes.json();
        setProfiles(pData.profiles || []);
      }
      if (connRes.ok) {
        const cData = await connRes.json();
        setConnections(cData.connections || []);
        setPendingIncoming(cData.pendingIncoming || []);
        setPendingOutgoing(cData.pendingOutgoing || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadNetworkData();
  }, [currentUser]);

  const handleSendRequest = async (recipientId: string) => {
    setActionLoading((prev) => ({ ...prev, [recipientId]: true }));
    try {
      const res = await fetch('/api/connections', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ recipientId }),
      });
      if (res.ok) {
        await loadNetworkData();
        const target = profiles.find((p) => p.id === recipientId);
        trackAppEvent(
          'connection_requested',
          {
            target_role: target?.role || 'healthcare_professional',
          },
          isDemoUser
        );
      }
    } catch (e) {
      console.error(e);
    } finally {
      setActionLoading((prev) => ({ ...prev, [recipientId]: false }));
    }
  };

  const handleUpdateStatus = async (connectionId: string, status: 'accepted' | 'declined') => {
    setActionLoading((prev) => ({ ...prev, [connectionId]: true }));
    try {
      const res = await fetch(`/api/connections/${connectionId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        await loadNetworkData();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setActionLoading((prev) => ({ ...prev, [connectionId]: false }));
    }
  };

  const [followingMap, setFollowingMap] = useState<Record<string, boolean>>({});

  const handleRemoveConnection = async (connectionId: string) => {
    if (!confirm('Are you sure you want to remove this established connection?')) return;
    setActionLoading((prev) => ({ ...prev, [connectionId]: true }));
    try {
      const res = await fetch(`/api/connections/${connectionId}`, { method: 'DELETE' });
      if (res.ok) {
        await loadNetworkData();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setActionLoading((prev) => ({ ...prev, [connectionId]: false }));
    }
  };

  const handleToggleFollow = async (profileId: string) => {
    setActionLoading((prev) => ({ ...prev, [`follow_${profileId}`]: true }));
    try {
      const res = await fetch(`/api/profiles/${profileId}/follow`, { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        setFollowingMap((prev) => ({ ...prev, [profileId]: data.is_following }));
      }
    } catch (e) {
      console.error(e);
    } finally {
      setActionLoading((prev) => ({ ...prev, [`follow_${profileId}`]: false }));
    }
  };
  const filteredProfiles = profiles.filter((p) => {
    if (p.id === currentUser?.id) return false;
    const lowerSearch = search.trim().toLowerCase();
    const matchesSearch =
      !lowerSearch ||
      p.full_name.toLowerCase().includes(lowerSearch) ||
      p.title.toLowerCase().includes(lowerSearch) ||
      p.institution?.toLowerCase().includes(lowerSearch) ||
      p.location?.toLowerCase().includes(lowerSearch) ||
      p.bio?.toLowerCase().includes(lowerSearch) ||
      p.specialties?.some(
        (s) =>
          s.name.toLowerCase().includes(lowerSearch) ||
          s.id.toLowerCase().includes(lowerSearch)
      ) ||
      p.qualifications?.some((q) => q.toLowerCase().includes(lowerSearch));

    const matchesRole = !roleFilter || p.role === roleFilter;
    const matchesSpecialty =
      !specialtyFilter ||
      p.specialties?.some(
        (s) =>
          s.id.toLowerCase() === specialtyFilter.toLowerCase() ||
          s.name.toLowerCase() === specialtyFilter.toLowerCase()
      );
    return matchesSearch && matchesRole && matchesSpecialty;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Navigation Sidebar */}
        <div className="hidden lg:block lg:col-span-3">
          <LeftSidebar />
        </div>

        {/* Main Network Column */}
        <div className="lg:col-span-9 space-y-6">
          {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="p-2 rounded-xl bg-teal-100 text-teal-800">
              <Users className="w-5 h-5" />
            </span>
            <span className="text-xs font-bold uppercase tracking-wider text-teal-700 bg-teal-50 px-2.5 py-0.5 rounded-full border border-teal-200">
              Professional Directory
            </span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Healthcare & Life Sciences Network
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-xl">
            Connect with attending physicians, medical residents, principal investigators, and clinical faculty.
          </p>
        </div>

        {/* Tab Controls */}
        <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl text-xs font-semibold">
          <button
            onClick={() => setActiveTab('directory')}
            className={`px-3 py-1.5 rounded-lg transition ${
              activeTab === 'directory'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Find Colleagues
          </button>
          <button
            onClick={() => setActiveTab('connections')}
            className={`px-3 py-1.5 rounded-lg transition ${
              activeTab === 'connections'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            My Connections ({connections.length})
          </button>
          <button
            onClick={() => setActiveTab('invitations')}
            className={`px-3 py-1.5 rounded-lg transition relative ${
              activeTab === 'invitations'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Invitations
            {pendingIncoming.length > 0 && (
              <span className="ml-1.5 px-1.5 py-0.2 bg-teal-600 text-white text-[10px] rounded-full">
                {pendingIncoming.length}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Tab: Invitations */}
      {activeTab === 'invitations' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <h3 className="font-bold text-slate-900 text-sm">
            Pending Connection Requests ({pendingIncoming.length})
          </h3>

          {pendingIncoming.length === 0 ? (
            <p className="text-xs text-slate-400 py-6 text-center">
              No pending connection invitations at this time.
            </p>
          ) : (
            <div className="divide-y divide-slate-100">
              {pendingIncoming.map((conn) => {
                const requester = conn.requester;
                if (!requester) return null;
                const isWorking = actionLoading[conn.id];
                return (
                  <div key={conn.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <Link href={`/profile/${requester.id}`} className="flex items-center gap-3 group">
                      <img
                        src={requester.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(requester.full_name)}&background=0d9488&color=fff`}
                        alt={requester.full_name}
                        className="w-12 h-12 rounded-full object-cover border border-slate-200"
                      />
                      <div>
                        <span className="font-bold text-slate-900 group-hover:text-teal-700 text-sm block">
                          {requester.full_name}
                        </span>
                        <p className="text-xs text-slate-500">{requester.title}</p>
                        <p className="text-[11px] text-slate-400">{requester.institution}</p>
                      </div>
                    </Link>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleUpdateStatus(conn.id, 'declined')}
                        disabled={isWorking}
                        className="px-3.5 py-1.5 border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-xl text-xs font-semibold"
                      >
                        Decline
                      </button>
                      <button
                        onClick={() => handleUpdateStatus(conn.id, 'accepted')}
                        disabled={isWorking}
                        className="px-4 py-1.5 bg-teal-700 hover:bg-teal-800 text-white rounded-xl text-xs font-bold shadow-xs"
                      >
                        Accept Connection
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Tab: My Connections */}
      {activeTab === 'connections' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <h3 className="font-bold text-slate-900 text-sm">
            Active Healthcare Network ({connections.length})
          </h3>

          {connections.length === 0 ? (
            <p className="text-xs text-slate-400 py-6 text-center">
              You haven't connected with any colleagues yet. Switch to "Find Colleagues" to build your network.
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {connections.map((conn) => {
                const other = conn.requester_id === currentUser?.id ? conn.recipient : conn.requester;
                if (!other) return null;
                return (
                  <div key={conn.id} className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between gap-3">
                    <Link href={`/profile/${other.id}`} className="flex items-center gap-3 min-w-0 group">
                      <img
                        src={other.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(other.full_name)}&background=0d9488&color=fff`}
                        alt={other.full_name}
                        className="w-11 h-11 rounded-full object-cover border border-slate-200 flex-shrink-0"
                      />
                      <div className="min-w-0">
                        <span className="font-bold text-slate-900 group-hover:text-teal-700 text-xs block truncate">
                          {other.full_name}
                        </span>
                        <p className="text-[11px] text-slate-500 truncate">{other.title}</p>
                        <p className="text-[10px] text-teal-700 font-medium truncate">{other.institution}</p>
                      </div>
                    </Link>

                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className="px-2.5 py-1 bg-teal-100 text-teal-800 rounded-full text-[10px] font-bold uppercase tracking-wider">
                        Connected
                      </span>
                      <button
                        onClick={() => handleRemoveConnection(conn.id)}
                        disabled={actionLoading[conn.id]}
                        className="px-2.5 py-1 text-[11px] font-semibold text-rose-600 hover:text-rose-800 hover:bg-rose-50 border border-rose-200 rounded-lg transition"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Tab: Directory / Find Colleagues */}
      {activeTab === 'directory' && (
        <div className="space-y-4">
          {/* Filters Bar */}
          <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex flex-wrap items-center gap-2.5 flex-1 min-w-[280px]">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-slate-400" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search colleagues by name, hospital, or specialty..."
                  className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-none focus:border-teal-500"
                />
              </div>

              <SearchableSpecialtyFilter
                specialties={specialties}
                selectedSpecialtyId={specialtyFilter}
                onSelectSpecialty={setSpecialtyFilter}
                placeholder="All Specialties"
              />

              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700 focus:outline-none font-medium"
              >
                <option value="">All Professional Roles</option>
                <option value="healthcare_professional">Physicians / Clinicians</option>
                <option value="researcher">Clinical Researchers</option>
                <option value="medical_student">Medical Students</option>
                <option value="pharmaceutical_professional">Pharmaceutical</option>
                {isDemoUser && <option value="admin">Chief Medical Admins</option>}
              </select>
            </div>

            <span className="text-slate-400 font-medium">
              {filteredProfiles.length} colleagues available
            </span>
          </div>

          {/* Clinician Directory Grid */}
          {isLoading ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-16 text-center">
              <Loader2 className="w-8 h-8 text-teal-600 animate-spin mx-auto mb-2" />
              <p className="text-xs text-slate-500 font-medium">Loading medical directory...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProfiles.map((profile) => {
                const isConnected = connections.some(
                  (c) =>
                    (c.requester_id === profile.id && c.recipient_id === currentUser?.id) ||
                    (c.recipient_id === profile.id && c.requester_id === currentUser?.id)
                );
                const isPendingSent = pendingOutgoing.some((c) => c.recipient_id === profile.id);
                const isConnecting = actionLoading[profile.id];

                return (
                  <div
                    key={profile.id}
                    className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs hover:border-teal-300 hover:shadow-sm transition flex flex-col justify-between"
                  >
                    <div>
                      {/* Top banner */}
                      <div className="h-16 bg-gradient-to-r from-teal-900 to-slate-900 relative" />

                      {/* Info body */}
                      <div className="px-5 pb-4 pt-0 relative">
                        <div className="relative -mt-8 mb-2.5 inline-block">
                          <img
                            src={profile.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.full_name)}&background=0d9488&color=fff`}
                            alt={profile.full_name}
                            className="w-16 h-16 rounded-full object-cover border-3 border-white shadow-md bg-white"
                          />
                        </div>

                        <Link href={`/profile/${profile.id}`} className="group block">
                          <h4 className="font-bold text-slate-900 group-hover:text-teal-700 text-sm leading-snug">
                            {profile.full_name}
                          </h4>
                          <p className="text-xs text-slate-500 line-clamp-1 mt-0.5">
                            {profile.title}
                          </p>
                        </Link>

                        <div className="mt-2 text-[11px] text-slate-400 space-y-1">
                          <div className="flex items-center gap-1.5 truncate">
                            <Building2 className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                            <span className="truncate">{profile.institution || 'Medical Center'}</span>
                          </div>
                          {profile.location && (
                            <div className="flex items-center gap-1.5">
                              <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                              <span>{profile.location}</span>
                            </div>
                          )}
                        </div>

                        {/* Specialties */}
                        <div className="flex flex-wrap gap-1 mt-3">
                          {profile.specialties?.slice(0, 2).map((s) => (
                            <SpecialtyBadge key={s.id} id={s.id} name={s.name} size="sm" />
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Footer Button */}
                    <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                      <Link
                        href={`/profile/${profile.id}`}
                        className="text-xs font-semibold text-teal-800 hover:underline"
                      >
                        View Profile
                      </Link>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleToggleFollow(profile.id)}
                          disabled={actionLoading[`follow_${profile.id}`]}
                          className={`px-2.5 py-1 rounded-xl text-xs font-semibold transition border ${
                            followingMap[profile.id]
                              ? 'bg-indigo-50 text-indigo-700 border-indigo-200'
                              : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-300'
                          }`}
                        >
                          {followingMap[profile.id] ? 'Following' : 'Follow'}
                        </button>

                        {isConnected ? (
                          <span className="inline-flex items-center gap-1 px-3 py-1 bg-teal-100 text-teal-800 rounded-full text-xs font-bold">
                            <Check className="w-3 h-3 text-teal-600" />
                            Connected
                          </span>
                        ) : isPendingSent ? (
                          <span className="inline-flex items-center gap-1 px-3 py-1 bg-slate-100 text-slate-600 border border-slate-200 rounded-full text-xs font-medium">
                            <Clock className="w-3 h-3 text-slate-400" />
                            Sent
                          </span>
                        ) : (
                          <button
                            onClick={() => handleSendRequest(profile.id)}
                            disabled={isConnecting}
                            className="inline-flex items-center gap-1 px-3 py-1 bg-teal-700 hover:bg-teal-800 text-white rounded-xl text-xs font-bold shadow-2xs transition"
                          >
                            <UserPlus className="w-3.5 h-3.5" />
                            <span>Connect</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
        </div>
      </div>
    </div>
  );
}
