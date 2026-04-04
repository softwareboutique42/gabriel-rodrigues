import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const enPath = resolve(process.cwd(), 'src/i18n/en.json');
const ptPath = resolve(process.cwd(), 'src/i18n/pt.json');
const enPagePath = resolve(process.cwd(), 'src/pages/en/slots/index.astro');
const ptPagePath = resolve(process.cwd(), 'src/pages/pt/slots/index.astro');
const enCasinocraftzPath = resolve(process.cwd(), 'src/pages/en/casinocraftz/index.astro');
const ptCasinocraftzPath = resolve(process.cwd(), 'src/pages/pt/casinocraftz/index.astro');
const slotsMainPath = resolve(process.cwd(), 'src/scripts/slots/main.ts');

const en = JSON.parse(readFileSync(enPath, 'utf8'));
const pt = JSON.parse(readFileSync(ptPath, 'utf8'));
const enPage = readFileSync(enPagePath, 'utf8');
const ptPage = readFileSync(ptPagePath, 'utf8');
const enCasinocraftz = readFileSync(enCasinocraftzPath, 'utf8');
const ptCasinocraftz = readFileSync(ptCasinocraftzPath, 'utf8');
const slotsMain = readFileSync(slotsMainPath, 'utf8');

const PHASE14_KEYS = [
  'slots.gameplay.panel.title',
  'slots.gameplay.cta.spin',
  'slots.gameplay.label.state',
  'slots.gameplay.label.outcome',
  'slots.gameplay.label.seed',
  'slots.gameplay.label.balance',
  'slots.gameplay.label.bet',
  'slots.gameplay.status.idle',
  'slots.gameplay.status.spinning',
  'slots.gameplay.status.result',
  'slots.gameplay.status.insufficient',
  'slots.gameplay.status.blockedSpinning',
  'slots.gameplay.status.pending',
  'slots.gameplay.debug.summary',
  'slots.shell.eyebrow',
  'slots.shell.zone.playfield',
  'slots.shell.zone.console',
  'slots.shell.zone.compliance',
  'slots.shell.zone.navigation',
  'slots.shell.label.routes',
  'slots.shell.label.motion',
  'slots.shell.label.theme',
  'slots.education.houseEdgeLabel',
  'slots.education.houseEdgeCopy',
  'slots.education.manipulationCue',
];

test('I18N-10: all phase-14 gameplay keys exist and are non-empty in EN/PT', () => {
  for (const key of PHASE14_KEYS) {
    assert.equal(typeof en[key], 'string', `EN missing key: ${key}`);
    assert.equal(typeof pt[key], 'string', `PT missing key: ${key}`);
    assert.ok(en[key].trim().length > 0, `EN empty value: ${key}`);
    assert.ok(pt[key].trim().length > 0, `PT empty value: ${key}`);
  }
});

test('I18N-10: slots pages consume gameplay translation keys instead of hardcoded labels', () => {
  assert.match(enPage, /t\('slots\.gameplay\.label\.balance'\)/);
  assert.match(ptPage, /t\('slots\.gameplay\.label\.balance'\)/);
  assert.match(enPage, /t\('slots\.gameplay\.label\.bet'\)/);
  assert.match(ptPage, /t\('slots\.gameplay\.label\.bet'\)/);
  assert.match(enPage, /t\('slots\.gameplay\.cta\.spin'\)/);
  assert.match(ptPage, /t\('slots\.gameplay\.cta\.spin'\)/);
  assert.match(enPage, /data-slots-msg-insufficient=\{t\('slots\.gameplay\.status\.insufficient'\)\}/);
  assert.match(ptPage, /data-slots-msg-insufficient=\{t\('slots\.gameplay\.status\.insufficient'\)\}/);
  assert.match(enPage, /data-slots-label-balance=\{t\('slots\.gameplay\.label\.balance'\)\}/);
  assert.match(ptPage, /data-slots-label-balance=\{t\('slots\.gameplay\.label\.balance'\)\}/);
  assert.match(enPage, /data-slots-label-bet=\{t\('slots\.gameplay\.label\.bet'\)\}/);
  assert.match(ptPage, /data-slots-label-bet=\{t\('slots\.gameplay\.label\.bet'\)\}/);
  assert.match(enPage, /t\('slots\.shell\.eyebrow'\)/);
  assert.match(ptPage, /t\('slots\.shell\.eyebrow'\)/);
  assert.match(enPage, /t\('slots\.shell\.zone\.playfield'\)/);
  assert.match(ptPage, /t\('slots\.shell\.zone\.playfield'\)/);
  assert.match(enPage, /t\('slots\.shell\.label\.routes'\)/);
  assert.match(ptPage, /t\('slots\.shell\.label\.routes'\)/);
  assert.match(enPage, /t\('slots\.gameplay\.debug\.summary'\)/);
  assert.match(ptPage, /t\('slots\.gameplay\.debug\.summary'\)/);
});

test('I18N-11: EN/PT slots routes keep canonical runtime parity hooks and deterministic seeds', () => {
  assert.match(enPage, /data-slots-seed="slots-phase-13-en"/);
  assert.match(ptPage, /data-slots-seed="slots-phase-13-pt"/);
  assert.match(enPage, /data-slots-theme="slots-core-v1"/);
  assert.match(ptPage, /data-slots-theme="slots-core-v1"/);
  assert.match(enPage, /data-slots-motion="full"/);
  assert.match(ptPage, /data-slots-motion="full"/);
  assert.match(enPage, /id="slots-shell-root"/);
  assert.match(ptPage, /id="slots-shell-root"/);
  assert.match(enPage, /data-slots-shell="cabinet"/);
  assert.match(ptPage, /data-slots-shell="cabinet"/);
  assert.match(enPage, /data-slots-zone="navigation"/);
  assert.match(ptPage, /data-slots-zone="navigation"/);
});

