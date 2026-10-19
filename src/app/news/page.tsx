'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useApp } from '@/lib/context';
import { SpecialtyBadge } from '@/components/specialty-badge';
import { LeftSidebar } from '@/components/left-sidebar';
import {
  Newspaper,
  Search,
  Filter,
  ExternalLink,
  Bookmark,
  Share2,
  Sparkles,
  Calendar,
  Building,
  Check,
} from 'lucide-react';

interface NewsItem {
  id: string;
  title: string;
  summary: string;
  source: string;
  url: string;
  date: string;
  specialtyId: string;
  specialtyName: string;
  category: string;
}

const REAL_MEDICAL_NEWS: NewsItem[] = [
  {
    id: 'news-1',
    title: 'FDA Approves Novel Dual-Targeted Inhaled Therapy for Severe Refractory Asthma',
    summary: 'The U.S. Food and Drug Administration has granted full approval for a fixed-dose combination bronchodilator and corticosteroid aerosol targeting persistent eosinophilic airway inflammation in adult patients.',
    source: 'FDA Medical Releases',
    url: 'https://www.fda.gov/drugs/news-events-human-drugs',
    date: 'Oct 15, 2026',
    specialtyId: 'pulmonology',
    specialtyName: 'Pulmonology',
    category: 'Regulatory Approval',
  },
  {
    id: 'news-2',
    title: 'Phase III Trial of SGLT2 Inhibitors Demonstrates Significant Renal Preservation in Non-Diabetic CKD',
    summary: 'A randomized double-blind international multi-center study confirms sustained decline in eGFR loss and composite cardiovascular mortality across non-diabetic chronic kidney disease stage 3-4 cohorts.',
    source: 'The New England Journal of Medicine Watch',
    url: 'https://www.jacc.org',
    date: 'Oct 12, 2026',
    specialtyId: 'nephrology',
    specialtyName: 'Nephrology',
    category: 'Clinical Trial Outcomes',
  },
  {
    id: 'news-3',
    title: 'ACC and AHA Release Updated Consensus on Transcatheter Valve Repair in Bicuspid Aortic Stenosis',
    summary: 'New joint expert consensus statement provides anatomical risk stratification, computed tomography sizing recommendations, and 5-year durability benchmarks for TAVR in younger patients with bicuspid aortic valves.',
    source: 'American College of Cardiology News',
    url: 'https://www.acc.org',
    date: 'Oct 09, 2026',
    specialtyId: 'cardiology',
    specialtyName: 'Cardiology',
    category: 'Practice Guidelines',
  },
  {
    id: 'news-4',
    title: 'ADC Monotherapy Extends Overall Survival in HER2-Low Metastatic Breast Cancer',
    summary: 'Clinical investigators report a 34% reduction in disease progression risk using novel cleavable topoisomerase I inhibitor antibody-drug conjugates among heavily pretreated patients.',
    source: 'ASCO Post & Clinical Oncology Alerts',
    url: 'https://ascopost.com',
    date: 'Oct 06, 2026',
    specialtyId: 'oncology',
    specialtyName: 'Oncology',
    category: 'Precision Oncology',
  },
  {
    id: 'news-5',
    title: 'Early Bedside POCUS Deployment in Emergency Triage Shortens Time to Targeted Antibiotic Delivery in Sepsis',
    summary: 'Implementation of a rapid 4-point point-of-care ultrasound protocol across 18 academic emergency centers led to a median 38-minute reduction in door-to-antimicrobial time for septic bacteremia.',
    source: 'Annals of Emergency Medicine',
    url: 'https://www.annemergmed.com',
    date: 'Oct 03, 2026',
    specialtyId: 'emergency_medicine',
    specialtyName: 'Emergency Medicine',
    category: 'Acute Care Protocols',
  },
  {
    id: 'news-6',
    title: 'Pediatric Pulmonology Advisory: Early CFTR Modulator Therapy Preserves Lung Architecture in Infants',
    summary: 'Observational registry data shows infants initiated on triple-combination CFTR modulators prior to 12 months exhibited near-normal lung clearance index (LCI) measurements at 3-year follow-up.',
    source: 'American Academy of Pediatrics',
    url: 'https://www.aap.org',
    date: 'Sep 29, 2026',
    specialtyId: 'pediatrics',
    specialtyName: 'Pediatrics',
    category: 'Pediatric Therapeutics',
  },
];

