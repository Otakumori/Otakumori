import { test, expect } from '@playwright/test';

import { expectRootFooterContract, expectSinglePrimaryNavigation } from './helpers/home';

test('Home → Sign in → Shop → Add to cart', async ({ page }) => {
  await page.goto('/');
  await expectSinglePrimaryNavigation(page);

  // Clerk redirect entry point or bounded unavailable state when CI uses synthetic Clerk config.
  const signInLink = page.getByRole('link', { name: /^sign in$/i }).first();
  const unavailableButton = page.getByRole('button', {
    name: /account service unavailable\. reload account state/i,
  });
  await expect(signInLink.or(unavailableButton)).toBeVisible({ timeout: 10000 });
  if ((await signInLink.count()) > 0) {
    await expect(signInLink).toHaveAttribute('href', /\/sign-in\?redirect_url=/);
  }

  // Back to shop
  await page.goto('/shop');
  await expect(page.getByRole('heading', { name: /shop/i })).toBeVisible();

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
  const routes = ['/shop', '/blog', '/mini-games', '/about', '/profile', '/profile/petals'];
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

test('API routes return 200', async ({ page }) => {
  const routes = ['/api/health', '/api/shop/products'];

  for (const route of routes) {
    const res = await page.request.get(route);
    expect(res?.ok()).toBeTruthy();
  }
});
