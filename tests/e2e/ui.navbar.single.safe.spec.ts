import { test, expect } from '@playwright/test';

import { expectSinglePrimaryNavigation } from './helpers/home';

test.describe('Navbar Single Rendering', () => {
  test('should render exactly one navbar on homepage', async ({ page }) => {
    await page.goto('/');

    // Wait for page to load
    await page.waitForLoadState('networkidle');

    await expectSinglePrimaryNavigation(page);
    await expect(page.getByRole('navigation', { name: /rooted homepage navigation/i })).toBeVisible();
    await expect(page.getByRole('navigation', { name: /otakumori social links/i })).toBeVisible();
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

    // Home contains one global Navbar and the two canonical footer navigation landmarks.
    await expect(page.getByRole('navigation')).toHaveCount(3);
    await expect(page.getByRole('navigation', { name: /rooted homepage navigation/i })).toBeVisible();
    await expect(page.getByRole('navigation', { name: /otakumori social links/i })).toBeVisible();
  });
});
