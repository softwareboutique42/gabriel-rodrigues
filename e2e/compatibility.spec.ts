import { test, expect } from '@playwright/test';

function pathRegex(path: string): RegExp {
  const escaped = path.replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace(/\/$/, '');
  return new RegExp(`${escaped}/?$`);
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
});
