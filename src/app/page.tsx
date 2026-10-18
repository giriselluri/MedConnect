'use client';

import React, { useEffect, useState } from 'react';
import { useApp } from '@/lib/context';
import { Post } from '@/types';
import { LeftSidebar } from '@/components/left-sidebar';
import { RightSidebar } from '@/components/right-sidebar';
import { PostComposer } from '@/components/post-composer';
import { PostCard } from '@/components/post-card';
import { SpecialtyBadge } from '@/components/specialty-badge';
import {
  Sparkles,
  BookOpen,
  Filter,
  RefreshCw,
  Loader2,
  Stethoscope,
  Info,
} from 'lucide-react';
import Link from 'next/link';

export default function HomePage() {
  const { specialties, activeSpecialty, setActiveSpecialty } = useApp();
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPosts = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/posts');
      if (res.ok) {
        const data = await res.json();
        setPosts(data.posts || []);
      } else {
        throw new Error('Failed to load posts');
      }
    } catch (e: any) {
      setError(e.message || 'Error fetching feed');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const handlePostCreated = (newPost: Post) => {
    // Immediate append to feed without reload
    setPosts((prev) => [newPost, ...prev]);
  };

  const handlePostDeleted = (postId: string) => {
    setPosts((prev) => prev.filter((p) => p.id !== postId));
  };

  // Filter posts by active specialty if selected
  const filteredPosts = activeSpecialty
    ? posts.filter((p) => p.specialty_id === activeSpecialty || p.specialty?.id === activeSpecialty)
    : posts;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* 3-Column Desktop Grid Layout / 1-Column Mobile Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Sidebar (Col 1-3 on desktop) */}
        <div className="hidden lg:block lg:col-span-3">
          <div className="sticky top-20">
            <LeftSidebar />
          </div>
        </div>

        {/* Center Feed (Col 4-8 on desktop) */}
        <div className="lg:col-span-6 space-y-4">
          {/* Clinical Case Studies Highlight Callout */}
          <div className="bg-gradient-to-r from-teal-50 to-cyan-50 border border-teal-200 rounded-xl p-4 flex items-center justify-between gap-3 shadow-2xs">
            <div className="flex items-start gap-3">
              <span className="p-2 rounded-lg bg-teal-600 text-white shadow-2xs">
                <BookOpen className="w-5 h-5" />
              </span>
              <div>
                <h3 className="text-xs sm:text-sm font-bold text-teal-950">
                  New Clinical Case Studies Published
                </h3>
                <p className="text-[11px] sm:text-xs text-teal-800/80 mt-0.5">
                  Peer-reviewed educational cases in Cardiology, Oncology, and Neurology are open for peer rounds.
                </p>
              </div>
            </div>
            <Link
              href="/case-studies"
              className="flex-shrink-0 text-xs font-semibold px-3 py-1.5 bg-white text-teal-800 border border-teal-300 rounded-lg hover:bg-teal-50 transition shadow-2xs"
            >
              Explore Cases
            </Link>
          </div>

          {/* Post Composer */}
          <PostComposer onPostCreated={handlePostCreated} />

          {/* Feed Filter Bar */}
          <div className="bg-white rounded-xl shadow-xs border border-slate-200 p-3">
            <div className="flex items-center justify-between gap-2 mb-2">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
                <Filter className="w-3.5 h-3.5 text-teal-600" />
                <span>Specialty Feed Filter</span>
              </div>
              {activeSpecialty && (
                <button
                  onClick={() => setActiveSpecialty(null)}
                  className="text-[11px] font-semibold text-teal-700 hover:underline"
                >
                  Show All Specialties
                </button>
              )}
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
              <button
                onClick={() => setActiveSpecialty(null)}
                className={`text-xs px-3 py-1 rounded-full font-semibold transition border whitespace-nowrap ${
                  !activeSpecialty
                    ? 'bg-teal-700 text-white border-teal-800'
                    : 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200'
                }`}
              >
                All Feed
              </button>
              {specialties.slice(0, 8).map((s) => (
                <SpecialtyBadge
                  key={s.id}
                  id={s.id}
                  name={s.name}
                  size="sm"
                  active={activeSpecialty === s.id}
                  onClick={() => setActiveSpecialty(activeSpecialty === s.id ? null : s.id)}
                />
              ))}
            </div>
          </div>

          {/* Feed Content */}
          {isLoading ? (
            <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
              <Loader2 className="w-8 h-8 text-teal-600 animate-spin mx-auto mb-2" />
              <p className="text-xs text-slate-500 font-medium">
                Loading peer clinical feed...
              </p>
            </div>
          ) : error ? (
            <div className="bg-white rounded-xl border border-red-200 p-6 text-center text-red-600">
              <p className="text-xs font-semibold">{error}</p>
              <button
                onClick={fetchPosts}
                className="mt-3 px-3 py-1.5 text-xs bg-slate-100 hover:bg-slate-200 rounded-lg text-slate-700 inline-flex items-center gap-1.5"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Retry
              </button>
            </div>
          ) : filteredPosts.length === 0 ? (
            <div className="bg-white rounded-xl border border-slate-200 p-10 text-center space-y-2">
              <Stethoscope className="w-8 h-8 text-slate-400 mx-auto mb-1" />
              <h4 className="font-bold text-slate-800 text-sm">No posts found</h4>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                {activeSpecialty
                  ? 'No posts matching the selected specialty tag. Try selecting "All Feed" or be the first to publish a clinical insight.'
                  : 'Be the first to share a case reflection, clinical trial update, or practice inquiry.'}
              </p>
              {activeSpecialty && (
                <button
                  onClick={() => setActiveSpecialty(null)}
                  className="mt-2 text-xs font-semibold text-teal-700 underline"
                >
                  Clear specialty filter
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredPosts.map((post) => (
                <PostCard
                  key={post.id}
                  post={post}
                  onPostDeleted={handlePostDeleted}
                />
              ))}
            </div>
          )}
        </div>

        {/* Right Sidebar (Col 9-12 on desktop) */}
        <div className="hidden lg:block lg:col-span-3">
          <div className="sticky top-20">
            <RightSidebar />
          </div>
        </div>
      </div>
    </div>
  );
}
