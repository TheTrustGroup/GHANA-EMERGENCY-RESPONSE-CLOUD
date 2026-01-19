'use client';

/**
 * Government Seal Component
 * Official government seal/badge for credibility
 */

import { Shield, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface GovernmentSealProps {
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'minimal' | 'badge';
  className?: string;
}

const sizeStyles = {
  sm: 'h-8 w-8',
  md: 'h-12 w-12',
  lg: 'h-16 w-16',
};

export function GovernmentSeal({
  size = 'md',
  variant = 'default',
  className,
}: GovernmentSealProps) {
  if (variant === 'minimal') {
    return (
      <div
        className={cn(
          'flex items-center justify-center rounded-full bg-gradient-to-br from-primary to-primary/80 text-white shadow-lg',
          sizeStyles[size],
          className
        )}
        aria-label="Government seal"
      >
        <Shield className={cn('h-1/2 w-1/2')} aria-hidden="true" />
      </div>
    );
  }

  if (variant === 'badge') {
    return (
      <div
        className={cn(
          'inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary',
          className
        )}
      >
        <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
        <span>Official Government Platform</span>
      </div>
    );
  }

  return (
    <div
      className={cn(
        'relative flex items-center justify-center rounded-full bg-gradient-to-br from-primary via-primary/90 to-primary/80 p-2 text-white shadow-xl ring-4 ring-primary/20',
        sizeStyles[size],
        className
      )}
      aria-label="Government seal"
    >
      <Shield className={cn('h-3/4 w-3/4')} aria-hidden="true" />
      <div className="absolute inset-0 rounded-full border-2 border-white/30" />
    </div>
  );
}
