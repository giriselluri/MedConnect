'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  BookOpen,
  Users,
  ShieldAlert,
  ArrowLeft,
  PlusCircle,
  Briefcase,
  Megaphone,
} from 'lucide-react';

export function AdminNav() {
  const pathname = usePathname();

  const links = [
    { href: '/admin', label: 'Overview & Metrics', icon: LayoutDashboard },
    { href: '/admin/case-studies', label: 'Case Studies Management', icon: BookOpen },
    { href: '/admin/jobs', label: 'Jobs Management', icon: Briefcase },
    { href: '/admin/ads', label: 'Advertisements Management', icon: Megaphone },
    { href: '/admin/users', label: 'User Roles & Access', icon: Users },
    { href: '/admin/moderation', label: 'Content Moderation', icon: ShieldAlert },
  ];

  return (
    <div className="bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-3 flex flex-wrap items-center justify-between gap-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <span className="p-1 rounded-md bg-amber-500 text-white">
              <ShieldAlert className="w-4 h-4" />
            </span>
            <div>
              <h1 className="text-base font-bold text-slate-900 leading-tight">
                MedConnect AI Administration Portal
              </h1>
              <p className="text-[11px] text-slate-500">
                Hospital Governance, Clinical Case Publishing & Moderation
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/admin/case-studies/new"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-teal-700 hover:bg-teal-800 text-white text-xs font-semibold rounded-lg shadow-xs transition"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Create Case Study</span>
            </Link>

            <Link
              href="/feed"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-lg transition"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Feed</span>
            </Link>
          </div>
        </div>

        {/* Tab Links */}
        <nav className="flex space-x-6 overflow-x-auto py-2">
          {links.map((link) => {
            const Icon = link.icon;
            const isActive =
              link.href === '/admin'
                ? pathname === '/admin'
                : pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-2 py-2 text-xs font-semibold border-b-2 transition whitespace-nowrap ${
                  isActive
                    ? 'border-amber-600 text-amber-800'
                    : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-amber-600' : 'text-slate-400'}`} />
                <span>{link.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
