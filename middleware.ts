import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { monitor } from './lib/monitor';
import { apiMonitor } from './middleware/api-monitor';

export async function middleware(request: NextRequest) {
  const startTime = Date.now();
  let response: NextResponse;

  try {
    // Get the pathname of the request
    const path = request.nextUrl.pathname;

    // Define public paths that don't require authentication
    const isPublicPath = path === '/' || 
                        path.startsWith('/shop') || 
                        path.startsWith('/api/shop/products') ||
                        path.startsWith('/blog') ||
                        path.startsWith('/about') ||
                        path.startsWith('/contact') ||
                        path.startsWith('/faq') ||
                        path.startsWith('/_next') ||
                        path.startsWith('/static');

    // Check if the request is for an API endpoint
    const isApiRequest = path.startsWith('/api');

    // For API requests, check for API key
    if (isApiRequest && !isPublicPath) {
      const apiKey = request.headers.get('x-api-key');
      if (!apiKey || apiKey !== process.env.API_KEY) {
        return NextResponse.json(
          { error: 'Unauthorized' },
          { status: 401 }
        );
      }
    }

    // For non-public paths, check for authentication
    if (!isPublicPath) {
      const token = request.cookies.get('auth-token')?.value;
      if (!token) {
        return NextResponse.redirect(new URL('/auth/signin', request.url));
      }
    }

    // Process the request
    response = NextResponse.next();

    // Apply API monitoring for API routes
    if (isApiRequest) {
      response = await apiMonitor(request, response);
    }

    // Record request metrics
    const responseTime = Date.now() - startTime;
    await monitor.recordRequest(responseTime);

    return response;
  } catch (error) {
    // Record error
    await monitor.recordError();
    console.error('Middleware error:', error);
    return NextResponse.next(); // Allow the request to proceed even if monitoring fails
  }
}

export const config = {
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