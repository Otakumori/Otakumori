'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
exports.config = void 0;
exports.middleware = middleware;
const server_1 = require('next/server');
const monitor_1 = require('./lib/monitor');
const api_monitor_1 = require('./middleware/api-monitor');
const auth_helpers_nextjs_1 = require('@supabase/auth-helpers-nextjs');
async function middleware(request) {
  const startTime = Date.now();
  let response;
  try {
    // Get the pathname of the request
    const path = request.nextUrl.pathname;
    // Define public paths that don't require authentication
    const isPublicPath =
      path === '/' ||
      path.startsWith('/shop') ||
      path.startsWith('/api/shop/products') ||
      path.startsWith('/blog') ||
      path.startsWith('/about') ||
      path.startsWith('/contact') ||
      path.startsWith('/faq') ||
      path.startsWith('/_next') ||
      path.startsWith('/static') ||
      path.startsWith('/auth');
    // Check if the request is for an API endpoint
    const isApiRequest = path.startsWith('/api');
    // Initialize Supabase client
    const res = server_1.NextResponse.next();
    const supabase = (0, auth_helpers_nextjs_1.createMiddlewareClient)({ req: request, res });
    // For API requests, check for API key
    if (isApiRequest && !isPublicPath) {
      const apiKey = request.headers.get('x-api-key');
      if (!apiKey || apiKey !== process.env.API_KEY) {
        return server_1.NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
    }
    // For non-public paths, check for authentication
    if (!isPublicPath) {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) {
        const redirectUrl = new URL('/auth/signin', request.url);
        redirectUrl.searchParams.set('redirectTo', request.url);
        return server_1.NextResponse.redirect(redirectUrl);
      }
    }
    // Process the request
    response = res;
    // Apply API monitoring for API routes
    if (isApiRequest) {
      response = await (0, api_monitor_1.apiMonitor)(request, response);
    }
    // Record request metrics
    const responseTime = Date.now() - startTime;
    await monitor_1.monitor.recordRequest(responseTime);
    return response;
  } catch (error) {
    // Record error
    await monitor_1.monitor.recordError();
    console.error('Middleware error:', error);
    return server_1.NextResponse.next(); // Allow the request to proceed even if monitoring fails
  }
}
exports.config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|public).*)',
  ],
};
