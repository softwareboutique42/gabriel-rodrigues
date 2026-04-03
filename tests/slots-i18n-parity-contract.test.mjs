import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const enPath = resolve(process.cwd(), 'src/i18n/en.json');
const ptPath = resolve(process.cwd(), 'src/i18n/pt.json');
const enPagePath = resolve(process.cwd(), 'src/pages/en/slots/index.astro');
const ptPagePath = resolve(process.cwd(), 'src/pages/pt/slots/index.astro');

const en = JSON.parse(readFileSync(enPath, 'utf8'));
const pt = JSON.parse(readFileSync(ptPath, 'utf8'));
const enPage = readFileSync(enPagePath, 'utf8');
const ptPage = readFileSync(ptPagePath, 'utf8');

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
  'slots.shell.eyebrow',
  'slots.shell.zone.playfield',
  'slots.shell.zone.console',
  'slots.shell.zone.compliance',
  'slots.shell.zone.navigation',
  'slots.shell.label.routes',
  'slots.shell.label.motion',
  'slots.shell.label.theme',
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
