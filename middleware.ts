import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

const isPublic = createRouteMatcher([
  '/', // homepage
  '/sign-in(.*)', // Clerk
  '/sign-up(.*)',

  // Printify pages / callbacks / webhooks you might add
  '/printify(.*)',
  '/api/printify(.*)',

  // static & assets
  '/favicon.ico',
  '/robots.txt',
  '/sitemap.xml',
  '/images(.*)',
  '/overlay(.*)',
  '/public(.*)',
]);

export default clerkMiddleware(async (auth, req) => {
  // Skip auth for API routes
  if (req.nextUrl.pathname.startsWith('/api/')) {
    return;
  }

  if (!isPublic(req)) await auth.protect();
});

export const config = {
  matcher: [
    // Skip Next internals + static files unless in search params (Clerk's recommended)
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};
