import { expect, test } from '@playwright/test';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const gamesMeta = require('../../lib/games.meta.json') as {
  games: Array<{
    slug: string;
    enabled: boolean;
    nsfw?: boolean;
    ageRating?: string;
  }>;
};

const enabledGames = gamesMeta.games.filter((game) => game.enabled === true);
const viewports = [
  { name: 'mobile', width: 390, height: 844 },
  { name: 'tablet', width: 768, height: 1024 },
  { name: 'desktop', width: 1280, height: 900 },
] as const;

test.describe('enabled beta game catalog start-surface evidence', () => {
  for (const game of enabledGames) {
    for (const viewport of viewports) {
      test(`${game.slug} renders at ${viewport.name}`, async ({ page, context }, testInfo) => {
        await page.setViewportSize(viewport);
        if (game.nsfw === true || game.ageRating === 'M') {
          await context.addCookies([
            { name: 'om_age_ok', value: '1', url: 'http://localhost:3000' },
          ]);
        }

        const response = await page.goto(`/mini-games/${game.slug}?visualAuth=signed-in`, {
          waitUntil: 'domcontentloaded',
        });
        expect(response?.status()).toBeLessThan(400);
        expect(new URL(page.url()).pathname).toBe(`/mini-games/${game.slug}`);
        await expect(page.locator('main').first()).toBeVisible();
        await expect(page.getByRole('region', { name: 'Game recovery state' })).toHaveCount(0);

        const overflow = await page.evaluate(
          () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
        );
        expect(overflow).toBeLessThanOrEqual(1);

        await testInfo.attach(`${game.slug}-${viewport.name}`, {
          body: await page.screenshot({ fullPage: false }),
          contentType: 'image/png',
        });
      });
    }
  }
});
