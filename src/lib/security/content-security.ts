/**
 * Content Security Policy
 * Generate and apply security headers
 */

import { NextResponse } from 'next/server';

/**
 * Generate Content Security Policy header
 */
export function generateCSP(): string {
  const policies: string[] = [];

  // Default source
  policies.push("default-src 'self'");

  // Scripts
  policies.push(
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://api.mapbox.com https://js.pusher.com"
  );

  // Styles
  policies.push("style-src 'self' 'unsafe-inline' https://fonts.googleapis.com");

  // Images
  policies.push("img-src 'self' data: https: blob:");

  // Fonts
  policies.push("font-src 'self' data: https://fonts.gstatic.com");

  // Connect (API calls)
  policies.push(
    "connect-src 'self' https://api.mapbox.com https://*.pusher.com https://*.pusherapp.com wss://*.pusher.com wss://*.pusherapp.com"
  );

  // Frames
  policies.push("frame-src 'none'");
  policies.push("frame-ancestors 'none'");

  // Base URI
  policies.push("base-uri 'self'");

  // Form actions
  policies.push("form-action 'self'");

  // Object source
  policies.push("object-src 'none'");

  // Upgrade insecure requests
  if (process.env.NODE_ENV === 'production') {
    policies.push('upgrade-insecure-requests');
  }

  return policies.join('; ');
}

/**
 * Apply all security headers to response
 */
export function applySecurityHeaders(response: NextResponse): NextResponse {
  // X-Frame-Options
  response.headers.set('X-Frame-Options', 'DENY');

  // X-Content-Type-Options
  response.headers.set('X-Content-Type-Options', 'nosniff');

  // X-XSS-Protection
  response.headers.set('X-XSS-Protection', '1; mode=block');

  // Strict-Transport-Security (HSTS)
  if (process.env.NODE_ENV === 'production') {
    response.headers.set(
      'Strict-Transport-Security',
      'max-age=31536000; includeSubDomains; preload'
    );
  }

  // Content-Security-Policy
  response.headers.set('Content-Security-Policy', generateCSP());

  // Referrer-Policy
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');

  // Permissions-Policy
  response.headers.set(
    'Permissions-Policy',
    'geolocation=(self), microphone=(), camera=(), payment=(), usb=(), magnetometer=(), gyroscope=(), accelerometer=()'
  );

  // X-Permitted-Cross-Domain-Policies
  response.headers.set('X-Permitted-Cross-Domain-Policies', 'none');

  return response;
}

