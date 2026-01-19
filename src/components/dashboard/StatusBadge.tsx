'use client';

/**
 * Enhanced Status Badge Component
 * Improved status indicators with icons, animations, and better visual hierarchy
 */

import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import {
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  Info,
  Clock,
} from 'lucide-react';
import { getStatusAriaLabel } from '@/lib/accessibility/aria';
import { prefersReducedMotion } from '@/lib/accessibility/keyboard';

interface StatusBadgeProps {
  status: string;
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info' | 'pending';
  pulse?: boolean; // Add pulsing animation for critical states
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
  className?: string;
}

const variantStyles = {
  default: 'bg-slate-100 text-slate-800 border-slate-200 dark:bg-slate-800 dark:text-slate-200',
  success: 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-400',
  warning: 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400',
  danger: 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-400',
  info: 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400',
  pending: 'bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900/30 dark:text-orange-400',
};

const sizeStyles = {
  sm: 'text-xs px-2 py-0.5 gap-1',
  md: 'text-sm px-2.5 py-1 gap-1.5',
  lg: 'text-base px-3 py-1.5 gap-2',
};

const iconSizes = {
  sm: 'h-3 w-3',
  md: 'h-3.5 w-3.5',
  lg: 'h-4 w-4',
};

const iconMap = {
  success: CheckCircle2,
  warning: AlertTriangle,
  danger: AlertCircle,
  info: Info,
  pending: Clock,
  default: Info,
};

export function StatusBadge({
  status,
  variant = 'default',
  pulse = false,
  size = 'md',
  showIcon = true,
  className,
}: StatusBadgeProps) {
  const reducedMotion = prefersReducedMotion();
  const Icon = showIcon ? iconMap[variant] : null;
  const shouldPulse = pulse && !reducedMotion && variant === 'danger';

  return (
    <Badge
      variant="outline"
      className={cn(
        'font-semibold border transition-all duration-200 inline-flex items-center',
        variantStyles[variant],
        sizeStyles[size],
        shouldPulse && 'animate-pulse ring-2 ring-red-500 ring-offset-1',
        className
      )}
      aria-label={getStatusAriaLabel(status, variant)}
    >
      {Icon && <Icon className={iconSizes[size]} aria-hidden="true" />}
      <span>{status}</span>
    </Badge>
  );
}
