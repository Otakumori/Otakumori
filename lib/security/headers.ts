/**
 * Security Headers Configuration - Enterprise Implementation
 */

import { type NextRequest, NextResponse } from 'next/server';
import { env } from '@/env.mjs';

interface SecurityHeadersConfig {
  contentSecurityPolicy?: string | CSPConfig;
  strictTransportSecurity?: string | HSTSConfig;
  frameOptions?: 'DENY' | 'SAMEORIGIN' | string;
  contentTypeOptions?: boolean;
  referrerPolicy?: string;
  crossOriginEmbedderPolicy?: string;
  crossOriginOpenerPolicy?: string;
  crossOriginResourcePolicy?: string;
  permissionsPolicy?: string;
  customHeaders?: Record<string, string>;
}

interface CSPConfig {
  defaultSrc?: string[];
  scriptSrc?: string[];
  styleSrc?: string[];
  imgSrc?: string[];
  connectSrc?: string[];
  fontSrc?: string[];
  objectSrc?: string[];
  mediaSrc?: string[];
  frameSrc?: string[];
  childSrc?: string[];
  workerSrc?: string[];
  manifestSrc?: string[];
  prefetchSrc?: string[];
  formAction?: string[];
  upgradeInsecureRequests?: boolean;
  blockAllMixedContent?: boolean;
  requireTrustedTypesFor?: string[];
  trustedTypes?: string[];
  reportUri?: string;
  reportTo?: string;
}

interface HSTSConfig {
  maxAge: number;
  includeSubDomains?: boolean;
  preload?: boolean;
}

// Production CSP configuration
const PRODUCTION_CSP: CSPConfig = {
  defaultSrc: ["'self'"],
  scriptSrc: [
    "'self'",
    "'unsafe-inline'", // Required for Next.js
    "'unsafe-eval'", // Required for development
    'https://www.googletagmanager.com',
    'https://www.google-analytics.com',
    'https://va.vercel-scripts.com',
    'https://vitals.vercel-analytics.com',
    'https://js.clerk.dev',
    'https://clerk.otaku-mori.com',
  ],
  styleSrc: [
    "'self'",
    "'unsafe-inline'", // Required for CSS-in-JS
    'https://fonts.googleapis.com',
  ],
  imgSrc: [
    "'self'",
    'data:',
    'blob:',
    'https:',
    'https://images.clerk.dev',
    'https://img.clerk.com',
    'https://www.gravatar.com',
    'https://avatars.githubusercontent.com',
    'https://lh3.googleusercontent.com',
    'https://platform-lookaside.fbsbx.com',
    'https://www.google-analytics.com',
    'https://ssl.gstatic.com',
    'https://www.gstatic.com',
  ],
  connectSrc: [
    "'self'",
    'https://api.clerk.dev',
    'https://clerk.otaku-mori.com',
    'https://www.google-analytics.com',
    'https://analytics.google.com',
    'https://www.googletagmanager.com',
    'https://vitals.vercel-analytics.com',
    'https://vercel.live',
    'wss://ws-us3.pusher.com', // For real-time features
  ],
  fontSrc: ["'self'", 'data:', 'https://fonts.gstatic.com', 'https://fonts.googleapis.com'],
  objectSrc: ["'none'"],
  mediaSrc: ["'self'", 'data:', 'blob:'],
  frameSrc: [
    "'self'",
    'https://js.clerk.dev',
    'https://accounts.google.com',
    'https://www.facebook.com',
    'https://www.youtube.com',
  ],
  childSrc: ["'self'", 'blob:'],
  workerSrc: ["'self'", 'blob:'],
  manifestSrc: ["'self'"],
  formAction: ["'self'"],
  upgradeInsecureRequests: true,
  blockAllMixedContent: false, // Allow mixed content for development
  requireTrustedTypesFor: ["'script'"],
  trustedTypes: ['default', 'nextjs'],
  reportUri: '/api/v1/security/csp-report',
};

// Development CSP (more permissive)
const DEVELOPMENT_CSP: CSPConfig = {
  defaultSrc: ["'self'"],
  scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'", 'https:', 'http:'],
  styleSrc: ["'self'", "'unsafe-inline'", 'https:', 'http:'],
  imgSrc: ["'self'", 'data:', 'blob:', 'https:', 'http:'],
  connectSrc: ["'self'", 'https:', 'http:', 'ws:', 'wss:'],
  fontSrc: ["'self'", 'data:', 'https:', 'http:'],
  objectSrc: ["'none'"],
  mediaSrc: ["'self'", 'data:', 'blob:', 'https:', 'http:'],
  frameSrc: ["'self'", 'https:', 'http:'],
  childSrc: ["'self'", 'blob:'],
  workerSrc: ["'self'", 'blob:'],
  manifestSrc: ["'self'"],
  formAction: ["'self'"],
};

