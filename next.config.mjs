import bundleAnalyzer from '@next/bundle-analyzer';
import { withSentryConfig } from '@sentry/nextjs';
import { env } from './env.mjs';

const withBundleAnalyzer = bundleAnalyzer({
  enabled: env.ANALYZE === 'true',
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  // safety net during build; real fix is dynamic rendering
  staticPageGenerationTimeout: 120,
  // Enable source maps for Edge Tools debugging
  productionBrowserSourceMaps: true,
  // Fix lockfile detection warning
  outputFileTracingRoot: process.cwd(),
  // Temporarily disable ESLint during build for deployment
  eslint: {
    ignoreDuringBuilds: true,
  },
  experimental: {
    optimizePackageImports: ['lucide-react', 'date-fns', 'framer-motion', '@radix-ui/react-icons'],
  },

  // Image optimization for Printify and CDN assets
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.printify.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '**.printify.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '**.clerk.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '**.cloudinary.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '**.vercel-blob.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '**.supabase.co',
        port: '',
        pathname: '/**',
      },
    ],
    formats: ['image/webp', 'image/avif'],
    minimumCacheTTL: 60,
  },

  // Production-grade security headers with enhanced CSP for all required domains
  async headers() {
    const isProd = env.NODE_ENV === 'production';

    const securityHeaders = [
      { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
      { key: 'X-Content-Type-Options', value: 'nosniff' },
      { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
    ];

    const cspCommon = [
      "default-src 'self'",
      "base-uri 'self'",
      "object-src 'none'",
      // Enhanced img-src for all required domains
      "img-src 'self' data: blob: https: https://*.vercel-storage.com https://*.printify.com https://*.clerk.com",
      "media-src 'self' data: blob:",
      // Enhanced font-src for Google Fonts
      "font-src 'self' data: https: https://fonts.gstatic.com",
      // Enhanced style-src for Google Fonts and inline styles
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      // Enhanced script-src for GTM and Clerk
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://clerk.otaku-mori.com https://www.googletagmanager.com https://www.google-analytics.com",
      // Enhanced worker-src for service workers and blob workers
      "worker-src 'self' blob:",
      "frame-ancestors 'self'",
    ];

    // Enhanced connect-src for production with all required domains
    const connectProd =
      "connect-src 'self' https: wss: " +
      // Clerk domains
      'https://clerk.otaku-mori.com https://accounts.otaku-mori.com https://api.clerk.com https://clerk-telemetry.com https://*.clerk-telemetry.com ' +
      // Printify domains
      'https://api.printify.com https://*.printify.com ' +
      // Vercel domains
      'https://*.vercel.app https://*.vercel-blob.com https://vitals.vercel-insights.com ' +
      // Analytics and monitoring
      'https://www.google-analytics.com https://www.googletagmanager.com ' +
      // Sentry
      'https://*.ingest.sentry.io https://o4509520271114240.ingest.us.sentry.io https://*.sentry.io https://sentry.io ' +
      // Other services
      'https://api.stripe.com https://maps.googleapis.com https://ydbhokoxqwqbtqqeibef.supabase.co https://*.upstash.io ' +
      // App domains
      'https://www.otaku-mori.com https://otaku-mori.com';

    // Enhanced connect-src for development/preview with additional local and preview domains
    const connectDev =
      "connect-src 'self' https: wss: ws: " +
      // Local development
      'ws://localhost:8787 ' +
      // Clerk domains (including dev)
      'https://clerk.otaku-mori.com https://*.clerk.accounts.dev https://api.clerk.com https://clerk-telemetry.com https://*.clerk-telemetry.com ' +
      // Printify domains
      'https://api.printify.com https://*.printify.com ' +
      // Vercel domains (including preview)
      'https://*.vercel.app https://*.vercel-blob.com https://vitals.vercel-insights.com ' +
      // Analytics and monitoring
      'https://www.google-analytics.com https://www.googletagmanager.com ' +
      // Sentry
      'https://*.ingest.sentry.io https://o4509520271114240.ingest.us.sentry.io https://*.sentry.io https://sentry.io ' +
      // Other services
      'https://api.stripe.com https://maps.googleapis.com https://ydbhokoxqwqbtqqeibef.supabase.co https://*.upstash.io';

    const csp = [...cspCommon, isProd ? connectProd : connectDev].join('; ');

    return [
      {
        source: '/(.*)',
        headers: [
          ...securityHeaders,
          { key: 'Content-Security-Policy', value: csp },
          { key: 'Permissions-Policy', value: 'geolocation=(), microphone=()' },
          ...(isProd ? [{ key: 'Cross-Origin-Opener-Policy', value: 'same-origin' }] : []),
        ],
      },
    ];
  },

  // PostHog rewrites for ingestion and assets
  async rewrites() {
    return [
      {
        source: '/ingest/static/:path*',
        destination: 'https://us-assets.i.posthog.com/static/:path*',
      },
      {
        source: '/ingest/:path*',
        destination: 'https://us.i.posthog.com/:path*',
      },
    ];
  },
  // This is required to support PostHog trailing slash API requests
  skipTrailingSlashRedirect: true,

  // Note: Babel configuration moved to babel.config.js for Next.js 15 compatibility

  // Webpack configuration to handle client/server module splitting and build performance
  webpack: (config, { isServer, webpack }) => {
    // Remove Sentry tracing code paths from bundles
    config.plugins.push(
      new webpack.DefinePlugin({
        __SENTRY_TRACING__: JSON.stringify(false),
      }),
    );

    // Reduce polyfills and giant blobs entering the cache
    config.resolve.fallback = { ...config.resolve.fallback, buffer: false };

    // Keep cache but avoid extra compression overhead
    config.cache = {
      type: 'filesystem',
      compression: false,
      store: 'pack',
    };

    if (!isServer) {
      // Alias server-only modules to false for client builds
      config.resolve.alias = {
        ...config.resolve.alias,
        'require-in-the-middle': false,
        '@sentry/node': false,
        '@prisma/instrumentation': false,
        ioredis: false,
        '@opentelemetry/instrumentation': false,
      };
    }
    return config;
  },
};

// Temporarily disable Sentry for development
export default withBundleAnalyzer(nextConfig);

// Uncomment below to re-enable Sentry when configuration is fixed
// export default withSentryConfig(withBundleAnalyzer(nextConfig), {
//   org: env.SENTRY_ORG || 'otaku-mori',
//   project: env.SENTRY_PROJECT || 'javascript-react',
//   // Pass the auth token
//   authToken: env.SENTRY_AUTH_TOKEN,
//   // Upload a larger set of source maps for prettier stack traces (increases build time)
//   widenClientFileUpload: true,
//   // Reduce noise if token is missing (no uploads)
//   silent: !env.SENTRY_AUTH_TOKEN,
//   // Disable Sentry plugin telemetry logs
//   telemetry: false,
//   // Sentry runtime config
//   tunnelRoute: '/monitoring', // helps bypass ad blockers
//   hideSourceMaps: true, // source maps still uploaded to Sentry
//   disableLogger: true,
// });
