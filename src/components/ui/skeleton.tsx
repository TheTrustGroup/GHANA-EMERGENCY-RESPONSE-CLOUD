'use client';

/**
 * Skeleton Loading Component
 * Provides skeleton screens for better loading UX
 */

import { cn } from '@/lib/utils';
import { prefersReducedMotion } from '@/lib/accessibility/keyboard';

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'text' | 'circular' | 'rectangular' | 'rounded';
  width?: string | number;
  height?: string | number;
  animation?: 'pulse' | 'wave' | 'none';
}

export function Skeleton({
  className,
  variant = 'rectangular',
  width,
  height,
  animation,
  style,
  ...props
}: SkeletonProps) {
  const reducedMotion = prefersReducedMotion();
  const shouldAnimate = !reducedMotion && animation !== 'none';

  const variantStyles = {
    text: 'h-4 rounded',
    circular: 'rounded-full',
    rectangular: 'rounded-none',
    rounded: 'rounded-md',
  };

  const animationClass =
    shouldAnimate && animation === 'wave'
      ? 'animate-shimmer'
      : shouldAnimate
        ? 'animate-pulse'
        : '';

  return (
    <div
      className={cn(
        'bg-muted',
        variantStyles[variant],
        animationClass,
        className
      )}
      style={{
        width: width || (variant === 'text' ? '100%' : undefined),
        height: height || (variant === 'text' ? '1em' : undefined),
        ...style,
      }}
      aria-busy="true"
      aria-label="Loading"
      {...props}
    />
  );
}

/**
 * Skeleton Text - Multiple lines
 */
export function SkeletonText({
  lines = 3,
  className,
  ...props
}: {
  lines?: number;
  className?: string;
} & React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn('space-y-2', className)} {...props}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          variant="text"
          width={i === lines - 1 ? '80%' : '100%'}
        />
      ))}
    </div>
  );
}

/**
 * Skeleton Card - Card-shaped skeleton
 */
export function SkeletonCard({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('rounded-lg border bg-card p-6 space-y-4', className)}
      {...props}
    >
      <Skeleton variant="text" width="60%" height="1.5rem" />
      <SkeletonText lines={3} />
      <div className="flex gap-2">
        <Skeleton variant="rounded" width="80px" height="32px" />
        <Skeleton variant="rounded" width="80px" height="32px" />
      </div>
    </div>
  );
}
