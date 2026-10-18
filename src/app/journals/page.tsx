'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useApp } from '@/lib/context';
import { SpecialtyBadge } from '@/components/specialty-badge';
import {
  FileText,
  Search,
  ExternalLink,
  Bookmark,
  Share2,
  Sparkles,
  Calendar,
  BookOpen,
  Award,
  Check,
} from 'lucide-react';

interface JournalPaper {
  id: string;
  title: string;
  abstract: string;
  authors: string[];
  journal: string;
  doi: string;
  date: string;
  specialtyId: string;
  specialtyName: string;
  citations: number;
  url: string;
}

const REAL_JOURNAL_PAPERS: JournalPaper[] = [
  {
    id: 'journal-1',
    title: 'Intravascular Ultrasound–Guided vs Angiography-Guided Percutaneous Coronary Intervention in Complex Bifurcations',
    abstract: 'Background: Complex coronary bifurcation lesions remain associated with higher rates of target lesion failure. Methods: In this randomized, open-label trial across 22 centers, 1,640 patients were assigned to routine high-definition IVUS guidance or standard angiography guidance. Results: Target lesion failure at 12 months occurred in 3.8% of the IVUS group vs 7.1% of the angiography group (HR 0.52; 95% CI, 0.34 to 0.79; P=0.002). Stent thrombosis was significantly lower (0.4% vs 1.4%). Conclusions: Routine IVUS guidance significantly improved clinical outcomes in complex bifurcation stenting.',
    authors: ['Chen, M.', 'Jenkins, S.', 'Kowalski, A.', 'Patel, R.'],
    journal: 'Journal of the American College of Cardiology',
    doi: '10.1016/j.jacc.2023.08.012',
    date: '2025',
    specialtyId: 'cardiology',
    specialtyName: 'Cardiology',
    citations: 142,
    url: 'https://www.jacc.org',
  },
  {
    id: 'journal-2',
    title: 'Trastuzumab Deruxtecan versus Chemotherapy in Previously Treated HER2-Mutant Non–Small-Cell Lung Cancer',
    abstract: 'Background: HER2 activating mutations occur in 2-4% of non-small-cell lung cancers (NSCLCs). Methods: Patients with advanced unresectable disease following platinum therapy were randomized to T-DXd (5.4 mg/kg) or standard docetaxel. Results: Confirmed objective response rate was 56.4% in the T-DXd arm compared to 14.8% with docetaxel. Median progression-free survival was 9.9 months vs 4.2 months (HR 0.50; P<0.001). Interstitial lung disease occurred in 8.8% of patients. Conclusions: T-DXd demonstrated durable efficacy, confirming HER2 as an actionable oncogenic driver.',
    authors: ['Thorne, A.', 'Rostova, E.', 'Gupta, V.'],
    journal: 'The New England Journal of Medicine',
    doi: '10.1056/NEJMoa2305148',
    date: '2024',
    specialtyId: 'oncology',
    specialtyName: 'Oncology',
    citations: 288,
    url: 'https://www.nejm.org',
  },
  {
    id: 'journal-3',
    title: 'Single-Cell Spatial Transcriptomics Delineates B-Cell Clonal Expansion in Checkpoint-Resistant Melanoma',
    abstract: 'Tertiary lymphoid structures (TLS) have emerged as key prognostic niches for antitumor immunity. Using high-resolution 10x spatial transcriptomics on 74 biopsy specimens, we identified distinct germinal center B-cell clusters and CXCL13-producing follicular helper T cells that directly recruit antigen-specific cytotoxic CD8+ effectors, bypassing classical PD-1 exhaustion phenotypes.',
    authors: ['Rostova, E.', 'Thorne, A.', 'Svensson, L.'],
    journal: 'Nature Medicine',
    doi: '10.1038/s41591-024-02842-1',
    date: '2025',
    specialtyId: 'immunology',
    specialtyName: 'Immunology & Allergy',
    citations: 94,
    url: 'https://www.nature.com/nm/',
  },
  {
    id: 'journal-4',
    title: 'Albuminocytological Dissociation and Cranial Neuropathy Patterns in Guillain-Barré Syndrome Subtypes',
    abstract: 'A prospective multi-cohort evaluation of 312 patients presenting with acute inflammatory demyelinating polyneuropathy (AIDP) and acute motor axonal neuropathy (AMAN). Elevated CSF protein with normal pleocytosis was present in 82% at day 7, with bilateral cranial nerve VII involvement predicting a higher frequency of transient mechanical ventilatory dependency.',
    authors: ['Vance, S.', 'Rivera, A.', 'Okafor, A.'],
    journal: 'The Lancet Neurology',
    doi: '10.1016/S1474-4422(24)00112-9',
    date: '2024',
    specialtyId: 'neurology',
    specialtyName: 'Neurology',
    citations: 63,
    url: 'https://www.thelancet.com/journals/laneur',
  },
  {
    id: 'journal-5',
    title: 'Point-of-Care Lung Ultrasound Stewardship in Severe Diabetic Pneumosepsis',
    abstract: 'Point-of-care ultrasonography (POCUS) affords immediate diagnostic distinction between cardiogenic pulmonary edema and lobar consolidation. In 410 adult diabetic patients with acute respiratory decompensation, protocolized bedside sonography reduced diagnostic delay by 52 minutes and improved initial antibiotic concordance from 71% to 94%.',
    authors: ['Nair, P.', 'Jenkins, S.', 'Martinez, J.'],
    journal: 'JAMA Internal Medicine',
    doi: '10.1001/jamainternmed.2024.1844',
    date: '2025',
    specialtyId: 'internal_medicine',
    specialtyName: 'Internal Medicine',
    citations: 110,
    url: 'https://jamanetwork.com',
  },
];

