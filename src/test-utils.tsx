/**
 * Test Utilities
 * Custom render function and test helpers
 */

import React, { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { SessionProvider } from 'next-auth/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { UserRole } from '@prisma/client';

// Mock NextAuth session
export const mockSession = {
  user: {
    id: 'test-user-id',
    email: 'test@example.com',
    name: 'Test User',
    role: 'CITIZEN' as UserRole,
    agencyId: null,
    isActive: true,
  },
  expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
};

interface AllTheProvidersProps {
  children: React.ReactNode;
  session?: typeof mockSession;
}

function AllTheProviders({ children, session = mockSession }: AllTheProvidersProps) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        refetchOnWindowFocus: false,
      },
      mutations: {
        retry: false,
      },
    },
  });

  return (
    <SessionProvider session={session}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </SessionProvider>
  );
}

interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  session?: typeof mockSession;
}

const customRender = (
  ui: ReactElement,
  { session, ...renderOptions }: CustomRenderOptions = {}
) => {
  return render(ui, {
    wrapper: ({ children }) => (
      <AllTheProviders session={session}>{children}</AllTheProviders>
    ),
    ...renderOptions,
  });
};

// Re-export everything
export * from '@testing-library/react';
export { customRender as render };

// Mock Mapbox
export const mockMapbox = {
  Map: jest.fn().mockImplementation(() => ({
    on: jest.fn(),
    off: jest.fn(),
    remove: jest.fn(),
    getSource: jest.fn(),
    addSource: jest.fn(),
    addLayer: jest.fn(),
    removeLayer: jest.fn(),
    removeSource: jest.fn(),
    fitBounds: jest.fn(),
    setCenter: jest.fn(),
    setZoom: jest.fn(),
  })),
  Marker: jest.fn().mockImplementation(() => ({
    setLngLat: jest.fn().mockReturnThis(),
    addTo: jest.fn().mockReturnThis(),
    remove: jest.fn(),
  })),
  Popup: jest.fn().mockImplementation(() => ({
    setHTML: jest.fn().mockReturnThis(),
    setLngLat: jest.fn().mockReturnThis(),
    addTo: jest.fn().mockReturnThis(),
  })),
  accessToken: 'test-token',
};

// Helper functions for common test scenarios
export const testHelpers = {
  /**
   * Wait for async operations to complete
   */
  waitFor: (ms: number) => new Promise((resolve) => setTimeout(resolve, ms)),

  /**
   * Create a mock fetch response
   */
  createMockResponse: (data: unknown, status = 200) => ({
    ok: status >= 200 && status < 300,
    status,
    json: async () => data,
    text: async () => JSON.stringify(data),
    headers: new Headers(),
  }),

  /**
   * Mock fetch with response
   */
  mockFetch: (response: Response) => {
    global.fetch = jest.fn().mockResolvedValue(response);
  },

  /**
   * Reset all mocks
   */
  resetMocks: () => {
    jest.clearAllMocks();
  },
};

