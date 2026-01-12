/**
 * tRPC Client Setup for React Components
 * Configure tRPC React Query client with proper error handling
 */
import { createTRPCReact } from '@trpc/react-query';
import { httpBatchLink } from '@trpc/client';
import type { AppRouter } from '@/server/api/root';
import superjson from 'superjson';

export const trpc = createTRPCReact<AppRouter>();

/**
 * Create tRPC client with error handling
 */
export function createTRPCClient() {
  return trpc.createClient({
    transformer: superjson,
    links: [
      httpBatchLink({
        url: `${process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'}/api/trpc`,
      }),
    ],
  });
}

// Default client instance
export const trpcClient = createTRPCClient();

