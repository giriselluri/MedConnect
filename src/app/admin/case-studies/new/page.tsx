'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminNewCaseStudyRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/case-studies/new');
  }, [router]);

  return (
    <div className="max-w-4xl mx-auto px-4 py-16 text-center">
      <p className="text-xs text-slate-500 font-medium">Redirecting to Case Study Studio...</p>
    </div>
  );
}
