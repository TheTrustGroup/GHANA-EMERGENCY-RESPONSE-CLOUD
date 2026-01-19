'use client';

/**
 * DashboardShell Component
 * Wrapper for dashboard pages with consistent layout, loading, and error states
 */

import { ReactNode } from 'react';
import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Breadcrumbs } from '@/components/accessibility/Breadcrumbs';

interface DashboardShellProps {
  children: ReactNode;
  isLoading?: boolean;
  error?: Error | string | null;
  title?: string;
  description?: string;
  actions?: ReactNode;
}

export function DashboardShell({
  children,
  isLoading = false,
  error = null,
  title,
  description,
  actions,
}: DashboardShellProps) {
  if (isLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <LoadingSpinner size="lg" />
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (error) {
    const errorMessage = typeof error === 'string' ? error : error?.message || 'An error occurred';
    return (
      <div className="container mx-auto p-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{errorMessage}</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-6 p-6">
      {/* Breadcrumbs */}
      <Breadcrumbs className="mb-4" />

      {(title || description || actions) && (
        <div className="flex flex-col space-y-2 md:flex-row md:items-center md:justify-between md:space-y-0">
          <div className="flex-1">
            {title && <h1 className="text-2xl font-bold tracking-tight md:text-3xl">{title}</h1>}
            {description && <p className="text-muted-foreground">{description}</p>}
          </div>
          {actions && <div className="flex items-center space-x-2">{actions}</div>}
        </div>
      )}
      {children}
    </div>
  );
}

