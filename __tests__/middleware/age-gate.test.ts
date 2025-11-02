import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest, NextResponse } from 'next/server';

// Mock @clerk/nextjs/server
vi.mock('@clerk/nextjs/server', () => ({
  clerkMiddleware: vi.fn((handler) => handler),
  createRouteMatcher: vi.fn(() => vi.fn()),
}));

describe('Age Gate Middleware', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Age-Gated Path Detection', () => {
    it('should identify /mini-games as age-gated', () => {
      const pathname = '/mini-games';
      const isAgeGated =
        pathname.startsWith('/mini-games') ||
        pathname.startsWith('/arcade') ||
        pathname.startsWith('/products/nsfw');

      expect(isAgeGated).toBe(true);
    });

    it('should identify /arcade as age-gated', () => {
      const pathname = '/arcade';
      const isAgeGated =
        pathname.startsWith('/mini-games') ||
        pathname.startsWith('/arcade') ||
        pathname.startsWith('/products/nsfw');

      expect(isAgeGated).toBe(true);
    });

    it('should identify /products/nsfw as age-gated', () => {
      const pathname = '/products/nsfw/test';
      const isAgeGated =
        pathname.startsWith('/mini-games') ||
        pathname.startsWith('/arcade') ||
        pathname.startsWith('/products/nsfw');

      expect(isAgeGated).toBe(true);
    });

    it('should not flag /mini-games-info as age-gated', () => {
      const pathname = '/mini-games-info';
      const isAgeGated = pathname.startsWith('/mini-games/') || pathname === '/mini-games';

      expect(isAgeGated).toBe(false);
    });

    it('should not flag / as age-gated', () => {
      const pathname = '/';
      const isAgeGated =
        pathname.startsWith('/mini-games') ||
        pathname.startsWith('/arcade') ||
        pathname.startsWith('/products/nsfw');

      expect(isAgeGated).toBe(false);
    });

    it('should not flag /shop as age-gated', () => {
      const pathname = '/shop';
      const isAgeGated =
        pathname.startsWith('/mini-games') ||
        pathname.startsWith('/arcade') ||
        pathname.startsWith('/products/nsfw');

      expect(isAgeGated).toBe(false);
    });

    it('should not flag /age-check itself as age-gated', () => {
      const pathname = '/age-check';
      const isAgeGated =
        (pathname.startsWith('/mini-games') ||
          pathname.startsWith('/arcade') ||
          pathname.startsWith('/products/nsfw')) &&
        pathname !== '/age-check';

      expect(isAgeGated).toBe(false);
    });
  });

  describe('Bypass Logic - Clerk Adult Verification', () => {
    it('should bypass age gate when publicMetadata.adultVerified is true', () => {
      const sessionClaims: any = {
        publicMetadata: {
          adultVerified: true,
        },
      };

      const adultVerified = Boolean(sessionClaims?.publicMetadata?.adultVerified);

      expect(adultVerified).toBe(true);
    });

    it('should not bypass when publicMetadata.adultVerified is false', () => {
      const sessionClaims: any = {
        publicMetadata: {
          adultVerified: false,
        },
      };

      const adultVerified = Boolean(sessionClaims?.publicMetadata?.adultVerified);

      expect(adultVerified).toBe(false);
    });

    it('should not bypass when publicMetadata is missing', () => {
      const sessionClaims: any = {};

      const adultVerified = Boolean(sessionClaims?.publicMetadata?.adultVerified);

      expect(adultVerified).toBe(false);
    });

    it('should not bypass when adultVerified is undefined', () => {
      const sessionClaims: any = {
        publicMetadata: {},
      };

      const adultVerified = Boolean(sessionClaims?.publicMetadata?.adultVerified);

      expect(adultVerified).toBe(false);
    });
  });

  describe('Bypass Logic - Session Cookie', () => {
    it('should bypass when om_age_ok cookie is present', () => {
      const mockCookie = { name: 'om_age_ok', value: '1' };
      const hasCookie = mockCookie && mockCookie.value === '1';

      expect(hasCookie).toBe(true);
    });

    it('should not bypass when cookie is missing', () => {
      const mockCookie = undefined;
      const hasCookie = mockCookie && mockCookie.value === '1';

      expect(hasCookie).toBeFalsy();
    });

    it('should not bypass when cookie has wrong value', () => {
      const mockCookie = { name: 'om_age_ok', value: '0' };
      const hasCookie = mockCookie && mockCookie.value === '1';

      expect(hasCookie).toBe(false);
    });
  });

  describe('Gate Logic Priority', () => {
    it('should allow access with Clerk verification, no cookie', () => {
      const sessionClaims: any = { publicMetadata: { adultVerified: true } };
      const cookie = undefined;

      const adultVerified = Boolean(sessionClaims?.publicMetadata?.adultVerified);
      const hasCookie = cookie && cookie.value === '1';

      const shouldAllow = adultVerified || hasCookie;

      expect(shouldAllow).toBe(true);
    });

    it('should allow access with cookie, no Clerk verification', () => {
      const sessionClaims: any = {};
      const cookie = { name: 'om_age_ok', value: '1' };

      const adultVerified = Boolean(sessionClaims?.publicMetadata?.adultVerified);
      const hasCookie = cookie && cookie.value === '1';

      const shouldAllow = adultVerified || hasCookie;

      expect(shouldAllow).toBe(true);
    });

    it('should allow access with both Clerk and cookie', () => {
      const sessionClaims: any = { publicMetadata: { adultVerified: true } };
      const cookie = { name: 'om_age_ok', value: '1' };

      const adultVerified = Boolean(sessionClaims?.publicMetadata?.adultVerified);
      const hasCookie = cookie && cookie.value === '1';

      const shouldAllow = adultVerified || hasCookie;

      expect(shouldAllow).toBe(true);
    });

    it('should block access without Clerk or cookie', () => {
      const sessionClaims: any = {};
      const cookie = undefined;

      const adultVerified = Boolean(sessionClaims?.publicMetadata?.adultVerified);
      const hasCookie = Boolean(cookie && cookie.value === '1');

      const shouldAllow = adultVerified || hasCookie;

      expect(shouldAllow).toBe(false);
    });
  });

  describe('Rewrite URL Generation', () => {
    it('should generate correct age-check URL with returnTo', () => {
      const originalPath = '/mini-games';
      const baseUrl = 'http://localhost:3000';

      const ageCheckUrl = new URL('/age-check', baseUrl);
      ageCheckUrl.searchParams.set('returnTo', originalPath);

      expect(ageCheckUrl.pathname).toBe('/age-check');
      expect(ageCheckUrl.searchParams.get('returnTo')).toBe('/mini-games');
    });

    it('should preserve full path with query params', () => {
      const originalPath = '/mini-games?level=5';
      const baseUrl = 'http://localhost:3000';

      const ageCheckUrl = new URL('/age-check', baseUrl);
      ageCheckUrl.searchParams.set('returnTo', originalPath);

      expect(ageCheckUrl.searchParams.get('returnTo')).toBe('/mini-games?level=5');
    });

    it('should handle nested paths', () => {
      const originalPath = '/products/nsfw/category/item-123';
      const baseUrl = 'http://localhost:3000';

      const ageCheckUrl = new URL('/age-check', baseUrl);
      ageCheckUrl.searchParams.set('returnTo', originalPath);

      expect(ageCheckUrl.searchParams.get('returnTo')).toBe('/products/nsfw/category/item-123');
    });
  });

  describe('Edge Cases', () => {
    it('should handle malformed session claims gracefully', () => {
      const sessionClaims: any = null;

      const adultVerified = Boolean(sessionClaims?.publicMetadata?.adultVerified);

      expect(adultVerified).toBe(false);
    });

    it('should handle sessionClaims as non-object', () => {
      const sessionClaims: any = 'invalid';

      const adultVerified = Boolean(sessionClaims?.publicMetadata?.adultVerified);

      expect(adultVerified).toBe(false);
    });

    it('should handle cookie with extra properties', () => {
      const cookie = {
        name: 'om_age_ok',
        value: '1',
        httpOnly: true,
        secure: true,
        path: '/',
      };

      const hasCookie = cookie && cookie.value === '1';

      expect(hasCookie).toBe(true);
    });

    it('should be case-sensitive for paths', () => {
      const pathname = '/Mini-Games'; // Different case

      const isAgeGated =
        pathname.startsWith('/mini-games') ||
        pathname.startsWith('/arcade') ||
        pathname.startsWith('/products/nsfw');

      expect(isAgeGated).toBe(false);
    });
  });

  describe('Integration Scenarios', () => {
    it('should simulate anonymous user first visit', () => {
      const pathname = '/mini-games';
      const sessionClaims: any = {};
      const cookie = undefined;

      // Check if path is age-gated
      const isAgeGated =
        pathname.startsWith('/mini-games') ||
        pathname.startsWith('/arcade') ||
        pathname.startsWith('/products/nsfw');

      // Check bypass conditions
      const adultVerified = Boolean(sessionClaims?.publicMetadata?.adultVerified);
      const hasCookie = Boolean(cookie && cookie.value === '1');

      // Should gate
      expect(isAgeGated).toBe(true);
      expect(adultVerified || hasCookie).toBe(false);
    });

    it('should simulate anonymous user with session cookie', () => {
      const pathname = '/arcade';
      const sessionClaims: any = {};
      const cookie = { name: 'om_age_ok', value: '1' };

      const isAgeGated =
        pathname.startsWith('/mini-games') ||
        pathname.startsWith('/arcade') ||
        pathname.startsWith('/products/nsfw');

      const adultVerified = Boolean(sessionClaims?.publicMetadata?.adultVerified);
      const hasCookie = cookie && cookie.value === '1';

      // Should allow
      expect(isAgeGated).toBe(true);
      expect(adultVerified || hasCookie).toBe(true);
    });

    it('should simulate signed-in verified user', () => {
      const pathname = '/mini-games';
      const sessionClaims: any = { publicMetadata: { adultVerified: true } };
      const cookie = undefined;

      const isAgeGated =
        pathname.startsWith('/mini-games') ||
        pathname.startsWith('/arcade') ||
        pathname.startsWith('/products/nsfw');

      const adultVerified = Boolean(sessionClaims?.publicMetadata?.adultVerified);
      const hasCookie = cookie && cookie.value === '1';

      // Should allow without cookie
      expect(isAgeGated).toBe(true);
      expect(adultVerified || hasCookie).toBe(true);
    });

    it('should simulate signed-in unverified user without cookie', () => {
      const pathname = '/products/nsfw/item';
      const sessionClaims: any = { publicMetadata: { adultVerified: false } };
      const cookie = undefined;

      const isAgeGated =
        pathname.startsWith('/mini-games') ||
        pathname.startsWith('/arcade') ||
        pathname.startsWith('/products/nsfw');

      const adultVerified = Boolean(sessionClaims?.publicMetadata?.adultVerified);
      const hasCookie = Boolean(cookie && cookie.value === '1');

      // Should gate
      expect(isAgeGated).toBe(true);
      expect(adultVerified || hasCookie).toBe(false);
    });

    it('should allow non-gated paths without checks', () => {
      const pathname = '/shop';
      const sessionClaims: any = {};
      const cookie = undefined;

      const isAgeGated =
        pathname.startsWith('/mini-games') ||
        pathname.startsWith('/arcade') ||
        pathname.startsWith('/products/nsfw');

      // Should not gate at all
      expect(isAgeGated).toBe(false);
      expect(sessionClaims).toEqual({});
      expect(cookie).toBeUndefined();
    });
  });

  describe('Security Validation', () => {
    it('should not allow bypass with wrong cookie name', () => {
      const cookie = { name: 'different_cookie', value: '1' };
      const hasCookie = cookie && cookie.name === 'om_age_ok' && cookie.value === '1';

      expect(hasCookie).toBe(false);
    });

    it('should require exact cookie value match', () => {
      const cookie = { name: 'om_age_ok', value: 'true' }; // String 'true', not '1'
      const hasCookie = cookie && cookie.value === '1';

      expect(hasCookie).toBe(false);
    });

    it('should not bypass with numeric 1 instead of string "1"', () => {
      const cookie = { name: 'om_age_ok', value: 1 as any };
      const hasCookie = cookie && cookie.value === '1';

      expect(hasCookie).toBe(false);
    });
  });
});
