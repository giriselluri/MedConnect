'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useApp } from '@/lib/context';
import { Role } from '@/types';
import {
  ShieldCheck,
  Activity,
  User,
  Mail,
  Lock,
  Building2,
  MapPin,
  Stethoscope,
  Briefcase,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  ArrowRight,
  GraduationCap,
  Sparkles,
  Award,
} from 'lucide-react';

export default function SignupPage() {
  const router = useRouter();
  const { specialties, switchUser } = useApp();

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    role: 'healthcare_professional' as Role,
    title: '',
    institution: '',
    location: '',
    yearsOfExperience: 5,
    bio: '',
  });

  const [selectedSpecialties, setSelectedSpecialties] = useState<string[]>(['cardiology']);
  const [agreeTerms, setAgreeTerms] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const toggleSpecialty = (id: string) => {
    setSelectedSpecialties((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.fullName.trim()) {
      setError('Please provide your full clinical name and degree');
      return;
    }
    if (!formData.email.trim()) {
      setError('Please enter your institutional/medical email');
      return;
    }
    if (!formData.title.trim()) {
      setError('Please provide your professional title (e.g. Attending Physician)');
      return;
    }
    if (!agreeTerms) {
      setError('Please agree to clinical peer-review and privacy guidelines');
      return;
    }

    setError(null);
    setIsLoading(true);

    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          full_name: formData.fullName.trim(),
          email: formData.email.trim(),
          role: formData.role,
          title: formData.title.trim(),
          institution: formData.institution.trim() || 'Academic Medical Center',
          location: formData.location.trim() || 'United States',
          specialty_ids: selectedSpecialties,
          bio: formData.bio.trim() || 'Practicing healthcare professional dedicated to peer learning and evidence-based medicine.',
          years_of_experience: Number(formData.yearsOfExperience) || 5,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to complete registration');
      }

      await switchUser(data.user.id);
      setSuccess(true);
      setTimeout(() => {
        router.push('/');
      }, 1000);
    } catch (err: any) {
      setError(err.message || 'Error creating account. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-b from-slate-50 via-slate-100/60 to-teal-50/40 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto space-y-8">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <Link href="/" className="inline-flex items-center gap-2.5">
            <div className="w-11 h-11 rounded-2xl bg-teal-700 flex items-center justify-center text-white shadow-md shadow-teal-700/20">
              <Activity className="w-6 h-6" />
            </div>
            <div className="text-left">
              <span className="text-2xl font-black tracking-tight text-slate-900 block leading-tight">
                Med<span className="text-teal-700">Connect</span> <span className="text-xs px-1.5 py-0.5 rounded-full bg-teal-100 text-teal-800 font-bold uppercase">AI</span>
              </span>
              <span className="text-[10px] text-slate-500 font-semibold tracking-wider uppercase block">
                Clinical Healthcare Network
              </span>
            </div>
          </Link>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight pt-2">
            Register for Verified Clinical Access
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 max-w-lg mx-auto">
            Join thousands of verified physicians, surgeons, residents, and researchers collaborating on peer-reviewed case studies.
          </p>
        </div>

        {/* Card Form */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xl shadow-slate-200/50 p-6 sm:p-10 space-y-6">
          {error && (
            <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center gap-2.5">
              <AlertTriangle className="w-4 h-4 flex-shrink-0 text-red-600" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="p-4 bg-teal-50 border border-teal-200 rounded-xl text-xs text-teal-800 font-semibold flex items-center gap-2.5">
              <CheckCircle2 className="w-5 h-5 flex-shrink-0 text-teal-600" />
              <span>Registration completed! Welcome to MedConnect AI. Redirecting...</span>
            </div>
          )}

          <form onSubmit={handleSignup} className="space-y-6">
            {/* Section 1: Professional Identity */}
            <div className="space-y-4">
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-500 border-b border-slate-100 pb-1.5 flex items-center gap-1.5">
                <User className="w-4 h-4 text-teal-600" />
                <span>1. Professional Credentials</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Full Name & Medical Suffix *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    placeholder="e.g. Dr. Rebecca Vance, MD, FACC"
                    className="w-full px-3.5 py-2.5 bg-slate-50 focus:bg-white border border-slate-200 focus:border-teal-500 focus:ring-1 focus:ring-teal-500 rounded-xl text-xs sm:text-sm text-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Medical / Institutional Email *
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="e.g. rvance@hospital.org"
                    className="w-full px-3.5 py-2.5 bg-slate-50 focus:bg-white border border-slate-200 focus:border-teal-500 focus:ring-1 focus:ring-teal-500 rounded-xl text-xs sm:text-sm text-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Access Password *
                </label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="Create a password (minimum 8 characters)"
                  className="w-full px-3.5 py-2.5 bg-slate-50 focus:bg-white border border-slate-200 focus:border-teal-500 focus:ring-1 focus:ring-teal-500 rounded-xl text-xs sm:text-sm text-slate-900"
                />
              </div>
            </div>

            {/* Section 2: Clinical Role */}
            <div className="space-y-4">
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-500 border-b border-slate-100 pb-1.5 flex items-center gap-1.5">
                <Briefcase className="w-4 h-4 text-teal-600" />
                <span>2. Medical Role & Specialization</span>
              </h3>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2">
                  Select Primary Clinical Designation *
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {[
                    {
                      role: 'healthcare_professional' as Role,
                      title: 'Healthcare Professional',
                      desc: 'Attending Physician, Specialist, Surgeon',
                      icon: Stethoscope,
                    },
                    {
                      role: 'admin' as Role,
                      title: 'Clinical Administrator / CMO',
                      desc: 'Hospital Leadership & Case Governance',
                      icon: ShieldCheck,
                    },
                    {
                      role: 'medical_student' as Role,
                      title: 'Resident / Fellow / Student',
                      desc: 'Postgraduate Trainee or Medical Student',
                      icon: GraduationCap,
                    },
                    {
                      role: 'researcher' as Role,
                      title: 'Clinical Trial Researcher',
                      desc: 'Academic Investigator & Scientist',
                      icon: Award,
                    },
                  ].map((r) => {
                    const isSelected = formData.role === r.role;
                    const Icon = r.icon;
                    return (
                      <button
                        key={r.role}
                        type="button"
                        onClick={() => setFormData({ ...formData, role: r.role })}
                        className={`p-3 rounded-xl border text-left flex items-start gap-3 transition ${
                          isSelected
                            ? 'bg-teal-50/70 border-teal-600 ring-1 ring-teal-600'
                            : 'border-slate-200 hover:border-slate-300 bg-white'
                        }`}
                      >
                        <div
                          className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                            isSelected ? 'bg-teal-700 text-white' : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          <Icon className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-slate-900">{r.title}</p>
                          <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">{r.desc}</p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Clinical / Professional Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="e.g. Associate Professor of Cardiology"
                    className="w-full px-3.5 py-2.5 bg-slate-50 focus:bg-white border border-slate-200 focus:border-teal-500 focus:ring-1 focus:ring-teal-500 rounded-xl text-xs sm:text-sm text-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Primary Hospital or Institution
                  </label>
                  <input
                    type="text"
                    value={formData.institution}
                    onChange={(e) => setFormData({ ...formData, institution: e.target.value })}
                    placeholder="e.g. Brigham and Women's Hospital"
                    className="w-full px-3.5 py-2.5 bg-slate-50 focus:bg-white border border-slate-200 focus:border-teal-500 focus:ring-1 focus:ring-teal-500 rounded-xl text-xs sm:text-sm text-slate-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Location (City, State / Region)
                  </label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    placeholder="e.g. San Francisco, CA"
                    className="w-full px-3.5 py-2.5 bg-slate-50 focus:bg-white border border-slate-200 focus:border-teal-500 focus:ring-1 focus:ring-teal-500 rounded-xl text-xs sm:text-sm text-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Years of Clinical Practice
                  </label>
                  <input
                    type="number"
                    min={0}
                    max={60}
                    value={formData.yearsOfExperience}
                    onChange={(e) => setFormData({ ...formData, yearsOfExperience: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 focus:bg-white border border-slate-200 focus:border-teal-500 focus:ring-1 focus:ring-teal-500 rounded-xl text-xs sm:text-sm text-slate-900"
                  />
                </div>
              </div>
            </div>

            {/* Section 3: Specialties Selection */}
            <div className="space-y-3">
              <div className="flex items-center justify-between border-b border-slate-100 pb-1.5">
                <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-teal-600" />
                  <span>3. Clinical Specialties of Interest</span>
                </h3>
                <span className="text-[11px] text-teal-700 font-bold">
                  {selectedSpecialties.length} selected
                </span>
              </div>

              <div className="flex flex-wrap gap-1.5 max-h-40 overflow-y-auto p-1 bg-slate-50/60 rounded-xl border border-slate-200">
                {specialties.map((s) => {
                  const isSelected = selectedSpecialties.includes(s.id);
                  return (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => toggleSpecialty(s.id)}
                      className={`text-xs px-2.5 py-1 rounded-full font-medium transition ${
                        isSelected
                          ? 'bg-teal-700 text-white shadow-2xs font-semibold'
                          : 'bg-white border border-slate-200 text-slate-700 hover:border-teal-400'
                      }`}
                    >
                      {s.name}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Section 4: Bio */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Clinical Focus & Bio (Optional)
              </label>
              <textarea
                rows={2}
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                placeholder="Briefly state your clinical interests, fellowship subspecialty, or research focus..."
                className="w-full px-3.5 py-2.5 bg-slate-50 focus:bg-white border border-slate-200 focus:border-teal-500 focus:ring-1 focus:ring-teal-500 rounded-xl text-xs sm:text-sm text-slate-900 resize-none"
              />
            </div>

            {/* Verification Checkbox */}
            <div className="p-3.5 bg-teal-50/60 border border-teal-200 rounded-xl space-y-2">
              <label className="flex items-start gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  required
                  checked={agreeTerms}
                  onChange={(e) => setAgreeTerms(e.target.checked)}
                  className="w-4 h-4 mt-0.5 text-teal-700 rounded border-slate-300 focus:ring-teal-500"
                />
                <span className="text-xs text-slate-700 leading-relaxed">
                  I certify that I am a licensed healthcare professional, medical student, or clinical researcher. I agree to adhere to MedConnect AI de-identification standards (HIPAA Safe Harbor) and professional peer-review ethics.
                </span>
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 bg-teal-700 hover:bg-teal-800 disabled:opacity-50 text-white rounded-xl text-sm font-bold shadow-md shadow-teal-700/20 transition"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Creating Clinical Account...</span>
                </>
              ) : (
                <>
                  <span>Complete Registration & Access Network</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Footer Link */}
          <div className="pt-4 border-t border-slate-100 text-center">
            <p className="text-xs text-slate-600">
              Already registered on MedConnect AI?{' '}
              <Link
                href="/login"
                className="font-bold text-teal-700 hover:text-teal-900 hover:underline inline-flex items-center gap-1"
              >
                <span>Sign In to your account</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
