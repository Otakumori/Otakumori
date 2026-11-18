import { NextRequest, NextResponse, type NextFetchEvent } from 'next/server';
import { describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({ clerkHandler: vi.fn() }));

vi.mock('@clerk/nextjs/server', () => ({
  clerkMiddleware: () => mocks.clerkHandler,
  createRouteMatcher: () => () => false,
}));

vi.mock('@/app/lib/http/cors', () => ({
  handleCorsPreflight: vi.fn(),
  withCors: (response: NextResponse) => response,
}));

vi.mock('@/app/lib/auth/adminRole', () => ({ hasAdminRole: () => false }));
vi.mock('@/app/lib/visual-qa/mode', () => ({
  VISUAL_QA_AUTH_STATE_COOKIE: 'qa-auth-state',
  VISUAL_QA_AUTH_STATE_HEADER: 'x-qa-auth-state',
  isVisualQaAuthEnabled: () => false,
  normalizeVisualQaAuthState: () => null,
  resolveVisualQaAuthStateFromCookieHeader: () => null,
}));

import middleware from '@/middleware';

describe('public readiness health middleware', () => {
  it('allows exact GET /api/health without invoking Clerk and disables caching', async () => {
    mocks.clerkHandler.mockClear();
    const request = new NextRequest('http://localhost:3000/api/health');
    const response = await middleware(request, {} as NextFetchEvent);

    expect(response.status).toBe(200);
    expect(response.headers.get('cache-control')).toBe('no-store');
    expect(response.headers.get('x-content-type-options')).toBe('nosniff');
    expect(response.headers.get('x-request-id')).toBeTruthy();
    expect(mocks.clerkHandler).not.toHaveBeenCalled();
  });

  it('does not bypass Clerk for other routes or non-GET health methods', async () => {
    mocks.clerkHandler.mockReset();
    mocks.clerkHandler.mockReturnValue(NextResponse.next());

    await middleware(new NextRequest('http://localhost:3000/api/profile'), {} as NextFetchEvent);
    await middleware(
      new NextRequest('http://localhost:3000/api/health', { method: 'POST' }),
      {} as NextFetchEvent,
    );
    expect(mocks.clerkHandler).toHaveBeenCalledTimes(2);
  });
});
