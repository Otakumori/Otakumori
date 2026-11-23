import { render, screen } from '@testing-library/react';
import { auth } from '@clerk/nextjs/server';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import AccountLayout from '@/app/account/layout';
import AccountPage from '@/app/account/page';
import CheckoutPage from '@/app/checkout/page';
import SignInPage from '@/app/sign-in/[[...index]]/page';
import SignUpPage from '@/app/sign-up/[[...index]]/page';

const clerkComponents = vi.hoisted(() => ({
  signIn: vi.fn(),
  signUp: vi.fn(),
  userProfile: vi.fn(),
}));

vi.mock('server-only', () => ({}));
vi.mock('@clerk/nextjs', () => ({
  SignIn: (props: Record<string, unknown>) => {
    clerkComponents.signIn(props);
    return <div data-testid="clerk-sign-in" />;
  },
  SignUp: (props: Record<string, unknown>) => {
    clerkComponents.signUp(props);
    return <div data-testid="clerk-sign-up" />;
  },
  UserProfile: (props: Record<string, unknown>) => {
    clerkComponents.userProfile(props);
    return <div data-testid="clerk-user-profile" />;
  },
}));
vi.mock('next/navigation', () => ({
  redirect: vi.fn((url: string) => {
    throw new Error(`NEXT_REDIRECT:${url}`);
  }),
}));

const mockedAuth = vi.mocked(auth);
const mockedHeaders = vi.mocked(headers);
const mockedRedirect = vi.mocked(redirect);

function mockRequestHeaders(values: Record<string, string | null>) {
  mockedHeaders.mockResolvedValue({
    get: (name: string) => values[name.toLowerCase()] ?? null,
  } as Awaited<ReturnType<typeof headers>>);
}

async function expectRedirect(action: () => Promise<unknown> | unknown) {
  await expect(Promise.resolve().then(action)).rejects.toThrow(/^NEXT_REDIRECT:/);
  return String(mockedRedirect.mock.calls.at(-1)?.[0] ?? '');
}

function usePreview(origin = 'otaku-mori-git-auth-otaku-mori-babe.vercel.app') {
  vi.stubEnv('VERCEL_ENV', 'preview');
  vi.stubEnv('VERCEL_BRANCH_URL', origin);
}

