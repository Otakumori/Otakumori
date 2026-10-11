import { expect, test, type Page } from '@playwright/test';

const viewports = [
  { name: 'mobile', width: 390, height: 844 },
  { name: 'desktop', width: 1280, height: 900 },
] as const;

const visualQaAuthEnabled =
  process.env.OTM_VISUAL_QA_AUTH === '1' ||
  process.env.NEXT_PUBLIC_OTM_VISUAL_QA_AUTH === '1';

async function expectProtectedCommanderBoundary(
  page: Page,
  returnPath: '/profile' | '/orders',
) {
  const response = await page.request.get(returnPath, { maxRedirects: 0 });
  expect(response.status()).toBe(307);

  const location = response.headers().location;
  expect(location).toBeTruthy();

  const clerkUrl = new URL(location!);
  expect(clerkUrl.origin).toBe('https://accounts.otaku-mori.com');
  expect(clerkUrl.pathname).toBe('/sign-in');

  const redirectUrl = clerkUrl.searchParams.get('redirect_url');
  expect(redirectUrl).toBeTruthy();

  const expectedOrigin = new URL(process.env.BASE_URL ?? 'http://localhost:3000').origin;
  const parsedRedirectUrl = new URL(redirectUrl!);
  expect(parsedRedirectUrl.origin).toBe(expectedOrigin);
  expect(parsedRedirectUrl.pathname).toBe(returnPath);
}

for (const viewport of viewports) {
  test(`Commander profile preserves private access and archive composition on ${viewport.name}`, async ({
    page,
  }) => {
    await page.setViewportSize(viewport);

    if (!visualQaAuthEnabled) {
      await expectProtectedCommanderBoundary(page, '/profile');
      return;
    }

    await page.goto('/profile');

    await expect(page.getByRole('heading', { level: 1, name: 'Wanderer' })).toBeVisible();
    await expect(page.getByRole('navigation', { name: 'Commander archive' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Profile' })).toHaveAttribute(
      'aria-current',
      'page',
    );
    await expect(
      page.getByRole('heading', { name: /sign in to view your otaku-mori profile/i }),
    ).toBeVisible();

    const widths = await page.evaluate(() => ({
      client: document.documentElement.clientWidth,
      scroll: document.documentElement.scrollWidth,
    }));
    expect(widths.scroll).toBeLessThanOrEqual(widths.client + 1);
  });

  test(`Commander orders preserves private access and archive composition on ${viewport.name}`, async ({
    page,
  }) => {
    await page.setViewportSize(viewport);

    if (!visualQaAuthEnabled) {
      await expectProtectedCommanderBoundary(page, '/orders');
      return;
    }

    await page.goto('/orders');

    await expect(page.getByRole('heading', { level: 1, name: 'Orders' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Orders' })).toHaveAttribute(
      'aria-current',
      'page',
    );
    await expect(page.getByRole('heading', { name: 'Sign in to view your orders' })).toBeVisible();

    const widths = await page.evaluate(() => ({
      client: document.documentElement.clientWidth,
      scroll: document.documentElement.scrollWidth,
    }));
    expect(widths.scroll).toBeLessThanOrEqual(widths.client + 1);
  });
}
