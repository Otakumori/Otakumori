import { expect, test } from '@playwright/test';

test('Story flagship path enters combat and preserves shared pause and exit', async ({ page }) => {
  test.setTimeout(90_000);
  await page.goto('/mini-games/otaku-beat-em-up', { waitUntil: 'domcontentloaded' });
  const storyMode = page.getByRole('button', { name: 'Story Mode' });
  const presetChoice = page.getByRole('button', { name: 'Play with preset character' });
  const continueToGame = page.getByRole('button', { name: 'Continue' });
  await expect
    .poll(
      async () => {
        if ((await presetChoice.isVisible()) || (await continueToGame.isVisible())) return true;
        await storyMode.click().catch(() => undefined);
        return false;
      },
      { timeout: 15_000 },
    )
    .toBe(true);
  if (await presetChoice.isVisible({ timeout: 3000 }).catch(() => false)) {
    await presetChoice.click();
  }
  await continueToGame.click();
  await page.getByRole('button', { name: 'Start game', exact: true }).click();

  const controls = page.getByRole('navigation', { name: 'Game session controls' });
  await expect(controls).toHaveAttribute('data-game-session-phase', 'running');
  await expect(page.getByLabel('Rhythm Beat-Em-Up game area')).toBeVisible();

  await controls.getByRole('button', { name: 'Pause' }).click();
  await expect(page.getByRole('dialog', { name: /Otaku Beat-em-up paused/i })).toBeVisible();
  await page.getByRole('button', { name: 'Resume' }).click();
  await expect(page.getByRole('dialog', { name: /Otaku Beat-em-up paused/i })).toBeHidden();

  await controls.getByRole('button', { name: 'Exit' }).click();
  await expect(page).toHaveURL(/\/mini-games\/?$/);
});
