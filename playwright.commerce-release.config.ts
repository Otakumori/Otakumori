import { existsSync, readFileSync } from 'node:fs';
import { defineConfig, devices } from '@playwright/test';
import { parse } from 'dotenv';

if (existsSync('.env.local')) {
  const parsedEnv = parse(readFileSync('.env.local'));
  for (const [key, value] of Object.entries(parsedEnv)) {
    process.env[key] ??= value;
  }
}

const baseURL = process.env.BASE_URL || process.env.PREVIEW_URL || 'http://localhost:3000';

const use = {
  baseURL,
  trace: 'off' as const,
  screenshot: 'only-on-failure' as const,
};

export default defineConfig({
  testDir: 'tests/e2e',
  testMatch: /commerce-release\.spec\.ts/,
  fullyParallel: false,
  reporter: [['list']],
  timeout: 60_000,
  expect: {
    timeout: 10_000,
  },
  use,
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'mobile-chromium', use: { ...devices['Pixel 5'] } },
    { name: 'webkit', use: { ...devices['Desktop Safari'] } },
  ],
});
