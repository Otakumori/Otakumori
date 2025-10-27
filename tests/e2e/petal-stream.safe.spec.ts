import { test, expect } from '@playwright/test';

test.describe('HomePetalStream Component', () => {
  test('should mount on homepage but not on mini-games', async ({ page }) => {
    // Test homepage
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Check if petal stream component exists (it should be present in the DOM)
    const petalStream = page.locator('[data-petal-stream]');
    await expect(petalStream).toBeVisible();

    // Test mini-games page
    await page.goto('/mini-games');
    await page.waitForLoadState('networkidle');

    // Petal stream should not be visible on mini-games
    const petalStreamOnMiniGames = page.locator('[data-petal-stream]');
    await expect(petalStreamOnMiniGames).not.toBeVisible();
  });

  test('should respect reduced motion preference', async ({ page }) => {
    // Set reduced motion preference
    await page.emulateMedia({ reducedMotion: 'reduce' });

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // With reduced motion, should show passive effect only
    const petalStream = page.locator('[data-petal-stream]');
    await expect(petalStream).toBeVisible();

    // Should not have interactive cursor
    const canvas = petalStream.locator('canvas');
    const cursorStyle = await canvas.evaluate((el) => getComputedStyle(el).cursor);
    expect(cursorStyle).toBe('default');
  });

  test('should handle WebGL2 context creation', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Check if canvas is present
    const canvas = page.locator('[data-petal-stream] canvas');
    await expect(canvas).toBeVisible();

    // Check if canvas has proper attributes
    const canvasElement = await canvas.elementHandle();
    if (canvasElement) {
      const context = await canvasElement.evaluate((canvas) => {
        return canvas.getContext('webgl2') !== null;
      });
      expect(context).toBe(true);
    }
  });

  test('should show error state when WebGL2 is not supported', async ({ page }) => {
    // Mock WebGL2 as unsupported
    await page.addInitScript(() => {
      const originalGetContext = HTMLCanvasElement.prototype.getContext;
      HTMLCanvasElement.prototype.getContext = function (type: string) {
        if (type === 'webgl2') {
          return null;
        }
        return originalGetContext.call(this, type);
      };
    });

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Should show error message
    const errorMessage = page.locator('text=Petal stream unavailable');
    await expect(errorMessage).toBeVisible();
  });

  test('should handle daily cap reached state', async ({ page }) => {
    // Mock API to return 429 (rate limited)
    await page.route('/api/v1/petals/collect', (route) => {
      route.fulfill({
        status: 429,
        contentType: 'application/json',
        body: JSON.stringify({ ok: false, error: 'Rate limited' }),
      });
    });

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Wait a bit for the component to try collecting
    await page.waitForTimeout(2000);

    // Should show daily cap message
    const dailyCapMessage = page.locator('text=Daily cap reached');
    await expect(dailyCapMessage).toBeVisible();
  });
});
