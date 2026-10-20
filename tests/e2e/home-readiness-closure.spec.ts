import { expect, test } from '@playwright/test';

test.describe('Home readiness closure', () => {
  test.use({ timezoneId: 'UTC' });

  test('holds foreground presentation until the active world image decodes, including cached reloads', async ({
    page,
  }) => {
    await page.route('**/_next/image?**', async (route) => {
      const source = new URL(route.request().url()).searchParams.get('url') ?? '';
      if (source.includes('/assets/home/world/combined/')) {
        await new Promise((resolve) => setTimeout(resolve, 600));
      }
      await route.continue();
    });

    await page.goto('/', { waitUntil: 'domcontentloaded' });
    const shell = page.getByTestId('mori-home-scene-shell');
    await expect(shell).toHaveAttribute('data-world-status', 'loading');
    await expect(page.getByRole('heading', { level: 1 })).toBeHidden();

    await expect(shell).toHaveAttribute('data-world-status', 'ready');
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();

    await page.reload({ waitUntil: 'domcontentloaded' });
    await expect(shell).toHaveAttribute('data-world-status', 'ready');
  });

  test('uses the authored fallback presentation when world assets cannot load', async ({
    page,
  }) => {
    await page.route('**/_next/image?**', async (route) => {
      const source = new URL(route.request().url()).searchParams.get('url') ?? '';
      if (source.includes('/assets/home/world/combined/')) {
        await route.abort('failed');
        return;
      }
      await route.continue();
    });

    await page.goto('/', { waitUntil: 'domcontentloaded' });
    const shell = page.getByTestId('mori-home-scene-shell');
    await expect(shell).toHaveAttribute('data-world-status', 'fallback');
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    await expect(page.getByTestId('mori-petal-emitter')).toHaveCount(0);
  });

  test('keeps a decoded world visible when the next time-bucket asset is unavailable', async ({
    page,
  }) => {
    let blockNight = false;
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.route('**/_next/image?**', async (route) => {
      const source = new URL(route.request().url()).searchParams.get('url') ?? '';
      if (blockNight && source.includes('om-home-world-05-night-wide.png')) {
        await route.abort('failed');
        return;
      }
      await route.continue();
    });

    await page.goto('/', { waitUntil: 'domcontentloaded' });
    const shell = page.getByTestId('mori-home-scene-shell');
    await expect(shell).toHaveAttribute('data-world-status', 'ready');

    blockNight = true;
    await page.evaluate(() => {
      Date.prototype.getHours = () => 19;
      Date.prototype.getDate = () => 2;
      window.dispatchEvent(new Event('pageshow'));
    });
    await expect(shell).toHaveAttribute('data-scene-bucket', 'lateAfternoon');
    await expect(shell).toHaveAttribute('data-world-status', 'ready');

    await page.evaluate(() => {
      Date.prototype.getHours = () => 21;
      window.dispatchEvent(new Event('pageshow'));
    });
    await expect(shell).toHaveAttribute('data-scene-bucket', 'night');
    await expect(shell).toHaveAttribute('data-world-status', 'ready');
    await expect(
      page.getByRole('img', { name: /Otakumori sakura shoreline and root cavern at night/i }),
    ).toHaveAttribute('src', /om-home-world-04-late-afternoon-wide\.png/);
  });

  test('resynchronizes environmental authority after a local-time boundary without reload', async ({
    page,
  }) => {
    await page.goto('/');
    await page.evaluate(() => {
      Date.prototype.getHours = () => 19;
      window.dispatchEvent(new Event('pageshow'));
    });

    const shell = page.getByTestId('mori-home-scene-shell');
    await expect(shell).toHaveAttribute('data-scene-ready', 'true');
    await expect(shell).toHaveAttribute('data-scene-bucket', 'lateAfternoon');

    await page.evaluate(() => {
      Date.prototype.getHours = () => 21;
      window.dispatchEvent(new Event('pageshow'));
    });

    await expect(shell).toHaveAttribute('data-scene-bucket', 'night');
  });

  test('renders the distinct approved night master for the night bucket', async ({ page }) => {
    await page.goto('/');

    const shell = page.getByTestId('mori-home-scene-shell');
    await expect(shell).toHaveAttribute('data-world-status', 'ready', { timeout: 30_000 });

    await page.evaluate(() => {
      Date.prototype.getHours = () => 21;
      Date.prototype.getDate = () => 2;
      window.dispatchEvent(new Event('pageshow'));
    });
    await expect(shell).toHaveAttribute('data-scene-bucket', 'night');
    await expect(shell).toHaveAttribute('data-world-status', 'ready', { timeout: 30_000 });
    await expect(
      page.getByRole('img', { name: /Otakumori sakura shoreline and root cavern at night/i }),
    ).toHaveAttribute('src', /om-home-world-05-night-wide\.png/);
  });

  test('keeps approved world geometry bounded across launch viewports', async ({ page }) => {
    for (const viewport of [
      { width: 390, height: 844 },
      { width: 768, height: 1024 },
      { width: 1280, height: 900 },
    ]) {
      await page.setViewportSize(viewport);
      await page.goto('/');

      const shell = page.getByTestId('mori-home-scene-shell');
      await expect(shell).toHaveAttribute('data-scene-ready', 'true');
      await expect(
        page.getByRole('img', { name: /Otakumori sakura shoreline and root cavern/i }),
      ).toBeVisible();

      const geometry = await page.evaluate(() => ({
        viewportWidth: window.innerWidth,
        scrollWidth: document.documentElement.scrollWidth,
        shellWidth: document.querySelector('[data-home-scene-shell]')?.getBoundingClientRect()
          .width,
      }));

      expect(geometry.scrollWidth).toBeLessThanOrEqual(geometry.viewportWidth + 1);
      expect(geometry.shellWidth).toBeCloseTo(geometry.viewportWidth, 0);
    }
  });

  test('reserves the projected world before hydration without material layout shift', async ({
    page,
  }) => {
    await page.addInitScript(() => {
      let cumulativeLayoutShift = 0;
      new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          const shift = entry as PerformanceEntry & { hadRecentInput?: boolean; value?: number };
          if (!shift.hadRecentInput) cumulativeLayoutShift += shift.value ?? 0;
        }
        window.__homeCumulativeLayoutShift = cumulativeLayoutShift;
      }).observe({ type: 'layout-shift', buffered: true });
    });
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto('/');

    await expect(page.getByTestId('mori-home-scene-shell')).toHaveAttribute(
      'data-scene-ready',
      'true',
    );
    await page.waitForTimeout(750);

    const cumulativeLayoutShift = await page.evaluate(
      () => window.__homeCumulativeLayoutShift ?? 0,
    );
    expect(cumulativeLayoutShift).toBeLessThanOrEqual(0.1);
  });
});

declare global {
  interface Window {
    __homeCumulativeLayoutShift?: number;
  }
}
