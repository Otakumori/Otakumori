import { test, expect } from '@playwright/test';

test.describe('Homepage petal stream guardrail', () => {
  test('should keep the legacy petal stream off homepage and mini-games', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    await expect(page.locator('[data-petal-stream]')).toHaveCount(0);
    await expect(page.locator('[data-petal-stream] canvas')).toHaveCount(0);

    await page.goto('/mini-games');
    await page.waitForLoadState('networkidle');

    await expect(page.locator('[data-petal-stream]')).toHaveCount(0);
  });

  test('should stay static when reduced motion is preferred', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    await expect(page.locator('[data-petal-stream]')).toHaveCount(0);
    await expect(page.locator('canvas')).toHaveCount(0);
  });

  test('should not require WebGL2 for homepage rendering', async ({ page }) => {
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

    await expect(page.getByRole('heading', { name: /Welcome, Traveler/i })).toBeVisible();
    await expect(page.getByText('Petal stream unavailable')).toHaveCount(0);
  });

  test('should not call petal collection during passive homepage load', async ({ page }) => {
    let collectRequests = 0;

    await page.route('/api/v1/petals/collect', (route) => {
      collectRequests += 1;
      route.fulfill({
        status: 429,
        contentType: 'application/json',
        body: JSON.stringify({ ok: false, error: 'Rate limited' }),
      });
    });

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    expect(collectRequests).toBe(0);
  });

  test('should not show legacy petal cap UI during passive homepage load', async ({ page }) => {
    await page.route('/api/v1/petals/collect', (route) => {
      route.fulfill({
        status: 429,
        contentType: 'application/json',
        body: JSON.stringify({ ok: false, error: 'Rate limited' }),
      });
    });

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    await expect(page.getByText('Daily cap reached')).toHaveCount(0);
  });
});
