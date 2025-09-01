import bundleAnalyzer from '@next/bundle-analyzer';

const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  // safety net during build; real fix is dynamic rendering
  staticPageGenerationTimeout: 120,
  experimental: {
    optimizePackageImports: [
      'lucide-react',
      'date-fns',
      'framer-motion',
      '@radix-ui/react-icons',
    ],
  },

  // Image optimization for Printify and CDN assets
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.printify.com',
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
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self';",
              // Allow inline for Next hydration and small inlined chunks; keep 'unsafe-eval' only if needed for dev tooling
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://*.clerk.com https://*.clerkstage.dev https://*.jsdelivr.net;",
              // Fetch/XHR/SSE/WebSocket
              "connect-src 'self' https://*.clerk.com https://*.clerkstage.dev https://api.clerk.com https://api.printify.com https://*.ingest.sentry.io wss://*.clerk.com https://vitals.vercel-insights.com;",
              // Styles and fonts
              "style-src 'self' 'unsafe-inline' https://*.clerk.com https://*.clerkstage.dev https://fonts.googleapis.com;",
              "font-src 'self' data: https://*.clerk.com https://fonts.gstatic.com https://fonts.googleapis.com;",
              // Images, including data/blobs and Clerk assets
              "img-src 'self' data: blob: https://*.clerk.com https://*.printify.com https://*.cloudinary.com https://*.vercel-blob.com https:;",
              // Media (if you stream or load video/audio)
              "media-src 'self' blob:;",
              // Frames (if you ever embed Clerk or other auth iframes)
              "frame-src 'self' https://*.clerk.com https://*.clerkstage.dev;",
              // Workers
              "worker-src 'self' blob:;",
              // Disallow others from iframing your app
              "frame-ancestors 'self';",
              // Strict transport, no mixed content
              "upgrade-insecure-requests;",
            ].join(' '),
          },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          { key: 'X-XSS-Protection', value: '0' }, // modern browsers use CSP
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
        ],
      },
    ];
  },
};

export default withBundleAnalyzer(nextConfig);
