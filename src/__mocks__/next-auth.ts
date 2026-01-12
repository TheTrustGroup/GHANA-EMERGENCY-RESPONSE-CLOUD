/**
 * Mock NextAuth
 */

export const mockSession = {
  user: {
    id: 'test-user-id',
    email: 'test@example.com',
    name: 'Test User',
    role: 'CITIZEN',
    agencyId: null,
  },
  expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
};

export const useSession = jest.fn(() => ({
  data: mockSession,
  status: 'authenticated',
}));

export const signIn = jest.fn();
export const signOut = jest.fn();

export const SessionProvider = ({ children }: { children: React.ReactNode }) => children;

