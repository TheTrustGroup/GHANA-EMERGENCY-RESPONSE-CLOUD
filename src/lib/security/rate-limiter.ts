/**
 * Rate Limiter
 * Rate limiting for API endpoints using in-memory store or Redis
 */

import { NextRequest, NextResponse } from 'next/server';

interface RateLimitConfig {
  windowMs: number; // Time window in milliseconds
  maxRequests: number; // Maximum requests per window
  keyGenerator?: (req: NextRequest) => string; // Custom key generator
  skipSuccessfulRequests?: boolean;
  skipFailedRequests?: boolean;
}

interface RateLimitStore {
  get(key: string): Promise<number | null>;
  set(key: string, value: number, ttl: number): Promise<void>;
  increment(key: string, ttl: number): Promise<number>;
  reset(key: string): Promise<void>;
}

/**
 * In-memory rate limit store
 * For production, use Redis instead
 */
class MemoryStore implements RateLimitStore {
  private store: Map<string, { count: number; resetTime: number }> = new Map();
  constructor() {
    // Cleanup expired entries every minute
    setInterval(() => {
      const now = Date.now();
      for (const [key, value] of this.store.entries()) {
        if (value.resetTime < now) {
          this.store.delete(key);
        }
      }
    }, 60000);
  }

  async get(key: string): Promise<number | null> {
    const entry = this.store.get(key);
    if (!entry) return null;
    if (entry.resetTime < Date.now()) {
      this.store.delete(key);
      return null;
    }
    return entry.count;
  }

  async set(key: string, value: number, ttl: number): Promise<void> {
    this.store.set(key, {
      count: value,
      resetTime: Date.now() + ttl,
    });
  }

  async increment(key: string, ttl: number): Promise<number> {
    const entry = this.store.get(key);
    const now = Date.now();

    if (!entry || entry.resetTime < now) {
      this.store.set(key, { count: 1, resetTime: now + ttl });
      return 1;
    }

    entry.count++;
    this.store.set(key, entry);
    return entry.count;
  }

  async reset(key: string): Promise<void> {
    this.store.delete(key);
  }
}

// Global store instance
let store: RateLimitStore = new MemoryStore();

/**
 * Initialize rate limiter with custom store (e.g., Redis)
 */
export function initRateLimiter(customStore?: RateLimitStore) {
  if (customStore) {
    store = customStore;
  }
}

/**
 * Rate limit middleware
 */
export async function rateLimit(
  req: NextRequest,
  config: RateLimitConfig
): Promise<{ success: boolean; remaining: number; resetTime: number; retryAfter?: number }> {
  const key = config.keyGenerator
    ? config.keyGenerator(req)
    : getDefaultKey(req);

  const now = Date.now();
  const windowMs = config.windowMs;
  const maxRequests = config.maxRequests;

  // Get current count
  const currentCount = await store.increment(key, windowMs);
  const resetTime = now + windowMs;
  const remaining = Math.max(0, maxRequests - currentCount);

  if (currentCount > maxRequests) {
    const retryAfter = Math.ceil((resetTime - now) / 1000);
    return {
      success: false,
      remaining: 0,
      resetTime,
      retryAfter,
    };
  }

  return {
    success: true,
    remaining,
    resetTime,
  };
}

/**
 * Get default key for rate limiting
 */
function getDefaultKey(req: NextRequest): string {
  // Try to get user ID from session
  const userId = req.headers.get('x-user-id');
  if (userId) {
    return `user:${userId}`;
  }

  // Fall back to IP address
  const ip = getClientIP(req);
  return `ip:${ip}`;
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
 * Rate limit configurations for different endpoints
 */
export const rateLimitConfigs = {
  authentication: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 5,
    keyGenerator: (req: NextRequest) => `auth:${getClientIP(req)}`,
  },
  publicAPI: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 100,
    keyGenerator: (req: NextRequest) => `public:${getClientIP(req)}`,
  },
  authenticatedAPI: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 1000,
    keyGenerator: (req: NextRequest) => {
      const userId = req.headers.get('x-user-id');
      return userId ? `api:user:${userId}` : `api:ip:${getClientIP(req)}`;
    },
  },
  fileUpload: {
    windowMs: 60 * 60 * 1000, // 1 hour
    maxRequests: 10,
    keyGenerator: (req: NextRequest) => {
      const userId = req.headers.get('x-user-id');
      return userId ? `upload:user:${userId}` : `upload:ip:${getClientIP(req)}`;
    },
  },
  sms: {
    windowMs: 60 * 60 * 1000, // 1 hour
    maxRequests: 50,
    keyGenerator: () => 'sms:system', // System-wide limit
  },
};

/**
 * Rate limit middleware wrapper for Next.js API routes
 */
export function withRateLimit(
  config: RateLimitConfig,
  handler: (req: NextRequest) => Promise<NextResponse>
) {
  return async (req: NextRequest): Promise<NextResponse> => {
    const result = await rateLimit(req, config);

    if (!result.success) {
      const response = NextResponse.json(
        {
          error: 'Too Many Requests',
          message: 'Rate limit exceeded. Please try again later.',
          retryAfter: result.retryAfter,
        },
        { status: 429 }
      );

      // Set rate limit headers
      response.headers.set('X-RateLimit-Limit', String(config.maxRequests));
      response.headers.set('X-RateLimit-Remaining', String(result.remaining));
      response.headers.set('X-RateLimit-Reset', String(Math.ceil(result.resetTime / 1000)));
      if (result.retryAfter) {
        response.headers.set('Retry-After', String(result.retryAfter));
      }

      return response;
    }

    // Add rate limit headers to successful responses
    const response = await handler(req);
    response.headers.set('X-RateLimit-Limit', String(config.maxRequests));
    response.headers.set('X-RateLimit-Remaining', String(result.remaining));
    response.headers.set('X-RateLimit-Reset', String(Math.ceil(result.resetTime / 1000)));

    return response;
  };
}

