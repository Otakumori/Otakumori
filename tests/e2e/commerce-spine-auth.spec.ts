import { test, expect } from '@playwright/test';
import fs from 'node:fs';
import { paths } from '../../lib/paths';

const storageStatePath = process.env.CLERK_STORAGE_STATE || 'tests/e2e/.auth/clerk-user.json';

test('Clerk-authenticated canonical commerce smoke path', async ({ browser, baseURL }) => {
  if (!fs.existsSync(storageStatePath)) {
    test.skip(true, `Missing Clerk storage state: ${storageStatePath}`);
  }

  const context = await browser.newContext({
    baseURL: baseURL || 'http://localhost:3000',
    storageState: storageStatePath,
  });

  const page = await context.newPage();

  await page.goto(paths.shop());
  await expect(page).toHaveURL(paths.shop());

  const firstProduct = page.getByRole('link', { name: /choose options/i }).first();
  await firstProduct.click();
  await expect(page).toHaveURL(/\/shop\/product\//);

  await page.getByRole('button', { name: /add to cart/i }).click();

  await page.goto(paths.cart());
  await expect(page).toHaveURL(paths.cart());
  await expect(page.getByText(/order summary/i)).toBeVisible();

  await page.getByRole('button', { name: /proceed to checkout/i }).click();
  await page.waitForURL(`**${paths.checkout()}`, { timeout: 15000 });
  await expect(page).toHaveURL(paths.checkout());
  await expect(page.getByRole('heading', { name: /checkout/i })).toBeVisible();

  await page.goto(paths.checkoutSuccess());
  await expect(page).toHaveURL(paths.checkoutSuccess());
  await expect(page.locator(`a[href="${paths.profileOrders()}"]`)).toBeVisible();

  await page.goto(paths.profileOrders());
  await expect(page).toHaveURL(paths.profileOrders());
  await expect(page.getByText(/orders/i).first()).toBeVisible();

  await context.close();
});
