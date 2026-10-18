'use client';

import React, { useState } from 'react';
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
  User,
  Search,
  Menu,
  X,
  ChevronDown,
  RefreshCw,
  LogOut,
  Stethoscope,
  ShieldCheck,
} from 'lucide-react';
import { UserSwitchModal } from './user-switch-modal';

export function Navbar() {
  const pathname = usePathname();
  const { currentUser } = useApp();
  const [isSwitchModalOpen, setIsSwitchModalOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const navLinks = [
    { href: '/', label: 'Home', icon: Home },
    { href: '/news', label: 'News', icon: Newspaper },
    { href: '/case-studies', label: 'Case Studies', icon: BookOpen, badge: 'Clinical' },
    { href: '/journals', label: 'Journals', icon: FileText },
    { href: '/network', label: 'My Network', icon: Users },
    { href: '/communities', label: 'Communities', icon: Compass },
    { href: '/research-assistant', label: 'AI Assistant', icon: Sparkles, highlight: true },
  ];

  const isAdmin = Boolean(currentUser?.is_admin || currentUser?.role === 'admin');

  return (
    <>
      <header className="sticky top-0 z-40 bg-white border-b border-slate-200/90 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 gap-4">
            {/* Left: Brand & Search */}
            <div className="flex items-center gap-4 lg:gap-6 flex-1 max-w-md">
              <Link href="/" className="flex items-center gap-2 group flex-shrink-0">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-teal-700 to-teal-500 flex items-center justify-center text-white shadow-md group-hover:scale-105 transition-transform">
                  <Stethoscope className="w-5 h-5" />
                </div>
                <div className="flex flex-col">
                  <div className="flex items-center gap-1">
                    <span className="font-extrabold text-slate-900 tracking-tight text-lg leading-none">
                      MedConnect<span className="text-teal-600">AI</span>
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-500 font-medium tracking-wider uppercase leading-none mt-0.5">
                    Healthcare Network
                  </span>
                </div>
              </Link>

              {/* Search bar */}
              <div className="relative w-full hidden md:block">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-4 w-4 text-slate-400" />
                </div>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search doctors, clinical trials, cases..."
                  className="w-full pl-9 pr-4 py-1.5 bg-slate-100 hover:bg-slate-100/80 focus:bg-white text-xs rounded-full border border-transparent focus:border-teal-500 focus:outline-none transition-all placeholder:text-slate-400 text-slate-800"
                />
              </div>
            </div>

            {/* Desktop Navigation Links */}
            <nav className="hidden lg:flex items-center gap-1 xl:gap-2">
              {navLinks.map((link) => {
                const Icon = link.icon;
                const isActive = pathname === link.href || (link.href !== '/' && pathname.startsWith(link.href));
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`relative flex flex-col items-center justify-center px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all group ${
                      isActive
                        ? 'text-teal-700 font-semibold'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    <div className="relative">
                      <Icon
                        className={`w-5 h-5 transition-transform group-hover:-translate-y-0.5 ${
                          link.highlight
                            ? 'text-teal-600'
                            : isActive
                            ? 'text-teal-700'
                            : 'text-slate-500 group-hover:text-slate-700'
                        }`}
                      />
                      {link.badge && (
                        <span className="absolute -top-1 -right-2 px-1 py-0.2 text-[9px] font-bold bg-teal-100 text-teal-800 rounded-full">
                          {link.badge}
                        </span>
                      )}
                    </div>
                    <span className="mt-1 text-[11px]">{link.label}</span>
                    {isActive && (
                      <span className="absolute bottom-0 inset-x-2 h-0.5 bg-teal-600 rounded-full" />
                    )}
                  </Link>
                );
              })}

              {/* Admin Portal Nav Item (Always clearly visible & accessible) */}
              <Link
                href="/admin"
                className={`flex flex-col items-center justify-center px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all relative ${
                  pathname.startsWith('/admin')
                    ? 'text-amber-800 font-semibold bg-amber-50/80 border border-amber-200'
                    : 'text-slate-700 hover:bg-amber-50/50 hover:text-amber-900'
                }`}
              >
                <div className="relative">
                  <ShieldAlert className="w-5 h-5 text-amber-600" />
                  <span className="absolute -top-1 -right-2 px-1 py-0.2 text-[9px] font-extrabold bg-amber-500 text-white rounded-full">
                    Admin
                  </span>
                </div>
                <span className="mt-1 text-[11px] font-semibold">Admin Portal</span>
                {pathname.startsWith('/admin') && (
                  <span className="absolute bottom-0 inset-x-2 h-0.5 bg-amber-600 rounded-full" />
                )}
              </Link>
            </nav>

            {/* Right: Persona Switcher & User Profile Menu */}
            <div className="flex items-center gap-2.5">
              {/* Persona Switcher Pill */}
              <button
                onClick={() => setIsSwitchModalOpen(true)}
                className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 bg-slate-100 hover:bg-teal-50 text-slate-700 hover:text-teal-800 border border-slate-200 hover:border-teal-300 rounded-full text-xs font-medium transition shadow-2xs"
                title="Switch persona for testing different roles & admin privileges"
              >
                <RefreshCw className="w-3.5 h-3.5 text-teal-600" />
                <span>Demo Persona</span>
              </button>

              {/* Profile Menu Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                  className="flex items-center gap-2 p-1 rounded-full hover:bg-slate-100 transition focus:outline-none"
                >
                  <div className="relative">
                    <img
                      src={currentUser?.avatar_url || 'https://images.unsplash.com/photo-1594824813629-4d6f43694f4c?auto=format&fit=crop&q=80&w=150'}
                      alt={currentUser?.full_name || 'Profile'}
                      className="w-8 h-8 rounded-full object-cover border border-slate-200"
                    />
                    {isAdmin && (
                      <span className="absolute -bottom-0.5 -right-0.5 bg-amber-500 text-white rounded-full p-0.5">
                        <ShieldCheck className="w-2.5 h-2.5" />
                      </span>
                    )}
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-500 hidden sm:block" />
                </button>

                {isProfileMenuOpen && (
                  <div
                    className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-slate-200 py-1.5 z-50 animate-fade-in"
                    onMouseLeave={() => setIsProfileMenuOpen(false)}
                  >
                    <div className="px-4 py-2.5 border-b border-slate-100">
                      <div className="flex items-center gap-2">
                        <p className="text-xs font-bold text-slate-900 truncate">
                          {currentUser?.full_name}
                        </p>
                        {isAdmin && (
                          <span className="px-1.5 py-0.2 text-[9px] font-bold bg-amber-100 text-amber-800 rounded">
                            Admin
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-500 truncate mt-0.5">
                        {currentUser?.title}
                      </p>
                      <p className="text-[10px] text-teal-700 font-medium truncate mt-0.5">
                        {currentUser?.institution}
                      </p>
                    </div>

                    <div className="py-1">
                      <Link
                        href={`/profile/${currentUser?.id}`}
                        onClick={() => setIsProfileMenuOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 transition"
                      >
                        <User className="w-4 h-4 text-slate-400" />
                        <span>View Full Profile</span>
                      </Link>
                      <Link
                        href="/admin"
                        onClick={() => setIsProfileMenuOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2 text-xs text-slate-700 hover:bg-amber-50/50 transition font-medium"
                      >
                        <ShieldAlert className="w-4 h-4 text-amber-600" />
                        <span className="text-slate-900">Admin Portal</span>
                      </Link>
                      <button
                        onClick={() => {
                          setIsProfileMenuOpen(false);
                          setIsSwitchModalOpen(true);
                        }}
                        className="w-full flex items-center gap-2.5 px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 transition"
                      >
                        <RefreshCw className="w-4 h-4 text-teal-600" />
                        <span>Switch Healthcare Persona</span>
                      </button>
                    </div>

                    <div className="border-t border-slate-100 pt-1">
                      <div className="px-4 py-1.5 text-[10px] text-slate-400">
                        Signed in as {currentUser?.role?.replace('_', ' ')}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Mobile menu hamburger toggle */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="lg:hidden p-1.5 rounded-lg text-slate-600 hover:bg-slate-100"
              >
                {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile dropdown drawer */}
        {isMobileMenuOpen && (
          <div className="lg:hidden border-t border-slate-200 bg-white px-4 py-3 space-y-2">
            <div className="relative w-full mb-3">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search MedConnect..."
                className="w-full pl-9 pr-4 py-2 bg-slate-100 text-xs rounded-lg border border-transparent focus:outline-none"
              />
            </div>
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium ${
                    isActive ? 'bg-teal-50 text-teal-800 font-semibold' : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <Icon className="w-5 h-5 text-teal-600" />
                  <span>{link.label}</span>
                </Link>
              );
            })}
            <Link
              href="/admin"
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-semibold bg-amber-50 text-amber-900 border border-amber-200"
            >
              <ShieldAlert className="w-5 h-5 text-amber-600" />
              <span>Admin Portal</span>
            </Link>
            <button
              onClick={() => {
                setIsMobileMenuOpen(false);
                setIsSwitchModalOpen(true);
              }}
              className="w-full flex items-center justify-center gap-2 py-2 mt-2 bg-slate-100 text-xs font-semibold text-slate-700 rounded-lg"
            >
              <RefreshCw className="w-4 h-4 text-teal-600" />
              Switch Healthcare Persona
            </button>
          </div>
        )}
      </header>

      {/* Persona Switch Modal */}
      <UserSwitchModal
        isOpen={isSwitchModalOpen}
        onClose={() => setIsSwitchModalOpen(false)}
      />
    </>
  );
}
