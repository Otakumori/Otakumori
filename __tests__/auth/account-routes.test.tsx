import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import AccountLayout from '@/app/account/layout';
import AccountPage from '@/app/account/page';
import SignInPage from '@/app/sign-in/[[...index]]/page';
import SignUpPage from '@/app/sign-up/[[...index]]/page';

vi.mock('next/navigation', () => ({
  redirect: vi.fn((url: string) => {
    throw new Error(`NEXT_REDIRECT:${url}`);
  }),
}));

const mockedAuth = vi.mocked(auth);
const mockedRedirect = vi.mocked(redirect);

async function expectRedirect(action: () => Promise<unknown>) {
  await expect(action()).rejects.toThrow(/^NEXT_REDIRECT:/);
  return String(mockedRedirect.mock.calls.at(-1)?.[0] ?? '');
}

describe('account and local auth route redirects', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockedAuth.mockResolvedValue({ userId: null } as Awaited<ReturnType<typeof auth>>);
  });

  it('redirects signed-out /account visitors to hosted sign-in with an account return URL', async () => {
    const target = await expectRedirect(() => AccountPage());
    const url = new URL(target);

    expect(url.origin).toBe('https://accounts.otaku-mori.com');
    expect(url.pathname).toBe('/sign-in');
    expect(url.searchParams.get('redirect_url')).toBe('https://www.otaku-mori.com/account');
  });

  it('redirects signed-in /account visitors to hosted Account & Security', async () => {
    mockedAuth.mockResolvedValue({ userId: 'user_123' } as Awaited<ReturnType<typeof auth>>);

    const target = await expectRedirect(() => AccountPage());
    const url = new URL(target);

    expect(url.origin).toBe('https://accounts.otaku-mori.com');
    expect(url.pathname).toBe('/user');
    expect(url.searchParams.get('redirect_url')).toBe('https://www.otaku-mori.com/profile');
  });

  it('keeps the account layout from redirecting to a nonexistent local sign-in destination', async () => {
    const target = await expectRedirect(() =>
      AccountLayout({ children: <div data-testid="account" /> }),
    );

    expect(target).toContain('https://accounts.otaku-mori.com/sign-in');
    expect(target).not.toContain('/sign-in?redirect_url=/account');
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

  it('turns the local sign-up route into a hosted Account Portal redirect', async () => {
    const target = await expectRedirect(() =>
      SignUpPage({ searchParams: Promise.resolve({ redirect_url: '/profile' }) }),
    );
    const url = new URL(target);

    expect(url.origin).toBe('https://accounts.otaku-mori.com');
    expect(url.pathname).toBe('/sign-up');
    expect(url.searchParams.get('redirect_url')).toBe('https://www.otaku-mori.com/profile');
  });
});
