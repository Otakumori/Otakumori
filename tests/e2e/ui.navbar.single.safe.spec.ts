import { test, expect } from '@playwright/test';

import { expectSinglePrimaryNavigation } from './helpers/home';

test.describe('Navbar Single Rendering', () => {
  test('should render exactly one navbar on homepage', async ({ page }) => {
    await page.goto('/');

    // Wait for page to load
    await page.waitForLoadState('networkidle');

    await expectSinglePrimaryNavigation(page);
    await expect(page.getByRole('navigation', { name: /rooted homepage navigation/i })).toBeVisible();
    await expect(page.getByRole('navigation', { name: /homepage utility navigation/i })).toBeVisible();
  });

  test('should render exactly one navbar on mini-games page', async ({ page }) => {
    await page.goto('/mini-games');

    // Wait for page to load
    await page.waitForLoadState('networkidle');

    await expectSinglePrimaryNavigation(page);
  });

  test('should not have duplicate navigation elements', async ({ page }) => {
    await page.goto('/');

    // Wait for page to load
    await page.waitForLoadState('networkidle');

    await expectSinglePrimaryNavigation(page);
    await expect(page.locator('header')).toHaveCount(1);
    await expect(page.getByRole('navigation')).toHaveCount(3);
    await expect(page.getByRole('navigation', { name: /rooted homepage navigation/i })).toBeVisible();
    await expect(page.getByRole('navigation', { name: /homepage utility navigation/i })).toBeVisible();
  });
});
