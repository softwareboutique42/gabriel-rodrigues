import { chromium } from 'playwright';
import { writeFileSync } from 'node:fs';

const baseUrl = process.env.SLOTS_BASE_URL ?? 'http://127.0.0.1:4330';

const cases = [
  {
    name: 'en-slots-direct',
    url: `${baseUrl}/en/slots/`,
  },
  {
    name: 'en-casinocraftz-direct-embed',
    url: `${baseUrl}/en/casinocraftz/`,
    frameSelector: '[data-casinocraftz-slots-embed]',
  },
  {
    name: 'en-projects-spa-to-casinocraftz-embed',
    url: `${baseUrl}/en/projects/`,
    navigateViaLink: true,
    frameSelector: '[data-casinocraftz-slots-embed]',
  },
];

const results = [];
const browser = await chromium.launch({ headless: true });

try {
  for (const testCase of cases) {
    const page = await browser.newPage();
    const consoleMessages = [];
    const pageErrors = [];

    page.on('console', (message) => {
      consoleMessages.push(`${message.type()}: ${message.text()}`);
    });

    page.on('pageerror', (error) => {
      pageErrors.push(String(error));
    });

    await page.goto(testCase.url, { waitUntil: 'networkidle' });

    if (testCase.navigateViaLink) {
      await page.getByRole('link', { name: 'Open Casinocraftz', exact: true }).click();
      await page.waitForURL('**/en/casinocraftz/');
      await page.waitForLoadState('networkidle');
    }

    let targetPage = page;
    if (testCase.frameSelector) {
      const frameHandle = await page.waitForSelector(testCase.frameSelector);
      const frame = await frameHandle.contentFrame();
      if (!frame) {
        throw new Error(`Frame not available for ${testCase.name}`);
      }
      targetPage = frame;
    }

    const root = targetPage.locator('#slots-shell-root');
    const spinButton = targetPage.locator('#slots-spin-button');
    const houseEdge = targetPage.locator('[data-slots-lesson="house-edge"]');

    await spinButton.click();
    await page.waitForTimeout(700);

    results.push({
      case: testCase.name,
      pageUrl: page.url(),
      slotsHost: await root.getAttribute('data-slots-host'),
      slotsState: await root.getAttribute('data-slots-state'),
      slotsAnimState: await root.getAttribute('data-slots-anim-state'),
      houseEdgeVisible: await houseEdge.isVisible().catch(() => false),
      spinDisabledAfterClick: await spinButton.isDisabled(),
      outcomeText: await targetPage.locator('#slots-gameplay-outcome').textContent(),
      seedText: await targetPage.locator('#slots-gameplay-seed').textContent(),
      pageErrors,
      consoleMessages,
    });

    await page.close();
  }
} finally {
  await browser.close();
}

writeFileSync('.planning/debug/slots-console-probe.json', `${JSON.stringify(results, null, 2)}\n`);
