import { test, expect } from '@playwright/test';

import { expectRootFooterContract, expectSinglePrimaryNavigation } from './helpers/home';

test('Home account entry → Shop → Add to cart', async ({ page }) => {
  await page.goto('/');
  await expectSinglePrimaryNavigation(page);

  if ((await page.locator('body[data-visual-qa-auth="true"]').count()) > 0) {
    // The localhost-only visual-QA shell intentionally avoids Clerk initialization.
    await expect(page.getByTestId('mori-root-footer').getByRole('link', { name: 'Account' })).toHaveAttribute(
      'href',
      '/account',
    );
  } else {
    // Real auth shell: Clerk redirect entry point or a bounded unavailable state.
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

  // First product
  const productHref = await page.getByTestId('product-card').first().getAttribute('href');
  expect(productHref).toBeTruthy();
  await page.goto(productHref!);
  await page.getByRole('button', { name: /add to cart/i }).click();

  // Observe the canonical cart state before exercising the compatibility
  // redirect with a document navigation. This proves that Add to Cart wrote
  // the item without seeding test-only state or relying on an arbitrary delay.
  await expect(page.getByTestId('cart-success')).toBeVisible();
  await expect
    .poll(() =>
      page.evaluate(() => {
        const persistedCart = window.localStorage.getItem('cart');
        if (!persistedCart) return 0;
        const items = JSON.parse(persistedCart);
        return Array.isArray(items) ? items.length : 0;
      }),
    )
    .toBe(1);

  // Cart page
  await page.goto('/cart');
  await expect(page).toHaveURL('/shop/cart');
  await expect
    .poll(() =>
      page.evaluate(() => {
        const persistedCart = window.localStorage.getItem('cart');
        if (!persistedCart) return 0;
        const items = JSON.parse(persistedCart);
        return Array.isArray(items) ? items.length : 0;
      }),
    )
    .toBe(1);
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

test('API readiness and catalog availability are truthful', async ({ page }) => {
  const health = await page.request.get('/api/health');
  expect(health.status()).toBe(200);
  await expect(health.json()).resolves.toMatchObject({ ok: true, status: 'healthy' });

  const catalog = await page.request.get('/api/shop/products');
  const payload = await catalog.json();

  // Disposable GitHub E2E runs deliberately use an unreachable Printify endpoint.
  // Verify the catalog fails closed there; normal environments must still be available.
  const isIsolatedVisualQaCI =
    process.env.CI === 'true' && process.env.OTM_VISUAL_QA_AUTH === '1';
  if (isIsolatedVisualQaCI) {
    expect(catalog.status()).toBe(503);
    expect(payload).toMatchObject({
      source: 'unavailable',
      code: 'PRODUCT_CATALOG_UNAVAILABLE',
      products: [],
    });
    return;
  }

  expect(catalog.status()).toBe(200);
  expect(payload.source).not.toBe('error');
  expect(payload.source).not.toBe('unavailable');
  expect(Array.isArray(payload.products)).toBe(true);
});
