import { test, expect } from '@playwright/test';

test.describe('Blog (EN)', () => {
  test('blog listing shows posts', async ({ page }) => {
    await page.goto('/en/blog/');
    await expect(page.getByRole('heading', { name: 'Blog' })).toBeVisible();
    await expect(page.getByText('Hello World')).toBeVisible();
  });

  test('blog card shows metadata', async ({ page }) => {
    await page.goto('/en/blog/');
    await expect(page.locator('span', { hasText: 'intro' }).first()).toBeVisible();
    await expect(page.locator('span', { hasText: 'web development' }).first()).toBeVisible();
  });

  test('clicking blog card navigates to post', async ({ page }) => {
    await page.goto('/en/blog/');
    await page.getByRole('link', { name: /Hello World/ }).click();
    await expect(page).toHaveURL(/\/en\/blog\/hello-world/);
    await expect(page.getByRole('heading', { name: 'Hello World!' })).toBeVisible();
  });

  test('blog post renders markdown content', async ({ page }) => {
    await page.goto('/en/blog/hello-world/');
    await expect(page.getByRole('heading', { name: 'What to expect' })).toBeVisible();
    await expect(page.getByText('Frontend Architecture', { exact: true })).toBeVisible();
  });

  test('back to blog link works', async ({ page }) => {
    await page.goto('/en/blog/hello-world/');
    await page.getByText('Back to blog').click();
    await expect(page).toHaveURL(/\/en\/blog\/?$/);
  });
});
