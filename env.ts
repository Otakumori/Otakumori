import { z } from 'zod';

const server = z.object({
  DATABASE_URL: z.string().url(),
  DIRECT_URL: z.string().optional(),
  PRISMA_ACCELERATE_API_KEY: z.string().optional(),
  CLERK_SECRET_KEY: z.string(),
  CLERK_WEBHOOK_SECRET: z.string().optional(),
  CLERK_ENCRYPTION_KEY: z.string().optional(),
  STRIPE_SECRET_KEY: z.string(),
  STRIPE_WEBHOOK_SECRET: z.string().optional(),
  UPSTASH_REDIS_REST_URL: z.string().url().optional(),
  UPSTASH_REDIS_REST_TOKEN: z.string().optional(),
  BLOB_READ_WRITE_TOKEN: z.string().optional(),
  BLOB_READ_WRITE_URL: z.string().optional(),
  NODE_ENV: z.enum(['development', 'test', 'production']),
  NEXT_RUNTIME: z.enum(['nodejs', 'edge']).optional(),
  PRINTIFY_API_KEY: z.string().optional(),
  PRINTIFY_API_URL: z.string().optional(),
  PRINTIFY_SHOP_ID: z.string().optional(),
  PRINTIFY_WEBHOOK_SECRET: z.string().optional(),
  CRON_SECRET: z.string().optional(),
  INTERNAL_AUTH_TOKEN: z.string().optional(),
  API_KEY: z.string().optional(),
  PETAL_SALT: z.string().optional(),
  AUTH_SECRET: z.string().optional(),
  SENTRY_DSN: z.string().optional().default(''),
  SENTRY_AUTH_TOKEN: z.string().optional().default(''),
  SENTRY_SKIP_AUTO_RELEASE: z.string().optional().default('true'),
  RESEND_API_KEY: z.string().optional(),
  EMAIL_FROM: z.string().optional(),
  INNGEST_SERVE_URL: z.string().optional(),
  INNGEST_EVENT_KEY: z.string().optional(),
  INNGEST_SIGNING_KEY: z.string().optional(),
  INNGEST_PROBE: z.string().optional(),
  // EasyPost
  EASYPOST_API_KEY: z.string().optional(),
  EASYPOST_WEBHOOK_SECRET: z.string().optional(),
  // Shipping defaults
  DEFAULT_SHIP_FROM_NAME: z.string().optional(),
  DEFAULT_SHIP_FROM_STREET: z.string().optional(),
  DEFAULT_SHIP_FROM_CITY: z.string().optional(),
  DEFAULT_SHIP_FROM_STATE: z.string().optional(),
  DEFAULT_SHIP_FROM_ZIP: z.string().optional(),
  DEFAULT_SHIP_FROM_COUNTRY: z.string().optional(),
  // Vercel
  VERCEL_URL: z.string().optional(),
  VERCEL_ENVIRONMENT: z.string().optional(),
  // Sanity
  SANITY_WEBHOOK_SECRET: z.string().optional(),
  // Supabase (legacy, for migration)
  SUPABASE_SERVICE_ROLE_KEY: z.string().optional(),
  // Algolia
  ALGOLIA_ADMIN_API_KEY: z.string().optional(),
  ALGOLIA_INDEX_BLOG: z.string().optional(),
  ALGOLIA_INDEX_GAMES: z.string().optional(),
  ALGOLIA_INDEX_PAGES: z.string().optional(),
  // Blob storage
  BLOB_PUBLIC_BASE_URL: z.string().optional(),
  BLOB_BUCKET_PREFIX: z.string().optional(),
  // Adult Zone Feature Flags
  FEATURE_ADULT_ZONE: z.string().optional(),
  FEATURE_GATED_COSMETICS: z.string().optional(),
  FEATURE_AVATARS: z.string().optional(),
  FEATURE_AVATAR_STYLIZED_SHADERS: z.string().optional(),
  // Storage/CDN
  CLOUDINARY_CLOUD_NAME: z.string().optional(),
  CLOUDINARY_API_KEY: z.string().optional(),
  CLOUDINARY_API_SECRET: z.string().optional(),
  S3_ACCESS_KEY_ID: z.string().optional(),
  S3_SECRET_ACCESS_KEY: z.string().optional(),
  S3_BUCKET: z.string().optional(),
  S3_REGION: z.string().optional(),
  // Gated Content
  ADULTS_STORAGE_INDEX_URL: z.string().url().optional(),
});

