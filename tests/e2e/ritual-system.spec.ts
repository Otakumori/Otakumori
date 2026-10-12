import { expect, test } from '@playwright/test';

const visualQaAuthEnabled =
  process.env.OTM_VISUAL_QA_AUTH === '1' ||
  process.env.NEXT_PUBLIC_OTM_VISUAL_QA_AUTH === '1';

test.describe('Ritual / System Space', () => {
  test('keeps production Settings behind the Clerk boundary', async ({ page }) => {
    if (visualQaAuthEnabled) {
      await page.goto('/settings');
      await expect(page.locator('main[data-mori-archetype="ritual"]')).toBeVisible();
      await expect(page.getByRole('status')).toHaveAttribute('data-mori-system-state', 'locked');
      return;
    }

    const response = await page.request.get('/settings', { maxRedirects: 0 });
    expect(response.status()).toBe(307);

    const location = response.headers().location;
    expect(location).toBeTruthy();

    const target = new URL(location!);
    expect(target.hostname).toBe('accounts.otaku-mori.com');
    expect(target.pathname).toBe('/sign-in');
    expect(new URL(target.searchParams.get('redirect_url')!).pathname).toBe('/settings');
  });

  test('keeps the visual-QA composition semantic and responsive', async ({ page }) => {
    for (const viewport of [
      { width: 390, height: 844 },
      { width: 768, height: 1024 },
      { width: 1280, height: 900 },
    ]) {
      await page.setViewportSize(viewport);
      await page.goto('/test/ritual-system');

      await expect(page.locator('main[data-mori-archetype="ritual"]')).toBeVisible();
      await expect(page.getByRole('navigation', { name: 'Settings sections' })).toBeVisible();
      await expect(page.getByRole('heading', { level: 1, name: 'Settings' })).toBeVisible();
      await expect(page.getByRole('status')).toHaveAttribute('data-mori-system-state', 'success');

      const dimensions = await page.evaluate(() => ({
        clientWidth: document.documentElement.clientWidth,
        scrollWidth: document.documentElement.scrollWidth,
      }));
      expect(dimensions.scrollWidth).toBeLessThanOrEqual(dimensions.clientWidth);
    }

    await page.setViewportSize({ width: 390, height: 844 });
    await page.evaluate(() => document.documentElement.style.setProperty('font-size', '200%'));
    await expect(page.getByRole('button', { name: 'Review destructive action' })).toBeVisible();
    const enlargedDimensions = await page.evaluate(() => ({
      clientWidth: document.documentElement.clientWidth,
      scrollWidth: document.documentElement.scrollWidth,
    }));
    expect(enlargedDimensions.scrollWidth).toBeLessThanOrEqual(enlargedDimensions.clientWidth);
    await page.evaluate(() => document.documentElement.style.removeProperty('font-size'));
    await page.emulateMedia({ reducedMotion: 'reduce' });

    await page.getByRole('button', { name: 'warning' }).click();
    await expect(page.locator('[role="alert"][data-mori-system-state="warning"]')).toBeVisible();

    await page.getByRole('button', { name: 'Review destructive action' }).click();
    const dialog = page.getByRole('dialog', { name: 'Remove local draft?' });
    await expect(dialog).toBeVisible();
    expect(await dialog.evaluate((element) => element.contains(document.activeElement))).toBe(true);
    await expect(page.getByRole('button', { name: 'Remove draft' })).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(dialog).toBeHidden();

  });
});
