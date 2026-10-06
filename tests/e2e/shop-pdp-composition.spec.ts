import { test, expect, type Page } from '@playwright/test';
import { compositionProduct, compositionProducts } from '../fixtures/shop-composition';

async function mockCatalogue(page: Page) {
  await page.route('**/api/v1/catalog?*', async (route) => {
    const query = new URL(route.request().url()).searchParams;
    await route.fulfill({
      json: {
        ok: true,
        data: {
          products: query.get('q') === 'not-in-fixture' ? [] : compositionProducts,
          filters: { availableCategories: ['books', 'figures', 'art'] },
        },
      },
    });
  });
  await page.route('**/api/v1/products/qa-archive-book', (route) =>
    route.fulfill({ json: { ok: true, data: compositionProduct } }),
  );
}

async function noOverflow(page: Page) {
  expect(
    await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1),
  ).toBe(true);
}

test('catalogue controls and canonical product inspection preserve supported behavior', async ({
  page,
}) => {
  await mockCatalogue(page);
  await page.goto('/shop');
  await expect(page.getByTestId('product-card')).toHaveCount(3);
  await page.getByLabel('Search the collection').fill('not-in-fixture');
  await page.getByRole('button', { name: 'Search', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'No matching pieces' })).toBeVisible();
  await page.getByRole('button', { name: 'Browse all products' }).click();
  await page.getByText('Filter and sort', { exact: true }).click();
  await page.getByLabel('Category', { exact: true }).selectOption('books');
  await page.getByLabel('Sort by').selectOption('price-asc');
  const query = page.waitForRequest(
    (request) =>
      request.url().includes('/api/v1/catalog?') &&
      request.url().includes('sortBy=price') &&
      request.url().includes('category=books'),
  );
  await page.getByRole('button', { name: 'Apply', exact: true }).click();
  await query;
  await page.getByTestId('product-card').first().focus();
  await expect(page.getByTestId('product-card').first()).toBeFocused();
  await page.getByTestId('product-card').first().press('Enter');
  await expect(page).toHaveURL(/\/shop\/product\/qa-archive-book/);
  await expect(page.getByTestId('product-name')).toHaveText(compositionProduct.title);
  await page.getByLabel('Select Variant').selectOption('variant-2');
  await expect(page.getByTestId('product-price')).toHaveText('$32.00');
  await expect(page.getByRole('button', { name: 'Add to Cart' })).toBeEnabled();
  await expect(page.getByRole('img', { name: compositionProduct.title })).toHaveAttribute(
    'sizes',
    /max-width/,
  );
  // No cart/order/payment or provider-backed mutation is performed by this test.
});

test('catalogue empty/error and unavailable PDP remain bounded', async ({ page }) => {
  await page.route('**/api/v1/catalog?*', (route) =>
    route.fulfill({ json: { ok: true, data: { products: [] } } }),
  );
  await page.goto('/shop');
  await expect(
    page.getByRole('heading', { name: 'The collection is between arrivals' }),
  ).toBeVisible();
  await expect(page.getByRole('main')).not.toContainText(/sync|admin|configuration/i);
  await page.route('**/api/v1/catalog?*', (route) =>
    route.fulfill({ status: 503, json: { error: 'internal diagnostic not for display' } }),
  );
  await page.reload();
  await expect(
    page.getByRole('heading', { name: 'Storefront temporarily unavailable' }),
  ).toBeVisible();
  await expect(page.getByRole('button', { name: 'Try again' })).toBeVisible();
  await page.route('**/api/v1/products/qa-unavailable', (route) =>
    route.fulfill({ status: 404, json: { ok: false } }),
  );
  await page.goto('/shop/product/qa-unavailable');
  await expect(page.getByRole('heading', { name: 'Product unavailable' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Return to Shop' })).toHaveAttribute('href', '/shop');
  await expect(page.getByRole('main')).not.toContainText(/diagnostic|configuration|stack/i);
});

test('commerce records recompose across narrow, tablet and desktop widths', async ({ page }) => {
  test.setTimeout(120000);
  await mockCatalogue(page);
  await page.goto('/shop');
  await expect(page.getByTestId('product-card')).toHaveCount(3);
  for (const width of [320, 360, 375, 390, 412, 430, 768, 1280, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    await noOverflow(page);
    await expect(page.getByLabel('Search the collection')).toBeVisible();
  }
  await page.goto('/shop/product/qa-archive-book');
  await expect(page.getByTestId('product-name')).toBeVisible();
  for (const width of [320, 360, 375, 390, 412, 430, 768, 1280, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    await noOverflow(page);
    await expect(page.getByLabel('Select Variant')).toBeVisible();
    const names = await page.getByRole('button', { name: 'Add to Cart' }).evaluate((element) => {
      const rect = element.getBoundingClientRect();
      return { width: rect.width, font: parseFloat(getComputedStyle(element).fontSize) };
    });
    expect(names.width).toBeGreaterThanOrEqual(44);
    expect(names.font).toBeGreaterThanOrEqual(12);
  }
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.setViewportSize({ width: 640, height: 450 }); // 1280px viewport at 200% reflow.
  await noOverflow(page);
  await page.getByLabel('Select Variant').selectOption('variant-2');
  await expect(page.getByTestId('product-price')).toHaveText('$32.00');
});
