import { NextRequest } from 'next/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { isVisualQaAuthEnabled } from '@/app/lib/visual-qa/mode';

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
    vi.unstubAllEnvs();
    vi.clearAllMocks();
    vi.mocked(isVisualQaAuthEnabled).mockReturnValue(false);
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

  it.each([
    {},
    { metadata: null },
    { metadata: { betaAccess: 'true' } },
    { public_metadata: { betaAccess: false } },
  ])('denies absent or malformed beta metadata: %j', async (sessionClaims) => {
    mocks.auth.mockResolvedValue({ userId: 'user_1', sessionClaims });
    const { default: middleware } = await import('@/middleware');
    const response = await middleware(
      new NextRequest('https://preview.example.com/api/v1/petals/wallet'),
      {} as never,
    );

    expect(response.status).toBe(403);
  });

  it('honors revocation after Clerk supplies refreshed claims', async () => {
    const { default: middleware } = await import('@/middleware');
    mocks.auth.mockResolvedValueOnce({
      userId: 'user_1',
      sessionClaims: { metadata: { betaAccess: true } },
    });
    const allowed = await middleware(
      new NextRequest('https://preview.example.com/mini-games/petal-samurai'),
      {} as never,
    );
    mocks.auth.mockResolvedValueOnce({
      userId: 'user_1',
      sessionClaims: { metadata: { betaAccess: false } },
    });
    const revoked = await middleware(
      new NextRequest('https://preview.example.com/mini-games/petal-samurai'),
      {} as never,
    );

    expect(allowed.status).toBe(200);
    expect(revoked.status).toBe(307);
    expect(revoked.headers.get('location')).toContain('state=not-invited');
  });

  it('preserves administrative recovery for a signed admin claim', async () => {
    mocks.auth.mockResolvedValue({
      userId: 'admin_1',
      sessionClaims: { metadata: { role: 'admin' } },
    });
    const { default: middleware } = await import('@/middleware');
    const response = await middleware(
      new NextRequest('https://preview.example.com/admin'),
      {} as never,
    );

    expect(response.status).toBe(200);
    expect(response.headers.get('x-middleware-next')).toBe('1');
  });

  it('does not trust browser headers as a beta invitation signal', async () => {
    mocks.auth.mockResolvedValue({ userId: 'user_1', sessionClaims: {} });
    const { default: middleware } = await import('@/middleware');
    const response = await middleware(
      new NextRequest('https://preview.example.com/api/v1/games/personal-best', {
        headers: { 'x-beta-access': 'true' },
      }),
      {} as never,
    );

    expect(response.status).toBe(403);
  });

  it('retains the mature-game age gate after beta authorization', async () => {
    mocks.auth.mockResolvedValue({
      userId: 'user_1',
      sessionClaims: { metadata: { betaAccess: true } },
    });
    const { default: middleware } = await import('@/middleware');
    const response = await middleware(
      new NextRequest('https://preview.example.com/mini-games/dungeon-of-desire'),
      {} as never,
    );

    expect(response.status).toBe(307);
    expect(response.headers.get('location')).toContain('/age-check');
  });

  it('retains the mature-game age gate in the local visual QA harness', async () => {
    vi.mocked(isVisualQaAuthEnabled).mockReturnValue(true);
    const { default: middleware } = await import('@/middleware');
    const response = await middleware(
      new NextRequest('http://localhost:3000/mini-games/dungeon-of-desire'),
      {} as never,
    );

    expect(response.status).toBe(307);
    expect(response.headers.get('location')).toContain('/age-check');
    expect(mocks.auth).not.toHaveBeenCalled();
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

  it('refuses provider mutation webhooks on a deployed Preview', async () => {
    vi.stubEnv('VERCEL', '1');
    vi.stubEnv('VERCEL_ENV', 'preview');
    const { default: middleware } = await import('@/middleware');
    const response = await middleware(
      new NextRequest('https://preview.example.com/api/webhooks/stripe', { method: 'POST' }),
      {} as never,
    );

    expect(response.status).toBe(503);
    expect(await response.json()).toMatchObject({ error: 'PREVIEW_EXTERNAL_MUTATION_DISABLED' });
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
