/**
 * Authentication Helper Functions
 * Utilities for authentication and authorization
 */

import { getServerSession as nextAuthGetServerSession } from 'next-auth/next';
import type { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
// validateCredentials is defined in this file below
import { checkRateLimit, clearRateLimit } from '@/lib/rate-limit';
import { UserRole } from '@prisma/client';
import { formatGhanaPhone } from '@/server/db/utils';
import bcrypt from 'bcryptjs';
import { prisma } from '@/server/db';

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        identifier: {
          label: 'Email or Phone',
          type: 'text',
          placeholder: 'email@example.com or +233XXXXXXXXX',
        },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.identifier || !credentials?.password) {
          console.error('[AUTH] Missing credentials');
          throw new Error('Email/phone and password are required');
        }

        // Trim identifier but don't lowercase yet - need to check if it's email or phone first
        const rawIdentifier = credentials.identifier.trim();
        const rateLimitKey = `login:${rawIdentifier.toLowerCase()}`;

        // Check rate limiting (but don't block on first few attempts)
        if (checkRateLimit(rateLimitKey, 10, 15 * 60 * 1000)) {
          console.error(`[AUTH] Rate limit exceeded for: ${rawIdentifier}`);
          throw new Error('Too many login attempts. Please try again in 15 minutes.');
        }

        try {
          // Determine if identifier is email or phone
          const isEmail = rawIdentifier.includes('@');

          // Normalize based on type
          let normalizedIdentifier: string;
          if (isEmail) {
            // For email, lowercase it
            normalizedIdentifier = rawIdentifier.toLowerCase();          } else {
            // For phone, format it but preserve original for rate limiting
            normalizedIdentifier = formatGhanaPhone(rawIdentifier);          }

          // Validate credentials
          const user = await validateCredentials(normalizedIdentifier, credentials.password);

          if (!user) {
            console.error(`[AUTH] Invalid credentials for: ${rawIdentifier}`);
            // Don't throw here - let it return null so NextAuth handles it
            return null;
          }

          console.log(`[AUTH] Successfully authenticated: ${user.email} (${user.role})`);

          // Clear rate limit on successful login
          clearRateLimit(rateLimitKey);

          return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            agencyId: user.agencyId,
            isActive: user.isActive,
          };
        } catch (error) {
          console.error('[AUTH] Authentication error:', error);
          // Return null instead of throwing to let NextAuth handle the error properly
          return null;
        }
      },
    }),
  ],

  session: {
    strategy: 'jwt',
    maxAge: 7 * 24 * 60 * 60, // 7 days
    updateAge: 24 * 60 * 60, // 24 hours
  },

  jwt: {
    maxAge: 7 * 24 * 60 * 60, // 7 days
  },

  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
  },

  callbacks: {
    async jwt({ token, user, trigger }) {
      // Initial sign in
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.agencyId = user.agencyId;
        token.isActive = user.isActive;
      }

      // Refresh token rotation (update session periodically)
      if (trigger === 'update') {
        // Optionally refresh user data from database
        // For now, just return existing token
      }

      return token;
    },

    async session({ session, token }) {
      if (session.user && token) {
        session.user.id = token.id as string;
        session.user.role = token.role as UserRole;
        session.user.agencyId = token.agencyId as string | null;
        session.user.isActive = token.isActive as boolean;
      }

      return session;
    },
  },

  events: {
    async signIn({ isNewUser }) {
      if (isNewUser) {
        // You can add additional logic here for new user registration
      }
    },
  },

  secret: process.env.NEXTAUTH_SECRET,

  debug: process.env.NODE_ENV === 'development',
};

/**
 * Get server session wrapper
 * Use this in Server Components and API routes
 */
export async function getServerSession() {
  return nextAuthGetServerSession(authOptions);
}

/**
 * Require authentication
 * Throws error if user is not authenticated
 */
export async function requireAuth() {
  const session = await getServerSession();

  if (!session?.user) {
    throw new Error('Unauthorized: Authentication required');
  }

  if (!session.user.isActive) {
    throw new Error('Unauthorized: Account is inactive');
  }

  return session;
}

/**
 * Require specific role(s)
 * Throws error if user doesn't have required role
 */
export async function requireRole(...roles: UserRole[]) {
  const session = await requireAuth();

  if (!roles.includes(session.user.role)) {
    throw new Error(`Forbidden: Requires one of the following roles: ${roles.join(', ')}`);
  }

  return session;
}

/**
 * Hash password using bcrypt
 * Uses 12 salt rounds for production-grade security
 */
export async function hashPassword(password: string): Promise<string> {
  if (password.length < 8) {
    throw new Error('Password must be at least 8 characters long');
  }

  return bcrypt.hash(password, 12);
}

/**
 * Verify password against hash
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

/**
 * Validate user credentials
 * Returns user if credentials are valid, null otherwise
 */
export async function validateCredentials(
  identifier: string,
  password: string
): Promise<{
  id: string;
  email: string;
  name: string | null;
  role: UserRole;
  agencyId: string | null;
  isActive: boolean;
} | null> {
  try {
    // Normalize identifier - check if it's email or phone first
    const isEmail = identifier.includes('@');

        // For emails, lowercase. For phones, use as-is (already formatted)
        const normalizedIdentifier = isEmail ? identifier.toLowerCase().trim() : identifier.trim();

        console.log(
          `[VALIDATE] Looking up user with identifier: ${normalizedIdentifier} (isEmail: ${isEmail}, original: ${identifier})`
        );

    // Try to find user by email (case-insensitive) or phone
    const user = await prisma.users.findFirst({
      where: {
        OR: isEmail
          ? [
              // For email, use exact lowercase match
              { email: normalizedIdentifier },
            ]
          : [
              // For phone, try exact match (already formatted)
              { phone: identifier },
              // Also try with normalized (in case it wasn't formatted)
              { phone: normalizedIdentifier },
            ],
        isActive: true,
      },
    });

    if (!user) {
      console.error(
        `[VALIDATE] User not found: ${normalizedIdentifier} (type: ${isEmail ? 'email' : 'phone'})`
      );
      // Try alternative lookup for debugging
      if (isEmail) {
        const allUsers = await prisma.users.findMany({
          where: { email: { contains: normalizedIdentifier.split('@')[0] } },
          select: { email: true, isActive: true },
          take: 3,
        });
        console.error(
          `[VALIDATE] Similar emails found: ${allUsers.map((u) => u.email).join(', ')}`
        );
      }
      return null;
    }

    console.log(
      `[VALIDATE] User found: ${user.email} (Active: ${user.isActive}, Role: ${user.role})`
    );

    // Verify password
    const isValid = await verifyPassword(password, user.passwordHash);

    if (!isValid) {
      console.error(`[VALIDATE] Invalid password for: ${user.email}`);
      // Don't log the actual password, but log that comparison failed
      console.error(`[VALIDATE] Password hash exists: ${!!user.passwordHash}`);
      return null;
    }
    // Update last login
    await prisma.users
      .update({
        where: { id: user.id },
        data: { lastLoginAt: new Date() },
      })
      .catch((err) => {
        // Don't fail login if last login update fails
        console.error('[VALIDATE] Failed to update last login:', err);
      });

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      agencyId: user.agencyId,
      isActive: user.isActive,
    };
  } catch (error) {
    console.error('[VALIDATE] Error validating credentials:', error);
    return null;
  }
}