test('I18N-12: EN/PT casinocraftz links to standalone slots routes with canonical parity', () => {
  assert.match(enCasinocraftz, /data-casinocraftz-slots-link/);
  assert.match(ptCasinocraftz, /data-casinocraftz-slots-link/);
  assert.match(enCasinocraftz, /href="\/en\/slots\/"/);
  assert.match(ptCasinocraftz, /href="\/pt\/slots\/"/);
  assert.doesNotMatch(enCasinocraftz, /data-casinocraftz-slots-embed/);
  assert.doesNotMatch(ptCasinocraftz, /data-casinocraftz-slots-embed/);
  assert.match(enPage, /data-slots-host="standalone"/);
  assert.match(ptPage, /data-slots-host="standalone"/);
  assert.match(enPage, /data-slots-lesson="house-edge"/);
  assert.match(ptPage, /data-slots-lesson="house-edge"/);
  assert.match(slotsMain, /new URLSearchParams\(window\.location\.search\)\.get\('host'\)/);
  assert.match(slotsMain, /houseEdgeLesson\.classList\.toggle\('hidden', !isEmbeddedHost\)/);
});

test('VIS-62 parity: slots routes reference shared symbol atlas assets in EN/PT', () => {
  const css = readFileSync(resolve(process.cwd(), 'src/styles/global.css'), 'utf8');

  for (const path of [
    '/images/slots/symbols/bar.svg',
    '/images/slots/symbols/seven.svg',
    '/images/slots/symbols/crown.svg',
    '/images/slots/symbols/diamond.svg',
    '/images/slots/symbols/star.svg',
  ]) {
    assert.match(css, new RegExp(path.replace(/[.*+?^${}()|[\\]\\]/g, '\\\\$&')));
  }

  assert.match(enPage, /data-slots-reel-window/);
  assert.match(ptPage, /data-slots-reel-window/);
});

test('BRG-50: tutorial/main.ts bridge handler has no locale-specific branches', () => {
  const tutorialMain = readFileSync(
    resolve(process.cwd(), 'src/scripts/casinocraftz/tutorial/main.ts'),
    'utf8',
  );
  // The parseSpinSettledBridgeEvent function must not branch on locale/lang
  assert.doesNotMatch(
    tutorialMain,
    /if\s*\(\s*lang\s*===\s*['"]en['"]/,
    'bridge handler must not branch on lang === en',
  );
  assert.doesNotMatch(
    tutorialMain,
    /if\s*\(\s*lang\s*===\s*['"]pt['"]/,
    'bridge handler must not branch on lang === pt',
  );
});

test('BRG-50: slots/main.ts bridge emit is not wrapped in locale conditions', () => {
  assert.doesNotMatch(
    slotsMain,
    /if\s*\(\s*lang\s*===\s*['"]en['"]/,
    'slots bridge emit must not have locale condition',
  );
  assert.doesNotMatch(
    slotsMain,
    /if\s*\(\s*lang\s*===\s*['"]pt['"]/,
    'slots bridge emit must not have locale condition',
  );
  assert.doesNotMatch(
    slotsMain,
    /if\s*\(\s*locale\s*===\s*['"]en['"]/,
    'slots bridge emit must not have locale condition',
  );
});

test('LEARN-51: tutorial.cta.revisitLesson and tutorial.cta.whyTransition keys exist in EN/PT', () => {
  assert.equal(typeof en['tutorial.cta.revisitLesson'], 'string');
  assert.equal(typeof pt['tutorial.cta.revisitLesson'], 'string');
  assert.equal(typeof en['tutorial.cta.whyTransition'], 'string');
  assert.equal(typeof pt['tutorial.cta.whyTransition'], 'string');
});

test('PROG-50: cards.status.locked and cards.status.unlocked keys exist in EN/PT', () => {
  assert.equal(typeof en['cards.status.locked'], 'string');
  assert.equal(typeof pt['cards.status.locked'], 'string');
  assert.equal(typeof en['cards.status.unlocked'], 'string');
  assert.equal(typeof pt['cards.status.unlocked'], 'string');
});

test('LEARN-50: tutorial.causality.probabilityReveal key exists in EN/PT', () => {
  assert.equal(typeof en['tutorial.causality.probabilityReveal'], 'string');
  assert.equal(typeof pt['tutorial.causality.probabilityReveal'], 'string');
  assert.ok(en['tutorial.causality.probabilityReveal'].length > 0);
  assert.ok(pt['tutorial.causality.probabilityReveal'].length > 0);
});

test('LEARN-51: tutorial/main.ts renderDialogue has no locale-conditional branches', () => {
  const tutorialMain = readFileSync(
    resolve(process.cwd(), 'src/scripts/casinocraftz/tutorial/main.ts'),
    'utf8',
  );
  // renderDialogue must use lang parameter without hardcoded EN/PT branches
  assert.doesNotMatch(
    tutorialMain,
    /function renderDialogue[\s\S]*?if\s*\(\s*lang\s*===\s*['"]en['"]/,
    'renderDialogue must not have if (lang === "en") branches',
  );
});

test('PROG-50: tutorial/main.ts renderCards has no locale-conditional branches', () => {
  const tutorialMain = readFileSync(
    resolve(process.cwd(), 'src/scripts/casinocraftz/tutorial/main.ts'),
    'utf8',
  );
  // renderCards must not have locale-specific logic
  assert.doesNotMatch(
    tutorialMain,
    /function renderCards[\s\S]*?if\s*\(\s*lang\s*===\s*['"]en['"]/,
    'renderCards must not have if (lang === "en") branches',
  );
});
