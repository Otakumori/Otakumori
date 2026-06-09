import { chromium } from '@playwright/test';

const baseURL = process.argv[2] || process.env.BASE_URL || 'http://127.0.0.1:3000';
const path = process.argv[3] || '/api';
const target = new URL(path, baseURL);
const expectedOrigin = new URL(baseURL).origin;

const browser = await chromium.launch();
try {
  const page = await browser.newPage();
  const response = await page.goto(target.toString(), { waitUntil: 'domcontentloaded' });
  const finalOrigin = new URL(page.url()).origin;
  const body = await page.locator('body').innerText().catch(() => '');

  if (finalOrigin !== expectedOrigin) {
    console.error(
      `BLOCKED_BY_ENV: browser diagnostics redirected outside the local app. Status ${response?.status() ?? 'unknown'}.`,
    );
    process.exit(2);
  }

  if (!response?.ok()) {
    console.error(
      `BLOCKED_BY_ENV: local test target failed browser preflight with HTTP ${response?.status() ?? 'unknown'}.`,
    );
    process.exit(1);
  }

  if (body.includes('host_invalid') || body.includes('Invalid host')) {
    console.error(
      'BLOCKED_BY_ENV: Clerk rejected the local test host before diagnostics could reach the application.',
    );
    process.exit(2);
  }

  console.log(`Local test target accepted browser diagnostics with HTTP ${response.status()}.`);
} finally {
  await browser.close();
}
