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
          throw new Error('Email/phone and password are required');
        }

        // Rate limiting
        const identifier = credentials.identifier.toLowerCase().trim();
        const rateLimitKey = `login:${identifier}`;

        if (checkRateLimit(rateLimitKey, 5, 15 * 60 * 1000)) {
          throw new Error(
            'Too many login attempts. Please try again in 15 minutes.'
          );
        }

        try {
          // Normalize phone number if it looks like a phone
          let normalizedIdentifier = identifier;
          if (identifier.match(/^(\+?233|0)/)) {
            normalizedIdentifier = formatGhanaPhone(identifier);
          }

          // Validate credentials
          const user = await validateCredentials(
            normalizedIdentifier,
            credentials.password
          );

          if (!user) {
            throw new Error('Invalid email/phone or password');
          }

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
          console.error('Authentication error:', error);
          throw error;
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
    async signIn({ user, isNewUser }) {
      if (isNewUser) {
        console.log(`New user registered: ${user.email}`);
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
    throw new Error(
      `Forbidden: Requires one of the following roles: ${roles.join(', ')}`
    );
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
export async function verifyPassword(
  password: string,
  hash: string
): Promise<boolean> {
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
    // Try to find user by email or phone
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { email: identifier },
          { phone: identifier },
        ],
        isActive: true,
      },
    });

    if (!user) {
      return null;
    }

    // Verify password
    const isValid = await verifyPassword(password, user.passwordHash);

    if (!isValid) {
      return null;
    }

    // Update last login
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
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
    console.error('Error validating credentials:', error);
    return null;
  }
}

