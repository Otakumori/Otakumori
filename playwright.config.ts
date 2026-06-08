import { defineConfig, devices } from '@playwright/test';
import type { PlaywrightTestConfig } from '@playwright/test';

const baseURL = process.env.BASE_URL || 'http://localhost:3000';
const localSyntheticEnv = {
  DATABASE_URL: 'postgresql://postgres:postgres@127.0.0.1:5432/otakumori_ci',
  DIRECT_URL: 'postgresql://postgres:postgres@127.0.0.1:5432/otakumori_ci',
  STRIPE_SECRET_KEY: 'sk_test_ci_placeholder',
  STRIPE_WEBHOOK_SECRET: 'whsec_ci_placeholder',
  STRIPE_WEBHOOK_FULFILLMENT_DRY_RUN: 'true',
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: 'pk_test_ci_placeholder',
  CLERK_SECRET_KEY: 'sk_test_ci_placeholder',
  NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: 'pk_test_Y2ktdGVzdC5jbGVyay5hY2NvdW50cy5kZXYk',
  PRINTIFY_API_KEY: 'ci-read-disabled',
  PRINTIFY_SHOP_ID: 'ci-read-disabled',
  UPSTASH_REDIS_REST_URL: 'https://ci.invalid',
  UPSTASH_REDIS_REST_TOKEN: 'ci-read-disabled',
  EMAIL_DRY_RUN: 'true',
  EMAIL_SEND_ENABLED: 'false',
  FULFILLMENT_PROVIDER: 'disabled',
  FULFILLMENT_DRY_RUN: 'true',
  NEXT_PUBLIC_FEATURE_HERO: '1',
  NEXT_PUBLIC_FEATURE_PETALS_INTERACTIVE: '1',
  NEXT_PUBLIC_FEATURE_SHOP: '1',
  NEXT_PUBLIC_FEATURE_MINIGAMES: 'on',
  NEXT_PUBLIC_FEATURE_BLOG: '1',
  NEXT_PUBLIC_FEATURE_SOAPSTONES: '1',
  NEXT_PUBLIC_LIVE_DATA: '0',
  NEXT_PUBLIC_PROBE_MODE: '1',
};

const config: PlaywrightTestConfig = {
  testDir: 'tests/e2e',
  testIgnore: /commerce-release\.spec\.ts/,
  globalSetup: './tests/e2e/global-setup.ts',
  fullyParallel: true,
  reporter: [['list']],
  use: {
    baseURL,
    trace: 'retain-on-failure',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
};

if (!process.env.BASE_URL) {
  config.webServer = {
    command: 'pnpm run dev',
    port: 3000,
    timeout: 120000,
    env: {
      ...process.env,
      ...localSyntheticEnv,
    },
  };
}

export default defineConfig(config);
