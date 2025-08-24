import { authMiddleware } from '@clerk/nextjs/server';

export default authMiddleware({
  publicRoutes: [
    '/',
    '/about',
    '/blog(.*)',
    '/shop(.*)',
    '/api/health(.*)',
    '/api/shop(.*)',
    '/api/v1/shop(.*)',  // Add this for the v1 API
    '/api/products(.*)',
    '/api/soapstones(.*)',
    '/api/blog(.*)',
    '/api/community(.*)',
    '/api/games(.*)',
    '/api/leaderboard(.*)',
    '/api/reviews(.*)',
    '/api/search(.*)',
    '/api/webhooks(.*)',
    '/api/test-env',  // Add this for testing
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
