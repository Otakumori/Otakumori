import { test, expect, type Page } from '@playwright/test';

test.describe('Age Gate - Session-Only R18 Protection', () => {
  // Test 1: Anonymous user flow
  test.describe('Anonymous User', () => {
    test('should show age gate when visiting /mini-games without cookie', async ({ page }) => {
      // Visit mini-games without any cookies
      await page.goto('/mini-games');

      // Should be rewritten to age-check with returnTo param
      await expect(page).toHaveURL(/\/age-check\?returnTo=%2Fmini-games/);

      // Verify age check page content is visible
      await expect(page.locator('h1')).toContainText('Age Verification Required');
      await expect(page.getByRole('button', { name: /18 or older/i })).toBeVisible();
      await expect(page.getByRole('button', { name: /go back/i })).toBeVisible();
    });

    test('should set session cookie and redirect after confirmation', async ({ page }) => {
      // Visit mini-games
      await page.goto('/mini-games');

      // Wait for age check page
      await expect(page).toHaveURL(/\/age-check/);

      // Click "I'm 18 or Older" button
      await page.getByRole('button', { name: /18 or older/i }).click();

      // Should redirect to original destination
      await expect(page).toHaveURL(/\/mini-games/);

      // Verify session cookie is set
      const cookies = await page.context().cookies();
      const ageCookie = cookies.find((c) => c.name === 'om_age_ok');
      expect(ageCookie).toBeDefined();
      expect(ageCookie?.value).toBe('1');
      expect(ageCookie?.httpOnly).toBe(true);
      expect(ageCookie?.sameSite).toBe('Lax');
      expect(ageCookie?.expires).toBe(-1); // Session-only cookie
    });

    test('should allow access to other protected routes with cookie', async ({ page }) => {
      // First, get the cookie by confirming age
      await page.goto('/mini-games');
      await expect(page).toHaveURL(/\/age-check/);
      await page.getByRole('button', { name: /18 or older/i }).click();
      await expect(page).toHaveURL(/\/mini-games/);

      // Now visit /arcade - should NOT show age gate
      await page.goto('/arcade');
      await expect(page).not.toHaveURL(/\/age-check/);

      // Visit /products/nsfw - should NOT show age gate
      await page.goto('/products/nsfw/test');
      await expect(page).not.toHaveURL(/\/age-check/);
    });

    test('should show age gate again in new browser context (session ended)', async ({
      browser,
    }) => {
      // First context: confirm age
      const context1 = await browser.newContext();
      const page1 = await context1.newPage();
      await page1.goto('/mini-games');
      await expect(page1).toHaveURL(/\/age-check/);
      await page1.getByRole('button', { name: /18 or older/i }).click();
      await expect(page1).toHaveURL(/\/mini-games/);
      await context1.close();

      // Second context (simulates browser restart): should show age gate again
      const context2 = await browser.newContext();
      const page2 = await context2.newPage();
      await page2.goto('/mini-games');

      // Should be back at age-check
      await expect(page2).toHaveURL(/\/age-check/);
      await context2.close();
    });

    test('should redirect to home when clicking "Go Back"', async ({ page }) => {
      await page.goto('/mini-games');
      await expect(page).toHaveURL(/\/age-check/);

      // Click "Go Back" button
      await page.getByRole('button', { name: /go back/i }).click();

      // Should navigate to home
      await expect(page).toHaveURL('/');
    });
  });

  // Test 2: Signed-in unverified user
  test.describe('Signed-in Unverified User', () => {
    test.skip('should show age gate for authenticated user without adultVerified', async ({
      page,
    }) => {
      // Note: This test is skipped because it requires Clerk authentication setup
      // To enable, you need to:
      // 1. Set up test user credentials in environment
      // 2. Implement sign-in flow
      // 3. Ensure test user has publicMetadata.adultVerified = false

      // Mock sign-in (replace with actual Clerk auth in real implementation)
      // await signInTestUser(page, { adultVerified: false });

      // Visit mini-games
      await page.goto('/mini-games');

      // Should still show age gate
      await expect(page).toHaveURL(/\/age-check/);

      // Confirm age
      await page.getByRole('button', { name: /18 or older/i }).click();
      await expect(page).toHaveURL(/\/mini-games/);

      // Cookie should be set
      const cookies = await page.context().cookies();
      const ageCookie = cookies.find((c) => c.name === 'om_age_ok');
      expect(ageCookie).toBeDefined();
    });

    test.skip('should require confirmation again in new session', async ({ browser }) => {
      // Note: Requires Clerk auth setup
      // const context = await browser.newContext();
      // const page = await context.newPage();
      // await signInTestUser(page, { adultVerified: false });
      // await page.goto('/mini-games');
      // await expect(page).toHaveURL(/\/age-check/);
      // await page.getByRole('button', { name: /18 or older/i }).click();
      // await context.close();
      // // New session should require confirmation again
      // const context2 = await browser.newContext();
      // const page2 = await context2.newPage();
      // await signInTestUser(page2, { adultVerified: false });
      // await page2.goto('/mini-games');
      // await expect(page2).toHaveURL(/\/age-check/);
      // await context2.close();
    });
  });

  // Test 3: Signed-in verified user
  test.describe('Signed-in Verified User', () => {
    test.skip('should bypass age gate with publicMetadata.adultVerified = true', async ({
      page,
    }) => {
      // Note: This test is skipped because it requires Clerk authentication setup
      // To enable, you need to:
      // 1. Set up test user credentials in environment
      // 2. Implement sign-in flow
      // 3. Ensure test user has publicMetadata.adultVerified = true

      // Mock sign-in with verified user
      // await signInTestUser(page, { adultVerified: true });

      // Visit mini-games - should NOT show age gate
      await page.goto('/mini-games');
      await expect(page).not.toHaveURL(/\/age-check/);
      await expect(page).toHaveURL(/\/mini-games/);

      // Visit arcade - should NOT show age gate
      await page.goto('/arcade');
      await expect(page).not.toHaveURL(/\/age-check/);

      // No session cookie should be needed
      const cookies = await page.context().cookies();
      const ageCookie = cookies.find((c) => c.name === 'om_age_ok');
      expect(ageCookie).toBeUndefined();
    });

    test.skip('should continue to bypass in new session (persistent)', async ({ browser }) => {
      // Note: Requires Clerk auth setup
      // const context1 = await browser.newContext();
      // const page1 = await context1.newPage();
      // await signInTestUser(page1, { adultVerified: true });
      // await page1.goto('/mini-games');
      // await expect(page1).not.toHaveURL(/\/age-check/);
      // await context1.close();
      // // New session should STILL bypass (persistent verification)
      // const context2 = await browser.newContext();
      // const page2 = await context2.newPage();
      // await signInTestUser(page2, { adultVerified: true });
      // await page2.goto('/mini-games');
      // await expect(page2).not.toHaveURL(/\/age-check/);
      // await context2.close();
    });
  });

  // Accessibility tests
  test.describe('Accessibility', () => {
    test('should have proper ARIA attributes on age check page', async ({ page }) => {
      await page.goto('/mini-games');
      await expect(page).toHaveURL(/\/age-check/);

      // Check heading structure
      const heading = page.locator('h1');
      await expect(heading).toBeVisible();

      // Check button labels
      const confirmButton = page.getByRole('button', { name: /18 or older/i });
      await expect(confirmButton).toBeVisible();
      expect(await confirmButton.getAttribute('aria-label')).toBeTruthy();

      const declineButton = page.getByRole('button', { name: /go back/i });
      await expect(declineButton).toBeVisible();
      expect(await declineButton.getAttribute('aria-label')).toBeTruthy();
    });

    test('should support keyboard navigation', async ({ page }) => {
      await page.goto('/mini-games');
      await expect(page).toHaveURL(/\/age-check/);

      // Tab to first button
      await page.keyboard.press('Tab');
      let focused = await page.evaluate(() => document.activeElement?.tagName);
      expect(focused).toBe('BUTTON');

      // Tab to second button
      await page.keyboard.press('Tab');
      focused = await page.evaluate(() => document.activeElement?.tagName);
      expect(focused).toBe('BUTTON');

      // Press Enter to activate button
      await page.keyboard.press('Enter');

      // Should navigate (to home since we pressed the second button)
      await expect(page).toHaveURL('/');
    });

    test('should respect reduced motion preference', async ({ page }) => {
      await page.emulateMedia({ reducedMotion: 'reduce' });
      await page.goto('/mini-games');
      await expect(page).toHaveURL(/\/age-check/);

      // Page should load without motion animations
      // (No specific assertion needed; just verifying it doesn't crash)
      await expect(page.locator('h1')).toBeVisible();
    });
  });

  // API tests
  test.describe('API Security', () => {
    test('should reject invalid returnTo paths', async ({ page }) => {
      // Try to set cookie with external redirect
      const response = await page.request.post('/api/age/confirm', {
        data: { returnTo: 'https://evil.com' },
      });

      const data = await response.json();
      expect(data.ok).toBe(false);
      expect(data.error).toContain('Invalid redirect path');
    });

    test('should reject protocol-relative URLs', async ({ page }) => {
      const response = await page.request.post('/api/age/confirm', {
        data: { returnTo: '//evil.com/path' },
      });

      const data = await response.json();
      expect(data.ok).toBe(false);
      expect(data.error).toContain('Invalid redirect path');
    });

    test('should accept valid relative paths', async ({ page }) => {
      const response = await page.request.post('/api/age/confirm', {
        data: { returnTo: '/mini-games' },
      });

      const data = await response.json();
      expect(data.ok).toBe(true);
      expect(data.data.redirectTo).toBe('/mini-games');

      // Verify cookie was set in response
      const headers = response.headers();
      expect(headers['set-cookie']).toContain('om_age_ok=1');
      expect(headers['set-cookie']).toContain('HttpOnly');
      expect(headers['set-cookie']).toContain('SameSite=Lax');
    });

    test('should require returnTo parameter', async ({ page }) => {
      const response = await page.request.post('/api/age/confirm', {
        data: {},
      });

      const data = await response.json();
      expect(data.ok).toBe(false);
      expect(data.error).toContain('returnTo is required');
    });
  });
});
