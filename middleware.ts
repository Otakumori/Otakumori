import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse, type NextFetchEvent, type NextRequest } from 'next/server';
import { handleCorsPreflight, withCors } from '@/app/lib/http/cors';

const ACCOUNTS_BASE_URL = 'https://accounts.otaku-mori.com';
const AGE_GATE_COOKIE = 'om_age_ok';
const MATURE_MINI_GAME_PATHS = new Set([
  '/mini-games/dungeon-of-desire',
  '/mini-games/thigh-coliseum',
]);

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

function isAgeGatedRoute(pathname: string) {
  return MATURE_MINI_GAME_PATHS.has(pathname);
}

function buildAgeCheckUrl(reqUrl: string, returnTo: string) {
  const url = new URL('/age-check', reqUrl);
  url.searchParams.set('returnTo', returnTo);
  return url;
}

function createRequestId(req: NextRequest) {
  return (
    req.headers.get('x-request-id') ||
    req.headers.get('x-correlation-id') ||
    `req_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
  );
}

function addPublicSecurityHeaders(res: NextResponse, reqId: string) {
  res.headers.set('X-Request-ID', reqId);
  res.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
  res.headers.set('X-Content-Type-Options', 'nosniff');
  res.headers.set('X-Frame-Options', 'SAMEORIGIN');
  res.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  return res;
}

function apiAuthError(status: 401 | 403, message: string, reqId: string) {
  return addPublicSecurityHeaders(
    NextResponse.json({ ok: false, error: message }, { status }),
    reqId,
  );
}

function isLighthousePublicRoute(req: NextRequest) {
  return (
    req.headers.get('x-otakumori-lighthouse-ci') === '1' &&
    !req.nextUrl.pathname.startsWith('/api/') &&
    !req.nextUrl.pathname.startsWith('/ingest') &&
    !isAgeGatedRoute(req.nextUrl.pathname) &&
    !isAdmin(req) &&
    !isProtected(req)
  );
}

function handleLighthousePublicRoute(req: NextRequest) {
  const url = req.nextUrl.clone();
  const host = req.headers.get('host') || '';
  const proto = req.headers.get('x-forwarded-proto') || url.protocol.replace(':', '');

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

  return addPublicSecurityHeaders(NextResponse.next(), createRequestId(req));
}

const clerkAuthMiddleware = clerkMiddleware(async (auth, req) => {
  try {
    const url = req.nextUrl.clone();
    const host = req.headers.get('host') || '';
    const proto = req.headers.get('x-forwarded-proto') || url.protocol.replace(':', '');
    const isApi = url.pathname.startsWith('/api/');
    const isIngest = url.pathname.startsWith('/ingest');
    const isMerchizeAdminProbe = url.pathname === '/admin/merchize';
    const requiresAdminAuth = isAdmin(req) && !isMerchizeAdminProbe;

    const reqId = createRequestId(req);

    if (req.method === 'OPTIONS' && (isApi || isIngest)) {
      return handleCorsPreflight(req);
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

    if (isAgeGatedRoute(url.pathname) && req.cookies.get(AGE_GATE_COOKIE)?.value !== '1') {
      return NextResponse.redirect(buildAgeCheckUrl(req.url, `${url.pathname}${url.search}`));
    }

    let userId: string | null = null;
    let sessionClaims: Awaited<ReturnType<typeof auth>>['sessionClaims'] | null = null;

    if (requiresAdminAuth) {
      const authResult = await auth();
      userId = authResult.userId;
      sessionClaims = authResult.sessionClaims;

      if (!userId) {
        if (isApi) return apiAuthError(401, 'Unauthorized', reqId);
        return NextResponse.redirect(buildAccountsUrl('/sign-in', req.url));
      }

      const isAdminUser =
        (sessionClaims as any)?.metadata?.role === 'admin' ||
        (sessionClaims as any)?.public_metadata?.role === 'admin';
      if (!isAdminUser) {
        if (isApi) return apiAuthError(403, 'Forbidden', reqId);
        return NextResponse.redirect(buildAccountsUrl('/unauthorized-sign-in', req.url));
      }
    }

    if (isApi || isIngest) {
      const res = addPublicSecurityHeaders(NextResponse.next(), reqId);
      return withCors(res, req.headers.get('origin'), {
        'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',
      });
    }

    const requiresProtectedAuth = isProtected(req) && !isMerchizeAdminProbe;
    if (requiresProtectedAuth && !userId) {
      const authResult = await auth();
      userId = authResult.userId;
    }

    if (requiresProtectedAuth && !userId) {
      return NextResponse.redirect(buildAccountsUrl('/sign-in', req.url));
    }

    return addPublicSecurityHeaders(NextResponse.next(), reqId);
  } catch {
    const reqId = createRequestId(req);
    const isSensitiveRoute =
      req.nextUrl.pathname.startsWith('/api/') || isAdmin(req) || isProtected(req);

    if (isSensitiveRoute) {
      return addPublicSecurityHeaders(
        new NextResponse('Service unavailable', { status: 503 }),
        reqId,
      );
    }

    return addPublicSecurityHeaders(NextResponse.next(), reqId);
  }
});

export default function middleware(req: NextRequest, event: NextFetchEvent) {
  if (isLighthousePublicRoute(req)) {
    return handleLighthousePublicRoute(req);
  }

  return clerkAuthMiddleware(req, event);
}

export const config = {
  matcher: [
    '/((?!_next|_vercel|favicon.ico|robots.txt|sitemap.xml|public/|assets/|.*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
  ],
};