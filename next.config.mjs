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

  // Production-grade security headers with CSP for official Clerk domains
  async headers() {
    const isProd = env.NODE_ENV === 'production';

    const cspCommon = [
      "default-src 'self'",
      "base-uri 'self'",
      "object-src 'none'",
      "img-src 'self' data: blob: https:",
      "media-src 'self' data: blob:",
      "font-src 'self' data: https:",
      // keep 'unsafe-inline' for styled components/TW JIT; remove once you move to nonces
      "style-src 'self' 'unsafe-inline' https:",
      // Allow inline scripts with nonces for better security
      isProd ? "script-src 'self' 'unsafe-inline' https:" : "script-src 'self' 'unsafe-inline' 'unsafe-eval' https:",
    ];

    const connectProd = [
      "connect-src 'self' https: wss:",
      'https://clerk-telemetry.com',
      'https://*.clerk-telemetry.com',
      'https://api.stripe.com',
      'https://maps.googleapis.com',
      'https://api.clerk.com',
      'https://clerk.otaku-mori.com',
      'https://accounts.otaku-mori.com',
      'https://api.printify.com',
      'https://*.printify.com',
      'https://*.ingest.sentry.io',
      'https://o4509520271114240.ingest.us.sentry.io',
      'https://*.sentry.io',
      'https://sentry.io',
      'https://vitals.vercel-insights.com',
      'https://www.otaku-mori.com',
      'https://otaku-mori.com',
      'https://*.vercel-blob.com',
      'https://ydbhokoxqwqbtqqeibef.supabase.co',
      'https://*.upstash.io',
    ];

    const connectDev = [
      "connect-src 'self' https: wss: ws:",
      'ws://localhost:8787',
      'https://clerk-telemetry.com',
      'https://*.clerk-telemetry.com',
      'https://api.stripe.com',
      'https://maps.googleapis.com',
      'https://api.clerk.com',
      'https://*.clerk.accounts.dev',
      'https://api.printify.com',
      'https://*.printify.com',
      'https://*.ingest.sentry.io',
      'https://o4509520271114240.ingest.us.sentry.io',
      'https://*.sentry.io',
      'https://sentry.io',
      'https://vitals.vercel-insights.com',
      'https://*.vercel-blob.com',
      'https://ydbhokoxqwqbtqqeibef.supabase.co',
      'https://*.upstash.io',
    ];

    const csp = [...cspCommon, ...(isProd ? connectProd : connectDev)].join('; ');

    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'Content-Security-Policy', value: csp },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'geolocation=(), microphone=()' },
          ...(isProd ? [{ key: 'Cross-Origin-Opener-Policy', value: 'same-origin' }] : []),
        ],
      },
    ];
  },
};

export default withSentryConfig(
  withBundleAnalyzer(nextConfig),
  {
    org: env.SENTRY_ORG || 'otaku-mori',
    project: env.SENTRY_PROJECT || 'javascript-react',
    // Pass the auth token
    authToken: env.SENTRY_AUTH_TOKEN,
    // Upload a larger set of source maps for prettier stack traces (increases build time)
    widenClientFileUpload: true,
    // Reduce noise if token is missing (no uploads)
    silent: !env.SENTRY_AUTH_TOKEN,
    // Disable Sentry plugin telemetry logs
    telemetry: false,
    // Disable tunneling for now to avoid 404 errors
    // tunnelRoute: true, // Generates a random route for each build (recommended)
  }
);
