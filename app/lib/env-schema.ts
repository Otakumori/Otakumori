import { z } from 'zod';
import { getServerEnv } from '@/env/server';

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
  const runtimeEnv = getServerEnv();
  try {
    return envSchema.parse(runtimeEnv);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const missingVars = error.issues.map((e) => e.path.join('.')).join(', ');
      console.error(` Environment validation failed. Missing or invalid: ${missingVars}`);

      // In production, throw to prevent app from starting with invalid config
      if (runtimeEnv.NODE_ENV === 'production') {
        throw new Error(`Environment validation failed: ${missingVars}`);
      }
    }

    // In development, return partial config and log warnings
    console.warn(' Environment validation failed, continuing with partial config');
    return runtimeEnv as any;
  }
}

// Health check for environment variables
export function getEnvHealth() {
  try {
    const runtimeEnv = validateEnv();
    return {
      status: 'healthy' as const,
      clerk: !!runtimeEnv.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY && !!runtimeEnv.CLERK_SECRET_KEY,
      database: !!runtimeEnv.DATABASE_URL,
      printify: !!runtimeEnv.PRINTIFY_API_KEY && !!runtimeEnv.PRINTIFY_SHOP_ID,
      stripe: !!runtimeEnv.STRIPE_SECRET_KEY,
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
