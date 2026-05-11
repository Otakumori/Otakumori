import { test, expect } from '@playwright/test';
import { paths } from '../../lib/paths';

test.describe('Critical User Journey', () => {
  test('should follow canonical shop -> product -> cart -> checkout path', async ({ page }) => {
    await page.goto(paths.shop());
    await expect(page).toHaveURL(paths.shop());

    const firstProduct = page.getByRole('link', { name: /choose options/i }).first();
    await firstProduct.click();
    await expect(page).toHaveURL(/\/shop\/product\//);

    await page.getByRole('button', { name: /add to cart/i }).click();

    await page.goto(paths.cart());
    await expect(page).toHaveURL(paths.cart());
    await expect(page.getByText(/order summary/i)).toBeVisible();

    const checkoutButton = page.getByRole('button', { name: /proceed to checkout/i });
    await expect(checkoutButton).toBeVisible();
    await checkoutButton.click();

    await page.waitForURL(new RegExp(`(${paths.checkout()}|/sign-in)`), { timeout: 15000 });
    expect(page.url()).toMatch(new RegExp(`${paths.checkout()}|/sign-in`));
  });

  test('should handle accessibility requirements on canonical shop route', async ({ page }) => {
    await page.goto(paths.shop());

    const h1 = page.locator('h1');
    await expect(h1).toBeVisible();

    const skipLink = page.locator('a[href="#main-content"]');
    if ((await skipLink.count()) > 0) {
      await expect(skipLink).toBeVisible();
    }

    const buttons = page.locator('button');
    await expect(buttons.first()).toBeVisible();
  });

  test('should respect reduced motion preferences', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto(paths.shop());

    const animatedElements = page.locator('[data-animate]');
    const count = await animatedElements.count();

    if (count > 0) {
      const firstAnimated = animatedElements.first();
      const style = await firstAnimated.evaluate((el: Element) => {
        const computed = window.getComputedStyle(el);
        return {
          animationDuration: computed.animationDuration,
          transitionDuration: computed.transitionDuration,
        };
      });

      expect(style.animationDuration).toMatch(/0s|0ms/);
      expect(style.transitionDuration).toMatch(/0s|0ms/);
    }
  });
});
