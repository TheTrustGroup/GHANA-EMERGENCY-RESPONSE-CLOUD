/**
 * tRPC Server Setup
 * This file configures the tRPC router and context with authentication
 */
import { initTRPC, TRPCError } from '@trpc/server';
import superjson from 'superjson';
import { ZodError } from 'zod';
import { prisma } from '@/server/db';
import type { FetchCreateContextFnOptions } from '@trpc/server/adapters/fetch';
import { getServerSession } from '@/lib/auth';
import { UserRole } from '@prisma/client';

/**
 * Context creation function for tRPC (App Router)
 * This runs for every request
 */
export const createTRPCContext = async (opts: FetchCreateContextFnOptions) => {
  const session = await getServerSession();

  return {
    req: opts.req,
    resHeaders: opts.resHeaders,
    prisma,
    session,
  };
};

/**
 * Initialize tRPC
 */
const t = initTRPC.context<typeof createTRPCContext>().create({
  transformer: superjson,
  errorFormatter({ shape, error }) {
    return {
      ...shape,
      data: {
        ...shape.data,
        zodError:
          error.cause instanceof ZodError ? error.cause.flatten() : null,
      },
    };
  },
});

/**
 * Request logging middleware
 */
const loggingMiddleware = t.middleware(async ({ path, type, next }) => {
  const start = Date.now();
  const result = await next();
  const duration = Date.now() - start;

  if (process.env.NODE_ENV === 'development') {
    console.log(`[tRPC] ${type.toUpperCase()} ${path} - ${duration}ms`);
  }

  return result;
});

/**
 * Rate limiting middleware
 * Note: For production, use Redis-based rate limiting
 */
const rateLimitMiddleware = t.middleware(async ({ ctx, path, type, next }) => {
  // Skip rate limiting for queries (read operations) - they're cached
  if (type === 'query') {
    return next();
  }

  // Rate limit mutations and subscriptions
  // Simple in-memory rate limiting
  // For production, integrate with Redis-based rate limiter
  const userId = ctx.session?.user?.id;
  const identifier = userId || 'anonymous';

  // Simple rate limiting: 100 mutations per 15 minutes per user
  const rateLimitKey = `trpc:${identifier}:${path}`;
  const { memoryCache } = await import('@/lib/cache/memory-cache');
  
  const currentCount = memoryCache.get<number>(rateLimitKey) || 0;
  const maxRequests = 100;
  const windowMs = 15 * 60 * 1000; // 15 minutes

  if (currentCount >= maxRequests) {
    throw new TRPCError({
      code: 'TOO_MANY_REQUESTS',
      message: 'Rate limit exceeded. Please try again later.',
    });
  }

  // Increment counter
  memoryCache.set(rateLimitKey, currentCount + 1, windowMs);

  return next();
});

/**
 * Authentication middleware
 */
const isAuthenticated = t.middleware(async ({ ctx, next }) => {
  if (!ctx.session?.user) {
    throw new TRPCError({
      code: 'UNAUTHORIZED',
      message: 'You must be logged in to access this resource',
    });
  }

  if (!ctx.session.user.isActive) {
    throw new TRPCError({
      code: 'FORBIDDEN',
      message: 'Your account is inactive',
    });
  }

  return next({
    ctx: {
      ...ctx,
      session: {
        ...ctx.session,
        user: ctx.session.user,
      },
    },
  });
});

/**
 * Admin middleware
 */
const isAdmin = t.middleware(async ({ ctx, next }) => {
  if (!ctx.session?.user) {
    throw new TRPCError({
      code: 'UNAUTHORIZED',
      message: 'You must be logged in to access this resource',
    });
  }

  if (ctx.session.user.role !== UserRole.SYSTEM_ADMIN) {
    throw new TRPCError({
      code: 'FORBIDDEN',
      message: 'This action requires system administrator privileges',
    });
  }

  return next({
    ctx: {
      ...ctx,
      session: {
        ...ctx.session,
        user: ctx.session.user,
      },
    },
  });
});

/**
 * Dispatcher middleware (dispatcher, agency admin, or system admin)
 */
const isDispatcher = t.middleware(async ({ ctx, next }) => {
  if (!ctx.session?.user) {
    throw new TRPCError({
      code: 'UNAUTHORIZED',
      message: 'You must be logged in to access this resource',
    });
  }

      const allowedRoles: UserRole[] = [
        UserRole.DISPATCHER,
        UserRole.AGENCY_ADMIN,
        UserRole.SYSTEM_ADMIN,
      ];

      if (!allowedRoles.includes(ctx.session.user.role as UserRole)) {
    throw new TRPCError({
      code: 'FORBIDDEN',
      message: 'This action requires dispatcher or administrator privileges',
    });
  }

  return next({
    ctx: {
      ...ctx,
      session: {
        ...ctx.session,
        user: ctx.session.user,
      },
    },
  });
});

/**
 * Base router and procedure creators
 */
export const createTRPCRouter = t.router;

/**
 * Public procedure - no authentication required
 */
export const publicProcedure = t.procedure.use(loggingMiddleware);

/**
 * Protected procedure - requires authentication
 */
export const protectedProcedure = t.procedure
  .use(loggingMiddleware)
  .use(rateLimitMiddleware)
  .use(isAuthenticated);

/**
 * Admin procedure - requires SYSTEM_ADMIN role
 */
export const adminProcedure = t.procedure
  .use(loggingMiddleware)
  .use(rateLimitMiddleware)
  .use(isAdmin);

/**
 * Dispatcher procedure - requires DISPATCHER, AGENCY_ADMIN, or SYSTEM_ADMIN
 */
export const dispatcherProcedure = t.procedure
  .use(loggingMiddleware)
  .use(isDispatcher);

