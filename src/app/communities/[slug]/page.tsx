'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { useApp } from '@/lib/context';
import { Group, Post } from '@/types';
import { PostComposer } from '@/components/post-composer';
import { PostCard } from '@/components/post-card';
import { SpecialtyBadge } from '@/components/specialty-badge';
import {
  ArrowLeft,
  Users,
  Compass,
  Check,
  UserPlus,
  Loader2,
  AlertCircle,
} from 'lucide-react';

export default function GroupDetailPage({ params }: { params: { slug: string } }) {
  const { currentUser } = useApp();
  const [group, setGroup] = useState<Group | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isJoining, setIsJoining] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadGroupAndPosts = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/groups/${params.slug}`);
      if (!res.ok) throw new Error('Community not found');
      const data = await res.json();
      setGroup(data.group);
      setPosts(data.posts || []);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setIsLoading(false);
    }
  }, [params.slug]);

  useEffect(() => {
    loadGroupAndPosts();
  }, [loadGroupAndPosts]);

  const handleToggleJoin = async () => {
    if (!group) return;
    setIsJoining(true);
    try {
      const res = await fetch(`/api/groups/${group.slug}/join`, { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        setGroup({ ...group, is_member: data.is_member, members_count: data.members_count });
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsJoining(false);
    }
  };

  const handlePostCreated = (newPost: Post) => {
    setPosts((prev) => [newPost, ...prev]);
  };

  const handlePostDeleted = (postId: string) => {
    setPosts((prev) => prev.filter((p) => p.id !== postId));
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <Loader2 className="w-8 h-8 text-teal-600 animate-spin mx-auto mb-2" />
        <p className="text-xs text-slate-500 font-medium">Loading community discussion...</p>
      </div>
    );
  }

  if (error || !group) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center space-y-4">
        <AlertCircle className="w-8 h-8 text-red-500 mx-auto" />
        <h2 className="text-xl font-bold text-slate-900">Community Not Found</h2>
        <p className="text-xs text-slate-500">{error || 'Unable to locate requested group.'}</p>
        <Link
          href="/communities"
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-teal-700 text-white rounded-xl text-xs font-semibold"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>All Communities</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      {/* Back button */}
      <Link
        href="/communities"
        className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 hover:text-teal-700 transition"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Communities</span>
      </Link>

      {/* Community Banner Card */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="h-40 relative bg-slate-800">
          <img
            src={group.banner_url || 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&q=80&w=1200'}
            alt={group.name}
            className="w-full h-full object-cover opacity-85"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />
          <div className="absolute bottom-4 left-6 right-6 flex items-center justify-between text-white">
            <span className="text-xs font-bold uppercase tracking-wider bg-white/20 backdrop-blur-md px-3 py-1 rounded-full border border-white/30">
              Departmental Circle
            </span>
            {group.specialty && (
              <SpecialtyBadge id={group.specialty.id} name={group.specialty.name} size="sm" />
            )}
          </div>
        </div>

        <div className="p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                {group.name}
              </h1>
              <p className="text-xs text-slate-500 mt-1 flex items-center gap-2">
                <span className="font-semibold text-slate-700">{group.members_count.toLocaleString()} Verified Clinicians</span>
                <span>•</span>
                <span>Created {new Date(group.created_at).toLocaleDateString()}</span>
              </p>
            </div>

            <button
              onClick={handleToggleJoin}
              disabled={isJoining}
              className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition shadow-xs ${
                group.is_member
                  ? 'bg-teal-100 text-teal-900 border border-teal-300'
                  : 'bg-teal-700 hover:bg-teal-800 text-white'
              }`}
            >
              {group.is_member ? (
                <>
                  <Check className="w-4 h-4 text-teal-700" />
                  <span>Member of Group</span>
                </>
              ) : (
                <>
                  <UserPlus className="w-4 h-4" />
                  <span>Join Community</span>
                </>
              )}
            </button>
          </div>

          <p className="text-xs sm:text-sm text-slate-600 mt-3 leading-relaxed font-normal">
            {group.description}
          </p>

          {/* Topic tags */}
          {group.topic_tags && group.topic_tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-4 pt-3 border-t border-slate-100">
              {group.topic_tags.map((tag) => (
                <span
                  key={tag}
                  className="text-xs font-semibold bg-slate-100 text-slate-700 px-2.5 py-0.5 rounded-full"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Group Post Composer */}
      <div className="space-y-4">
        <PostComposer
          onPostCreated={handlePostCreated}
          groupId={group.id}
          defaultSpecialtyId={group.specialty_id}
          placeholder={`Post a clinical question or case to ${group.name}...`}
        />

        {/* Group Posts Feed */}
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs font-bold text-slate-600 px-1">
            <span>Community Discussions ({posts.length})</span>
            <span className="text-[11px] text-teal-700 font-medium">Real-time peer feed</span>
          </div>

          {posts.length === 0 ? (
            <div className="bg-white rounded-xl border border-slate-200 p-10 text-center space-y-2">
              <Compass className="w-8 h-8 text-slate-400 mx-auto" />
              <h4 className="font-bold text-slate-800 text-sm">No group posts yet</h4>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Be the first member to start a discussion in this clinical group.
              </p>
            </div>
          ) : (
            posts.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                onPostDeleted={handlePostDeleted}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
}
