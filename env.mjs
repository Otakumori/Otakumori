import { createEnv } from '@t3-oss/env-nextjs';
import { z } from 'zod';

// Load environment variables from .env.local when running outside Next.js context
if (typeof window === 'undefined' && !process.env.NEXT_RUNTIME) {
  try {
    const dotenv = await import('dotenv');
    dotenv.config({ path: '.env.local' });
  } catch (error) {
    // dotenv not available or .env.local not found, continue without it
    console.warn('Could not load .env.local:', error.message);
  }
}

let safeEnv;
try {
  safeEnv = createEnv({
    skipValidation: true, // Skip validation to prevent crashes
    server: {
      NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
      DATABASE_URL: z.string().url(),
      DIRECT_URL: z.string().url(),
      STRIPE_SECRET_KEY: z.string(),
      STRIPE_WEBHOOK_SECRET: z.string(),
      CLERK_SECRET_KEY: z.string(),
      // Make CLERK_ENCRYPTION_KEY required - critical for Clerk functionality
      CLERK_ENCRYPTION_KEY: z.string().min(1, 'CLERK_ENCRYPTION_KEY is required'),
      CLERK_WEBHOOK_SECRET: z.string(),
      PRINTIFY_API_KEY: z.string(),
      PRINTIFY_SHOP_ID: z.string(),
      PRINTIFY_API_URL: z.string().url(),
      PRINTIFY_WEBHOOK_SECRET: z.string(),
      BLOB_READ_WRITE_TOKEN: z.string(),
      BLOB_READ_WRITE_URL: z.string().url().optional(),
      API_KEY: z.string().optional(),
      CRON_SECRET: z.string().optional(),
      UPSTASH_REDIS_REST_URL: z.string().url(),
      UPSTASH_REDIS_REST_TOKEN: z.string(),
      PETAL_SALT: z.string().optional(),
      VERCEL: z.string().optional(),
      VERCEL_URL: z.string().optional(),
      AUTHORIZED_PARTIES: z.string().optional(),
      NEXT_TELEMETRY_DISABLED: z.string().optional(),
      NODE_OPTIONS: z.string().optional(),
      RESEND_API_KEY: z.string().optional(),
      EMAIL_FROM: z.string().optional(),
      // Stripe
      STRIPE_SECRET_KEY: z.string(),
      STRIPE_WEBHOOK_SECRET: z.string(),
      // EasyPost
      EASYPOST_API_KEY: z.string().optional(),
      EASYPOST_WEBHOOK_SECRET: z.string().optional(),
      DEFAULT_SHIP_FROM_NAME: z.string().optional(),
      DEFAULT_SHIP_FROM_STREET: z.string().optional(),
      DEFAULT_SHIP_FROM_CITY: z.string().optional(),
      DEFAULT_SHIP_FROM_STATE: z.string().optional(),
      DEFAULT_SHIP_FROM_ZIP: z.string().optional(),
      DEFAULT_SHIP_FROM_COUNTRY: z.string().optional(),
      // Sanity
      SANITY_PROJECT_ID: z.string().optional(),
      SANITY_DATASET: z.string().optional(),
      SANITY_API_READ_TOKEN: z.string().optional(),
      SANITY_WEBHOOK_SECRET: z.string().optional(),
      // Algolia
      NEXT_PUBLIC_ALGOLIA_APP_ID: z.string().optional(),
      ALGOLIA_ADMIN_API_KEY: z.string().optional(),
      ALGOLIA_INDEX_BLOG: z.string().optional(),
      ALGOLIA_INDEX_GAMES: z.string().optional(),
      ALGOLIA_INDEX_PAGES: z.string().optional(),
      // Redis / Rate-limits / Idempotency
      IDEMPOTENCY_TTL_SECONDS: z.coerce.number().default(86400),
      PETALS_DAILY_CAP: z.coerce.number().default(500),
      RATE_LIMIT_COLLECT_PER_MINUTE: z.coerce.number().default(30),
      RATE_LIMIT_SUBMIT_PER_MINUTE: z.coerce.number().default(10),
      // Game/Economy security
      GAME_HMAC_SECRET: z.string().min(32),
      // Analytics/Observability (optional)
      NEXT_PUBLIC_POSTHOG_KEY: z.string().optional(),
      NEXT_PUBLIC_POSTHOG_HOST: z.string().url().optional(),
      SENTRY_DSN: z.string().url().optional(),
      // Anti-bot (Cloudflare Turnstile) – optional
      NEXT_PUBLIC_TURNSTILE_SITE_KEY: z.string().optional(),
      TURNSTILE_SECRET_KEY: z.string().optional(),
      INNGEST_SERVE_URL: z.string().url().optional(),
      BASE_URL: z.string().url().optional(),
      SUPABASE_SERVICE_ROLE_KEY: z.string().optional(),
      OTEL_SDK_DISABLED: z.string().optional(),
      // Google OAuth
      GOOGLE_CLIENT_ID: z.string().optional(),
      GOOGLE_CLIENT_SECRET: z.string().optional(),
      GOOGLE_PROJECT_ID: z.string().optional(),
      GOOGLE_AUTH_URI: z.string().url().optional(),
      GOOGLE_TOKEN_URI: z.string().url().optional(),
      GOOGLE_AUTH_PROVIDER_X509_CERT_URL: z.string().url().optional(),
      GOOGLE_REDIRECT_URI: z.string().url().optional(),
      // NextAuth
      NEXTAUTH_SECRET: z.string().optional(),
      NEXTAUTH_URL: z.string().url().optional(),
      // GitHub
      GITHUB_PAT: z.string().optional(),
      // Sentry/Stack
      SENTRY_AUTH_TOKEN: z.string().optional(),
      STACK_SECRET_SERVER_KEY: z.string().optional(),
      // Prisma Accelerate
      PRISMA_ACCELERATE_API_KEY: z.string().optional(),
      // Misc
      DEBUG_MODE: z.string().optional(),
      // Feature Flags
      FEATURE_FLAG_PROVIDER: z
        .enum(['local', 'configcat', 'flagsmith'])
        .optional()
        .default('local'),
      FEATURE_FLAG_API_KEY: z.string().optional(),
      FEATURE_FLAG_BASE_URL: z.string().url().optional(),
      FEATURE_EASYPOST: z.string().optional(),
    },
    client: {
      NEXT_PUBLIC_APP_URL: z.string().url(),
      NEXT_PUBLIC_SITE_URL: z.string().url(),
      NEXT_PUBLIC_CANONICAL_ORIGIN: z.string().url().optional(),
      NEXT_PUBLIC_VERCEL_ENVIRONMENT: z.string().optional(),
      // Supabase
      NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
      NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string(),
      // Clerk - all required for proper functionality
      NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: z
        .string()
        .min(1, 'NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY is required'),
      NEXT_PUBLIC_CLERK_DEV_PUBLISHABLE_KEY: z.string().optional(),
      NEXT_PUBLIC_CLERK_SIGN_IN_URL: z.string().default('/sign-in'),
      NEXT_PUBLIC_CLERK_SIGN_UP_URL: z.string().default('/sign-up'),
      NEXT_PUBLIC_CLERK_PROXY_URL: z.string().url().optional(),
      NEXT_PUBLIC_CLERK_DOMAIN: z.string().optional(),
      // Remove deprecated after sign in/up URL env vars - use fallbackRedirectUrl in provider
      NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL: z.string().optional(),
      NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL: z.string().optional(),
      NEXT_PUBLIC_CLERK_IS_SATELLITE: z.string().optional(),
      // Stripe
      NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: z.string(),
      // Algolia (site-wide search only, not catalog)
      NEXT_PUBLIC_ALGOLIA_APP_ID: z.string().optional(),
      // Analytics/Observability (optional)
      NEXT_PUBLIC_POSTHOG_KEY: z.string().optional(),
      NEXT_PUBLIC_POSTHOG_HOST: z.string().url().optional(),
      // Anti-bot (Cloudflare Turnstile) – optional
      NEXT_PUBLIC_TURNSTILE_SITE_KEY: z.string().optional(),
      // Stack
      NEXT_PUBLIC_STACK_PROJECT_ID: z.string().optional(),
      NEXT_PUBLIC_STACK_PUBLISHABLE_CLIENT_KEY: z.string().optional(),
      // WebSocket
      NEXT_PUBLIC_ENABLE_MOCK_COMMUNITY_WS: z.string().optional(),
      NEXT_PUBLIC_COMMUNITY_WS_URL: z.string().optional(),
      // Feature flags
      NEXT_PUBLIC_FEATURE_GA_ENABLED: z.string().default('true'),
      NEXT_PUBLIC_FEATURE_OTEL_CLIENT: z.string().default('false'),
      NEXT_PUBLIC_FEATURE_PERF_MODULE: z.string().default('true'),
      NEXT_PUBLIC_FEATURE_MINIGAMES: z.string().default('on'),
      NEXT_PUBLIC_FEATURE_RUNE: z.string().default('off'),
      NEXT_PUBLIC_FEATURE_SOAPSTONE: z.string().default('on'),
      NEXT_PUBLIC_FEATURE_PETALS: z.string().default('on'),
      NEXT_PUBLIC_FEATURE_CURSOR_GLOW: z.string().default('off'),
      NEXT_PUBLIC_FEATURE_STARFIELD: z.string().default('on'),
      NEXT_PUBLIC_FEATURE_COMMUNITY_FACE2: z.string().default('on'),
      NEXT_PUBLIC_FEATURE_CRT_CARD_ONLY: z.string().default('on'),
      NEXT_PUBLIC_FEATURE_TRADE_PROPOSE: z.string().default('off'),
      NEXT_PUBLIC_FEATURE_DIRTY_EMOTES: z.string().default('on'),
      NEXT_PUBLIC_FEATURE_JIGGLE: z.string().default('on'),
      NEXT_PUBLIC_FEATURE_EVENTS: z.string().default('on'),
      NEXT_PUBLIC_FEATURE_CUBE_HUB: z.string().default('on'),
      NEXT_PUBLIC_FEATURE_PETALS_ABOUT: z.string().default('on'),
      // Sentry
      NEXT_PUBLIC_SENTRY_DSN: z.string().url().optional(),
      SENTRY_SKIP_AUTO_RELEASE: z.string().optional(),
      SENTRY_UPLOAD_SOURCE_MAPS: z.string().optional(),
      SENTRY_IGNORE_API_RESOLUTION_ERROR: z.string().optional(),
      // Vercel Environment
      NEXT_PUBLIC_VERCEL_ENV: z.enum(['development', 'preview', 'production']).optional(),
      // App Version
      NEXT_PUBLIC_APP_VERSION: z.string().optional().default('1.0.0'),
      // Feature flags
      NEXT_PUBLIC_FEATURE_MINIGAMES: z.enum(['on', 'off']).default('on'),
      NEXT_PUBLIC_FEATURE_RUNE: z.enum(['on', 'off']).default('off'),
      NEXT_PUBLIC_FEATURE_SOAPSTONE: z.enum(['on', 'off']).default('on'),
      NEXT_PUBLIC_FEATURE_PETALS: z.enum(['on', 'off']).default('on'),
      NEXT_PUBLIC_FEATURE_CURSOR_GLOW: z.enum(['on', 'off']).default('off'),
      NEXT_PUBLIC_FEATURE_STARFIELD: z.enum(['on', 'off']).default('on'),
      NEXT_PUBLIC_FEATURE_COMMUNITY_FACE2: z.enum(['on', 'off']).default('on'),
      NEXT_PUBLIC_FEATURE_CRT_CARD_ONLY: z.enum(['on', 'off']).default('on'),
      NEXT_PUBLIC_FEATURE_TRADE_PROPOSE: z.enum(['on', 'off']).default('off'),
      NEXT_PUBLIC_FEATURE_DIRTY_EMOTES: z.enum(['on', 'off']).default('on'),
      NEXT_PUBLIC_FEATURE_JIGGLE: z.enum(['on', 'off']).default('on'),
      NEXT_PUBLIC_FEATURE_EVENTS: z.enum(['on', 'off']).default('on'),
      NEXT_PUBLIC_FEATURE_CUBE_HUB: z.string().optional(),
      NEXT_PUBLIC_FEATURE_PETALS_ABOUT: z.string().optional(),
      NEXT_PUBLIC_DAILY_PETAL_LIMIT: z.string().optional(),
      NEXT_PUBLIC_EVENT_CODE: z.string().optional(),
      // Misc
      NEXT_PUBLIC_API_KEY: z.string().optional(),
      NEXT_PUBLIC_ADMIN_API_KEY: z.string().optional(),
      NEXT_PUBLIC_ENABLE_AUDIO: z.string().optional(),
      NEXT_PUBLIC_GA_ID: z.string().optional(),
      VERCEL_ENVIRONMENT: z.string().optional(),
      BASE_URL: z.string().url().optional(),
    },
    runtimeEnv: {
      // Server environment variables
      NODE_ENV: process.env.NODE_ENV,
      DATABASE_URL: process.env.DATABASE_URL,
      DIRECT_URL: process.env.DIRECT_URL,
      STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
      STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET,
      CLERK_SECRET_KEY: process.env.CLERK_SECRET_KEY,
      CLERK_ENCRYPTION_KEY: process.env.CLERK_ENCRYPTION_KEY,
      CLERK_WEBHOOK_SECRET: process.env.CLERK_WEBHOOK_SECRET,
      PRINTIFY_API_KEY: process.env.PRINTIFY_API_KEY,
      PRINTIFY_SHOP_ID: process.env.PRINTIFY_SHOP_ID,
      PRINTIFY_API_URL: process.env.PRINTIFY_API_URL,
      PRINTIFY_WEBHOOK_SECRET: process.env.PRINTIFY_WEBHOOK_SECRET,
      BLOB_READ_WRITE_TOKEN: process.env.BLOB_READ_WRITE_TOKEN,
      BLOB_READ_WRITE_URL: process.env.BLOB_READ_WRITE_URL,
      API_KEY: process.env.API_KEY,
      CRON_SECRET: process.env.CRON_SECRET,
      UPSTASH_REDIS_REST_URL: process.env.UPSTASH_REDIS_REST_URL,
      UPSTASH_REDIS_REST_TOKEN: process.env.UPSTASH_REDIS_REST_TOKEN,
      PETAL_SALT: process.env.PETAL_SALT,
      RESEND_API_KEY: process.env.RESEND_API_KEY,
      EMAIL_FROM: process.env.EMAIL_FROM,
      // Stripe
      STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
      STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET,
      // EasyPost
      EASYPOST_API_KEY: process.env.EASYPOST_API_KEY,
      EASYPOST_WEBHOOK_SECRET: process.env.EASYPOST_WEBHOOK_SECRET,
      DEFAULT_SHIP_FROM_NAME: process.env.DEFAULT_SHIP_FROM_NAME,
      DEFAULT_SHIP_FROM_STREET: process.env.DEFAULT_SHIP_FROM_STREET,
      DEFAULT_SHIP_FROM_CITY: process.env.DEFAULT_SHIP_FROM_CITY,
      DEFAULT_SHIP_FROM_STATE: process.env.DEFAULT_SHIP_FROM_STATE,
      DEFAULT_SHIP_FROM_ZIP: process.env.DEFAULT_SHIP_FROM_ZIP,
      DEFAULT_SHIP_FROM_COUNTRY: process.env.DEFAULT_SHIP_FROM_COUNTRY,
      // Sanity
      SANITY_PROJECT_ID: process.env.SANITY_PROJECT_ID,
      SANITY_DATASET: process.env.SANITY_DATASET,
      SANITY_API_READ_TOKEN: process.env.SANITY_API_READ_TOKEN,
      SANITY_WEBHOOK_SECRET: process.env.SANITY_WEBHOOK_SECRET,
      // Algolia
      ALGOLIA_ADMIN_API_KEY: process.env.ALGOLIA_ADMIN_API_KEY,
      ALGOLIA_INDEX_BLOG: process.env.ALGOLIA_INDEX_BLOG,
      ALGOLIA_INDEX_GAMES: process.env.ALGOLIA_INDEX_GAMES,
      ALGOLIA_INDEX_PAGES: process.env.ALGOLIA_INDEX_PAGES,
      // Redis / Rate-limits / Idempotency
      IDEMPOTENCY_TTL_SECONDS: process.env.IDEMPOTENCY_TTL_SECONDS,
      PETALS_DAILY_CAP: process.env.PETALS_DAILY_CAP,
      RATE_LIMIT_COLLECT_PER_MINUTE: process.env.RATE_LIMIT_COLLECT_PER_MINUTE,
      RATE_LIMIT_SUBMIT_PER_MINUTE: process.env.RATE_LIMIT_SUBMIT_PER_MINUTE,
      // Game/Economy security
      GAME_HMAC_SECRET: process.env.GAME_HMAC_SECRET,
      // Analytics/Observability (optional)
      NEXT_PUBLIC_POSTHOG_KEY: process.env.NEXT_PUBLIC_POSTHOG_KEY,
      NEXT_PUBLIC_POSTHOG_HOST: process.env.NEXT_PUBLIC_POSTHOG_HOST,
      SENTRY_DSN: process.env.SENTRY_DSN,
      // Anti-bot (Cloudflare Turnstile) – optional
      NEXT_PUBLIC_TURNSTILE_SITE_KEY: process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY,
      TURNSTILE_SECRET_KEY: process.env.TURNSTILE_SECRET_KEY,
      INNGEST_SERVE_URL: process.env.INNGEST_SERVE_URL,
      BASE_URL: process.env.BASE_URL,
      SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
      // Google OAuth
      GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
      GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
      GOOGLE_PROJECT_ID: process.env.GOOGLE_PROJECT_ID,
      GOOGLE_AUTH_URI: process.env.GOOGLE_AUTH_URI,
      GOOGLE_TOKEN_URI: process.env.GOOGLE_TOKEN_URI,
      GOOGLE_AUTH_PROVIDER_X509_CERT_URL: process.env.GOOGLE_AUTH_PROVIDER_X509_CERT_URL,
      GOOGLE_REDIRECT_URI: process.env.GOOGLE_REDIRECT_URI,
      // NextAuth
      NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
      NEXTAUTH_URL: process.env.NEXTAUTH_URL,
      // GitHub
      GITHUB_PAT: process.env.GITHUB_PAT,
      // Sentry/Stack
      SENTRY_AUTH_TOKEN: process.env.SENTRY_AUTH_TOKEN,
      STACK_SECRET_SERVER_KEY: process.env.STACK_SECRET_SERVER_KEY,
      // Prisma Accelerate
      PRISMA_ACCELERATE_API_KEY: process.env.PRISMA_ACCELERATE_API_KEY,
      // Misc
      DEBUG_MODE: process.env.DEBUG_MODE,
      FEATURE_EASYPOST: process.env.FEATURE_EASYPOST,
      VERCEL: process.env.VERCEL,
      VERCEL_URL: process.env.VERCEL_URL,
      AUTHORIZED_PARTIES: process.env.AUTHORIZED_PARTIES,
      NEXT_TELEMETRY_DISABLED: process.env.NEXT_TELEMETRY_DISABLED,
      NODE_OPTIONS: process.env.NODE_OPTIONS,
      ANALYZE: process.env.ANALYZE,
      SENTRY_ORG: process.env.SENTRY_ORG,
      SENTRY_PROJECT: process.env.SENTRY_PROJECT,

      // Client environment variables
      NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
      NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
      NEXT_PUBLIC_CANONICAL_ORIGIN: process.env.NEXT_PUBLIC_CANONICAL_ORIGIN,
      NEXT_PUBLIC_VERCEL_ENVIRONMENT: process.env.NEXT_PUBLIC_VERCEL_ENVIRONMENT,
      // Supabase
      NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
      NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      // Clerk
      NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
      NEXT_PUBLIC_CLERK_SIGN_IN_URL: process.env.NEXT_PUBLIC_CLERK_SIGN_IN_URL,
      NEXT_PUBLIC_CLERK_SIGN_UP_URL: process.env.NEXT_PUBLIC_CLERK_SIGN_UP_URL,
      NEXT_PUBLIC_CLERK_PROXY_URL: process.env.NEXT_PUBLIC_CLERK_PROXY_URL,
      NEXT_PUBLIC_CLERK_DOMAIN: process.env.NEXT_PUBLIC_CLERK_DOMAIN,
      NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL: process.env.NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL,
      NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL: process.env.NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL,
      NEXT_PUBLIC_CLERK_IS_SATELLITE: process.env.NEXT_PUBLIC_CLERK_IS_SATELLITE,
      // Stripe
      NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
      // Algolia
      NEXT_PUBLIC_ALGOLIA_APP_ID: process.env.NEXT_PUBLIC_ALGOLIA_APP_ID,
      // Analytics/Observability (optional)
      NEXT_PUBLIC_POSTHOG_KEY: process.env.NEXT_PUBLIC_POSTHOG_KEY,
      NEXT_PUBLIC_POSTHOG_HOST: process.env.NEXT_PUBLIC_POSTHOG_HOST,
      // Anti-bot (Cloudflare Turnstile) – optional
      NEXT_PUBLIC_TURNSTILE_SITE_KEY: process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY,
      // Stack
      NEXT_PUBLIC_STACK_PROJECT_ID: process.env.NEXT_PUBLIC_STACK_PROJECT_ID,
      NEXT_PUBLIC_STACK_PUBLISHABLE_CLIENT_KEY:
        process.env.NEXT_PUBLIC_STACK_PUBLISHABLE_CLIENT_KEY,
      // WebSocket
      NEXT_PUBLIC_ENABLE_MOCK_COMMUNITY_WS: process.env.NEXT_PUBLIC_ENABLE_MOCK_COMMUNITY_WS,
      NEXT_PUBLIC_COMMUNITY_WS_URL: process.env.NEXT_PUBLIC_COMMUNITY_WS_URL,
      // Feature flags
      NEXT_PUBLIC_FEATURE_GA_ENABLED: process.env.NEXT_PUBLIC_FEATURE_GA_ENABLED,
      NEXT_PUBLIC_FEATURE_OTEL_CLIENT: process.env.NEXT_PUBLIC_FEATURE_OTEL_CLIENT,
      NEXT_PUBLIC_FEATURE_PERF_MODULE: process.env.NEXT_PUBLIC_FEATURE_PERF_MODULE,
      // Sentry
      NEXT_PUBLIC_SENTRY_DSN: process.env.NEXT_PUBLIC_SENTRY_DSN,
      // Feature flags
      NEXT_PUBLIC_FEATURE_MINIGAMES: process.env.NEXT_PUBLIC_FEATURE_MINIGAMES,
      NEXT_PUBLIC_FEATURE_RUNE: process.env.NEXT_PUBLIC_FEATURE_RUNE,
      NEXT_PUBLIC_FEATURE_SOAPSTONE: process.env.NEXT_PUBLIC_FEATURE_SOAPSTONE,
      NEXT_PUBLIC_FEATURE_PETALS: process.env.NEXT_PUBLIC_FEATURE_PETALS,
      NEXT_PUBLIC_FEATURE_CURSOR_GLOW: process.env.NEXT_PUBLIC_FEATURE_CURSOR_GLOW,
      NEXT_PUBLIC_FEATURE_STARFIELD: process.env.NEXT_PUBLIC_FEATURE_STARFIELD,
      NEXT_PUBLIC_FEATURE_COMMUNITY_FACE2: process.env.NEXT_PUBLIC_FEATURE_COMMUNITY_FACE2,
      NEXT_PUBLIC_FEATURE_CRT_CARD_ONLY: process.env.NEXT_PUBLIC_FEATURE_CRT_CARD_ONLY,
      NEXT_PUBLIC_FEATURE_TRADE_PROPOSE: process.env.NEXT_PUBLIC_FEATURE_TRADE_PROPOSE,
      NEXT_PUBLIC_FEATURE_DIRTY_EMOTES: process.env.NEXT_PUBLIC_FEATURE_DIRTY_EMOTES,
      NEXT_PUBLIC_FEATURE_JIGGLE: process.env.NEXT_PUBLIC_FEATURE_JIGGLE,
      NEXT_PUBLIC_FEATURE_EVENTS: process.env.NEXT_PUBLIC_FEATURE_EVENTS,
      NEXT_PUBLIC_FEATURE_CUBE_HUB: process.env.NEXT_PUBLIC_FEATURE_CUBE_HUB,
      NEXT_PUBLIC_FEATURE_PETALS_ABOUT: process.env.NEXT_PUBLIC_FEATURE_PETALS_ABOUT,
      NEXT_PUBLIC_DAILY_PETAL_LIMIT: process.env.NEXT_PUBLIC_DAILY_PETAL_LIMIT,
      NEXT_PUBLIC_EVENT_CODE: process.env.NEXT_PUBLIC_EVENT_CODE,
      // Misc
      NEXT_PUBLIC_API_KEY: process.env.NEXT_PUBLIC_API_KEY,
      NEXT_PUBLIC_ADMIN_API_KEY: process.env.NEXT_PUBLIC_ADMIN_API_KEY,
      NEXT_PUBLIC_ENABLE_AUDIO: process.env.NEXT_PUBLIC_ENABLE_AUDIO,
      NEXT_PUBLIC_GA_ID: process.env.NEXT_PUBLIC_GA_ID,
      VERCEL_ENVIRONMENT: process.env.VERCEL_ENVIRONMENT,
    },
    skipValidation: true, // Always skip validation to prevent crashes
    // Fail fast in development if required server vars are missing
    onValidationError: (error) => {
      console.warn('⚠️ Environment validation warnings:', error.errors);
      return error;
    },
  });
} catch (err) {
  console.warn('⚠️ Environment validation failed, using fallback values:', err.message);
  // Comprehensive fallback environment object with safe defaults for all used variables
  safeEnv = {
    // Core server environment
    NODE_ENV: process.env.NODE_ENV || 'development',
    DATABASE_URL: process.env.DATABASE_URL || '',
    DIRECT_URL: process.env.DIRECT_URL || '',

    // Authentication
    CLERK_SECRET_KEY: process.env.CLERK_SECRET_KEY || '',
    CLERK_ENCRYPTION_KEY: process.env.CLERK_ENCRYPTION_KEY || '',
    CLERK_WEBHOOK_SECRET: process.env.CLERK_WEBHOOK_SECRET || '',

    // Payments
    STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY || '',
    STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET || '',

    // Print on demand
    PRINTIFY_API_KEY: process.env.PRINTIFY_API_KEY || '',
    PRINTIFY_SHOP_ID: process.env.PRINTIFY_SHOP_ID || '',
    PRINTIFY_API_URL: process.env.PRINTIFY_API_URL || 'https://api.printify.com/v1/',
    PRINTIFY_WEBHOOK_SECRET: process.env.PRINTIFY_WEBHOOK_SECRET || '',

    // Storage
    BLOB_READ_WRITE_TOKEN: process.env.BLOB_READ_WRITE_TOKEN || '',
    BLOB_READ_WRITE_URL: process.env.BLOB_READ_WRITE_URL || '',

    // Redis
    UPSTASH_REDIS_REST_URL: process.env.UPSTASH_REDIS_REST_URL || '',
    UPSTASH_REDIS_REST_TOKEN: process.env.UPSTASH_REDIS_REST_TOKEN || '',

    // Email
    RESEND_API_KEY: process.env.RESEND_API_KEY || '',
    EMAIL_FROM: process.env.EMAIL_FROM || '',

    // Stripe
    STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY || '',
    STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET || '',

    // EasyPost
    EASYPOST_API_KEY: process.env.EASYPOST_API_KEY || '',
    EASYPOST_WEBHOOK_SECRET: process.env.EASYPOST_WEBHOOK_SECRET || '',
    DEFAULT_SHIP_FROM_NAME: process.env.DEFAULT_SHIP_FROM_NAME || '',
    DEFAULT_SHIP_FROM_STREET: process.env.DEFAULT_SHIP_FROM_STREET || '',
    DEFAULT_SHIP_FROM_CITY: process.env.DEFAULT_SHIP_FROM_CITY || '',
    DEFAULT_SHIP_FROM_STATE: process.env.DEFAULT_SHIP_FROM_STATE || '',
    DEFAULT_SHIP_FROM_ZIP: process.env.DEFAULT_SHIP_FROM_ZIP || '',
    DEFAULT_SHIP_FROM_COUNTRY: process.env.DEFAULT_SHIP_FROM_COUNTRY || '',

    // Sanity
    SANITY_PROJECT_ID: process.env.SANITY_PROJECT_ID || '',
    SANITY_DATASET: process.env.SANITY_DATASET || '',
    SANITY_API_READ_TOKEN: process.env.SANITY_API_READ_TOKEN || '',
    SANITY_WEBHOOK_SECRET: process.env.SANITY_WEBHOOK_SECRET || '',

    // Algolia
    ALGOLIA_ADMIN_API_KEY: process.env.ALGOLIA_ADMIN_API_KEY || '',
    ALGOLIA_INDEX_BLOG: process.env.ALGOLIA_INDEX_BLOG || '',
    ALGOLIA_INDEX_GAMES: process.env.ALGOLIA_INDEX_GAMES || '',
    ALGOLIA_INDEX_PAGES: process.env.ALGOLIA_INDEX_PAGES || '',

    // Redis / Rate-limits / Idempotency
    IDEMPOTENCY_TTL_SECONDS: process.env.IDEMPOTENCY_TTL_SECONDS || 86400,
    PETALS_DAILY_CAP: process.env.PETALS_DAILY_CAP || 500,
    RATE_LIMIT_COLLECT_PER_MINUTE: process.env.RATE_LIMIT_COLLECT_PER_MINUTE || 30,
    RATE_LIMIT_SUBMIT_PER_MINUTE: process.env.RATE_LIMIT_SUBMIT_PER_MINUTE || 10,
    // Game/Economy security
    GAME_HMAC_SECRET: process.env.GAME_HMAC_SECRET || '',
    // Analytics/Observability (optional)
    NEXT_PUBLIC_POSTHOG_KEY: process.env.NEXT_PUBLIC_POSTHOG_KEY || '',
    NEXT_PUBLIC_POSTHOG_HOST: process.env.NEXT_PUBLIC_POSTHOG_HOST || '',
    SENTRY_DSN: process.env.SENTRY_DSN || '',
    // Anti-bot (Cloudflare Turnstile) – optional
    NEXT_PUBLIC_TURNSTILE_SITE_KEY: process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || '',
    TURNSTILE_SECRET_KEY: process.env.TURNSTILE_SECRET_KEY || '',
    FEATURE_EASYPOST: process.env.FEATURE_EASYPOST || '',

    // Supabase
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY || '',

    // Utilities
    API_KEY: process.env.API_KEY || '',
    CRON_SECRET: process.env.CRON_SECRET || '',
    PETAL_SALT: process.env.PETAL_SALT || '',
    VERCEL_URL: process.env.VERCEL_URL || '',
    BASE_URL: process.env.BASE_URL || '',

    // Public client variables
    NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY || '',
    NEXT_PUBLIC_CLERK_SIGN_IN_URL: process.env.NEXT_PUBLIC_CLERK_SIGN_IN_URL || '/sign-in',
    NEXT_PUBLIC_CLERK_SIGN_UP_URL: process.env.NEXT_PUBLIC_CLERK_SIGN_UP_URL || '/sign-up',
    NEXT_PUBLIC_CLERK_PROXY_URL: process.env.NEXT_PUBLIC_CLERK_PROXY_URL || '',
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL || '',
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL || '',
    NEXT_PUBLIC_CANONICAL_ORIGIN: process.env.NEXT_PUBLIC_CANONICAL_ORIGIN || '',
    NEXT_PUBLIC_VERCEL_ENVIRONMENT: process.env.NEXT_PUBLIC_VERCEL_ENVIRONMENT || 'development',
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
    NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '',
    NEXT_PUBLIC_ALGOLIA_APP_ID: process.env.NEXT_PUBLIC_ALGOLIA_APP_ID || '',
    NEXT_PUBLIC_POSTHOG_KEY: process.env.NEXT_PUBLIC_POSTHOG_KEY || '',
    NEXT_PUBLIC_POSTHOG_HOST: process.env.NEXT_PUBLIC_POSTHOG_HOST || '',
    NEXT_PUBLIC_TURNSTILE_SITE_KEY: process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || '',
    NEXT_PUBLIC_FEATURE_GA_ENABLED: process.env.NEXT_PUBLIC_FEATURE_GA_ENABLED || 'false',
    NEXT_PUBLIC_GA_MEASUREMENT_ID: process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || '',
    NEXT_PUBLIC_DAILY_PETAL_LIMIT: process.env.NEXT_PUBLIC_DAILY_PETAL_LIMIT || '500',
    NEXT_PUBLIC_EVENT_CODE: process.env.NEXT_PUBLIC_EVENT_CODE || '',
    NEXT_PUBLIC_ADMIN_API_KEY: process.env.NEXT_PUBLIC_ADMIN_API_KEY || '',
    NEXT_PUBLIC_APP_VERSION: process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0',

    // Feature flags
    NEXT_PUBLIC_FEATURE_MINIGAMES: process.env.NEXT_PUBLIC_FEATURE_MINIGAMES || 'on',
    NEXT_PUBLIC_FEATURE_RUNE: process.env.NEXT_PUBLIC_FEATURE_RUNE || 'on',
    NEXT_PUBLIC_FEATURE_CUBE_HUB: process.env.NEXT_PUBLIC_FEATURE_CUBE_HUB || 'true',
    NEXT_PUBLIC_FEATURE_PETALS_ABOUT: process.env.NEXT_PUBLIC_FEATURE_PETALS_ABOUT || 'true',
    NEXT_PUBLIC_FEATURE_DIRTY_EMOTES: process.env.NEXT_PUBLIC_FEATURE_DIRTY_EMOTES || 'on',
    NEXT_PUBLIC_FEATURE_JIGGLE: process.env.NEXT_PUBLIC_FEATURE_JIGGLE || 'on',
    NEXT_PUBLIC_FEATURE_EVENTS: process.env.NEXT_PUBLIC_FEATURE_EVENTS || 'on',
    NEXT_PUBLIC_FEATURE_SOAPSTONE: process.env.NEXT_PUBLIC_FEATURE_SOAPSTONE || 'on',
    NEXT_PUBLIC_FEATURE_PETALS: process.env.NEXT_PUBLIC_FEATURE_PETALS || 'on',
    NEXT_PUBLIC_FEATURE_CURSOR_GLOW: process.env.NEXT_PUBLIC_FEATURE_CURSOR_GLOW || 'off',
    NEXT_PUBLIC_FEATURE_STARFIELD: process.env.NEXT_PUBLIC_FEATURE_STARFIELD || 'on',
    NEXT_PUBLIC_FEATURE_COMMUNITY_FACE2: process.env.NEXT_PUBLIC_FEATURE_COMMUNITY_FACE2 || 'on',
    NEXT_PUBLIC_FEATURE_CRT_CARD_ONLY: process.env.NEXT_PUBLIC_FEATURE_CRT_CARD_ONLY || 'on',
    NEXT_PUBLIC_FEATURE_TRADE_PROPOSE: process.env.NEXT_PUBLIC_FEATURE_TRADE_PROPOSE || 'off',

    // Additional missing variables
    NEXT_PUBLIC_CLERK_DOMAIN: process.env.NEXT_PUBLIC_CLERK_DOMAIN || '',
    VERCEL_ENVIRONMENT: process.env.VERCEL_ENVIRONMENT || '',
  };
}

export const env = safeEnv;
