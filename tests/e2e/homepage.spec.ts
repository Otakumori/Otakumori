import { test, expect } from '@playwright/test';

test.describe('Homepage', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should load homepage with hero section', async ({ page }) => {
    // Check that the hero section is visible
    await expect(page.locator('h1')).toContainText('Welcome home, traveler');

    // Check that the cherry tree is present
    await expect(page.locator('img[alt="Cherry Blossom Tree"]')).toBeVisible();
  });

  test('should respect reduced motion preference', async ({ page }) => {
    // Set reduced motion preference
    await page.emulateMedia({ reducedMotion: 'reduce' });

    // Reload page to apply the preference
    await page.reload();

    // Check that animations are disabled
    const cherryTree = page.locator('img[alt="Cherry Blossom Tree"]');
    await expect(cherryTree).toBeVisible();

    // Verify no animation styles are applied
    const style = await cherryTree.evaluate((el) => {
      const computedStyle = window.getComputedStyle(el);
      return {
        transform: computedStyle.transform,
        animation: computedStyle.animation,
      };
    });

    expect(style.transform).toBe('none');
    expect(style.animation).toBe('none');
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

  test('should show fallback content when live data is disabled', async ({ page }) => {
    // Check for fallback messages
    const fallbackMessages = page.locator(
      'text=currently undergoing maintenance, text=No mini-games available, text=No soapstone messages found',
    );
    const fallbackCount = await fallbackMessages.count();

    // Should have at least one fallback message when live data is off
    expect(fallbackCount).toBeGreaterThan(0);
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
    const h1 = page.locator('h1');
    await expect(h1).toBeVisible();

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
    await expect(page.locator('h1')).toBeVisible();

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
