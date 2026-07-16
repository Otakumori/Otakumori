import { test, expect } from '@playwright/test';

test.describe('Homepage', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should load homepage with hero section', async ({ page }) => {
    // Check that the hero section is visible
    await expectHeroHeading(page);

    // Check that the cherry tree is present
    await expect(page.getByRole('img', { name: /Otakumori sakura tree scene/i })).toBeVisible();
  });

  test('should respect reduced motion preference', async ({ page }) => {
    // Set reduced motion preference
    await page.emulateMedia({ reducedMotion: 'reduce' });

    // Reload page to apply the preference
    await page.reload();

    // Check that animations are disabled
    const cherryTree = page.getByRole('img', { name: /Otakumori sakura tree scene/i });
    await expect(cherryTree).toBeVisible();

    // The app collapses motion to near-zero durations for reduced motion.
    const style = await cherryTree.evaluate((el) => {
      const computedStyle = window.getComputedStyle(el);
      return {
        transform: computedStyle.transform,
        animationDuration: computedStyle.animationDuration,
        transitionDuration: computedStyle.transitionDuration,
      };
    });

    expect(style.transform).toBe('none');
    expect(maxCssDurationMs(style.animationDuration)).toBeLessThanOrEqual(0.01);
    expect(maxCssDurationMs(style.transitionDuration)).toBeLessThanOrEqual(0.01);
  });

  test('should collect interactive petals in hero section', async ({ page }) => {
    // Wait for petals to load
    await page.waitForTimeout(2000);

    // Find interactive petals
    const petals = page.locator('[data-petal-id]');
    const petalCount = await petals.count();

    if (petalCount > 0) {
      // Click on the first petal
      await petals.first().click();

      // Verify petal was collected (opacity should be 0)
      const firstPetal = petals.first();
      await expect(firstPetal).toHaveCSS('opacity', '0');
    }
  });

  test('should not intercept clicks on content cards', async ({ page }) => {
    // Wait for content to load
    await page.waitForTimeout(2000);

    // Look for any content cards (shop, games, blog)
    const contentCards = page.locator('a[href*="/shop"], a[href*="/mini-games"], a[href*="/blog"]');
    const cardCount = await contentCards.count();

    if (cardCount > 0) {
      // Click on the first content card
      const firstCard = contentCards.first();
      const href = await firstCard.getAttribute('href');

      // Click should navigate, not be intercepted by petals
      await firstCard.click();

      // Verify navigation occurred
      await expect(page).toHaveURL(new RegExp(href || ''));
    }
  });

  test('should render resilient home sections when live data is unavailable', async ({ page }) => {
    await expect(page.getByText('Shop').first()).toBeVisible();
    await expect(page.getByText('Mini-Games').first()).toBeVisible();
    await expect(page.getByText(/Leave a sign for fellow travelers/i)).toBeVisible();
  });

  test('should handle soapstone submission when enabled', async ({ page }) => {
    // Look for soapstone composer
    const composer = page.locator('textarea[placeholder*="message"]');

    if (await composer.isVisible()) {
      // Type a test message
      await composer.fill('Test soapstone message');

      // Submit the form
      const submitButton = page.locator('button[type="submit"]');
      await submitButton.click();

      // Check for success message
      await expect(page.locator('text=Message submitted successfully')).toBeVisible();
    }
  });

  test('should prevent duplicate soapstone submissions', async ({ page }) => {
    // Look for soapstone composer
    const composer = page.locator('textarea[placeholder*="message"]');

    if (await composer.isVisible()) {
      const testMessage = 'Duplicate test message';

      // Submit first message
      await composer.fill(testMessage);
      await page.locator('button[type="submit"]').click();
      await page.waitForTimeout(1000);

      // Try to submit the same message again
      await composer.fill(testMessage);
      await page.locator('button[type="submit"]').click();

      // Should show duplicate prevention message
      await expect(
        page.locator('text=Please wait before submitting a similar message'),
      ).toBeVisible();
    }
  });

  test('should have proper accessibility attributes', async ({ page }) => {
    // Check for proper heading structure
    await expectHeroHeading(page);

    // Check for proper alt text on images
    const images = page.locator('img');
    const imageCount = await images.count();

    for (let i = 0; i < imageCount; i++) {
      const img = images.nth(i);
      const alt = await img.getAttribute('alt');
      expect(alt).toBeTruthy();
    }

    // Check for proper button labels
    const buttons = page.locator('button');
    const buttonCount = await buttons.count();

    for (let i = 0; i < buttonCount; i++) {
      const button = buttons.nth(i);
      const ariaLabel = await button.getAttribute('aria-label');
      const textContent = await button.textContent();

      // Should have either aria-label or text content
      expect(ariaLabel || textContent).toBeTruthy();
    }
  });

  test('should load within performance budget', async ({ page }) => {
    const startTime = Date.now();

    // Navigate to homepage
    await page.goto('/');

    // Wait for hero section to be visible
    await expectHeroHeading(page);

    const loadTime = Date.now() - startTime;

    // Should load within 2.5 seconds (LCP target)
    expect(loadTime).toBeLessThan(2500);
  });

  test('should handle keyboard navigation', async ({ page }) => {
    // Tab through interactive elements
    await page.keyboard.press('Tab');

    // Check that focus is visible
    const focusedElement = page.locator(':focus');
    await expect(focusedElement).toBeVisible();

    // Tab through more elements
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');

    // Focus should still be visible
    await expect(focusedElement).toBeVisible();
  });
});

async function expectHeroHeading(page: import('@playwright/test').Page) {
  const heroHeading = page.getByRole('heading', {
    level: 1,
    name: /Rest beneath the sakura tree/i,
  });

  await expect(heroHeading).toHaveCount(1);
  await expect(heroHeading).toBeVisible();
}

function maxCssDurationMs(value: string) {
  return Math.max(
    ...value.split(',').map((part) => {
      const duration = part.trim();
      if (duration.endsWith('ms')) return Number.parseFloat(duration);
      if (duration.endsWith('s')) return Number.parseFloat(duration) * 1000;
      return Number.parseFloat(duration) || 0;
    }),
  );
}
