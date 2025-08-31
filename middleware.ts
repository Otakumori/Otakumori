/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable-line @next/next/no-img-element */
import { authMiddleware } from '@clerk/nextjs/server';

export default authMiddleware({
  publicRoutes: [
    '/',
    '/shop(.*)',
    '/mini-games(.*)',
    '/blog(.*)',
    '/about',
    '/search',
    '/api/shop(.*)',
    '/api/health',
  ],
  ignoredRoutes: ['/api/clerk/webhook', '/api/stripe/webhook'],
  afterAuth(auth, req) {
    const { pathname } = req.nextUrl;

    // Redirect old profile route to account
    if (pathname.startsWith('/profile')) {
      const newUrl = new URL(pathname.replace('/profile', '/account'), req.url);
      return Response.redirect(newUrl);
    }

    // For API routes, only protect admin endpoints
    if (pathname.startsWith('/api/admin')) {
      if (!auth.userId) {
        return Response.redirect(new URL('/sign-in', req.url));
      }
    }
  },
});

export const config = {
  matcher: ['/((?!.+\\.[\\w]+$|_next).*)', '/', '/(api)(.*)'],
};
