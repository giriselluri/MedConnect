'use client';

import React, { useEffect, useState } from 'react';
import { useApp } from '@/lib/context';
import { AdminNav } from '@/components/admin-nav';
import { JobListing } from '@/types';
import { JobCard } from '@/components/job-card';
import {
  Briefcase,
  Plus,
  Search,
  Filter,
  Edit2,
  Trash2,
  Eye,
  CheckCircle2,
  XCircle,
  Loader2,
  ExternalLink,
  X,
  AlertCircle,
} from 'lucide-react';

export default function AdminJobsPage() {
  const { currentUser, specialties } = useApp();
  const [jobs, setJobs] = useState<JobListing[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterActive, setFilterActive] = useState<'all' | 'active' | 'inactive'>('all');

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingJob, setEditingJob] = useState<JobListing | null>(null);
  const [previewJob, setPreviewJob] = useState<JobListing | null>(null);

  // Form states
  const [formData, setFormData] = useState({
    title: '',
    organization: '',
    location: '',
    employment_type: 'Full-time' as JobListing['employment_type'],
    specialty_id: '',
    specialty_name: '',
    salary_range: '',
    description: '',
    requirements: '',
    apply_url: '',
    is_active: true,
    is_demo: true,
  });
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isAdmin = Boolean(currentUser?.is_admin || currentUser?.role === 'admin');

  const fetchJobs = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/jobs');
      if (res.ok) {
        const data = await res.json();
        setJobs(data.jobs || []);
      }
    } catch (e) {
      console.error('Failed to load jobs', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  const openCreateModal = () => {
    setEditingJob(null);
    setFormData({
      title: '',
      organization: '',
      location: 'Boston, MA (On-site)',
      employment_type: 'Full-time',
      specialty_id: specialties[0]?.id || '',
      specialty_name: specialties[0]?.name || '',
      salary_range: '$350,000 - $450,000 / year',
      description: '',
      requirements: 'Board certification or eligibility\nActive state medical license\nCommitment to clinical excellence',
      apply_url: 'https://example.com/careers/apply',
      is_active: true,
      is_demo: true,
    });
    setFormError(null);
    setIsModalOpen(true);
  };

  const openEditModal = (job: JobListing) => {
    setEditingJob(job);
    setFormData({
      title: job.title,
      organization: job.organization,
      location: job.location,
      employment_type: job.employment_type,
      specialty_id: job.specialty_id || '',
      specialty_name: job.specialty_name || '',
      salary_range: job.salary_range || '',
      description: job.description,
      requirements: (job.requirements || []).join('\n'),
      apply_url: job.apply_url || '',
      is_active: job.is_active,
      is_demo: !!job.is_demo,
    });
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      setFormError('Job title is required');
      return;
    }
    if (!formData.organization.trim()) {
      setFormError('Organization is required');
      return;
    }
    if (!formData.description.trim()) {
      setFormError('Description is required');
      return;
    }

    setIsSubmitting(true);
    setFormError(null);

    const spec = specialties.find((s) => s.id === formData.specialty_id);
    const payload = {
      ...formData,
      specialty_name: spec ? spec.name : formData.specialty_name,
      requirements: formData.requirements
        .split('\n')
        .map((r) => r.trim())
        .filter(Boolean),
    };

    try {
      if (editingJob) {
        const res = await fetch(`/api/jobs/${editingJob.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error('Failed to update job listing');
      } else {
        const res = await fetch('/api/jobs', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error('Failed to create job listing');
      }
      setIsModalOpen(false);
      fetchJobs();
    } catch (err: any) {
      setFormError(err.message || 'Error saving job');
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleJobStatus = async (job: JobListing) => {
    try {
      const res = await fetch(`/api/jobs/${job.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_active: !job.is_active }),
      });
      if (res.ok) {
        setJobs((prev) =>
          prev.map((j) => (j.id === job.id ? { ...j, is_active: !j.is_active } : j))
        );
      }
    } catch (e) {
      console.error('Failed to toggle job status', e);
    }
  };

  const handleDelete = async (jobId: string) => {
    if (!confirm('Are you sure you want to delete this job listing?')) return;
    try {
      const res = await fetch(`/api/jobs/${jobId}`, { method: 'DELETE' });
      if (res.ok) {
        setJobs((prev) => prev.filter((j) => j.id !== jobId));
      }
    } catch (e) {
      console.error('Failed to delete job', e);
    }
  };

  const filteredJobs = jobs.filter((j) => {
    if (filterActive === 'active' && !j.is_active) return false;
    if (filterActive === 'inactive' && j.is_active) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        j.title.toLowerCase().includes(q) ||
        j.organization.toLowerCase().includes(q) ||
        j.location.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="min-h-screen bg-slate-50 pb-16">
      <AdminNav />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-emerald-600 text-white shadow-xs">
                <Briefcase className="w-5 h-5" />
              </span>
              <h2 className="text-xl font-bold text-slate-900">Healthcare Jobs Management</h2>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Create, review, publish, and manage professional recruitment listings on the feed.
            </p>
          </div>

          <button
            onClick={openCreateModal}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl shadow-xs transition"
          >
            <Plus className="w-4 h-4" />
            <span>Create Job Listing</span>
          </button>
        </div>

        {/* Filters Bar */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 mb-6 shadow-2xs flex flex-wrap items-center justify-between gap-3">
          <div className="relative flex-1 min-w-[240px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search by role, hospital or location..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-500">Status:</span>
            <div className="flex items-center bg-slate-100 rounded-lg p-0.5 border border-slate-200 text-xs">
              {(['all', 'active', 'inactive'] as const).map((status) => (
                <button
                  key={status}
                  onClick={() => setFilterActive(status)}
                  className={`px-3 py-1 rounded-md font-semibold capitalize transition ${
                    filterActive === status
                      ? 'bg-white text-slate-900 shadow-2xs'
                      : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Jobs List */}
        {isLoading ? (
          <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
            <Loader2 className="w-8 h-8 text-emerald-600 animate-spin mx-auto mb-2" />
            <p className="text-xs text-slate-500 font-medium">Loading recruitment listings...</p>
          </div>
        ) : filteredJobs.length === 0 ? (
          <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
            <Briefcase className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <h3 className="text-sm font-bold text-slate-700">No job listings found</h3>
            <p className="text-xs text-slate-400 mt-1">Try adjusting your search or add a new job listing.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredJobs.map((job) => (
              <div
                key={job.id}
                className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs hover:border-slate-300 transition flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-bold text-slate-900">{job.title}</h4>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        job.is_active
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {job.is_active ? 'Active' : 'Deactivated'}
                    </span>
                    {job.is_demo && (
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-amber-50 text-amber-800 border border-amber-200">
                        Demo
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-slate-600 font-medium">
                    {job.organization} • {job.location} • {job.employment_type}
                  </div>
                  <div className="text-[11px] text-slate-400">
                    Specialty: {job.specialty_name || 'General Medicine'} {job.salary_range && `• ${job.salary_range}`}
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center">
                  <button
                    onClick={() => setPreviewJob(job)}
                    className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600 text-xs font-semibold inline-flex items-center gap-1 transition"
                    title="Feed Preview"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Preview</span>
                  </button>

                  <button
                    onClick={() => toggleJobStatus(job)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition border ${
                      job.is_active
                        ? 'border-amber-200 bg-amber-50 text-amber-800 hover:bg-amber-100'
                        : 'border-emerald-200 bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
                    }`}
                  >
                    {job.is_active ? 'Deactivate' : 'Publish'}
                  </button>

                  <button
                    onClick={() => openEditModal(job)}
                    className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600 transition"
                    title="Edit"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => handleDelete(job.id)}
                    className="p-1.5 rounded-lg border border-red-200 hover:bg-red-50 text-red-600 transition"
                    title="Delete"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full max-h-[90vh] overflow-y-auto p-6 shadow-xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h3 className="text-base font-bold text-slate-900">
                {editingJob ? 'Edit Career Opportunity' : 'Create Career Opportunity'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Position Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Attending Interventional Cardiologist"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Organization / Hospital *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Massachusetts Academic Heart Center"
                    value={formData.organization}
                    onChange={(e) => setFormData({ ...formData, organization: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Location *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Boston, MA (On-site)"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Employment Type</label>
                  <select
                    value={formData.employment_type}
                    onChange={(e) => setFormData({ ...formData, employment_type: e.target.value as any })}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="Full-time">Full-time</option>
                    <option value="Part-time">Part-time</option>
                    <option value="Fellowship">Fellowship</option>
                    <option value="Locum Tenens">Locum Tenens</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Specialty</label>
                  <select
                    value={formData.specialty_id}
                    onChange={(e) => setFormData({ ...formData, specialty_id: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="">General Medicine</option>
                    {specialties.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Salary Range</label>
                  <input
                    type="text"
                    placeholder="e.g. $420,000 - $510,000"
                    value={formData.salary_range}
                    onChange={(e) => setFormData({ ...formData, salary_range: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Description *</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Clinical role scope, clinical research commitments, department expectations..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Key Qualifications (One per line)
                </label>
                <textarea
                  rows={3}
                  placeholder="Board certification in specialty&#10;Active medical license&#10;Clinical trial experience"
                  value={formData.requirements}
                  onChange={(e) => setFormData({ ...formData, requirements: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 font-mono text-[11px]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Apply URL</label>
                <input
                  type="url"
                  placeholder="https://hospital.org/careers/123"
                  value={formData.apply_url}
                  onChange={(e) => setFormData({ ...formData, apply_url: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="flex items-center gap-6 pt-2">
                <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700">
                  <input
                    type="checkbox"
                    checked={formData.is_active}
                    onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                    className="rounded text-emerald-600 focus:ring-emerald-500"
                  />
                  <span>Publish immediately to Feed (Active)</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700">
                  <input
                    type="checkbox"
                    checked={formData.is_demo}
                    onChange={(e) => setFormData({ ...formData, is_demo: e.target.checked })}
                    className="rounded text-emerald-600 focus:ring-emerald-500"
                  />
                  <span>Mark as Illustrative Demo Data</span>
                </label>
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg shadow-xs transition disabled:opacity-50 inline-flex items-center gap-1.5"
                >
                  {isSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>{editingJob ? 'Save Changes' : 'Create Listing'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Feed Preview Modal */}
      {previewJob && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-100 rounded-2xl max-w-lg w-full p-6 shadow-xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 mb-4">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Home Feed Appearance Preview
              </span>
              <button
                onClick={() => setPreviewJob(null)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <JobCard job={previewJob} />
          </div>
        </div>
      )}
    </div>
  );
}
