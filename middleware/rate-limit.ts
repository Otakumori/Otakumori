import { type NextRequest, NextResponse } from 'next/server';
import { rateLimiters, redis } from '@/lib/redis';
import { getRequestId } from '@/app/lib/http';

// Rate limiting configuration for different routes
const rateLimitConfig = {
  // Auth routes - very strict
  '/api/v1/auth': {
    limiter: rateLimiters.auth,
    identifier: (req: NextRequest) => {
      // Use IP for auth routes
      return req.headers.get('x-forwarded-for') || 'unknown';
    },
  },

  // Public write routes (contact, comments, etc.)
  '/api/v1/contact': {
    limiter: rateLimiters.contact,
    identifier: (req: NextRequest) => {
      return req.headers.get('x-forwarded-for') || 'unknown';
    },
  },

  '/api/v1/comments': {
    limiter: rateLimiters.publicWrite,
    identifier: (req: NextRequest) => {
      return req.headers.get('x-forwarded-for') || 'unknown';
    },
  },

  // Game submission routes
  '/api/v1/games': {
    limiter: rateLimiters.gameSubmit,
    identifier: (req: NextRequest) => {
      // Use user ID if available, otherwise IP
      const userId = req.headers.get('x-user-id');
      return userId || req.headers.get('x-forwarded-for') || 'unknown';
    },
  },

  // Search routes
  '/api/v1/search': {
    limiter: rateLimiters.search,
    identifier: (req: NextRequest) => {
      const userId = req.headers.get('x-user-id');
      return userId || req.headers.get('x-forwarded-for') || 'unknown';
    },
  },

  // Upload routes
  '/api/v1/upload': {
    limiter: rateLimiters.upload,
    identifier: (req: NextRequest) => {
      const userId = req.headers.get('x-user-id');
      return userId || req.headers.get('x-forwarded-for') || 'unknown';
    },
  },

  // Checkout routes
  '/api/v1/checkout': {
    limiter: rateLimiters.checkout,
    identifier: (req: NextRequest) => {
      const userId = req.headers.get('x-user-id');
      return userId || req.headers.get('x-forwarded-for') || 'unknown';
    },
  },

  // Default API routes
  '/api/v1': {
    limiter: rateLimiters.api,
    identifier: (req: NextRequest) => {
      const userId = req.headers.get('x-user-id');
      return userId || req.headers.get('x-forwarded-for') || 'unknown';
    },
  },
} as const;

// Find the most specific route match
function findRateLimitConfig(
  pathname: string,
): (typeof rateLimitConfig)[keyof typeof rateLimitConfig] | null {
  // Sort routes by specificity (longest first)
  const sortedRoutes = Object.keys(rateLimitConfig).sort((a, b) => b.length - a.length);

  for (const route of sortedRoutes) {
    if (pathname.startsWith(route)) {
      return rateLimitConfig[route as keyof typeof rateLimitConfig];
    }
  }

  return null;
}

// Rate limiting middleware
export async function rateLimitMiddleware(req: NextRequest): Promise<NextResponse | null> {
  const { pathname } = req.nextUrl;

  // Skip rate limiting for non-API routes
  if (!pathname.startsWith('/api/')) {
    return null;
  }

  // Find the appropriate rate limit configuration
  const config = findRateLimitConfig(pathname);
  if (!config) {
    return null;
  }

  try {
    // Get identifier for rate limiting
    const identifier = config.identifier(req);

    // Check rate limit
    if (!config.limiter) {
      return NextResponse.next();
    }
    const { success, limit, reset, remaining } = await (config.limiter as any).limit(identifier);

    // Add rate limit headers
    const response = success
      ? null
      : NextResponse.json(
          {
            ok: false,
            error: 'Rate limit exceeded',
            code: 'RATE_LIMITED',
            retryAfter: Math.ceil((reset - Date.now()) / 1000),
          },
          { status: 429 },
        );

    // Add rate limit headers to response
    if (response) {
      response.headers.set('X-RateLimit-Limit', limit.toString());
      response.headers.set('X-RateLimit-Remaining', remaining.toString());
      response.headers.set('X-RateLimit-Reset', new Date(reset).toISOString());
      response.headers.set('Retry-After', Math.ceil((reset - Date.now()) / 1000).toString());
    }

    return response;
  } catch (error) {
    console.error('Rate limiting error:', error);
    // If rate limiting fails, allow the request to proceed
    // but log the error for monitoring
    return null;
  }
}

