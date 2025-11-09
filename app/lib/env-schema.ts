import { z } from 'zod';
import { getServerEnv } from '@/env/server';

export const REQUIRED_SERVER_KEYS = [
  'NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY',
  'CLERK_SECRET_KEY',
  'DATABASE_URL',
  'STRIPE_SECRET_KEY',
  'STRIPE_WEBHOOK_SECRET',
  'PRINTIFY_API_KEY',
  'PRINTIFY_SHOP_ID',
  'UPSTASH_REDIS_REST_URL',
  'UPSTASH_REDIS_REST_TOKEN',
] as const;

const optionalString = z
  .string()
  .min(1)
  .optional();

// Environment schema for production validation
export const envSchema = z.object({
  // Core runtime
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  VERCEL: z.string().optional(),

  // Clerk
  NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: z.string().min(1),
  CLERK_SECRET_KEY: z.string().min(1),
  CLERK_WEBHOOK_SECRET: optionalString,

  // Database
  DATABASE_URL: z.string().url(),

  // Stripe
  STRIPE_SECRET_KEY: z.string().min(1),
  STRIPE_WEBHOOK_SECRET: z.string().min(1),

  // Printify
  PRINTIFY_API_KEY: z.string().min(1),
  PRINTIFY_SHOP_ID: z.string().min(1),

  // Redis / Rate limiting
  UPSTASH_REDIS_REST_URL: z.string().url(),
  UPSTASH_REDIS_REST_TOKEN: z.string().min(1),

  // Application URLs & CORS
  NEXT_PUBLIC_APP_URL: optionalString,
  NEXT_PUBLIC_SITE_URL: optionalString,
  API_CORS_ALLOW_ORIGINS: optionalString,

  // Email / external integrations
  RESEND_API_KEY: optionalString,

  // Feature flags / misc
  COUPON_SIGNING_SECRET: optionalString,
  FEATURE_COUPONS: optionalString,
});

export type EnvSchema = z.infer<typeof envSchema>;

function normalizeEnv(runtimeEnv: Record<string, unknown>): Record<string, unknown> {
  return Object.fromEntries(
    Object.entries(runtimeEnv).map(([key, value]) => [
      key,
      typeof value === 'string' ? value.trim() : value,
    ]),
  );
}

// Validate environment at runtime
export function validateEnv(runtimeEnv: Record<string, unknown>): EnvSchema {
  const normalized = normalizeEnv(runtimeEnv);

  try {
    return envSchema.parse(normalized);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const missingVars = error.issues.map((issue) => issue.path.join('.')).join(', ') || 'unknown';
      console.error(`Environment validation failed. Missing or invalid: ${missingVars}`);

      if (normalized.NODE_ENV === 'production') {
        throw new Error(`Environment validation failed: ${missingVars}`);
      }
    } else {
      console.error('Unexpected environment validation error:', error);
      if (normalized.NODE_ENV === 'production') {
        throw error;
      }
    }

    console.warn('Environment validation failed, continuing with partial config');
    return normalized as EnvSchema;
  }
}

// Health check for environment variables
export function getEnvHealth() {
  try {
    const serverEnv = getServerEnv();
    const runtimeEnv = validateEnv(serverEnv);
    return {
      status: 'healthy' as const,
      clerk: !!runtimeEnv.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY && !!runtimeEnv.CLERK_SECRET_KEY,
      database: !!runtimeEnv.DATABASE_URL,
      printify: !!runtimeEnv.PRINTIFY_API_KEY && !!runtimeEnv.PRINTIFY_SHOP_ID,
      stripe: !!runtimeEnv.STRIPE_SECRET_KEY,
      upstash: !!runtimeEnv.UPSTASH_REDIS_REST_URL && !!runtimeEnv.UPSTASH_REDIS_REST_TOKEN,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    return {
      status: 'unhealthy' as const,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString(),
    };
  }
}
