'use client';

/**
 * AuthGuard Component
 * Client-side authentication guard that checks auth status and redirects
 */

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { UserRole } from '@prisma/client';
import { Loader2 } from 'lucide-react';

interface AuthGuardProps {
  children: React.ReactNode;
  requiredRole?: UserRole | UserRole[];
  redirectTo?: string;
}

export function AuthGuard({
  children,
  requiredRole,
  redirectTo = '/auth/signin',
}: AuthGuardProps) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    if (status === 'loading') {
      return; // Still loading
    }

    if (status === 'unauthenticated') {
      router.push(redirectTo);
      return;
    }

    if (status === 'authenticated' && session?.user) {
      // Check if account is active
      if (!session.user.isActive) {
        router.push('/auth/error?error=AccessDenied');
        return;
      }

      // Check role requirement
      if (requiredRole) {
        const roles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];
        if (!roles.includes(session.user.role)) {
          router.push('/dashboard');
          return;
        }
      }

      setIsChecking(false);
    }
  }, [status, session, requiredRole, router, redirectTo]);

  if (status === 'loading' || isChecking) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (status === 'unauthenticated') {
    return null; // Will redirect
  }

  if (!session?.user?.isActive) {
    return null; // Will redirect
  }

  return <>{children}</>;
}

