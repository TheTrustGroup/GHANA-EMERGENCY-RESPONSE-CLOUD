'use client';

/**
 * Trust Indicators Component
 * Government-grade trust indicators for credibility
 */

import { Shield, Lock, CheckCircle2, Award } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TrustIndicatorProps {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  description?: string;
  className?: string;
}

const indicators: TrustIndicatorProps[] = [
  {
    icon: Shield,
    label: 'Government-Grade Security',
    description: 'Encrypted and secure',
  },
  {
    icon: Lock,
    label: 'Data Protected',
    description: 'Your information is safe',
  },
  {
    icon: CheckCircle2,
    label: 'Verified Platform',
    description: 'Official emergency response system',
  },
  {
    icon: Award,
    label: 'Trusted Service',
    description: 'Used by emergency services nationwide',
  },
];

export function TrustIndicators({ className }: { className?: string }) {
  return (
    <div className={cn('flex flex-wrap gap-4 justify-center', className)}>
      {indicators.map((indicator, index) => {
        const Icon = indicator.icon;
        return (
          <div
            key={index}
            className="flex items-center gap-2 rounded-lg bg-muted/50 px-3 py-2 text-sm"
          >
            <Icon className="h-4 w-4 text-primary" aria-hidden="true" />
            <div>
              <div className="font-medium">{indicator.label}</div>
              {indicator.description && (
                <div className="text-xs text-muted-foreground">
                  {indicator.description}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

/**
 * Compact Trust Badge
 * Single trust indicator for headers/footers
 */
export function TrustBadge({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary',
        className
      )}
    >
      <Shield className="h-3 w-3" aria-hidden="true" />
      <span>Official Government Platform</span>
    </div>
  );
}
