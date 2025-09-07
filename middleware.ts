// middleware.ts
import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { env } from '@/env';

const isDev = env.NODE_ENV !== 'production';

const isPublic = createRouteMatcher([
  '/',
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/printify(.*)',
  '/api/printify(.*)',
  '/favicon.ico',
  '/robots.txt',
  '/sitemap.xml',
  '/images(.*)',
  '/overlay(.*)',
  '/public(.*)',
]);

export default clerkMiddleware(
  async (auth, req) => {
    // If your /api routes are public, keep this return; else remove it to protect APIs.
    if (req.nextUrl.pathname.startsWith('/api/')) return;
    if (!isPublic(req)) await auth.protect();
  },
  // ⬇️ CSP config: permissive in dev, strict in prod
  isDev
    ? {
        // In dev: NO strict CSP — allow Next HMR + fallback scripts
        contentSecurityPolicy: {
          strict: false,
          directives: {
            // Permissive dev script-src so Next HMR works
            'script-src': ["'self'", "'unsafe-inline'", "'unsafe-eval'", 'blob:', 'data:'],
            // Keep these light; dev doesn't need to be airtight
            'img-src': ['*', 'data:'],
            'style-src': ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
            'font-src': ["'self'", 'data:', 'https://fonts.gstatic.com'],
            'connect-src': ['*'],
          },
        },
      }
    : {
        // In prod: strict CSP with Clerk-managed nonce + strict-dynamic
        contentSecurityPolicy: {
          strict: true,
          directives: {
            // Do NOT set 'script-src' here — Clerk will inject strict-dynamic + nonce
            'connect-src': [
              "'self'",
              'https://api.clerk.com',
              'https://clerk.otaku-mori.com',
              'https://api.printify.com',
              'https://*.printify.com',
              'https://*.ingest.sentry.io',
              'https://o4509520271114240.ingest.us.sentry.io',
              'https://*.sentry.io',
              'https://sentry.io',
              'https://vitals.vercel-insights.com',
            ],
            'img-src': [
              "'self'",
              'https://*.printify.com',
              'https://images.printify.com',
              'https://*.cloudinary.com',
              'https://*.vercel-blob.com',
              'https:',
              'data:',
            ],
            'style-src': ["'self'", 'https://fonts.googleapis.com'],
            'font-src': ["'self'", 'data:', 'https://fonts.gstatic.com'],
            'frame-src': ["'self'", 'https://clerk.otaku-mori.com', 'https://*.clerk.com'],
          },
        },
      },
);

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
};
