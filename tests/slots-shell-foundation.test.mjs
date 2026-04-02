import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const enPagePath = resolve(process.cwd(), 'src/pages/en/slots/index.astro');
const ptPagePath = resolve(process.cwd(), 'src/pages/pt/slots/index.astro');
const scriptPath = resolve(process.cwd(), 'src/scripts/slots/main.ts');
const enI18nPath = resolve(process.cwd(), 'src/i18n/en.json');
const ptI18nPath = resolve(process.cwd(), 'src/i18n/pt.json');

const enPage = readFileSync(enPagePath, 'utf8');
const ptPage = readFileSync(ptPagePath, 'utf8');
const scriptSource = readFileSync(scriptPath, 'utf8');
const en = JSON.parse(readFileSync(enI18nPath, 'utf8'));
const pt = JSON.parse(readFileSync(ptI18nPath, 'utf8'));

test('SLOT-01: slots shell pages exist with mirrored in-development structure', () => {
  assert.match(enPage, /id="slots-shell-root"/);
  assert.match(ptPage, /id="slots-shell-root"/);

  assert.match(enPage, /t\('slots\.title'\)/);
  assert.match(ptPage, /t\('slots\.title'\)/);
  assert.match(enPage, /t\('slots\.status\.inDevelopment'\)/);
  assert.match(ptPage, /t\('slots\.status\.inDevelopment'\)/);

  assert.match(enPage, /href="\/en\/projects\/"/);
  assert.match(ptPage, /href="\/pt\/projects\/"/);
  assert.match(enPage, /href="\/en\/canvas\/"/);
  assert.match(ptPage, /href="\/pt\/canvas\/"/);
});

test('SLOT-02: visible non-gambling and no-real-money disclaimer parity', () => {
  assert.match(enPage, /t\('slots\.disclaimer\.noGambling'\)/);
  assert.match(enPage, /t\('slots\.disclaimer\.noRealMoney'\)/);
  assert.match(ptPage, /t\('slots\.disclaimer\.noGambling'\)/);
  assert.match(ptPage, /t\('slots\.disclaimer\.noRealMoney'\)/);

  const keys = [
    'slots.description',
    'slots.badge.foundation',
    'slots.disclaimer.heading',
    'slots.disclaimer.noGambling',
    'slots.disclaimer.noRealMoney',
    'slots.cta.projects',
    'slots.cta.canvas',
  ];

  for (const key of keys) {
    assert.equal(typeof en[key], 'string', `EN missing key: ${key}`);
    assert.equal(typeof pt[key], 'string', `PT missing key: ${key}`);
    assert.ok(en[key].trim().length > 0, `EN empty value: ${key}`);
    assert.ok(pt[key].trim().length > 0, `PT empty value: ${key}`);
  }

  assert.match(en['slots.disclaimer.noGambling'], /not gambling/i);
  assert.match(en['slots.disclaimer.noRealMoney'], /no real-money|no real money/i);
  assert.match(pt['slots.disclaimer.noGambling'], /nao e jogo de azar/i);
  assert.match(pt['slots.disclaimer.noRealMoney'], /nao ha apostas|dinheiro real/i);
});

test('SLOT-03: SPA-safe lifecycle wiring uses page-load, root guard, and AbortController cleanup', () => {
  assert.match(enPage, /document\.addEventListener\('astro:page-load'/);
  assert.match(ptPage, /document\.addEventListener\('astro:page-load'/);
  assert.match(enPage, /document\.getElementById\('slots-shell-root'\)/);
  assert.match(ptPage, /document\.getElementById\('slots-shell-root'\)/);
  assert.match(enPage, /initSlotsShell\(\)/);
  assert.match(ptPage, /initSlotsShell\(\)/);

  assert.match(scriptSource, /let controller: AbortController \| null = null/);
  assert.match(scriptSource, /if \(controller\) controller\.abort\(\)/);
  assert.match(scriptSource, /new AbortController\(\)/);
  assert.match(scriptSource, /document\.addEventListener\(\s*'astro:before-swap'/);
  assert.match(scriptSource, /controller\?\.abort\(\)/);
});

test('canonical and safety locks: no monetization or alias route drift', () => {
  assert.doesNotMatch(enPage, /\/en\/projects\/slots\//);
  assert.doesNotMatch(ptPage, /\/pt\/projects\/slots\//);

  const forbiddenPatterns = [
    /\bwager\b/i,
    /\bjackpot\b/i,
    /\bstripe\b/i,
    /checkout/i,
  ];

  for (const pattern of forbiddenPatterns) {
    assert.doesNotMatch(enPage, pattern, `EN page contains forbidden token: ${pattern}`);
    assert.doesNotMatch(ptPage, pattern, `PT page contains forbidden token: ${pattern}`);
    assert.doesNotMatch(scriptSource, pattern, `Script contains forbidden token: ${pattern}`);
  }
});
