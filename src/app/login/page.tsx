'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useApp } from '@/lib/context';
import {
  ShieldCheck,
  Activity,
  Lock,
  Mail,
  ArrowRight,
  UserCheck,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  Sparkles,
  Stethoscope,
  KeyRound,
  Eye,
  EyeOff,
  UserPlus,
} from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { currentUser, allProfiles, switchUser } = useApp();

  const [emailInput, setEmailInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isAlreadyLoggedIn, setIsAlreadyLoggedIn] = useState(false);
  const [isRegisteredClient, setIsRegisteredClient] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const loggedIn = localStorage.getItem('medconnect_logged_in') === 'true';
      const isReg = localStorage.getItem('medconnect_is_registered_user') === 'true';
      setIsAlreadyLoggedIn(loggedIn);
      setIsRegisteredClient(isReg || Boolean(currentUser && currentUser.is_demo === false));
    }
  }, [currentUser]);

  // Quick Demo Personas (Admin persona excluded for registered users)
  const demoPersonas = allProfiles
    .filter((p) => (isRegisteredClient ? (!p.is_admin && p.role !== 'admin' && p.id !== '00000000-0000-0000-0000-000000000001') : true))
    .slice(0, 6);

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailInput.trim()) {
      setError('Please enter your medical institutional email or username');
      return;
    }
    setError(null);
    setIsLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: emailInput.trim(), password: passwordInput }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to sign in. Please verify credentials.');
      }

      if (typeof window !== 'undefined') {
        localStorage.setItem('medconnect_logged_in', 'true');
        if (data.user?.is_demo === false) {
          localStorage.setItem('medconnect_is_registered_user', 'true');
          setIsRegisteredClient(true);
        } else {
          localStorage.removeItem('medconnect_is_registered_user');
          setIsRegisteredClient(false);
        }
        document.cookie = 'medconnect_logged_in=true; path=/; max-age=2592000';
      }

      await switchUser(data.user.id);
      setSuccessMsg(`Welcome back, ${data.user.full_name}! Redirecting to clinical feed...`);
      setTimeout(() => {
        router.push('/feed');
      }, 700);
    } catch (err: any) {
      setError(err.message || 'Login failed. Please check credentials or select a demo persona.');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePersonaLogin = async (profileId: string) => {
    setError(null);
    setIsLoading(true);
    try {
      const target = allProfiles.find((p) => p.id === profileId);

      if (typeof window !== 'undefined') {
        localStorage.setItem('medconnect_logged_in', 'true');
        localStorage.removeItem('medconnect_is_registered_user');
        setIsRegisteredClient(false);
        document.cookie = 'medconnect_logged_in=true; path=/; max-age=2592000';
      }

      await switchUser(profileId);
      setSuccessMsg(`Signed in as ${target?.full_name || 'Verified Doctor'}!`);
      setTimeout(() => {
        router.push('/feed');
      }, 600);
    } catch (err: any) {
      setError(err.message || 'Failed to switch to selected persona.');
    } finally {
      setIsLoading(false);
    }
  };

  const fillDemoCredentials = (email: string) => {
    setEmailInput(email);
    setPasswordInput('clinical2024');
    setError(null);
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-b from-slate-50 via-slate-100/60 to-teal-50/40 flex flex-col justify-center py-10 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <Link href="/feed" className="inline-flex items-center gap-2.5">
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

          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight pt-3">
            Sign In to Verified Clinical Portal
          </h2>
          <p className="text-xs text-slate-600 max-w-sm mx-auto">
            Access peer case studies, specialized medical communities, and clinical discussions.
          </p>
        </div>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-xl px-4">
        {/* Already Logged In Notice Banner */}
        {isAlreadyLoggedIn && currentUser && (
          <div className="mb-4 p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center justify-between gap-3 text-xs shadow-xs animate-fade-in">
            <div className="flex items-center gap-2.5 min-w-0">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse flex-shrink-0" />
              <p className="text-emerald-950 font-medium truncate">
                Active session: <strong>{currentUser.full_name}</strong> ({currentUser.role.replace('_', ' ')})
              </p>
            </div>
            <Link
              href="/feed"
              className="inline-flex items-center gap-1 font-bold text-emerald-800 hover:text-emerald-950 bg-emerald-100/70 hover:bg-emerald-200 px-3 py-1.5 rounded-xl transition flex-shrink-0"
            >
              <span>Go to Home Feed</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        )}

        <div className="bg-white py-8 px-6 sm:px-10 shadow-xl shadow-slate-200/50 rounded-2xl border border-slate-200 space-y-6">
          {/* Notifications */}
          {error && (
            <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-start gap-2.5">
              <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5 text-red-600" />
              <div className="space-y-1">
                <p className="font-semibold">{error}</p>
                <p className="text-[11px] text-red-600">Tip: Click one of the Demo Personas below for instant one-click login.</p>
              </div>
            </div>
          )}

          {successMsg && (
            <div className="p-3.5 bg-teal-50 border border-teal-200 rounded-xl text-xs text-teal-800 font-semibold flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-teal-600" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Email Sign In Form */}
          <form onSubmit={handleEmailLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Medical Email or Username
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  placeholder="e.g. sarah.jenkins@medconnect.local or dr.chen"
                  className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 focus:bg-white border border-slate-200 focus:border-teal-500 focus:ring-1 focus:ring-teal-500 rounded-xl text-xs sm:text-sm text-slate-900 transition"
                  required
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Password
                </label>
                {!isRegisteredClient && (
                  <button
                    type="button"
                    onClick={() => fillDemoCredentials('sarah.jenkins@medconnect.local')}
                    className="text-[11px] text-teal-700 hover:text-teal-900 font-semibold hover:underline"
                  >
                    Autofill Admin Demo
                  </button>
                )}
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  placeholder="Enter your password (e.g. clinical2024)"
                  className="w-full pl-10 pr-10 py-2.5 bg-slate-50 focus:bg-white border border-slate-200 focus:border-teal-500 focus:ring-1 focus:ring-teal-500 rounded-xl text-xs sm:text-sm text-slate-900 transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 text-teal-700 rounded border-slate-300 focus:ring-teal-500"
                />
                <span className="text-xs text-slate-600">Remember this workstation</span>
              </label>

              {!isRegisteredClient && (
                <span className="text-xs text-slate-500">
                  Demo code: <code className="bg-slate-100 px-1.5 py-0.5 rounded text-slate-700 font-mono font-bold">clinical2024</code>
                </span>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-teal-700 hover:bg-teal-800 disabled:opacity-50 text-white rounded-xl text-xs sm:text-sm font-bold shadow-md shadow-teal-700/20 transition"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Verifying Credentials...</span>
                </>
              ) : (
                <>
                  <span>Sign In to Clinical Account</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* New User Callout Box */}
          <div className="p-4 bg-teal-50/70 border border-teal-200/80 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="space-y-0.5">
              <div className="flex items-center gap-1.5 text-xs font-bold text-teal-950">
                <UserPlus className="w-4 h-4 text-teal-700" />
                <span>New to MedConnect AI?</span>
              </div>
              <p className="text-[11px] text-teal-800/80">
                Select from 6 professional categories and join in 2 quick steps.
              </p>
            </div>
            <Link
              href="/signup"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-teal-700 hover:bg-teal-800 text-white rounded-xl text-xs font-bold shadow-xs transition flex-shrink-0"
            >
              <span>Create Account</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Quick Demo Persona Switcher Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-3 text-slate-500 font-bold tracking-wider">
                Or 1-Click Instant Demo Login
              </span>
            </div>
          </div>

          {/* Seeded Demo Personas */}
          <div className="space-y-2.5">
            <p className="text-xs text-slate-500 text-center">
              {isRegisteredClient
                ? 'Select a peer clinical persona to explore the network:'
                : 'Select any verified clinical persona to test roles, specialties, and admin access:'}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {demoPersonas.map((p) => {
                const isAdmin = Boolean((p.is_admin || p.role === 'admin') && !isRegisteredClient);
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => handlePersonaLogin(p.id)}
                    disabled={isLoading}
                    className="flex items-center gap-2.5 p-2.5 rounded-xl border border-slate-200 hover:border-teal-500 hover:bg-teal-50/50 transition text-left group"
                  >
                    <img
                      src={p.avatar_url || 'https://images.unsplash.com/photo-1551601651-2a8555f1a136?auto=format&fit=crop&q=80&w=100'}
                      alt={p.full_name}
                      onError={(e) => {
                        e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(p.full_name)}&background=0d9488&color=fff&bold=true`;
                      }}
                      className="w-9 h-9 rounded-full object-cover border border-slate-200 flex-shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <p className="text-xs font-bold text-slate-900 group-hover:text-teal-700 truncate">
                          {p.full_name}
                        </p>
                        {isAdmin && (
                          <span className="text-[9px] font-bold px-1.5 py-0.2 bg-amber-100 text-amber-800 rounded flex-shrink-0">
                            Admin
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-500 truncate">
                        {p.title}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Bottom Security Note */}
          <div className="pt-2 text-center">
            <div className="flex items-center justify-center gap-2 text-[10px] text-slate-400">
              <ShieldCheck className="w-3.5 h-3.5 text-teal-600" />
              <span>Compliant with HIPAA & Medical Board Peer Verification Guidelines</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
