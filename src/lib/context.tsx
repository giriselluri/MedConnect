'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { Profile, Specialty, Bookmark } from '@/types';

interface AppContextType {
  currentUser: Profile | null;
  allProfiles: Profile[];
  specialties: Specialty[];
  bookmarks: Bookmark[];
  isLoading: boolean;
  isDemoUser: boolean;
  isRegisteredUser: boolean;
  activeSpecialty: string | null;
  setActiveSpecialty: (specialtyId: string | null) => void;
  switchUser: (userId: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshSession: () => Promise<void>;
  refreshBookmarks: () => Promise<void>;
  toggleBookmark: (
    itemType: 'post' | 'case_study' | 'news' | 'journal',
    itemId: string,
    metadata?: { title?: string; summary?: string; url?: string }
  ) => Promise<boolean>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<Profile | null>(null);
  const [allProfiles, setAllProfiles] = useState<Profile[]>([]);
  const [specialties, setSpecialties] = useState<Specialty[]>([]);
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [activeSpecialty, setActiveSpecialty] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const refreshSession = useCallback(async () => {
    try {
      const res = await fetch('/api/auth/session');
      if (res.ok) {
        const data = await res.json();
        setCurrentUser(data.user);
        setAllProfiles(data.allProfiles || []);
      }
    } catch (e) {
      console.error('Failed to load user session', e);
    }
  }, []);

  const refreshSpecialties = useCallback(async () => {
    try {
      const res = await fetch('/api/specialties');
      if (res.ok) {
        const data = await res.json();
        setSpecialties(data.specialties || []);
      }
    } catch (e) {
      console.error('Failed to load specialties', e);
    }
  }, []);

  const refreshBookmarks = useCallback(async () => {
    try {
      const res = await fetch('/api/bookmarks');
      if (res.ok) {
        const data = await res.json();
        setBookmarks(data.bookmarks || []);
      }
    } catch (e) {
      console.error('Failed to load bookmarks', e);
    }
  }, []);

  useEffect(() => {
    async function init() {
      setIsLoading(true);
      await Promise.all([refreshSession(), refreshSpecialties(), refreshBookmarks()]);
      setIsLoading(false);
    }
    init();
  }, [refreshSession, refreshSpecialties, refreshBookmarks]);

  const switchUser = async (userId: string) => {
    try {
      const res = await fetch('/api/auth/switch-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      });
      if (res.ok) {
        const data = await res.json();
        setCurrentUser(data.user);
        await refreshBookmarks();
      }
    } catch (e) {
      console.error('Failed to switch user', e);
    }
  };

  const logout = useCallback(async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch (e) {
      console.error('Failed to logout', e);
    }
    if (typeof window !== 'undefined') {
      localStorage.removeItem('medconnect_logged_in');
      localStorage.removeItem('medconnect_is_registered_user');
      document.cookie = 'medconnect_logged_in=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; max-age=0';
    }
    setCurrentUser(null);
    setBookmarks([]);
  }, []);

  const toggleBookmark = async (
    itemType: 'post' | 'case_study' | 'news' | 'journal',
    itemId: string,
    metadata?: { title?: string; summary?: string; url?: string }
  ): Promise<boolean> => {
    try {
      const res = await fetch('/api/bookmarks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          item_type: itemType,
          item_id: itemId,
          item_title: metadata?.title,
          item_summary: metadata?.summary,
          item_url: metadata?.url,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        await refreshBookmarks();
        return data.is_bookmarked;
      }
    } catch (e) {
      console.error('Failed to toggle bookmark', e);
    }
    return false;
  };

  const isDemoUser = Boolean(currentUser?.is_demo !== false && currentUser?.id?.startsWith('00000000-'));
  const isRegisteredUser = Boolean(currentUser && !isDemoUser);

  return (
    <AppContext.Provider
      value={{
        currentUser,
        allProfiles,
        specialties,
        bookmarks,
        isLoading,
        isDemoUser,
        isRegisteredUser,
        activeSpecialty,
        setActiveSpecialty,
        switchUser,
        logout,
        refreshSession,
        refreshBookmarks,
        toggleBookmark,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
