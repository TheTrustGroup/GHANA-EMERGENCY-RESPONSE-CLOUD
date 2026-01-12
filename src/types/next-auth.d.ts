/**
 * NextAuth Type Extensions
 * Extends NextAuth types to include custom user properties
 */

import { UserRole } from '@prisma/client';
import 'next-auth';
import 'next-auth/jwt';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      email: string;
      name: string | null;
      role: UserRole;
      agencyId: string | null;
      isActive: boolean;
    };
  }

  interface User {
    id: string;
    email: string;
    name: string | null;
    role: UserRole;
    agencyId: string | null;
    isActive: boolean;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    role: UserRole;
    agencyId: string | null;
    isActive: boolean;
  }
}

