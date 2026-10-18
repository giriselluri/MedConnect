'use client';

import React from 'react';
import { useApp } from '@/lib/context';
import { X, ShieldCheck, CheckCircle2, UserCheck, Stethoscope, GraduationCap, FlaskConical, Pill } from 'lucide-react';
import { UserRole } from '@/types';

interface UserSwitchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function UserSwitchModal({ isOpen, onClose }: UserSwitchModalProps) {
  const { currentUser, allProfiles, switchUser } = useApp();

  if (!isOpen) return null;

  const getRoleIcon = (role: UserRole) => {
    switch (role) {
      case 'admin':
        return <ShieldCheck className="w-4 h-4 text-amber-600" />;
      case 'healthcare_professional':
        return <Stethoscope className="w-4 h-4 text-teal-600" />;
      case 'medical_student':
        return <GraduationCap className="w-4 h-4 text-blue-600" />;
      case 'researcher':
        return <FlaskConical className="w-4 h-4 text-purple-600" />;
      case 'pharmaceutical_professional':
        return <Pill className="w-4 h-4 text-emerald-600" />;
      default:
        return <UserCheck className="w-4 h-4 text-slate-600" />;
    }
  };

  const getRoleLabel = (role: UserRole) => {
    switch (role) {
      case 'admin':
        return 'Chief Medical Officer / Platform Admin';
      case 'healthcare_professional':
        return 'Healthcare Professional';
      case 'medical_student':
        return 'Medical Student';
      case 'researcher':
        return 'Clinical & Scientific Researcher';
      case 'pharmaceutical_professional':
        return 'Pharmaceutical Professional';
      default:
        return 'Healthcare Professional';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 text-xs font-bold tracking-wider uppercase bg-teal-100 text-teal-800 rounded">
                Product Demo Mode
              </span>
              <h2 className="text-lg font-bold text-slate-900">Switch Healthcare Persona</h2>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Select any fictional profile to test distinct role-based experiences, admin privileges, and feed workflows.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* List of profiles */}
        <div className="p-6 overflow-y-auto space-y-2.5 divide-y divide-slate-100">
          {allProfiles.map((profile) => {
            const isSelected = currentUser?.id === profile.id;
            return (
              <div
                key={profile.id}
                onClick={async () => {
                  await switchUser(profile.id);
                  onClose();
                }}
                className={`pt-2.5 first:pt-0 flex items-center justify-between p-3 rounded-xl cursor-pointer border transition-all ${
                  isSelected
                    ? 'bg-teal-50/80 border-teal-500 shadow-sm'
                    : 'bg-white border-slate-200/80 hover:bg-slate-50 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center gap-3.5">
                  <div className="relative">
                    <img
                      src={profile.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.full_name)}&background=0d9488&color=fff`}
                      alt={profile.full_name}
                      className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-sm"
                    />
                    {profile.is_admin && (
                      <span className="absolute -bottom-1 -right-1 bg-amber-500 text-white rounded-full p-0.5 shadow">
                        <ShieldCheck className="w-3.5 h-3.5" />
                      </span>
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-slate-900 text-sm">{profile.full_name}</span>
                      {profile.is_admin && (
                        <span className="px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-amber-100 text-amber-800 rounded">
                          Admin
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-600 line-clamp-1">{profile.title}</p>
                    <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-500">
                      <span className="inline-flex items-center gap-1 font-medium text-slate-700">
                        {getRoleIcon(profile.role)}
                        {getRoleLabel(profile.role)}
                      </span>
                      <span>•</span>
                      <span>{profile.institution}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center pl-2">
                  {isSelected ? (
                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-teal-700 bg-teal-100/80 px-2.5 py-1 rounded-full">
                      <CheckCircle2 className="w-4 h-4 text-teal-600" />
                      Active
                    </span>
                  ) : (
                    <button className="text-xs font-medium text-slate-500 group-hover:text-teal-700 px-2.5 py-1 rounded-md border border-slate-200 hover:border-teal-400 hover:bg-white transition">
                      Switch
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <span>Notice: All demo profiles are synthetic for testing and clinical education.</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-100 transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
