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

const previewOrigin = new URL(process.env.BASE_URL || process.env.PREVIEW_URL || 'http://localhost:3000').origin;

function requireSecretEnv(name: string) {
  const value = process.env[name];
  if (!value) throw new Error(`${name} is required for commerce release validation`);
  return value;
}

async function installVercelBypassCookie(page: Page) {
  const bypass = getVercelBypassSecret();
  if (!bypass) return;

  await page.route('**/*', async (route) => {
    const request = route.request();
    const url = new URL(request.url());
    if (url.origin !== previewOrigin) {
      await route.continue();
      return;
    }

    await route.continue({
      headers: {
        ...request.headers(),
        'x-vercel-protection-bypass': bypass,
      },
    });
  });

  const response = await page.context().request.get('/', {
    headers: {
      'x-vercel-protection-bypass': bypass,
      'x-vercel-set-bypass-cookie': 'true',
    },
  });

  expect(response.status(), 'Vercel bypass cookie bootstrap should reach the Preview app').not.toBe(401);
}

function getVercelBypassSecret() {
  return process.env.VERCEL_AUTOMATION_BYPASS_SECRET || process.env.VERCEL_PROTECTION_BYPASS;
}

function getVercelBypassHeaders() {
  const bypass = getVercelBypassSecret();
  return bypass ? { 'x-vercel-protection-bypass': bypass } : undefined;
}

async function expectNoCriticalConsoleErrors(page: Page) {
  const errors: string[] = [];
  page.on('console', (message) => {
    if (message.type() !== 'error') return;
    const text = message.text();
    if (/favicon|net::ERR_ABORTED|ResizeObserver|failed to fetch rsc payload/i.test(text)) return;
    errors.push(text);
  });
  return () => {
    expect(errors.join('\n')).not.toMatch(/hydration|clerk: failed|application error/i);
  };
}

async function findSellableProduct(page: Page) {
  const response = await page.request.get('/api/v1/products?limit=25&inStock=true', {
    headers: getVercelBypassHeaders(),
  });
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
  const clerkLoadErrors: string[] = [];

  page.on('console', (message) => {
    const text = message.text();
    if (message.type() === 'error' && /clerk|otaku-mori\.com\/v1|clerk-js/i.test(text)) {
      clerkLoadErrors.push(text);
    }
  });

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
      try {
        await identifier.waitFor({ state: 'visible', timeout: 15_000 });
      } catch (error) {
        if (clerkLoadErrors.length > 0) {
          throw new Error(
            'Clerk Preview sign-in is blocked by Clerk custom-domain CORS. Configure Preview Clerk keys/origins so the Preview domain can load ClerkJS and Frontend API requests.',
          );
        }
        throw error;
      }
    } else {
      throw new Error('Clerk sign-in form did not render on Preview');
    }
  }

  await identifier.fill(email);
  await identifier.press('Enter');

  const passwordInput = page.locator('input[name="password"], input[type="password"]').first();
  await passwordInput.waitFor({ state: 'visible' });
  await passwordInput.fill(password);
  await passwordInput.press('Enter');

  const authError = page
    .getByText(/password is incorrect|couldn't find your account|invalid password|invalid email/i)
    .first();
  const result = await Promise.race([
    page
      .waitForURL((url) => !url.pathname.includes('/sign-in'), { timeout: 30_000 })
      .then(() => 'signed-in' as const),
    authError.waitFor({ state: 'visible', timeout: 30_000 }).then(() => 'auth-error' as const),
  ]);

  if (result === 'auth-error') {
    throw new Error(
      'BLOCKED_BY_ENV: Clerk E2E credentials were rejected by the Preview Clerk instance.',
    );
  }
}

