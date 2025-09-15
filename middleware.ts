import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { env } from '@/server/env';

const isPublic = createRouteMatcher([
  '/',
  '/about',
  '/shop(.*)',
  '/blog(.*)',
  '/mini-games(.*)',
  '/games(.*)',
  '/community',
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/favicon.ico',
  '/robots.txt',
  '/sitemap.xml',
  '/images(.*)',
  '/overlay(.*)',
  '/public(.*)',
]);

const isDev = env.NODE_ENV !== 'production';

export default clerkMiddleware(async (auth, req) => {
  const url = req.nextUrl.clone();
  const host = req.headers.get('host') || '';
  const proto = req.headers.get('x-forwarded-proto') || url.protocol.replace(':', '');
  const isApi = url.pathname.startsWith('/api/');

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

  // Protect non-public pages
  if (!isPublic(req)) await auth.protect();

  const res = NextResponse.next();

  // Correlation ID header
  const reqId =
    req.headers.get('x-request-id') ||
    req.headers.get('x-correlation-id') ||
    `req_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  res.headers.set('X-Request-ID', reqId);

  // Security headers (keep HSTS here; other headers set via next.config.js)
  res.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');

  return res;
}, {});

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
};
