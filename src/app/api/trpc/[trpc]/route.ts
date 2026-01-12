/**
 * tRPC API Route Handler
 * Handles all tRPC requests in Next.js App Router
 */
import { fetchRequestHandler } from '@trpc/server/adapters/fetch';
import { type NextRequest } from 'next/server';
import { appRouter } from '@/server/api/root';
import { createTRPCContext } from '@/server/api/trpc';

const handler = (req: NextRequest) =>
  fetchRequestHandler({
    endpoint: '/api/trpc',
    req,
    router: appRouter,
    createContext: (opts) => createTRPCContext(opts),
    responseMeta() {
      // Apply security headers via responseMeta
      const headers: Record<string, string> = {
        'X-Frame-Options': 'DENY',
        'X-Content-Type-Options': 'nosniff',
        'X-XSS-Protection': '1; mode=block',
        'Referrer-Policy': 'strict-origin-when-cross-origin',
      };

      if (process.env.NODE_ENV === 'production') {
        headers['Strict-Transport-Security'] = 'max-age=63072000; includeSubDomains; preload';
      }

      return {
        headers,
      };
    },
    onError:
      process.env.NODE_ENV === 'development'
        ? ({ path, error }) => {
            console.error(
              `❌ tRPC failed on ${path ?? '<no-path>'}: ${error.message}`
            );
          }
        : undefined,
  });

export { handler as GET, handler as POST };

