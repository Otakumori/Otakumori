import { test, expect } from '@playwright/test';

test.describe('Navbar Single Rendering', () => {
  test('should render exactly one navbar on homepage', async ({ page }) => {
    await page.goto('/');

    // Wait for page to load
    await page.waitForLoadState('networkidle');

    // Count navbar elements - should be exactly 1
    const navbarCount = await page.locator('nav, [role="navigation"], header').count();
    expect(navbarCount).toBe(1);

    // Verify the navbar is visible
    const navbar = page.locator('nav, [role="navigation"], header').first();
    await expect(navbar).toBeVisible();
  });

  test('should render exactly one navbar on mini-games page', async ({ page }) => {
    await page.goto('/mini-games');

    // Wait for page to load
    await page.waitForLoadState('networkidle');

    // Count navbar elements - should be exactly 1
    const navbarCount = await page.locator('nav, [role="navigation"], header').count();
    expect(navbarCount).toBe(1);

    // Verify the navbar is visible
    const navbar = page.locator('nav, [role="navigation"], header').first();
    await expect(navbar).toBeVisible();
  });

  test('should not have duplicate navigation elements', async ({ page }) => {
    await page.goto('/');

    // Wait for page to load
    await page.waitForLoadState('networkidle');

    // Check for common navbar selectors
    const navSelectors = [
      'nav',
      '[role="navigation"]',
      'header',
      '.navbar',
      '.navigation',
      '.header',
    ];

    for (const selector of navSelectors) {
      const elements = await page.locator(selector).count();
      if (elements > 0) {
        expect(elements).toBe(1);
      }
    }
  });
});
