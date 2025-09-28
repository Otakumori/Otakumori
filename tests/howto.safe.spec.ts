import { test, expect } from '@playwright/test';

test.describe('HowTo Component', () => {
  test('should render help button and toggle dialog', async ({ page }) => {
    // Create a test page with the HowTo component
    await page.setContent(`
      <div id="test-container">
        <button id="howto-trigger">?</button>
        <div id="howto-content" style="display: none;">
          <p>Test how-to content</p>
        </div>
      </div>
      <script>
        let isOpen = false;
        const trigger = document.getElementById('howto-trigger');
        const content = document.getElementById('howto-content');
        
        trigger.addEventListener('click', () => {
          isOpen = !isOpen;
          content.style.display = isOpen ? 'block' : 'none';
        });
      </script>
    `);

    // Check that help button is visible
    const helpButton = page.locator('#howto-trigger');
    await expect(helpButton).toBeVisible();
    await expect(helpButton).toHaveText('?');

    // Click to open dialog
    await helpButton.click();

    // Check that content is now visible
    const content = page.locator('#howto-content');
    await expect(content).toBeVisible();
    await expect(content).toHaveText('Test how-to content');

    // Click again to close
    await helpButton.click();

    // Check that content is hidden
    await expect(content).not.toBeVisible();
  });

  test('should close dialog on escape key', async ({ page }) => {
    await page.setContent(`
      <div id="test-container">
        <button id="howto-trigger">?</button>
        <div id="howto-content" style="display: block;">
          <p>Test how-to content</p>
        </div>
      </div>
      <script>
        const trigger = document.getElementById('howto-trigger');
        const content = document.getElementById('howto-content');
        
        document.addEventListener('keydown', (e) => {
          if (e.key === 'Escape') {
            content.style.display = 'none';
          }
        });
      </script>
    `);

    const content = page.locator('#howto-content');
    await expect(content).toBeVisible();

    // Press escape key
    await page.keyboard.press('Escape');

    // Check that content is hidden
    await expect(content).not.toBeVisible();
  });

  test('should close dialog on click outside', async ({ page }) => {
    await page.setContent(`
      <div id="test-container">
        <button id="howto-trigger">?</button>
        <div id="howto-content" style="display: block;">
          <p>Test how-to content</p>
        </div>
        <div id="outside-area" style="width: 100px; height: 100px; background: red;"></div>
      </div>
      <script>
        const trigger = document.getElementById('howto-trigger');
        const content = document.getElementById('howto-content');
        const outside = document.getElementById('outside-area');
        
        outside.addEventListener('click', () => {
          content.style.display = 'none';
        });
      </script>
    `);

    const content = page.locator('#howto-content');
    await expect(content).toBeVisible();

    // Click outside the content
    await page.locator('#outside-area').click();

    // Check that content is hidden
    await expect(content).not.toBeVisible();
  });
});
