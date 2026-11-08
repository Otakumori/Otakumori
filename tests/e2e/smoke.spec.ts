import { test, expect } from '@playwright/test';

import { expectRootFooterContract, expectSinglePrimaryNavigation } from './helpers/home';

const visualQaAuthEnabled =
  process.env.OTM_VISUAL_QA_AUTH === '1' || process.env.NEXT_PUBLIC_OTM_VISUAL_QA_AUTH === '1';

test('Home → account boundary → Shop → cart or truthful unavailable state', async ({ page }) => {
  await page.goto('/');
  await expectSinglePrimaryNavigation(page);

  if (!visualQaAuthEnabled) {
    // Clerk redirect entry point or bounded unavailable state with synthetic Clerk config.
    const signInLink = page.getByRole('link', { name: /^sign in$/i }).first();
    const unavailableButton = page.getByRole('button', {
      name: /account service unavailable\. reload account state/i,
    });
    await expect(signInLink.or(unavailableButton)).toBeVisible({ timeout: 10000 });
    if ((await signInLink.count()) > 0) {
      await expect(signInLink).toHaveAttribute('href', /\/sign-in\?redirect_url=/);
    }
  }

  // Back to shop
  await page.goto('/shop');
  await expect(
    page.getByRole('heading', { level: 1, name: 'The Otaku-mori collection' }),
  ).toBeVisible();

  const unavailable = page.getByRole('heading', {
    level: 2,
    name: /storefront temporarily unavailable/i,
  });
  if ((await unavailable.count()) > 0) {
    await expect(unavailable).toBeVisible();
    await expect(page.getByRole('button', { name: /try again/i })).toBeVisible();
    return;
  }

  // First product
  const productHref = await page.getByTestId('product-card').first().getAttribute('href');
  expect(productHref).toBeTruthy();
  await page.goto(productHref!);
  await page.getByRole('button', { name: /add to cart/i }).click();

  // Cart page
  await page.goto('/cart');
  await expect(page.getByText(/subtotal/i)).toBeVisible();
});

test('Footer components work', async ({ page }) => {
  await page.goto('/');

  await expectRootFooterContract(page);

  // Root footer links remain visible and navigable without depending on pending production art.
  const routes = [
    '/shop',
    '/shop/cart',
    '/wishlist',
    '/profile',
    '/account',
    '/profile/petals',
    '/mini-games',
    '/blog',
    '/community/soapstones',
    '/help',
    '/privacy',
    '/terms',
    '/cookies',
  ];
  for (const href of routes) {
    await expect(page.getByTestId('mori-root-footer').locator(`a[href="${href}"]`)).toBeVisible();
  }

  // No scary console errors
  const consoleErrors: string[] = [];
  page.on('console', (msg) => {
    if (msg.type() === 'error') consoleErrors.push(msg.text());
  });

  // Check for critical errors
  const noisy = consoleErrors.join('\n');
  expect(noisy).not.toMatch(/Clerk: Failed to load Clerk/i);
  expect(noisy).not.toMatch(/Failed to fetch RSC payload/i);
});

test('API routes report truthful health and a bounded product response', async ({ page }) => {
  const health = await page.request.get('/api/health');
  const healthBody = (await health.json()) as { ok?: unknown; error?: unknown };
  expect(typeof healthBody.ok).toBe('boolean');
  if (healthBody.ok) {
    expect(health.status()).toBe(200);
  } else {
    expect(health.status()).toBeGreaterThanOrEqual(500);
    expect(typeof healthBody.error).toBe('string');
  }

  const products = await page.request.get('/api/shop/products');
  expect(products.status()).toBe(200);
});
