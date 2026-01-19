'use client';

/**
 * Brand Header Component
 * Consistent government-grade header with logo and branding
 */

import { AlertTriangle, Shield } from 'lucide-react';
import { cn } from '@/lib/utils';
import { TrustBadge } from './TrustIndicators';
import Link from 'next/link';

interface BrandHeaderProps {
  variant?: 'default' | 'compact' | 'minimal';
  showTrustBadge?: boolean;
  className?: string;
}

export function BrandHeader({
  variant = 'default',
  showTrustBadge = true,
  className,
}: BrandHeaderProps) {
  if (variant === 'minimal') {
    return (
      <div className={cn('flex items-center gap-2', className)}>
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-primary/80">
          <AlertTriangle className="h-5 w-5 text-white" aria-hidden="true" />
        </div>
        <span className="font-bold text-lg">Emergency Response</span>
      </div>
    );
  }

  if (variant === 'compact') {
    return (
      <div className={cn('flex items-center justify-between', className)}>
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary/80 shadow-lg">
            <AlertTriangle className="h-6 w-6 text-white" aria-hidden="true" />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-bold leading-tight">Ghana Emergency</span>
            <span className="text-xs text-muted-foreground">Response Platform</span>
          </div>
        </Link>
        {showTrustBadge && <TrustBadge />}
      </div>
    );
  }

  return (
    <div className={cn('flex items-center justify-between border-b bg-background/95 backdrop-blur-sm', className)}>
      <Link href="/" className="flex items-center gap-3 px-6 py-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary/80 shadow-lg">
          <Shield className="h-7 w-7 text-white" aria-hidden="true" />
        </div>
        <div className="flex flex-col">
          <span className="text-lg font-bold leading-tight">Ghana Emergency Response</span>
          <span className="text-xs font-medium text-muted-foreground">Government Platform</span>
        </div>
      </Link>
      {showTrustBadge && (
        <div className="px-6">
          <TrustBadge />
        </div>
      )}
    </div>
  );
}
