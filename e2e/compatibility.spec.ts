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
  await expect(root).toHaveAttribute('data-slots-anim-reduced-motion', 'false');
  await expect(root).toHaveAttribute('data-slots-anim-intensity-requested', 'full');
  await expect(root).toHaveAttribute('data-slots-anim-intensity', /full|reduced|minimal/);
  await expect(root).toHaveAttribute('data-slots-anim-performance', /ok|degraded/);
  await expect(root).toHaveAttribute('data-slots-anim-idle', 'idle-pulse');
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

test.describe('Compatibility hardening', () => {
  test('projects discovery journey resolves to canonical canvas and slots routes in EN/PT', async ({
    page,
  }) => {
    await page.goto('/en/projects/');
    await page.getByRole('link', { name: 'Explore Canvas', exact: true }).click();
    await expect(page).toHaveURL(pathRegex('/en/canvas/'));

    await page.goto('/en/projects/');
    await page.getByRole('link', { name: 'See Slots', exact: true }).click();
    await expect(page).toHaveURL(pathRegex('/en/slots/'));

    await page.goto('/pt/projects/');
    await page.getByRole('link', { name: 'Explorar Canvas', exact: true }).click();
    await expect(page).toHaveURL(pathRegex('/pt/canvas/'));

    await page.goto('/pt/projects/');
    await page.getByRole('link', { name: 'Ver Slots', exact: true }).click();
    await expect(page).toHaveURL(pathRegex('/pt/slots/'));
  });

  test('language switch resolves exact EN/PT counterpart routes for projects, canvas, and slots', async ({
    page,
  }) => {
    const matrix: Array<[string, string, string]> = [
      ['/en/projects/', 'PT', '/pt/projects/'],
      ['/pt/projects/', 'EN', '/en/projects/'],
      ['/en/canvas/', 'PT', '/pt/canvas/'],
      ['/pt/canvas/', 'EN', '/en/canvas/'],
      ['/en/slots/', 'PT', '/pt/slots/'],
      ['/pt/slots/', 'EN', '/en/slots/'],
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
    await page.getByRole('link', { name: 'Ver Slots', exact: true }).click();
    await expect(page).not.toHaveURL(/\/projects\/(canvas|slots)\//);
  });

  test('slots runtime compatibility keeps machine-readable gameplay state in EN/PT', async ({
    page,
  }) => {
    await page.goto('/en/slots/');

    const root = page.locator('#slots-shell-root');
    await expectRuntimeParityEnvelope(root);
    await expectSlotsState(root, /idle|result|insufficient/);
    await expect(root).toHaveAttribute('data-slots-anim-state', 'idle');
    await expect(root).toHaveAttribute('data-slots-anim-outcome', 'idle');
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
    await expect(root).toHaveAttribute('data-slots-anim-symbol-states', /"A":"(idle|win-react)"/);
    await expect(root).toHaveAttribute('data-slots-anim-seq', '2');
    await expect(root).toHaveAttribute('data-slots-outcome', /win|loss/);
    await expect(page.locator('#slots-gameplay-outcome')).toHaveText(/Outcome: (win|loss) \(\d+\)/);
    await expect(page.locator('#slots-gameplay-seed')).toHaveText('Seed: slots-phase-13-en:1');

    await page.goto('/pt/slots/');
    const ptRoot = page.locator('#slots-shell-root');
    await expectRuntimeParityEnvelope(ptRoot);
    await expectSlotsState(ptRoot, /idle|result|insufficient/);
    await expect(ptRoot).toHaveAttribute('data-slots-anim-state', 'idle');
    await expect(ptRoot).toHaveAttribute('data-slots-anim-outcome', 'idle');
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
    await expect(ptRoot).toHaveAttribute('data-slots-anim-symbol-states', /"A":"(idle|win-react)"/);
    await expect(ptRoot).toHaveAttribute('data-slots-anim-seq', '2');
    await expect(ptRoot).toHaveAttribute('data-slots-outcome', /win|loss/);
    await expect(page.locator('#slots-gameplay-outcome')).toHaveText(
      /Resultado: (win|loss) \(\d+\)/,
    );
    await expect(page.locator('#slots-gameplay-seed')).toHaveText('Seed: slots-phase-13-pt:1');
  });

  test('slots insufficient-credit flow blocks additional PT spin attempts with localized runtime state', async ({
    page,
  }) => {
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
    await expect(root).toHaveAttribute('data-slots-anim-seq', '9');
    await expectSlotsStatus(page, 'Estado: Saldo insuficiente');
    await expect(root).toHaveAttribute('data-slots-balance', '0');
    await expect(root).toHaveAttribute('data-slots-bet', '10');
  });
});
