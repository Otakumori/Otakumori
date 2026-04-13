import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { handleCorsPreflight, withCors } from '@/app/lib/http/cors';

const ACCOUNTS_BASE_URL = 'https://accounts.otaku-mori.com';

const isProtected = createRouteMatcher([
  '/account(.*)',
  '/profile(.*)',
  '/orders(.*)',
  '/wishlist(.*)',
  '/settings(.*)',
  '/prefs(.*)',
  '/data-deletion(.*)',
  '/cookies(.*)',
  '/trade(.*)',
  '/soapstone(.*)',
  '/character-editor(.*)',
  '/starter-pack(.*)',
  '/thank-you(.*)',
  '/admin(.*)',
  '/panel(.*)',
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

function buildAccountsUrl(path: string, redirectUrl?: string) {
  const url = new URL(path, ACCOUNTS_BASE_URL);
  if (redirectUrl) {
    url.searchParams.set('redirect_url', redirectUrl);
  }
  return url;
}

export default clerkMiddleware(async (auth, req) => {
  try {
    const url = req.nextUrl.clone();
    const host = req.headers.get('host') || '';
    const proto = req.headers.get('x-forwarded-proto') || url.protocol.replace(':', '');
    const isApi = url.pathname.startsWith('/api/');
    const isIngest = url.pathname.startsWith('/ingest');
    const { userId, sessionClaims } = await auth();

    const reqId =
      req.headers.get('x-request-id') ||
      req.headers.get('x-correlation-id') ||
      `req_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

    if (isApi || isIngest) {
      if (req.method === 'OPTIONS') {
        return handleCorsPreflight(req);
      }

      const res = NextResponse.next();
      res.headers.set('X-Request-ID', reqId);

      return withCors(res, req.headers.get('origin'), {
        'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',
      });
    }

    const isApex = host === 'otaku-mori.com';
    const isAccounts = host.startsWith('accounts.');
    if (!isAccounts && isApex) {
      url.host = 'www.otaku-mori.com';
      return NextResponse.redirect(url, 308);
    }

    const isPrimary = host.endsWith('otaku-mori.com');
    if (isPrimary && proto !== 'https') {
      url.protocol = 'https:';
      return NextResponse.redirect(url, 308);
    }

    if (isAdmin(req)) {
      if (!userId) {
        return NextResponse.redirect(buildAccountsUrl('/sign-in', req.url));
      }
      const isAdminUser =
        (sessionClaims as any)?.metadata?.role === 'admin' ||
        (sessionClaims as any)?.public_metadata?.role === 'admin';
      if (!isAdminUser) {
        return NextResponse.redirect(buildAccountsUrl('/unauthorized-sign-in', req.url));
      }
    }

    if (isProtected(req)) {
      if (!userId) {
        return NextResponse.redirect(buildAccountsUrl('/sign-in', req.url));
      }
    }

    const res = NextResponse.next();
    res.headers.set('X-Request-ID', reqId);
    res.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
    res.headers.set('X-Content-Type-Options', 'nosniff');
    res.headers.set('X-Frame-Options', 'SAMEORIGIN');
    res.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
    if (userId) res.headers.set('X-User-ID', userId);
    return res;
  } catch {
    return NextResponse.next();
  }
});

export const config = {
  matcher: [
    '/((?!_next|_vercel|favicon.ico|robots.txt|sitemap.xml|public/|assets/|.*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
  ],
};