const DEFAULT_CONFIG: SecurityHeadersConfig = {
  contentSecurityPolicy: env.NODE_ENV === 'production' ? PRODUCTION_CSP : DEVELOPMENT_CSP,
  strictTransportSecurity: {
    maxAge: 31536000, // 1 year
    includeSubDomains: true,
    preload: true,
  },
  frameOptions: 'SAMEORIGIN',
  contentTypeOptions: true,
  referrerPolicy: 'strict-origin-when-cross-origin',
  crossOriginEmbedderPolicy: 'unsafe-none', // Required for some third-party integrations
  crossOriginOpenerPolicy: 'same-origin-allow-popups', // Required for OAuth
  crossOriginResourcePolicy: 'cross-origin',
  permissionsPolicy: [
    'camera=()',
    'microphone=()',
    'geolocation=()',
    'interest-cohort=()', // Disable FLoC
    'payment=self',
    'usb=()',
    'bluetooth=()',
    'accelerometer=()',
    'gyroscope=()',
    'magnetometer=()',
  ].join(', '),
};

// Export wrapper function for API routes
export const withSecurityHeaders = (handler: Function) => {
  return async (req: any, context?: any) => {
    const response = await handler(req, context);

    // Get environment info
    const isDev = env.NODE_ENV === 'development';
    const appUrl = env.NEXT_PUBLIC_APP_URL || 'https://localhost:3000';

    // Add security headers
    if (response instanceof Response) {
      const headers = new Headers(response.headers);

      // Basic security headers
      headers.set('X-Content-Type-Options', 'nosniff');
      headers.set('X-Frame-Options', 'DENY');
      headers.set('X-XSS-Protection', '1; mode=block');
      headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');

      // CSP header (simplified for compatibility)
      if (!isDev) {
        headers.set(
          'Content-Security-Policy',
          "default-src 'self'; img-src 'self' data: https:; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline';",
        );
      }

      return new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers,
      });
    }

    return response;
  };
};

export class SecurityHeaders {
  private config: SecurityHeadersConfig;

