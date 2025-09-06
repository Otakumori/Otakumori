// @ts-ignore - Playwright types not installed
import { test, expect } from '@playwright/test';

test.describe('Critical User Journey', () => {
  test('should complete sign-in, browse products, add to cart, and checkout', async ({ page }: any) => {
    // Navigate to home page
    await page.goto('/');
    await expect(page).toHaveTitle(/Otakumori/);

    // Navigate to shop
    await page.click('a[href="/shop"]');
    await expect(page).toHaveURL('/shop');

    // Wait for products to load
    await page.waitForSelector('[data-testid="product-grid"]', { timeout: 10000 });

    // Check that products are displayed
    const productCards = page.locator('[data-testid="product-card"]');
    await expect(productCards).toHaveCount.greaterThan(0);

    // Click on first product
    await productCards.first().click();
    await expect(page).toHaveURL(/\/shop\/product\//);

    // Wait for product details to load
    await page.waitForSelector('[data-testid="product-details"]', { timeout: 10000 });

    // Check product details are displayed
    await expect(page.locator('[data-testid="product-name"]')).toBeVisible();
    await expect(page.locator('[data-testid="product-price"]')).toBeVisible();

    // Try to add to cart (will redirect to sign-in if not authenticated)
    await page.click('[data-testid="add-to-cart"]');
    
    // Check if redirected to sign-in
    if (page.url().includes('/sign-in')) {
      // Fill in test credentials (you'll need to set up test users)
      await page.fill('input[name="email"]', 'test@example.com');
      await page.fill('input[name="password"]', 'testpassword');
      await page.click('button[type="submit"]');
      
      // Wait for redirect back to product page
      await page.waitForURL(/\/shop\/product\//, { timeout: 10000 });
    }

    // Add to cart again (now authenticated)
    await page.click('[data-testid="add-to-cart"]');
    
    // Check for success message or cart update
    await expect(page.locator('[data-testid="cart-success"]')).toBeVisible({ timeout: 5000 });

    // Navigate to cart
    await page.click('a[href="/cart"]');
    await expect(page).toHaveURL('/cart');

    // Verify cart items
    await page.waitForSelector('[data-testid="cart-items"]', { timeout: 10000 });
    const cartItems = page.locator('[data-testid="cart-item"]');
    await expect(cartItems).toHaveCount.greaterThan(0);

    // Proceed to checkout
    await page.click('[data-testid="checkout-button"]');
    
    // Should redirect to Stripe checkout (test mode)
    await expect(page).toHaveURL(/checkout\.stripe\.com/, { timeout: 15000 });

    // Note: We don't complete the actual payment in e2e tests
    // In a real test environment, you'd use Stripe test cards
  });

  test('should handle accessibility requirements', async ({ page }: any) => {
    // Navigate to shop
    await page.goto('/shop');
    
    // Check for proper heading structure
    const h1 = page.locator('h1');
    await expect(h1).toBeVisible();
    
    // Check for skip links
    const skipLink = page.locator('a[href="#main-content"]');
    if (await skipLink.count() > 0) {
      await expect(skipLink).toBeVisible();
    }
    
    // Check for proper form labels
    const searchInput = page.locator('input[type="search"]');
    if (await searchInput.count() > 0) {
      const label = page.locator('label[for="search"]');
      await expect(label).toBeVisible();
    }
    
    // Check for proper button roles
    const buttons = page.locator('button');
    const buttonCount = await buttons.count();
    for (let i = 0; i < Math.min(buttonCount, 5); i++) {
      const button = buttons.nth(i);
      const role = await button.getAttribute('role');
      if (role) {
        expect(role).toBe('button');
      }
    }
  });

  test('should respect reduced motion preferences', async ({ page }: any) => {
    // Set reduced motion preference
    await page.emulateMedia({ reducedMotion: 'reduce' });
    
    // Navigate to home page
    await page.goto('/');
    
    // Check that animations are disabled or reduced
    // This would depend on your specific animation implementation
    const animatedElements = page.locator('[data-animate]');
    const count = await animatedElements.count();
    
    // If there are animated elements, they should respect reduced motion
    if (count > 0) {
      // Check that animation duration is reduced or disabled
      const firstAnimated = animatedElements.first();
      const style = await firstAnimated.evaluate((el: any) => {
        const computed = window.getComputedStyle(el);
        return {
          animationDuration: computed.animationDuration,
          transitionDuration: computed.transitionDuration,
        };
      });
      
      // Animation durations should be reduced or 0
      expect(style.animationDuration).toMatch(/0s|0ms/);
      expect(style.transitionDuration).toMatch(/0s|0ms/);
    }
  });
});