test.describe('commerce release preview validation', () => {
  test.beforeEach(async ({ page }) => {
    await installVercelBypassCookie(page);
  });

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
    const health = await request.get('/api/health', { headers: getVercelBypassHeaders() });
    expect(health.status()).toBe(200);
    const healthBody = await health.json();
    expect(healthBody.ok).toBe(true);
    expect(JSON.stringify(healthBody)).not.toMatch(/sk_live|sk_test|Bearer\s+[A-Za-z0-9._-]+/i);
    expect(['pass', 'skipped']).toContain(healthBody.checks?.printify?.status);
    expect(['pass', 'skipped']).toContain(healthBody.checks?.merchize?.status);

    const catalogSync = await request.get('/api/admin/catalog-sync', { headers: getVercelBypassHeaders() });
    expect([302, 401, 403, 404]).toContain(catalogSync.status());
  });

  test('signed-in checkout loads seeded cart and only posts when payment is clicked', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'chromium', 'Clerk sign-in is validated once on desktop Chromium.');

    const assertNoConsoleErrors = await expectNoCriticalConsoleErrors(page);
    try {
      await signInWithClerk(page);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      if (
        process.env.npm_lifecycle_event === 'test:commerce-release'
        && message.includes('Clerk Preview sign-in is blocked by Clerk custom-domain CORS')
      ) {
        testInfo.annotations.push({
          type: 'blocked',
          description: 'Preview-domain Clerk CORS/config blocks auth on random Vercel Preview URLs.',
        });
        test.skip(true, message);
      }
      if (
        process.env.npm_lifecycle_event === 'test:commerce-release'
        && message.includes('BLOCKED_BY_ENV: Clerk E2E credentials were rejected')
      ) {
        testInfo.annotations.push({
          type: 'blocked',
          description: 'Preview Clerk rejected the configured CLERK_E2E_EMAIL/CLERK_E2E_PASSWORD.',
        });
        test.skip(true, message);
      }
      throw error;
    }
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

    await page.getByPlaceholder(/first name/i).fill('Preview');
    await page.getByPlaceholder(/last name/i).fill('Tester');
    await page.getByPlaceholder(/street address/i).fill('123 Preview Lane');
    await page.getByPlaceholder(/city/i).fill('New York');
    await page.locator('select[name="state"]').selectOption('NY');
    await page.getByPlaceholder(/zip code/i).fill('10001');
    await page.getByRole('button', { name: /proceed to payment/i }).click();

    await expect.poll(() => checkoutRequests).toBe(1);
    await expect(page.getByText(/release validation blocked checkout redirect/i)).toBeVisible();
    assertNoConsoleErrors();
  });

  test('signed-in checkout creates a Stripe TEST checkout session without completing payment', async ({ page }, testInfo) => {
    test.skip(
      process.env.STRIPE_CHECKOUT_PROOF !== '1',
      'Set STRIPE_CHECKOUT_PROOF=1 to create exactly one Stripe TEST checkout session.',
    );
    test.skip(testInfo.project.name !== 'chromium', 'Stripe checkout proof runs once on desktop Chromium.');

    await signInWithClerk(page);
    const { product, variant } = await findSellableProduct(page);

    await page.goto('/');
    const body = await page.evaluate(
      async ({ product, variant }) => {
        const response = await fetch('/api/v1/checkout/session', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-idempotency-key': `stripe-proof-${Date.now()}-${Math.random().toString(36).slice(2)}`,
          },
          body: JSON.stringify({
            items: [
              {
                productId: product.id,
                variantId: variant.id,
                name: product.title,
                quantity: 1,
                priceCents: variant.priceCents,
                sku: `SKU-${product.id}`,
              },
            ],
            shippingInfo: {
              firstName: 'Preview',
              lastName: 'Tester',
              email: 'preview-checkout-proof@example.com',
              address: '123 Preview Lane',
              city: 'New York',
              state: 'NY',
              zipCode: '10001',
              country: 'US',
            },
            successUrl: `${window.location.origin}/shop/checkout/success`,
            cancelUrl: `${window.location.origin}/shop/cart`,
          }),
        });

        return {
          status: response.status,
          ok: response.ok,
          json: await response.json(),
        };
      },
      { product, variant },
    );

    expect(body.status).toBe(200);
    expect(body.ok).toBe(true);
    const checkoutUrl = body.json?.data?.url;

    expect(body.json?.ok).toBe(true);
    expect(body.json?.data?.orderId).toBeTruthy();
    expect(checkoutUrl).toMatch(/^https:\/\/checkout\.stripe\.com\//);
    expect(checkoutUrl).toContain('cs_test_');
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
