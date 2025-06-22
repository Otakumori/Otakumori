import { z } from 'zod';

const envSchema = z.object({
  // Database
  DATABASE_URL: z.string().url().default('postgresql://postgres:password@localhost:5432/otakumori'),
  POSTGRES_SUPABASE_URL: z.string().url().optional(),
  POSTGRES_SUPABASE_SERVICE_ROLE_KEY: z.string().optional(),

  // NextAuth
  NEXTAUTH_SECRET: z.string().min(1).default('dev-secret-key-change-in-production'),
  NEXTAUTH_URL: z.string().url().default('http://localhost:3000'),

  // OAuth Providers
  GOOGLE_CLIENT_ID: z.string().optional(),
  GOOGLE_CLIENT_SECRET: z.string().optional(),
  DISCORD_CLIENT_ID: z.string().optional(),
  DISCORD_CLIENT_SECRET: z.string().optional(),

  // Redis
  UPSTASH_REDIS_REST_URL: z.string().url().optional(),
  UPSTASH_REDIS_REST_TOKEN: z.string().optional(),
  REDIS_URL: z.string().url().optional(),

  // Supabase
  NEXT_PUBLIC_SUPABASE_URL: z.string().url().optional(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().optional(),

  // Sentry
  SENTRY_DSN: z.string().url().optional(),

  // App
  NEXT_PUBLIC_APP_URL: z.string().url().optional(),

  // Node Environment
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
