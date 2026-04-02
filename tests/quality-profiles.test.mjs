import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const qualityProfilesPath = resolve(process.cwd(), 'src/scripts/canvas/quality-profiles.ts');
const baseAnimationPath = resolve(process.cwd(), 'src/scripts/canvas/animations/base.ts');
const exportPath = resolve(process.cwd(), 'src/scripts/canvas/export.ts');

const qualityProfilesSource = readFileSync(qualityProfilesPath, 'utf8');
const baseAnimationSource = readFileSync(baseAnimationPath, 'utf8');
const exportSource = readFileSync(exportPath, 'utf8');

test('quality profiles define all five required mood presets', () => {
  assert.match(qualityProfilesSource, /export const MOOD_PRESETS/);
  assert.match(qualityProfilesSource, /bold:\s*\{/);
  assert.match(qualityProfilesSource, /elegant:\s*\{/);
  assert.match(qualityProfilesSource, /playful:\s*\{/);
  assert.match(qualityProfilesSource, /minimal:\s*\{/);
  assert.match(qualityProfilesSource, /dynamic:\s*\{/);
});

test('light background render rule switches to normal blending with opacity 0.7', () => {
  assert.match(qualityProfilesSource, /lightnessThreshold:\s*50/);
  assert.match(qualityProfilesSource, /lightBackgroundOpacity:\s*0\.7/);
  assert.match(qualityProfilesSource, /blending:\s*'normal'/);
});

test('particle budget caps to 400 when hardwareConcurrency is below 4', () => {
  assert.match(qualityProfilesSource, /mobileConcurrencyThreshold:\s*4/);
  assert.match(qualityProfilesSource, /mobileParticleCap:\s*400/);
  assert.match(qualityProfilesSource, /navigator\.hardwareConcurrency/);
  assert.match(qualityProfilesSource, /Math\.min\(normalizedBaseCount, QUALITY_PROFILE_CONSTANTS\.mobileParticleCap\)/);
});

test('base animation exposes shared quality helper accessors', () => {
  assert.match(baseAnimationSource, /protected getMoodPreset\(\)/);
  assert.match(baseAnimationSource, /protected getRenderProfile\(\)/);
  assert.match(baseAnimationSource, /protected getParticleBudget\(baseCount: number\)/);
});

test('export path reuses shared quality-profile constants and helper data', () => {
  assert.match(exportSource, /QUALITY_PROFILE_CONSTANTS/);
  assert.match(exportSource, /MOOD_PRESETS/);
  assert.match(exportSource, /const qualityProfiles =/);
  assert.match(exportSource, /getRenderProfileForBackground\(/);
  assert.match(exportSource, /getParticleBudgetForDevice\(/);
});
