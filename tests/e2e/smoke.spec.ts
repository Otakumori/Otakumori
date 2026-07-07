import { test, expect } from '@playwright/test';

test('Home → Sign in → Shop → Add to cart', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('navigation')).toBeVisible();

  // Clerk redirect entry point (guest)
  const signInLink = page.getByRole('link', { name: /^sign in$/i }).first();
  await expect(signInLink).toBeVisible();
  await expect(signInLink).toHaveAttribute('href', /\/sign-in\?redirect_url=/);

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

  // Footer copyright
  await expect(page.getByText(/Otakumori ™ made with ♡/)).toBeVisible();
  await expect(page.getByText(/© \d{4} Otaku-mori\. All rights reserved\./)).toBeVisible();

  // Soapstone CTA opens modal
  await page.getByRole('button', { name: /soapstone/i }).click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await page.getByRole('button', { name: /close soapstone/i }).click();

  // Nav links visible and navigable (public routes)
  const routes = ['/shop', '/blog', '/mini-games', '/community', '/about'];
  for (const href of routes) {
    await page.locator(`a[href="${href}"]`).first().hover();
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
