'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { CaseStudy } from '@/types';
import { useApp } from '@/lib/context';
import {
  BookOpen,
  Calendar,
  Bookmark,
  Share2,
  ArrowRight,
  ShieldCheck,
  Check,
  Lock,
} from 'lucide-react';
import { SpecialtyBadge } from './specialty-badge';

interface CaseStudyCardProps {
  caseStudy: CaseStudy;
  onSpecialtyClick?: (specialtyId: string) => void;
}

export function CaseStudyCard({ caseStudy, onSpecialtyClick }: CaseStudyCardProps) {
  const router = useRouter();
  const { toggleBookmark } = useApp();
  const [isBookmarked, setIsBookmarked] = useState(Boolean(caseStudy.is_bookmarked));
  const [copied, setCopied] = useState(false);

  const handleCardClick = (e: React.MouseEvent) => {
    // If clicked on or inside an interactive element (button or link), let it handle its own event
    const target = e.target as HTMLElement;
    if (target.closest('button') || target.closest('a')) {
      return;
    }
    router.push(`/case-studies/${caseStudy.id}`);
  };

  const handleBookmark = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const nextState = !isBookmarked;
    setIsBookmarked(nextState);
    await toggleBookmark('case_study', caseStudy.id, {
      title: caseStudy.title,
      summary: caseStudy.short_summary,
    });
  };

  const handleShare = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(`${window.location.origin}/case-studies/${caseStudy.id}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const formattedDate = caseStudy.published_at
    ? new Date(caseStudy.published_at).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    : 'Draft';

  return (
    <div
      onClick={handleCardClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter') {
          router.push(`/case-studies/${caseStudy.id}`);
        }
      }}
      tabIndex={0}
      role="article"
      aria-label={`Case Study: ${caseStudy.title}`}
      className="bg-white rounded-2xl shadow-xs border border-slate-200 p-4 sm:p-5 hover:shadow-md hover:border-teal-400 transition cursor-pointer group flex flex-col justify-between active:scale-[0.99] touch-manipulation focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent select-text"
    >
      <div>
        {/* Top metadata row */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex flex-wrap gap-1.5">
            {caseStudy.specialties?.map((s) => (
              <SpecialtyBadge
                key={s.id}
                id={s.id}
                name={s.name}
                size="sm"
                onClick={onSpecialtyClick ? () => onSpecialtyClick(s.id) : undefined}
              />
            ))}
          </div>

          <div className="flex items-center gap-1.5">
            {caseStudy.is_private ? (
              <span className="text-[10px] font-bold uppercase tracking-wider bg-amber-50 text-amber-800 border border-amber-300 px-2 py-0.5 rounded-full flex items-center gap-1">
                <Lock className="w-3 h-3 text-amber-600" />
                Private Case
              </span>
            ) : caseStudy.password_protected ? (
              <span className="text-[10px] font-bold uppercase tracking-wider bg-amber-50 text-amber-800 border border-amber-300 px-2 py-0.5 rounded-full flex items-center gap-1">
                <Lock className="w-3 h-3 text-amber-600" />
                Protected Case
              </span>
            ) : null}
            {caseStudy.visibility === 'group' && (
              <span className="text-[10px] font-bold uppercase tracking-wider bg-purple-50 text-purple-800 border border-purple-200 px-2 py-0.5 rounded-full flex items-center gap-1">
                Community
              </span>
            )}
            {caseStudy.visibility === 'connections' && !caseStudy.is_private && (
              <span className="text-[10px] font-bold uppercase tracking-wider bg-blue-50 text-blue-800 border border-blue-200 px-2 py-0.5 rounded-full flex items-center gap-1">
                Connections
              </span>
            )}
            <span className="text-[10px] font-bold uppercase tracking-wider bg-teal-50 text-teal-800 border border-teal-200 px-2 py-0.5 rounded-full flex items-center gap-1">
              <ShieldCheck className="w-3 h-3 text-teal-600" />
              Educational Case
            </span>
          </div>
        </div>

        {/* Title */}
        <Link href={`/case-studies/${caseStudy.id}`}>
          <h3 className="font-bold text-slate-900 group-hover:text-teal-700 transition text-base sm:text-lg leading-snug line-clamp-2">
            {caseStudy.title}
          </h3>
        </Link>

        {/* Short Summary */}
        <p className="text-xs sm:text-sm text-slate-600 mt-2 line-clamp-3 leading-relaxed font-normal">
          {caseStudy.short_summary}
        </p>

        {/* Learning Objectives Preview */}
        {caseStudy.learning_objectives && caseStudy.learning_objectives.length > 0 && (
          <div className="mt-3 p-2.5 bg-slate-50 rounded-lg border border-slate-100">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
              Key Learning Objective:
            </span>
            <p className="text-xs text-slate-700 line-clamp-1 italic">
              "{caseStudy.learning_objectives[0]}"
            </p>
          </div>
        )}
      </div>

      {/* Footer / Author info */}
      <div className="mt-4 pt-3.5 border-t border-slate-100 flex items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2.5 min-w-0">
          <Link
            href={caseStudy.author_id ? `/profile/${caseStudy.author_id}` : '#'}
            onClick={(e) => e.stopPropagation()}
            className="flex-shrink-0 group/avatar"
            title={caseStudy.author_name}
          >
            <img
              src={
                caseStudy.author_avatar_url ||
                `https://ui-avatars.com/api/?name=${encodeURIComponent(caseStudy.author_name || 'Clinician')}&background=0d9488&color=fff&bold=true`
              }
              alt={caseStudy.author_name}
              className="w-8 h-8 rounded-full object-cover border border-slate-200 group-hover/avatar:ring-2 group-hover/avatar:ring-teal-500 transition"
              onError={(e) => {
                const target = e.currentTarget;
                target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(caseStudy.author_name || 'Clinician')}&background=0d9488&color=fff&bold=true`;
              }}
            />
          </Link>
          <div className="min-w-0">
            <Link
              href={caseStudy.author_id ? `/profile/${caseStudy.author_id}` : '#'}
              onClick={(e) => e.stopPropagation()}
              className="font-semibold text-slate-900 hover:text-teal-700 truncate block transition"
            >
              {caseStudy.author_name}
            </Link>
            <div className="flex items-center gap-2 text-[11px] text-slate-500 truncate">
              <span className="truncate">{caseStudy.author_title || 'Clinical Faculty'}</span>
              <span>•</span>
              <span className="flex items-center gap-1 flex-shrink-0">
                <Calendar className="w-3 h-3 text-slate-400" />
                {formattedDate}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1 flex-shrink-0">
          <button
            onClick={handleShare}
            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition"
            title="Share case study"
          >
            {copied ? <Check className="w-4 h-4 text-teal-600" /> : <Share2 className="w-4 h-4" />}
          </button>
          <button
            onClick={handleBookmark}
            className={`p-1.5 rounded-lg transition ${
              isBookmarked
                ? 'text-teal-700 bg-teal-50'
                : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100'
            }`}
            title="Save to bookmarks"
          >
            <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-teal-700' : ''}`} />
          </button>
          {caseStudy.password_protected ? (
            <Link
              href={`/case-studies/${caseStudy.id}`}
              className="ml-1 inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-semibold text-xs transition shadow-2xs"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Enter Password</span>
            </Link>
          ) : (
            <Link
              href={`/case-studies/${caseStudy.id}`}
              className="ml-1 inline-flex items-center gap-1 px-3 py-1.5 bg-teal-700 hover:bg-teal-800 text-white rounded-lg font-semibold text-xs transition shadow-2xs"
            >
              <span>Review Case</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
