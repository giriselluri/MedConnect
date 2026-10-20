'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useApp } from '@/lib/context';
import { UserRole } from '@/types';
import { trackAppEvent } from '@/lib/analytics';
import {
  Stethoscope,
  GraduationCap,
  FlaskConical,
  Pill,
  ShieldCheck,
  UserCheck,
  Check,
  ArrowRight,
  ArrowLeft,
  AlertTriangle,
  CheckCircle2,
  Loader2,
  Lock,
  Mail,
  User,
  MapPin,
  Building2,
  Briefcase,
  Sparkles,
  Award,
  Activity,
  ChevronRight,
  X,
} from 'lucide-react';

interface CategoryConfig {
  role: UserRole;
  title: string;
  badge: string;
  subtitle: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  accentColor: string;
  titleLabel: string;
  titlePlaceholder: string;
  institutionLabel: string;
  institutionPlaceholder: string;
  experienceLabel?: string;
  experiencePlaceholder?: string;
  specialtiesLabel?: string;
  specialtiesRequired?: boolean;
  qualificationsLabel?: string;
  qualificationsPlaceholder?: string;
  bioLabel?: string;
  bioPlaceholder?: string;
}

const PROFESSIONAL_CATEGORIES: CategoryConfig[] = [
  {
    role: 'healthcare_professional',
    title: 'Healthcare Professional',
    badge: 'Clinical Care',
    subtitle: 'Physicians, Specialists & Surgeons',
    description: 'Board-certified or practicing clinicians, attending physicians, and surgical specialists providing direct patient care.',
    icon: Stethoscope,
    accentColor: 'teal',
    titleLabel: 'Clinical & Professional Title',
    titlePlaceholder: 'e.g. Attending Interventional Cardiologist, Associate Professor',
    institutionLabel: 'Primary Hospital or Health System',
    institutionPlaceholder: 'e.g. Massachusetts General Hospital, Cleveland Clinic',
    specialtiesLabel: 'Clinical Specialties (Select at least 1)',
    specialtiesRequired: true,
    experienceLabel: 'Years in Active Clinical Practice',
    experiencePlaceholder: 'e.g. 10',
    qualificationsLabel: 'Medical Degrees & Certifications',
    qualificationsPlaceholder: 'e.g. MD, FACC, Board Certified in Cardiology',
  },
  {
    role: 'medical_student',
    title: 'Medical Student & Resident',
    badge: 'Training & Education',
    subtitle: 'Residents, Fellows & Medical Students',
    description: 'Postgraduate clinical trainees, interns, residents, subspecialty fellows, and accredited medical students.',
    icon: GraduationCap,
    accentColor: 'blue',
    titleLabel: 'Training Level & Designation',
    titlePlaceholder: 'e.g. PGY-2 Internal Medicine Resident, Cardiology Fellow, MS-4',
    institutionLabel: 'Medical School or Teaching Hospital',
    institutionPlaceholder: 'e.g. Johns Hopkins School of Medicine, Stanford Hospital',
    specialtiesLabel: 'Specialty of Interest / Fellowship Focus',
    specialtiesRequired: false,
    experienceLabel: 'Current Year of Training / Medical Study',
    experiencePlaceholder: 'e.g. 2',
    qualificationsLabel: 'Previous Undergraduate or Master’s Degrees (Optional)',
    qualificationsPlaceholder: 'e.g. BS in Biomedical Engineering, MS',
  },
  {
    role: 'researcher',
    title: 'Clinical & Scientific Researcher',
    badge: 'Discovery & Trials',
    subtitle: 'Trial Investigators & Scientists',
    description: 'Principal investigators, translational scientists, PhD researchers, and clinical trial methodologists.',
    icon: FlaskConical,
    accentColor: 'purple',
    titleLabel: 'Investigation / Academic Title',
    titlePlaceholder: 'e.g. Principal Investigator in Molecular Genomics, Research Scientist',
    institutionLabel: 'Research Institute or University',
    institutionPlaceholder: 'e.g. Broad Institute of MIT and Harvard, Dana-Farber',
    specialtiesLabel: 'Primary Scientific / Therapeutic Domain',
    specialtiesRequired: false,
    experienceLabel: 'Years in Scientific & Clinical Research',
    experiencePlaceholder: 'e.g. 8',
    bioLabel: 'Primary Research Focus / Lab Mission',
    bioPlaceholder: 'Brief description of your research focus, target pathways, or clinical trials...',
  },
  {
    role: 'pharmaceutical_professional',
    title: 'Pharmaceutical Professional',
    badge: 'Life Sciences',
    subtitle: 'Medical Affairs, R&D & Clinical Science',
    description: 'Industry professionals in medical affairs, MSL teams, clinical trial operations, and pharmacovigilance.',
    icon: Pill,
    accentColor: 'emerald',
    titleLabel: 'Corporate / Medical Affairs Title',
    titlePlaceholder: 'e.g. Senior Director of Medical Affairs, Medical Science Liaison (MSL)',
    institutionLabel: 'Pharmaceutical or Biotech Company',
    institutionPlaceholder: 'e.g. BioVance Therapeutics, Novartis, Pfizer Oncology',
    specialtiesLabel: 'Therapeutic Area of Expertise',
    specialtiesRequired: false,
    experienceLabel: 'Years in Industry / Medical Affairs',
    experiencePlaceholder: 'e.g. 12',
    qualificationsLabel: 'Degrees & Clinical Credentials',
    qualificationsPlaceholder: 'e.g. PharmD, BCPS, PhD',
  },
  {
    role: 'admin',
    title: 'Clinical Administrator',
    badge: 'Hospital Leadership',
    subtitle: 'CMO, Medical Directors & Governance',
    description: 'Chief medical officers, medical directors, department chairs, and hospital quality governance administrators.',
    icon: ShieldCheck,
    accentColor: 'amber',
    titleLabel: 'Administrative / Executive Title',
    titlePlaceholder: 'e.g. Chief Medical Officer, Department Chair of Medicine',
    institutionLabel: 'Hospital Network or Health Authority',
    institutionPlaceholder: 'e.g. Metropolitan Academic Health System, Mayo Clinic',
    specialtiesLabel: 'Primary Clinical Department Overseen',
    specialtiesRequired: false,
    experienceLabel: 'Years in Healthcare & Clinical Leadership',
    experiencePlaceholder: 'e.g. 15',
    qualificationsLabel: 'Executive & Clinical Qualifications',
    qualificationsPlaceholder: 'e.g. MD, FACP, Executive Healthcare Leadership',
  },
  {
    role: 'other_healthcare_professional',
    title: 'Other Healthcare Professional',
    badge: 'Allied & Nursing',
    subtitle: 'Nurse Practitioners, PAs & Allied Health',
    description: 'Nurse practitioners, physician assistants, clinical pharmacists, therapists, and allied healthcare specialists.',
    icon: UserCheck,
    accentColor: 'slate',
    titleLabel: 'Clinical Practice Title',
    titlePlaceholder: 'e.g. Family Nurse Practitioner, Emergency Medicine PA, Clinical Specialist',
    institutionLabel: 'Clinic, Practice, or Medical Center',
    institutionPlaceholder: 'e.g. Austin Family Health Center, Community Memorial Clinic',
    specialtiesLabel: 'Clinical Practice Specialty',
    specialtiesRequired: false,
    experienceLabel: 'Years of Clinical Practice',
    experiencePlaceholder: 'e.g. 6',
    qualificationsLabel: 'Professional Credentials & Licensures',
    qualificationsPlaceholder: 'e.g. MSN, APRN, FNP-BC, PA-C',
  },
];

