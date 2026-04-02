import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const workerIndexPath = resolve(process.cwd(), 'workers/company-api/src/index.ts');
const workerNormalizePath = resolve(process.cwd(), 'workers/company-api/src/normalize.ts');
const typesPath = resolve(process.cwd(), 'src/scripts/canvas/types.ts');
const mainPath = resolve(process.cwd(), 'src/scripts/canvas/main.ts');
const configNormalizationPath = resolve(
  process.cwd(),
  'src/scripts/canvas/config-normalization.ts',
);
const selectorPath = resolve(process.cwd(), 'src/scripts/canvas/style-selector.ts');
const animationIndexPath = resolve(process.cwd(), 'src/scripts/canvas/animations/index.ts');
const orbitAnimationPath = resolve(process.cwd(), 'src/scripts/canvas/animations/orbit.ts');
const pulseAnimationPath = resolve(process.cwd(), 'src/scripts/canvas/animations/pulse.ts');
const signalAnimationPath = resolve(process.cwd(), 'src/scripts/canvas/animations/signal.ts');
const versionsPath = resolve(process.cwd(), 'src/scripts/canvas/versions.ts');

const workerIndexSource = readFileSync(workerIndexPath, 'utf8');
const workerNormalizeSource = readFileSync(workerNormalizePath, 'utf8');
const typesSource = readFileSync(typesPath, 'utf8');
const mainSource = readFileSync(mainPath, 'utf8');
const configNormalizationSource = readFileSync(configNormalizationPath, 'utf8');
const selectorSource = readFileSync(selectorPath, 'utf8');
const animationIndexSource = readFileSync(animationIndexPath, 'utf8');
const orbitAnimationSource = readFileSync(orbitAnimationPath, 'utf8');
const pulseAnimationSource = readFileSync(pulseAnimationPath, 'utf8');
const signalAnimationSource = readFileSync(signalAnimationPath, 'utf8');
const versionsSource = readFileSync(versionsPath, 'utf8');

