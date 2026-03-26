import { test, expect } from '@playwright/test';

test.describe('Company Canvas', () => {
  test('version dropdown is populated on direct visit', async ({ page }) => {
    await page.goto('/en/canvas/');
    const select = page.locator('#version-select');
    await expect(select).toBeVisible();
    const options = select.locator('option');
    await expect(options).toHaveCount(2);
    await expect(options.nth(0)).toHaveAttribute('value', 'v1');
    await expect(options.nth(1)).toHaveAttribute('value', 'v2');
  });

  test('default version is v1', async ({ page }) => {
    await page.goto('/en/canvas/');
    const select = page.locator('#version-select');
    await expect(select).toHaveValue('v1');
  });

  test('version dropdown is populated after back/forward navigation', async ({ page }) => {
    // Visit canvas page first
    await page.goto('/en/canvas/');
    const select = page.locator('#version-select');
    await expect(select.locator('option')).toHaveCount(2);

    // Navigate away via header link
    await page.getByRole('link', { name: 'Home', exact: true }).click();
    await expect(page).toHaveURL(/\/en\/$/);

    // Navigate back
    await page.goBack();
    await expect(page).toHaveURL(/\/en\/canvas/);

    // Version dropdown should still be populated
    const selectAfterBack = page.locator('#version-select');
    await expect(selectAfterBack).toBeVisible();
    await expect(selectAfterBack.locator('option')).toHaveCount(2);
    await expect(selectAfterBack).toHaveValue('v1');
  });

  test('canvas generates animation by typing a company name', async ({ page }) => {
    await page.goto('/en/canvas/');

    // Demo auto-renders on load, so result state should be visible
    await expect(page.locator('#canvas-result')).toBeVisible({ timeout: 10000 });

    // Type company name and submit to generate a new animation
    const input = page.locator('#canvas-input');
    await input.fill('Acme Corp');
    await page.locator('#canvas-form').locator('button[type="submit"]').click();

    // Should show loading state
    const loadingEl = page.locator('#canvas-loading');
    await expect(loadingEl).toBeVisible({ timeout: 5000 });

    // Should eventually show result or error (API may not be available in CI)
    const resultOrError = page.locator('#canvas-result:not(.hidden), #canvas-error:not(.hidden)');
    await expect(resultOrError.first()).toBeVisible({ timeout: 30000 });
  });

  test('canvas generates with v1 version selected', async ({ page }) => {
    await page.goto('/en/canvas/');

    // Select v1 explicitly
    const select = page.locator('#version-select');
    await select.selectOption('v1');
    await expect(select).toHaveValue('v1');

    // Type and submit
    const input = page.locator('#canvas-input');
    await input.fill('Test Company');
    await page.locator('#canvas-form').locator('button[type="submit"]').click();

    // Should transition from idle to loading
    await expect(page.locator('#canvas-loading')).toBeVisible({ timeout: 5000 });
  });
});
