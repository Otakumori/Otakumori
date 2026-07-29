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

  it('accepts exact trusted production and staging return origins', () => {
    expect(safeReturnUrl('https://www.otaku-mori.com/shop?tab=saved#top')).toBe(
      'https://www.otaku-mori.com/shop?tab=saved#top',
    );
    expect(safeReturnUrl('https://otaku-mori.com/profile', STAGING_APP_ORIGIN)).toBe(
      'https://otaku-mori.com/profile',
    );
    expect(safeReturnUrl(`${STAGING_APP_ORIGIN}/wishlist`, STAGING_APP_ORIGIN)).toBe(
      `${STAGING_APP_ORIGIN}/wishlist`,
    );
  });

  it('preserves relative paths against the active application origin', () => {
    expect(safeReturnUrl('/wishlist?filter=saved#items', STAGING_APP_ORIGIN)).toBe(
      `${STAGING_APP_ORIGIN}/wishlist?filter=saved#items`,
    );
  });

  it('rejects credential-bearing trusted return URLs instead of stripping credentials', () => {
    const previewOrigin = 'https://otaku-mori-git-auth-otaku-mori-babe.vercel.app';

    expect(
      safeReturnUrl('https://user:pass@www.otaku-mori.com/shop', 'https://www.otaku-mori.com'),
    ).toBe('https://www.otaku-mori.com/');
    expect(
      safeReturnUrl('https://user@www.otaku-mori.com/shop', 'https://www.otaku-mori.com'),
    ).toBe('https://www.otaku-mori.com/');
    expect(
      safeReturnUrl('https://user%3Apass@www.otaku-mori.com/shop', 'https://www.otaku-mori.com'),
    ).toBe('https://www.otaku-mori.com/');
    expect(safeReturnUrl(`https://user:pass@staging.otaku-mori.com/shop`, STAGING_APP_ORIGIN)).toBe(
      `${STAGING_APP_ORIGIN}/`,
    );
    expect(
      safeReturnUrl(`https://user:pass@${new URL(previewOrigin).hostname}/shop`, previewOrigin),
    ).toBe(`${previewOrigin}/`);
  });

  it('rejects staging variants, unsafe protocols, protocol-relative external origins, and ports', () => {
    expect(safeReturnUrl('https://evil.staging.otaku-mori.com/shop', STAGING_APP_ORIGIN)).toBe(
      `${STAGING_APP_ORIGIN}/`,
    );
    expect(
      safeReturnUrl('https://staging.otaku-mori.com.evil.example/shop', STAGING_APP_ORIGIN),
    ).toBe(`${STAGING_APP_ORIGIN}/`);
    expect(safeReturnUrl('http://staging.otaku-mori.com/shop', STAGING_APP_ORIGIN)).toBe(
      `${STAGING_APP_ORIGIN}/`,
    );
    expect(safeReturnUrl('https://staging.otaku-mori.com:443/shop', STAGING_APP_ORIGIN)).toBe(
      `${STAGING_APP_ORIGIN}/`,
    );
    expect(safeReturnUrl('//example.invalid/path', STAGING_APP_ORIGIN)).toBe(
      `${STAGING_APP_ORIGIN}/`,
    );
    expect(safeReturnUrl('javascript:alert(1)', STAGING_APP_ORIGIN)).toBe(`${STAGING_APP_ORIGIN}/`);
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

  it('builds the hosted Account & Security URL with a bounded return URL', () => {
    const account = new URL(buildCanonicalUserProfileUrl('/profile', 'https://www.otaku-mori.com'));

    expect(account.origin).toBe(ACCOUNTS_ORIGIN);
    expect(account.pathname).toBe('/user');
    expect(account.searchParams.get('redirect_url')).toBe('https://www.otaku-mori.com/profile');
  });
});
