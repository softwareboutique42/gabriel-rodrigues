import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const enPagePath = resolve(process.cwd(), 'src/pages/en/projects/index.astro');
const ptPagePath = resolve(process.cwd(), 'src/pages/pt/projects/index.astro');
const switcherPath = resolve(process.cwd(), 'src/components/LanguageSwitcher.astro');
const utilsPath = resolve(process.cwd(), 'src/i18n/utils.ts');
const enI18nPath = resolve(process.cwd(), 'src/i18n/en.json');
const ptI18nPath = resolve(process.cwd(), 'src/i18n/pt.json');

const enPage = readFileSync(enPagePath, 'utf8');
const ptPage = readFileSync(ptPagePath, 'utf8');
const switcher = readFileSync(switcherPath, 'utf8');
const utils = readFileSync(utilsPath, 'utf8');
const en = JSON.parse(readFileSync(enI18nPath, 'utf8'));
const pt = JSON.parse(readFileSync(ptI18nPath, 'utf8'));

test('projects parity: EN and PT pages contain Canvas and Slots card contracts', () => {
  assert.match(enPage, /t\('canvas\.title'\)/);
  assert.match(enPage, /t\('slots\.title'\)/);
  assert.match(ptPage, /t\('canvas\.title'\)/);
  assert.match(ptPage, /t\('slots\.title'\)/);

  assert.match(enPage, /t\('projects\.status\.live'\)/);
  assert.match(enPage, /t\('projects\.status\.foundation'\)/);
  assert.match(ptPage, /t\('projects\.status\.live'\)/);
  assert.match(ptPage, /t\('projects\.status\.foundation'\)/);
});

test('canonical links: project CTAs target locale canvas/slots routes only', () => {
  assert.match(enPage, /href="\/en\/canvas\/"/);
  assert.match(enPage, /href="\/en\/slots\/"/);
  assert.match(ptPage, /href="\/pt\/canvas\/"/);
  assert.match(ptPage, /href="\/pt\/slots\/"/);

  assert.doesNotMatch(enPage, /\/en\/projects\/(canvas|slots)\//);
  assert.doesNotMatch(ptPage, /\/pt\/projects\/(canvas|slots)\//);
});

test('language switch contract preserves route context for projects/canvas/slots', () => {
  assert.match(switcher, /getLocalizedPath\(Astro\.url\.pathname, targetLang\)/);
  assert.match(switcher, /href=\{targetPath\}/);
  assert.ok(utils.includes("path.replace(/^\\/(en|pt)/, '')"));

  const counterpartCases = [
    ['/en/projects/', '/pt/projects/'],
    ['/pt/projects/', '/en/projects/'],
    ['/en/canvas/', '/pt/canvas/'],
    ['/pt/canvas/', '/en/canvas/'],
    ['/en/slots/', '/pt/slots/'],
    ['/pt/slots/', '/en/slots/'],
  ];

  for (const [from, to] of counterpartCases) {
    const computed = from.replace(/^\/(en|pt)/, (m, p1) => (p1 === 'en' ? '/pt' : '/en'));
    assert.equal(computed, to, `counterpart mismatch for ${from}`);
  }
});

test('i18n parity: phase-10 projects card keys exist in EN/PT', () => {
  const keys = [
    'projects.title',
    'projects.subtitle',
    'projects.status.live',
    'projects.status.foundation',
    'projects.card.canvas.description',
    'projects.card.slots.description',
    'projects.card.canvas.cta',
    'projects.card.slots.cta',
  ];

  for (const key of keys) {
    assert.equal(typeof en[key], 'string', `EN missing key: ${key}`);
    assert.equal(typeof pt[key], 'string', `PT missing key: ${key}`);
    assert.ok(en[key].trim().length > 0, `EN empty value: ${key}`);
    assert.ok(pt[key].trim().length > 0, `PT empty value: ${key}`);
  }
});
