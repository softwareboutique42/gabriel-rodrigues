import { test, expect } from '@playwright/test';

test.describe('Language Switching', () => {
  test('EN home shows English content', async ({ page }) => {
    await page.goto('/en/');
    await expect(page.getByText("Hi, I'm")).toBeVisible();
    await expect(page.getByText('About Me')).toBeVisible();
  });

  test('language switcher shows PT on EN pages', async ({ page }) => {
    await page.goto('/en/');
    await expect(page.getByRole('link', { name: 'PT' })).toBeVisible();
  });

  test('clicking PT switches to Portuguese home', async ({ page }) => {
    await page.goto('/en/');
    await page.getByRole('link', { name: 'PT' }).click();
    await expect(page).toHaveURL(/\/pt\//);
    await expect(page.getByText('Sobre Mim')).toBeVisible();
  });

  test('PT pages show Portuguese content', async ({ page }) => {
    await page.goto('/pt/');
    await expect(page.getByText('Ola, eu sou')).toBeVisible();
    await expect(page.getByText('Engenheiro Frontend Senior')).toBeVisible();
  });

  test('PT page switcher shows EN and switches back', async ({ page }) => {
    await page.goto('/pt/');
    await expect(page.getByRole('link', { name: 'EN' })).toBeVisible();
    await page.getByRole('link', { name: 'EN' }).click();
    await expect(page).toHaveURL(/\/en\//);
    await expect(page.getByText('About Me')).toBeVisible();
  });

  test('language switch works on resume page', async ({ page }) => {
    await page.goto('/en/resume/');
    await page.getByRole('link', { name: 'PT' }).click();
    await expect(page).toHaveURL(/\/pt\/resume/);
    await expect(page.getByRole('heading', { name: 'Curriculo' })).toBeVisible();
  });

  test('language switch works on blog page', async ({ page }) => {
    await page.goto('/en/blog/');
    await page.getByRole('link', { name: 'PT' }).click();
    await expect(page).toHaveURL(/\/pt\/blog/);
    await expect(page.getByText('Ola Mundo')).toBeVisible();
  });
});
