import { auth } from '@clerk/nextjs/server';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import AccountLayout from '@/app/account/layout';
import AccountPage from '@/app/account/page';
import CheckoutPage from '@/app/checkout/page';
import SignInPage from '@/app/sign-in/[[...index]]/page';
import SignUpPage from '@/app/sign-up/[[...index]]/page';

vi.mock('server-only', () => ({}));

vi.mock('next/navigation', () => ({
  redirect: vi.fn((url: string) => {
    throw new Error(`NEXT_REDIRECT:${url}`);
  }),
}));

const mockedAuth = vi.mocked(auth);
const mockedHeaders = vi.mocked(headers);
const mockedRedirect = vi.mocked(redirect);
const PR73_PREVIEW_ORIGIN = 'https://pr73-preview.otaku-mori.com';

function mockRequestHeaders(values: Record<string, string | null>) {
  mockedHeaders.mockResolvedValue({
    get: (name: string) => values[name.toLowerCase()] ?? null,
  } as Awaited<ReturnType<typeof headers>>);
}

async function expectRedirect(action: () => Promise<unknown>) {
  await expect(action()).rejects.toThrow(/^NEXT_REDIRECT:/);
  return String(mockedRedirect.mock.calls.at(-1)?.[0] ?? '');
}

describe('account and local auth route redirects', () => {
  beforeEach(() => {
    vi.unstubAllEnvs();
    vi.clearAllMocks();
    mockRequestHeaders({});
    mockedAuth.mockResolvedValue({ userId: null } as Awaited<ReturnType<typeof auth>>);
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('redirects signed-out /account visitors to hosted sign-in with an account return URL', async () => {
    const target = await expectRedirect(() => AccountPage());
    const url = new URL(target);

    expect(url.origin).toBe('https://accounts.otaku-mori.com');
    expect(url.pathname).toBe('/sign-in');
    expect(url.searchParams.get('redirect_url')).toBe('https://www.otaku-mori.com/account');
  });

  it('preserves the current Preview origin for signed-out /account visitors', async () => {
    vi.stubEnv('VERCEL_ENV', 'preview');
    vi.stubEnv('VERCEL_BRANCH_URL', 'otaku-mori-git-auth-otaku-mori-babe.vercel.app');

    const target = await expectRedirect(() => AccountPage());
    const url = new URL(target);

    expect(url.origin).toBe('https://accounts.otaku-mori.com');
    expect(url.pathname).toBe('/sign-in');
    expect(url.searchParams.get('redirect_url')).toBe(
      'https://otaku-mori-git-auth-otaku-mori-babe.vercel.app/account',
    );
    expect(url.searchParams.get('redirect_url')).not.toBe('https://www.otaku-mori.com/account');
  });

  it('preserves the staging host for signed-out /account visitors in Preview', async () => {
    vi.stubEnv('VERCEL_ENV', 'preview');
    vi.stubEnv('VERCEL_BRANCH_URL', 'otaku-mori-git-auth-otaku-mori-babe.vercel.app');
    mockRequestHeaders({
      'x-forwarded-host': 'staging.otaku-mori.com',
      'x-forwarded-proto': 'https',
    });

    const target = await expectRedirect(() => AccountPage());
    const url = new URL(target);

    expect(url.origin).toBe('https://accounts.otaku-mori.com');
    expect(url.pathname).toBe('/sign-in');
    expect(url.searchParams.get('redirect_url')).toBe('https://staging.otaku-mori.com/account');
  });

  it('preserves the exact PR #73 custom Preview origin for account redirects', async () => {
    vi.stubEnv('VERCEL_ENV', 'preview');
    vi.stubEnv('VERCEL_BRANCH_URL', 'otaku-mori-git-auth-otaku-mori-babe.vercel.app');
    mockRequestHeaders({
      'x-forwarded-host': 'pr73-preview.otaku-mori.com',
      'x-forwarded-proto': 'https',
    });

    const target = await expectRedirect(() => AccountPage());
    const url = new URL(target);

    expect(url.origin).toBe('https://accounts.otaku-mori.com');
    expect(url.pathname).toBe('/sign-in');
    expect(url.searchParams.get('redirect_url')).toBe(`${PR73_PREVIEW_ORIGIN}/account`);
  });

  it('preserves local request origins for signed-out /account visitors', async () => {
    mockRequestHeaders({ host: '127.0.0.1:3000', 'x-forwarded-proto': 'http' });

    const target = await expectRedirect(() => AccountPage());
    const url = new URL(target);

    expect(url.searchParams.get('redirect_url')).toBe('http://127.0.0.1:3000/account');
  });

  it('redirects signed-in /account visitors to hosted Account & Security', async () => {
    mockedAuth.mockResolvedValue({ userId: 'user_123' } as Awaited<ReturnType<typeof auth>>);

    const target = await expectRedirect(() => AccountPage());
    const url = new URL(target);

    expect(url.origin).toBe('https://accounts.otaku-mori.com');
    expect(url.pathname).toBe('/user');
    expect(url.searchParams.get('redirect_url')).toBe('https://www.otaku-mori.com/profile');
  });

  it('preserves the current Preview origin for signed-in Account & Security return URLs', async () => {
    vi.stubEnv('VERCEL_ENV', 'preview');
    vi.stubEnv('VERCEL_BRANCH_URL', 'otaku-mori-git-auth-otaku-mori-babe.vercel.app');
    mockedAuth.mockResolvedValue({ userId: 'user_123' } as Awaited<ReturnType<typeof auth>>);

    const target = await expectRedirect(() => AccountPage());
    const url = new URL(target);

    expect(url.origin).toBe('https://accounts.otaku-mori.com');
    expect(url.pathname).toBe('/user');
    expect(url.searchParams.get('redirect_url')).toBe(
      'https://otaku-mori-git-auth-otaku-mori-babe.vercel.app/profile',
    );
  });

  it('preserves the staging host for signed-in Account & Security return URLs', async () => {
    vi.stubEnv('VERCEL_ENV', 'preview');
    vi.stubEnv('VERCEL_BRANCH_URL', 'otaku-mori-git-auth-otaku-mori-babe.vercel.app');
    mockRequestHeaders({
      'x-forwarded-host': 'staging.otaku-mori.com',
      'x-forwarded-proto': 'https',
    });
    mockedAuth.mockResolvedValue({ userId: 'user_123' } as Awaited<ReturnType<typeof auth>>);

    const target = await expectRedirect(() => AccountPage());
    const url = new URL(target);

    expect(url.origin).toBe('https://accounts.otaku-mori.com');
    expect(url.pathname).toBe('/user');
    expect(url.searchParams.get('redirect_url')).toBe('https://staging.otaku-mori.com/profile');
  });

  it('keeps the account layout from redirecting to a nonexistent local sign-in destination', async () => {
    const target = await expectRedirect(() =>
      AccountLayout({ children: <div data-testid="account" /> }),
    );

    expect(target).toContain('https://accounts.otaku-mori.com/sign-in');
    expect(target).not.toContain('/sign-in?redirect_url=/account');
  });

  it('redirects signed-out checkout to hosted sign-in with the current Preview checkout return URL', async () => {
    vi.stubEnv('VERCEL_ENV', 'preview');
    vi.stubEnv('VERCEL_BRANCH_URL', 'otaku-mori-git-auth-otaku-mori-babe.vercel.app');

    const target = await expectRedirect(() => CheckoutPage());
    const url = new URL(target);

    expect(url.origin).toBe('https://accounts.otaku-mori.com');
    expect(url.pathname).toBe('/sign-in');
    expect(url.searchParams.get('redirect_url')).toBe(
      'https://otaku-mori-git-auth-otaku-mori-babe.vercel.app/checkout',
    );
  });

  it('redirects signed-out staging checkout to hosted sign-in with a staging return URL', async () => {
    vi.stubEnv('VERCEL_ENV', 'preview');
    vi.stubEnv('VERCEL_BRANCH_URL', 'otaku-mori-git-auth-otaku-mori-babe.vercel.app');
    mockRequestHeaders({
      'x-forwarded-host': 'staging.otaku-mori.com',
      'x-forwarded-proto': 'https',
    });

    const target = await expectRedirect(() => CheckoutPage());
    const url = new URL(target);

    expect(url.origin).toBe('https://accounts.otaku-mori.com');
    expect(url.pathname).toBe('/sign-in');
    expect(url.searchParams.get('redirect_url')).toBe('https://staging.otaku-mori.com/checkout');
  });

  it('preserves the exact PR #73 custom Preview origin for signed-out checkout', async () => {
    vi.stubEnv('VERCEL_ENV', 'preview');
    vi.stubEnv('VERCEL_BRANCH_URL', 'otaku-mori-git-auth-otaku-mori-babe.vercel.app');
    mockRequestHeaders({
      'x-forwarded-host': 'pr73-preview.otaku-mori.com',
      'x-forwarded-proto': 'https',
    });

    const target = await expectRedirect(() => CheckoutPage());
    const url = new URL(target);

    expect(url.origin).toBe('https://accounts.otaku-mori.com');
    expect(url.pathname).toBe('/sign-in');
    expect(url.searchParams.get('redirect_url')).toBe(`${PR73_PREVIEW_ORIGIN}/checkout`);
  });

  it('redirects signed-out local checkout to hosted sign-in with a local checkout return URL', async () => {
    mockRequestHeaders({ host: '127.0.0.1:3000', 'x-forwarded-proto': 'http' });

    const target = await expectRedirect(() => CheckoutPage());
    const url = new URL(target);

    expect(url.origin).toBe('https://accounts.otaku-mori.com');
    expect(url.pathname).toBe('/sign-in');
    expect(url.searchParams.get('redirect_url')).toBe('http://127.0.0.1:3000/checkout');
  });

  it('turns the local sign-in route into a hosted Account Portal redirect', async () => {
    const target = await expectRedirect(() =>
      SignInPage({ searchParams: Promise.resolve({ redirect_url: '/shop' }) }),
    );
    const url = new URL(target);

    expect(url.origin).toBe('https://accounts.otaku-mori.com');
    expect(url.pathname).toBe('/sign-in');
    expect(url.searchParams.get('redirect_url')).toBe('https://www.otaku-mori.com/shop');
  });

  it('preserves the current Preview origin in the local sign-in shim', async () => {
    vi.stubEnv('VERCEL_ENV', 'preview');
    vi.stubEnv('VERCEL_BRANCH_URL', 'otaku-mori-git-auth-otaku-mori-babe.vercel.app');

    const target = await expectRedirect(() =>
      SignInPage({ searchParams: Promise.resolve({ redirect_url: '/shop' }) }),
    );
    const url = new URL(target);

    expect(url.origin).toBe('https://accounts.otaku-mori.com');
    expect(url.pathname).toBe('/sign-in');
    expect(url.searchParams.get('redirect_url')).toBe(
      'https://otaku-mori-git-auth-otaku-mori-babe.vercel.app/shop',
    );
  });

  it('preserves the staging host in the local sign-in shim', async () => {
    vi.stubEnv('VERCEL_ENV', 'preview');
    vi.stubEnv('VERCEL_BRANCH_URL', 'otaku-mori-git-auth-otaku-mori-babe.vercel.app');
    mockRequestHeaders({
      'x-forwarded-host': 'staging.otaku-mori.com',
      'x-forwarded-proto': 'https',
    });

    const target = await expectRedirect(() =>
      SignInPage({ searchParams: Promise.resolve({ redirect_url: '/shop' }) }),
    );
    const url = new URL(target);

    expect(url.origin).toBe('https://accounts.otaku-mori.com');
    expect(url.pathname).toBe('/sign-in');
    expect(url.searchParams.get('redirect_url')).toBe('https://staging.otaku-mori.com/shop');
  });

  it('preserves the exact PR #73 custom Preview origin in the local sign-in shim', async () => {
    vi.stubEnv('VERCEL_ENV', 'preview');
    vi.stubEnv('VERCEL_BRANCH_URL', 'otaku-mori-git-auth-otaku-mori-babe.vercel.app');
    mockRequestHeaders({
      'x-forwarded-host': 'pr73-preview.otaku-mori.com',
      'x-forwarded-proto': 'https',
    });

    const target = await expectRedirect(() =>
      SignInPage({ searchParams: Promise.resolve({ redirect_url: '/shop' }) }),
    );
    const url = new URL(target);

    expect(url.origin).toBe('https://accounts.otaku-mori.com');
    expect(url.pathname).toBe('/sign-in');
    expect(url.searchParams.get('redirect_url')).toBe(`${PR73_PREVIEW_ORIGIN}/shop`);
  });

  it('turns the local sign-up route into a hosted Account Portal redirect', async () => {
    const target = await expectRedirect(() =>
      SignUpPage({ searchParams: Promise.resolve({ redirect_url: '/profile' }) }),
    );
    const url = new URL(target);

    expect(url.origin).toBe('https://accounts.otaku-mori.com');
    expect(url.pathname).toBe('/sign-up');
    expect(url.searchParams.get('redirect_url')).toBe('https://www.otaku-mori.com/profile');
  });

  it('preserves the exact PR #73 custom Preview origin in the local sign-up shim', async () => {
    vi.stubEnv('VERCEL_ENV', 'preview');
    vi.stubEnv('VERCEL_BRANCH_URL', 'otaku-mori-git-auth-otaku-mori-babe.vercel.app');
    mockRequestHeaders({
      'x-forwarded-host': 'pr73-preview.otaku-mori.com',
      'x-forwarded-proto': 'https',
    });

    const target = await expectRedirect(() =>
      SignUpPage({ searchParams: Promise.resolve({ redirect_url: '/profile' }) }),
    );
    const url = new URL(target);

    expect(url.origin).toBe('https://accounts.otaku-mori.com');
    expect(url.pathname).toBe('/sign-up');
    expect(url.searchParams.get('redirect_url')).toBe(`${PR73_PREVIEW_ORIGIN}/profile`);
  });

  it('preserves local request origins in the local sign-up shim', async () => {
    mockRequestHeaders({ host: 'localhost:3000', 'x-forwarded-proto': 'http' });

    const target = await expectRedirect(() =>
      SignUpPage({ searchParams: Promise.resolve({ redirect_url: '/profile' }) }),
    );
    const url = new URL(target);

    expect(url.origin).toBe('https://accounts.otaku-mori.com');
    expect(url.pathname).toBe('/sign-up');
    expect(url.searchParams.get('redirect_url')).toBe('http://localhost:3000/profile');
  });

  it('preserves the exact active local port in the local sign-in shim', async () => {
    mockRequestHeaders({ host: 'localhost:3102', 'x-forwarded-proto': 'http' });

    const target = await expectRedirect(() =>
      SignInPage({ searchParams: Promise.resolve({ redirect_url: '/' }) }),
    );
    const url = new URL(target);

    expect(url.origin).toBe('https://accounts.otaku-mori.com');
    expect(url.pathname).toBe('/sign-in');
    expect(url.searchParams.get('redirect_url')).toBe('http://localhost:3102/');
    expect(url.searchParams.get('redirect_url')).not.toBe('http://localhost:3100/');
    expect(url.searchParams.get('redirect_url')).not.toBe('https://www.otaku-mori.com/');
  });

  it('preserves the staging host in the local sign-up shim', async () => {
    vi.stubEnv('VERCEL_ENV', 'preview');
    vi.stubEnv('VERCEL_BRANCH_URL', 'otaku-mori-git-auth-otaku-mori-babe.vercel.app');
    mockRequestHeaders({
      'x-forwarded-host': 'staging.otaku-mori.com',
      'x-forwarded-proto': 'https',
    });

    const target = await expectRedirect(() =>
      SignUpPage({ searchParams: Promise.resolve({ redirect_url: '/profile' }) }),
    );
    const url = new URL(target);

    expect(url.origin).toBe('https://accounts.otaku-mori.com');
    expect(url.pathname).toBe('/sign-up');
    expect(url.searchParams.get('redirect_url')).toBe('https://staging.otaku-mori.com/profile');
  });
});
