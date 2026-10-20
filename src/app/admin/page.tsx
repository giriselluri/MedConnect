'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useApp } from '@/lib/context';
import { AdminNav } from '@/components/admin-nav';
import {
  Users,
  FileText,
  BookOpen,
  Compass,
  ShieldAlert,
  PlusCircle,
  CheckCircle2,
  Clock,
  Archive,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  Loader2,
} from 'lucide-react';

interface Metrics {
  totalUsers: number;
  totalPosts: number;
  totalCaseStudies: number;
  publishedCaseStudies: number;
  draftCaseStudies: number;
  archivedCaseStudies: number;
  totalGroups: number;
  pendingReports: number;
}

export default function AdminDashboardPage() {
  const { currentUser, isDemoUser, switchUser } = useApp();
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const isAdmin = Boolean((currentUser?.is_admin || currentUser?.role === 'admin') && isDemoUser);

  useEffect(() => {
    async function loadMetrics() {
      setIsLoading(true);
      setError(null);
      try {
        const res = await fetch('/api/admin/metrics');
        if (res.status === 403) {
          throw new Error('Forbidden: You are currently signed in as a non-admin persona.');
        }
        if (!res.ok) {
          throw new Error('Failed to load administrative metrics');
        }
        const data = await res.json();
        setMetrics(data.metrics);
      } catch (e: any) {
        setError(e.message);
      } finally {
        setIsLoading(false);
      }
    }
    loadMetrics();
  }, [currentUser]);

  // If user is not an admin, render the role restriction guard with instant 1-click switch to Dr. Sarah Jenkins (Admin)
  if (!isAdmin) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center space-y-4">
        <div className="p-3 bg-amber-100 text-amber-800 rounded-2xl border border-amber-300 inline-block shadow-sm">
          <ShieldAlert className="w-10 h-10 mx-auto" />
        </div>
        <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
          Admin Portal Access Restricted
        </h2>
        <p className="text-sm text-slate-600 max-w-lg mx-auto leading-relaxed">
          You are currently signed in as <strong>{currentUser?.full_name}</strong> (Role: <span className="capitalize">{currentUser?.role?.replace('_', ' ')}</span>).
          Administrative management and case publishing privileges require server-verified Admin credentials.
        </p>
        {isDemoUser ? (
          <div className="pt-2">
            <button
              onClick={async () => {
                // Switch to Dr. Sarah Jenkins (Admin)
                await switchUser('00000000-0000-0000-0000-000000000001');
              }}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold shadow transition"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Switch to Dr. Sarah Jenkins (Chief Admin)</span>
            </button>
          </div>
        ) : (
          <div className="pt-2">
            <Link
              href="/feed"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-teal-700 hover:bg-teal-800 text-white rounded-xl text-xs font-bold shadow transition"
            >
              <span>Return to Clinical Feed</span>
            </Link>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <AdminNav />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Welcome Banner */}
        <div className="bg-gradient-to-r from-slate-900 via-teal-950 to-slate-900 rounded-2xl p-6 text-white flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2 py-0.5 rounded text-[10px] font-extrabold tracking-wider uppercase bg-amber-500 text-white">
                Admin Console
              </span>
              <span className="text-xs text-teal-300">Live Health System Governance</span>
            </div>
            <h2 className="text-xl font-bold text-white">
              Welcome, {currentUser?.full_name}
            </h2>
            <p className="text-xs text-slate-300 mt-1 max-w-xl">
              Monitor clinical engagement, curate peer-reviewed case studies, oversee specialty communities, and enforce Row Level Security standards.
            </p>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            <Link
              href="/admin/case-studies/new"
              className="inline-flex items-center gap-2 px-4 py-2 bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold rounded-xl shadow-xs transition"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Publish Case Study</span>
            </Link>
          </div>
        </div>

        {/* Metrics Grid */}
        {isLoading ? (
          <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
            <Loader2 className="w-8 h-8 text-teal-600 animate-spin mx-auto mb-2" />
            <p className="text-xs text-slate-500 font-medium">Loading platform metrics...</p>
          </div>
        ) : error ? (
          <div className="bg-white rounded-xl border border-red-200 p-6 text-center text-red-600">
            <p className="text-xs font-semibold">{error}</p>
          </div>
        ) : metrics ? (
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Total Professionals
                </span>
                <span className="p-2 rounded-xl bg-blue-50 text-blue-600">
                  <Users className="w-4 h-4" />
                </span>
              </div>
              <div className="mt-3 text-2xl font-extrabold text-slate-900">
                {metrics.totalUsers}
              </div>
              <p className="text-[11px] text-slate-400 mt-1">Verified clinician & researcher profiles</p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Published Cases
                </span>
                <span className="p-2 rounded-xl bg-teal-50 text-teal-700">
                  <BookOpen className="w-4 h-4" />
                </span>
              </div>
              <div className="mt-3 text-2xl font-extrabold text-slate-900">
                {metrics.publishedCaseStudies}
              </div>
              <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-500">
                <span>{metrics.draftCaseStudies} Drafts</span>
                <span>•</span>
                <span>{metrics.archivedCaseStudies} Archived</span>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Social Feed Posts
                </span>
                <span className="p-2 rounded-xl bg-indigo-50 text-indigo-600">
                  <FileText className="w-4 h-4" />
                </span>
              </div>
              <div className="mt-3 text-2xl font-extrabold text-slate-900">
                {metrics.totalPosts}
              </div>
              <p className="text-[11px] text-slate-400 mt-1">Peer observations & discussions</p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Specialty Groups
                </span>
                <span className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
                  <Compass className="w-4 h-4" />
                </span>
              </div>
              <div className="mt-3 text-2xl font-extrabold text-slate-900">
                {metrics.totalGroups}
              </div>
              <p className="text-[11px] text-slate-400 mt-1">Active departmental forums</p>
            </div>
          </div>
        ) : null}

        {/* Operational Modules Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Module 1: Case Studies Lifecycle */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 flex flex-col justify-between shadow-2xs hover:border-teal-300 transition group">
            <div>
              <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center mb-4">
                <BookOpen className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-slate-900 text-base group-hover:text-teal-700 transition">
                Case Study Management
              </h3>
              <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                Create, edit, assign specialty tags, and control publication lifecycles (Draft, Published, Archived).
              </p>
            </div>
            <Link
              href="/admin/case-studies"
              className="mt-5 inline-flex items-center gap-1.5 text-xs font-bold text-teal-700 group-hover:underline"
            >
              <span>Open Case Studies Console</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Module 2: User Roles & Access */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 flex flex-col justify-between shadow-2xs hover:border-teal-300 transition group">
            <div>
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center mb-4">
                <Users className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-slate-900 text-base group-hover:text-blue-700 transition">
                User Role Administration
              </h3>
              <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                Inspect registered healthcare providers, assign administrative privileges, and manage role classifications.
              </p>
            </div>
            <Link
              href="/admin/users"
              className="mt-5 inline-flex items-center gap-1.5 text-xs font-bold text-teal-700 group-hover:underline"
            >
              <span>Manage User Roles</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Module 3: Content Moderation */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 flex flex-col justify-between shadow-2xs hover:border-teal-300 transition group">
            <div>
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center mb-4">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-slate-900 text-base group-hover:text-amber-700 transition">
                Content & Moderation Review
              </h3>
              <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                Review flagged posts, ensure compliance with clinical ethical guidelines and absence of PHI.
              </p>
            </div>
            <Link
              href="/admin/moderation"
              className="mt-5 inline-flex items-center gap-1.5 text-xs font-bold text-teal-700 group-hover:underline"
            >
              <span>Review Moderation Queue</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
