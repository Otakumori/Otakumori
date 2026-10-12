import { expect, test } from '@playwright/test';

test.describe('Game Threshold', () => {
  test('keeps the canonical game collection semantic and responsive', async ({ page }) => {
    test.setTimeout(60_000);

    for (const viewport of [
      { width: 390, height: 844 },
      { width: 1280, height: 900 },
    ]) {
      await page.setViewportSize(viewport);
      await page.goto('/mini-games');

      await expect(page.locator('section[data-mori-archetype="game-threshold"]')).toBeVisible();
      await expect(page.getByRole('heading', { level: 1, name: 'Mini-Games' })).toBeVisible({
        timeout: 15_000,
      });
      await expect(page.getByRole('listbox', { name: 'Mini-game selector' })).toBeVisible();
      await expect(page.getByRole('link', { name: 'Enter game' })).toBeVisible();

      const dimensions = await page.evaluate(() => ({
        clientWidth: document.documentElement.clientWidth,
        scrollWidth: document.documentElement.scrollWidth,
      }));
      expect(dimensions.scrollWidth).toBeLessThanOrEqual(dimensions.clientWidth);
    }
  });

  test('keeps launch and return actions clear through ready and results states', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/test/game-threshold');
    await expect(page.locator('[data-game-threshold-fixture-hydrated="true"]')).toBeAttached({
      timeout: 15_000,
    });

    await expect(page.getByRole('heading', { level: 1, name: 'Memory Keeper' })).toBeVisible();
    await page.getByRole('button', { name: 'Enter the archive' }).focus();
    await expect(page.getByRole('button', { name: 'Enter the archive' })).toBeFocused();
    await expect(page.getByRole('link', { name: 'Return to Mini-Games' })).toBeVisible();

    await page.getByRole('button', { name: 'Enter the archive' }).click();
    await expect(page.getByRole('heading', { level: 2, name: 'Victory' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Play again' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Return to games' })).toBeVisible();

    await page.evaluate(() => document.documentElement.style.setProperty('font-size', '200%'));
    const dimensions = await page.evaluate(() => ({
      clientWidth: document.documentElement.clientWidth,
      scrollWidth: document.documentElement.scrollWidth,
    }));
    expect(dimensions.scrollWidth).toBeLessThanOrEqual(dimensions.clientWidth);
  });
});
