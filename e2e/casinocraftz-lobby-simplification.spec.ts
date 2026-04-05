import { test, expect } from '@playwright/test';

// Phase 52 — Lobby Simplification (LBY-01, LBY-02)
//
// Covers behaviors verified only by one-off node scripts during plan execution.
// All tests here are re-runnable as part of the Playwright CI suite.

test.describe('LBY-01: Single-column lobby — EN', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/en/casinocraftz/');
  });

  test('aside.ccz-analyzer-panel is absent from EN lobby HTML', async ({ page }) => {
    const analyzer = page.locator('aside.ccz-analyzer-panel');
    await expect(analyzer).toHaveCount(0);
  });

  test('mission-log section is absent from EN lobby HTML', async ({ page }) => {
    const missionLog = page.locator('[data-casinocraftz-zone="mission-log"]');
    await expect(missionLog).toHaveCount(0);
  });

  test('lobby grid has no 260px column gap (single-column layout)', async ({ page }) => {
    const grid = page.locator('.ccz-lobby-grid');
    await expect(grid).toBeVisible();
    const gridTemplateColumns = await grid.evaluate(
      (el) => getComputedStyle(el).gridTemplateColumns,
    );
    // A single-column or block layout produces "none" for grid-template-columns
    // and does not contain the 260px two-column value.
    expect(gridTemplateColumns).not.toContain('260px');
  });
});

test.describe('LBY-01: Single-column lobby — PT', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/pt/casinocraftz/');
  });

  test('aside.ccz-analyzer-panel is absent from PT lobby HTML', async ({ page }) => {
    const analyzer = page.locator('aside.ccz-analyzer-panel');
    await expect(analyzer).toHaveCount(0);
  });

  test('mission-log section is absent from PT lobby HTML', async ({ page }) => {
    const missionLog = page.locator('[data-casinocraftz-zone="mission-log"]');
    await expect(missionLog).toHaveCount(0);
  });

  test('PT lobby grid has no 260px column gap (single-column layout)', async ({ page }) => {
    const grid = page.locator('.ccz-lobby-grid');
    await expect(grid).toBeVisible();
    const gridTemplateColumns = await grid.evaluate(
      (el) => getComputedStyle(el).gridTemplateColumns,
    );
    expect(gridTemplateColumns).not.toContain('260px');
  });
});

test.describe('LBY-02: Info buttons present — EN', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/en/casinocraftz/');
  });

  test('EN lobby has exactly 9 info toggle buttons (3 per chamber card)', async ({ page }) => {
    const toggles = page.locator('[data-ccz-info-toggle]');
    await expect(toggles).toHaveCount(9);
  });

  test('EN lobby has exactly 9 info popover elements', async ({ page }) => {
    const popovers = page.locator('[data-ccz-info-popover]');
    await expect(popovers).toHaveCount(9);
  });

  test('all 9 info popovers are hidden on initial page load in EN', async ({ page }) => {
    const popovers = page.locator('[data-ccz-info-popover]');
    const count = await popovers.count();
    for (let i = 0; i < count; i++) {
      await expect(popovers.nth(i)).toHaveAttribute('hidden', '');
    }
  });
});

test.describe('LBY-02: Info buttons present — PT', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/pt/casinocraftz/');
  });

  test('PT lobby has exactly 9 info toggle buttons (3 per chamber card)', async ({ page }) => {
    const toggles = page.locator('[data-ccz-info-toggle]');
    await expect(toggles).toHaveCount(9);
  });

  test('PT lobby has exactly 9 info popover elements', async ({ page }) => {
    const popovers = page.locator('[data-ccz-info-popover]');
    await expect(popovers).toHaveCount(9);
  });

  test('all 9 info popovers are hidden on initial page load in PT', async ({ page }) => {
    const popovers = page.locator('[data-ccz-info-popover]');
    const count = await popovers.count();
    for (let i = 0; i < count; i++) {
      await expect(popovers.nth(i)).toHaveAttribute('hidden', '');
    }
  });
});

test.describe('LBY-02: Info button click toggles popover visibility — EN', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/en/casinocraftz/');
  });

  test('clicking an info button removes hidden from its paired popover', async ({ page }) => {
    const btn = page.locator('[data-ccz-info-toggle="ccz-info-edge-slots"]');
    const popover = page.locator('#ccz-info-edge-slots[data-ccz-info-popover]');

    await expect(popover).toHaveAttribute('hidden', '');
    await btn.click();
    await expect(popover).not.toHaveAttribute('hidden');
  });

  test('clicking the info button a second time re-hides the popover (toggle semantics)', async ({
    page,
  }) => {
    const btn = page.locator('[data-ccz-info-toggle="ccz-info-signal-slots"]');
    const popover = page.locator('#ccz-info-signal-slots[data-ccz-info-popover]');

    await btn.click();
    await expect(popover).not.toHaveAttribute('hidden');

    await btn.click();
    await expect(popover).toHaveAttribute('hidden', '');
  });

  test('each info button only opens its own paired popover (no cross-trigger)', async ({
    page,
  }) => {
    const btnEdge = page.locator('[data-ccz-info-toggle="ccz-info-edge-slots"]');
    const popoverEdge = page.locator('#ccz-info-edge-slots[data-ccz-info-popover]');
    const popoverSignal = page.locator('#ccz-info-signal-slots[data-ccz-info-popover]');

    await btnEdge.click();
    await expect(popoverEdge).not.toHaveAttribute('hidden');
    await expect(popoverSignal).toHaveAttribute('hidden', '');
  });
});

test.describe('LBY-02: Info button click toggles popover visibility — PT', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/pt/casinocraftz/');
  });

  test('PT: clicking an info button removes hidden from its paired popover', async ({ page }) => {
    const btn = page.locator('[data-ccz-info-toggle="ccz-info-edge-slots"]');
    const popover = page.locator('#ccz-info-edge-slots[data-ccz-info-popover]');

    await expect(popover).toHaveAttribute('hidden', '');
    await btn.click();
    await expect(popover).not.toHaveAttribute('hidden');
  });

  test('PT: clicking the info button a second time re-hides the popover (toggle semantics)', async ({
    page,
  }) => {
    const btn = page.locator('[data-ccz-info-toggle="ccz-info-signal-slots"]');
    const popover = page.locator('#ccz-info-signal-slots[data-ccz-info-popover]');

    await btn.click();
    await expect(popover).not.toHaveAttribute('hidden');

    await btn.click();
    await expect(popover).toHaveAttribute('hidden', '');
  });
});