test('worker prompt requests semantic mood, industryCategory, and energyLevel', () => {
  assert.match(workerIndexSource, /"mood":\s*"<one of:/);
  assert.match(workerIndexSource, /"industryCategory":\s*"<one of:/);
  assert.match(workerIndexSource, /"energyLevel":\s*<number 0\.0-1\.0>/);
});

test('worker generate and get paths both use version-aware cache keys', () => {
  assert.match(workerNormalizeSource, /cacheKey\(name: string, version: string = 'v1'\)/);
  assert.match(workerIndexSource, /const key = cacheKey\(companyName, version\)/);
  assert.match(workerIndexSource, /const key = cacheKey\(companySlug, version\)/);
});

test('shared CompanyConfig includes semantic fields', () => {
  assert.match(typesSource, /export type CompanyMood =/);
  assert.match(typesSource, /export type IndustryCategory =/);
  assert.match(typesSource, /mood: CompanyMood;/);
  assert.match(typesSource, /industryCategory: IndustryCategory;/);
  assert.match(typesSource, /energyLevel: number;/);
});

test('normalization clamps and sanitizes semantic fields with fallbacks', () => {
  assert.match(configNormalizationSource, /export function normalizeCompanyConfig\(/);
  assert.match(configNormalizationSource, /clamp01\(/);
  assert.match(configNormalizationSource, /sanitizeMood\(/);
  assert.match(configNormalizationSource, /sanitizeIndustryCategory\(/);
  assert.match(configNormalizationSource, /FALLBACK_MOOD/);
  assert.match(configNormalizationSource, /FALLBACK_INDUSTRY_CATEGORY/);
});

test('normalization truncates visual elements to max 12 characters', () => {
  assert.match(configNormalizationSource, /slice\(0, 12\)/);
});

test('main flow normalizes payloads at the boundary', () => {
  assert.match(mainSource, /normalizeCompanyConfig\(/);
});

test('deterministic selector exists and normalization overwrites animationStyle', () => {
  assert.match(selectorSource, /export function selectAnimationStyle\(/);
  assert.match(selectorSource, /const V1_STYLE_MATRIX/);
  assert.match(selectorSource, /const V2_STYLE_MATRIX/);

  assert.match(configNormalizationSource, /selectAnimationStyle\(/);
  assert.match(configNormalizationSource, /animationStyle:\s*selectAnimationStyle\(/);
});

test('FR-5.1 orbit style is part of shared animation style contracts', () => {
  assert.match(typesSource, /\| 'orbit'/);
  assert.match(animationIndexSource, /import \{ OrbitAnimation \} from '\.\/orbit';/);
  assert.match(animationIndexSource, /orbit:\s*OrbitAnimation/);
  assert.match(versionsSource, /styles:\s*\[[^\]]*'orbit'[^\]]*\]/);
});

test('FR-5.1 deterministic selector can route creative v2 profiles to orbit', () => {
  assert.match(selectorSource, /creative:\s*'orbit'/);
  assert.match(selectorSource, /creative:\s*\{[\s\S]*elegant:\s*'orbit'/);
});

test('FR-5.4 orbit animation uses loopProgress and mood preset hooks for stable cycles', () => {
  assert.match(orbitAnimationSource, /export class OrbitAnimation extends BaseAnimation/);
  assert.match(orbitAnimationSource, /const progress = this\.loopProgress\(elapsed\)/);
  assert.match(orbitAnimationSource, /const loopAngle = progress \* Math\.PI \* 2/);
  assert.match(orbitAnimationSource, /const moodPreset = this\.getMoodPreset\(\)/);
  assert.match(orbitAnimationSource, /trail/);
});

test('FR-5.2 pulse style is part of shared animation style contracts', () => {
  assert.match(typesSource, /\| 'pulse'/);
  assert.match(animationIndexSource, /import \{ PulseAnimation \} from '\.\/pulse';/);
  assert.match(animationIndexSource, /pulse:\s*PulseAnimation/);
  assert.match(versionsSource, /styles:\s*\[[^\]]*'pulse'[^\]]*\]/);
});

test('FR-5.2 deterministic selector routes finance and health v2 profiles to pulse', () => {
  assert.match(selectorSource, /finance:\s*'pulse'/);
  assert.match(selectorSource, /health:\s*'pulse'/);
});

test('FR-5.4 pulse animation uses loopProgress and mood preset hooks for seam-safe timing', () => {
  assert.match(pulseAnimationSource, /export class PulseAnimation extends BaseAnimation/);
  assert.match(pulseAnimationSource, /const progress = this\.loopProgress\(elapsed\)/);
  assert.match(pulseAnimationSource, /const loopAngle = progress \* Math\.PI \* 2/);
  assert.match(pulseAnimationSource, /const moodPreset = this\.getMoodPreset\(\)/);
});

test('FR-5.3 signal style is part of shared animation style contracts', () => {
  assert.match(typesSource, /\| 'signal';/);
  assert.match(animationIndexSource, /import \{ SignalAnimation \} from '\.\/signal';/);
  assert.match(animationIndexSource, /signal:\s*SignalAnimation/);
  assert.match(versionsSource, /styles:\s*\[[^\]]*'signal'[^\]]*\]/);
});

test('FR-5.3 deterministic selector routes tech-focused v2 profiles to signal', () => {
  assert.match(selectorSource, /tech:\s*'signal'/);
  assert.match(selectorSource, /tech:\s*\{[\s\S]*elegant:\s*'signal'/);
});

test('FR-5.4 signal animation uses loopProgress and mood preset hooks for loop-safe graph timing', () => {
  assert.match(signalAnimationSource, /export class SignalAnimation extends BaseAnimation/);
  assert.match(signalAnimationSource, /const progress = this\.loopProgress\(elapsed\)/);
  assert.match(signalAnimationSource, /const loopAngle = progress \* Math\.PI \* 2/);
  assert.match(signalAnimationSource, /const moodPreset = this\.getMoodPreset\(\)/);
  assert.match(signalAnimationSource, /rectilinear/);
});
