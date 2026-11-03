// @vitest-environment node

import { beforeEach, describe, expect, it, vi } from 'vitest';

const validatedEnv = vi.hoisted(() => ({
  NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: 'pk_test_preview',
  CLERK_SECRET_KEY: 'clerk_test_preview',
  DATABASE_URL: 'postgresql://user:pass@ep-preview-pooler.example/neondb',
  UPSTASH_REDIS_REST_URL: 'https://preview-redis.example',
  UPSTASH_REDIS_REST_TOKEN: 'preview-redis-token',
  STRIPE_SECRET_KEY: undefined,
  STRIPE_WEBHOOK_SECRET: undefined,
  PRINTIFY_API_KEY: undefined,
  PRINTIFY_SHOP_ID: undefined,
}));

vi.mock('../../env.mjs', () => ({ env: validatedEnv }));
vi.mock('server-only', () => ({}));

describe('Preview server environment validation', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.unstubAllEnvs();
  });

  it('allows Preview initialization without disabled commerce provider credentials', async () => {
    vi.stubEnv('VERCEL', '1');
    vi.stubEnv('VERCEL_ENV', 'preview');

    await expect(import('@/env/server')).resolves.toMatchObject({ env: validatedEnv });
  });

  it('preserves required provider validation outside Preview', async () => {
    vi.stubEnv('VERCEL', '1');
    vi.stubEnv('VERCEL_ENV', 'production');

    await expect(import('@/env/server')).rejects.toThrow(
      /STRIPE_SECRET_KEY.*STRIPE_WEBHOOK_SECRET.*PRINTIFY_API_KEY.*PRINTIFY_SHOP_ID/,
    );
  });
});
