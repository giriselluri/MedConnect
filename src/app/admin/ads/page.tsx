'use client';

import React, { useEffect, useState } from 'react';
import { useApp } from '@/lib/context';
import { AdminNav } from '@/components/admin-nav';
import { Advertisement } from '@/types';
import { AdCard } from '@/components/ad-card';
import {
  Megaphone,
  Plus,
  Search,
  Edit2,
  Trash2,
  Eye,
  Loader2,
  X,
  AlertCircle,
  ExternalLink,
} from 'lucide-react';

export default function AdminAdsPage() {
  const { currentUser, specialties } = useApp();
  const [ads, setAds] = useState<Advertisement[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterActive, setFilterActive] = useState<'all' | 'active' | 'inactive'>('all');

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAd, setEditingAd] = useState<Advertisement | null>(null);
  const [previewAd, setPreviewAd] = useState<Advertisement | null>(null);

  // Form states
  const [formData, setFormData] = useState({
    title: '',
    sponsor: '',
    headline: '',
    body_text: '',
    target_url: '',
    cta_text: 'Learn More (Demo)',
    specialty_id: '',
    specialty_name: '',
    is_active: true,
    is_demo: true,
  });
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isAdmin = Boolean(currentUser?.is_admin || currentUser?.role === 'admin');

  const fetchAds = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/ads');
      if (res.ok) {
        const data = await res.json();
        setAds(data.ads || []);
      }
    } catch (e) {
      console.error('Failed to load advertisements', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAds();
  }, []);

  const openCreateModal = () => {
    setEditingAd(null);
    setFormData({
      title: '',
      sponsor: '',
      headline: '',
      body_text: '',
      target_url: 'https://example.com/symposium-2026',
      cta_text: 'Register for CME (Demo)',
      specialty_id: specialties[0]?.id || '',
      specialty_name: specialties[0]?.name || '',
      is_active: true,
      is_demo: true,
    });
    setFormError(null);
    setIsModalOpen(true);
  };

  const openEditModal = (ad: Advertisement) => {
    setEditingAd(ad);
    setFormData({
      title: ad.title,
      sponsor: ad.sponsor,
      headline: ad.headline,
      body_text: ad.body_text,
      target_url: ad.target_url,
      cta_text: ad.cta_text,
      specialty_id: ad.specialty_id || '',
      specialty_name: ad.specialty_name || '',
      is_active: ad.is_active,
      is_demo: !!ad.is_demo,
    });
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      setFormError('Title is required');
      return;
    }
    if (!formData.sponsor.trim()) {
      setFormError('Sponsor is required');
      return;
    }
    if (!formData.headline.trim()) {
      setFormError('Headline is required');
      return;
    }

    setIsSubmitting(true);
    setFormError(null);

    const spec = specialties.find((s) => s.id === formData.specialty_id);
    const payload = {
      ...formData,
      specialty_name: spec ? spec.name : formData.specialty_name,
    };

    try {
      if (editingAd) {
        const res = await fetch(`/api/ads/${editingAd.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error('Failed to update advertisement');
      } else {
        const res = await fetch('/api/ads', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error('Failed to create advertisement');
      }
      setIsModalOpen(false);
      fetchAds();
    } catch (err: any) {
      setFormError(err.message || 'Error saving advertisement');
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleAdStatus = async (ad: Advertisement) => {
    try {
      const res = await fetch(`/api/ads/${ad.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_active: !ad.is_active }),
      });
      if (res.ok) {
        setAds((prev) =>
          prev.map((a) => (a.id === ad.id ? { ...a, is_active: !a.is_active } : a))
        );
      }
    } catch (e) {
      console.error('Failed to toggle ad status', e);
    }
  };

  const handleDelete = async (adId: string) => {
    if (!confirm('Are you sure you want to delete this advertisement?')) return;
    try {
      const res = await fetch(`/api/ads/${adId}`, { method: 'DELETE' });
      if (res.ok) {
        setAds((prev) => prev.filter((a) => a.id !== adId));
      }
    } catch (e) {
      console.error('Failed to delete ad', e);
    }
  };

  const filteredAds = ads.filter((a) => {
    if (filterActive === 'active' && !a.is_active) return false;
    if (filterActive === 'inactive' && a.is_active) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        a.title.toLowerCase().includes(q) ||
        a.sponsor.toLowerCase().includes(q) ||
        a.headline.toLowerCase().includes(q)
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
              <span className="p-1.5 rounded-lg bg-indigo-600 text-white shadow-xs">
                <Megaphone className="w-5 h-5" />
              </span>
              <h2 className="text-xl font-bold text-slate-900">Advertisements & CME Sponsorships</h2>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Manage clinical symposiums, pharmaceutical education, and sponsored medical devices.
            </p>
          </div>

          <button
            onClick={openCreateModal}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-700 hover:bg-indigo-800 text-white text-xs font-bold rounded-xl shadow-xs transition"
          >
            <Plus className="w-4 h-4" />
            <span>Create Advertisement</span>
          </button>
        </div>

        {/* Filters Bar */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 mb-6 shadow-2xs flex flex-wrap items-center justify-between gap-3">
          <div className="relative flex-1 min-w-[240px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search by sponsor, title or headline..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
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

        {/* Ads List */}
        {isLoading ? (
          <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
            <Loader2 className="w-8 h-8 text-indigo-600 animate-spin mx-auto mb-2" />
            <p className="text-xs text-slate-500 font-medium">Loading advertisements...</p>
          </div>
        ) : filteredAds.length === 0 ? (
          <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
            <Megaphone className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <h3 className="text-sm font-bold text-slate-700">No advertisements found</h3>
            <p className="text-xs text-slate-400 mt-1">Try adjusting your search or create a new sponsorship notice.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredAds.map((ad) => (
              <div
                key={ad.id}
                className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs hover:border-slate-300 transition flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-bold text-slate-900">{ad.headline || ad.title}</h4>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        ad.is_active
                          ? 'bg-indigo-100 text-indigo-800'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {ad.is_active ? 'Active' : 'Deactivated'}
                    </span>
                    {ad.is_demo && (
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-amber-50 text-amber-800 border border-amber-200">
                        Demo
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-slate-600 font-medium">
                    Sponsor: <span className="text-slate-900 font-bold">{ad.sponsor}</span> • CTA: {ad.cta_text}
                  </div>
                  <div className="text-[11px] text-slate-400 line-clamp-1">
                    {ad.body_text}
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center">
                  <button
                    onClick={() => setPreviewAd(ad)}
                    className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600 text-xs font-semibold inline-flex items-center gap-1 transition"
                    title="Feed Preview"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Preview</span>
                  </button>

                  <button
                    onClick={() => toggleAdStatus(ad)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition border ${
                      ad.is_active
                        ? 'border-amber-200 bg-amber-50 text-amber-800 hover:bg-amber-100'
                        : 'border-indigo-200 bg-indigo-50 text-indigo-800 hover:bg-indigo-100'
                    }`}
                  >
                    {ad.is_active ? 'Deactivate' : 'Publish'}
                  </button>

                  <button
                    onClick={() => openEditModal(ad)}
                    className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600 transition"
                    title="Edit"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => handleDelete(ad.id)}
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
                {editingAd ? 'Edit Advertisement' : 'Create Advertisement'}
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
                <label className="block text-xs font-bold text-slate-700 mb-1">Internal Title / Campaign Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. CardioVascular Horizons 2026 Symposium"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Sponsor Organization *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. American Academy of Cardiology Education"
                    value={formData.sponsor}
                    onChange={(e) => setFormData({ ...formData, sponsor: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Specialty Alignment</label>
                  <select
                    value={formData.specialty_id}
                    onChange={(e) => setFormData({ ...formData, specialty_id: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="">Cross-Specialty</option>
                    {specialties.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Display Headline *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Advance Your Interventional & Imaging Clinical Skills in Boston"
                  value={formData.headline}
                  onChange={(e) => setFormData({ ...formData, headline: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Ad Copy / Body Text *</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Clinical benefits, educational CME credits, seminar dates..."
                  value={formData.body_text}
                  onChange={(e) => setFormData({ ...formData, body_text: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Target Landing Page URL *</label>
                  <input
                    type="url"
                    required
                    placeholder="https://example.com/register"
                    value={formData.target_url}
                    onChange={(e) => setFormData({ ...formData, target_url: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Call To Action (CTA) Text</label>
                  <input
                    type="text"
                    placeholder="e.g. Register for CME (Demo)"
                    value={formData.cta_text}
                    onChange={(e) => setFormData({ ...formData, cta_text: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="flex items-center gap-6 pt-2">
                <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700">
                  <input
                    type="checkbox"
                    checked={formData.is_active}
                    onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                    className="rounded text-indigo-600 focus:ring-indigo-500"
                  />
                  <span>Publish immediately to Feed (Active)</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700">
                  <input
                    type="checkbox"
                    checked={formData.is_demo}
                    onChange={(e) => setFormData({ ...formData, is_demo: e.target.checked })}
                    className="rounded text-indigo-600 focus:ring-indigo-500"
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
                  className="px-5 py-2 text-xs font-bold text-white bg-indigo-700 hover:bg-indigo-800 rounded-lg shadow-xs transition disabled:opacity-50 inline-flex items-center gap-1.5"
                >
                  {isSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>{editingAd ? 'Save Changes' : 'Publish Advertisement'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Feed Preview Modal */}
      {previewAd && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-100 rounded-2xl max-w-lg w-full p-6 shadow-xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 mb-4">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Home Feed Appearance Preview
              </span>
              <button
                onClick={() => setPreviewAd(null)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <AdCard ad={previewAd} />
          </div>
        </div>
      )}
    </div>
  );
}
