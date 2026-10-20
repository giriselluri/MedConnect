'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useApp } from '@/lib/context';
import {
  Home,
  Newspaper,
  BookOpen,
  FileText,
  Users,
  Compass,
  Sparkles,
  ShieldAlert,
  Building2,
  MapPin,
  ExternalLink,
  Bookmark,
  LogIn,
  UserPlus,
} from 'lucide-react';
import { SpecialtyBadge } from './specialty-badge';

export function LeftSidebar() {
  const pathname = usePathname();
  const { currentUser, isDemoUser, specialties, activeSpecialty, setActiveSpecialty, bookmarks } = useApp();

  const isAdmin = Boolean((currentUser?.is_admin || currentUser?.role === 'admin') && isDemoUser);

  return (
    <aside className="space-y-4">
      {/* Current User Profile Card */}
      <div className="bg-white rounded-xl shadow-xs border border-slate-200 overflow-hidden">
        {/* Card Header Background */}
        <div className="h-20 bg-gradient-to-r from-teal-800 via-teal-700 to-slate-800 relative">
          {isAdmin && (
            <span className="absolute top-2 right-2 px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider bg-amber-500 text-white rounded shadow">
              Admin
            </span>
          )}
        </div>

        {/* Profile Content */}
        <div className="px-4 pb-4 pt-0 relative">
          {/* Avatar */}
          <div className="relative -mt-10 mb-2.5 inline-block">
            <img
              src={currentUser?.avatar_url || 'https://images.unsplash.com/photo-1551601651-2a8555f1a136?auto=format&fit=crop&q=80&w=150'}
              alt={currentUser?.full_name || 'Profile'}
              onError={(e) => {
                e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(currentUser?.full_name || 'Sarah Jenkins')}&background=0d9488&color=fff&bold=true`;
              }}
              className="w-16 h-16 rounded-full object-cover border-3 border-white shadow-md bg-white"
            />
          </div>

          <Link href={`/profile/${currentUser?.id}`} className="group block">
            <h3 className="font-bold text-slate-900 group-hover:text-teal-700 transition text-sm leading-snug">
              {currentUser?.full_name}
            </h3>
            <p className="text-xs text-slate-600 line-clamp-2 mt-0.5 font-normal">
              {currentUser?.title}
            </p>
          </Link>

          <div className="mt-2.5 pt-2.5 border-t border-slate-100 space-y-1.5 text-[11px] text-slate-500">
            {currentUser?.institution && (
              <div className="flex items-center gap-1.5 line-clamp-1">
                <Building2 className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                <span className="truncate">{currentUser.institution}</span>
              </div>
            )}
            {currentUser?.location && (
              <div className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                <span>{currentUser.location}</span>
              </div>
            )}
          </div>

          {/* Specialties */}
          {currentUser?.specialties && currentUser.specialties.length > 0 && (
            <div className="mt-3 pt-2.5 border-t border-slate-100 flex flex-wrap gap-1">
              {currentUser.specialties.map((s) => (
                <SpecialtyBadge key={s.id} id={s.id} name={s.name} size="sm" />
              ))}
            </div>
          )}

          {/* Stats Bar */}
          <div className="mt-3.5 pt-2.5 border-t border-slate-100 grid grid-cols-2 divide-x divide-slate-100 text-center">
            <Link href="/network" className="px-2 py-1 hover:bg-slate-50 rounded transition">
              <span className="block text-xs font-bold text-slate-900">
                {currentUser?.connections_count || 120}
              </span>
              <span className="text-[10px] text-slate-500 font-medium">Connections</span>
            </Link>
            <div className="px-2 py-1">
              <span className="block text-xs font-bold text-slate-900">
                {bookmarks.length}
              </span>
              <span className="text-[10px] text-slate-500 font-medium">Saved Items</span>
            </div>
          </div>
        </div>

        {/* Admin Link if authorized */}
        {isAdmin && (
          <div className="bg-amber-50/70 border-t border-amber-200/80 px-4 py-2 flex items-center justify-between text-xs">
            <span className="font-semibold text-amber-900 flex items-center gap-1.5">
              <ShieldAlert className="w-3.5 h-3.5 text-amber-600" />
              Admin Portal
            </span>
            <Link
              href="/admin"
              className="text-[11px] font-bold text-amber-800 hover:text-amber-950 flex items-center gap-0.5 hover:underline"
            >
              Manage <ExternalLink className="w-3 h-3" />
            </Link>
          </div>
        )}
      </div>

      {/* Primary Navigation Menu */}
      <nav className="bg-white rounded-xl shadow-xs border border-slate-200 p-2 space-y-1">
        <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
          Platform Navigation
        </div>
        {[
          { href: '/feed', label: 'Home Feed', icon: Home },
          { href: '/news', label: 'Medical News', icon: Newspaper },
          { href: '/case-studies', label: 'Case Studies', icon: BookOpen, badge: 'Clinical' },
          { href: '/journals', label: 'Medical Journals', icon: FileText },
          { href: '/network', label: 'My Network', icon: Users },
          { href: '/communities', label: 'Communities', icon: Compass },
          { href: '/research-assistant', label: 'AI Assistant', icon: Sparkles, highlight: true },
        ].map((link) => {
          const Icon = link.icon;
          const isActive = pathname === link.href || (link.href !== '/' && pathname.startsWith(link.href));
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition ${
                isActive
                  ? 'bg-teal-50 text-teal-800 font-bold border-l-3 border-teal-600'
                  : 'text-slate-700 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Icon
                  className={`w-4 h-4 ${
                    link.highlight
                      ? 'text-teal-600'
                      : isActive
                      ? 'text-teal-700'
                      : 'text-slate-500'
                  }`}
                />
                <span>{link.label}</span>
              </div>
              {link.badge && (
                <span className="text-[10px] font-bold bg-teal-100 text-teal-800 px-1.5 py-0.5 rounded-full">
                  {link.badge}
                </span>
              )}
            </Link>
          );
        })}

        {isAdmin && (
          <Link
            href="/admin"
            className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold transition ${
              pathname.startsWith('/admin')
                ? 'bg-amber-50 text-amber-900 font-bold border-l-3 border-amber-600'
                : 'text-amber-800 hover:bg-amber-50/60'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <ShieldAlert className="w-4 h-4 text-amber-600" />
              <span>Admin Portal</span>
            </div>
            <span className="text-[9px] font-extrabold uppercase bg-amber-500 text-white px-1.5 py-0.2 rounded">
              Admin
            </span>
          </Link>
        )}
      </nav>

      {/* Account & Session Access */}
      <div className="bg-white rounded-xl shadow-xs border border-slate-200 p-2.5 space-y-1 text-xs">
        <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
          Account Access
        </div>
        <Link
          href="/login"
          className="flex items-center gap-2 px-2.5 py-1.5 text-slate-700 hover:text-teal-800 hover:bg-teal-50/60 rounded-lg transition font-medium"
        >
          <LogIn className="w-3.5 h-3.5 text-teal-600" />
          <span>Sign In / Switch Doctor</span>
        </Link>
        <Link
          href="/signup"
          className="flex items-center gap-2 px-2.5 py-1.5 text-slate-700 hover:text-teal-800 hover:bg-teal-50/60 rounded-lg transition font-medium"
        >
          <UserPlus className="w-3.5 h-3.5 text-teal-600" />
          <span>Register New Account</span>
        </Link>
      </div>

      {/* Specialty Filter Catalogue */}
      <div className="bg-white rounded-xl shadow-xs border border-slate-200 p-3.5">
        <div className="flex items-center justify-between mb-2.5">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Specialties Filter
          </h4>
          {activeSpecialty && (
            <button
              onClick={() => setActiveSpecialty(null)}
              className="text-[11px] font-medium text-teal-700 hover:underline"
            >
              Reset
            </button>
          )}
        </div>
        <div className="flex flex-wrap gap-1.5 max-h-56 overflow-y-auto pr-1">
          {specialties.map((s) => {
            const isSelected = activeSpecialty === s.id;
            return (
              <SpecialtyBadge
                key={s.id}
                id={s.id}
                name={s.name}
                size="sm"
                active={isSelected}
                onClick={() => setActiveSpecialty(isSelected ? null : s.id)}
              />
            );
          })}
        </div>
      </div>
    </aside>
  );
}
