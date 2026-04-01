# Testing

## Framework

**Playwright** — E2E tests only. No unit or integration tests exist.

- Config: `playwright.config.ts`
- Test directory: `e2e/`
- Reporters: HTML (`playwright-report/`)
- Trace: `on-first-retry`

## Test Structure

6 spec files covering full user-visible functionality:

| File                     | Coverage                                                     |
| ------------------------ | ------------------------------------------------------------ |
| `e2e/home.spec.ts`       | Homepage EN — title, hero, stats, CTA buttons                |
| `e2e/blog.spec.ts`       | Blog listing, post navigation, markdown rendering, back link |
| `e2e/navigation.spec.ts` | Root redirect, header nav, logo link, footer social links    |
| `e2e/i18n.spec.ts`       | Language switching, URL patterns, translated content         |
| `e2e/canvas.spec.ts`     | Three.js canvas page interactions                            |
| `e2e/resume.spec.ts`     | Resume page content                                          |

## Test Browsers / Devices

```typescript
projects: [
  { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
  { name: 'mobile-chrome', use: { ...devices['Pixel 5'] } },
];
```

Desktop Chrome + Pixel 5 mobile. No Firefox or Safari coverage.

## Server Strategy

- **Local dev**: reuses existing server if running (`reuseExistingServer: true`)
- **CI**: builds and previews (`npm run build && npm run preview`), 2 retries, 1 worker, `reuseExistingServer: false`
- **Base URL**: `http://localhost:4321`
- **Build timeout**: 120,000ms

## Execution Commands

```bash
npm run test          # Run all E2E tests (headless)
npm run test:ui       # Playwright UI mode
npm run test:headed   # Visible browser
```

## Common Patterns

**Navigation assertion:**

```typescript
await page.goto('/en/blog/');
await expect(page).toHaveURL(/\/en\/blog\/?$/);
```

**Visibility check:**

```typescript
await expect(page.getByRole('heading', { name: 'Blog' })).toBeVisible();
```

**Click and navigate:**

```typescript
await page.getByRole('link', { name: /Hello World/ }).click();
await expect(page).toHaveURL(/\/en\/blog\/hello-world/);
```

**beforeEach for shared setup:**

```typescript
test.beforeEach(async ({ page }) => {
  await page.goto('/en/');
});
```

**Locator filtering:**

```typescript
page.locator('section').filter({ hasText: 'Years of Experience' });
page.locator('span', { hasText: 'intro' }).first();
```

## No Mocking

Tests run against the actual static build — no API mocking, no network interception. The Cloudflare Worker (`api/`) is not tested in E2E.

## Coverage Gaps

- No unit tests for `src/i18n/utils.ts` (`getLangFromUrl`, `useTranslations`)
- No unit tests for blog search index generation
- No unit tests for canvas animation scripts (`src/scripts/canvas/`)
- No unit tests for OG image generation (`src/pages/og/[...slug].png.ts`)
- No Firefox or Safari browser coverage
- No PT (Portuguese) homepage tests (only EN covered in `home.spec.ts`)
- Cloudflare Worker (`api/`) has no tests

---

_Mapped: 2026-04-01_
