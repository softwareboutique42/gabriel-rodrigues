import { test, expect } from '@playwright/test';

test.describe('Site Navigation', () => {
  test('root redirects to /en/', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveURL(/\/en\//);
  });

  test('header nav links work', async ({ page }) => {
    await page.goto('/en/');

    await page.getByRole('link', { name: 'Resume', exact: true }).click();
    await expect(page).toHaveURL(/\/en\/resume/);

    await page.getByRole('link', { name: 'Blog', exact: true }).click();
    await expect(page).toHaveURL(/\/en\/blog/);

    await page.getByRole('link', { name: 'Home', exact: true }).click();
    await expect(page).toHaveURL(/\/en\/$/);
  });

  test('GR logo links to home', async ({ page }) => {
    await page.goto('/en/blog/');
    await page.locator('header').getByRole('link', { name: /GR/ }).click();
    await expect(page).toHaveURL(/\/en\/$/);
  });

  test('footer has social links with correct attributes', async ({ page }) => {
    await page.goto('/en/');

    const linkedin = page.getByRole('link', { name: 'LinkedIn' });
    await expect(linkedin).toHaveAttribute('href', /linkedin\.com/);
    await expect(linkedin).toHaveAttribute('target', '_blank');

    const github = page.getByRole('link', { name: 'GitHub' });
    await expect(github).toHaveAttribute('href', /github\.com/);
    await expect(github).toHaveAttribute('target', '_blank');

    const email = page.getByRole('link', { name: 'Email' });
    await expect(email).toHaveAttribute('href', /mailto:/);
  });
});
