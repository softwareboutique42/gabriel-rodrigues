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

  test('canvas renders normalized semantic payload with deterministic style info', async ({
    page,
  }) => {
    const companyName = 'Deterministic Labs';

    await page.route('https://company-canvas-api.gabrielr47.workers.dev/', async (route) => {
      const request = route.request();
      if (request.method() !== 'POST') {
        await route.continue();
        return;
      }

      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          companyName,
          colors: {
            primary: '#4cf0c6',
            secondary: '#7aa9ff',
            accent: '#f9ce5d',
            background: '#0d1620',
          },
          tagline: 'Designing certainty',
          industry: 'Creative Technology',
          description: 'Deterministic Labs designs visual systems.',
          mood: 'bold',
          industryCategory: 'creative',
          energyLevel: 0.77,
          animationStyle: 'particles',
          animationParams: {
            speed: 1,
            density: 0.7,
            complexity: 0.8,
          },
          visualElements: [
            'hyper-personalization',
            'cross-channel-orchestration',
            'high-fidelity-motion-system',
          ],
        }),
      });
    });

    await page.goto('/en/canvas/');
    await page.locator('#version-select').selectOption('v2');
    await page.locator('#canvas-input').fill(companyName);
    await page.locator('#canvas-form').locator('button[type="submit"]').click();

    await expect(page.locator('#canvas-result')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('#overlay-name')).toHaveText(companyName);

    // v2 + creative should deterministically resolve to spotlight despite mocked animationStyle value.
    await expect(page.locator('#info-style')).toHaveText('spotlight');
  });

  test('canvas renders light-background payload without entering error state', async ({ page }) => {
    const companyName = 'Light Theme Co';

    await page.route('https://company-canvas-api.gabrielr47.workers.dev/', async (route) => {
      if (route.request().method() !== 'POST') {
        await route.continue();
        return;
      }

      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          companyName,
          colors: {
            primary: '#1d4ed8',
            secondary: '#0f766e',
            accent: '#d97706',
            background: '#f5f3ec',
          },
          tagline: 'Readable motion on light palettes',
          industry: 'Healthcare',
          description: 'Light Theme Co builds accessible brand systems.',
          mood: 'elegant',
          industryCategory: 'health',
          energyLevel: 0.41,
          animationStyle: 'particles',
          animationParams: {
            speed: 0.9,
            density: 0.75,
            complexity: 0.66,
          },
          visualElements: ['clarity', 'trust', 'care'],
        }),
      });
    });

    await page.goto('/en/canvas/');
    await page.locator('#version-select').selectOption('v1');
    await page.locator('#canvas-input').fill(companyName);
    await page.locator('#canvas-form').locator('button[type="submit"]').click();

    await expect(page.locator('#canvas-result')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('#canvas-error')).toHaveClass(/hidden/);
    await expect(page.locator('#overlay-name')).toHaveText(companyName);
    await expect(page.locator('#info-style')).toHaveText('flowing');
  });

  test('canvas reaches result state when low-concurrency branch is forced', async ({ page }) => {
    await page.addInitScript(() => {
      Object.defineProperty(window.navigator, 'hardwareConcurrency', {
        configurable: true,
        get: () => 2,
      });
    });

    const companyName = 'Mobile Budget Labs';

    await page.route('https://company-canvas-api.gabrielr47.workers.dev/', async (route) => {
      if (route.request().method() !== 'POST') {
        await route.continue();
        return;
      }

      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          companyName,
          colors: {
            primary: '#7c3aed',
            secondary: '#14b8a6',
            accent: '#f59e0b',
            background: '#090d1f',
          },
          tagline: 'Stable output on constrained devices',
          industry: 'Technology',
          description: 'Mobile Budget Labs focuses on resilient GPU-heavy interfaces.',
          mood: 'dynamic',
          industryCategory: 'tech',
          energyLevel: 0.82,
          animationStyle: 'flowing',
          animationParams: {
            speed: 1,
            density: 1,
            complexity: 0.9,
          },
          visualElements: ['gpu', 'latency', 'budget', 'frames'],
        }),
      });
    });

    await page.goto('/en/canvas/');
    await page.locator('#version-select').selectOption('v1');
    await page.locator('#canvas-input').fill(companyName);
    await page.locator('#canvas-form').locator('button[type="submit"]').click();

    await expect(page.locator('#canvas-result')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('#overlay-name')).toHaveText(companyName);
    await expect(page.locator('#info-style')).toHaveText('particles');
  });
});