export default function SignupPage() {
  const router = useRouter();
  const { specialties, switchUser } = useApp();

  // Wizard state: Step 1 (Select Category) -> Step 2 (Category-Specific Profile)
  const [currentStep, setCurrentStep] = useState<1 | 2>(1);
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);

  // Common shared fields
  const [commonFields, setCommonFields] = useState({
    fullName: '',
    email: '',
    password: '',
    location: '',
  });

  // Category-specific fields
  const [categoryFields, setCategoryFields] = useState({
    title: '',
    institution: '',
    selectedSpecialties: [] as string[],
    yearsOfExperience: '',
    qualifications: '',
    bio: '',
  });

  const [agreeTerms, setAgreeTerms] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const activeCategory = PROFESSIONAL_CATEGORIES.find((c) => c.role === selectedRole);

  // Handle category selection
  const handleSelectCategory = (role: UserRole) => {
    setSelectedRole(role);
    // Clear category-specific fields when changing category to avoid submitting irrelevant fields
    setCategoryFields({
      title: '',
      institution: '',
      selectedSpecialties: role === 'healthcare_professional' ? ['cardiology'] : [],
      yearsOfExperience: '',
      qualifications: '',
      bio: '',
    });
    setError(null);
  };

  const handleContinueToStep2 = () => {
    if (!selectedRole) {
      setError('Please select your professional category to continue.');
      return;
    }
    setError(null);
    setCurrentStep(2);
    trackAppEvent('signup_started', { role: selectedRole });
    // Scroll smoothly to top
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleBackToStep1 = () => {
    setCurrentStep(1);
    setError(null);
  };

  const toggleSpecialty = (id: string) => {
    setCategoryFields((prev) => {
      const exists = prev.selectedSpecialties.includes(id);
      return {
        ...prev,
        selectedSpecialties: exists
          ? prev.selectedSpecialties.filter((s) => s !== id)
          : [...prev.selectedSpecialties, id],
      };
    });
  };

  const handleSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRole || !activeCategory) {
      setError('Please select a valid professional category.');
      setCurrentStep(1);
      return;
    }

    // Common validations
    if (!commonFields.fullName.trim()) {
      setError('Please provide your full legal name and professional suffix.');
      return;
    }
    if (!commonFields.email.trim() || !commonFields.email.includes('@')) {
      setError('Please enter a valid institutional or professional email address.');
      return;
    }
    if (!commonFields.password || commonFields.password.length < 6) {
      setError('Please provide a secure password with at least 6 characters.');
      return;
    }
    if (!commonFields.location.trim()) {
      setError('Please enter your primary practice location (City, State/Country).');
      return;
    }

    // Category-specific validations
    if (!categoryFields.title.trim()) {
      setError(`Please provide your ${activeCategory.titleLabel.toLowerCase()}.`);
      return;
    }
    if (!categoryFields.institution.trim()) {
      setError(`Please provide your ${activeCategory.institutionLabel.toLowerCase()}.`);
      return;
    }
    if (activeCategory.specialtiesRequired && categoryFields.selectedSpecialties.length === 0) {
      setError('Please select at least one clinical specialty to route peer content.');
      return;
    }
    if (!agreeTerms) {
      setError('You must agree to the clinical peer-review and privacy guidelines to register.');
      return;
    }

    setError(null);
    setIsLoading(true);

    try {
      const payload = {
        full_name: commonFields.fullName.trim(),
        email: commonFields.email.trim(),
        role: selectedRole,
        title: categoryFields.title.trim(),
        institution: categoryFields.institution.trim(),
        location: commonFields.location.trim(),
        specialty_ids: categoryFields.selectedSpecialties,
        years_of_experience: Number(categoryFields.yearsOfExperience) || (selectedRole === 'medical_student' ? 2 : 5),
        qualifications: categoryFields.qualifications.trim()
          ? categoryFields.qualifications.split(',').map((q) => q.trim()).filter(Boolean)
          : undefined,
        bio: categoryFields.bio.trim() || undefined,
      };

      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to complete registration.');
      }

      // Track successful signup completion (strictly firing only on success)
      trackAppEvent('signup_completed', {
        role: selectedRole,
        specialties_count: categoryFields.selectedSpecialties.length,
      });

      if (typeof window !== 'undefined') {
        localStorage.setItem('medconnect_logged_in', 'true');
        localStorage.setItem('medconnect_is_registered_user', 'true');
        document.cookie = 'medconnect_logged_in=true; path=/; max-age=2592000';
      }

      await switchUser(data.user.id);
      setSuccess(true);

      setTimeout(() => {
        router.push('/feed');
      }, 900);
    } catch (err: any) {
      setError(err.message || 'Error creating account. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-b from-slate-50 via-slate-100/60 to-teal-50/40 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <Link href="/login" className="inline-flex items-center gap-2.5">
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
            Create Verified Healthcare Account
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 max-w-lg mx-auto">
            Join thousands of verified doctors, researchers, trainees, and life sciences leaders on MedConnect AI.
          </p>
        </div>

        {/* Step Progress Bar */}
        <div className="bg-white rounded-2xl border border-slate-200 p-3 sm:p-4 shadow-xs">
          <div className="grid grid-cols-2 gap-2 text-xs">
            {/* Step 1 Pill */}
            <button
              type="button"
              onClick={handleBackToStep1}
              className={`flex items-center gap-2 p-2.5 rounded-xl border text-left transition ${
                currentStep === 1
                  ? 'border-teal-600 bg-teal-50/80 text-teal-950 font-bold'
                  : 'border-slate-200 bg-slate-50/60 text-slate-600 hover:bg-slate-100'
              }`}
            >
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                  currentStep > 1
                    ? 'bg-teal-700 text-white'
                    : currentStep === 1
                    ? 'bg-teal-600 text-white'
                    : 'bg-slate-200 text-slate-600'
                }`}
              >
                {currentStep > 1 ? <Check className="w-3.5 h-3.5" /> : '1'}
              </div>
              <div className="min-w-0">
                <p className="leading-tight font-semibold">1. Professional Category</p>
                <p className="text-[10px] text-slate-400 font-normal truncate">
                  {selectedRole ? activeCategory?.title : 'Select your role'}
                </p>
              </div>
            </button>

            {/* Step 2 Pill */}
            <div
              className={`flex items-center gap-2 p-2.5 rounded-xl border text-left transition ${
                currentStep === 2
                  ? 'border-teal-600 bg-teal-50/80 text-teal-950 font-bold'
                  : 'border-slate-200 bg-slate-50/60 text-slate-400'
              }`}
            >
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                  currentStep === 2 ? 'bg-teal-600 text-white' : 'bg-slate-200 text-slate-600'
                }`}
              >
                2
              </div>
              <div className="min-w-0">
                <p className="leading-tight font-semibold">2. Complete Profile</p>
                <p className="text-[10px] text-slate-400 font-normal truncate">
                  Category credentials
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Form Container */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xl shadow-slate-200/50 p-6 sm:p-8 space-y-6">
          {/* Alerts */}
          {error && (
            <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-start gap-2.5 animate-fade-in">
              <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5 text-red-600" />
              <div className="space-y-0.5">
                <p className="font-semibold">{error}</p>
              </div>
            </div>
          )}

          {success && (
            <div className="p-4 bg-teal-50 border border-teal-200 rounded-xl text-xs text-teal-800 font-semibold flex items-center gap-2.5 animate-fade-in">
              <CheckCircle2 className="w-5 h-5 flex-shrink-0 text-teal-600" />
              <span>Registration completed! Welcome to MedConnect AI. Redirecting to feed...</span>
            </div>
          )}

          {/* STEP 1: Select Professional Category */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div className="border-b border-slate-100 pb-3">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-teal-700 bg-teal-50 px-2.5 py-0.5 rounded-full border border-teal-200 inline-block mb-1">
                  Step 1 of 2
                </span>
                <h2 className="text-lg font-extrabold text-slate-900 tracking-tight">
                  Select Your Professional Healthcare Category
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Choose the category that best represents your clinical practice, academic role, or healthcare affiliation.
                </p>
              </div>

              {/* 6 Category Selection Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {PROFESSIONAL_CATEGORIES.map((cat) => {
                  const isSelected = selectedRole === cat.role;
                  const Icon = cat.icon;

                  return (
                    <button
                      key={cat.role}
                      type="button"
                      onClick={() => handleSelectCategory(cat.role)}
                      className={`relative p-4 rounded-2xl border text-left transition flex flex-col justify-between gap-3 group cursor-pointer ${
                        isSelected
                          ? 'border-teal-600 bg-teal-50/70 shadow-md ring-2 ring-teal-600/30'
                          : 'border-slate-200 hover:border-slate-300 bg-slate-50/40 hover:bg-white shadow-2xs'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div
                          className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition ${
                            isSelected
                              ? 'bg-teal-700 text-white shadow-xs'
                              : 'bg-white border border-slate-200 text-slate-700 group-hover:text-teal-700 group-hover:border-teal-300'
                          }`}
                        >
                          <Icon className="w-5 h-5" />
                        </div>

                        {isSelected && (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-teal-800 bg-teal-100 px-2 py-0.5 rounded-full">
                            <Check className="w-3.5 h-3.5 text-teal-700" />
                            Selected
                          </span>
                        )}
                      </div>

                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5">
                          <h3 className="text-sm font-bold text-slate-900 leading-tight">
                            {cat.title}
                          </h3>
                        </div>
                        <p className="text-xs font-semibold text-teal-800">
                          {cat.subtitle}
                        </p>
                        <p className="text-[11px] text-slate-500 leading-relaxed pt-0.5">
                          {cat.description}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Step 1 Actions */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
                <Link
                  href="/login"
                  className="text-xs font-semibold text-slate-600 hover:text-slate-900"
                >
                  ← Back to Login
                </Link>

                <button
                  type="button"
                  onClick={handleContinueToStep2}
                  disabled={!selectedRole}
                  className="inline-flex items-center gap-2 px-6 py-2.5 bg-teal-700 hover:bg-teal-800 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-xl text-xs sm:text-sm font-bold shadow-md shadow-teal-700/20 transition"
                >
                  <span>Continue with {activeCategory?.title || 'Selected Category'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: Show Category-Specific Signup Fields */}
          {currentStep === 2 && activeCategory && (
            <form onSubmit={handleSignupSubmit} className="space-y-6">
              {/* Category Active Header with Change Button */}
              <div className="p-3.5 bg-teal-50/80 border border-teal-200 rounded-2xl flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-xl bg-teal-700 text-white flex items-center justify-center flex-shrink-0">
                    <activeCategory.icon className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] uppercase font-bold text-teal-800 bg-teal-100/80 px-2 py-0.2 rounded-full">
                        {activeCategory.badge}
                      </span>
                      <h3 className="text-xs sm:text-sm font-bold text-teal-950 truncate">
                        {activeCategory.title}
                      </h3>
                    </div>
                    <p className="text-[11px] text-teal-800/80 truncate">
                      {activeCategory.subtitle}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleBackToStep1}
                  className="inline-flex items-center gap-1 text-xs font-bold text-teal-800 hover:text-teal-950 bg-white hover:bg-teal-100/60 border border-teal-300 px-3 py-1.5 rounded-xl transition flex-shrink-0"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Change Category</span>
                </button>
              </div>

              {/* Section A: Common Shared Credentials */}
              <div className="space-y-4">
                <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-500 border-b border-slate-100 pb-1.5 flex items-center gap-1.5">
                  <User className="w-4 h-4 text-teal-600" />
                  <span>1. Identity & Sign-In Details</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Full Legal Name & Medical Degree *
                    </label>
                    <input
                      type="text"
                      required
                      value={commonFields.fullName}
                      onChange={(e) => setCommonFields({ ...commonFields, fullName: e.target.value })}
                      placeholder="e.g. Dr. Rebecca Vance, MD, FACC"
                      className="w-full px-3.5 py-2.5 bg-slate-50 focus:bg-white border border-slate-200 focus:border-teal-500 focus:ring-1 focus:ring-teal-500 rounded-xl text-xs sm:text-sm text-slate-900 transition"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Professional / Institutional Email *
                    </label>
                    <input
                      type="email"
                      required
                      value={commonFields.email}
                      onChange={(e) => setCommonFields({ ...commonFields, email: e.target.value })}
                      placeholder="e.g. rvance@hospital.org"
                      className="w-full px-3.5 py-2.5 bg-slate-50 focus:bg-white border border-slate-200 focus:border-teal-500 focus:ring-1 focus:ring-teal-500 rounded-xl text-xs sm:text-sm text-slate-900 transition"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Access Password *
                    </label>
                    <input
                      type="password"
                      required
                      value={commonFields.password}
                      onChange={(e) => setCommonFields({ ...commonFields, password: e.target.value })}
                      placeholder="Create a password (min 6 characters)"
                      className="w-full px-3.5 py-2.5 bg-slate-50 focus:bg-white border border-slate-200 focus:border-teal-500 focus:ring-1 focus:ring-teal-500 rounded-xl text-xs sm:text-sm text-slate-900 transition"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Primary Location (City, State / Region) *
                    </label>
                    <input
                      type="text"
                      required
                      value={commonFields.location}
                      onChange={(e) => setCommonFields({ ...commonFields, location: e.target.value })}
                      placeholder="e.g. Boston, MA or London, UK"
                      className="w-full px-3.5 py-2.5 bg-slate-50 focus:bg-white border border-slate-200 focus:border-teal-500 focus:ring-1 focus:ring-teal-500 rounded-xl text-xs sm:text-sm text-slate-900 transition"
                    />
                  </div>
                </div>
              </div>

              {/* Section B: Category-Specific Fields */}
              <div className="space-y-4">
                <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-500 border-b border-slate-100 pb-1.5 flex items-center gap-1.5">
                  <Briefcase className="w-4 h-4 text-teal-600" />
                  <span>2. {activeCategory.title} Credentials</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      {activeCategory.titleLabel} *
                    </label>
                    <input
                      type="text"
                      required
                      value={categoryFields.title}
                      onChange={(e) => setCategoryFields({ ...categoryFields, title: e.target.value })}
                      placeholder={activeCategory.titlePlaceholder}
                      className="w-full px-3.5 py-2.5 bg-slate-50 focus:bg-white border border-slate-200 focus:border-teal-500 focus:ring-1 focus:ring-teal-500 rounded-xl text-xs sm:text-sm text-slate-900 transition"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      {activeCategory.institutionLabel} *
                    </label>
                    <input
                      type="text"
                      required
                      value={categoryFields.institution}
                      onChange={(e) => setCategoryFields({ ...categoryFields, institution: e.target.value })}
                      placeholder={activeCategory.institutionPlaceholder}
                      className="w-full px-3.5 py-2.5 bg-slate-50 focus:bg-white border border-slate-200 focus:border-teal-500 focus:ring-1 focus:ring-teal-500 rounded-xl text-xs sm:text-sm text-slate-900 transition"
                    />
                  </div>
                </div>

                {/* Optional Qualifications / Degrees where relevant */}
                {activeCategory.qualificationsLabel && (
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      {activeCategory.qualificationsLabel}
                    </label>
                    <input
                      type="text"
                      value={categoryFields.qualifications}
                      onChange={(e) => setCategoryFields({ ...categoryFields, qualifications: e.target.value })}
                      placeholder={activeCategory.qualificationsPlaceholder}
                      className="w-full px-3.5 py-2.5 bg-slate-50 focus:bg-white border border-slate-200 focus:border-teal-500 focus:ring-1 focus:ring-teal-500 rounded-xl text-xs sm:text-sm text-slate-900 transition"
                    />
                  </div>
                )}

                {/* Optional Years of Experience */}
                {activeCategory.experienceLabel && (
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      {activeCategory.experienceLabel}
                    </label>
                    <input
                      type="number"
                      min={0}
                      max={60}
                      value={categoryFields.yearsOfExperience}
                      onChange={(e) => setCategoryFields({ ...categoryFields, yearsOfExperience: e.target.value })}
                      placeholder={activeCategory.experiencePlaceholder || 'e.g. 5'}
                      className="w-full sm:w-1/2 px-3.5 py-2.5 bg-slate-50 focus:bg-white border border-slate-200 focus:border-teal-500 focus:ring-1 focus:ring-teal-500 rounded-xl text-xs sm:text-sm text-slate-900 transition"
                    />
                  </div>
                )}

                {/* Researcher Bio Focus */}
                {activeCategory.bioLabel && (
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      {activeCategory.bioLabel}
                    </label>
                    <textarea
                      rows={3}
                      value={categoryFields.bio}
                      onChange={(e) => setCategoryFields({ ...categoryFields, bio: e.target.value })}
                      placeholder={activeCategory.bioPlaceholder}
                      className="w-full p-3 bg-slate-50 focus:bg-white border border-slate-200 focus:border-teal-500 focus:ring-1 focus:ring-teal-500 rounded-xl text-xs sm:text-sm text-slate-900 transition resize-none"
                    />
                  </div>
                )}

                {/* Specialties Selector */}
                {activeCategory.specialtiesLabel && (
                  <div className="space-y-2 pt-1">
                    <label className="block text-xs font-bold text-slate-700">
                      {activeCategory.specialtiesLabel}
                    </label>
                    <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto p-1 bg-slate-50/50 rounded-xl border border-slate-200">
                      {specialties.map((s) => {
                        const isSelected = categoryFields.selectedSpecialties.includes(s.id);
                        return (
                          <button
                            key={s.id}
                            type="button"
                            onClick={() => toggleSpecialty(s.id)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition border flex items-center gap-1.5 ${
                              isSelected
                                ? 'bg-teal-700 text-white border-teal-800 shadow-2xs'
                                : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
                            }`}
                          >
                            <span>{s.name}</span>
                            {isSelected && <Check className="w-3 h-3 text-white" />}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* Terms Checkbox */}
              <div className="pt-2 border-t border-slate-100">
                <label className="flex items-start gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={agreeTerms}
                    onChange={(e) => setAgreeTerms(e.target.checked)}
                    className="w-4 h-4 mt-0.5 text-teal-700 rounded border-slate-300 focus:ring-teal-500"
                  />
                  <span className="text-xs text-slate-600 leading-relaxed">
                    I confirm that I am a healthcare, clinical, research, or life sciences professional and agree to MedConnect AI’s{' '}
                    <span className="text-teal-700 font-semibold underline">Clinical Peer-Review Terms</span> and HIPAA Privacy Standards.
                  </span>
                </label>
              </div>

              {/* Submit Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3">
                <button
                  type="button"
                  onClick={handleBackToStep1}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2.5 text-xs font-bold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back to Category Selection</span>
                </button>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-2.5 bg-teal-700 hover:bg-teal-800 disabled:opacity-50 text-white rounded-xl text-xs sm:text-sm font-bold shadow-md shadow-teal-700/20 transition"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Creating Clinical Account...</span>
                    </>
                  ) : (
                    <>
                      <span>Complete Registration</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </form>
          )}

          {/* Bottom Login Link */}
          <div className="pt-4 border-t border-slate-100 text-center">
            <p className="text-xs text-slate-600">
              Already have a verified clinical account?{' '}
              <Link
                href="/login"
                className="font-bold text-teal-700 hover:text-teal-900 hover:underline inline-flex items-center gap-1"
              >
                <span>Sign In to Portal</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
