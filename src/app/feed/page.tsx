'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '@/lib/context';
import { Post, JobListing, Advertisement, CaseStudy } from '@/types';
import { LeftSidebar } from '@/components/left-sidebar';
import { RightSidebar } from '@/components/right-sidebar';
import { PostComposer } from '@/components/post-composer';
import { PostCard } from '@/components/post-card';
import { CaseStudyCard } from '@/components/case-study-card';
import { JobCard } from '@/components/job-card';
import { AdCard } from '@/components/ad-card';
import { SpecialtyBadge } from '@/components/specialty-badge';
import {
  Sparkles,
  BookOpen,
  Filter,
  RefreshCw,
  Loader2,
  Stethoscope,
  Info,
  Users,
  UserCheck,
  PlusCircle,
  ArrowRight,
  Search,
  MessageSquare,
} from 'lucide-react';
import Link from 'next/link';

export default function FeedPage() {
  const router = useRouter();
  const { specialties, activeSpecialty, setActiveSpecialty, currentUser } = useApp();
  const [posts, setPosts] = useState<Post[]>([]);
  const [caseStudies, setCaseStudies] = useState<CaseStudy[]>([]);
  const [jobs, setJobs] = useState<JobListing[]>([]);
  const [ads, setAds] = useState<Advertisement[]>([]);
  const [activeTab, setActiveTab] = useState<'consultations' | 'posts'>('consultations');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const isDemoUser = Boolean(
    currentUser && currentUser.is_demo !== false && currentUser.id?.startsWith('00000000-')
  );

  // Authentication guard: redirect to /login if not authenticated
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const isLoggedIn = localStorage.getItem('medconnect_logged_in') === 'true';
      if (!isLoggedIn) {
        router.replace('/login');
      }
    }
  }, [router]);

  const fetchFeed = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [postsRes, casesRes, jobsRes, adsRes] = await Promise.all([
        fetch('/api/posts'),
        fetch('/api/case-studies'),
        fetch('/api/jobs?is_active=true'),
        fetch('/api/ads?is_active=true'),
      ]);

      if (postsRes.ok) {
        const data = await postsRes.json();
        setPosts(data.posts || []);
      } else {
        throw new Error('Failed to load posts');
      }

      if (casesRes.ok) {
        const casesData = await casesRes.json();
        setCaseStudies(casesData.caseStudies || []);
      }

      if (jobsRes.ok) {
        const jobsData = await jobsRes.json();
        setJobs(jobsData.jobs || []);
      }

      if (adsRes.ok) {
        const adsData = await adsRes.json();
        setAds(adsData.ads || []);
      }
    } catch (e: any) {
      setError(e.message || 'Error fetching feed');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFeed();
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

  // Filter case studies by active specialty if selected
  const filteredCaseStudies = activeSpecialty
    ? caseStudies.filter((c) => (c.specialties || []).some((s) => s.id === activeSpecialty))
    : caseStudies;

  const filteredJobs = activeSpecialty
    ? jobs.filter((j) => j.specialty_id === activeSpecialty)
    : jobs;

  const filteredAds = activeSpecialty
    ? ads.filter((a) => a.specialty_id === activeSpecialty)
    : ads;

  // Newly registered users should only see real user jobs/ads, not sample/demo data
  const visibleJobs = isDemoUser ? filteredJobs : filteredJobs.filter((j) => !j.id.startsWith('job-00'));
  const visibleAds = isDemoUser ? filteredAds : filteredAds.filter((a) => !a.id.startsWith('ad-00'));

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
          {/* Refocused Doctor Primary Actions: Find Specialists, Share a Case, My Network */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Link
              href="/network"
              className="bg-white hover:bg-teal-50/50 p-4 rounded-2xl border border-slate-200 hover:border-teal-400 transition shadow-xs group flex flex-col justify-between"
            >
              <div>
                <div className="w-9 h-9 rounded-xl bg-teal-100 text-teal-800 flex items-center justify-center mb-2.5 group-hover:scale-105 transition">
                  <Users className="w-5 h-5 text-teal-700" />
                </div>
                <h3 className="text-xs font-bold text-slate-900 group-hover:text-teal-800 transition">
                  Find Specialists
                </h3>
                <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">
                  Discover specialists by expertise & hospital.
                </p>
              </div>
              <div className="mt-3 flex items-center gap-1 text-[11px] font-bold text-teal-700">
                <span>Browse Directory</span>
                <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition" />
              </div>
            </Link>

            <Link
              href="/case-studies/new"
              className="bg-gradient-to-br from-teal-700 to-teal-900 p-4 rounded-2xl text-white shadow-xs group flex flex-col justify-between hover:shadow-md transition"
            >
              <div>
                <div className="w-9 h-9 rounded-xl bg-white/20 text-white flex items-center justify-center mb-2.5 group-hover:scale-105 transition">
                  <BookOpen className="w-5 h-5" />
                </div>
                <h3 className="text-xs font-bold text-white">
                  Share a Clinical Case
                </h3>
                <p className="text-[11px] text-teal-100 mt-0.5 leading-snug">
                  Get specialist input on complex patient cases.
                </p>
              </div>
              <div className="mt-3 flex items-center gap-1 text-[11px] font-bold text-teal-200">
                <span>Author Case</span>
                <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition" />
              </div>
            </Link>

            <Link
              href="/network"
              className="bg-white hover:bg-slate-50 p-4 rounded-2xl border border-slate-200 hover:border-slate-300 transition shadow-xs group flex flex-col justify-between"
            >
              <div>
                <div className="w-9 h-9 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center mb-2.5 group-hover:scale-105 transition">
                  <UserCheck className="w-5 h-5 text-slate-700" />
                </div>
                <h3 className="text-xs font-bold text-slate-900 group-hover:text-slate-800 transition">
                  My Network
                </h3>
                <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">
                  Manage colleagues & clinical consultations.
                </p>
              </div>
              <div className="mt-3 flex items-center gap-1 text-[11px] font-bold text-slate-700">
                <span>Manage Connections</span>
                <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition" />
              </div>
            </Link>
          </div>

          {/* Activity Mode Switcher: Specialist Case Consultations vs Peer Posts */}
          <div className="bg-white rounded-2xl border border-slate-200 p-1 flex items-center gap-1 shadow-2xs">
            <button
              type="button"
              onClick={() => setActiveTab('consultations')}
              className={`flex-1 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition ${
                activeTab === 'consultations'
                  ? 'bg-teal-700 text-white shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Specialist Consultations ({filteredCaseStudies.length})</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('posts')}
              className={`flex-1 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition ${
                activeTab === 'posts'
                  ? 'bg-teal-700 text-white shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Peer Discussions ({filteredPosts.length})</span>
            </button>
          </div>

          {/* Post Composer if on Peer Discussions tab */}
          {activeTab === 'posts' && (
            <PostComposer onPostCreated={handlePostCreated} />
          )}

          {/* Feed Specialty Filter Bar */}
          <div className="bg-white rounded-xl shadow-xs border border-slate-200 p-3">
            <div className="flex items-center justify-between gap-2 mb-2">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
                <Filter className="w-3.5 h-3.5 text-teal-600" />
                <span>Specialty Filter</span>
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
                All Specialties
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
                Loading clinical activity...
              </p>
            </div>
          ) : error ? (
            <div className="bg-white rounded-xl border border-red-200 p-6 text-center text-red-600">
              <p className="text-xs font-semibold">{error}</p>
              <button
                onClick={fetchFeed}
                className="mt-3 px-3 py-1.5 text-xs bg-slate-100 hover:bg-slate-200 rounded-lg text-slate-700 inline-flex items-center gap-1.5"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Retry
              </button>
            </div>
          ) : activeTab === 'consultations' ? (
            /* Specialist Case Consultations View */
            filteredCaseStudies.length === 0 ? (
              <div className="bg-white rounded-2xl border border-slate-200 p-10 text-center space-y-3 shadow-xs">
                <div className="w-12 h-12 rounded-2xl bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-700 mx-auto">
                  <BookOpen className="w-6 h-6" />
                </div>
                <h4 className="font-bold text-slate-900 text-base">
                  {activeSpecialty ? 'No clinical cases in this specialty yet' : 'No active clinical consultations yet'}
                </h4>
                <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
                  {activeSpecialty
                    ? 'There are no active cases tagged with this specialty. Clear the filter to view all specialty consultations, or share a case to consult peers.'
                    : 'Share an anonymised patient presentation with specific questions to receive diagnostic and therapeutic guidance from specialists.'}
                </p>
                <div className="pt-2 flex items-center justify-center gap-2">
                  <Link
                    href="/case-studies/new"
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-teal-700 hover:bg-teal-800 text-white rounded-xl text-xs font-bold transition shadow-xs"
                  >
                    <PlusCircle className="w-3.5 h-3.5" />
                    <span>Share a Clinical Case</span>
                  </Link>
                  <Link
                    href="/network"
                    className="inline-flex items-center gap-1.5 px-4 py-2 border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-semibold transition"
                  >
                    <Users className="w-3.5 h-3.5" />
                    <span>Find Specialists</span>
                  </Link>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredCaseStudies.map((cs) => (
                  <CaseStudyCard
                    key={cs.id}
                    caseStudy={cs}
                    onSpecialtyClick={(sId) => setActiveSpecialty(sId)}
                  />
                ))}
              </div>
            )
          ) : (
            /* Peer Discussions View */
            filteredPosts.length === 0 ? (
              <div className="bg-white rounded-2xl border border-slate-200 p-10 text-center space-y-3 shadow-xs">
                <div className="w-12 h-12 rounded-2xl bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-700 mx-auto">
                  <Stethoscope className="w-6 h-6" />
                </div>
                <h4 className="font-bold text-slate-900 text-base">
                  {activeSpecialty ? 'No posts in this specialty yet' : 'Welcome to your clinical discussion feed'}
                </h4>
                <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
                  Your feed displays peer updates from your clinical colleagues. Share a clinical inquiry, trial reflection, or connect with peers to see their updates.
                </p>
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
            )
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
