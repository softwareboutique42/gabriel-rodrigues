import { test, expect, type Locator, type Page } from '@playwright/test';

function pathRegex(path: string): RegExp {
  const escaped = path.replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace(/\/$/, '');
  return new RegExp(`${escaped}/?$`);
}

async function expectSlotsState(root: Locator, state: string | RegExp): Promise<void> {
  await expect(root).toHaveAttribute('data-slots-state', state);
}

async function expectSlotsStatus(page: Page, text: string | RegExp): Promise<void> {
  await expect(page.locator('#slots-gameplay-status')).toHaveText(text);
}

async function expectRuntimeParityEnvelope(root: Locator): Promise<void> {
  await expect(root).toHaveAttribute('data-slots-balance', /\d+/);
  await expect(root).toHaveAttribute('data-slots-bet', /\d+/);
  await expect(root).toHaveAttribute('data-slots-theme', 'slots-core-v1');
  await expect(root).toHaveAttribute('data-slots-motion', 'full');
  await expect(root).toHaveAttribute('data-slots-label-state', /State|Estado/);
  await expect(root).toHaveAttribute('data-slots-label-outcome', /Outcome|Resultado/);
  await expect(root).toHaveAttribute('data-slots-label-seed', 'Seed');
  await expect(root).toHaveAttribute('data-slots-label-balance', /Balance|Saldo/);
  await expect(root).toHaveAttribute('data-slots-label-bet', /Bet|Aposta/);
  await expect(root).toHaveAttribute('data-slots-anim-atlas', 'ready');
  await expect(root).toHaveAttribute('data-slots-anim-atlas-id', 'slots-core-v1');
  await expect(root).toHaveAttribute('data-slots-anim-theme', 'slots-core-v1');
  await expect(root).toHaveAttribute('data-slots-anim-atmosphere-theme', 'core');
  await expect(root).toHaveAttribute('data-slots-anim-reduced-motion', 'false');
  await expect(root).toHaveAttribute('data-slots-anim-intensity-requested', 'full');
  await expect(root).toHaveAttribute('data-slots-anim-intensity', /full|reduced|minimal/);
  await expect(root).toHaveAttribute('data-slots-anim-performance', /ok|degraded/);
  await expect(root).toHaveAttribute('data-slots-anim-idle', 'idle-pulse');
  await expect(root).toHaveAttribute(
    'data-slots-anim-effect',
    /idle|charge|sustain|win|loss|blocked/,
  );
  await expect(root).toHaveAttribute(
    'data-slots-anim-atmosphere',
    /idle|charge|vortex|celebrate|shadow|caution/,
  );
}

async function expectSlotsShellEnvelope(page: Page): Promise<void> {
  const zones = ['header', 'playfield', 'console', 'compliance', 'navigation'];

  for (const zone of zones) {
    const locator = page.locator(`[data-slots-zone="${zone}"]`);
    await expect(locator).toBeVisible();
    await expect(locator).not.toHaveText(/^\s*$/);
  }

  await expect(page.locator('[data-slots-reel-window]')).toHaveCount(3);
}

async function clearPersistedAnalyticsEvents(page: Page): Promise<void> {
  await page.evaluate(() => {
    try {
      sessionStorage.removeItem('cc.analytics.events');
    } catch {
      // Some browsers block storage access on about:blank before first navigation.
    }
  });
}

async function readPersistedAnalyticsEvents(page: Page): Promise<Array<Record<string, unknown>>> {
  return page.evaluate(() => {
    try {
      const raw = sessionStorage.getItem('cc.analytics.events');
      return raw ? (JSON.parse(raw) as Array<Record<string, unknown>>) : [];
    } catch {
      return [];
    }
  });
}

async function spinAndWaitForResolution(
  page: Page,
  root: Locator,
  statusText: {
    spinning: string | RegExp;
    result: string | RegExp;
  },
): Promise<void> {
  await page.locator('#slots-spin-button').click();
  await expectSlotsState(root, 'spinning');
  await expect(page.locator('#slots-spin-button')).toBeDisabled();
  await expectSlotsStatus(page, statusText.spinning);
  await expect(root).toHaveAttribute('data-slots-anim-symbol-states', /"A":"spin"/);
  await expect(root).toHaveAttribute('data-slots-anim-effect', /charge|sustain/);
  await expect(root).toHaveAttribute('data-slots-anim-atmosphere', /charge|vortex/);

  await expectSlotsState(root, 'result');
  await expectSlotsStatus(page, statusText.result);
}

