'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useApp } from '@/lib/context';
import { Profile, CaseStudy, Group, Notification } from '@/types';
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
  LogIn,
  UserPlus,
  Stethoscope,
  ShieldCheck,
  Bell,
  Heart,
  MessageSquare,
  Repeat,
  Check,
  UserCheck,
  ArrowRight,
  Loader2,
  KeyRound,
  Copy,
} from 'lucide-react';
import { UserSwitchModal } from './user-switch-modal';

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const isAuthPage = pathname === '/login' || pathname === '/signup';
  const { currentUser, isDemoUser, logout } = useApp();
  const [isSwitchModalOpen, setIsSwitchModalOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');

  // Live global search state
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [liveResults, setLiveResults] = useState<{
    profiles: Profile[];
    caseStudies: CaseStudy[];
    groups: Group[];
    total: number;
  } | null>(null);
  const searchDropdownRef = useRef<HTMLDivElement>(null);

  // Close live search on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (searchDropdownRef.current && !searchDropdownRef.current.contains(e.target as Node)) {
        setIsSearchOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Debounced live search
  useEffect(() => {
    if (!searchQuery.trim() || searchQuery.trim().length < 2) {
      setLiveResults(null);
      setIsSearchOpen(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(searchQuery.trim())}&limit=4`);
        if (res.ok) {
          const data = await res.json();
          setLiveResults(data);
          setIsSearchOpen(true);
        }
      } catch (err) {
        console.error('Navbar search error:', err);
      } finally {
        setIsSearching(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setIsSearchOpen(false);
    setIsMobileMenuOpen(false);
    router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
  };

  const handleLogout = async () => {
    setIsProfileMenuOpen(false);
    setIsMobileMenuOpen(false);
    try {
      await logout();
    } catch (e) {
      console.error('Logout error', e);
    }
    if (typeof window !== 'undefined') {
      window.location.href = '/login';
    } else {
      router.push('/login');
    }
  };

  const fetchNotifications = async () => {
    try {
      const res = await fetch('/api/notifications');
      if (res.ok) {
        const data = await res.json();
        setNotifications(data.notifications || []);
        setUnreadCount(data.unread_count || 0);
      }
    } catch {
      // ignore in background
    }
  };

  React.useEffect(() => {
    if (isAuthPage || !currentUser?.id) return;
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 20000); // 20s background poll
    return () => clearInterval(interval);
  }, [currentUser?.id, isAuthPage]);

  const handleMarkAllRead = async () => {
    try {
      const res = await fetch('/api/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mark_all: true }),
      });
      if (res.ok) {
        setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
        setUnreadCount(0);
      }
    } catch {
      // ignore
    }
  };

  const handleMarkSingleRead = async (id: string) => {
    try {
      await fetch('/api/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
      );
      setUnreadCount((c) => Math.max(0, c - 1));
    } catch {
      // ignore
    }
  };

  const [copiedPassNotifId, setCopiedPassNotifId] = useState<string | null>(null);

  const handleNotificationClick = async (n: Notification) => {
    if (!n.is_read) {
      await handleMarkSingleRead(n.id);
    }
    setIsNotifOpen(false);
    if (n.link) {
      router.push(n.link);
    } else if (n.type === 'case_study' && n.item_id) {
      router.push(`/case-studies/${n.item_id}`);
    } else if (n.type === 'connection_request' || n.type === 'connection_accepted') {
      router.push('/network');
    }
  };

  const navLinks = [
    { href: '/feed', label: 'Home', icon: Home },
    { href: '/news', label: 'News', icon: Newspaper },
    { href: '/case-studies', label: 'Case Studies', icon: BookOpen, badge: 'Clinical' },
    { href: '/journals', label: 'Journals', icon: FileText },
    { href: '/network', label: 'My Network', icon: Users },
    { href: '/communities', label: 'Communities', icon: Compass },
    { href: '/research-assistant', label: 'AI Assistant', icon: Sparkles, highlight: true },
  ];

  const isAdmin = Boolean((currentUser?.is_admin || currentUser?.role === 'admin') && isDemoUser);

  return (
    <>
      <header className="sticky top-0 z-40 bg-white border-b border-slate-200/90 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 gap-4">
            {/* Left: Brand & Search */}
            <div className="flex items-center gap-4 lg:gap-6 flex-1 max-w-md">
              <Link href={isAuthPage ? "/login" : "/feed"} className="flex items-center gap-2 group flex-shrink-0">
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

              {/* Global Search Bar with Live Preview & Dropdown */}
              {!isAuthPage && (
                <div className="relative w-full hidden md:block" ref={searchDropdownRef}>
                  <form onSubmit={handleSearchSubmit} className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      {isSearching ? (
                        <Loader2 className="h-4 w-4 text-teal-600 animate-spin" />
                      ) : (
                        <Search className="h-4 w-4 text-slate-400" />
                      )}
                    </div>
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onFocus={() => {
                        if (liveResults && searchQuery.trim().length >= 2) {
                          setIsSearchOpen(true);
                        }
                      }}
                      placeholder="Search doctors, clinical trials, cases..."
                      className="w-full pl-9 pr-8 py-1.5 bg-slate-100 hover:bg-slate-100/80 focus:bg-white text-xs rounded-full border border-transparent focus:border-teal-500 focus:outline-none transition-all placeholder:text-slate-400 text-slate-800 font-medium"
                    />
                    {searchQuery && (
                      <button
                        type="button"
                        onClick={() => {
                          setSearchQuery('');
                          setLiveResults(null);
                          setIsSearchOpen(false);
                        }}
                        className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-slate-400 hover:text-slate-600"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </form>

                  {/* Live Search Floating Dropdown */}
                  {isSearchOpen && (
                    <div className="absolute left-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-xl border border-slate-200 z-50 overflow-hidden divide-y divide-slate-100 animate-in fade-in slide-in-from-top-1 duration-150">
                      {isSearching && !liveResults && (
                        <div className="p-4 text-center text-xs text-slate-500 flex items-center justify-center gap-2">
                          <Loader2 className="w-4 h-4 text-teal-600 animate-spin" />
                          <span>Searching MedConnect network...</span>
                        </div>
                      )}

                      {liveResults && liveResults.total > 0 && (
                        <div className="max-h-[380px] overflow-y-auto p-2 space-y-3">
                          {/* Colleagues */}
                          {liveResults.profiles.length > 0 && (
                            <div>
                              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-2 block mb-1">
                                Healthcare Professionals
                              </span>
                              <div className="space-y-0.5">
                                {liveResults.profiles.map((p) => (
                                  <Link
                                    key={p.id}
                                    href={`/profile/${p.id}`}
                                    onClick={() => {
                                      setIsSearchOpen(false);
                                      setSearchQuery('');
                                    }}
                                    className="flex items-center gap-2.5 p-2 rounded-xl hover:bg-slate-50 transition"
                                  >
                                    <img
                                      src={
                                        p.avatar_url ||
                                        `https://ui-avatars.com/api/?name=${encodeURIComponent(p.full_name)}&background=0d9488&color=fff&bold=true`
                                      }
                                      alt={p.full_name}
                                      className="w-8 h-8 rounded-full object-cover border border-slate-200 flex-shrink-0"
                                    />
                                    <div className="min-w-0 flex-1 text-xs">
                                      <p className="font-bold text-slate-900 truncate hover:text-teal-700">
                                        {p.full_name}
                                      </p>
                                      <p className="text-[11px] text-slate-500 truncate">{p.title}</p>
                                    </div>
                                  </Link>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Case Studies */}
                          {liveResults.caseStudies.length > 0 && (
                            <div>
                              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-2 block mb-1">
                                Clinical Case Studies
                              </span>
                              <div className="space-y-0.5">
                                {liveResults.caseStudies.map((cs) => (
                                  <Link
                                    key={cs.id}
                                    href={`/case-studies/${cs.id}`}
                                    onClick={() => {
                                      setIsSearchOpen(false);
                                      setSearchQuery('');
                                    }}
                                    className="p-2 rounded-xl hover:bg-slate-50 transition block text-xs"
                                  >
                                    <p className="font-bold text-slate-900 line-clamp-1 hover:text-teal-700">
                                      {cs.title}
                                    </p>
                                    <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                                      {cs.author_name} • {cs.specialties?.[0]?.name || 'Clinical'}
                                    </p>
                                  </Link>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Communities */}
                          {liveResults.groups.length > 0 && (
                            <div>
                              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-2 block mb-1">
                                Communities
                              </span>
                              <div className="space-y-0.5">
                                {liveResults.groups.map((g) => (
                                  <Link
                                    key={g.id}
                                    href={`/communities/${g.slug}`}
                                    onClick={() => {
                                      setIsSearchOpen(false);
                                      setSearchQuery('');
                                    }}
                                    className="flex items-center justify-between p-2 rounded-xl hover:bg-slate-50 transition text-xs"
                                  >
                                    <span className="font-bold text-slate-900 truncate pr-2">
                                      {g.name}
                                    </span>
                                    <span className="text-[10px] text-teal-700 font-bold bg-teal-50 px-2 py-0.5 rounded-full flex-shrink-0">
                                      {g.members_count} members
                                    </span>
                                  </Link>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      {liveResults && liveResults.total === 0 && (
                        <div className="p-4 text-center text-xs text-slate-500">
                          No direct matches for &quot;{searchQuery}&quot;. Press Enter to view full search results.
                        </div>
                      )}

                      {/* Footer: View All Results */}
                      <button
                        type="button"
                        onClick={handleSearchSubmit as any}
                        className="w-full p-2.5 bg-slate-50 hover:bg-teal-50 hover:text-teal-800 text-slate-700 font-bold text-xs flex items-center justify-center gap-1.5 transition border-t border-slate-100"
                      >
                        <span>View all results for &quot;{searchQuery}&quot;</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Brand & Search occupy left side cleanly */}

            {/* Right: Auth Action Links on Login/Signup OR Full Authenticated Controls */}
            <div className="flex items-center gap-2">
              {pathname === '/login' ? (
                <Link
                  href="/signup"
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-teal-700 hover:bg-teal-800 text-white rounded-xl text-xs font-bold transition shadow-xs"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Create Account</span>
                </Link>
              ) : pathname === '/signup' ? (
                <Link
                  href="/login"
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>Sign In</span>
                </Link>
              ) : (
                <>
                  {/* Notification Bell Dropdown */}
                  <div className="relative">
                    <button
                      onClick={() => setIsNotifOpen(!isNotifOpen)}
                      className="relative p-2 rounded-full hover:bg-slate-100 text-slate-600 transition focus:outline-hidden"
                      title="Notifications"
                    >
                      <Bell className="w-5 h-5" />
                      {unreadCount > 0 && (
                        <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-rose-600 text-white text-[9px] font-bold flex items-center justify-center animate-pulse">
                          {unreadCount > 9 ? '9+' : unreadCount}
                        </span>
                      )}
                    </button>

                    {isNotifOpen && (
                      <div
                        className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-xl border border-slate-200 py-2 z-50 animate-fade-in"
                        onMouseLeave={() => setIsNotifOpen(false)}
                      >
                        <div className="px-4 py-2 border-b border-slate-100 flex items-center justify-between">
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-bold text-slate-900">Notifications</span>
                            {unreadCount > 0 && (
                              <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-teal-100 text-teal-800">
                                {unreadCount} new
                              </span>
                            )}
                          </div>
                          {unreadCount > 0 && (
                            <button
                              onClick={handleMarkAllRead}
                              className="text-[11px] font-semibold text-teal-700 hover:text-teal-800 hover:underline"
                            >
                              Mark all as read
                            </button>
                          )}
                        </div>

                        <div className="max-h-80 overflow-y-auto divide-y divide-slate-50">
                          {notifications.length === 0 ? (
                            <div className="py-8 text-center text-xs text-slate-400">
                              No notifications yet
                            </div>
                          ) : (
                            notifications.slice(0, 10).map((n) => {
                              const passwordMatch = n.message.match(/Access Password:\s*([^\s"]+)/i);
                              const extractedPassword = passwordMatch ? passwordMatch[1] : null;

                              return (
                                <div
                                  key={n.id}
                                  onClick={() => handleNotificationClick(n)}
                                  className={`p-3 text-xs transition cursor-pointer flex items-start gap-2.5 hover:bg-slate-50 ${
                                    !n.is_read ? 'bg-teal-50/40' : ''
                                  }`}
                                >
                                  <div className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center flex-shrink-0 text-slate-600">
                                    {n.type === 'post_like' && <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />}
                                    {n.type === 'post_comment' && <MessageSquare className="w-3.5 h-3.5 text-blue-500" />}
                                    {n.type === 'repost' && <Repeat className="w-3.5 h-3.5 text-emerald-500" />}
                                    {n.type === 'connection_request' && <UserPlus className="w-3.5 h-3.5 text-amber-500" />}
                                    {n.type === 'connection_accepted' && <Check className="w-3.5 h-3.5 text-teal-600" />}
                                    {n.type === 'follow' && <UserCheck className="w-3.5 h-3.5 text-indigo-500" />}
                                    {(n.type === 'case_study' || (n.type as string) === 'case_study_shared') && (
                                      <KeyRound className="w-3.5 h-3.5 text-amber-600" />
                                    )}
                                  </div>

                                  <div className="flex-1 min-w-0">
                                    <p className={`text-slate-800 leading-snug ${!n.is_read ? 'font-bold' : 'font-normal'}`}>
                                      {n.message}
                                    </p>

                                    {extractedPassword && (
                                      <div className="mt-1.5 flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                                        <span className="text-[10px] text-slate-500 font-medium">Passcode:</span>
                                        <code className="bg-amber-100 text-amber-900 px-1.5 py-0.5 rounded text-[11px] font-mono font-bold">
                                          {extractedPassword}
                                        </code>
                                        <button
                                          type="button"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            if (typeof window !== 'undefined') {
                                              navigator.clipboard.writeText(extractedPassword);
                                              setCopiedPassNotifId(n.id);
                                              setTimeout(() => setCopiedPassNotifId(null), 2000);
                                            }
                                          }}
                                          className="inline-flex items-center gap-1 px-1.5 py-0.5 text-[10px] font-semibold text-teal-700 bg-teal-50 hover:bg-teal-100 rounded border border-teal-200 transition"
                                          title="Copy access password"
                                        >
                                          {copiedPassNotifId === n.id ? (
                                            <>
                                              <Check className="w-3 h-3 text-teal-600" />
                                              <span>Copied</span>
                                            </>
                                          ) : (
                                            <>
                                              <Copy className="w-3 h-3" />
                                              <span>Copy</span>
                                            </>
                                          )}
                                        </button>
                                      </div>
                                    )}

                                    {(n.link || n.type === 'case_study') && (
                                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-teal-700 hover:text-teal-800 mt-1">
                                        <span>Open Case Study</span>
                                        <ArrowRight className="w-3 h-3" />
                                      </span>
                                    )}

                                    <span className="text-[10px] text-slate-400 mt-1 block">
                                      {new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {new Date(n.created_at).toLocaleDateString()}
                                    </span>
                                  </div>

                                  {!n.is_read && (
                                    <span className="w-2 h-2 rounded-full bg-teal-600 mt-1 flex-shrink-0" />
                                  )}
                                </div>
                              );
                            })
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Persona Switcher Pill - only visible to demo testing users */}
                  {isDemoUser && (
                    <button
                      onClick={() => setIsSwitchModalOpen(true)}
                      className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 bg-slate-100 hover:bg-teal-50 text-slate-700 hover:text-teal-800 border border-slate-200 hover:border-teal-300 rounded-full text-xs font-medium transition shadow-2xs"
                      title="Switch persona for testing different roles & admin privileges"
                    >
                      <RefreshCw className="w-3.5 h-3.5 text-teal-600" />
                      <span>Demo Persona</span>
                    </button>
                  )}

                  {/* Profile Menu Dropdown */}
                  <div className="relative">
                    <button
                      onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                      className="flex items-center gap-2 p-1 rounded-full hover:bg-slate-100 transition focus:outline-none"
                    >
                      <div className="relative">
                        <img
                          src={currentUser?.avatar_url || 'https://images.unsplash.com/photo-1551601651-2a8555f1a136?auto=format&fit=crop&q=80&w=150'}
                          alt={currentUser?.full_name || 'Profile'}
                          onError={(e) => {
                            e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(currentUser?.full_name || 'Sarah Jenkins')}&background=0d9488&color=fff&bold=true`;
                          }}
                          className="w-8 h-8 rounded-full object-cover border border-slate-200"
                        />
                        {isAdmin && isDemoUser && (
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
                            {isAdmin && isDemoUser && (
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
                          {isAdmin && isDemoUser && (
                            <Link
                              href="/admin"
                              onClick={() => setIsProfileMenuOpen(false)}
                              className="flex items-center gap-2.5 px-4 py-2 text-xs text-slate-700 hover:bg-amber-50/50 transition font-medium"
                            >
                              <ShieldAlert className="w-4 h-4 text-amber-600" />
                              <span className="text-slate-900">Admin Portal</span>
                            </Link>
                          )}
                          {isDemoUser && (
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
                          )}
                          {isDemoUser && (
                            <>
                              <Link
                                href="/login"
                                onClick={() => setIsProfileMenuOpen(false)}
                                className="flex items-center gap-2.5 px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 transition"
                              >
                                <LogIn className="w-4 h-4 text-teal-600" />
                                <span>Sign In with Credentials</span>
                              </Link>
                              <Link
                                href="/signup"
                                onClick={() => setIsProfileMenuOpen(false)}
                                className="flex items-center gap-2.5 px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 transition"
                              >
                                <UserPlus className="w-4 h-4 text-teal-600" />
                                <span>Create Clinical Account</span>
                              </Link>
                            </>
                          )}
                        </div>

                        <div className="border-t border-slate-100 pt-1">
                          <div className="px-4 py-2 text-xs flex items-center justify-between">
                            <span className="text-[10px] text-slate-400 font-medium truncate max-w-[120px]">
                              {currentUser?.role?.replace('_', ' ')}
                            </span>
                            <button
                              type="button"
                              onClick={handleLogout}
                              className="px-2.5 py-1 text-xs text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg font-bold flex items-center gap-1.5 cursor-pointer transition border border-transparent hover:border-red-200"
                            >
                              <LogOut className="w-3.5 h-3.5" />
                              <span>Exit</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </>
              )}

              {/* Mobile menu hamburger toggle */}
              {!isAuthPage && (
                <button
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                  className="lg:hidden p-1.5 rounded-lg text-slate-600 hover:bg-slate-100"
                >
                  {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Mobile dropdown drawer */}
        {isMobileMenuOpen && (
          <div className="lg:hidden border-t border-slate-200 bg-white px-4 py-3 space-y-2">
            <form onSubmit={handleSearchSubmit} className="relative w-full mb-3">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search doctors, cases, topics..."
                className="w-full pl-9 pr-9 py-2 bg-slate-100 text-xs rounded-lg border border-transparent focus:border-teal-500 focus:bg-white focus:outline-none transition"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </form>
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
            {isAdmin && isDemoUser && (
              <Link
                href="/admin"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-semibold bg-amber-50 text-amber-900 border border-amber-200"
              >
                <ShieldAlert className="w-5 h-5 text-amber-600" />
                <span>Admin Portal</span>
              </Link>
            )}
            {isDemoUser && (
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
            )}

            <div className="pt-2 border-t border-slate-100 mt-2">
              <button
                type="button"
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-2 py-2 text-xs font-bold text-red-600 hover:bg-red-50 rounded-lg transition"
              >
                <LogOut className="w-4 h-4" />
                <span>Exit Session</span>
              </button>
            </div>
          </div>
        )}
      </header>

      {/* Persona Switch Modal - only for demo testing */}
      {isDemoUser && (
        <UserSwitchModal
          isOpen={isSwitchModalOpen}
          onClose={() => setIsSwitchModalOpen(false)}
        />
      )}
    </>
  );
}
