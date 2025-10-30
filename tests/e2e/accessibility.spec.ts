import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

/**
 * Accessibility smoke tests using axe-core
 * Fails on 'serious' or 'critical' violations
 */

const routes = [
  { path: '/', name: 'Home' },
  { path: '/arcade', name: 'Arcade' },
  { path: '/age-check', name: 'Age Check' },
];

for (const route of routes) {
  test(`a11y: ${route.name} (${route.path})`, async ({ page }) => {
    await page.goto(route.path);

    // Wait for page to be fully loaded
    await page.waitForLoadState('networkidle');

    // Run axe accessibility checks
    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();

    // Filter for serious and critical violations only
    const seriousViolations = results.violations.filter((v) =>
      ['serious', 'critical'].includes(v.impact || 'minor'),
    );

    // Log violations if any
    if (seriousViolations.length > 0) {
      console.error(
        `Accessibility violations on ${route.path}:`,
        JSON.stringify(seriousViolations, null, 2),
      );
    }

    // Fail if there are serious/critical violations
    expect(
      seriousViolations,
      `Found ${seriousViolations.length} serious/critical accessibility violations on ${route.path}`,
    ).toHaveLength(0);
  });
}

// Dynamic product route test
test('a11y: Product detail page', async ({ page }) => {
  // First, get a product from the shop page
  await page.goto('/shop');
  await page.waitForLoadState('networkidle');

  // Find first product link
  const productLink = page.locator('a[href*="/products/"]').first();
  const hasProducts = (await productLink.count()) > 0;

  // Skip if no products available
  test.skip(!hasProducts, 'No products available to test');

  if (hasProducts) {
    await productLink.click();
    await page.waitForLoadState('networkidle');

    // Run axe checks on product page
    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();

    const seriousViolations = results.violations.filter((v) =>
      ['serious', 'critical'].includes(v.impact || 'minor'),
    );

    if (seriousViolations.length > 0) {
      console.error(
        'Accessibility violations on product page:',
        JSON.stringify(seriousViolations, null, 2),
      );
    }

    expect(
      seriousViolations,
      `Found ${seriousViolations.length} serious/critical accessibility violations on product page`,
    ).toHaveLength(0);
  }
});
