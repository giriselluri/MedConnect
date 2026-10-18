'use client';

import React, { useEffect, useState } from 'react';
import { useApp } from '@/lib/context';
import { AdminNav } from '@/components/admin-nav';
import { ContentReport } from '@/types';
import {
  ShieldAlert,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Clock,
  Loader2,
} from 'lucide-react';

export default function AdminModerationPage() {
  const { currentUser } = useApp();
  const [reports, setReports] = useState<ContentReport[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchReports = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/admin/reports');
      if (res.ok) {
        const data = await res.json();
        setReports(data.reports || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const handleResolve = async (reportId: string, status: 'reviewed' | 'dismissed' | 'action_taken') => {
    try {
      const res = await fetch('/api/admin/reports', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reportId, status }),
      });
      if (res.ok) {
        await fetchReports();
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <AdminNav />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-amber-100 text-amber-800">
              <ShieldAlert className="w-5 h-5" />
            </span>
            <h2 className="text-xl font-extrabold text-slate-900">
              Clinical Content & Peer Conduct Moderation
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Review user flags, ensure non-disclosure of Protected Health Information (PHI), and maintain academic decorum.
          </p>
        </div>

        {/* Reports List */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          {isLoading ? (
            <div className="p-12 text-center">
              <Loader2 className="w-8 h-8 text-teal-600 animate-spin mx-auto mb-2" />
              <p className="text-xs text-slate-500">Loading moderation queue...</p>
            </div>
          ) : reports.length === 0 ? (
            <div className="p-12 text-center space-y-2">
              <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
              <p className="text-sm font-bold text-slate-800">Queue is Clear</p>
              <p className="text-xs text-slate-400">
                No outstanding clinical peer conduct reports require action.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {reports.map((report) => (
                <div key={report.id} className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-700">
                        Content: {report.content_type}
                      </span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                        report.status === 'pending'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-teal-100 text-teal-800'
                      }`}>
                        {report.status}
                      </span>
                    </div>
                    <p className="text-xs font-semibold text-slate-900">
                      Reason: "{report.reason}"
                    </p>
                    <p className="text-[11px] text-slate-400">
                      Reported by {report.reporter?.full_name || 'Verified Clinician'} on {new Date(report.created_at).toLocaleDateString()}
                    </p>
                  </div>

                  {report.status === 'pending' ? (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleResolve(report.id, 'dismissed')}
                        className="px-3 py-1.5 border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-semibold"
                      >
                        Dismiss
                      </button>
                      <button
                        onClick={() => handleResolve(report.id, 'reviewed')}
                        className="px-3 py-1.5 bg-teal-700 hover:bg-teal-800 text-white rounded-lg text-xs font-semibold"
                      >
                        Mark Reviewed
                      </button>
                    </div>
                  ) : (
                    <span className="text-xs text-slate-400 font-medium italic">
                      Resolved
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
