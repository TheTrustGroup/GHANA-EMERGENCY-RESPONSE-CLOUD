'use client';

/**
 * Citizen Report Incident Page
 * Redirects to the main incident creation page
 */

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

export default function CitizenReportPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/dashboard/incidents/new');
  }, [router]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <LoadingSpinner size="lg" />
        <p className="text-sm text-muted-foreground">Redirecting...</p>
      </div>
    </div>
  );
}
