import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextFetchEvent, NextRequest, NextResponse } from 'next/server';
import { handleCorsPreflight, withCors } from '@/app/lib/http/cors';

const ACCOUNTS_BASE_URL = 'https://accounts.otaku-mori.com';
const LOCAL_HOSTS = new Set(['localhost', '127.0.0.1', '::1']);

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

function nextWithPathname(req: Request, pathname: string) {
  const requestHeaders = new Headers(req.headers);
  requestHeaders.set('x-otm-pathname', pathname);
  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
}

function applyPublicSecurityHeaders(res: NextResponse, reqId: string) {
  res.headers.set('X-Request-ID', reqId);
  res.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
  res.headers.set('X-Content-Type-Options', 'nosniff');
  res.headers.set('X-Frame-Options', 'SAMEORIGIN');
  res.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  return res;
}

function getRequestId(req: Request) {
  return (
    req.headers.get('x-request-id') ||
    req.headers.get('x-correlation-id') ||
    `req_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
  );
}

function isLocalPublicSiteRequest(req: NextRequest) {
  const host = req.headers.get('host')?.split(':')[0] ?? '';
  const pathname = req.nextUrl.pathname;
  return (
    process.env.NODE_ENV !== 'production' &&
    LOCAL_HOSTS.has(host) &&
    !pathname.startsWith('/api/') &&
    !pathname.startsWith('/ingest') &&
    !isAdmin(req) &&
    !isProtected(req)
  );
}

const authMiddleware = clerkMiddleware(async (auth, req) => {
  try {
    const url = req.nextUrl.clone();
    const host = req.headers.get('host') || '';
    const proto = req.headers.get('x-forwarded-proto') || url.protocol.replace(':', '');
    const isApi = url.pathname.startsWith('/api/');
    const isIngest = url.pathname.startsWith('/ingest');
    const isMerchizeAdminProbe = url.pathname === '/admin/merchize';

    const reqId = getRequestId(req);

    if (isApi || isIngest) {
      if (req.method === 'OPTIONS') {
        return handleCorsPreflight(req);
      }

      const res = nextWithPathname(req, url.pathname);
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

    if (isAdmin(req) && !isMerchizeAdminProbe) {
      const { userId, sessionClaims } = await auth();
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

    if (isProtected(req) && !isMerchizeAdminProbe) {
      const { userId } = await auth();
      if (!userId) {
        return NextResponse.redirect(buildAccountsUrl('/sign-in', req.url));
      }
    }

    const res = nextWithPathname(req, url.pathname);
    return applyPublicSecurityHeaders(res, reqId);
  } catch {
    return NextResponse.next();
  }
});

export default function middleware(req: NextRequest, event: NextFetchEvent) {
  if (isLocalPublicSiteRequest(req)) {
    const res = nextWithPathname(req, req.nextUrl.pathname);
    return applyPublicSecurityHeaders(res, getRequestId(req));
  }

  return authMiddleware(req, event);
}

export const config = {
  matcher: [
    '/((?!_next|_vercel|favicon.ico|robots.txt|sitemap.xml|public/|assets/|.*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
  ],
};
