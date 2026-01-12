/**
 * Loading Spinner Component
 * Animated spinner with size and color variants
 */

import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

const spinnerVariants = cva('animate-spin', {
  variants: {
    size: {
      sm: 'h-4 w-4',
      md: 'h-6 w-6',
      lg: 'h-8 w-8',
    },
    variant: {
      default: 'text-primary',
      muted: 'text-muted-foreground',
      destructive: 'text-destructive',
      success: 'text-green-600',
    },
  },
  defaultVariants: {
    size: 'md',
    variant: 'default',
  },
});

export interface LoadingSpinnerProps
  extends VariantProps<typeof spinnerVariants> {
  className?: string;
  'aria-label'?: string;
}

export function LoadingSpinner({
  size,
  variant,
  className,
  'aria-label': ariaLabel = 'Loading',
}: LoadingSpinnerProps) {
  return (
    <Loader2
      className={cn(spinnerVariants({ size, variant }), className)}
      aria-label={ariaLabel}
      role="status"
      aria-live="polite"
    />
  );
}

