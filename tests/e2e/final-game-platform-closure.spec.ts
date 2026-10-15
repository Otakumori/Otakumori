import { expect, test } from '@playwright/test';

test.describe('final game platform closure', () => {
  test('Bubble compatibility route resolves to the adopted runtime', async ({ page }) => {
    test.setTimeout(90_000);
    await page.goto('/mini-games/bubble-girl', { waitUntil: 'domcontentloaded' });

    await expect(page).toHaveURL(/\/mini-games\/bubble-ragdoll/);
    await expect(page.getByRole('heading', { level: 1, name: 'Bubble Ragdoll' })).toBeVisible();
  });

  test('Petal Storm live runtime follows shared pause and exit authority', async ({ page }) => {
    test.setTimeout(90_000);
    await page.goto('/mini-games/petal-storm-rhythm', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(500);
    await page.getByRole('button', { name: 'Start Playing' }).click();

    const controls = page.getByRole('navigation', { name: 'Game session controls' });
    await expect(controls).toHaveAttribute('data-game-session-phase', 'running');
    await page.keyboard.press('Escape');
    await expect(page.getByRole('dialog', { name: /Petal Hero paused/i })).toBeVisible();
    await page.getByRole('button', { name: 'Resume' }).click();
    await expect(page.getByRole('dialog', { name: /Petal Hero paused/i })).toBeHidden();
    await controls.getByRole('button', { name: 'Exit' }).click();
    await expect(controls).toHaveAttribute('data-game-session-phase', 'exiting');
  });

  test('Maid Café shared pause resumes and exits through the canonical path', async ({ page }) => {
    test.setTimeout(90_000);
    await page.goto('/mini-games/maid-cafe-manager', { waitUntil: 'domcontentloaded' });
    await page.getByRole('button', { name: 'Continue' }).click();
    await page.getByRole('button', { name: 'Start game' }).click();

    const controls = page.getByRole('navigation', { name: 'Game session controls' });
    await expect(controls).toHaveAttribute('data-game-session-phase', 'running');
    await controls.getByRole('button', { name: 'Pause' }).click();
    await expect(page.getByRole('dialog', { name: /Maid Café Manager paused/i })).toBeVisible();
    await page.getByRole('button', { name: 'Resume', exact: true }).click();
    await expect(page.getByRole('dialog', { name: /Maid Café Manager paused/i })).toBeHidden();
    await controls.getByRole('button', { name: 'Exit' }).click();
    await expect(controls).toHaveAttribute('data-game-session-phase', 'exiting');
  });
});
