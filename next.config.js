// next.config.js
const isProd = process.env.NODE_ENV === 'production';

// Common bits (kept from your current policy)
const cspCommon = [
  "default-src 'self'",
  "base-uri 'self'",
  "object-src 'none'",
  "img-src 'self' data: blob: https:",
  "media-src 'self' data: blob:",
  "font-src 'self' data: https:",
  // keep 'unsafe-inline' for styled components/TW JIT; remove once you move to nonces
  "style-src 'self' 'unsafe-inline' https:",
  // Next dev needs eval; we drop it in prod
  isProd
    ? "script-src 'self' https:"
    : "script-src 'self' 'unsafe-inline' 'unsafe-eval' https:",
];

// === CONNECT-SRC ===
// Start from what you posted and add what's actually needed.
// Dev adds ws: and localhost:8787; Prod allows wss: but not ws://localhost.
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
  // add any backend you call in prod (examples):
  'https://ydbhokoxqwqbtqqeibef.supabase.co',
  'https://*.upstash.io',
];

const connectDev = [
  "connect-src 'self' https: wss: ws:",
  'ws://localhost:8787', // <-- your mock ws
  // same services in dev/preview:
  'https://clerk-telemetry.com',
  'https://*.clerk-telemetry.com',
  'https://api.stripe.com',
  'https://maps.googleapis.com',
  'https://api.clerk.com',
  'https://*.clerk.accounts.dev', // if you ever use Clerk dev instance
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

const csp = [
  ...cspCommon,
  ...(isProd ? connectProd : connectDev),
].join('; ');

/** @type {import('next').NextConfig} */
const nextConfig = {
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'Content-Security-Policy', value: csp },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
          { key: 'Cross-Origin-Opener-Policy', value: 'same-origin' },
        ],
      },
    ];
  },
};

module.exports = nextConfig;

