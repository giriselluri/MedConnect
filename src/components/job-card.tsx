import React from 'react';
import { JobListing } from '@/types';
import { Briefcase, MapPin, DollarSign, ExternalLink, ShieldCheck } from 'lucide-react';

interface JobCardProps {
  job: JobListing;
}

export function JobCard({ job }: JobCardProps) {
  return (
    <div className="bg-white rounded-xl shadow-xs border border-emerald-200/80 p-5 hover:border-emerald-300 transition duration-150 relative overflow-hidden">
      {/* Top Banner Tag */}
      <div className="flex items-center justify-between gap-2 mb-3">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
          <Briefcase className="w-3.5 h-3.5 text-emerald-600" />
          <span>Career Opportunity</span>
          {job.is_demo && (
            <span className="text-[10px] font-semibold text-emerald-700/80 bg-white px-1.5 py-0.5 rounded border border-emerald-200">
              Illustrative Demo
            </span>
          )}
        </div>
        {job.specialty_name && (
          <span className="text-[11px] font-semibold text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-full">
            {job.specialty_name}
          </span>
        )}
      </div>

      {/* Title & Organization */}
      <h3 className="text-base font-bold text-slate-900 mb-1">{job.title}</h3>
      <div className="text-sm font-semibold text-emerald-700 mb-2">{job.organization}</div>

      {/* Meta Pills */}
      <div className="flex flex-wrap items-center gap-y-1 gap-x-3 text-xs text-slate-600 mb-3">
        <div className="flex items-center gap-1">
          <MapPin className="w-3.5 h-3.5 text-slate-400" />
          <span>{job.location}</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-slate-300" />
          <span>{job.employment_type}</span>
        </div>
        {job.salary_range && (
          <div className="flex items-center gap-1 font-medium text-slate-700">
            <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
            <span>{job.salary_range}</span>
          </div>
        )}
      </div>

      {/* Description */}
      <p className="text-xs text-slate-600 leading-relaxed mb-3 line-clamp-3">
        {job.description}
      </p>

      {/* Key Requirements */}
      {job.requirements && job.requirements.length > 0 && (
        <div className="mb-4 bg-slate-50 rounded-lg p-2.5 border border-slate-100">
          <div className="text-[11px] font-bold text-slate-700 mb-1">Key Qualifications:</div>
          <ul className="text-[11px] text-slate-600 space-y-1">
            {job.requirements.slice(0, 3).map((req, idx) => (
              <li key={idx} className="flex items-start gap-1.5">
                <span className="text-emerald-600 font-bold">•</span>
                <span>{req}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Action Footer */}
      <div className="flex items-center justify-between pt-2 border-t border-slate-100">
        <span className="text-[10px] text-slate-400">
          Posted {new Date(job.created_at).toLocaleDateString()}
        </span>
        <a
          href={job.apply_url || '#'}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold rounded-lg transition shadow-2xs"
        >
          <span>View Opportunity</span>
          <ExternalLink className="w-3 h-3" />
        </a>
      </div>
    </div>
  );
}
