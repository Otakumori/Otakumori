import { chromium, request, type FullConfig } from '@playwright/test';

function resolveBaseUrl(config: FullConfig) {
  const configured = config.projects[0]?.use?.baseURL;
  return typeof configured === 'string' ? configured : process.env.BASE_URL || 'http://localhost:3000';
}

async function assertLocalAppResponse(
  context: Awaited<ReturnType<typeof request.newContext>>,
  expectedOrigin: string,
  path: string,
  requireSuccess: boolean,
) {
  const response = await context.get(path, { maxRedirects: 0 });
  const location = response.headers().location;

  if (response.status() >= 300 && response.status() < 400 && location) {
    const nextOrigin = new URL(location, expectedOrigin).origin;
    if (nextOrigin !== expectedOrigin) {
      throw new Error(
        `BLOCKED_BY_ENV: Playwright target redirected outside the local app before tests could run. Status ${response.status()}.`,
      );
    }
  }

  if (response.status() >= 500 || (requireSuccess && !response.ok())) {
    throw new Error(
      `BLOCKED_BY_ENV: Playwright target failed boot preflight with HTTP ${response.status()}.`,
    );
  }

  const contentType = response.headers()['content-type'] || '';
  if (contentType.includes('text/') || contentType.includes('json')) {
    const body = await response.text();
    if (body.includes('host_invalid')) {
      throw new Error(
        'BLOCKED_BY_ENV: Clerk rejected the local test host before browser tests could reach the application.',
      );
    }
  }
}

export default async function globalSetup(config: FullConfig) {
  const baseURL = resolveBaseUrl(config);
  const expectedOrigin = new URL(baseURL).origin;
  const context = await request.newContext({ baseURL });

  try {
    await assertLocalAppResponse(context, expectedOrigin, '/api', false);
    await assertLocalAppResponse(context, expectedOrigin, '/', true);
  } finally {
    await context.dispose();
  }

  const browser = await chromium.launch();
  try {
    const page = await browser.newPage();
    const response = await page.goto(baseURL, { waitUntil: 'domcontentloaded' });
    const finalOrigin = new URL(page.url()).origin;
    const body = await page.locator('body').innerText().catch(() => '');

    if (finalOrigin !== expectedOrigin) {
      throw new Error(
        `BLOCKED_BY_ENV: Chromium redirected outside the local app before tests could run. Status ${response?.status() ?? 'unknown'}.`,
      );
    }

    if (!response?.ok()) {
      throw new Error(
        `BLOCKED_BY_ENV: Chromium could not render the local app. Status ${response?.status() ?? 'unknown'}.`,
      );
    }

    if (body.includes('host_invalid') || body.includes('Invalid host')) {
      throw new Error(
        'BLOCKED_BY_ENV: Clerk rejected the local test host before browser tests could reach the application.',
      );
    }
  } finally {
    await browser.close();
  }
}
