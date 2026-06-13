import { vi } from 'vitest';

// ------------------
// Safe fetch shim (if node env does not have fetch)
// ------------------
if (typeof (globalThis as any).fetch !== 'function') {
  (globalThis as any).fetch = vi.fn(async () => {
    return {
      ok: true,
      status: 200,
      json: async () => ({}),
      text: async () => '',
      headers: new Map(),
    };
  });
}

// Mock Next.js server internals
vi.mock('next/headers', () => ({
  cookies: vi.fn(() => ({
    get: () => undefined,
    set: () => undefined,
    delete: () => undefined,
    has: () => false,
    getAll: () => [],
  })),
  headers: vi.fn(() => ({
    get: () => null,
    entries: () => [],
  })),
}));

vi.mock('next/server', () => {
  class NextRequest {
    url = '';
    constructor(url) {
      this.url = url;
    }
    async json() {
      return {};
    }
  }
  class NextResponse {
    body;
    opts;
    constructor(body, opts) {
      this.body = body;
      this.opts = opts;
    }
    static json(data, opts) {
      return new NextResponse(data, opts);
    }
    static redirect() {
      return new NextResponse();
    }
  }
  return { NextRequest, NextResponse };
});

// Mock client-side Clerk hooks
vi.mock('@clerk/nextjs', () => ({
  useUser: vi.fn(() => ({ user: null, isLoaded: true })),
  useAuth: vi.fn(() => ({
    isSignedIn: false,
    userId: null,
    signIn: vi.fn(),
    signOut: vi.fn(),
    signUp: vi.fn(),
  })),
  SignInButton: ({ children }) => children,
  SignUpButton: ({ children }) => children,
  UserButton: () => null,
  SignedIn: () => null,
  SignedOut: ({ children }) => children,
}));

// Mock server-side Clerk helpers
vi.mock('@clerk/nextjs/server', () => ({
  auth: vi.fn(() => ({ userId: null })),
  currentUser: vi.fn(() => null),
}));

// Mock @om/avatar package
vi.mock('@om/avatar', () => ({
  clampAllMorphs: (x) => x,
  clampMorph: (x) => x,
  isNSFWSlot: () => false,
  resolvePolicy: () => ({ allowed: true }),
  AvatarSpecV15: {
    safeParse: vi.fn(),
  },
  createDefaultAvatarSpec: vi.fn(() => ({})),
}));

// Mock environment
vi.mock('@/env', () => ({
  env: {
    FEATURE_ADULT_ZONE: 'true',
    FEATURE_AVATAR_NSFW: 'true',
    DATABASE_URL: 'postgresql://test',
    NEXT_PUBLIC_APP_URL: 'http://localhost:3000',
  },
}));
