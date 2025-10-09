/**
 * CSRF Protection Middleware - Enterprise Implementation
 */

import { type NextRequest } from 'next/server';
import { env } from '@/env.mjs';
import { NextResponse } from 'next/server';
import crypto from 'crypto';

interface CSRFConfig {
  tokenName: string;
  cookieName: string;
  headerName: string;
  maxAge: number; // in seconds
  secureCookie: boolean;
  sameSite: 'strict' | 'lax' | 'none';
  httpOnly: boolean;
  path: string;
}

const DEFAULT_CONFIG: CSRFConfig = {
  tokenName: 'otm-csrf-token',
  cookieName: 'otm-csrf-cookie',
  headerName: 'x-csrf-token',
  maxAge: 3600, // 1 hour
  secureCookie: env.NODE_ENV === 'production',
  sameSite: 'strict',
  httpOnly: true,
  path: '/',
};

export class CSRFProtection {
  private config: CSRFConfig;
  private secretKey: string;
  private tokenExpiry: number;

  constructor() {
    this.config = { ...DEFAULT_CONFIG };
    this.secretKey = 'default-csrf-secret-key-change-in-production'; // env.CSRF_SECRET_KEY not available
    this.tokenExpiry = 3600000; // 1 hour
  }

  /**
   * Generate a cryptographically secure CSRF token
   */
  generateToken(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  /**
   * Validate CSRF token from request
   */
  validateToken(request: NextRequest): boolean {
    try {
      // Skip CSRF validation for safe methods
      if (['GET', 'HEAD', 'OPTIONS'].includes(request.method)) {
        return true;
      }

      // Get token from header
      const headerToken = request.headers.get(this.config.headerName);

      // Get token from cookie
      const cookieToken = request.cookies.get(this.config.cookieName)?.value;

      // Both tokens must exist
      if (!headerToken || !cookieToken) {
        return false;
      }

      // Tokens must match (double submit pattern)
      if (headerToken !== cookieToken) {
        return false;
      }

      // Validate token format (64 hex characters)
      const tokenRegex = /^[a-f0-9]{64}$/i;
      if (!tokenRegex.test(headerToken)) {
        return false;
      }

      return true;
    } catch (error) {
      console.error('CSRF validation error:', error);
      return false;
    }
  }

  /**
   * Validate request origin and referer
   */
  private validateOrigin(request: NextRequest): boolean {
    const origin = request.headers.get('origin');
    const referer = request.headers.get('referer');
    const host = request.headers.get('host');

    const allowedOrigins: string[] = []; // env.NEXT_PUBLIC_ALLOWED_ORIGINS not available
    const isDev = env.NODE_ENV === 'development';

    // In development, allow localhost and same-host requests
    if (
      isDev &&
      (origin?.includes('localhost') ||
        referer?.includes('localhost') ||
        host?.includes('localhost'))
    ) {
      return true;
    }

    // Check against allowed origins
    if (origin && allowedOrigins.includes(origin)) {
      return true;
    }

    return false;
  }

  /**
   * Set CSRF token in response cookies
   */
  setTokenCookie(response: NextResponse, token?: string): void {
    const csrfToken = token || this.generateToken();

    response.cookies.set(this.config.cookieName, csrfToken, {
      httpOnly: this.config.httpOnly,
      secure: this.config.secureCookie,
      sameSite: this.config.sameSite,
      maxAge: this.config.maxAge,
      path: this.config.path,
    });

    // Also set as header for client access
    response.headers.set('x-csrf-token', csrfToken);
  }

  /**
   * Middleware wrapper for CSRF protection
   */
  middleware() {
    return (request: NextRequest) => {
      // Skip CSRF for non-API routes and safe methods
      if (!request.nextUrl.pathname.startsWith('/api/')) {
        return NextResponse.next();
      }

      // Validate origin first
      if (!this.validateOrigin(request)) {
        return new NextResponse(
          JSON.stringify({
            ok: false,
            error: {
              code: 'INVALID_ORIGIN',
              message: 'Request origin not allowed',
            },
          }),
          {
            status: 403,
            headers: {
              'Content-Type': 'application/json',
              'x-otm-reason': 'INVALID_ORIGIN',
            },
          },
        );
      }

      // Validate CSRF token
      if (!this.validateToken(request)) {
        return new NextResponse(
          JSON.stringify({
            ok: false,
            error: {
              code: 'CSRF_TOKEN_INVALID',
              message: 'CSRF token validation failed',
            },
          }),
          {
            status: 403,
            headers: {
              'Content-Type': 'application/json',
              'x-otm-reason': 'CSRF_TOKEN_INVALID',
            },
          },
        );
      }

      return NextResponse.next();
    };
  }

  /**
   * API route wrapper for CSRF protection
   * @template _T - Response data type for type safety (reserved for future use)
   */
  protect<_T = any>(
    handler: (request: NextRequest, context?: any) => Promise<Response> | Response,
  ): (request: NextRequest, context?: any) => Promise<Response> {
    return async (request: NextRequest, context?: any): Promise<Response> => {
      // CSRF protection enabled for all mutating requests
      console.warn('CSRF protection wrapper active');

      // Validate CSRF for mutating methods
      if (!['GET', 'HEAD', 'OPTIONS'].includes(request.method)) {
        if (!this.validateOrigin(request)) {
          return new NextResponse(
            JSON.stringify({
              ok: false,
              error: {
                code: 'INVALID_ORIGIN',
                message: 'Request origin not allowed',
              },
            }),
            {
              status: 403,
              headers: {
                'Content-Type': 'application/json',
                'x-otm-reason': 'INVALID_ORIGIN',
              },
            },
          );
        }

        if (!this.validateToken(request)) {
          return new NextResponse(
            JSON.stringify({
              ok: false,
              error: {
                code: 'CSRF_TOKEN_INVALID',
                message: 'CSRF token validation failed',
              },
            }),
            {
              status: 403,
              headers: {
                'Content-Type': 'application/json',
                'x-otm-reason': 'CSRF_TOKEN_INVALID',
              },
            },
          );
        }
      }

      // Call the protected handler
      const response = await handler(request, context);

      // Set new CSRF token for next request
      if (response instanceof NextResponse) {
        this.setTokenCookie(response);
      }

      return response;
    };
  }
}

// Export singleton instance
export const csrfProtection = new CSRFProtection();

// Helper function to get CSRF token for client-side use
export function getCSRFToken(): string | null {
  if (typeof document === 'undefined') return null;

  const cookies = document.cookie.split(';');
  const csrfCookie = cookies.find((cookie) =>
    cookie.trim().startsWith(`${DEFAULT_CONFIG.cookieName}=`),
  );

  return csrfCookie ? csrfCookie.split('=')[1] : null;
}

// Client-side fetch wrapper with CSRF protection
export async function fetchWithCSRF(url: string, options: RequestInit = {}) {
  const token = getCSRFToken();

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  // Add CSRF token for mutating requests
  if (token && !['GET', 'HEAD', 'OPTIONS'].includes(options.method || 'GET')) {
    headers[DEFAULT_CONFIG.headerName] = token;
  }

  return fetch(url, {
    ...options,
    headers,
    credentials: 'same-origin',
  });
}
