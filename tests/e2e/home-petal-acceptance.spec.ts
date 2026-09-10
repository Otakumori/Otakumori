import { expect, test, type Page } from '@playwright/test';

const SCENES = [
  ['earlyMorning', '2026-01-02T05:00:00'],
  ['morning', '2026-01-02T08:00:00'],
  ['afternoon', '2026-01-02T12:00:00'],
  ['lateAfternoon', '2026-01-02T17:00:00'],
  ['night', '2026-01-02T21:00:00'],
  ['specialTwilight', '2026-01-01T20:00:00'],
] as const;

const VIEWPORTS = [
  { width: 390, height: 844 },
  { width: 768, height: 1024 },
  { width: 1280, height: 900 },
] as const;

async function useFixedHomeTime(page: Page, value: string) {
  await page.addInitScript((fixedTime) => {
    const NativeDate = Date;

    class FixedDate extends NativeDate {
      constructor(...args: ConstructorParameters<DateConstructor>) {
        super(...(args.length ? args : [fixedTime]));
      }

      static now() {
        return new NativeDate(fixedTime).valueOf();
      }
    }

    Object.setPrototypeOf(FixedDate, NativeDate);
    window.Date = FixedDate as DateConstructor;
  }, value);
}

async function openSettledHome(page: Page) {
  await page.goto('/', { waitUntil: 'domcontentloaded' });
  await expect(page.getByTestId('mori-hero-scene')).toBeVisible();
  await page.addStyleTag({
    content:
      '[data-testid="mori-hero-scene"] img { animation-duration: 1ms !important; transition-duration: 1ms !important; }',
  });
  await page.waitForTimeout(80);
}

async function visiblePetal(page: Page) {
  const petals = page.getByRole('button', { name: /collect sakura petal worth/i });
  await expect(petals.first()).toBeVisible();

  const index = await petals.evaluateAll((elements) =>
    elements.findIndex((element) => {
      const bounds = element.getBoundingClientRect();
      return (
        bounds.width > 0 &&
        bounds.height > 0 &&
        bounds.left >= 0 &&
        bounds.right <= window.innerWidth &&
        bounds.top >= 0 &&
        bounds.bottom <= window.innerHeight
      );
    }),
  );

  expect(index).toBeGreaterThanOrEqual(0);
  return petals.nth(index);
}

test.describe('Home petal owner acceptance', () => {
  test.setTimeout(90_000);

  test('keeps every canonical master and approved petal family readable across the acceptance matrix', async ({
    browser,
  }) => {
    for (const [bucket, time] of SCENES) {
      for (const viewport of VIEWPORTS) {
        const page = await browser.newPage({ viewport });
        await useFixedHomeTime(page, time);
        await openSettledHome(page);

        const scene = page.getByTestId('mori-hero-scene');
        await expect(scene).toHaveAttribute('data-scene-bucket', bucket);

        const petals = page.getByRole('button', { name: /collect sakura petal worth/i });
        await expect(petals.first()).toBeVisible();
        const count = await petals.count();
        if (viewport.width === 390) expect(count).toBe(4);
        expect([4, 6]).toContain(count);
        await expect(petals.first()).toHaveAttribute('data-collecting', 'false');

        const source = await petals
          .first()
          .locator('span')
          .evaluate((element) => window.getComputedStyle(element).backgroundImage);
        expect(source).toContain('/assets/home/petals/home-sakura-petal-');
        expect(source).not.toContain('petal_sprite.png');

        await page.close();
      }
    }
  });

  test('keeps pointer, keyboard, touch, and reduced-motion collection presentation semantic', async ({
    browser,
  }) => {
    const pointerPage = await browser.newPage({ viewport: VIEWPORTS[2] });
    await useFixedHomeTime(pointerPage, '2026-01-02T12:00:00');
    await openSettledHome(pointerPage);
    const pointerPetal = await visiblePetal(pointerPage);
    await pointerPetal.click({ force: true });
    await expect(pointerPetal).toHaveAttribute('data-collecting', 'true');
    await expect(pointerPetal).toBeDisabled();

    const keyboardPage = await browser.newPage({ viewport: VIEWPORTS[1] });
    await useFixedHomeTime(keyboardPage, '2026-01-02T12:00:00');
    await openSettledHome(keyboardPage);
    const keyboardPetal = await visiblePetal(keyboardPage);
    await keyboardPetal.focus();
    await keyboardPage.keyboard.press('Enter');
    await expect(keyboardPetal).toHaveAttribute('data-collecting', 'true');

    const touchContext = await browser.newContext({
      hasTouch: true,
      isMobile: true,
      viewport: VIEWPORTS[0],
    });
    const touchPage = await touchContext.newPage();
    await useFixedHomeTime(touchPage, '2026-01-02T12:00:00');
    await openSettledHome(touchPage);
    const touchPetal = await visiblePetal(touchPage);
    expect(await touchPage.evaluate(() => navigator.maxTouchPoints)).toBeGreaterThan(0);
    await touchPetal.evaluate((element: HTMLButtonElement) => element.click());
    await expect(touchPetal).toHaveAttribute('data-collecting', 'true');

    const reducedPage = await browser.newPage({ viewport: VIEWPORTS[0] });
    await reducedPage.emulateMedia({ reducedMotion: 'reduce' });
    await useFixedHomeTime(reducedPage, '2026-01-02T12:00:00');
    await openSettledHome(reducedPage);
    await expect(reducedPage.getByTestId('collectible-petal-layer')).toHaveAttribute(
      'data-reduced-motion',
      'true',
    );
    const reducedPetal = await visiblePetal(reducedPage);
    await reducedPetal.click({ force: true });
    await expect(reducedPetal).toHaveAttribute('data-collecting', 'true');

    await Promise.all([
      pointerPage.close(),
      keyboardPage.close(),
      touchContext.close(),
      reducedPage.close(),
    ]);
  });
});
