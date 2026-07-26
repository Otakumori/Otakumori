import { describe, expect, it } from 'vitest';

import {
  ACCOUNTS_ORIGIN,
  STAGING_APP_ORIGIN,
  buildCanonicalSignInUrl,
  buildCanonicalSignUpUrl,
  buildCanonicalUserProfileUrl,
  safeReturnUrl,
} from '@/app/lib/auth/accountUrls';

function redirectParam(url: string) {
  return new URL(url).searchParams.get('redirect_url');
}

describe('canonical Clerk Account Portal URLs', () => {
  it('builds hosted sign-in and sign-up URLs with production return URLs', () => {
    const signIn = new URL(buildCanonicalSignInUrl('/shop', 'https://www.otaku-mori.com'));
    const signUp = new URL(buildCanonicalSignUpUrl('/profile', 'https://www.otaku-mori.com'));

    expect(signIn.origin).toBe(ACCOUNTS_ORIGIN);
    expect(signIn.pathname).toBe('/sign-in');
    expect(signIn.searchParams.get('redirect_url')).toBe('https://www.otaku-mori.com/shop');

    expect(signUp.origin).toBe(ACCOUNTS_ORIGIN);
    expect(signUp.pathname).toBe('/sign-up');
    expect(signUp.searchParams.get('redirect_url')).toBe('https://www.otaku-mori.com/profile');
  });

  it('rejects arbitrary external HTTPS return origins', () => {
    expect(
      redirectParam(
        buildCanonicalSignInUrl('https://not-otaku.example/sign-in', 'https://www.otaku-mori.com'),
      ),
    ).toBe('https://www.otaku-mori.com/');
  });

  it('allows localhost only when the current app origin is local', () => {
    expect(safeReturnUrl('http://localhost:3000/shop', 'http://localhost:3000')).toBe(
      'http://localhost:3000/shop',
    );

    expect(safeReturnUrl('http://localhost:4000/shop', 'https://www.otaku-mori.com')).toBe(
      'https://www.otaku-mori.com/',
    );
  });

  it('allows the active Vercel Preview origin without allowing other Preview hosts', () => {
    expect(
      safeReturnUrl(
        'https://otaku-mori-git-auth-otaku-mori-babe.vercel.app/account',
        'https://otaku-mori-git-auth-otaku-mori-babe.vercel.app',
      ),
    ).toBe('https://otaku-mori-git-auth-otaku-mori-babe.vercel.app/account');

    expect(
      safeReturnUrl(
        'https://other-project.vercel.app/account',
        'https://otaku-mori-git-auth-otaku-mori-babe.vercel.app',
      ),
    ).toBe('https://otaku-mori-git-auth-otaku-mori-babe.vercel.app/');
  });

  it('accepts only the exact staging origin and preserves staging paths', () => {
    expect(safeReturnUrl('https://staging.otaku-mori.com/shop', STAGING_APP_ORIGIN)).toBe(
      'https://staging.otaku-mori.com/shop',
    );
    expect(safeReturnUrl('/account', STAGING_APP_ORIGIN)).toBe(
      'https://staging.otaku-mori.com/account',
    );
    expect(safeReturnUrl('/checkout', STAGING_APP_ORIGIN)).toBe(
      'https://staging.otaku-mori.com/checkout',
    );

    const signUp = new URL(buildCanonicalSignUpUrl('/profile', STAGING_APP_ORIGIN));
    expect(signUp.origin).toBe(ACCOUNTS_ORIGIN);
    expect(signUp.pathname).toBe('/sign-up');
    expect(signUp.searchParams.get('redirect_url')).toBe('https://staging.otaku-mori.com/profile');
  });

  it('uses staging return URLs for hosted Account & Security links', () => {
    const account = new URL(buildCanonicalUserProfileUrl('/account', STAGING_APP_ORIGIN));

    expect(account.origin).toBe(ACCOUNTS_ORIGIN);
    expect(account.pathname).toBe('/user');
    expect(account.searchParams.get('redirect_url')).toBe('https://staging.otaku-mori.com/account');
  });

  it('rejects staging lookalikes, child hosts, ports, and arbitrary Vercel returns', () => {
    for (const candidate of [
      'http://staging.otaku-mori.com/shop',
      'https://staging.otaku-mori.com:443/shop',
      'https://evil.staging.otaku-mori.com/shop',
      'https://staging.otaku-mori.com.evil.example/shop',
      'https://preview.otaku-mori.com/shop',
      'https://otaku-mori-git-auth-otaku-mori-babe.vercel.app/shop',
    ]) {
      expect(safeReturnUrl(candidate, STAGING_APP_ORIGIN)).toBe(STAGING_APP_ORIGIN + '/');
    }
  });

  it('builds the hosted Account & Security URL with a bounded return URL', () => {
    const account = new URL(buildCanonicalUserProfileUrl('/profile', 'https://www.otaku-mori.com'));

    expect(account.origin).toBe(ACCOUNTS_ORIGIN);
    expect(account.pathname).toBe('/user');
    expect(account.searchParams.get('redirect_url')).toBe('https://www.otaku-mori.com/profile');
  });
});