export default function NewsPage() {
  const { toggleBookmark } = useApp();
  const [search, setSearch] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState('');
  const [bookmarkedIds, setBookmarkedIds] = useState<Record<string, boolean>>({});
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const filteredNews = REAL_MEDICAL_NEWS.filter((item) => {
    const matchesSearch =
      item.title.toLowerCase().includes(search.toLowerCase()) ||
      item.summary.toLowerCase().includes(search.toLowerCase()) ||
      item.source.toLowerCase().includes(search.toLowerCase());
    const matchesSpecialty = !selectedSpecialty || item.specialtyId === selectedSpecialty;
    return matchesSearch && matchesSpecialty;
  });

  const handleBookmark = async (item: NewsItem) => {
    const next = !bookmarkedIds[item.id];
    setBookmarkedIds((prev) => ({ ...prev, [item.id]: next }));
    await toggleBookmark('news', item.id, {
      title: item.title,
      summary: item.summary,
      url: item.url,
    });
  };

  const handleShare = (item: NewsItem) => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(item.url);
      setCopiedId(item.id);
      setTimeout(() => setCopiedId(null), 2000);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Navigation Sidebar */}
        <div className="hidden lg:block lg:col-span-3">
          <LeftSidebar />
        </div>

        {/* Main News Column */}
        <div className="lg:col-span-9 space-y-6">
          {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="p-2 rounded-xl bg-teal-100 text-teal-800">
              <Newspaper className="w-5 h-5" />
            </span>
            <span className="text-xs font-bold uppercase tracking-wider text-teal-700 bg-teal-50 px-2.5 py-0.5 rounded-full border border-teal-200">
              Medical News Wire
            </span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Healthcare News & Clinical Bulletins
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-xl">
            Traceable clinical trial updates, FDA advisories, guideline alerts, and health policy releases.
          </p>
        </div>

        <Link
          href="/research-assistant"
          className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-teal-700 to-slate-900 text-white rounded-xl text-xs font-bold shadow-xs hover:opacity-95 transition"
        >
          <Sparkles className="w-4 h-4 text-teal-300" />
          <span>Summarize Study with AI</span>
        </Link>
      </div>

      {/* Illustrative Demo Disclosure Banner */}
      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-xs text-amber-900 flex items-start gap-3">
        <span className="p-1 rounded-lg bg-amber-200 text-amber-800 font-bold text-[10px] uppercase tracking-wider flex-shrink-0 mt-0.5">
          Illustrative Sample Data
        </span>
        <div className="space-y-0.5">
          <p className="font-semibold text-amber-950">
            Curated MVP Clinical Demonstration Content
          </p>
          <p className="text-[11px] text-amber-800 leading-relaxed">
            The articles displayed below are simulated clinical wire items curated for platform validation and testing of bookmarking and AI summarization workflows. Live automated RSS and PubMed feeds are documented enhancements for the production launch.
          </p>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-2.5 flex-1 min-w-[280px]">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search news by topic, therapy, or agency..."
              className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-none focus:border-teal-500"
            />
          </div>

          <select
            value={selectedSpecialty}
            onChange={(e) => setSelectedSpecialty(e.target.value)}
            className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700 focus:outline-none font-medium"
          >
            <option value="">All Clinical Specialties</option>
            <option value="cardiology">Cardiology</option>
            <option value="oncology">Oncology</option>
            <option value="nephrology">Nephrology</option>
            <option value="pulmonology">Pulmonology</option>
            <option value="emergency_medicine">Emergency Medicine</option>
            <option value="pediatrics">Pediatrics</option>
          </select>
        </div>

        <span className="text-slate-400 font-medium">
          {filteredNews.length} articles indexed
        </span>
      </div>

      {/* News Articles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredNews.map((item) => {
          const isBookmarked = bookmarkedIds[item.id];
          const isCopied = copiedId === item.id;
          return (
            <article
              key={item.id}
              className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:border-teal-300 transition flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-teal-800 bg-teal-50 px-2 py-0.5 rounded-md border border-teal-200">
                    {item.category}
                  </span>
                  <SpecialtyBadge id={item.specialtyId} name={item.specialtyName} size="sm" />
                </div>

                <a
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-bold text-slate-900 hover:text-teal-700 transition text-base leading-snug block line-clamp-2"
                >
                  {item.title}
                </a>

                <p className="text-xs sm:text-sm text-slate-600 mt-2 line-clamp-3 leading-relaxed font-normal">
                  {item.summary}
                </p>
              </div>

              <div className="mt-4 pt-3.5 border-t border-slate-100 flex items-center justify-between gap-2 text-xs">
                <div className="min-w-0">
                  <span className="font-semibold text-slate-800 block truncate">{item.source}</span>
                  <span className="text-[11px] text-slate-400 flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {item.date}
                  </span>
                </div>

                <div className="flex items-center gap-1.5 flex-shrink-0">
                  <Link
                    href={`/research-assistant?title=${encodeURIComponent(item.title)}&text=${encodeURIComponent(
                      item.summary
                    )}&url=${encodeURIComponent(item.url)}`}
                    className="p-1.5 text-teal-700 hover:bg-teal-50 rounded-lg transition text-xs font-semibold flex items-center gap-1"
                    title="Generate structured AI summary"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-teal-600" />
                    <span className="hidden sm:inline">AI Summary</span>
                  </Link>

                  <button
                    onClick={() => handleShare(item)}
                    className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition"
                    title="Share link"
                  >
                    {isCopied ? <Check className="w-3.5 h-3.5 text-teal-600" /> : <Share2 className="w-3.5 h-3.5" />}
                  </button>

                  <button
                    onClick={() => handleBookmark(item)}
                    className={`p-1.5 rounded-lg transition ${
                      isBookmarked ? 'text-teal-700 bg-teal-50' : 'text-slate-400 hover:bg-slate-100'
                    }`}
                    title="Bookmark"
                  >
                    <Bookmark className={`w-3.5 h-3.5 ${isBookmarked ? 'fill-teal-700 text-teal-700' : ''}`} />
                  </button>

                  <a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1.5 text-slate-500 hover:text-teal-700 hover:bg-slate-100 rounded-lg transition"
                    title="Open original source"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            </article>
          );
        })}
        </div>
        </div>
      </div>
    </div>
  );
}
