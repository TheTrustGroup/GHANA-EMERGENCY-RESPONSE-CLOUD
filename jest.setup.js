/**
 * Jest Setup
 * Global test configuration and mocks
 */

import '@testing-library/jest-dom';

// Polyfill for Request/Response (needed for Next.js in test environment)
if (typeof global.Request === 'undefined') {
  global.Request = class Request {
    constructor(input, init = {}) {
      this.url = typeof input === 'string' ? input : input.url;
      this.method = init.method || 'GET';
      this.headers = new Headers(init.headers);
      this.body = init.body || null;
    }
  };
}

if (typeof global.Response === 'undefined') {
  global.Response = class Response {
    constructor(body, init = {}) {
      this.body = body;
      this.status = init.status || 200;
      this.statusText = init.statusText || 'OK';
      this.headers = new Headers(init.headers);
      this.ok = this.status >= 200 && this.status < 300;
    }
    json() {
      return Promise.resolve(JSON.parse(this.body));
    }
    text() {
      return Promise.resolve(String(this.body));
    }
  };
}

if (typeof global.Headers === 'undefined') {
  global.Headers = class Headers {
    constructor(init = {}) {
      this.map = new Map();
      if (init) {
        Object.entries(init).forEach(([key, value]) => {
          this.map.set(key.toLowerCase(), value);
        });
      }
    }
    get(name) {
      return this.map.get(name.toLowerCase()) || null;
    }
    set(name, value) {
      this.map.set(name.toLowerCase(), value);
    }
    has(name) {
      return this.map.has(name.toLowerCase());
    }
    forEach(callback) {
      this.map.forEach((value, key) => callback(value, key, this));
    }
  };
}

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter() {
    return {
      push: jest.fn(),
      replace: jest.fn(),
      prefetch: jest.fn(),
      back: jest.fn(),
      pathname: '/',
      query: {},
      asPath: '/',
    };
  },
  usePathname() {
    return '/';
  },
  useSearchParams() {
    return new URLSearchParams();
  },
}));

// Mock Next.js Image component
jest.mock('next/image', () => ({
  __esModule: true,
  default: (props) => {
    // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
    const React = require('react');
    return React.createElement('img', props);
  },
}));

// Mock environment variables
process.env.NODE_ENV = 'test';
process.env.NEXTAUTH_SECRET = 'test-secret-key-for-testing-only';
process.env.NEXTAUTH_URL = 'http://localhost:3000';
process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test';
process.env.NEXT_PUBLIC_MAPBOX_TOKEN = 'test-mapbox-token';
process.env.PUSHER_APP_ID = 'test-pusher-app-id';
process.env.NEXT_PUBLIC_PUSHER_KEY = 'test-pusher-key';
process.env.PUSHER_SECRET = 'test-pusher-secret';
process.env.NEXT_PUBLIC_PUSHER_CLUSTER = 'mt1';
process.env.ENCRYPTION_MASTER_KEY = 'test-encryption-key-32-characters-long';

// Suppress console errors in tests (optional)
// global.console = {
//   ...console,
//   error: jest.fn(),
//   warn: jest.fn(),
// };

// Setup global test timeout
jest.setTimeout(10000);

