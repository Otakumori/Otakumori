import { expect, test } from '@playwright/test';

test('adopted dungeon session pauses, resumes, and exits behind the existing age gate', async ({
  page,
}) => {
  test.setTimeout(120_000);
  await page.goto('/mini-games/dungeon-of-desire', { waitUntil: 'domcontentloaded' });

  await expect(page).toHaveURL(/\/age-check/);
  await page
    .context()
    .addCookies([{ name: 'om_age_ok', value: '1', url: 'http://localhost:3000' }]);
  await page.goto('/mini-games/dungeon-of-desire', { waitUntil: 'domcontentloaded' });
  await expect(page).toHaveURL(/\/mini-games\/dungeon-of-desire/);

  await page.getByRole('button', { name: 'Continue' }).click();
  await page.getByRole('button', { name: 'Start game' }).click();

  const controls = page.getByRole('navigation', { name: 'Game session controls' });
  await expect(controls).toBeVisible();
  await page.getByRole('button', { name: 'Enter the Dungeon' }).click();

  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog', { name: 'Dungeon of Desire paused' })).toBeVisible();

  await page.getByRole('button', { name: 'Resume' }).click();
  await expect(page.getByRole('dialog', { name: 'Dungeon of Desire paused' })).toBeHidden();
  await expect(page.getByText('Press ESC to continue')).toBeHidden();

  await controls.getByRole('button', { name: 'Exit' }).click();
  await expect(page.locator('[data-game-session-phase="exiting"]')).toBeAttached();
});
