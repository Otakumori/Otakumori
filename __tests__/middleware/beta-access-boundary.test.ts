import { NextRequest } from 'next/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({ auth: vi.fn() }));

vi.mock('@clerk/nextjs/server', () => ({
  clerkMiddleware:
    (handler: (auth: typeof mocks.auth, req: NextRequest) => Promise<Response>) =>
    (req: NextRequest) =>
      handler(mocks.auth, req),
  createRouteMatcher: (patterns: string[]) => (req: NextRequest) =>
    patterns.some((pattern) => {
      const expression = `^${pattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace(/\\\(\\\.\\\*\\\)/g, '.*')}$`;
      return new RegExp(expression).test(req.nextUrl.pathname);
    }),
}));

vi.mock('@/app/lib/visual-qa/mode', () => ({
  VISUAL_QA_AUTH_STATE_COOKIE: 'visual-auth',
  VISUAL_QA_AUTH_STATE_HEADER: 'x-visual-auth',
  isVisualQaAuthEnabled: vi.fn(() => false),
  normalizeVisualQaAuthState: vi.fn(() => null),
  resolveVisualQaAuthStateFromCookieHeader: vi.fn(() => null),
}));

describe('closed beta middleware boundary', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.auth.mockResolvedValue({ userId: null, sessionClaims: null });
  });

  it('redirects an unauthenticated direct page request to the invitation surface', async () => {
    const { default: middleware } = await import('@/middleware');
    const response = await middleware(
      new NextRequest('https://preview.example.com/mini-games/petal-samurai'),
      {} as never,
    );

    expect(response.status).toBe(307);
    expect(response.headers.get('location')).toContain('/beta-access');
  });

  it('denies a non-invited authenticated API request', async () => {
    mocks.auth.mockResolvedValue({ userId: 'user_1', sessionClaims: {} });
    const { default: middleware } = await import('@/middleware');
    const response = await middleware(
      new NextRequest('https://preview.example.com/api/v1/games/personal-best'),
      {} as never,
    );

    expect(response.status).toBe(403);
    expect(await response.json()).toEqual({ ok: false, error: 'BETA_INVITE_REQUIRED' });
  });

  it('allows an invited user through to an authorized beta route', async () => {
    mocks.auth.mockResolvedValue({
      userId: 'user_1',
      sessionClaims: { public_metadata: { betaAccess: true } },
    });
    const { default: middleware } = await import('@/middleware');
    const response = await middleware(
      new NextRequest('https://preview.example.com/mini-games/petal-samurai'),
      {} as never,
    );

    expect(response.status).toBe(200);
    expect(response.headers.get('x-middleware-next')).toBe('1');
  });

  it('keeps verified webhooks reachable without a beta session', async () => {
    const { default: middleware } = await import('@/middleware');
    const response = await middleware(
      new NextRequest('https://preview.example.com/api/webhooks/stripe', { method: 'POST' }),
      {} as never,
    );

    expect(response.status).toBe(200);
    expect(mocks.auth).not.toHaveBeenCalled();
  });

  it('blocks checkout creation even for invited users', async () => {
    mocks.auth.mockResolvedValue({
      userId: 'user_1',
      sessionClaims: { public_metadata: { betaAccess: true } },
    });
    const { default: middleware } = await import('@/middleware');
    const response = await middleware(
      new NextRequest('https://preview.example.com/api/v1/checkout/session', { method: 'POST' }),
      {} as never,
    );

    expect(response.status).toBe(503);
    expect(await response.json()).toMatchObject({ error: 'BETA_PURCHASES_DISABLED' });
  });

  it('fails closed when authentication is unavailable', async () => {
    mocks.auth.mockRejectedValue(new Error('auth unavailable'));
    const { default: middleware } = await import('@/middleware');
    const response = await middleware(
      new NextRequest('https://preview.example.com/mini-games/petal-samurai'),
      {} as never,
    );

    expect(response.status).toBe(503);
  });

  it('does not honor a spoofed Lighthouse bypass header on a remote host', async () => {
    const { default: middleware } = await import('@/middleware');
    const response = await middleware(
      new NextRequest('https://preview.example.com/', {
        headers: { 'x-otakumori-lighthouse-ci': '1' },
      }),
      {} as never,
    );

    expect(response.status).toBe(307);
    expect(response.headers.get('location')).toContain('/beta-access');
  });
});
