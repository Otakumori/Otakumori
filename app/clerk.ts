import { authMiddleware } from '@clerk/nextjs/server';

export default authMiddleware({
  publicRoutes: [
    '/',
    '/about',
    '/blog(.*)',
    '/shop(.*)',
    '/api/health(.*)',
    '/api/shop(.*)',
    '/api/products(.*)',
    '/api/soapstones(.*)',
    '/api/blog(.*)',
    '/api/community(.*)',
    '/api/games(.*)',
    '/api/leaderboard(.*)',
    '/api/reviews(.*)',
    '/api/search(.*)',
    '/api/webhooks(.*)',
  ],
  ignoredRoutes: [
    '/api/webhooks/clerk',
    '/api/webhooks/stripe',
    '/api/webhooks/printify',
  ],
});

export const config = {
  matcher: [
    '/((?!.+\\.[\\w]+$|_next).*)',
    '/',
    '/(api|trpc)(.*)',
  ],
};
