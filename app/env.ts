import { z } from 'zod';

const EnvSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']),
  // Site URLs
  NEXT_PUBLIC_SITE_URL: z.string().url().optional(),
  NEXT_PUBLIC_APP_URL: z.string().url().optional(),
  // Clerk (proxy mode)
  NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: z.string().min(10),
  CLERK_SECRET_KEY: z.string().min(10),
  NEXT_PUBLIC_CLERK_PROXY_URL: z.string().url(),
  CLERK_PROXY_URL: z.string().url(),
  // Optional Clerk URLs
  NEXT_PUBLIC_CLERK_SIGN_IN_URL: z.string().optional(),
  NEXT_PUBLIC_CLERK_SIGN_UP_URL: z.string().optional(),
  NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL: z.string().optional(),
  NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL: z.string().optional(),
  NEXT_PUBLIC_CLERK_DOMAIN: z.string().optional(),
  NEXT_PUBLIC_CLERK_IS_SATELLITE: z.string().optional(),
  // Stripe
  STRIPE_SECRET_KEY: z.string().min(10),
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: z.string().min(10),
  // Printify
  PRINTIFY_API_URL: z.string().url(),
  PRINTIFY_API_KEY: z.string().min(10),
  PRINTIFY_SHOP_ID: z.string().min(1),
  // UI rune glyph style preference (client-side); optional
  NEXT_PUBLIC_RUNE_GLYPH_STYLE: z.enum(['emoji', 'material', 'auto']).optional(),
  // Feature flags
  NEXT_PUBLIC_FEATURE_COMMUNITY_FACE2: z.string().optional(),
  NEXT_PUBLIC_FEATURE_CRT_CARD_ONLY: z.string().optional(),
  NEXT_PUBLIC_FEATURE_TRADE_PROPOSE: z.string().optional(),
  NEXT_PUBLIC_FEATURE_DIRTY_EMOTES: z.string().optional(),
  NEXT_PUBLIC_FEATURE_JIGGLE: z.string().optional(),
  NEXT_PUBLIC_FEATURE_EVENTS: z.string().optional(),
  NEXT_PUBLIC_FEATURE_PERF_MODULE: z.string().optional(),
  // Audio and WebSocket settings
  NEXT_PUBLIC_ENABLE_AUDIO: z.string().optional(),
  NEXT_PUBLIC_ENABLE_MOCK_COMMUNITY_WS: z.string().optional(),
  NEXT_PUBLIC_COMMUNITY_WS_URL: z.string().optional(),
  // Admin API
  NEXT_PUBLIC_ADMIN_API_KEY: z.string().optional(),
  NEXT_PUBLIC_API_KEY: z.string().optional(),
  // Inngest
  INNGEST_EVENT_KEY: z.string().optional(),
  INNGEST_SIGNING_KEY: z.string().optional(),
  INNGEST_PROBE: z.string().optional(),
  INNGEST_SERVE_URL: z.string().optional(),
  // Next.js
  NEXT_RUNTIME: z.string().optional(),
  // Petals
  NEXT_PUBLIC_PETAL_COLOR_OVERRIDE: z.string().optional(),
  // App Environment
  NEXT_PUBLIC_APP_ENV: z.string().optional(),
  NEXT_PHASE: z.string().optional(),
  // Feature Flags
  NEXT_PUBLIC_FLAGS_PUBLIC_KEY: z.string().optional(),
  FEATURE_FLAG_PROVIDER: z.string().optional(),
  // Storage
  ADULTS_STORAGE_INDEX_URL: z.string().optional(),
});

