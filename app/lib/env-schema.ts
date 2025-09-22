import { z } from 'zod';
import { env } from '@/env.mjs';

// Environment schema for production validation
export const envSchema = z.object({
  // Clerk (required)
  NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: z.string().min(1),
  CLERK_SECRET_KEY: z.string().min(1),

  // Database (required)
  DATABASE_URL: z.string().url(),

  // Printify (required)
  PRINTIFY_API_KEY: z.string().min(1),
  PRINTIFY_SHOP_ID: z.string().min(1),

  // Stripe (required)
  STRIPE_SECRET_KEY: z.string().min(1),

  // Optional but recommended
  NEXT_PUBLIC_APP_URL: z.string().url().optional(),
  CLERK_WEBHOOK_SECRET: z.string().optional(),
  STRIPE_WEBHOOK_SECRET: z.string().optional(),
  UPSTASH_REDIS_REST_URL: z.string().url().optional(),
  UPSTASH_REDIS_REST_TOKEN: z.string().optional(),
  RESEND_API_KEY: z.string().optional(),
  COUPON_SIGNING_SECRET: z.string().optional(),
  FEATURE_COUPONS: z.string().optional(),

  // Build-time
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  VERCEL: z.string().optional(),
});

export type EnvSchema = z.infer<typeof envSchema>;

// Validate environment at runtime
export function validateEnv(): EnvSchema {
  try {
    return envSchema.parse(env);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const missingVars = error.errors.map((e) => e.path.join('.')).join(', ');
      console.error(`❌ Environment validation failed. Missing or invalid: ${missingVars}`);

      // In production, throw to prevent app from starting with invalid config
      if (env.NODE_ENV === 'production') {
        throw new Error(`Environment validation failed: ${missingVars}`);
      }
    }

    // In development, return partial config and log warnings
    console.warn('⚠️ Environment validation failed, continuing with partial config');
    return env as any;
  }
}

// Health check for environment variables
export function getEnvHealth() {
  try {
    const env = validateEnv();
    return {
      status: 'healthy' as const,
      clerk: !!env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY && !!env.CLERK_SECRET_KEY,
      database: !!env.DATABASE_URL,
      printify: !!env.PRINTIFY_API_KEY && !!env.PRINTIFY_SHOP_ID,
      stripe: !!env.STRIPE_SECRET_KEY,
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
