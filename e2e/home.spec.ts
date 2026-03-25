import { test, expect } from '@playwright/test';

test.describe('Home Page (EN)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/en/');
  });

  test('has correct page title', async ({ page }) => {
    await expect(page).toHaveTitle(/Gabriel Rodrigues/);
  });

  test('displays hero section with name and title', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Gabriel Rodrigues' })).toBeVisible();
    await expect(page.getByText('Senior Frontend Engineer')).toBeVisible();
  });

  test('displays highlight stats', async ({ page }) => {
    await expect(page.getByText('10+')).toBeVisible();
    await expect(page.getByText('25+')).toBeVisible();
    await expect(page.getByText('60%')).toBeVisible();
    await expect(page.getByText('20%')).toBeVisible();
  });

  test('has CTA buttons linking to resume and blog', async ({ page }) => {
    const resumeLink = page.getByRole('link', { name: 'View Resume' });
    await expect(resumeLink).toBeVisible();
    await expect(resumeLink).toHaveAttribute('href', '/en/resume/');

    const blogLink = page.getByRole('link', { name: 'Read Blog' });
    await expect(blogLink).toBeVisible();
    await expect(blogLink).toHaveAttribute('href', '/en/blog/');
  });

  test('displays about section', async ({ page }) => {
    await expect(page.getByText('About Me')).toBeVisible();
    await expect(page.getByText('over 10 years of experience')).toBeVisible();
  });
});
