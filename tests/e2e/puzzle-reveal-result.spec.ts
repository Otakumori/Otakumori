import { expect, test } from '@playwright/test';

async function startPuzzle(page: import('@playwright/test').Page) {
  await page.getByRole('button', { name: 'Start Game' }).click();

  const preset = page.getByRole('button', { name: 'Play with preset character' });
  if (await preset.isVisible()) {
    await preset.click();
    await page.getByRole('button', { name: 'Start Game' }).click();
  }

  const canvas = page.locator('canvas[aria-label*="Puzzle Reveal game area"]');
  await expect(canvas).toBeVisible();
  await expect(page.getByText('Preparing recovered memory...')).toBeHidden();
  return canvas;
}

async function dispatchTileClick(
  canvas: import('@playwright/test').Locator,
  row: number,
  col: number,
) {
  await dispatchTileClicks(canvas, [{ row, col }]);
}

async function dispatchTileClicks(
  canvas: import('@playwright/test').Locator,
  positions: Array<{ row: number; col: number }>,
) {
  await canvas.evaluate((node, clickPositions) => {
    const rect = node.getBoundingClientRect();
    for (const position of clickPositions) {
      node.dispatchEvent(
        new MouseEvent('click', {
          bubbles: true,
          clientX: rect.left + ((position.col + 0.5) * rect.width) / 6,
          clientY: rect.top + ((position.row + 0.5) * rect.height) / 5,
        }),
      );
    }
  }, positions);
}

test('Puzzle Reveal completes once, rejects overlapping input, and resets on replay', async ({
  page,
}) => {
  test.setTimeout(90_000);

  let rewardRequests = 0;
  let personalBestRequests = 0;
  await page.route('**/api/v1/petals/earn', async (route) => {
    rewardRequests += 1;
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ ok: true, data: { earned: 0, isGuest: true } }),
    });
  });
  await page.route('**/api/v1/games/personal-best', async (route) => {
    personalBestRequests += 1;
    await route.fulfill({
      status: 401,
      contentType: 'application/json',
      body: JSON.stringify({ ok: false, error: 'AUTH_REQUIRED' }),
    });
  });

  await page.goto('/mini-games/puzzle-reveal?visualAuth=signed-out', {
    waitUntil: 'domcontentloaded',
  });
  let canvas = await startPuzzle(page);

  await dispatchTileClick(canvas, 0, 0);
  await dispatchTileClick(canvas, 0, 0);
  await expect(page.getByText('Progress: 3%')).toBeVisible();
  await expect(page.getByText('The corrupted memory has been fully restored.')).toHaveCount(0);

  const remainingTiles: Array<{ row: number; col: number }> = [];
  for (let row = 0; row < 5; row += 1) {
    for (let col = 0; col < 6; col += 1) {
      if (row === 0 && col === 0) continue;
      remainingTiles.push({ row, col });
    }
  }
  await dispatchTileClicks(canvas, remainingTiles);

  await expect(page.getByText('The corrupted memory has been fully restored.')).toBeVisible({
    timeout: 10_000,
  });
  canvas = page.locator('canvas[aria-label*="fully restored"]');
  await expect(canvas).toBeVisible();
  await expect(page.getByRole('button', { name: 'Restore next artifact' })).toBeVisible();
  await expect.poll(() => rewardRequests).toBe(1);
  await expect.poll(() => personalBestRequests).toBe(1);

  await dispatchTileClick(canvas, 4, 5);
  await expect.poll(() => rewardRequests).toBe(1);
  await expect.poll(() => personalBestRequests).toBe(1);

  await page.getByRole('button', { name: 'Restore next artifact' }).click();
  canvas = page.locator('canvas[aria-label*="Puzzle Reveal game area"]');
  await expect(canvas).toBeVisible();
  await expect(page.getByText('The corrupted memory has been fully restored.')).toHaveCount(0);
  await dispatchTileClick(canvas, 0, 0);
  await expect(page.getByText('Progress: 3%')).toBeVisible();
});
