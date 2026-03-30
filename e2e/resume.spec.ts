import { test, expect } from '@playwright/test';

test.describe('Resume Page (EN)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/en/resume/');
  });

  test('has resume heading', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Resume', exact: true })).toBeVisible();
  });

  test('has download PDF button', async ({ page }) => {
    const downloadLink = page.getByRole('link', { name: /Download PDF/ });
    await expect(downloadLink).toBeVisible();
    await expect(downloadLink).toHaveAttribute('href', '/resume.pdf');
    await expect(downloadLink).toHaveAttribute('target', '_blank');
  });

  test('displays all experience entries', async ({ page }) => {
    const companies = [
      'The Mill Adventure',
      'Deskhero',
      'Betsson Group',
      'Ancient Gaming',
      'XCaliber',
      'Virtua Software',
    ];
    for (const company of companies) {
      await expect(page.getByText(company, { exact: true })).toBeVisible();
    }
  });

  test('displays skills section with tags', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Skills' })).toBeVisible();
    await expect(page.getByText('Angular', { exact: true })).toBeVisible();
    await expect(page.getByText('Vue 3', { exact: true })).toBeVisible();
    await expect(page.getByText('TypeScript', { exact: true })).toBeVisible();
  });

  test('displays education section', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Education' })).toBeVisible();
    await expect(page.getByText('Pontificia Universidade Catolica de Goias')).toBeVisible();
  });
});
