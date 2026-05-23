import { expect, test, type Page } from '@playwright/test';

type CatalogVariant = {
  id: string;
  title?: string | null;
  priceCents?: number | null;
  isEnabled?: boolean;
  inStock?: boolean;
};

type CatalogProduct = {
  id: string;
  title: string;
  image?: string | null;
  variants?: CatalogVariant[];
};

function requireSecretEnv(name: string) {
  const value = process.env[name];
  if (!value) throw new Error(`${name} is required for commerce release validation`);
  return value;
}

async function expectNoCriticalConsoleErrors(page: Page) {
  const errors: string[] = [];
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(message.text());
  });
  return () => {
    expect(errors.join('\n')).not.toMatch(/hydration|failed to fetch rsc payload|clerk: failed/i);
  };
}

async function findSellableProduct(page: Page) {
  const response = await page.request.get('/api/v1/products?limit=25&inStock=true');
  expect(response.ok()).toBeTruthy();
  const body = await response.json();
  const products = (body?.data?.products ?? []) as CatalogProduct[];

  for (const product of products) {
    const variant = product.variants?.find(
      (candidate) => candidate.id && candidate.isEnabled && candidate.inStock && (candidate.priceCents ?? 0) > 0,
    );
    if (variant?.priceCents) {
      return { product, variant };
    }
  }

  throw new Error('No sellable product variant available in Preview catalog');
}

async function seedCart(page: Page) {
  const { product, variant } = await findSellableProduct(page);
  await page.goto('/');
  await page.evaluate(
    ({ product, variant }) => {
      localStorage.setItem(
        'cart',
        JSON.stringify([
          {
            id: product.id,
            name: product.title,
            price: (variant.priceCents ?? 0) / 100,
            quantity: 1,
            image: product.image || '/placeholder-product.jpg',
            selectedVariant: {
              id: variant.id,
              title: variant.title || 'Default variant',
            },
          },
        ]),
      );
    },
    { product, variant },
  );
}

async function signInWithClerk(page: Page) {
  const email = requireSecretEnv('CLERK_E2E_EMAIL');
  const password = requireSecretEnv('CLERK_E2E_PASSWORD');

  await page.goto(`/sign-in?redirect_url=${encodeURIComponent('/shop/checkout')}`);
  if (!page.url().includes('/sign-in')) return;

  const identifier = page
    .locator(
      [
        'input[name="identifier"]',
        'input[name="email"]',
        'input[name="emailAddress"]',
        'input[type="email"]',
        'input[autocomplete="username"]',
        'input[autocomplete="email"]',
      ].join(', '),
    )
    .first();

  const signInButton = page.getByRole('button', { name: /^sign in$/i }).first();
  try {
    await identifier.waitFor({ state: 'visible', timeout: 10_000 });
  } catch {
    if (await signInButton.isVisible({ timeout: 5_000 }).catch(() => false)) {
      await signInButton.click();
      await identifier.waitFor({ state: 'visible', timeout: 15_000 });
    } else {
      throw new Error('Clerk sign-in form did not render on Preview');
    }
  }

  await identifier.fill(email);
  await page.getByRole('button', { name: /continue|sign in/i }).first().click();

  const passwordInput = page.locator('input[name="password"], input[type="password"]').first();
  await passwordInput.waitFor({ state: 'visible' });
  await passwordInput.fill(password);
  await page.getByRole('button', { name: /continue|sign in/i }).first().click();

  await page.waitForURL((url) => !url.pathname.includes('/sign-in'), { timeout: 30_000 });
}

test.describe('commerce release preview validation', () => {
  test('signed-out commerce routes require sign-in without creating checkout sessions', async ({ page }) => {
    const assertNoConsoleErrors = await expectNoCriticalConsoleErrors(page);
    let checkoutRequests = 0;
    await page.route('**/api/v1/checkout/session', async (route) => {
      checkoutRequests += 1;
      await route.abort('blockedbyclient');
    });

    await seedCart(page);
    await page.goto('/shop/cart');
    await expect(page.getByRole('heading', { name: /shopping cart/i })).toBeVisible();
    await page.getByRole('link', { name: /proceed to checkout/i }).click();
    await expect(page).toHaveURL(/\/sign-in/);
    expect(checkoutRequests).toBe(0);

    await page.goto('/shop/checkout');
    await expect(page.getByRole('heading', { name: /sign in required/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /sign in/i })).toBeVisible();
    expect(checkoutRequests).toBe(0);
    assertNoConsoleErrors();
  });

  test('health and provider diagnostics degrade safely without public admin access', async ({ request }) => {
    const health = await request.get('/api/health');
    expect(health.status()).toBe(200);
    const healthBody = await health.json();
    expect(healthBody.ok).toBe(true);
    expect(JSON.stringify(healthBody)).not.toMatch(/sk_live|sk_test|Bearer\s+[A-Za-z0-9._-]+/i);
    expect(['pass', 'skipped']).toContain(healthBody.checks?.printify?.status);
    expect(['pass', 'skipped']).toContain(healthBody.checks?.merchize?.status);

    const catalogSync = await request.get('/api/admin/catalog-sync');
    expect([302, 401, 403, 404]).toContain(catalogSync.status());
  });

  test('signed-in checkout loads seeded cart and only posts when payment is clicked', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'chromium', 'Clerk sign-in is validated once on desktop Chromium.');

    const assertNoConsoleErrors = await expectNoCriticalConsoleErrors(page);
    await signInWithClerk(page);
    await seedCart(page);

    let checkoutRequests = 0;
    await page.route('**/api/v1/checkout/session', async (route) => {
      checkoutRequests += 1;
      await route.fulfill({
        status: 418,
        contentType: 'application/json',
        body: JSON.stringify({ ok: false, error: 'release validation blocked checkout redirect' }),
      });
    });

    await page.goto('/shop/checkout');
    await expect(page.getByRole('heading', { name: /^checkout$/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /proceed to payment/i })).toBeVisible();
    expect(checkoutRequests).toBe(0);

    await page.getByPlaceholder(/street address/i).fill('123 Preview Lane');
    await page.getByPlaceholder(/city/i).fill('New York');
    await page.locator('select[name="state"]').selectOption('NY');
    await page.getByPlaceholder(/zip code/i).fill('10001');
    await page.getByRole('button', { name: /proceed to payment/i }).click();

    await expect.poll(() => checkoutRequests).toBe(1);
    await expect(page.getByText(/release validation blocked checkout redirect/i)).toBeVisible();
    assertNoConsoleErrors();
  });

  test('mobile and WebKit commerce routes render without critical runtime failures', async ({ page }) => {
    const assertNoConsoleErrors = await expectNoCriticalConsoleErrors(page);
    await page.goto('/shop');
    await expect(page.getByRole('heading', { name: /shop/i })).toBeVisible();

    await page.goto('/shop/cart');
    await expect(page.locator('main')).toBeVisible();

    await page.goto('/shop/checkout');
    await expect(page.locator('main')).toBeVisible();

    const bodyText = await page.locator('body').innerText();
    expect(bodyText).not.toMatch(/failed to fetch rsc payload|application error/i);
    assertNoConsoleErrors();
  });
});
