'use client';

/**
 * Loading States Components
 * Various loading state components for better UX
 */

import { LoadingSpinner } from './loading-spinner';
import { Skeleton, SkeletonText, SkeletonCard } from './skeleton';
import { cn } from '@/lib/utils';

interface LoadingStateProps {
  message?: string;
  className?: string;
}

/**
 * Full Page Loading State
 */
export function FullPageLoading({ message = 'Loading...', className }: LoadingStateProps) {
  return (
    <div
      className={cn(
        'flex min-h-screen items-center justify-center bg-background',
        className
      )}
      role="status"
      aria-live="polite"
      aria-label={message}
    >
      <div className="flex flex-col items-center gap-4">
        <LoadingSpinner size="lg" />
        <p className="text-sm text-muted-foreground">{message}</p>
      </div>
    </div>
  );
}

/**
 * Inline Loading State
 */
export function InlineLoading({ message, className }: LoadingStateProps) {
  return (
    <div
      className={cn('flex items-center gap-2 py-4', className)}
      role="status"
      aria-live="polite"
      aria-label={message || 'Loading'}
    >
      <LoadingSpinner size="sm" />
      {message && <p className="text-sm text-muted-foreground">{message}</p>}
    </div>
  );
}

/**
 * Button Loading State
 */
export function ButtonLoading({ className }: { className?: string }) {
  return (
    <LoadingSpinner
      size="sm"
      variant="default"
      className={cn('text-current', className)}
      aria-label="Loading"
    />
  );
}

/**
 * Table Loading State
 */
export function TableLoading({ rows = 5, columns = 4 }: { rows?: number; columns?: number }) {
  return (
    <div className="space-y-2" role="status" aria-label="Loading table data">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex gap-4">
          {Array.from({ length: columns }).map((_, j) => (
            <Skeleton key={j} variant="text" width="100%" height="1.5rem" />
          ))}
        </div>
      ))}
    </div>
  );
}

/**
 * Card Grid Loading State
 */
export function CardGridLoading({ count = 6 }: { count?: number }) {
  return (
    <div
      className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
      role="status"
      aria-label="Loading cards"
    >
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}

export { Skeleton, SkeletonText, SkeletonCard };
