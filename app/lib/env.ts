import { z } from 'zod';

const envSchema = z.object({
  // Database
  DATABASE_URL: z.string().url().default('postgresql://postgres:password@localhost:5432/otakumori'),
  POSTGRES_SUPABASE_URL: z.string().url().optional(),
  POSTGRES_SUPABASE_SERVICE_ROLE_KEY: z.string().optional(),
  POSTGRES_POSTGRES_DATABASE: z.string().optional(),
  POSTGRES_POSTGRES_HOST: z.string().optional(),
  POSTGRES_POSTGRES_PASSWORD: z.string().optional(),
  POSTGRES_POSTGRES_USER: z.string().optional(),

  // NextAuth / Auth
  NEXTAUTH_SECRET: z.string().min(1).default('dev-secret-key-change-in-production'),
  NEXTAUTH_URL: z.string().url().default('http://localhost:3000'),
  AUTH_SECRET: z.string().optional(), // legacy

  // Clerk
  NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: z.string().optional(),
  CLERK_SECRET_KEY: z.string().optional(),
  NEXT_PUBLIC_CLERK_FRONTEND_API: z.string().optional(),
  NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL: z.string().optional(),
  NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL: z.string().optional(),

  // Supabase
  NEXT_PUBLIC_SUPABASE_URL: z.string().url().optional(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().optional(),
  POSTGRES_SUPABASE_JWT_SECRET: z.string().optional(),

  // Stripe
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: z.string().optional(),
  STRIPE_SECRET_KEY: z.string().optional(),
  STRIPE_WEBHOOK_SECRET: z.string().optional(),
  STRIPE_WEBHOOK_URL: z.string().url().optional(),

  // Printify
  PRINTIFY_API_KEY: z.string().min(1),
  PRINTIFY_SHOP_ID: z.string().min(1),

  // GitHub
  GITHUB_PAT: z.string().optional(),
  GITHUB_CLIENT_ID: z.string().optional(),
  GITHUB_CLIENT_SECRET: z.string().optional(),

  // Stack (if used)
  NEXT_PUBLIC_STACK_PROJECT_ID: z.string().optional(),
  NEXT_PUBLIC_STACK_PUBLISHABLE_CLIENT_KEY: z.string().optional(),
  STACK_SECRET_SERVER_KEY: z.string().optional(),

  // PayPal
  PAYPAL_ENV: z.enum(['live', 'sandbox']).optional(),
  PAYPAL_CLIENT_ID: z.string().optional(),
  PAYPAL_CLIENT_SECRET: z.string().optional(),
  PAYPAL_WEBHOOK_ID: z.string().optional(),
  NEXT_PUBLIC_PAYPAL_CLIENT_ID: z.string().optional(),

  // Site configuration
  NEXT_PUBLIC_SITE_URL: z.string().url().optional(),
  NEXT_PUBLIC_VERCEL_ENVIRONMENT: z.string().optional(),
  DEBUG_MODE: z.string().optional(),

  // Sentry / monitoring
  SENTRY_DSN: z.string().url().optional(),

  // Redis
  UPSTASH_REDIS_REST_URL: z.string().url().optional(),
  UPSTASH_REDIS_REST_TOKEN: z.string().optional(),
  REDIS_URL: z.string().url().optional(),

  // Misc
  NEXT_PUBLIC_APP_URL: z.string().url().optional(),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
});

export const env = envSchema.parse(process.env);

// Fallback values for development
export const getEnvVar = (key: keyof typeof env, fallback?: string) => {
  const value = env[key];
  if (value) return value;

  if (fallback) return fallback;

  if (process.env.NODE_ENV === 'development') {
    // Development fallbacks
    switch (key) {
      case 'DATABASE_URL':
        return 'postgresql://postgres:password@localhost:5432/otakumori';
      case 'NEXTAUTH_SECRET':
        return 'dev-secret-key-change-in-production';
      case 'NEXTAUTH_URL':
        return 'http://localhost:3000';
      case 'UPSTASH_REDIS_REST_URL':
        return 'http://localhost:6379';
      case 'UPSTASH_REDIS_REST_TOKEN':
        return 'dev-token';
      default:
        return '';
    }
  }

  throw new Error(`Missing required environment variable: ${key}`);
};
