import { defineConfig, devices } from '@playwright/test';
import type { PlaywrightTestConfig } from '@playwright/test';

const baseURL = process.env.BASE_URL || 'http://localhost:3000';

const config: PlaywrightTestConfig = {
  testDir: 'tests/e2e',
  fullyParallel: true,
  reporter: process.env.CI
    ? [['list'], ['html', { outputFolder: 'playwright-report', open: 'never' }]]
    : [['list']],
  use: {
    baseURL,
    trace: 'retain-on-failure',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
};

if (!process.env.BASE_URL) {
  config.webServer = {
    command: 'npm run dev',
    port: 3000,
    timeout: 120000,
  };
}

export default defineConfig(config);
