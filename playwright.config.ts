import { defineConfig, devices } from '@playwright/test';

// Use dynamic import for env.mjs to avoid ESM require() error
let env: Record<string, string> = {};
try {
  // Synchronously import env.mjs if possible, otherwise fallback to empty object
  // This works for Playwright config which is run in Node.js context
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  env = require('./env.mjs').env || {};
} catch {
  // If require fails (e.g., in ESM context), fallback to empty env
  env = {};
}

export default defineConfig({
  testDir: './tests/e2e',
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
