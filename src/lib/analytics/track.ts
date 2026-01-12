/**
 * Analytics Tracking Utilities
 * Track user actions and system events
 */

/**
 * Track a custom event
 */
export function trackEvent(
  eventName: string,
  properties?: Record<string, any>
): void {
  if (typeof window === 'undefined') return;

  // Google Analytics (if available)
  if (window.gtag) {
    window.gtag('event', eventName, {
      ...properties,
      timestamp: new Date().toISOString(),
    });
  }

  // Custom analytics endpoint
  fetch('/api/analytics/track', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      event: eventName,
      properties,
      timestamp: new Date().toISOString(),
      userId: getCurrentUserId(),
      sessionId: getSessionId(),
      url: window.location.href,
      userAgent: navigator.userAgent,
    }),
  }).catch((error) => {
    // Silently fail - analytics should never break the app
    console.error('Analytics tracking failed:', error);
  });
}

/**
 * Track page view
 */
export function trackPageView(page: string, additionalData?: Record<string, any>): void {
  trackEvent('page_view', {
    page,
    ...additionalData,
  });
}

/**
 * Track form abandonment
 */
export function trackFormAbandonment(
  formName: string,
  step: number,
  reason?: string
): void {
  trackEvent('form_abandoned', {
    formName,
    step,
    reason,
  });
}

/**
 * Track user flow step
 */
export function trackUserFlow(flow: string, step: string): void {
  trackEvent('user_flow', {
    flow,
    step,
  });
}

/**
 * Track critical incident events
 */
export function trackIncidentEvent(
  event: 'reported' | 'assigned' | 'resolved',
  data: {
    severity?: string;
    category?: string;
    region?: string;
    responseTime?: number;
    [key: string]: any;
  }
): void {
  trackEvent(`incident_${event}`, data);
}

/**
 * Track dispatch events
 */
export function trackDispatchEvent(
  event: 'created' | 'accepted' | 'completed',
  data: {
    responseTime?: number;
    agency?: string;
    [key: string]: any;
  }
): void {
  trackEvent(`dispatch_${event}`, data);
}

/**
 * Get current user ID from session
 */
function getCurrentUserId(): string | null {
  // This would typically come from your auth system
  // For now, return null or get from localStorage/session
  if (typeof window === 'undefined') return null;
  
  try {
    const session = sessionStorage.getItem('user');
    if (session) {
      const user = JSON.parse(session);
      return user.id || null;
    }
  } catch {
    // Ignore errors
  }
  
  return null;
}

/**
 * Get or create session ID
 */
function getSessionId(): string {
  if (typeof window === 'undefined') return '';

  let sessionId = sessionStorage.getItem('analytics_session_id');
  
  if (!sessionId) {
    sessionId = crypto.randomUUID();
    sessionStorage.setItem('analytics_session_id', sessionId);
  }
  
  return sessionId;
}

// Extend Window interface
declare global {
  interface Window {
    gtag?: (
      command: string,
      targetId: string,
      config?: Record<string, any>
    ) => void;
  }
}
