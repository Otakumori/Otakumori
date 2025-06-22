'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
exports.env = void 0;
const env_nextjs_1 = require('@t3-oss/env-nextjs');
const zod_1 = require('zod');
exports.env = (0, env_nextjs_1.createEnv)({
  server: {
    NODE_ENV: zod_1.z.enum(['development', 'test', 'production']),
    AUTH_SECRET: zod_1.z.string().min(1),
    AUTH_DISCORD_ID: zod_1.z.string().min(1),
    AUTH_DISCORD_SECRET: zod_1.z.string().min(1),
    DATABASE_URL: zod_1.z.string().url(),
    STRIPE_SECRET_KEY: zod_1.z.string().min(1),
    STRIPE_WEBHOOK_SECRET: zod_1.z.string().min(1),
    STRIPE_WEBHOOK_URL: zod_1.z.string().url(),
    PRINTIFY_API_KEY: zod_1.z.string().min(1),
    PRINTIFY_SHOP_ID: zod_1.z.string().min(1),
    SUPABASE_SERVICE_ROLE_KEY: zod_1.z.string().min(1),
    SUPABASE_STORAGE_BUCKET: zod_1.z.string().min(1),
    CLERK_SECRET_KEY: zod_1.z.string().min(1),
  },
  client: {
    NEXT_PUBLIC_SITE_URL: zod_1.z.string().url(),
    NEXT_PUBLIC_SUPABASE_URL: zod_1.z.string().url(),
    NEXT_PUBLIC_SUPABASE_ANON_KEY: zod_1.z.string().min(1),
    NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: zod_1.z.string().min(1),
    NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: zod_1.z.string().min(1),
  },
  runtimeEnv: {
    NODE_ENV: process.env.NODE_ENV,
    AUTH_SECRET: process.env.AUTH_SECRET,
    AUTH_DISCORD_ID: process.env.AUTH_DISCORD_ID,
    AUTH_DISCORD_SECRET: process.env.AUTH_DISCORD_SECRET,
    DATABASE_URL: process.env.DATABASE_URL,
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
    NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
    STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
    STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET,
    STRIPE_WEBHOOK_URL: process.env.STRIPE_WEBHOOK_URL,
    PRINTIFY_API_KEY: process.env.PRINTIFY_API_KEY,
    PRINTIFY_SHOP_ID: process.env.PRINTIFY_SHOP_ID,
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
    SUPABASE_STORAGE_BUCKET: process.env.SUPABASE_STORAGE_BUCKET,
    CLERK_SECRET_KEY: process.env.CLERK_SECRET_KEY,
  },
  skipValidation: !!process.env.SKIP_ENV_VALIDATION,
  emptyStringAsUndefined: true,
});
