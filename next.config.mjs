/** @type {import('next').NextConfig} */
const nextConfig = {
  // safety net during build; real fix is dynamic rendering
  staticPageGenerationTimeout: 120,
  experimental: {}, // experimental features disabled for stability

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

  // Clerk proxy configuration
  async rewrites() {
    return [
      {
        source: '/clerk/:path*',
        destination: 'https://clerk.otaku-mori.com/:path*',
      },
    ];
  },

  // Security headers including CSP for Clerk
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self';",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://*.clerk.com https://*.clerkstage.dev;",
              'frame-src https://*.clerk.com https://*.clerkstage.dev;',
              "img-src 'self' data: blob: https:;",
              "style-src 'self' 'unsafe-inline' https:;",
              "connect-src 'self' https://*.clerk.com https://*.clerkstage.dev https://api.clerk.com;",
            ].join(' '),
          },
        ],
      },
    ];
  },
};
export default nextConfig;