  constructor(config: Partial<SecurityHeadersConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Build Content Security Policy string from config
   */
  private buildCSP(csp: CSPConfig): string {
    const directives: string[] = [];

    // Helper function to build directive
    const addDirective = (name: string, values: string[] | undefined) => {
      if (values && values.length > 0) {
        directives.push(`${name} ${values.join(' ')}`);
      }
    };

    addDirective('default-src', csp.defaultSrc);
    addDirective('script-src', csp.scriptSrc);
    addDirective('style-src', csp.styleSrc);
    addDirective('img-src', csp.imgSrc);
    addDirective('connect-src', csp.connectSrc);
    addDirective('font-src', csp.fontSrc);
    addDirective('object-src', csp.objectSrc);
    addDirective('media-src', csp.mediaSrc);
    addDirective('frame-src', csp.frameSrc);
    addDirective('child-src', csp.childSrc);
    addDirective('worker-src', csp.workerSrc);
    addDirective('manifest-src', csp.manifestSrc);
    addDirective('prefetch-src', csp.prefetchSrc);
    addDirective('form-action', csp.formAction);

    if (csp.upgradeInsecureRequests) {
      directives.push('upgrade-insecure-requests');
    }

    if (csp.blockAllMixedContent) {
      directives.push('block-all-mixed-content');
    }

    addDirective('require-trusted-types-for', csp.requireTrustedTypesFor);
    addDirective('trusted-types', csp.trustedTypes);

    if (csp.reportUri) {
      directives.push(`report-uri ${csp.reportUri}`);
    }

    if (csp.reportTo) {
      directives.push(`report-to ${csp.reportTo}`);
    }

    return directives.join('; ');
  }

  /**
   * Build HSTS header string from config
   */
  private buildHSTS(hsts: HSTSConfig): string {
    let header = `max-age=${hsts.maxAge}`;

    if (hsts.includeSubDomains) {
      header += '; includeSubDomains';
    }

    if (hsts.preload) {
      header += '; preload';
    }

    return header;
  }

  /**
   * Apply security headers to response
   */
  apply(response: any, request?: NextRequest): any {
    // Changed NextResponse to any to match new_code
    // Content Security Policy
    if (this.config.contentSecurityPolicy) {
      const csp =
        typeof this.config.contentSecurityPolicy === 'string'
          ? this.config.contentSecurityPolicy
          : this.buildCSP(this.config.contentSecurityPolicy);

      response.headers.set('Content-Security-Policy', csp);
    }

    // Strict Transport Security (HTTPS only)
    if (this.config.strictTransportSecurity && env.NODE_ENV === 'production') {
      const hsts =
        typeof this.config.strictTransportSecurity === 'string'
          ? this.config.strictTransportSecurity
          : this.buildHSTS(this.config.strictTransportSecurity);

      response.headers.set('Strict-Transport-Security', hsts);
    }

    // X-Frame-Options
    if (this.config.frameOptions) {
      response.headers.set('X-Frame-Options', this.config.frameOptions);
    }

    // X-Content-Type-Options
    if (this.config.contentTypeOptions) {
      response.headers.set('X-Content-Type-Options', 'nosniff');
    }

    // Referrer Policy
    if (this.config.referrerPolicy) {
      response.headers.set('Referrer-Policy', this.config.referrerPolicy);
    }

    // Cross-Origin Embedder Policy
    if (this.config.crossOriginEmbedderPolicy) {
      response.headers.set('Cross-Origin-Embedder-Policy', this.config.crossOriginEmbedderPolicy);
    }

    // Cross-Origin Opener Policy
    if (this.config.crossOriginOpenerPolicy) {
      response.headers.set('Cross-Origin-Opener-Policy', this.config.crossOriginOpenerPolicy);
    }

    // Cross-Origin Resource Policy
    if (this.config.crossOriginResourcePolicy) {
      response.headers.set('Cross-Origin-Resource-Policy', this.config.crossOriginResourcePolicy);
    }

    // Permissions Policy
    if (this.config.permissionsPolicy) {
      response.headers.set('Permissions-Policy', this.config.permissionsPolicy);
    }

    // X-XSS-Protection (legacy, but still useful)
    response.headers.set('X-XSS-Protection', '1; mode=block');

    // X-DNS-Prefetch-Control
    response.headers.set('X-DNS-Prefetch-Control', 'on');

    // Custom headers
    if (this.config.customHeaders) {
      Object.entries(this.config.customHeaders).forEach(([name, value]) => {
        response.headers.set(name, value);
      });
    }

    // Security-related headers for API responses
    if (request?.nextUrl.pathname.startsWith('/api/')) {
      response.headers.set('X-Content-Type-Options', 'nosniff');
      response.headers.set('X-Frame-Options', 'DENY');
      response.headers.set(
        'Cache-Control',
        'no-store, no-cache, must-revalidate, proxy-revalidate',
      );
      response.headers.set('Pragma', 'no-cache');
      response.headers.set('Expires', '0');
    }

    return response;
  }

  /**
   * Middleware wrapper for security headers
   */
  middleware() {
    return (request: NextRequest) => {
      const response = NextResponse.next();
      return this.apply(response, request);
    };
  }

  /**
   * Add emergency CSP bypass for specific routes (use sparingly)
   */
  addCSPBypass(routes: string[], directive: string, values: string[]) {
    if (typeof this.config.contentSecurityPolicy === 'object') {
      // This would require route-specific CSP logic
      // For now, log a warning
      console.warn('CSP bypass requested for routes:', routes, directive, values);
    }
  }

  /**
   * Get current CSP configuration
   */
  getCSPConfig(): CSPConfig | string | undefined {
    return this.config.contentSecurityPolicy;
  }

  /**
   * Update CSP configuration
   */
  updateCSP(updates: Partial<CSPConfig>) {
    if (typeof this.config.contentSecurityPolicy === 'object') {
      this.config.contentSecurityPolicy = {
        ...this.config.contentSecurityPolicy,
        ...updates,
      };
    }
  }
}

// Export singleton instance
export const securityHeaders = new SecurityHeaders();

// Helper function to create CSP report endpoint
export function createCSPReportHandler() {
  return async (request: NextRequest) => {
    try {
      const report = await request.json();

      // Log CSP violations for monitoring
      console.error('CSP Violation Report:', {
        timestamp: new Date().toISOString(),
        userAgent: request.headers.get('user-agent'),
        ip: request.headers.get('x-forwarded-for'),
        report,
      });

      // You could also send to external monitoring service
      // await sendToMonitoringService(report);

      return new NextResponse('OK', { status: 200 });
    } catch (error) {
      console.error('CSP report parsing error:', error);
      return new NextResponse('Bad Request', { status: 400 });
    }
  };
}

// Helper function to validate CSP configuration
export function validateCSPConfig(csp: CSPConfig): string[] {
  const warnings: string[] = [];

  if (csp.scriptSrc?.includes("'unsafe-eval'")) {
    warnings.push("CSP allows 'unsafe-eval' which may pose security risks");
  }

  if (csp.scriptSrc?.includes("'unsafe-inline'")) {
    warnings.push("CSP allows 'unsafe-inline' scripts which may pose security risks");
  }

  if (csp.styleSrc?.includes("'unsafe-inline'")) {
    warnings.push("CSP allows 'unsafe-inline' styles which may pose security risks");
  }

  if (!csp.objectSrc || !csp.objectSrc.includes("'none'")) {
    warnings.push("CSP should set object-src to 'none' to prevent Flash/plugin exploits");
  }

  if (!csp.upgradeInsecureRequests && env.NODE_ENV === 'production') {
    warnings.push("CSP should include 'upgrade-insecure-requests' in production");
  }

  return warnings;
}
