import { expect, test } from '@playwright/test';

test('Bubble Ragdoll keeps direct manipulation game-owned under shared pause', async ({ page }) => {
  test.setTimeout(90_000);
  await page.goto('/mini-games/bubble-ragdoll', { waitUntil: 'domcontentloaded' });

  await expect(page.getByRole('heading', { level: 1, name: 'Bubble Ragdoll' })).toBeVisible();
  await page.getByRole('button', { name: 'Continue' }).click();
  await page.getByRole('button', { name: 'Start game' }).click();

  const controls = page.getByRole('navigation', { name: 'Game session controls' });
  await expect(controls).toHaveAttribute('data-game-session-phase', 'running');

  const canvas = page.locator('canvas');
  await expect(canvas).toBeVisible();
  await canvas.click({ position: { x: 320, y: 320 } });

  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog', { name: /Bubble Ragdoll paused/i })).toBeVisible();
  await page.getByRole('button', { name: 'Resume' }).click();
  await expect(controls).toHaveAttribute('data-game-session-phase', 'running');
});
