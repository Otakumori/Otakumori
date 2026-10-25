import { expect, test } from '@playwright/test';

test('Blossomware disposes one microgame before advancing and keeps shared pause authoritative', async ({
  page,
}) => {
  test.setTimeout(90_000);
  await page.goto('/mini-games/blossomware', { waitUntil: 'domcontentloaded' });

  await expect(page.getByRole('heading', { level: 1, name: 'Blossomware' })).toBeVisible();
  await expect(page.getByText('classic-v1')).toBeVisible();
  await page.getByRole('button', { name: 'Start Classic Circuit' }).click();
  const controls = page.getByRole('navigation', { name: 'Game session controls' });
  const sessionHud = page.locator('.game-platform-hud');
  await expect(controls).toBeVisible();
  await expect(sessionHud).toHaveAttribute('data-game-session-phase', 'running');

  await expect(page.getByRole('heading', { level: 3, name: 'Slap the Oni' })).toBeVisible();
  await page.getByRole('button', { name: 'Click the oni demon when it appears' }).click();

  await expect(page.getByRole('heading', { level: 3, name: 'Choke the Controller' })).toBeVisible({
    timeout: 10_000,
  });
  await expect(page.getByRole('heading', { level: 3, name: 'Slap the Oni' })).toHaveCount(0);

  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog', { name: /Blossomware paused/i })).toBeVisible();
  await page.getByRole('button', { name: 'Resume' }).click();
  await expect(sessionHud).toHaveAttribute('data-game-session-phase', 'running');
});
