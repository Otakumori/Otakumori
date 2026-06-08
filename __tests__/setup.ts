import { vi } from 'vitest';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);

// Jest compatibility shim - map jest.* to vitest vi.*
(global as any).jest = {
  fn: vi.fn,
  spyOn: vi.spyOn,
  mock: vi.mock,
  unmock: vi.unmock,
  clearAllMocks: vi.clearAllMocks,
  resetAllMocks: vi.resetAllMocks,
  restoreAllMocks: vi.restoreAllMocks,
  requireActual: (mod: string) => require(mod),
  isMockFunction: (fn: any) => !!(fn && fn._isMockFunction),
};

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
    url: string;
    method: string;
    headers: Headers;
    nextUrl: URL;
    private readonly requestBody?: BodyInit | null;

    constructor(url: string, init: RequestInit = {}) {
      this.url = url;
      this.method = init.method ?? 'GET';
      this.headers = new Headers(init.headers);
      this.nextUrl = new URL(url);
      this.requestBody = init.body;
    }

    async json() {
      if (typeof this.requestBody === 'string') return JSON.parse(this.requestBody);
      if (this.requestBody == null) return {};
      throw new TypeError('The shared NextRequest test mock only supports string JSON bodies.');
    }
  }
  class NextResponse {
    body?: BodyInit | null;
    opts?: ResponseInit;
    status: number;
    headers: Headers;
    constructor(body?: any, opts?: any) {
      this.body = body;
      this.opts = opts;
      this.status = opts?.status ?? 200;
      this.headers = new Headers(opts?.headers);
    }
    async json() {
      if (typeof this.body === 'string') return JSON.parse(this.body);
      return this.body ?? null;
    }
    async text() {
      return typeof this.body === 'string' ? this.body : JSON.stringify(this.body ?? '');
    }
    static json(data: any, opts?: any) {
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
  SignInButton: ({ children }: any) => children,
  SignUpButton: ({ children }: any) => children,
  UserButton: () => null,
  SignedIn: () => null,
  SignedOut: ({ children }: any) => children,
}));

// Mock server-side Clerk helpers
vi.mock('@clerk/nextjs/server', () => ({
  auth: vi.fn(() => ({ userId: null })),
  currentUser: vi.fn(() => null),
}));

// Mock @om/avatar package
vi.mock('@om/avatar', () => ({
  clampAllMorphs: (x: any) => x,
  clampMorph: (x: any) => x,
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
