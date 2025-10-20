import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

// Avoid throwing in middleware for missing env at Edge runtime; Clerk SDK handles configuration

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

export default clerkMiddleware(async (auth, req) => {
  try {
    const url = req.nextUrl.clone();
    const host = req.headers.get('host') || '';
    const proto = req.headers.get('x-forwarded-proto') || url.protocol.replace(':', '');
    const isApi = url.pathname.startsWith('/api/');
    const isIngest = url.pathname.startsWith('/ingest');
    const { userId, sessionClaims } = await auth();

    // Correlation ID for request tracking
    const reqId =
      req.headers.get('x-request-id') ||
      req.headers.get('x-correlation-id') ||
      `req_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

    // API routes: pass through, set headers
    if (isApi || isIngest) {
      const res = NextResponse.next();
      res.headers.set('X-Request-ID', reqId);
      res.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
      res.headers.set('Access-Control-Allow-Origin', '*');
      res.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
      res.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Request-ID');
      return res;
    }

    // Canonical redirect (avoid redirect loops and subdomains)
    const isApex = host === 'otaku-mori.com';
    const isAccounts = host.startsWith('accounts.');
    if (!isAccounts && isApex) {
      url.host = `www.otaku-mori.com`;
      return NextResponse.redirect(url, 308);
    }

    // Enforce HTTPS on primary domain
    const isPrimary = host.endsWith('otaku-mori.com');
    if (isPrimary && proto !== 'https') {
      url.protocol = 'https:';
      return NextResponse.redirect(url, 308);
    }

    // Admin gates
    if (isAdmin(req)) {
      if (!userId) {
        const signInUrl = new URL('/sign-in', req.url);
        signInUrl.searchParams.set('redirect_url', req.url);
        return NextResponse.redirect(signInUrl);
      }
      const isAdminUser =
        (sessionClaims as any)?.metadata?.role === 'admin' ||
        (sessionClaims as any)?.public_metadata?.role === 'admin';
      if (!isAdminUser) {
        return NextResponse.redirect(new URL('/unauthorized', req.url));
      }
    }

    // Protected gates
    if (isProtected(req)) {
      if (!userId) {
        const signInUrl = new URL('/sign-in', req.url);
        signInUrl.searchParams.set('redirect_url', req.url);
        return NextResponse.redirect(signInUrl);
      }
    }

    // Public route: add security headers
    const res = NextResponse.next();
    res.headers.set('X-Request-ID', reqId);
    res.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
    res.headers.set('X-Content-Type-Options', 'nosniff');
    res.headers.set('X-Frame-Options', 'SAMEORIGIN');
    res.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
    if (userId) res.headers.set('X-User-ID', userId);
    return res;
  } catch {
    // Fail-open to avoid user-facing 500s from middleware
    return NextResponse.next();
  }
});

export const config = {
  matcher: [
    // Exclude Next internals, static assets, and most API routes from middleware
    '/((?!_next|_vercel|favicon.ico|robots.txt|sitemap.xml|public/|assets/|.*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
  ],
};
