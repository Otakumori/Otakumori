import { expect, type Page } from '@playwright/test';

export function currentHomeHeroHeading(page: Page) {
  return page.getByRole('heading', {
    level: 1,
    name: /You found Otaku-mori\./i,
  });
}

export async function expectCurrentHomeHero(page: Page) {
  const heroHeading = currentHomeHeroHeading(page);

  await expect(heroHeading).toHaveCount(1);
  await expect(heroHeading).toBeVisible();
}

export function primaryNavigation(page: Page) {
  return page.getByRole('navigation', { name: /primary navigation/i });
}

export async function expectSinglePrimaryNavigation(page: Page) {
  const nav = primaryNavigation(page);

  await expect(nav).toHaveCount(1);
  await expect(nav).toBeVisible();
}

export function rootFooter(page: Page) {
  return page.getByTestId('mori-root-footer');
}

export async function expectRootFooterContract(page: Page) {
  const footer = rootFooter(page);

  await expect(footer).toBeVisible();
  await expect(footer).toHaveAttribute('data-root-footer-contract', 'wide-world-integrated');
  await expect(footer.locator('[data-root-region="shared-underground-art"]')).toHaveCount(1);
  await expect(page.getByRole('navigation', { name: /rooted homepage navigation/i })).toBeVisible();
  await expect(page.getByRole('link', { name: /^Cart$/i })).toHaveAttribute('href', '/shop/cart');
  await expect(page.getByRole('link', { name: /^Wishlist$/i })).toHaveAttribute(
    'href',
    '/wishlist',
  );
  await expect(page.getByRole('link', { name: /^Petal Wallet$/i })).toHaveAttribute(
    'href',
    '/profile/petals',
  );
  await expect(page.getByRole('button', { name: /open soapstone note/i })).toBeVisible();
  await expect(page.getByRole('navigation', { name: /otakumori social links/i })).toBeVisible();
  await expect(
    page.getByRole('navigation', { name: /homepage utility navigation/i }),
  ).toBeVisible();
}
