/**
 * Security Middleware
 * Comprehensive security checks for API routes
 */

import { NextRequest, NextResponse } from 'next/server';
import { logSecurityEvent } from '@/lib/security/audit-logger';

interface SecurityCheck {
  name: string;
  check: (req: NextRequest) => Promise<boolean> | boolean;
  action: 'reject' | 'warn';
  severity: 'low' | 'medium' | 'high' | 'critical';
}

/**
 * SQL injection patterns
 */
const SQL_INJECTION_PATTERNS = [
  /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|EXECUTE|UNION|SCRIPT)\b)/gi,
  /('|(\\')|(;)|(--)|(\/\*)|(\*\/)|(\+)|(\%27)|(\%3B))/gi,
  /(\bOR\b.*=.*)|(\bAND\b.*=.*)/gi,
];

/**
 * XSS patterns
 */
const XSS_PATTERNS = [
  /<script[^>]*>.*?<\/script>/gi,
  /<iframe[^>]*>.*?<\/iframe>/gi,
  /javascript:/gi,
  /on\w+\s*=/gi, // onclick=, onerror=, etc.
  /<img[^>]*src[^>]*=.*javascript:/gi,
  /<svg[^>]*onload/gi,
];

/**
 * Path traversal patterns
 */
const PATH_TRAVERSAL_PATTERNS = [
  /\.\.\//g,
  /\.\.\\/g,
  /\.\./g,
  /%2e%2e%2f/gi,
  /%2e%2e\\/gi,
];

/**
 * Check for SQL injection attempts
 */
function checkSQLInjection(value: string): boolean {
  return SQL_INJECTION_PATTERNS.some((pattern) => pattern.test(value));
}

/**
 * Check for XSS attempts
 */
function checkXSS(value: string): boolean {
  return XSS_PATTERNS.some((pattern) => pattern.test(value));
}

/**
 * Check for path traversal attempts
 */
function checkPathTraversal(value: string): boolean {
  return PATH_TRAVERSAL_PATTERNS.some((pattern) => pattern.test(value));
}

/**
 * Validate Content-Type header
 */
function validateContentType(req: NextRequest): boolean {
  const method = req.method;
  const contentType = req.headers.get('content-type');

  // GET and DELETE don't need Content-Type
  if (method === 'GET' || method === 'DELETE') {
    return true;
  }

  // POST and PUT require Content-Type
  if (method === 'POST' || method === 'PUT' || method === 'PATCH') {
    if (!contentType) {
      return false;
    }

    // Allow JSON and form data
    const allowedTypes = [
      'application/json',
      'application/x-www-form-urlencoded',
      'multipart/form-data',
    ];

    return allowedTypes.some((type) => contentType.includes(type));
  }

  return true;
}

/**
 * Check request size
 */
function checkRequestSize(req: NextRequest): boolean {
  const contentLength = req.headers.get('content-length');
  if (!contentLength) return true;

  const size = parseInt(contentLength, 10);
  const maxSize = 10 * 1024 * 1024; // 10MB

  return size <= maxSize;
}

/**
 * Extract all string values from request
 */
async function extractRequestValues(req: NextRequest): Promise<string[]> {
  const values: string[] = [];

  // URL parameters
  const url = new URL(req.url);
  url.searchParams.forEach((value) => values.push(value));

  // Headers
  req.headers.forEach((value) => values.push(value));

  // Body (if JSON)
  try {
    if (req.method !== 'GET' && req.method !== 'HEAD') {
      const contentType = req.headers.get('content-type');
      if (contentType?.includes('application/json')) {
        const body = await req.clone().json().catch(() => ({}));
        values.push(JSON.stringify(body));
      }
    }
  } catch {
    // Ignore parsing errors
  }

  return values;
}

/**
 * Security checks
 */
const securityChecks: SecurityCheck[] = [
  {
    name: 'Content-Type validation',
    check: validateContentType,
    action: 'reject',
    severity: 'medium',
  },
  {
    name: 'Request size limit',
    check: checkRequestSize,
    action: 'reject',
    severity: 'high',
  },
  {
    name: 'SQL injection detection',
    check: async (req) => {
      const values = await extractRequestValues(req);
      return !values.some((value) => checkSQLInjection(value));
    },
    action: 'reject',
    severity: 'critical',
  },
  {
    name: 'XSS detection',
    check: async (req) => {
      const values = await extractRequestValues(req);
      return !values.some((value) => checkXSS(value));
    },
    action: 'reject',
    severity: 'critical',
  },
  {
    name: 'Path traversal detection',
    check: async (req) => {
      const values = await extractRequestValues(req);
      return !values.some((value) => checkPathTraversal(value));
    },
    action: 'reject',
    severity: 'high',
  },
];

/**
 * Security middleware
 */
export async function securityMiddleware(
  req: NextRequest
): Promise<NextResponse | null> {
  const clientIP = getClientIP(req);
  const userAgent = req.headers.get('user-agent') || 'unknown';

  for (const check of securityChecks) {
    try {
      const passed = await check.check(req);

      if (!passed) {
        // Log security event
        await logSecurityEvent({
          action: 'security_check_failed',
          entity: 'Request',
          entityId: req.url,
          changes: {
            check: check.name,
            severity: check.severity,
            url: req.url,
            method: req.method,
            ip: clientIP,
            userAgent,
          },
          ipAddress: clientIP,
          userAgent,
        });

        if (check.action === 'reject') {
          return NextResponse.json(
            {
              error: 'Security Check Failed',
              message: 'Request rejected due to security policy violation.',
            },
            { status: 400 }
          );
        }
      }
    } catch (error) {
      console.error(`Security check ${check.name} failed:`, error);
      // Continue with other checks
    }
  }

  return null; // Request passed all checks
}

/**
 * Get client IP address
 */
function getClientIP(req: NextRequest): string {
  const forwarded = req.headers.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0]?.trim() || 'unknown';
  }

  const realIP = req.headers.get('x-real-ip');
  if (realIP) {
    return realIP;
  }

  return req.ip || 'unknown';
}

/**
 * Apply security headers to response
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
  const csp = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval'", // Adjust based on your needs
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: https:",
    "font-src 'self' data:",
    "connect-src 'self' https://api.mapbox.com https://*.pusher.com",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'",
  ].join('; ');

  response.headers.set('Content-Security-Policy', csp);

  // Referrer-Policy
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');

  // Permissions-Policy
  response.headers.set(
    'Permissions-Policy',
    'geolocation=(), microphone=(), camera=()'
  );

  return response;
}

