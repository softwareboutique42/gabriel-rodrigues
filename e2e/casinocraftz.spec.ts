import { test, expect } from '@playwright/test';

test.describe('Casinocraftz Lesson 3 - spin-bridge gate (EDU-72)', () => {
  test('sensory-conditioning-observe does not advance before 2 spins and advances on the second - EN', async ({
    page,
  }) => {
    await page.goto('/en/casinocraftz/');

    await page.evaluate(() => {
      localStorage.setItem('ccz-tutorial-completed', '1');
      localStorage.setItem('ccz-near-miss-completed', '1');
    });
    await page.reload();

    const root = page.locator('[data-casinocraftz-shell-root]');
    await expect(root).toHaveAttribute('data-casinocraftz-current-lesson', 'house-edge');

    await page
      .locator(
        '[data-casinocraftz-lesson="sensory-conditioning"] [data-casinocraftz-lesson-action="sensory-conditioning"]',
      )
      .click();

    await expect(root).toHaveAttribute(
      'data-casinocraftz-tutorial-step',
      'sensory-conditioning-intro',
    );
    await page.locator('[data-casinocraftz-tutorial-next]').click();
    await expect(root).toHaveAttribute(
      'data-casinocraftz-tutorial-step',
      'sensory-conditioning-observe',
    );

    await page.evaluate(() => {
      window.postMessage({ type: 'ccz:spin-settled', version: 1, payload: { spinIndex: 0 } }, '*');
    });
    await expect(root).toHaveAttribute(
      'data-casinocraftz-tutorial-step',
      'sensory-conditioning-observe',
    );

    await page.evaluate(() => {
      window.postMessage({ type: 'ccz:spin-settled', version: 1, payload: { spinIndex: 1 } }, '*');
    });
    await expect(root).toHaveAttribute(
      'data-casinocraftz-tutorial-step',
      'sensory-conditioning-reveal',
    );
  });

  test('causality disclosure renders after spin-triggered transition - EN and PT', async ({
    page,
  }) => {
    for (const lang of ['en', 'pt'] as const) {
      await page.goto(`/${lang}/casinocraftz/`);

      await page.evaluate(() => {
        localStorage.setItem('ccz-tutorial-completed', '1');
        localStorage.setItem('ccz-near-miss-completed', '1');
      });
      await page.reload();

      const root = page.locator('[data-casinocraftz-shell-root]');
      await page
        .locator(
          '[data-casinocraftz-lesson="sensory-conditioning"] [data-casinocraftz-lesson-action="sensory-conditioning"]',
        )
        .click();

      await expect(root).toHaveAttribute(
        'data-casinocraftz-tutorial-step',
        'sensory-conditioning-intro',
      );
      await page.locator('[data-casinocraftz-tutorial-next]').click();
      await expect(root).toHaveAttribute(
        'data-casinocraftz-tutorial-step',
        'sensory-conditioning-observe',
      );

      await page.evaluate(() => {
        window.postMessage(
          { type: 'ccz:spin-settled', version: 1, payload: { spinIndex: 0 } },
          '*',
        );
      });
      await expect(root).toHaveAttribute(
        'data-casinocraftz-tutorial-step',
        'sensory-conditioning-observe',
      );

      await page.evaluate(() => {
        window.postMessage(
          { type: 'ccz:spin-settled', version: 1, payload: { spinIndex: 1 } },
          '*',
        );
      });
      await expect(root).toHaveAttribute(
        'data-casinocraftz-tutorial-step',
        'sensory-conditioning-reveal',
      );

      await expect(page.locator('[data-casinocraftz-recap="true"]')).toBeVisible();
    }
  });
});
