'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '@/lib/context';

export default function ProfileRedirectPage() {
  const router = useRouter();
  const { currentUser, isLoading } = useApp();

  useEffect(() => {
    if (!isLoading && currentUser) {
      router.replace(`/profile/${currentUser.id}`);
    }
  }, [currentUser, isLoading, router]);

  return (
    <div className="max-w-4xl mx-auto px-4 py-16 text-center text-xs text-slate-500">
      Loading profile...
    </div>
  );
}
