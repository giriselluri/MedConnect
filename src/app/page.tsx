'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function RootLandingPage() {
  const router = useRouter();

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const isLoggedIn = localStorage.getItem('medconnect_logged_in') === 'true';
      if (isLoggedIn) {
        router.replace('/feed');
      } else {
        router.replace('/login');
      }
    }
  }, [router]);

  return (
    <div className="min-h-[75vh] flex flex-col items-center justify-center p-6 text-center">
      <div className="w-10 h-10 border-4 border-teal-600 border-t-transparent rounded-full animate-spin mb-4" />
      <h2 className="text-sm font-extrabold text-slate-800 tracking-wide uppercase">
        MedConnect <span className="text-teal-700">AI</span>
      </h2>
      <p className="text-xs text-slate-500 mt-1">
        Routing to Clinical Portal...
      </p>
    </div>
  );
}
