import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const response = NextResponse.next();

  // Security headers
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');

  // Content Security Policy
  const csp = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://*.clerk.com https://*.clerkstage.dev https://js.stripe.com https://*.jsdelivr.net https://*.printify.com",
    "script-src-elem 'self' 'unsafe-inline' https://*.clerk.com https://*.clerkstage.dev https://js.stripe.com https://*.jsdelivr.net https://*.printify.com",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com data:",
    "img-src 'self' data: https: blob: https://*.clerk.com https://*.clerkstage.dev https://*.printify.com https://images.printify.com https://*.cloudinary.com https://*.vercel-blob.com",
    "connect-src 'self' https://*.clerk.com https://*.clerkstage.dev https://vyyovmhjtxeddssvfdve.supabase.co https://api.stripe.com https://api.printify.com https://*.ingest.sentry.io wss://*.clerk.com https://vitals.vercel-insights.com",
    "frame-src 'self' https://*.clerk.com https://*.clerkstage.dev https://js.stripe.com https://*.printify.com",
    "media-src 'self' blob:",
    "worker-src 'self' blob:",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self' https://*.clerk.com https://*.printify.com",
    'upgrade-insecure-requests',
  ].join('; ');

  response.headers.set('Content-Security-Policy', csp);

  if (request.nextUrl.protocol === 'https:') {
    response.headers.set('Strict-Transport-Security', 'max-age=63072000; includeSubDomains; preload');
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
