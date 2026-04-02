import { test, expect } from '@playwright/test';

const paidDownloadPayload = {
  config: {
    companyName: 'Export Labs',
    colors: {
      primary: '#4cf0c6',
      secondary: '#7aa9ff',
      accent: '#f9ce5d',
      background: '#0d1620',
    },
    tagline: 'Video export',
    industry: 'Creative Technology',
    description: 'Export Labs builds deterministic canvas exports.',
    mood: 'bold',
    industryCategory: 'creative',
    energyLevel: 0.77,
    animationStyle: 'spotlight',
    animationParams: {
      speed: 1,
      density: 0.7,
      complexity: 0.8,
    },
    visualElements: ['capture', 'timeline', 'render'],
  },
  version: 'v2',
  exportType: 'video',
};

test.describe('Canvas Export UX', () => {
  test('supported environment shows export progress and completion states', async ({ page }) => {
    await page.addInitScript(() => {
      Object.defineProperty(window, 'VideoEncoder', {
        configurable: true,
        value: undefined,
      });
      Object.defineProperty(window, 'VideoFrame', {
        configurable: true,
        value: undefined,
      });

      class FakeMediaRecorder {
        static isTypeSupported() {
          return true;
        }

        state = 'inactive';
        onstart = null;
        onstop = null;
        onerror = null;
        ondataavailable = null;

        constructor() {}

        start() {
          this.state = 'recording';
          this.onstart?.();
          queueMicrotask(() => {
            this.ondataavailable?.({
              data: new Blob(['fake-video'], { type: 'video/webm' }),
            });
          });
        }

        stop() {
          if (this.state === 'inactive') return;
          this.state = 'inactive';
          this.onstop?.();
        }
      }

      Object.defineProperty(window, 'MediaRecorder', {
        configurable: true,
        value: FakeMediaRecorder,
      });

      Object.defineProperty(HTMLCanvasElement.prototype, 'captureStream', {
        configurable: true,
        value: () => ({
          getVideoTracks: () => [
            {
              requestFrame: () => {},
            },
          ],
        }),
      });
    });

    await page.route(
      'https://company-canvas-api.gabrielr47.workers.dev/download**',
      async (route) => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(paidDownloadPayload),
        });
      },
    );

    await page.goto('/en/canvas/?session_id=test-export-supported');

    await expect(page.locator('#canvas-download-processing')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('#download-status')).toContainText(/Video export complete/i, {
      timeout: 15000,
    });
    await expect(page.locator('#download-warning')).toContainText(/Keep this tab active/i);
    await expect(page.locator('#canvas-el')).toHaveCount(1);
  });

  test('unsupported environment shows explicit fallback guidance', async ({ page }) => {
    await page.addInitScript(() => {
      Object.defineProperty(window, 'MediaRecorder', {
        configurable: true,
        value: undefined,
      });
      Object.defineProperty(window, 'VideoEncoder', {
        configurable: true,
        value: undefined,
      });
      Object.defineProperty(window, 'VideoFrame', {
        configurable: true,
        value: undefined,
      });
      Object.defineProperty(HTMLCanvasElement.prototype, 'captureStream', {
        configurable: true,
        value: undefined,
      });
    });

    await page.route(
      'https://company-canvas-api.gabrielr47.workers.dev/download**',
      async (route) => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(paidDownloadPayload),
        });
      },
    );

    await page.goto('/en/canvas/?session_id=test-export-unsupported');

    await expect(page.locator('#canvas-download-processing')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('#download-status')).toContainText(/fallback|unsupported/i);
  });
});
