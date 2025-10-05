import { defineConfig, devices } from '@playwright/test';
import { env } from './env.mjs';

export default defineConfig({
  testDir: 'tests/e2e',
  fullyParallel: true,
  reporter: [['list']],
  use: {
    baseURL: env.BASE_URL || 'http://localhost:3000',
    trace: 'retain-on-failure',
  },
  webServer: env.BASE_URL
    ? undefined
    : {
        command: 'npm run dev',
        port: 3000,
        timeout: 120000,
      },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
});
