import { expect, test } from '@playwright/test';

test('coordinates launch, pause, resume, results, and exit', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/test/game-platform');
  await expect(page.locator('[data-game-platform-fixture-hydrated="true"]')).toBeAttached();

  await page.getByRole('button', { name: 'Begin session' }).click();
  await expect(page.getByRole('navigation', { name: 'Game session controls' })).toBeVisible();

  await page.getByRole('button', { name: 'Pause' }).click();
  await expect(page.getByRole('dialog', { name: 'Platform trial paused' })).toBeVisible();

  await page.getByRole('button', { name: 'Resume' }).click();
  await expect(page.getByRole('dialog', { name: 'Platform trial paused' })).toBeHidden();

  await page.getByRole('button', { name: 'Complete run' }).click();
  await expect(page.getByRole('heading', { level: 2, name: 'Victory' })).toBeVisible();

  await page.getByRole('button', { name: 'Play again' }).click();
  await page.getByRole('button', { name: 'Begin session' }).click();
  await page.getByRole('button', { name: 'Exit' }).click();
  await expect(page.getByText('Session exited.')).toBeVisible();
});