// Enhanced rate limiting with user-based identification
export async function enhancedRateLimitMiddleware(req: NextRequest): Promise<NextResponse | null> {
  const { pathname } = req.nextUrl;

  // Skip rate limiting for non-API routes
  if (!pathname.startsWith('/api/')) {
    return null;
  }

  // Get user ID from headers (set by auth middleware)
  const userId = req.headers.get('x-user-id');
  const isAuthenticated = !!userId;

  // Find the appropriate rate limit configuration
  const config = findRateLimitConfig(pathname);
  if (!config) {
    return null;
  }

  try {
    // Get identifier for rate limiting
    const identifier = config.identifier(req);

    // For authenticated users, use user ID as primary identifier
    // For unauthenticated users, use IP
    const rateLimitKey = isAuthenticated ? `user:${userId}` : `ip:${identifier}`;

    // Check rate limit
    if (!config.limiter) {
      return NextResponse.next();
    }
    const { success, limit, reset, remaining } = await (config.limiter as any).limit(rateLimitKey);

    // Add request ID for tracing
    const requestId = getRequestId();

    // Add rate limit headers
    const response = success
      ? null
      : NextResponse.json(
          {
            ok: false,
            error: 'Rate limit exceeded',
            code: 'RATE_LIMITED',
            retryAfter: Math.ceil((reset - Date.now()) / 1000),
            requestId,
          },
          { status: 429 },
        );

    // Add rate limit headers to response
    if (response) {
      response.headers.set('X-RateLimit-Limit', limit.toString());
      response.headers.set('X-RateLimit-Remaining', remaining.toString());
      response.headers.set('X-RateLimit-Reset', new Date(reset).toISOString());
      response.headers.set('Retry-After', Math.ceil((reset - Date.now()) / 1000).toString());
      response.headers.set('X-Request-ID', requestId);
    }

    return response;
  } catch (error) {
    console.error('Enhanced rate limiting error:', error);
    // If rate limiting fails, allow the request to proceed
    // but log the error for monitoring
    return null;
  }
}

// Burst protection for high-traffic endpoints
export async function burstProtectionMiddleware(req: NextRequest): Promise<NextResponse | null> {
  const { pathname } = req.nextUrl;

  // Only apply to high-traffic endpoints
  const highTrafficEndpoints = ['/api/v1/products', '/api/v1/search', '/api/v1/leaderboards'];

  const isHighTraffic = highTrafficEndpoints.some((endpoint) => pathname.startsWith(endpoint));
  if (!isHighTraffic) {
    return null;
  }

  try {
    const identifier = req.headers.get('x-forwarded-for') || 'unknown';

    // Very strict burst protection: 10 requests per 10 seconds
    if (!redis) {
      // If Redis is not available, skip rate limiting
      return NextResponse.next();
    }

    const burstLimiter = new (await import('@upstash/ratelimit')).Ratelimit({
      redis,
      limiter: (await import('@upstash/ratelimit')).Ratelimit.slidingWindow(10, '10 s'),
      analytics: true,
      prefix: 'burst_protection',
    });

    const { success } = await burstLimiter.limit(identifier);

    if (!success) {
      return NextResponse.json(
        {
          ok: false,
          error: 'Too many requests, please slow down',
          code: 'BURST_LIMIT_EXCEEDED',
        },
        { status: 429 },
      );
    }

    return null;
  } catch (error) {
    console.error('Burst protection error:', error);
    return null;
  }
}

// DDoS protection for suspicious patterns
export async function ddosProtectionMiddleware(req: NextRequest): Promise<NextResponse | null> {
  const { pathname } = req.nextUrl;

  // Skip for non-API routes
  if (!pathname.startsWith('/api/')) {
    return null;
  }

  try {
    const identifier = req.headers.get('x-forwarded-for') || 'unknown';
    const userAgent = req.headers.get('user-agent') || '';

    // Check for suspicious patterns
    const suspiciousPatterns = [/bot/i, /crawler/i, /spider/i, /scraper/i, /curl/i, /wget/i];

    const isSuspicious = suspiciousPatterns.some((pattern) => pattern.test(userAgent));

    if (isSuspicious) {
      // Apply stricter rate limiting for suspicious requests
      const ddosLimiter = new (await import('@upstash/ratelimit')).Ratelimit({
        redis,
        limiter: (await import('@upstash/ratelimit')).Ratelimit.slidingWindow(5, '1 m'),
        analytics: true,
        prefix: 'ddos_protection',
      });

      const { success } = await ddosLimiter.limit(identifier);

      if (!success) {
        return NextResponse.json(
          {
            ok: false,
            error: 'Request blocked by DDoS protection',
            code: 'DDOS_BLOCKED',
          },
          { status: 429 },
        );
      }
    }

    return null;
  } catch (error) {
    console.error('DDoS protection error:', error);
    return null;
  }
}

// Export the main rate limiting function
export default enhancedRateLimitMiddleware;
