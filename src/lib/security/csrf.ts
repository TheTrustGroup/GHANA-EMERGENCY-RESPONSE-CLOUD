/**
 * CSRF Protection
 * Cross-Site Request Forgery protection for forms and API endpoints
 */

import { cookies } from 'next/headers';
import crypto from 'crypto';

const CSRF_TOKEN_COOKIE = 'csrf-token';
const CSRF_TOKEN_HEADER = 'x-csrf-token';
const CSRF_TOKEN_LENGTH = 32;

/**
 * Generate a CSRF token
 */
export function generateCSRFToken(): string {
  return crypto.randomBytes(CSRF_TOKEN_LENGTH).toString('hex');
}

/**
 * Get or create CSRF token for current session
 */
export async function getCSRFToken(): Promise<string> {
  const cookieStore = await cookies();
  let token = cookieStore.get(CSRF_TOKEN_COOKIE)?.value;

  if (!token) {
    token = generateCSRFToken();
    cookieStore.set(CSRF_TOKEN_COOKIE, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24, // 24 hours
      path: '/',
    });
  }

  return token;
}

/**
 * Verify CSRF token
 */
export async function verifyCSRFToken(token: string | null): Promise<boolean> {
  if (!token) {
    return false;
  }

  const cookieStore = await cookies();
  const cookieToken = cookieStore.get(CSRF_TOKEN_COOKIE)?.value;

  if (!cookieToken) {
    return false;
  }

  // Use constant-time comparison to prevent timing attacks
  return crypto.timingSafeEqual(
    Buffer.from(token),
    Buffer.from(cookieToken)
  );
}

/**
 * CSRF middleware for API routes
 */
export async function csrfMiddleware(
  request: Request
): Promise<{ valid: boolean; error?: string }> {
  // Skip CSRF for GET, HEAD, OPTIONS
  const method = request.method;
  if (['GET', 'HEAD', 'OPTIONS'].includes(method)) {
    return { valid: true };
  }

  // Get token from header
  const token = request.headers.get(CSRF_TOKEN_HEADER);

  // Verify token
  const isValid = await verifyCSRFToken(token);

  if (!isValid) {
    return {
      valid: false,
      error: 'Invalid or missing CSRF token',
    };
  }

  return { valid: true };
}

/**
 * Get CSRF token for client-side forms
 * Call this in a Server Component or API route
 */
export async function getCSRFTokenForForm(): Promise<string> {
  return getCSRFToken();
}
