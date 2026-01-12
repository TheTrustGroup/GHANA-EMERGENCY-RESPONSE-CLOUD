/**
 * tRPC Query Caching
 * Cache tRPC query results for better performance
 */

import { memoryCache } from './memory-cache';

/**
 * Cache key generator for tRPC queries
 */
export function getCacheKey(path: string, input: unknown): string {
  const inputHash = JSON.stringify(input);
  return `trpc:query:${path}:${Buffer.from(inputHash).toString('base64')}`;
}

/**
 * Cache wrapper for tRPC queries
 */
export async function cachedQuery<T>(
  path: string,
  input: unknown,
  queryFn: () => Promise<T>,
  ttl: number = 300000 // 5 minutes default
): Promise<T> {
  const cacheKey = getCacheKey(path, input);

  // Try cache first
  const cached = memoryCache.get<T>(cacheKey);
  if (cached !== null) {
    return cached;
  }

  // Fetch fresh data
  const fresh = await queryFn();

  // Cache it
  memoryCache.set(cacheKey, fresh, ttl);

  return fresh;
}

/**
 * Invalidate cache for a specific path
 */
export function invalidateQueryCache(path: string): void {
  invalidateCache(`trpc:query:${path}:*`);
}

/**
 * Invalidate all query caches
 */
export function invalidateAllQueryCaches(): void {
  invalidateCache('trpc:query:*');
}

// Re-export invalidateCache
import { invalidateCache } from './memory-cache';
export { invalidateCache };
