import { authMiddleware } from '@clerk/nextjs/server';

import { env } from '@/env.mjs';

const authorizedParties =
  env.AUTHORIZED_PARTIES?.split(',')
    .map(s => s.trim())
    .filter(Boolean) ?? [];

export default authMiddleware({
  // Explicit allowlist mitigates subdomain cookie/session leakage.
  authorizedParties: authorizedParties.length ? authorizedParties : undefined,
  publicRoutes: [
    '/',
    '/about',
    '/blog(.*)',
    '/shop(.*)',
    '/mini-games(.*)',
    '/api/health(.*)',
    '/api/shop(.*)',
    '/api/v1/shop(.*)',
    '/api/products(.*)',
    '/api/soapstones(.*)',
    '/api/blog(.*)',
    '/api/community(.*)',
    '/api/games(.*)',
    '/api/leaderboard(.*)',
    '/api/reviews(.*)',
    '/api/search(.*)',
    '/api/webhooks(.*)',
    '/api/system-check',
    '/api/metrics',
  ],
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};
