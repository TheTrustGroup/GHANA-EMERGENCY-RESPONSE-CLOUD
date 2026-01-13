/**
 * Date formatting utilities
 * Client-safe date formatting to prevent hydration errors
 */

import { formatDistanceToNow, format } from 'date-fns';

/**
 * Safely format a date for display
 * Returns a consistent string that works on both server and client
 */
export function formatDateSafe(date: Date | string | null | undefined): string {
  if (!date) return 'N/A';

  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    if (isNaN(dateObj.getTime())) return 'Invalid Date';

    // Use ISO string for consistency between server and client
    return dateObj.toISOString();
  } catch {
    return 'Invalid Date';
  }
}

/**
 * Format relative time (e.g., "2 minutes ago")
 * Only use on client-side to prevent hydration errors
 */
export function formatRelativeTime(date: Date | string | null | undefined): string {
  if (!date) return 'N/A';

  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    if (isNaN(dateObj.getTime())) return 'Invalid Date';

    // Check if we're on the client
    if (typeof window === 'undefined') {
      return formatDateSafe(dateObj);
    }

    return formatDistanceToNow(dateObj, { addSuffix: true });
  } catch {
    return 'Invalid Date';
  }
}

/**
 * Format time with timezone awareness
 */
export function formatTime(date: Date | string | null | undefined): string {
  if (!date) return 'N/A';

  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    if (isNaN(dateObj.getTime())) return 'Invalid Date';

    // Use consistent format
    return format(dateObj, 'HH:mm');
  } catch {
    return 'Invalid Date';
  }
}

/**
 * Format full date and time
 */
export function formatDateTime(date: Date | string | null | undefined): string {
  if (!date) return 'N/A';

  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    if (isNaN(dateObj.getTime())) return 'Invalid Date';

    return format(dateObj, 'PPp');
  } catch {
    return 'Invalid Date';
  }
}
