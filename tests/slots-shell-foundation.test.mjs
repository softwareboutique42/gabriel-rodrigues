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

test('SLOT-01: slots shell pages expose the mirrored Elementum navigation and playfield structure', () => {
  assert.match(enPage, /id="slots-shell-root"/);
  assert.match(ptPage, /id="slots-shell-root"/);
  assert.match(enPage, /data-slots-shell="cabinet"/);
  assert.match(ptPage, /data-slots-shell="cabinet"/);
  assert.match(enPage, /data-slots-zone="navigation"/);
  assert.match(ptPage, /data-slots-zone="navigation"/);
  assert.match(enPage, /data-slots-zone="playfield"/);
  assert.match(ptPage, /data-slots-zone="playfield"/);
  assert.match(enPage, /data-slots-reel-frame/);
  assert.match(ptPage, /data-slots-reel-frame/);
  assert.match(enPage, /slots-shell__identity-label">ELEMENTUM/);
  assert.match(ptPage, /slots-shell__identity-label">ELEMENTUM/);
  assert.match(enPage, /slots-shell__back-link/);
  assert.match(ptPage, /slots-shell__back-link/);

  assert.match(enPage, /t\('slots\.gameplay\.label\.balance'\)/);
  assert.match(ptPage, /t\('slots\.gameplay\.label\.balance'\)/);
  assert.match(enPage, /t\('slots\.gameplay\.label\.bet'\)/);
  assert.match(ptPage, /t\('slots\.gameplay\.label\.bet'\)/);
  assert.match(enPage, /t\('slots\.gameplay\.cta\.spin'\)/);
  assert.match(ptPage, /t\('slots\.gameplay\.cta\.spin'\)/);
  assert.match(enPage, /t\('slots\.shell\.label\.routes'\)/);
  assert.match(ptPage, /t\('slots\.shell\.label\.routes'\)/);
  assert.match(enPage, /t\('slots\.shell\.label\.motion'\)/);
  assert.match(ptPage, /t\('slots\.shell\.label\.motion'\)/);
  assert.match(enPage, /t\('slots\.shell\.label\.theme'\)/);
  assert.match(ptPage, /t\('slots\.shell\.label\.theme'\)/);
});

test('SLOT-02: host-aware education surfaces remain mirrored in EN/PT', () => {
  assert.match(enPage, /data-slots-lesson="house-edge"/);
  assert.match(ptPage, /data-slots-lesson="house-edge"/);
  assert.match(enPage, /t\('slots\.education\.houseEdgeLabel'\)/);
  assert.match(ptPage, /t\('slots\.education\.houseEdgeLabel'\)/);
  assert.match(enPage, /t\('slots\.education\.houseEdgeCopy'\)/);
  assert.match(ptPage, /t\('slots\.education\.houseEdgeCopy'\)/);
  assert.match(enPage, /t\('slots\.education\.manipulationCue'\)/);
  assert.match(ptPage, /t\('slots\.education\.manipulationCue'\)/);

  const keys = [
    'slots.gameplay.label.balance',
    'slots.gameplay.label.bet',
    'slots.gameplay.cta.spin',
    'slots.shell.label.routes',
    'slots.shell.label.motion',
    'slots.shell.label.theme',
    'slots.education.houseEdgeLabel',
    'slots.education.houseEdgeCopy',
    'slots.education.manipulationCue',
  ];

  for (const key of keys) {
    assert.equal(typeof en[key], 'string', `EN missing key: ${key}`);
    assert.equal(typeof pt[key], 'string', `PT missing key: ${key}`);
    assert.ok(en[key].trim().length > 0, `EN empty value: ${key}`);
    assert.ok(pt[key].trim().length > 0, `PT empty value: ${key}`);
  }
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
  assert.match(enPage, /id="slots-balance-value"/);
  assert.match(ptPage, /id="slots-balance-value"/);
  assert.match(enPage, /id="slots-bet-value"/);
  assert.match(ptPage, /id="slots-bet-value"/);
  assert.match(enPage, /id="slots-spin-button"/);
  assert.match(ptPage, /id="slots-spin-button"/);
  assert.match(enPage, /id="slots-gameplay-status"/);
  assert.match(ptPage, /id="slots-gameplay-status"/);
  assert.match(enPage, /id="slots-gameplay-outcome"/);
  assert.match(ptPage, /id="slots-gameplay-outcome"/);
  assert.match(enPage, /id="slots-round-result"/);
  assert.match(ptPage, /id="slots-round-result"/);

  const forbiddenPatterns = [/\bwager\b/i, /\bjackpot\b/i, /\bstripe\b/i, /checkout/i];

  for (const pattern of forbiddenPatterns) {
    assert.doesNotMatch(enPage, pattern, `EN page contains forbidden token: ${pattern}`);
    assert.doesNotMatch(ptPage, pattern, `PT page contains forbidden token: ${pattern}`);
    assert.doesNotMatch(scriptSource, pattern, `Script contains forbidden token: ${pattern}`);
  }
});
