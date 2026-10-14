import { expect, test } from '@playwright/test';

test.describe('ready-game shared-platform adoption', () => {
  test('Petal Storm preserves rhythm entry while shared pause owns session timing', async ({
    page,
  }) => {
    test.setTimeout(90_000);
    await page.goto('/mini-games/petal-storm-rhythm', { waitUntil: 'domcontentloaded' });

    await expect(page.getByRole('heading', { level: 1, name: 'Petal Hero' })).toBeVisible();
    await page.waitForTimeout(500);
    await page.getByRole('button', { name: 'Start Playing' }).click();
    const controls = page.getByRole('navigation', { name: 'Game session controls' });
    await expect(controls).toBeVisible();

    await page.keyboard.press('Escape');
    await expect(page.getByRole('dialog', { name: /Petal Hero paused/i })).toBeVisible();
    await page.getByRole('button', { name: 'Resume' }).click();
    await expect(page.getByRole('dialog', { name: /Petal Hero paused/i })).toBeHidden();
  });

  test('Beat-em-up preserves its launch flow while shared pause controls the runtime', async ({
    page,
  }) => {
    test.setTimeout(90_000);
    await page.goto('/mini-games/otaku-beat-em-up', { waitUntil: 'domcontentloaded' });

    await expect(page.getByRole('heading', { level: 1, name: 'Otaku Beat-Em-Up' })).toBeVisible();
    await page.waitForTimeout(500);
    await page.getByRole('button', { name: 'Arcade Mode' }).click();
    await page.getByRole('button', { name: 'Play with preset character' }).click();
    await page.getByRole('button', { name: 'Start Game' }).click();
    await page.getByRole('button', { name: 'Continue' }).click();
    await page.getByRole('button', { name: 'Start game' }).click();

    const controls = page.getByRole('navigation', { name: 'Game session controls' });
    await expect(controls).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(page.getByRole('dialog', { name: /Otaku Beat-em-up paused/i })).toBeVisible();
    await page.getByRole('button', { name: 'Resume' }).click();
    await expect(page.getByRole('dialog', { name: /Otaku Beat-em-up paused/i })).toBeHidden();
  });
});
