'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { useApp } from '@/lib/context';
import { Profile, Post } from '@/types';
import { SpecialtyBadge } from '@/components/specialty-badge';
import { PostCard } from '@/components/post-card';
import {
  Building2,
  MapPin,
  Calendar,
  Award,
  BookOpen,
  UserPlus,
  Check,
  Edit,
  ShieldCheck,
  Save,
  X,
  FileText,
  Loader2,
  AlertCircle,
  Briefcase,
  GraduationCap,
} from 'lucide-react';

export default function UserProfilePage({ params }: { params: { id: string } }) {
  const { currentUser, specialties, refreshSession } = useApp();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Edit fields
  const [editBio, setEditBio] = useState('');
  const [editTitle, setEditTitle] = useState('');
  const [editInstitution, setEditInstitution] = useState('');
  const [editLocation, setEditLocation] = useState('');
  const [editYears, setEditYears] = useState(0);

  const isOwnProfile = currentUser?.id === params.id;

  const loadProfile = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [profRes, postsRes] = await Promise.all([
        fetch(`/api/profiles/${params.id}`),
        fetch(`/api/posts`),
      ]);

      if (!profRes.ok) throw new Error('Profile not found');
      const profData = await profRes.json();
      setProfile(profData.profile);
      setEditBio(profData.profile.bio || '');
      setEditTitle(profData.profile.title || '');
      setEditInstitution(profData.profile.institution || '');
      setEditLocation(profData.profile.location || '');
      setEditYears(profData.profile.years_of_experience || 0);

      if (postsRes.ok) {
        const postsData = await postsRes.json();
        const userPosts = (postsData.posts || []).filter((p: Post) => p.author_id === params.id);
        setPosts(userPosts);
      }
    } catch (e: any) {
      setError(e.message);
    } finally {
      setIsLoading(false);
    }
  }, [params.id]);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  const handleSaveProfile = async () => {
    setIsSaving(true);
    try {
      const res = await fetch(`/api/profiles/${params.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bio: editBio,
          title: editTitle,
          institution: editInstitution,
          location: editLocation,
          years_of_experience: editYears,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setProfile(data.profile);
        setIsEditing(false);
        await refreshSession();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsSaving(false);
    }
  };

  const handleConnect = async () => {
    if (!profile) return;
    try {
      const res = await fetch('/api/connections', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ recipientId: profile.id }),
      });
      if (res.ok) {
        setIsConnected(true);
      }
    } catch (e) {
      console.error(e);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <Loader2 className="w-8 h-8 text-teal-600 animate-spin mx-auto mb-2" />
        <p className="text-xs text-slate-500">Loading professional profile...</p>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center space-y-4">
        <AlertCircle className="w-8 h-8 text-red-500 mx-auto" />
        <h2 className="text-xl font-bold text-slate-900">Profile Not Found</h2>
        <p className="text-xs text-slate-500">{error || 'Requested clinician profile not found.'}</p>
        <Link href="/" className="inline-flex items-center px-4 py-2 bg-teal-700 text-white rounded-xl text-xs font-semibold">
          Return to Feed
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      {/* Profile Header Banner Card */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
        {/* Banner */}
        <div className="h-36 sm:h-44 bg-gradient-to-r from-slate-900 via-teal-900 to-slate-900 relative">
          {profile.is_admin && (
            <span className="absolute top-4 right-4 px-3 py-1 bg-amber-500 text-white text-xs font-bold uppercase tracking-wider rounded-lg shadow">
              Platform Admin
            </span>
          )}
        </div>

        {/* Profile Content */}
        <div className="px-6 pb-6 pt-0 relative">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 -mt-14 mb-4">
            <div className="relative inline-block">
              <img
                src={profile.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.full_name)}&background=0d9488&color=fff`}
                alt={profile.full_name}
                className="w-24 h-24 sm:w-28 sm:h-28 rounded-full object-cover border-4 border-white shadow-lg bg-white"
              />
            </div>

            <div className="flex items-center gap-2">
              {isOwnProfile ? (
                <button
                  onClick={() => setIsEditing(!isEditing)}
                  className="inline-flex items-center gap-1.5 px-4 py-2 border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-semibold transition"
                >
                  <Edit className="w-3.5 h-3.5 text-teal-600" />
                  <span>{isEditing ? 'Cancel Editing' : 'Edit Profile'}</span>
                </button>
              ) : (
                <button
                  onClick={handleConnect}
                  disabled={isConnected}
                  className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition shadow-xs ${
                    isConnected
                      ? 'bg-teal-100 text-teal-800'
                      : 'bg-teal-700 hover:bg-teal-800 text-white'
                  }`}
                >
                  {isConnected ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-teal-600" />
                      <span>Request Sent</span>
                    </>
                  ) : (
                    <>
                      <UserPlus className="w-3.5 h-3.5" />
                      <span>Connect with Colleague</span>
                    </>
                  )}
                </button>
              )}
            </div>
          </div>

          {/* Profile Name & Credentials */}
          {!isEditing ? (
            <div className="space-y-3">
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                    {profile.full_name}
                  </h1>
                  {profile.is_verified && (
                    <span className="p-0.5 rounded-full bg-teal-100 text-teal-700">
                      <Check className="w-4 h-4" />
                    </span>
                  )}
                </div>
                <p className="text-sm font-medium text-slate-700 mt-0.5">{profile.title}</p>
                <div className="flex flex-wrap items-center gap-4 mt-2 text-xs text-slate-500">
                  {profile.institution && (
                    <div className="flex items-center gap-1.5 font-medium text-teal-800">
                      <Building2 className="w-3.5 h-3.5 text-teal-600" />
                      <span>{profile.institution}</span>
                    </div>
                  )}
                  {profile.location && (
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      <span>{profile.location}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-1.5">
                    <Briefcase className="w-3.5 h-3.5 text-slate-400" />
                    <span>{profile.years_of_experience} Years Experience</span>
                  </div>
                </div>
              </div>

              {/* Specialties */}
              <div className="flex flex-wrap gap-1.5 pt-1">
                {profile.specialties?.map((s) => (
                  <SpecialtyBadge key={s.id} id={s.id} name={s.name} size="md" />
                ))}
              </div>

              {/* Bio */}
              <div className="pt-3 border-t border-slate-100">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                  Biography & Practice Focus
                </h4>
                <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-normal">
                  {profile.bio || 'No biography provided.'}
                </p>
              </div>
            </div>
          ) : (
            /* Editing form */
            <div className="space-y-4 pt-2">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Professional Title</label>
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-teal-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Institution</label>
                  <input
                    type="text"
                    value={editInstitution}
                    onChange={(e) => setEditInstitution(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-teal-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Location</label>
                  <input
                    type="text"
                    value={editLocation}
                    onChange={(e) => setEditLocation(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-teal-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Years of Experience</label>
                <input
                  type="number"
                  value={editYears}
                  onChange={(e) => setEditYears(parseInt(e.target.value) || 0)}
                  className="w-32 px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-teal-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Biography</label>
                <textarea
                  value={editBio}
                  onChange={(e) => setEditBio(e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-teal-500"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={handleSaveProfile}
                  disabled={isSaving}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-teal-700 hover:bg-teal-800 text-white rounded-xl text-xs font-bold shadow-xs transition"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{isSaving ? 'Saving...' : 'Save Profile'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 border border-slate-300 text-slate-600 rounded-xl text-xs font-semibold hover:bg-slate-50"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Synthetic Profile Notice as required by Section 5 */}
          <div className="mt-4 pt-3 border-t border-slate-100 text-[10px] text-slate-400 italic">
            Notice: Fictional clinician profile generated for professional educational simulation and product testing.
          </div>
        </div>
      </div>

      {/* Qualifications & Research Interests */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
            <GraduationCap className="w-4 h-4 text-teal-600" />
            Qualifications & Board Certifications
          </h3>
          <ul className="space-y-2 text-xs text-slate-700">
            {profile.qualifications && profile.qualifications.length > 0 ? (
              profile.qualifications.map((q, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-teal-600 font-bold">•</span>
                  <span>{q}</span>
                </li>
              ))
            ) : (
              <li className="text-slate-400">No board qualifications listed.</li>
            )}
          </ul>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
            <Award className="w-4 h-4 text-teal-600" />
            Clinical Interests & Subspecialties
          </h3>
          <div className="flex flex-wrap gap-1.5">
            {profile.interests && profile.interests.length > 0 ? (
              profile.interests.map((interest, i) => (
                <span
                  key={i}
                  className="px-2.5 py-1 bg-slate-100 text-slate-700 rounded-lg text-xs font-medium"
                >
                  {interest}
                </span>
              ))
            ) : (
              <span className="text-xs text-slate-400">No interests listed.</span>
            )}
          </div>
        </div>
      </div>

      {/* Clinician's Posts Feed */}
      <div className="space-y-4">
        <h3 className="font-bold text-slate-900 text-sm">
          Publications & Clinical Insights ({posts.length})
        </h3>

        {posts.length === 0 ? (
          <div className="bg-white rounded-xl border border-slate-200 p-8 text-center text-xs text-slate-400">
            No published posts from this clinician yet.
          </div>
        ) : (
          posts.map((post) => <PostCard key={post.id} post={post} />)
        )}
      </div>
    </div>
  );
}
