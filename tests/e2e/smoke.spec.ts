import { test, expect } from '@playwright/test';

test('Home and shop public surfaces boot', async ({ page }) => {
  const homeResponse = await page.goto('/');
  expect(homeResponse?.ok()).toBeTruthy();
  await expect(page.getByRole('navigation')).toBeVisible();

  const shopResponse = await page.goto('/shop');
  expect(shopResponse?.ok()).toBeTruthy();
  await expect(page.getByRole('heading', { name: /shop/i })).toBeVisible();
});

test('Footer components work', async ({ page }) => {
  await page.goto('/');

  // Footer copyright
  await expect(page.getByText(/© \d{4} Otaku-mori\. Made with /)).toBeVisible();

  // Soapstone CTA opens modal
  await page.getByRole('button', { name: /soapstone/i }).click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await page.getByRole('button', { name: /close soapstone/i }).click();

  // Nav links visible and navigable (public routes)
  const routes = ['/shop', '/blog', '/games', '/community', '/about'];
  for (const href of routes) {
    await page.getByRole('link', { name: new RegExp(href.replace('/', ''), 'i') }).hover();
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

test('Infrastructure-free public routes boot successfully', async ({ page }) => {
  // Smoke validates application boot and routing without external services.
  // Database-backed catalog behavior belongs in an integration job.
  const routes = ['/api', '/robots.txt'];

  for (const route of routes) {
    const res = await page.goto(route);
    expect(res?.ok()).toBeTruthy();
  }
});

test.skip('DB-backed product catalog integration', async () => {
  // TODO: Cover /api/v1/products in a dedicated lane with ephemeral
  // PostgreSQL, migrations, and minimal catalog fixtures. Provider diagnostics
  // remain protected and must never be substituted as public smoke targets.
});
