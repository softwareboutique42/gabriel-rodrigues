import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const selectorPath = resolve(process.cwd(), 'src/scripts/canvas/style-selector.ts');
const versionsPath = resolve(process.cwd(), 'src/scripts/canvas/versions.ts');
const source = readFileSync(selectorPath, 'utf8');
const versionsSource = readFileSync(versionsPath, 'utf8');

test('selector exposes deterministic preset resolution API', () => {
  assert.match(source, /export function selectAnimationPreset\(/);
  assert.match(source, /const VERTICAL_PRESET_ROUTING/);
});

test('new categories route deterministically to vertical presets', () => {
  assert.match(source, /education:\s*'education-story'/);
  assert.match(source, /hospitality:\s*'hospitality-orbit'/);
  assert.match(source, /retail:\s*'commerce-signal'/);
});

test('preset routing uses deterministic null fallback when no route exists', () => {
  assert.match(
    source,
    /return VERTICAL_PRESET_ROUTING\[version\]\?\.\[industryCategory\] \?\? null;/,
  );
});

test('version metadata publishes selector-ready vertical presets', () => {
  assert.match(versionsSource, /verticalPresets:/);
  assert.match(versionsSource, /id:\s*'education-story'/);
  assert.match(versionsSource, /id:\s*'hospitality-orbit'/);
  assert.match(versionsSource, /id:\s*'commerce-signal'/);
});
