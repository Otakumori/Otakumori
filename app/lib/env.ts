import { z } from 'zod';

/**
 * Strongly-typed environment variables
 * All secrets come from .env.local at project root
 */
export const env = z
  .object({
    // ========================
    // AUTH / NEXTAUTH
    // ========================
    AUTH_SECRET: z.string(),

    // ========================
    // DATABASES
    // ========================
    DATABASE_URL: z.string().url(),
    DATABASE_URL_UNPOOLED: z.string().optional(),
    POSTGRES_SUPABASE_URL: z.string().optional(),
    POSTGRES_SUPABASE_SERVICE_ROLE_KEY: z.string().optional(),
    POSTGRES_SUPABASE_JWT_SECRET: z.string().optional(),
    POSTGRES_POSTGRES_DATABASE: z.string().optional(),
    POSTGRES_POSTGRES_HOST: z.string().optional(),
    POSTGRES_POSTGRES_PASSWORD: z.string().optional(),
    POSTGRES_POSTGRES_USER: z.string().optional(),

    // ========================
    // SUPABASE
    // ========================
    NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
    NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string(),
    SUPABASE_SERVICE_ROLE_KEY: z.string().optional(),
    SUPABASE_STORAGE_BUCKET: z.string().optional(),

    // ========================
    // STRIPE
    // ========================
    NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: z.string(),
    STRIPE_SECRET_KEY: z.string(),
    STRIPE_WEBHOOK_SECRET: z.string(),
    STRIPE_WEBHOOK_URL: z.string().url().optional(),

    // ========================
    // PRINTIFY
    // ========================
    PRINTIFY_API_KEY: z.string(),
    PRINTIFY_SHOP_ID: z.string(),

    // ========================
    // CLERK
    // ========================
    NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: z.string(),
    CLERK_SECRET_KEY: z.string(),
    CLERK_WEBHOOK_SECRET: z.string().optional(),
    CLERK_FRONTEND_API: z.string().url().optional(),
    CLERK_JWKS_URL: z.string().url().optional(),

    // ========================
    // GOOGLE OAUTH
    // ========================
    GOOGLE_CLIENT_ID: z.string().optional(),
    GOOGLE_CLIENT_SECRET: z.string().optional(),
    GOOGLE_REDIRECT_URI: z.string().optional(),
    GOOGLE_AUTH_URI: z.string().optional(),
    GOOGLE_TOKEN_URI: z.string().optional(),
    GOOGLE_AUTH_PROVIDER_X509_CERT_URL: z.string().optional(),
    GOOGLE_PROJECT_ID: z.string().optional(),

    // ========================
    // REDIS (Upstash)
    // ========================
    REDIS_URL: z.string().optional(),
    UPSTASH_REDIS_REST_URL: z.string().optional(),
    UPSTASH_REDIS_REST_TOKEN: z.string().optional(),
    UPSTASH_REDIS_REST_READ_ONLY_TOKEN: z.string().optional(),

    // ========================
    // ADDITIONAL SERVICES
    // ========================
    RESEND_API_KEY: z.string().optional(),
    EMAIL_FROM: z.string().optional(),

    // ========================
    // GITHUB
    // ========================
    GITHUB_PAT: z.string().optional(),
    GITHUB_CLIENT_ID: z.string().optional(),
    GITHUB_CLIENT_SECRET: z.string().optional(),

    // ========================
    // STACK AUTH
    // ========================
    NEXT_PUBLIC_STACK_PROJECT_ID: z.string().optional(),
    NEXT_PUBLIC_STACK_PUBLISHABLE_CLIENT_KEY: z.string().optional(),
    STACK_SECRET_SERVER_KEY: z.string().optional(),

    // ========================
    // GENERAL CONFIG
    // ========================
    NEXT_PUBLIC_SITE_URL: z.string().url(),
    NEXT_PUBLIC_GA_ID: z.string().optional(),
    NEXT_PUBLIC_VERCEL_ENVIRONMENT: z.string().optional(),
    DEBUG_MODE: z.string().optional(), // leave as string (true/false)
    SKIP_ENV_VALIDATION: z.string().optional(),

    // ========================
    // RUNTIME & API CONFIG
    // ========================
    NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
    PRINTIFY_API_URL: z.string().url().default('https://api.printify.com/v1'),
  })
  .parse(process.env);

// Helper constants for easier access
export const IS_PROD = env.NODE_ENV === 'production';
export const IS_DEV = env.NODE_ENV === 'development';
export const IS_TEST = env.NODE_ENV === 'test';
