import { test, expect } from '@playwright/test';

const EXPORT_SETTINGS_KEY = 'canvas-export-settings';

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
  async function mockSupportedWebM(page: import('@playwright/test').Page): Promise<void> {
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

        constructor(_stream?: unknown, options?: { mimeType?: string }) {
          (window as unknown as { __recorderMime?: string }).__recorderMime = options?.mimeType;
        }

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
        value: function captureStreamForTest() {
          (
            window as unknown as { __lastCapture?: { width: number; height: number } }
          ).__lastCapture = {
            width: this.width,
            height: this.height,
          };
          return {
            getVideoTracks: () => [
              {
                requestFrame: () => {},
              },
            ],
          };
        },
      });
    });
  }

  async function mockDownloadRoute(page: import('@playwright/test').Page): Promise<void> {
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
  }

  test('supported environment shows export progress and completion states', async ({ page }) => {
    await mockSupportedWebM(page);
    await mockDownloadRoute(page);

    await page.goto('/en/canvas/?session_id=test-export-supported');

    await expect(page.locator('#canvas-download-processing')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('#download-warning')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('#download-warning')).toContainText(/Keep this tab active/i);
    await expect(page.locator('#download-status')).toContainText(/Video export complete/i, {
      timeout: 15000,
    });
    await expect(page.locator('#download-warning')).toBeHidden();
    await expect(page.locator('#download-progress-bar')).toHaveAttribute('style', /100%/);
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

    await mockDownloadRoute(page);

    await page.goto('/en/canvas/?session_id=test-export-unsupported');

    await expect(page.locator('#canvas-download-processing')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('#download-status')).toContainText(/fallback|unsupported/i);
  });

  test('return flow applies 720p 1:1 settings to offscreen capture dimensions', async ({
    page,
  }) => {
    await page.addInitScript((key) => {
      localStorage.setItem(
        key,
        JSON.stringify({ format: 'webm', aspectRatio: '1:1', quality: '720p' }),
      );
    }, EXPORT_SETTINGS_KEY);
    await mockSupportedWebM(page);
    await mockDownloadRoute(page);

    await page.goto('/en/canvas/?session_id=test-export-square-720');
    await expect(page.locator('#download-status')).toContainText(/complete/i, { timeout: 15000 });

    const capture = await page.evaluate(() => {
      return (window as unknown as { __lastCapture?: { width: number; height: number } })
        .__lastCapture;
    });
    expect(capture).toEqual({ width: 720, height: 720 });
  });

  test('mp4 selection gracefully falls back to webm when WebCodecs are unavailable', async ({
    page,
  }) => {
    await page.addInitScript((key) => {
      localStorage.setItem(
        key,
        JSON.stringify({ format: 'mp4', aspectRatio: '9:16', quality: '1080p' }),
      );
    }, EXPORT_SETTINGS_KEY);
    await mockSupportedWebM(page);
    await mockDownloadRoute(page);

    await page.goto('/en/canvas/?session_id=test-export-vertical-1080');
    await expect(page.locator('#download-status')).toContainText(/complete/i, { timeout: 15000 });

    const result = await page.evaluate(() => {
      const w = window as unknown as {
        __lastCapture?: { width: number; height: number };
        __recorderMime?: string;
      };
      return { capture: w.__lastCapture, recorderMime: w.__recorderMime };
    });

    expect(result.capture).toEqual({ width: 1080, height: 1920 });
    expect(result.recorderMime).toContain('webm');
  });

  test('export modal presents value framing and single checkout CTA in EN', async ({ page }) => {
    await page.goto('/en/canvas/');

    // Wait for demo canvas result to become visible
    await expect(page.locator('#canvas-result')).not.toHaveClass(/hidden/, { timeout: 5000 });

    // Open export modal
    await page.locator('#canvas-download').click();

    // Assert modal is visible
    await expect(page.locator('#canvas-export-modal')).toBeVisible();

    // Assert value prop framing text is present (no watermarks copy)
    await expect(page.locator('#canvas-export-modal')).toContainText(/no watermarks|DRM-free/i);

    // Assert single dominant checkout CTA is visible and no competing action
    await expect(page.locator('#export-modal-confirm')).toBeVisible();
    await expect(page.locator('#export-modal-confirm')).toHaveCount(1);
  });

  test('export modal presents value framing in PT locale', async ({ page }) => {
    await page.goto('/pt/canvas/');

    await expect(page.locator('#canvas-result')).not.toHaveClass(/hidden/, { timeout: 5000 });

    await page.locator('#canvas-download').click();

    await expect(page.locator('#canvas-export-modal')).toBeVisible();
    await expect(page.locator('#canvas-export-modal')).toContainText(/sem marca|DRM/i);
    await expect(page.locator('#export-modal-confirm')).toHaveCount(1);
  });
});
