import { authMiddleware } from '@clerk/nextjs/server';

export default authMiddleware({
  publicRoutes: [
    '/',
    '/about',
    '/blog(.*)',
    '/shop(.*)',
    '/api/health(.*)',
    '/api/shop(.*)',
    '/api/v1/shop(.*)', // Add this for the v1 API
    '/api/products(.*)',
    '/api/soapstones(.*)',
    '/api/blog(.*)',
    '/api/community(.*)',
    '/api/games(.*)',
    '/api/leaderboard(.*)',
    '/api/reviews(.*)',
    '/api/search(.*)',
    '/api/webhooks(.*)',
    '/api/system-check', // Add system diagnostics
    '/api/metrics', // Add performance metrics
  ],
  ignoredRoutes: ['/api/webhooks/clerk', '/api/webhooks/stripe', '/api/webhooks/printify'],
});

export const config = {
  matcher: ['/((?!.+\\.[\\w]+$|_next).*)', '/', '/(api|trpc)(.*)'],
};