async function setMaximumBet(page: Page): Promise<void> {
  const incBetButton = page.locator('#slots-bet-inc');

  for (let index = 0; index < 8; index += 1) {
    await incBetButton.click();
  }

  await expect(page.locator('#slots-bet-value')).toHaveText('10');
}

interface RuntimeErrorSurface {
  consoleErrors: string[];
  pageErrors: string[];
}

function watchErrorSurface(page: Page): RuntimeErrorSurface {
  const surface: RuntimeErrorSurface = {
    consoleErrors: [],
    pageErrors: [],
  };

  page.on('console', (message) => {
    if (message.type() === 'error') {
      surface.consoleErrors.push(message.text());
    }
  });

  page.on('pageerror', (error) => {
    surface.pageErrors.push(String(error));
  });

  return surface;
}

function expectCleanErrorSurface(surface: RuntimeErrorSurface, contextLabel: string): void {
  expect(surface.consoleErrors, `${contextLabel}: unexpected console errors`).toEqual([]);
  expect(surface.pageErrors, `${contextLabel}: unexpected page errors`).toEqual([]);
}

test.describe('Compatibility hardening', () => {
  test('projects discovery journey resolves to canonical canvas and casinocraftz routes in EN/PT', async ({
    page,
  }) => {
    await clearPersistedAnalyticsEvents(page);
    await page.goto('/en/projects/');
    await page.getByRole('link', { name: 'Explore Canvas', exact: true }).click();
    await expect(page).toHaveURL(pathRegex('/en/canvas/'));
    const enCanvasEvents = await readPersistedAnalyticsEvents(page);
    await expect
      .poll(() => enCanvasEvents.some((event) => event.name === 'projects_cta_click'))
      .toBe(true);
    await expect
      .poll(() =>
        enCanvasEvents.some(
          (event) =>
            event.route === '/en/projects/' &&
            event.locale === 'en' &&
            event.surface === 'projects' &&
            (event.payload as { target?: string })?.target === 'canvas',
        ),
      )
      .toBe(true);

    await clearPersistedAnalyticsEvents(page);
    await page.goto('/en/projects/');
    await page.getByRole('link', { name: 'Open Casinocraftz', exact: true }).click();
    await expect(page).toHaveURL(pathRegex('/en/casinocraftz/'));
    const enCasinocraftzEvents = await readPersistedAnalyticsEvents(page);
    await expect
      .poll(() =>
        enCasinocraftzEvents.some(
          (event) =>
            event.name === 'projects_cta_click' &&
            event.route === '/en/projects/' &&
            event.locale === 'en' &&
            (event.payload as { target?: string })?.target === 'casinocraftz',
        ),
      )
      .toBe(true);

    await clearPersistedAnalyticsEvents(page);
    await page.goto('/pt/projects/');
    await page.getByRole('link', { name: 'Explorar Canvas', exact: true }).click();
    await expect(page).toHaveURL(pathRegex('/pt/canvas/'));
    const ptCanvasEvents = await readPersistedAnalyticsEvents(page);
    await expect
      .poll(() =>
        ptCanvasEvents.some(
          (event) =>
            event.name === 'projects_cta_click' &&
            event.route === '/pt/projects/' &&
            event.locale === 'pt' &&
            (event.payload as { target?: string })?.target === 'canvas',
        ),
      )
      .toBe(true);

    await clearPersistedAnalyticsEvents(page);
    await page.goto('/pt/projects/');
    await page.getByRole('link', { name: 'Abrir Casinocraftz', exact: true }).click();
    await expect(page).toHaveURL(pathRegex('/pt/casinocraftz/'));
    const ptCasinocraftzEvents = await readPersistedAnalyticsEvents(page);
    await expect
      .poll(() =>
        ptCasinocraftzEvents.some(
          (event) =>
            event.name === 'projects_cta_click' &&
            event.route === '/pt/projects/' &&
            event.locale === 'pt' &&
            (event.payload as { target?: string })?.target === 'casinocraftz',
        ),
      )
      .toBe(true);
  });

  test('language switch resolves exact EN/PT counterpart routes for projects, canvas, slots, and casinocraftz', async ({
    page,
  }) => {
    const matrix: Array<[string, string, string]> = [
      ['/en/projects/', 'PT', '/pt/projects/'],
      ['/pt/projects/', 'EN', '/en/projects/'],
      ['/en/canvas/', 'PT', '/pt/canvas/'],
      ['/pt/canvas/', 'EN', '/en/canvas/'],
      ['/en/slots/', 'PT', '/pt/slots/'],
      ['/pt/slots/', 'EN', '/en/slots/'],
      ['/en/casinocraftz/', 'PT', '/pt/casinocraftz/'],
      ['/pt/casinocraftz/', 'EN', '/en/casinocraftz/'],
    ];

    for (const [fromPath, switchLabel, expectedPath] of matrix) {
      await page.goto(fromPath);
      await page.locator('header').getByRole('link', { name: switchLabel, exact: true }).click();
      await expect(page).toHaveURL(pathRegex(expectedPath));
    }
  });

  test('navigation and project CTAs never route to deferred /projects/* aliases', async ({
    page,
  }) => {
    await page.goto('/en/projects/');
    await page.getByRole('link', { name: 'Explore Canvas', exact: true }).click();
    await expect(page).not.toHaveURL(/\/projects\/(canvas|slots)\//);

    await page.goto('/pt/projects/');
    await page.getByRole('link', { name: 'Abrir Casinocraftz', exact: true }).click();
    await expect(page).not.toHaveURL(/\/projects\/(canvas|slots)\//);
    await expect(page).not.toHaveURL(/\/projects\/casinocraftz\//);
  });

  test('casinocraftz embeds slots module with canonical EN/PT host parity', async ({ page }) => {
    const errorSurface = watchErrorSurface(page);

    await page.goto('/en/casinocraftz/');
    const enEmbed = page.locator('[data-casinocraftz-slots-embed]');
    await expect(enEmbed).toBeVisible();
    await expect(enEmbed).toHaveAttribute('src', '/en/slots/?host=casinocraftz');

    const enFrame = page.frameLocator('[data-casinocraftz-slots-embed]');
    await expect(enFrame.locator('#slots-shell-root')).toBeVisible();
    await expect(enFrame.locator('#slots-shell-root')).toHaveAttribute(
      'data-slots-host',
      'casinocraftz',
    );
    await expect(enFrame.locator('[data-slots-lesson="house-edge"]')).toBeVisible();
    await enFrame.locator('#slots-spin-button').click();
    await expect(enFrame.locator('#slots-shell-root')).toHaveAttribute(
      'data-slots-state',
      'spinning',
    );
    await expect(enFrame.locator('#slots-shell-root')).toHaveAttribute(
      'data-slots-state',
      'result',
    );
    await expect(enFrame.locator('#slots-gameplay-seed')).toHaveText('Seed: slots-phase-13-en:1');

    await page.goto('/pt/casinocraftz/');
    const ptEmbed = page.locator('[data-casinocraftz-slots-embed]');
    await expect(ptEmbed).toBeVisible();
    await expect(ptEmbed).toHaveAttribute('src', '/pt/slots/?host=casinocraftz');

    const ptFrame = page.frameLocator('[data-casinocraftz-slots-embed]');
    await expect(ptFrame.locator('#slots-shell-root')).toBeVisible();
    await expect(ptFrame.locator('#slots-shell-root')).toHaveAttribute(
      'data-slots-host',
      'casinocraftz',
    );
    await expect(ptFrame.locator('[data-slots-lesson="house-edge"]')).toBeVisible();
    await ptFrame.locator('#slots-spin-button').click();
    await expect(ptFrame.locator('#slots-shell-root')).toHaveAttribute(
      'data-slots-state',
      'spinning',
    );
    await expect(ptFrame.locator('#slots-shell-root')).toHaveAttribute(
      'data-slots-state',
      'result',
    );
    await expect(ptFrame.locator('#slots-gameplay-seed')).toHaveText('Seed: slots-phase-13-pt:1');

    await page.goto('/en/projects/');
    await page.getByRole('link', { name: 'Open Casinocraftz', exact: true }).click();
    await expect(page).toHaveURL(pathRegex('/en/casinocraftz/'));

    const enSpaFrame = page.frameLocator('[data-casinocraftz-slots-embed]');
    await expect(enSpaFrame.locator('#slots-shell-root')).toBeVisible();
    await expect(enSpaFrame.locator('#slots-shell-root')).toHaveAttribute(
      'data-slots-host',
      'casinocraftz',
    );
    await enSpaFrame.locator('#slots-spin-button').click();
    await expect(enSpaFrame.locator('#slots-shell-root')).toHaveAttribute(
      'data-slots-state',
      'result',
    );

    expectCleanErrorSurface(errorSurface, 'embedded host parity');
  });

  test.describe('casinocraftz tutorial system', () => {
    test('tutorial panel and card tray are present on EN Casinocraftz page', async ({ page }) => {
      await page.goto('/en/casinocraftz/');
      await expect(page.locator('[data-casinocraftz-zone="tutorial"]')).toBeVisible();
      await expect(page.locator('[data-casinocraftz-zone="cards"]')).toBeVisible();
      await expect(page.locator('[data-casinocraftz-card]')).toHaveCount(3);

      const root = page.locator('[data-casinocraftz-shell-root]');
      await expect(root).toHaveAttribute(
        'data-casinocraftz-tutorial-step',
        /welcome|house-edge-intro|play-and-observe|probability-reveal|card-unlock|complete/,
      );
      await expect(root).toHaveAttribute('data-casinocraftz-essence', /\d+/);
    });

    test('tutorial panel and card tray are present on PT Casinocraftz page', async ({ page }) => {
      await page.goto('/pt/casinocraftz/');
      await expect(page.locator('[data-casinocraftz-zone="tutorial"]')).toBeVisible();
      await expect(page.locator('[data-casinocraftz-zone="cards"]')).toBeVisible();
      await expect(page.locator('[data-casinocraftz-card]')).toHaveCount(3);

      const root = page.locator('[data-casinocraftz-shell-root]');
      await expect(root).toHaveAttribute(
        'data-casinocraftz-tutorial-step',
        /welcome|house-edge-intro|play-and-observe|probability-reveal|card-unlock|complete/,
      );
      await expect(root).toHaveAttribute('data-casinocraftz-essence', /\d+/);
    });

    test('play-and-observe step advances to probability-reveal after 3 spins via postMessage bridge - EN', async ({
      page,
    }) => {
      await page.goto('/en/casinocraftz/');

      const root = page.locator('[data-casinocraftz-shell-root]');
      await page.locator('[data-casinocraftz-tutorial-next]').click();
      await page.locator('[data-casinocraftz-tutorial-next]').click();
      await expect(root).toHaveAttribute('data-casinocraftz-tutorial-step', 'play-and-observe');

      const frame = page.frameLocator('[data-casinocraftz-slots-embed]');
      await frame.locator('#slots-spin-button').click();
      await page.waitForTimeout(600);
      await frame.locator('#slots-spin-button').click();
      await page.waitForTimeout(600);
      await frame.locator('#slots-spin-button').click();
      await page.waitForTimeout(1200);

      await expect(root).toHaveAttribute('data-casinocraftz-tutorial-step', 'probability-reveal');
    });

    test('play-and-observe step advances to probability-reveal after 3 spins via postMessage bridge - PT', async ({
      page,
    }) => {
      await page.goto('/pt/casinocraftz/');

      const root = page.locator('[data-casinocraftz-shell-root]');
      await page.locator('[data-casinocraftz-tutorial-next]').click();
      await page.locator('[data-casinocraftz-tutorial-next]').click();
      await expect(root).toHaveAttribute('data-casinocraftz-tutorial-step', 'play-and-observe');

      const frame = page.frameLocator('[data-casinocraftz-slots-embed]');
      await frame.locator('#slots-spin-button').click();
      await page.waitForTimeout(600);
      await frame.locator('#slots-spin-button').click();
      await page.waitForTimeout(600);
      await frame.locator('#slots-spin-button').click();
      await page.waitForTimeout(1200);

      await expect(root).toHaveAttribute('data-casinocraftz-tutorial-step', 'probability-reveal');
    });
  });

  test('slots runtime compatibility keeps machine-readable gameplay state in EN/PT', async ({
    page,
  }) => {
    const errorSurface = watchErrorSurface(page);

    await clearPersistedAnalyticsEvents(page);
    await page.goto('/en/slots/');

    const root = page.locator('#slots-shell-root');
    await expect(root).toHaveAttribute('data-slots-host', 'standalone');
    await expect(page.locator('[data-slots-lesson="house-edge"]')).toBeHidden();
    await expectRuntimeParityEnvelope(root);
    await expectSlotsShellEnvelope(page);
    await expectSlotsState(root, /idle|result|insufficient/);
    await expect(root).toHaveAttribute('data-slots-anim-state', 'idle');
    await expect(root).toHaveAttribute('data-slots-anim-outcome', 'idle');
    await expect(root).toHaveAttribute('data-slots-anim-effect', 'idle');
    await expect(root).toHaveAttribute('data-slots-anim-atmosphere', 'idle');
    await expect(root).toHaveAttribute('data-slots-anim-symbol-states', /"A":"idle"/);
    await expect(root).toHaveAttribute('data-slots-anim-seq', '0');
    await expectSlotsStatus(page, 'State: Idle');
    await expect(page.locator('#slots-gameplay-outcome')).toHaveText('Outcome: pending');

    await spinAndWaitForResolution(page, root, {
      spinning: 'State: Spinning',
      result: 'State: Result ready',
    });
    await expectRuntimeParityEnvelope(root);
    await expect(root).toHaveAttribute('data-slots-anim-state', 'stop');
    await expect(root).toHaveAttribute('data-slots-anim-outcome', /win|loss/);
    await expect(root).toHaveAttribute('data-slots-anim-effect', /win|loss/);
    await expect(root).toHaveAttribute('data-slots-anim-atmosphere', /celebrate|shadow/);
    await expect(root).toHaveAttribute('data-slots-anim-symbol-states', /"A":"(idle|win-react)"/);
    await expect(root).toHaveAttribute('data-slots-anim-seq', '2');
    await expect(root).toHaveAttribute('data-slots-outcome', /win|loss/);
    await expect(page.locator('#slots-gameplay-outcome')).toHaveText(/Outcome: (win|loss) \(\d+\)/);
    await expect(page.locator('#slots-gameplay-seed')).toHaveText('Seed: slots-phase-13-en:1');
    const enSlotsAnalytics = await readPersistedAnalyticsEvents(page);
    await expect
      .poll(() =>
        enSlotsAnalytics.some(
          (event) =>
            event.name === 'slots_spin_attempt' &&
            event.locale === 'en' &&
            event.route === '/en/slots/',
        ),
      )
      .toBe(true);
    await expect
      .poll(() =>
        enSlotsAnalytics.some(
          (event) =>
            event.name === 'slots_spin_resolved' &&
            event.locale === 'en' &&
            event.route === '/en/slots/' &&
            typeof (event.payload as { payout?: unknown })?.payout === 'number',
        ),
      )
      .toBe(true);

    await clearPersistedAnalyticsEvents(page);
    await page.goto('/pt/slots/');
    const ptRoot = page.locator('#slots-shell-root');
    await expect(ptRoot).toHaveAttribute('data-slots-host', 'standalone');
    await expect(page.locator('[data-slots-lesson="house-edge"]')).toBeHidden();
    await expectRuntimeParityEnvelope(ptRoot);
    await expectSlotsShellEnvelope(page);
    await expectSlotsState(ptRoot, /idle|result|insufficient/);
    await expect(ptRoot).toHaveAttribute('data-slots-anim-state', 'idle');
    await expect(ptRoot).toHaveAttribute('data-slots-anim-outcome', 'idle');
    await expect(ptRoot).toHaveAttribute('data-slots-anim-effect', 'idle');
    await expect(ptRoot).toHaveAttribute('data-slots-anim-atmosphere', 'idle');
    await expect(ptRoot).toHaveAttribute('data-slots-anim-symbol-states', /"A":"idle"/);
    await expect(ptRoot).toHaveAttribute('data-slots-anim-seq', '0');
    await expectSlotsStatus(page, 'Estado: Parado');
    await expect(page.locator('#slots-gameplay-outcome')).toHaveText('Resultado: pendente');

    await spinAndWaitForResolution(page, ptRoot, {
      spinning: 'Estado: Girando',
      result: 'Estado: Resultado pronto',
    });
    await expectRuntimeParityEnvelope(ptRoot);
    await expect(ptRoot).toHaveAttribute('data-slots-anim-state', 'stop');
    await expect(ptRoot).toHaveAttribute('data-slots-anim-outcome', /win|loss/);
    await expect(ptRoot).toHaveAttribute('data-slots-anim-effect', /win|loss/);
    await expect(ptRoot).toHaveAttribute('data-slots-anim-atmosphere', /celebrate|shadow/);
    await expect(ptRoot).toHaveAttribute('data-slots-anim-symbol-states', /"A":"(idle|win-react)"/);
    await expect(ptRoot).toHaveAttribute('data-slots-anim-seq', '2');
    await expect(ptRoot).toHaveAttribute('data-slots-outcome', /win|loss/);
    await expect(page.locator('#slots-gameplay-outcome')).toHaveText(
      /Resultado: (win|loss) \(\d+\)/,
    );
    await expect(page.locator('#slots-gameplay-seed')).toHaveText('Seed: slots-phase-13-pt:1');
    const ptSlotsAnalytics = await readPersistedAnalyticsEvents(page);
    await expect
      .poll(() =>
        ptSlotsAnalytics.some(
          (event) =>
            event.name === 'slots_spin_attempt' &&
            event.locale === 'pt' &&
            event.route === '/pt/slots/',
        ),
      )
      .toBe(true);
    await expect
      .poll(() =>
        ptSlotsAnalytics.some(
          (event) =>
            event.name === 'slots_spin_resolved' &&
            event.locale === 'pt' &&
            event.route === '/pt/slots/',
        ),
      )
      .toBe(true);

    expectCleanErrorSurface(errorSurface, 'standalone runtime compatibility');
  });

  test('slots insufficient-credit flow blocks additional PT spin attempts with localized runtime state', async ({
    page,
  }) => {
    await clearPersistedAnalyticsEvents(page);
    await page.goto('/pt/slots/');

    const root = page.locator('#slots-shell-root');
    await setMaximumBet(page);
    await expect(root).toHaveAttribute('data-slots-bet', '10');
    await expect(root).toHaveAttribute('data-slots-anim-seq', '0');

    for (const expectedBalance of ['30', '20', '10', '0']) {
      await spinAndWaitForResolution(page, root, {
        spinning: 'Estado: Girando',
        result: 'Estado: Resultado pronto',
      });

      await expect(root).toHaveAttribute('data-slots-balance', expectedBalance);
      await expect(root).toHaveAttribute('data-slots-outcome', 'loss');
    }

    await expect(root).toHaveAttribute('data-slots-anim-seq', '8');

    const spinButton = page.locator('#slots-spin-button');
    await expect(spinButton).toBeDisabled();

    await spinButton.evaluate((button) => {
      button.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    });

    await expectSlotsState(root, 'insufficient');
    await expect(root).toHaveAttribute('data-slots-anim-state', 'blocked');
    await expect(root).toHaveAttribute('data-slots-anim-atlas', 'ready');
    await expect(root).toHaveAttribute('data-slots-anim-theme', 'slots-core-v1');
    await expect(root).toHaveAttribute('data-slots-anim-reduced-motion', 'false');
    await expect(root).toHaveAttribute('data-slots-anim-intensity-requested', 'full');
    await expect(root).toHaveAttribute('data-slots-anim-intensity', /full|reduced|minimal/);
    await expect(root).toHaveAttribute('data-slots-anim-performance', /ok|degraded/);
    await expect(root).toHaveAttribute('data-slots-anim-symbol-states', /"A":"idle"/);
    await expect(root).toHaveAttribute('data-slots-anim-idle', 'idle-pulse');
    await expect(root).toHaveAttribute('data-slots-anim-blocked-reason', 'insufficient');
    await expect(root).toHaveAttribute('data-slots-anim-effect', 'blocked');
    await expect(root).toHaveAttribute('data-slots-anim-atmosphere', 'caution');
    await expect(root).toHaveAttribute('data-slots-anim-seq', '9');
    await expectSlotsStatus(page, 'Estado: Saldo insuficiente');
    await expect(root).toHaveAttribute('data-slots-balance', '0');
    await expect(root).toHaveAttribute('data-slots-bet', '10');

    const blockedAnalytics = await readPersistedAnalyticsEvents(page);
    await expect
      .poll(() =>
        blockedAnalytics.some(
          (event) =>
            event.name === 'slots_spin_blocked' &&
            event.locale === 'pt' &&
            event.route === '/pt/slots/' &&
            (
              event.payload as {
                blocked_reason?: string;
                spin_index?: number;
                balance?: number;
                bet?: number;
              }
            )?.blocked_reason === 'insufficient' &&
            (
              event.payload as {
                blocked_reason?: string;
                spin_index?: number;
                balance?: number;
                bet?: number;
              }
            )?.spin_index === 5 &&
            (
              event.payload as {
                blocked_reason?: string;
                spin_index?: number;
                balance?: number;
                bet?: number;
              }
            )?.balance === 0 &&
            (
              event.payload as {
                blocked_reason?: string;
                spin_index?: number;
                balance?: number;
                bet?: number;
              }
            )?.bet === 10,
        ),
      )
      .toBe(true);
  });

  test('theme query projects neon atmosphere without route drift or authority changes', async ({
    page,
  }) => {
    await page.goto('/en/slots/?slotsTheme=slots-neon-v1');

    const root = page.locator('#slots-shell-root');
    await expect(root).toHaveAttribute('data-slots-theme', 'slots-core-v1');
    await expect(root).toHaveAttribute('data-slots-anim-theme', 'slots-neon-v1');
    await expect(root).toHaveAttribute('data-slots-anim-atmosphere-theme', 'neon');
    await expect(root).toHaveAttribute('data-slots-anim-atmosphere', 'idle');
    await expectSlotsShellEnvelope(page);
    await expect(page).toHaveURL(/\/en\/slots\/\?slotsTheme=slots-neon-v1$/);
  });

  test('minimal motion plus neon theme keeps canonical runtime confidence on slots', async ({
    page,
  }) => {
    await page.goto('/en/slots/?slotsTheme=slots-neon-v1&slotsMotion=minimal');

    const root = page.locator('#slots-shell-root');
    await expect(root).toHaveAttribute('data-slots-theme', 'slots-core-v1');
    await expect(root).toHaveAttribute('data-slots-anim-theme', 'slots-neon-v1');
    await expect(root).toHaveAttribute('data-slots-anim-atmosphere-theme', 'neon');
    await expect(root).toHaveAttribute('data-slots-anim-intensity-requested', 'minimal');
    await expect(root).toHaveAttribute('data-slots-anim-intensity', 'minimal');
    await expect(root).toHaveAttribute('data-slots-anim-idle', 'idle-static');
    await expect(root).toHaveAttribute('data-slots-anim-effect', 'idle');
    await expect(root).toHaveAttribute('data-slots-anim-atmosphere', 'idle');
    await expectSlotsShellEnvelope(page);

    await spinAndWaitForResolution(page, root, {
      spinning: 'State: Spinning',
      result: 'State: Result ready',
    });

    await expect(root).toHaveAttribute('data-slots-anim-intensity', 'minimal');
    await expect(root).toHaveAttribute('data-slots-anim-theme', 'slots-neon-v1');
    await expect(root).toHaveAttribute('data-slots-anim-atmosphere-theme', 'neon');
    await expect(root).toHaveAttribute('data-slots-anim-effect', /win|loss/);
    await expect(root).toHaveAttribute('data-slots-anim-atmosphere', /celebrate|shadow/);
    await expect(page).toHaveURL(/\/en\/slots\/\?slotsTheme=slots-neon-v1&slotsMotion=minimal$/);
  });
});
