import '@testing-library/jest-dom';
import { PrismaClient } from '@prisma/client';

// Mock Prisma
jest.mock('@/server/db', () => ({
  prisma: new PrismaClient(),
}));

// Mock NextAuth
jest.mock('next-auth/react', () => ({
  useSession: jest.fn(() => ({
    data: null,
    status: 'unauthenticated',
  })),
  signIn: jest.fn(),
  signOut: jest.fn(),
}));

// Mock tRPC
jest.mock('@/lib/trpc/client', () => ({
  trpc: {
    incidents: {
      getAll: {
        useQuery: jest.fn(() => ({
          data: null,
          isLoading: false,
        })),
      },
    },
  },
}));
