/**
 * Performance Monitoring Utilities
 * Track and log performance metrics
 */

/**
 * Measure execution time of a function
 */
export function measurePerformance<T>(
  name: string,
  fn: () => T | Promise<T>
): T | Promise<T> {
  const start = performance.now();

  const result = fn();

  if (result instanceof Promise) {
    return result
      .then((value) => {
        const duration = performance.now() - start;
        logPerformance(name, duration);
        return value;
      })
      .catch((error) => {
        const duration = performance.now() - start;
        logPerformance(name, duration, error);
        throw error;
      });
  }

  const duration = performance.now() - start;
  logPerformance(name, duration);
  return result;
}

/**
 * Log performance metric
 */
function logPerformance(name: string, duration: number, error?: Error) {
  // Log slow operations
  if (duration > 1000) {
    console.warn(`[PERF] Slow operation: ${name} took ${duration.toFixed(2)}ms`);
  }

  // Track in analytics (if available)
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'performance', {
      operation: name,
      duration: Math.round(duration),
      slow: duration > 1000,
    });
  }

  // Send to monitoring service
  if (error) {
    console.error(`[PERF] Error in ${name}:`, error);
  }
}

/**
 * Track page load performance
 * Call this once in your app (e.g., in root layout or _app)
 */
export function trackPageLoad() {
  if (typeof window === 'undefined') return;

  // Only track once
  if ((window as any).__pageLoadTracked) return;
  (window as any).__pageLoadTracked = true;

  window.addEventListener('load', () => {
    const perfData = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;

    if (perfData) {
      const metrics = {
        dns: perfData.domainLookupEnd - perfData.domainLookupStart,
        tcp: perfData.connectEnd - perfData.connectStart,
        request: perfData.responseStart - perfData.requestStart,
        response: perfData.responseEnd - perfData.responseStart,
        dom: perfData.domContentLoadedEventEnd - perfData.domContentLoadedEventStart,
        load: perfData.loadEventEnd - perfData.loadEventStart,
        total: perfData.loadEventEnd - perfData.fetchStart,
      };

      // Log slow loads
      if (metrics.total > 3000) {
        console.warn('[PERF] Slow page load:', metrics);
      }

      // Track in analytics
      if (window.gtag) {
        window.gtag('event', 'page_load', {
          dns: Math.round(metrics.dns),
          tcp: Math.round(metrics.tcp),
          request: Math.round(metrics.request),
          response: Math.round(metrics.response),
          dom: Math.round(metrics.dom),
          load: Math.round(metrics.load),
          total: Math.round(metrics.total),
        });
      }
    }
  });
}

/**
 * Track Web Vitals
 */
export function trackWebVitals() {
  if (typeof window === 'undefined') return;

  // Track Largest Contentful Paint (LCP)
  new PerformanceObserver((list) => {
    const entries = list.getEntries();
    const lastEntry = entries[entries.length - 1] as PerformanceEntry & {
      renderTime?: number;
      loadTime?: number;
    };

    const lcp = lastEntry.renderTime || lastEntry.loadTime || 0;

    if (lcp > 2500) {
      console.warn(`[PERF] Slow LCP: ${lcp.toFixed(2)}ms`);
    }

    if (window.gtag) {
      window.gtag('event', 'web_vital', {
        metric_name: 'LCP',
        value: Math.round(lcp),
        threshold: 2500,
      });
    }
  }).observe({ entryTypes: ['largest-contentful-paint'] });

  // Track First Input Delay (FID)
  new PerformanceObserver((list) => {
    const entries = list.getEntries();
    entries.forEach((entry) => {
      if (!('processingStart' in entry)) return;
      const eventEntry = entry as PerformanceEventTiming;
      const fid = eventEntry.processingStart - eventEntry.startTime;

      if (fid > 100) {
        console.warn(`[PERF] Slow FID: ${fid.toFixed(2)}ms`);
      }

      if (window.gtag) {
        window.gtag('event', 'web_vital', {
          metric_name: 'FID',
          value: Math.round(fid),
          threshold: 100,
        });
      }
    });
  }).observe({ entryTypes: ['first-input'] });

  // Track Cumulative Layout Shift (CLS)
  let clsValue = 0;
  new PerformanceObserver((list) => {
    const entries = list.getEntries();
    entries.forEach((entry) => {
      if (!('hadRecentInput' in entry)) return;
      const layoutEntry = entry as LayoutShift;
      if (!layoutEntry.hadRecentInput) {
        clsValue += layoutEntry.value;
      }
    });

    if (clsValue > 0.1) {
      console.warn(`[PERF] High CLS: ${clsValue.toFixed(3)}`);
    }

    if (window.gtag) {
      window.gtag('event', 'web_vital', {
        metric_name: 'CLS',
        value: Math.round(clsValue * 1000) / 1000,
        threshold: 0.1,
      });
    }
  }).observe({ entryTypes: ['layout-shift'] });
}

// Extend Window interface for gtag
declare global {
  interface Window {
    gtag?: (
      command: string,
      targetId: string,
      config?: Record<string, any>
    ) => void;
  }
}

// Extend PerformanceEntry for layout shift
interface LayoutShift extends PerformanceEntry {
  value: number;
  hadRecentInput: boolean;
}
