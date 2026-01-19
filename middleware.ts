/**
 * Next.js Middleware
 * Protects routes based on authentication and authorization
 */

import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';
import { UserRole } from '@prisma/client';

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const pathname = req.nextUrl.pathname;

    // Admin routes - require SYSTEM_ADMIN
    if (pathname.startsWith('/admin')) {
      if (token?.role !== UserRole.SYSTEM_ADMIN) {
        return NextResponse.redirect(new URL('/dashboard', req.url));
      }
    }

    // Dispatch routes - require DISPATCHER or higher
    if (pathname.startsWith('/dispatch')) {
      if (
        token?.role !== UserRole.DISPATCHER &&
        token?.role !== UserRole.AGENCY_ADMIN &&
        token?.role !== UserRole.SYSTEM_ADMIN
      ) {
        return NextResponse.redirect(new URL('/dashboard', req.url));
      }
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const pathname = req.nextUrl.pathname;

        // Public routes
        if (
          pathname === '/' ||
          pathname.startsWith('/auth') ||
          pathname.startsWith('/api/webhooks') ||
          pathname.startsWith('/test-agency-logos') ||
          pathname.startsWith('/report')
        ) {
          return true;
        }

        // API routes (except auth and webhooks)
        if (pathname.startsWith('/api')) {
          // Allow /api/auth/* without authentication
          if (pathname.startsWith('/api/auth')) {
            return true;
          }
          // Require authentication for other API routes
          return !!token;
        }

        // Protected routes require authentication
        if (
          pathname.startsWith('/dashboard') ||
          pathname.startsWith('/admin') ||
          pathname.startsWith('/dispatch')
        ) {
          return !!token;
        }

        // Default: allow access
        return true;
      },
    },
  }
);

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};