describe('environment-aware account and auth routes', () => {
  beforeEach(() => {
    vi.unstubAllEnvs();
    vi.clearAllMocks();
    vi.stubEnv('NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY', 'pk_test_auth_routes');
    mockRequestHeaders({});
    mockedAuth.mockResolvedValue({ userId: null } as Awaited<ReturnType<typeof auth>>);
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('preserves Production hosted sign-in and Account Portal behavior', async () => {
    vi.stubEnv('NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY', 'pk_live_auth_routes');
    const signedOutTarget = new URL(await expectRedirect(() => AccountPage()));

    expect(signedOutTarget.origin).toBe('https://accounts.otaku-mori.com');
    expect(signedOutTarget.pathname).toBe('/sign-in');
    expect(signedOutTarget.searchParams.get('redirect_url')).toBe(
      'https://www.otaku-mori.com/account',
    );

    mockedAuth.mockResolvedValue({ userId: 'user_123' } as Awaited<ReturnType<typeof auth>>);
    const signedInTarget = new URL(await expectRedirect(() => AccountPage()));
    expect(signedInTarget.origin).toBe('https://accounts.otaku-mori.com');
    expect(signedInTarget.pathname).toBe('/user');
  });

  it('keeps signed-out Preview account redirects on the active Preview origin', async () => {
    usePreview();
    const target = new URL(await expectRedirect(() => AccountPage()));

    expect(target.origin).toBe('https://otaku-mori-git-auth-otaku-mori-babe.vercel.app');
    expect(target.pathname).toBe('/sign-in');
    expect(target.searchParams.get('redirect_url')).toBe(
      'https://otaku-mori-git-auth-otaku-mori-babe.vercel.app/account',
    );
  });

  it('keeps staging and approved custom Preview account redirects same-origin', async () => {
    usePreview();
    mockRequestHeaders({
      'x-forwarded-host': 'staging.otaku-mori.com',
      'x-forwarded-proto': 'https',
    });
    expect(new URL(await expectRedirect(() => AccountPage())).origin).toBe(
      'https://staging.otaku-mori.com',
    );

    mockRequestHeaders({
      'x-forwarded-host': 'pr73-preview.otaku-mori.com',
      'x-forwarded-proto': 'https',
    });
    expect(new URL(await expectRedirect(() => AccountPage())).origin).toBe(
      'https://pr73-preview.otaku-mori.com',
    );
  });

  it('keeps local account redirects on the exact active local port', async () => {
    mockRequestHeaders({ host: 'localhost:3102', 'x-forwarded-proto': 'http' });
    const target = new URL(
      await expectRedirect(() => AccountLayout({ children: <div data-testid="account" /> })),
    );

    expect(target.origin).toBe('http://localhost:3102');
    expect(target.pathname).toBe('/sign-in');
  });

  it('renders the local Clerk user profile for signed-in Preview users', async () => {
    usePreview();
    mockedAuth.mockResolvedValue({ userId: 'user_123' } as Awaited<ReturnType<typeof auth>>);

    render(await AccountPage());

    expect(screen.getByTestId('clerk-user-profile')).toBeInTheDocument();
    expect(clerkComponents.userProfile).toHaveBeenCalledWith(
      expect.objectContaining({ routing: 'hash' }),
    );
    expect(mockedRedirect).not.toHaveBeenCalled();
  });

  it('renders same-origin Preview sign-in with a bounded force redirect', async () => {
    usePreview();
    render(
      await SignInPage({
        searchParams: Promise.resolve({ redirect_url: '/shop?tab=saved' }),
      }),
    );

    expect(screen.getByTestId('clerk-sign-in')).toBeInTheDocument();
    expect(clerkComponents.signIn).toHaveBeenCalledWith(
      expect.objectContaining({
        path: '/sign-in',
        routing: 'path',
        signUpUrl: '/sign-up',
        forceRedirectUrl: 'https://otaku-mori-git-auth-otaku-mori-babe.vercel.app/shop?tab=saved',
      }),
    );
    expect(mockedRedirect).not.toHaveBeenCalled();
  });

  it('rejects malicious and cross-environment Preview return destinations', async () => {
    usePreview();
    render(
      await SignInPage({
        searchParams: Promise.resolve({
          redirect_url: 'https://www.otaku-mori.com/account',
        }),
      }),
    );

    expect(clerkComponents.signIn).toHaveBeenCalledWith(
      expect.objectContaining({
        forceRedirectUrl: 'https://otaku-mori-git-auth-otaku-mori-babe.vercel.app/',
      }),
    );
  });

  it('renders same-origin Preview sign-up with a bounded force redirect', async () => {
    usePreview();
    render(await SignUpPage({ searchParams: Promise.resolve({ redirect_url: '/profile' }) }));

    expect(screen.getByTestId('clerk-sign-up')).toBeInTheDocument();
    expect(clerkComponents.signUp).toHaveBeenCalledWith(
      expect.objectContaining({
        path: '/sign-up',
        routing: 'path',
        signInUrl: '/sign-in',
        forceRedirectUrl: 'https://otaku-mori-git-auth-otaku-mori-babe.vercel.app/profile',
      }),
    );
  });

  it('retains Production hosted sign-in and sign-up shims', async () => {
    vi.stubEnv('NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY', 'pk_live_auth_routes');
    const signIn = new URL(
      await expectRedirect(() =>
        SignInPage({ searchParams: Promise.resolve({ redirect_url: '/shop' }) }),
      ),
    );
    const signUp = new URL(
      await expectRedirect(() =>
        SignUpPage({ searchParams: Promise.resolve({ redirect_url: '/profile' }) }),
      ),
    );

    expect(signIn.origin).toBe('https://accounts.otaku-mori.com');
    expect(signIn.pathname).toBe('/sign-in');
    expect(signUp.origin).toBe('https://accounts.otaku-mori.com');
    expect(signUp.pathname).toBe('/sign-up');
  });

  it('fails closed for Development keys on Production and Production keys on Preview', async () => {
    render(await SignInPage({ searchParams: Promise.resolve({}) }));
    expect(screen.getByRole('alert')).toHaveTextContent(
      'Authentication is temporarily unavailable',
    );

    usePreview();
    vi.stubEnv('NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY', 'pk_live_wrong_environment');
    render(await SignUpPage({ searchParams: Promise.resolve({}) }));
    expect(screen.getAllByRole('alert')).toHaveLength(2);
    expect(clerkComponents.signIn).not.toHaveBeenCalled();
    expect(clerkComponents.signUp).not.toHaveBeenCalled();
  });

  it('redirects the legacy checkout route before authentication', async () => {
    expect(await expectRedirect(() => CheckoutPage())).toBe('/shop/checkout');
  });
});
