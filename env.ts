import { z } from 'zod';

const server = z.object({
  DATABASE_URL: z.string().url(),
  CLERK_SECRET_KEY: z.string(),
  CLERK_WEBHOOK_SECRET: z.string().optional(),
  STRIPE_SECRET_KEY: z.string(),
  STRIPE_WEBHOOK_SECRET: z.string().optional(),
  UPSTASH_REDIS_REST_URL: z.string().url().optional(),
  UPSTASH_REDIS_REST_TOKEN: z.string().optional(),
  BLOB_READ_WRITE_TOKEN: z.string().optional(),
  NODE_ENV: z.enum(['development', 'test', 'production']),
  NEXT_RUNTIME: z.enum(['nodejs', 'edge']).optional(),
  PRINTIFY_API_KEY: z.string().optional(),
  PRINTIFY_SHOP_ID: z.string().optional(),
  CRON_SECRET: z.string().optional(),
  INTERNAL_AUTH_TOKEN: z.string().optional(),
  SENTRY_DSN: z.string().optional(),
  SENTRY_AUTH_TOKEN: z.string().optional(),
  RESEND_API_KEY: z.string().optional(),
  EMAIL_FROM: z.string().optional(),
  INNGEST_SERVE_URL: z.string().url().optional(),
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
  NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: z.string().min(1),
  NEXT_PUBLIC_CLERK_SIGN_IN_URL: z.string().optional(),
  NEXT_PUBLIC_CLERK_SIGN_UP_URL: z.string().optional(),
  NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL: z.string().optional(),
  NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL: z.string().optional(),
  NEXT_PUBLIC_CLERK_DOMAIN: z.string().optional(),
  NEXT_PUBLIC_CLERK_IS_SATELLITE: z.string().optional(),
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: z.string().optional(),
  NEXT_PUBLIC_DAILY_PETAL_LIMIT: z.string().optional(),
  NEXT_PUBLIC_VERCEL_ENVIRONMENT: z.string().optional(),
  NEXT_PUBLIC_GA_ID: z.string().optional(),
  NEXT_PUBLIC_FEATURE_CUBE_HUB: z.string().optional(),
  NEXT_PUBLIC_FEATURE_PETALS_ABOUT: z.string().optional(),
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
  NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
  NEXT_PUBLIC_CLERK_SIGN_IN_URL: process.env.NEXT_PUBLIC_CLERK_SIGN_IN_URL,
  NEXT_PUBLIC_CLERK_SIGN_UP_URL: process.env.NEXT_PUBLIC_CLERK_SIGN_UP_URL,
  NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL: process.env.NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL,
  NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL: process.env.NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL,
  NEXT_PUBLIC_CLERK_DOMAIN: process.env.NEXT_PUBLIC_CLERK_DOMAIN,
  NEXT_PUBLIC_CLERK_IS_SATELLITE: process.env.NEXT_PUBLIC_CLERK_IS_SATELLITE,
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
  NEXT_PUBLIC_DAILY_PETAL_LIMIT: process.env.NEXT_PUBLIC_DAILY_PETAL_LIMIT,
  NEXT_PUBLIC_VERCEL_ENVIRONMENT: process.env.NEXT_PUBLIC_VERCEL_ENVIRONMENT,
  NEXT_PUBLIC_GA_ID: process.env.NEXT_PUBLIC_GA_ID,
  NEXT_PUBLIC_FEATURE_CUBE_HUB: process.env.NEXT_PUBLIC_FEATURE_CUBE_HUB,
  NEXT_PUBLIC_FEATURE_PETALS_ABOUT: process.env.NEXT_PUBLIC_FEATURE_PETALS_ABOUT,
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
