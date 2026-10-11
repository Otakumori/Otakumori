import { expect, test, type Page } from '@playwright/test';
import { mkdir } from 'node:fs/promises';
import path from 'node:path';

test.describe.configure({ mode: 'serial', timeout: 60_000 });

const viewports = [
  { name: 'mobile', width: 390, height: 844 },
  { name: 'tablet', width: 768, height: 1024 },
  { name: 'desktop', width: 1280, height: 900 },
] as const;

const fixtureResponse = {
  ok: true,
  data: {
    results: [
      {
        id: 'discovery-fixture-product',
        type: 'product',
        title: 'Moon Reliquary',
        description: 'A fixture record used only for Discovery composition QA.',
        url: '/shop/product/discovery-fixture-product',
        metadata: {
          priceCents: 4200,
          category: 'Relics',
          imageUrl: '/assets/ui/mori/empty-states/mori-empty-search-results.webp',
        },
      },
    ],
    totalCount: 1,
    hasMore: false,
  },
};

async function expectNoHorizontalOverflow(page: Page) {
  const widths = await page.evaluate(() => ({
    client: document.documentElement.clientWidth,
    scroll: document.documentElement.scrollWidth,
  }));

  expect(widths.scroll).toBeLessThanOrEqual(widths.client + 1);
}

async function captureVisualQa(page: Page, filename: string) {
  const outputDirectory = process.env.DISCOVERY_VISUAL_QA_DIR;
  if (!outputDirectory) return;

  await mkdir(outputDirectory, { recursive: true });
  await page.screenshot({ path: path.join(outputDirectory, filename), fullPage: true });
}

async function openDiscovery(page: Page) {
  await page.goto('/search', { waitUntil: 'domcontentloaded', timeout: 60_000 });
  await page.waitForLoadState('networkidle');
}

for (const viewport of viewports) {
  test(`Discovery search keeps its hierarchy and result clarity on ${viewport.name}`, async ({
    page,
  }) => {
    await page.setViewportSize(viewport);
    await page.route('**/api/v1/search', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(fixtureResponse),
      });
    });

    await openDiscovery(page);

    await expect(page.getByRole('heading', { level: 1, name: 'Search Otaku-mori' })).toBeVisible();
    if (viewport.name === 'desktop') {
      await captureVisualQa(page, 'search-initial-desktop-1280x900.png');
    }
    const input = page.getByRole('textbox', { name: 'Search Otaku-mori' });
    await expect(input).toHaveAttribute('placeholder', 'What’re ya eyein’?');
    await input.fill('moon');
    await page.getByRole('button', { name: 'Search', exact: true }).click();

    await expect(page.getByRole('heading', { name: '1 result for "moon"' })).toBeVisible();
    await expect(page.getByRole('link', { name: /Moon Reliquary/i })).toBeVisible();
    await expectNoHorizontalOverflow(page);
    await captureVisualQa(
      page,
      `search-results-${viewport.name}-${viewport.width}x${viewport.height}.png`,
    );
  });
}

for (const viewport of viewports) {
  test(`Discovery blog preserves editorial hierarchy on ${viewport.name}`, async ({ page }) => {
    await page.setViewportSize(viewport);
    await page.goto('/blog', { waitUntil: 'domcontentloaded', timeout: 60_000 });
    await page.waitForLoadState('networkidle');

    await expect(page.getByRole('heading', { level: 1, name: 'Blog' })).toBeVisible();
    await expect(page.locator('main[data-mori-archetype="discovery"]')).toBeVisible();

    const emptyState = page.getByRole('heading', { name: 'No stories have been posted yet' });
    const populatedState = page.locator('.discovery-story__link').first();
    await expect(emptyState.or(populatedState)).toBeVisible();
    await expectNoHorizontalOverflow(page);
    await captureVisualQa(
      page,
      `blog-browse-${viewport.name}-${viewport.width}x${viewport.height}.png`,
    );
  });
}

test('Discovery search exposes a bounded empty state', async ({ page }) => {
  await page.route('**/api/v1/search', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ ok: true, data: { results: [], totalCount: 0, hasMore: false } }),
    });
  });

  await openDiscovery(page);
  const input = page.getByRole('textbox', { name: 'Search Otaku-mori' });
  await input.fill('missing relic');
  await page.getByRole('button', { name: 'Search', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'No results found' })).toBeVisible();
  await captureVisualQa(page, 'search-empty-desktop-1280x720.png');
});

test('Discovery search exposes a bounded error state', async ({ page }) => {
  await page.route('**/api/v1/search', async (route) => {
    await route.fulfill({ status: 503, body: '' });
  });

  await openDiscovery(page);
  const input = page.getByRole('textbox', { name: 'Search Otaku-mori' });
  await input.fill('unavailable archive');
  await page.getByRole('button', { name: 'Search', exact: true }).click();
  const errorState = page.locator('[data-mori-system-state="error"]');
  await expect(errorState).toHaveAttribute('role', 'alert');
  await expect(errorState).toContainText('Search is temporarily unavailable');
  await captureVisualQa(page, 'search-error-desktop-1280x720.png');
});

test('Discovery composition preserves meaning with reduced motion', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await openDiscovery(page);

  await expect(page.getByRole('heading', { level: 1, name: 'Search Otaku-mori' })).toBeVisible();
  await expect(page.getByRole('search')).toBeVisible();
  const input = page.getByRole('textbox', { name: 'Search Otaku-mori' });
  await input.focus();
  await expect(input).toBeFocused();
  await page.evaluate(() => {
    document.documentElement.style.fontSize = '200%';
  });
  await expectNoHorizontalOverflow(page);
});
