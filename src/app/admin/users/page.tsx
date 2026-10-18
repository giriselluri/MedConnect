'use client';

import React, { useEffect, useState } from 'react';
import { useApp } from '@/lib/context';
import { AdminNav } from '@/components/admin-nav';
import { Profile, UserRole } from '@/types';
import { SpecialtyBadge } from '@/components/specialty-badge';
import {
  Users,
  Search,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Stethoscope,
  GraduationCap,
  FlaskConical,
  Pill,
} from 'lucide-react';

export default function AdminUsersPage() {
  const { currentUser, switchUser } = useApp();
  const [users, setUsers] = useState<Profile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const isAdmin = Boolean(currentUser?.is_admin || currentUser?.role === 'admin');

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/admin/users');
      if (!res.ok) throw new Error('Failed to load users');
      const data = await res.json();
      setUsers(data.users || []);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      fetchUsers();
    }
  }, [isAdmin]);

  const handleRoleChange = async (userId: string, newRole: UserRole) => {
    setUpdatingId(userId);
    try {
      const res = await fetch(`/api/admin/users/${userId}/role`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: newRole }),
      });
      if (res.ok) {
        await fetchUsers();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setUpdatingId(null);
    }
  };

  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.full_name.toLowerCase().includes(search.toLowerCase()) ||
      u.title.toLowerCase().includes(search.toLowerCase()) ||
      u.institution?.toLowerCase().includes(search.toLowerCase());
    const matchesRole = !roleFilter || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  return (
    <div className="min-h-screen bg-slate-50">
      <AdminNav />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-blue-100 text-blue-800">
                <Users className="w-5 h-5" />
              </span>
              <h2 className="text-xl font-extrabold text-slate-900">
                User Role & Privilege Governance
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Verify clinical roles, manage credentials, and assign hospital administrative privileges.
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex flex-wrap items-center gap-2 flex-1 min-w-[280px]">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search clinician by name or hospital..."
                className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-none focus:border-teal-500"
              />
            </div>

            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700 focus:outline-none"
            >
              <option value="">All Roles</option>
              <option value="admin">Administrators</option>
              <option value="healthcare_professional">Healthcare Professionals</option>
              <option value="researcher">Researchers</option>
              <option value="medical_student">Medical Students</option>
              <option value="pharmaceutical_professional">Pharmaceutical Professionals</option>
            </select>
          </div>

          <span className="text-slate-400 font-medium">
            {filteredUsers.length} Professionals
          </span>
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          {isLoading ? (
            <div className="p-12 text-center">
              <Loader2 className="w-8 h-8 text-teal-600 animate-spin mx-auto mb-2" />
              <p className="text-xs text-slate-500">Loading directory...</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-600">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="py-3 px-4">Professional</th>
                    <th className="py-3 px-4">Institution & Specialties</th>
                    <th className="py-3 px-4">Assigned Role</th>
                    <th className="py-3 px-4">Admin Privileges</th>
                    <th className="py-3 px-4 text-right">Role Management</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-slate-50/70 transition">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={user.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.full_name)}&background=0d9488&color=fff`}
                            alt={user.full_name}
                            className="w-10 h-10 rounded-full object-cover border border-slate-200"
                          />
                          <div>
                            <span className="font-bold text-slate-900 block text-xs">
                              {user.full_name}
                            </span>
                            <span className="text-[11px] text-slate-500">{user.title}</span>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="text-slate-800 font-medium block">
                          {user.institution || 'Medical Center'}
                        </span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {user.specialties?.slice(0, 2).map((s) => (
                            <SpecialtyBadge key={s.id} id={s.id} name={s.name} size="sm" />
                          ))}
                        </div>
                      </td>

                      <td className="py-3.5 px-4 capitalize font-semibold text-slate-800">
                        {user.role.replace('_', ' ')}
                      </td>

                      <td className="py-3.5 px-4">
                        {user.is_admin ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-amber-100 text-amber-900">
                            <ShieldCheck className="w-3.5 h-3.5 text-amber-600" />
                            Admin Access
                          </span>
                        ) : (
                          <span className="text-slate-400 text-[11px]">Standard Access</span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <select
                          value={user.role}
                          disabled={updatingId === user.id}
                          onChange={(e) => handleRoleChange(user.id, e.target.value as UserRole)}
                          className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-slate-800 font-semibold focus:outline-none"
                        >
                          <option value="admin">Admin</option>
                          <option value="healthcare_professional">Healthcare Professional</option>
                          <option value="researcher">Researcher</option>
                          <option value="medical_student">Medical Student</option>
                          <option value="pharmaceutical_professional">Pharmaceutical Professional</option>
                          <option value="other_healthcare_professional">Other Healthcare</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
