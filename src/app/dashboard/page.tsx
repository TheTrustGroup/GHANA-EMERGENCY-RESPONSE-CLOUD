'use client';

/**
 * Main Dashboard Router
 * Routes to appropriate dashboard based on user role
 */

import { useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { UserRole } from '@prisma/client';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'loading') return;

    if (!session?.user) {
      router.push('/auth/signin');
      return;
    }

    // Route based on role
    const role = session.user.role;

    switch (role) {
      case UserRole.SYSTEM_ADMIN:
        router.push('/dashboard/admin');
        break;
      case UserRole.AGENCY_ADMIN:
        router.push('/dashboard/agency');
        break;
      case UserRole.DISPATCHER:
        router.push('/dashboard/dispatch');
        break;
      case UserRole.RESPONDER:
        router.push('/dashboard/responder');
        break;
      case UserRole.CITIZEN:
        router.push('/dashboard/citizen');
        break;
      default:
        router.push('/dashboard/citizen');
    }
  }, [session, status, router]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <LoadingSpinner size="lg" />
        <p className="text-sm text-muted-foreground">Loading dashboard...</p>
      </div>
    </div>
  );
}

