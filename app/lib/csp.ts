import { env } from "@/app/env";

const isDev = env.NODE_ENV !== "production";

export const contentSecurityPolicy = isDev
  ? {
      // Dev: allow Next's HMR chunks + eval, NO strict-dynamic
      strict: false,
      directives: {
        "script-src": ["'self'", "'unsafe-eval'", "'unsafe-inline'"],
        "connect-src": ["'self'", "ws:", "wss:", "https:"],
        "img-src": ["'self'", "data:", "blob:", "https:"],
        "style-src": ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
        "font-src": ["'self'", "data:", "https://fonts.gstatic.com"],
      },
    }
  : {
      // Prod: strict with nonces; DO NOT list Clerk CDN (we use proxy)
      strict: true,
      directives: {
        "script-src": ["'self'", "'strict-dynamic'"], // Next will attach nonces to its scripts
        "connect-src": [
          "'self'",
          "https:",
          env.NEXT_PUBLIC_CLERK_PROXY_URL,
          "https://api.printify.com",
          "https://*.sentry.io",
          "https://vitals.vercel-insights.com",
        ],
        "img-src": ["'self'", "https:", "data:", "blob:"],
        "style-src": ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
        "font-src": ["'self'", "data:", "https://fonts.gstatic.com"],
      },
    };
