/**
 * Theme Utility Functions
 * Helper functions for theme-aware styling
 */

import { cn } from './utils';

/**
 * Get theme-aware card background class
 */
export function cardBg(className?: string) {
  return cn(
    'bg-card/90 dark:bg-card/95 backdrop-blur-sm',
    className
  );
}

/**
 * Get theme-aware text color class
 */
export function textColor(className?: string) {
  return cn(
    'text-foreground dark:text-foreground',
    className
  );
}

/**
 * Get theme-aware muted text color class
 */
export function mutedText(className?: string) {
  return cn(
    'text-muted-foreground dark:text-muted-foreground',
    className
  );
}

/**
 * Get theme-aware border color class
 */
export function borderColor(className?: string) {
  return cn(
    'border-border dark:border-border',
    className
  );
}