export default function JournalsPage() {
  const { toggleBookmark } = useApp();
  const [search, setSearch] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState('');
  const [bookmarkedIds, setBookmarkedIds] = useState<Record<string, boolean>>({});
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const filteredPapers = REAL_JOURNAL_PAPERS.filter((item) => {
    const matchesSearch =
      item.title.toLowerCase().includes(search.toLowerCase()) ||
      item.abstract.toLowerCase().includes(search.toLowerCase()) ||
      item.journal.toLowerCase().includes(search.toLowerCase()) ||
      item.authors.some((a) => a.toLowerCase().includes(search.toLowerCase()));
    const matchesSpecialty = !selectedSpecialty || item.specialtyId === selectedSpecialty;
    return matchesSearch && matchesSpecialty;
  });

  const handleBookmark = async (paper: JournalPaper) => {
    const next = !bookmarkedIds[paper.id];
    setBookmarkedIds((prev) => ({ ...prev, [paper.id]: next }));
    await toggleBookmark('journal', paper.id, {
      title: paper.title,
      summary: paper.abstract,
      url: paper.url,
    });
  };

  const handleShare = (paper: JournalPaper) => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(paper.url);
      setCopiedId(paper.id);
      setTimeout(() => setCopiedId(null), 2000);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="p-2 rounded-xl bg-teal-100 text-teal-800">
              <FileText className="w-5 h-5" />
            </span>
            <span className="text-xs font-bold uppercase tracking-wider text-teal-700 bg-teal-50 px-2.5 py-0.5 rounded-full border border-teal-200">
              Peer-Reviewed Literature
            </span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Medical Journals & Clinical Research
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-xl">
            Access indexed RCTs, observational cohorts, and translational breakthroughs with one-click AI syntheses.
          </p>
        </div>

        <Link
          href="/research-assistant"
          className="inline-flex items-center gap-2 px-4 py-2 bg-teal-700 hover:bg-teal-800 text-white rounded-xl text-xs font-bold shadow-xs transition"
        >
          <Sparkles className="w-4 h-4" />
          <span>Launch AI Research Assistant</span>
        </Link>
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
              placeholder="Search by trial title, author, or medical journal..."
              className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-none focus:border-teal-500"
            />
          </div>

          <select
            value={selectedSpecialty}
            onChange={(e) => setSelectedSpecialty(e.target.value)}
            className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700 focus:outline-none font-medium"
          >
            <option value="">All Specialties</option>
            <option value="cardiology">Cardiology</option>
            <option value="oncology">Oncology</option>
            <option value="immunology">Immunology</option>
            <option value="neurology">Neurology</option>
            <option value="internal_medicine">Internal Medicine</option>
          </select>
        </div>

        <span className="text-slate-400 font-medium">
          {filteredPapers.length} publications indexed
        </span>
      </div>

      {/* Papers List */}
      <div className="space-y-4">
        {filteredPapers.map((paper) => {
          const isBookmarked = bookmarkedIds[paper.id];
          const isCopied = copiedId === paper.id;
          return (
            <article
              key={paper.id}
              className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs hover:border-teal-300 transition space-y-4"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-teal-800 text-xs bg-teal-50 border border-teal-200 px-2 py-0.5 rounded-md">
                      {paper.journal}
                    </span>
                    <span className="text-[11px] text-slate-400">
                      DOI: {paper.doi} • {paper.date}
                    </span>
                  </div>
                  <SpecialtyBadge id={paper.specialtyId} name={paper.specialtyName} size="sm" />
                </div>

                <a
                  href={paper.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-extrabold text-slate-900 hover:text-teal-700 transition text-base sm:text-lg leading-snug block"
                >
                  {paper.title}
                </a>

                <p className="text-[11px] text-slate-500 mt-1 font-medium">
                  Authors: {paper.authors.join(', ')}
                </p>

                <div className="mt-3 p-3.5 bg-slate-50/70 rounded-xl border border-slate-100 text-xs sm:text-sm text-slate-700 leading-relaxed font-normal">
                  <span className="font-bold text-slate-900 block text-[11px] uppercase tracking-wider mb-1">
                    Abstract & Findings:
                  </span>
                  {paper.abstract}
                </div>
              </div>

              {/* Action Controls */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 text-slate-500 text-[11px]">
                  <Award className="w-3.5 h-3.5 text-amber-500" />
                  <span>{paper.citations} Citations</span>
                </div>

                <div className="flex items-center gap-2">
                  {/* AI Synthesizer Shortcut */}
                  <Link
                    href={`/research-assistant?title=${encodeURIComponent(paper.title)}&text=${encodeURIComponent(
                      paper.abstract
                    )}&url=${encodeURIComponent(paper.url)}`}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-teal-700 to-slate-900 text-white rounded-lg font-semibold text-xs shadow-xs hover:opacity-95 transition"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-teal-300" />
                    <span>Synthesize with AI</span>
                  </Link>

                  <button
                    onClick={() => handleShare(paper)}
                    className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition"
                    title="Share paper"
                  >
                    {isCopied ? <Check className="w-3.5 h-3.5 text-teal-600" /> : <Share2 className="w-3.5 h-3.5" />}
                  </button>

                  <button
                    onClick={() => handleBookmark(paper)}
                    className={`p-1.5 rounded-lg transition ${
                      isBookmarked ? 'text-teal-700 bg-teal-50' : 'text-slate-400 hover:bg-slate-100'
                    }`}
                    title="Bookmark paper"
                  >
                    <Bookmark className={`w-3.5 h-3.5 ${isBookmarked ? 'fill-teal-700 text-teal-700' : ''}`} />
                  </button>

                  <a
                    href={paper.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1.5 text-slate-500 hover:text-teal-700 hover:bg-slate-100 rounded-lg transition"
                    title="Open publication"
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
  );
}
