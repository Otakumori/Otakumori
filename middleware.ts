import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { env } from '@/env.mjs';

// Define route patterns for comprehensive auth management
const isPublic = createRouteMatcher([
  // Public pages
  '/',
  '/about',
  '/shop(.*)',
  '/blog(.*)',
  '/mini-games(.*)',
  '/games(.*)',
  '/community',
  '/glossary',
  '/privacy',
  '/terms',
  '/returns',
  '/faq',
  '/search',
  '/404',
  '/not-found',

  // Auth pages
  '/sign-in(.*)',
  '/sign-up(.*)',

  // Static assets
  '/favicon.ico',
  '/robots.txt',
  '/sitemap.xml',
  '/images(.*)',
  '/overlay(.*)',
  '/public(.*)',
  '/assets(.*)',

  // API routes (handled separately)
  '/api/health',
  '/api/printify(.*)',
  '/api/v1/printify(.*)',
  '/api/v1/products(.*)',
  '/api/v1/content(.*)',
  '/api/v1/games(.*)',
  '/api/soapstones(.*)',
  '/api/petals/global',
  '/api/music/playlist',
  '/api/newsletter',
  '/api/contact',
  '/api/debug(.*)',
  '/api/test(.*)',
]);

const isProtected = createRouteMatcher([
  // User account pages
  '/account(.*)',
  '/profile(.*)',
  '/orders(.*)',
  '/wishlist(.*)',
  '/settings(.*)',
  '/prefs(.*)',
  '/data-deletion(.*)',
  '/cookies(.*)',

  // Interactive features requiring auth
  '/trade(.*)',
  '/soapstone(.*)',
  '/character-editor(.*)',
  '/starter-pack(.*)',
  '/thank-you(.*)',

  // Admin pages
  '/admin(.*)',
  '/panel(.*)',

  // API routes requiring auth
  '/api/account(.*)',
  '/api/orders(.*)',
  '/api/wishlist(.*)',
  '/api/trade(.*)',
  '/api/soapstone(.*)',
  '/api/petals(.*)',
  '/api/user(.*)',
  '/api/profile(.*)',
  '/api/inventory(.*)',
  '/api/quests(.*)',
  '/api/leaderboard(.*)',
  '/api/me(.*)',
  '/api/storage(.*)',
  '/api/titles(.*)',
  '/api/equip(.*)',
  '/api/gamertag(.*)',
  '/api/rate-limit',
  '/api/log-client-error',
  '/api/metrics',
  '/api/system-check',
  '/api/stripe(.*)',
  '/api/webhooks(.*)',
  '/api/admin(.*)',
  '/api/coupons(.*)',
  '/api/digital(.*)',
  '/api/gacha(.*)',
  '/api/petal-gacha(.*)',
  '/api/petal-shop(.*)',
  '/api/reviews(.*)',
  '/api/runes(.*)',
  '/api/community(.*)',
  '/api/ds-messages(.*)',
  '/api/checkout(.*)',
  '/api/contact(.*)',
  '/api/inngest(.*)',
  '/api/notifications(.*)',
  '/api/parties(.*)',
  '/api/safety(.*)',
  '/api/sentiment(.*)',
  '/api/soapstone(.*)',
  '/api/soapstones(.*)',
  '/api/starter-pack(.*)',
  '/api/trade(.*)',
  '/api/v1/account(.*)',
  '/api/v1/achievements(.*)',
  '/api/v1/auth(.*)',
  '/api/v1/checkout(.*)',
  '/api/v1/community(.*)',
  '/api/v1/coupons(.*)',
  '/api/v1/games(.*)',
  '/api/v1/inventory(.*)',
  '/api/v1/leaderboard(.*)',
  '/api/v1/me(.*)',
  '/api/v1/notifications(.*)',
  '/api/v1/orders(.*)',
  '/api/v1/petals(.*)',
  '/api/v1/profile(.*)',
  '/api/v1/quests(.*)',
  '/api/v1/reviews(.*)',
  '/api/v1/runes(.*)',
  '/api/v1/shop(.*)',
  '/api/v1/storage(.*)',
  '/api/v1/titles(.*)',
  '/api/v1/trade(.*)',
  '/api/v1/user(.*)',
  '/api/v1/wishlist(.*)',
]);

const isAdmin = createRouteMatcher(['/admin(.*)', '/panel(.*)', '/api/admin(.*)']);

export default clerkMiddleware(
  async (auth, req) => {
    const url = req.nextUrl.clone();
    const host = req.headers.get('host') || '';
    const proto = req.headers.get('x-forwarded-proto') || url.protocol.replace(':', '');
    const isApi = url.pathname.startsWith('/api/');
    const { userId, sessionClaims } = await auth();

    // Generate correlation ID for request tracking
    const reqId =
      req.headers.get('x-request-id') ||
      req.headers.get('x-correlation-id') ||
      `req_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

    // Handle API routes
    if (isApi) {
      const res = NextResponse.next();
      res.headers.set('X-Request-ID', reqId);
      res.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');

      // Add CORS headers for API routes
      res.headers.set('Access-Control-Allow-Origin', '*');
      res.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
      res.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Request-ID');

      return res;
    }

    // Enforce canonical domain (exclude accounts subdomain)
    const isApex = host === 'otaku-mori.com';
    const isAccounts = host.startsWith('accounts.');
    if (!isAccounts && isApex) {
      url.host = `www.otaku-mori.com`;
      return NextResponse.redirect(url, 308);
    }

    // Enforce HTTPS on primary domains
    const isPrimary = host.endsWith('otaku-mori.com');
    if (isPrimary && proto !== 'https') {
      url.protocol = 'https:';
      return NextResponse.redirect(url, 308);
    }

    // Handle admin routes - require admin role
    if (isAdmin(req)) {
      if (!userId) {
        // Redirect to sign-in with return URL
        const signInUrl = new URL('/sign-in', req.url);
        signInUrl.searchParams.set('redirect_url', req.url);
        return NextResponse.redirect(signInUrl);
      }

      // Check if user has admin role
      const isAdminUser =
        (sessionClaims as any)?.metadata?.role === 'admin' ||
        (sessionClaims as any)?.public_metadata?.role === 'admin';

      if (!isAdminUser) {
        // Redirect to unauthorized page
        return NextResponse.redirect(new URL('/unauthorized', req.url));
      }
    }

    // Handle protected routes - require authentication
    if (isProtected(req)) {
      if (!userId) {
        // Redirect to sign-in with return URL
        const signInUrl = new URL('/sign-in', req.url);
        signInUrl.searchParams.set('redirect_url', req.url);
        return NextResponse.redirect(signInUrl);
      }
    }

    // Handle public routes - no auth required
    const res = NextResponse.next();

    // Add security headers
    res.headers.set('X-Request-ID', reqId);
    res.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
    res.headers.set('X-Content-Type-Options', 'nosniff');
    res.headers.set('X-Frame-Options', 'SAMEORIGIN');
    res.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');

    // Add user context headers for debugging
    if (userId) {
      res.headers.set('X-User-ID', userId);
    }

    return res;
  },
  {
    // Clerk middleware options
    publishableKey: env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
    secretKey: env.CLERK_SECRET_KEY,
  },
);

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
};
