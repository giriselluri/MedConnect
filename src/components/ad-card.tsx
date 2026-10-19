import React from 'react';
import { Advertisement } from '@/types';
import { Megaphone, ExternalLink, Sparkles } from 'lucide-react';

interface AdCardProps {
  ad: Advertisement;
}

export function AdCard({ ad }: AdCardProps) {
  return (
    <div className="bg-gradient-to-br from-indigo-50/40 via-white to-sky-50/30 rounded-xl shadow-xs border border-indigo-200/70 p-5 hover:border-indigo-300 transition duration-150 relative">
      {/* Top Banner Tag */}
      <div className="flex items-center justify-between gap-2 mb-2.5">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-indigo-100 text-indigo-900 border border-indigo-200">
          <Megaphone className="w-3.5 h-3.5 text-indigo-600" />
          <span>Sponsored Educational Notice</span>
          {ad.is_demo && (
            <span className="text-[10px] font-semibold text-indigo-700/80 bg-white px-1.5 py-0.5 rounded border border-indigo-200">
              Illustrative Demo
            </span>
          )}
        </div>
        <div className="text-[11px] font-medium text-slate-500">
          Promoted by <strong className="text-slate-700">{ad.sponsor}</strong>
        </div>
      </div>

      {/* Headline & Title */}
      <h3 className="text-base font-bold text-slate-900 mb-1">{ad.headline || ad.title}</h3>

      {/* Body text */}
      <p className="text-xs text-slate-600 leading-relaxed mb-4">
        {ad.body_text}
      </p>

      {/* CTA Footer */}
      <div className="flex items-center justify-between pt-2 border-t border-indigo-100/60">
        <span className="text-[11px] text-slate-500 flex items-center gap-1">
          <Sparkles className="w-3 h-3 text-indigo-500" />
          <span>Relevant to clinical development</span>
        </span>
        <a
          href={ad.target_url || '#'}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-700 hover:bg-indigo-800 text-white text-xs font-semibold rounded-lg transition shadow-2xs"
        >
          <span>{ad.cta_text || 'Learn More'}</span>
          <ExternalLink className="w-3 h-3" />
        </a>
      </div>
    </div>
  );
}
