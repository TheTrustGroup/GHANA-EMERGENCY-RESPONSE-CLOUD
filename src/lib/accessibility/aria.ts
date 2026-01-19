/**
 * ARIA Utilities
 * Helper functions for ARIA attributes and accessibility
 */

/**
 * Generate ARIA label for an action button
 */
export function getActionAriaLabel(action: string, item?: string): string {
  if (item) {
    return `${action} ${item}`;
  }
  return action;
}

/**
 * Generate ARIA label for a status badge
 */
export function getStatusAriaLabel(status: string, severity?: string): string {
  if (severity) {
    return `Status: ${status}, Severity: ${severity}`;
  }
  return `Status: ${status}`;
}

/**
 * Generate ARIA label for a navigation item
 */
export function getNavAriaLabel(label: string, isActive?: boolean): string {
  if (isActive) {
    return `${label}, current page`;
  }
  return `Navigate to ${label}`;
}

/**
 * Generate ARIA label for a form field
 */
export function getFieldAriaLabel(
  label: string,
  isRequired?: boolean,
  hasError?: boolean
): string {
  let ariaLabel = label;
  if (isRequired) {
    ariaLabel += ', required';
  }
  if (hasError) {
    ariaLabel += ', has error';
  }
  return ariaLabel;
}

/**
 * Generate ARIA description for help text
 */
export function getFieldAriaDescription(helpText: string): string {
  return helpText;
}

/**
 * Generate ARIA live region announcement
 */
export function announceToScreenReader(message: string, priority: 'polite' | 'assertive' = 'polite'): void {
  const announcement = document.createElement('div');
  announcement.setAttribute('role', 'status');
  announcement.setAttribute('aria-live', priority);
  announcement.setAttribute('aria-atomic', 'true');
  announcement.className = 'sr-only';
  announcement.textContent = message;
  
  document.body.appendChild(announcement);
  
  // Remove after announcement
  setTimeout(() => {
    document.body.removeChild(announcement);
  }, 1000);
}