const client = z.object({
  NEXT_PUBLIC_SITE_URL: z.string().url().optional(),
  NEXT_PUBLIC_APP_URL: z.string().url().optional(),
  NEXT_PUBLIC_CANONICAL_ORIGIN: z.string().optional(),
  NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: z.string().min(1),
  NEXT_PUBLIC_CLERK_SIGN_IN_URL: z.string().optional(),
  NEXT_PUBLIC_CLERK_SIGN_UP_URL: z.string().optional(),
  NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL: z.string().optional(),
  NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL: z.string().optional(),
  NEXT_PUBLIC_CLERK_DOMAIN: z.string().optional(),
  NEXT_PUBLIC_CLERK_IS_SATELLITE: z.string().optional(),
  NEXT_PUBLIC_CLERK_PROXY_URL: z.string().optional(),
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: z.string().optional(),
  NEXT_PUBLIC_DAILY_PETAL_LIMIT: z.string().optional(),
  NEXT_PUBLIC_VERCEL_ENVIRONMENT: z.string().optional(),
  NEXT_PUBLIC_GA_ID: z.string().optional(),
  NEXT_PUBLIC_GA_MEASUREMENT_ID: z.string().optional(),
  // Supabase (legacy)
  NEXT_PUBLIC_SUPABASE_URL: z.string().optional(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().optional(),
  // Stack
  NEXT_PUBLIC_STACK_PROJECT_ID: z.string().optional(),
  NEXT_PUBLIC_STACK_PUBLISHABLE_CLIENT_KEY: z.string().optional(),
  // PostHog
  NEXT_PUBLIC_POSTHOG_KEY: z.string().optional(),
  NEXT_PUBLIC_POSTHOG_HOST: z.string().optional(),
  // Sentry
  NEXT_PUBLIC_SENTRY_DSN: z.string().optional().default(''),
  // Algolia
  NEXT_PUBLIC_ALGOLIA_APP_ID: z.string().optional(),
  NEXT_PUBLIC_ALGOLIA_SEARCH_KEY: z.string().optional(),
  // Admin
  NEXT_PUBLIC_ADMIN_API_KEY: z.string().optional(),
  // App
  NEXT_PUBLIC_APP_VERSION: z.string().optional(),
  NEXT_PUBLIC_APP_ENV: z.string().optional(),
  // Community
  NEXT_PUBLIC_ENABLE_MOCK_COMMUNITY_WS: z.string().optional(),
  NEXT_PUBLIC_COMMUNITY_WS_URL: z.string().optional(),
  // Event
  NEXT_PUBLIC_EVENT_CODE: z.string().optional(),
  // Feature flags
  NEXT_PUBLIC_FEATURE_CUBE_HUB: z.string().optional(),
  NEXT_PUBLIC_FEATURE_PETALS_ABOUT: z.string().optional(),
  NEXT_PUBLIC_FEATURE_RUNE: z.enum(['on', 'off']).optional(),
  NEXT_PUBLIC_FEATURE_STARFIELD: z.enum(['on', 'off']),
  NEXT_PUBLIC_FEATURE_PETALS: z.enum(['on', 'off']).optional(),
  NEXT_PUBLIC_FEATURE_COMMUNITY_FACE2: z.string().optional(),
  NEXT_PUBLIC_FEATURE_CRT_CARD_ONLY: z.string().optional(),
  NEXT_PUBLIC_FEATURE_TRADE_PROPOSE: z.string().optional(),
  NEXT_PUBLIC_FEATURE_DIRTY_EMOTES: z.string().optional(),
  NEXT_PUBLIC_FEATURE_JIGGLE: z.string().optional(),
  NEXT_PUBLIC_FEATURE_EVENTS: z.string().optional(),
  NEXT_PUBLIC_FEATURE_GA_ENABLED: z.string().optional(),
  // Homepage feature flags
  NEXT_PUBLIC_FEATURE_HERO: z.string().optional(),
  NEXT_PUBLIC_FEATURE_PETALS_INTERACTIVE: z.string().optional(),
  NEXT_PUBLIC_FEATURE_SHOP: z.string().optional(),
  NEXT_PUBLIC_FEATURE_MINIGAMES: z.string().optional(),
  NEXT_PUBLIC_FEATURE_BLOG: z.string().optional(),
  NEXT_PUBLIC_FEATURE_SOAPSTONES: z.string().optional(),
  NEXT_PUBLIC_LIVE_DATA: z.string().optional(),
  NEXT_PUBLIC_PROBE_MODE: z.string().optional(),
});

const _server = server.safeParse(process.env);
if (!_server.success) {
  // Only crash on server at runtime (won't run in the browser)
  console.error(' Invalid server env:', _server.error.flatten().fieldErrors);
  process.exit(1);
}

const _client = client.safeParse({
  NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
  NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
  NEXT_PUBLIC_CANONICAL_ORIGIN: process.env.NEXT_PUBLIC_CANONICAL_ORIGIN,
  NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
  NEXT_PUBLIC_CLERK_SIGN_IN_URL: process.env.NEXT_PUBLIC_CLERK_SIGN_IN_URL,
  NEXT_PUBLIC_CLERK_SIGN_UP_URL: process.env.NEXT_PUBLIC_CLERK_SIGN_UP_URL,
  NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL: process.env.NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL,
  NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL: process.env.NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL,
  NEXT_PUBLIC_CLERK_DOMAIN: process.env.NEXT_PUBLIC_CLERK_DOMAIN,
  NEXT_PUBLIC_CLERK_IS_SATELLITE: process.env.NEXT_PUBLIC_CLERK_IS_SATELLITE,
  NEXT_PUBLIC_CLERK_PROXY_URL: process.env.NEXT_PUBLIC_CLERK_PROXY_URL,
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
  NEXT_PUBLIC_DAILY_PETAL_LIMIT: process.env.NEXT_PUBLIC_DAILY_PETAL_LIMIT,
  NEXT_PUBLIC_VERCEL_ENVIRONMENT: process.env.NEXT_PUBLIC_VERCEL_ENVIRONMENT,
  NEXT_PUBLIC_GA_ID: process.env.NEXT_PUBLIC_GA_ID,
  NEXT_PUBLIC_GA_MEASUREMENT_ID: process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID,
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  NEXT_PUBLIC_STACK_PROJECT_ID: process.env.NEXT_PUBLIC_STACK_PROJECT_ID,
  NEXT_PUBLIC_STACK_PUBLISHABLE_CLIENT_KEY: process.env.NEXT_PUBLIC_STACK_PUBLISHABLE_CLIENT_KEY,
  NEXT_PUBLIC_POSTHOG_KEY: process.env.NEXT_PUBLIC_POSTHOG_KEY,
  NEXT_PUBLIC_POSTHOG_HOST: process.env.NEXT_PUBLIC_POSTHOG_HOST,
  NEXT_PUBLIC_SENTRY_DSN: process.env.NEXT_PUBLIC_SENTRY_DSN,
  NEXT_PUBLIC_ALGOLIA_APP_ID: process.env.NEXT_PUBLIC_ALGOLIA_APP_ID,
  NEXT_PUBLIC_ALGOLIA_SEARCH_KEY: process.env.NEXT_PUBLIC_ALGOLIA_SEARCH_KEY,
  NEXT_PUBLIC_ADMIN_API_KEY: process.env.NEXT_PUBLIC_ADMIN_API_KEY,
  NEXT_PUBLIC_APP_VERSION: process.env.NEXT_PUBLIC_APP_VERSION,
  NEXT_PUBLIC_APP_ENV: process.env.NEXT_PUBLIC_APP_ENV,
  NEXT_PUBLIC_ENABLE_MOCK_COMMUNITY_WS: process.env.NEXT_PUBLIC_ENABLE_MOCK_COMMUNITY_WS,
  NEXT_PUBLIC_COMMUNITY_WS_URL: process.env.NEXT_PUBLIC_COMMUNITY_WS_URL,
  NEXT_PUBLIC_EVENT_CODE: process.env.NEXT_PUBLIC_EVENT_CODE,
  NEXT_PUBLIC_FEATURE_CUBE_HUB: process.env.NEXT_PUBLIC_FEATURE_CUBE_HUB,
  NEXT_PUBLIC_FEATURE_PETALS_ABOUT: process.env.NEXT_PUBLIC_FEATURE_PETALS_ABOUT,
  NEXT_PUBLIC_FEATURE_RUNE: process.env.NEXT_PUBLIC_FEATURE_RUNE,
  NEXT_PUBLIC_FEATURE_STARFIELD: process.env.NEXT_PUBLIC_FEATURE_STARFIELD,
  NEXT_PUBLIC_FEATURE_PETALS: process.env.NEXT_PUBLIC_FEATURE_PETALS,
  NEXT_PUBLIC_FEATURE_COMMUNITY_FACE2: process.env.NEXT_PUBLIC_FEATURE_COMMUNITY_FACE2,
  NEXT_PUBLIC_FEATURE_CRT_CARD_ONLY: process.env.NEXT_PUBLIC_FEATURE_CRT_CARD_ONLY,
  NEXT_PUBLIC_FEATURE_TRADE_PROPOSE: process.env.NEXT_PUBLIC_FEATURE_TRADE_PROPOSE,
  NEXT_PUBLIC_FEATURE_DIRTY_EMOTES: process.env.NEXT_PUBLIC_FEATURE_DIRTY_EMOTES,
  NEXT_PUBLIC_FEATURE_JIGGLE: process.env.NEXT_PUBLIC_FEATURE_JIGGLE,
  NEXT_PUBLIC_FEATURE_EVENTS: process.env.NEXT_PUBLIC_FEATURE_EVENTS,
  NEXT_PUBLIC_FEATURE_GA_ENABLED: process.env.NEXT_PUBLIC_FEATURE_GA_ENABLED,
  // Homepage feature flags
  NEXT_PUBLIC_FEATURE_HERO: process.env.NEXT_PUBLIC_FEATURE_HERO,
  NEXT_PUBLIC_FEATURE_PETALS_INTERACTIVE: process.env.NEXT_PUBLIC_FEATURE_PETALS_INTERACTIVE,
  NEXT_PUBLIC_FEATURE_SHOP: process.env.NEXT_PUBLIC_FEATURE_SHOP,
  NEXT_PUBLIC_FEATURE_MINIGAMES: process.env.NEXT_PUBLIC_FEATURE_MINIGAMES,
  NEXT_PUBLIC_FEATURE_BLOG: process.env.NEXT_PUBLIC_FEATURE_BLOG,
  NEXT_PUBLIC_FEATURE_SOAPSTONES: process.env.NEXT_PUBLIC_FEATURE_SOAPSTONES,
  NEXT_PUBLIC_LIVE_DATA: process.env.NEXT_PUBLIC_LIVE_DATA,
  NEXT_PUBLIC_PROBE_MODE: process.env.NEXT_PUBLIC_PROBE_MODE,
});

if (!_client.success) {
  console.warn(' Invalid client env:', _client.error.flatten().fieldErrors);
}

export const env = { ..._server.data, ..._client.data };
export type Env = typeof env;