export const env = EnvSchema.parse({
  NODE_ENV: process.env.NODE_ENV,
  // Site URLs
  NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
  NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
  // Clerk (proxy mode)
  NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
  CLERK_SECRET_KEY: process.env.CLERK_SECRET_KEY,
  NEXT_PUBLIC_CLERK_PROXY_URL: process.env.NEXT_PUBLIC_CLERK_PROXY_URL,
  CLERK_PROXY_URL: process.env.CLERK_PROXY_URL,
  // Optional Clerk URLs
  NEXT_PUBLIC_CLERK_SIGN_IN_URL: process.env.NEXT_PUBLIC_CLERK_SIGN_IN_URL,
  NEXT_PUBLIC_CLERK_SIGN_UP_URL: process.env.NEXT_PUBLIC_CLERK_SIGN_UP_URL,
  NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL: process.env.NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL,
  NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL: process.env.NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL,
  NEXT_PUBLIC_CLERK_DOMAIN: process.env.NEXT_PUBLIC_CLERK_DOMAIN,
  NEXT_PUBLIC_CLERK_IS_SATELLITE: process.env.NEXT_PUBLIC_CLERK_IS_SATELLITE,
  // Stripe
  STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
  // Printify
  PRINTIFY_API_URL: process.env.PRINTIFY_API_URL,
  PRINTIFY_API_KEY: process.env.PRINTIFY_API_KEY,
  PRINTIFY_SHOP_ID: process.env.PRINTIFY_SHOP_ID,
  NEXT_PUBLIC_RUNE_GLYPH_STYLE: process.env.NEXT_PUBLIC_RUNE_GLYPH_STYLE as any,
  NEXT_PUBLIC_FEATURE_COMMUNITY_FACE2: process.env.NEXT_PUBLIC_FEATURE_COMMUNITY_FACE2,
  NEXT_PUBLIC_FEATURE_CRT_CARD_ONLY: process.env.NEXT_PUBLIC_FEATURE_CRT_CARD_ONLY,
  NEXT_PUBLIC_FEATURE_TRADE_PROPOSE: process.env.NEXT_PUBLIC_FEATURE_TRADE_PROPOSE,
  NEXT_PUBLIC_FEATURE_DIRTY_EMOTES: process.env.NEXT_PUBLIC_FEATURE_DIRTY_EMOTES,
  NEXT_PUBLIC_FEATURE_JIGGLE: process.env.NEXT_PUBLIC_FEATURE_JIGGLE,
  NEXT_PUBLIC_FEATURE_EVENTS: process.env.NEXT_PUBLIC_FEATURE_EVENTS,
  NEXT_PUBLIC_FEATURE_PERF_MODULE: process.env.NEXT_PUBLIC_FEATURE_PERF_MODULE,
  // Audio and WebSocket settings
  NEXT_PUBLIC_ENABLE_AUDIO: process.env.NEXT_PUBLIC_ENABLE_AUDIO,
  NEXT_PUBLIC_ENABLE_MOCK_COMMUNITY_WS: process.env.NEXT_PUBLIC_ENABLE_MOCK_COMMUNITY_WS,
  NEXT_PUBLIC_COMMUNITY_WS_URL: process.env.NEXT_PUBLIC_COMMUNITY_WS_URL,
  // Admin API
  NEXT_PUBLIC_ADMIN_API_KEY: process.env.NEXT_PUBLIC_ADMIN_API_KEY,
  NEXT_PUBLIC_API_KEY: process.env.NEXT_PUBLIC_API_KEY,
  // Inngest
  INNGEST_EVENT_KEY: process.env.INNGEST_EVENT_KEY,
  INNGEST_SIGNING_KEY: process.env.INNGEST_SIGNING_KEY,
  INNGEST_PROBE: process.env.INNGEST_PROBE,
  INNGEST_SERVE_URL: process.env.INNGEST_SERVE_URL,
  // Next.js
  NEXT_RUNTIME: process.env.NEXT_RUNTIME,
  // Petals
  NEXT_PUBLIC_PETAL_COLOR_OVERRIDE: process.env.NEXT_PUBLIC_PETAL_COLOR_OVERRIDE,
  // App Environment
  NEXT_PUBLIC_APP_ENV: process.env.NEXT_PUBLIC_APP_ENV,
  NEXT_PHASE: process.env.NEXT_PHASE,
  // Feature Flags
  NEXT_PUBLIC_FLAGS_PUBLIC_KEY: process.env.NEXT_PUBLIC_FLAGS_PUBLIC_KEY,
  FEATURE_FLAG_PROVIDER: process.env.FEATURE_FLAG_PROVIDER,
  // Storage
  ADULTS_STORAGE_INDEX_URL: process.env.ADULTS_STORAGE_INDEX_URL,
});
