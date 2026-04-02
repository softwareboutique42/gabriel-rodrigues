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

const workerIndexSource = readFileSync(workerIndexPath, 'utf8');
const workerNormalizeSource = readFileSync(workerNormalizePath, 'utf8');
const typesSource = readFileSync(typesPath, 'utf8');
const mainSource = readFileSync(mainPath, 'utf8');

const configNormalizationSource = readFileSync(configNormalizationPath, 'utf8');
const selectorSource = readFileSync(selectorPath, 'utf8');

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

test('deterministic selector exists and main flow overwrites animationStyle after normalization', () => {
  assert.match(selectorSource, /export function selectAnimationStyle\(/);
  assert.match(selectorSource, /const V1_STYLE_MATRIX/);
  assert.match(selectorSource, /const V2_STYLE_MATRIX/);

  assert.match(mainSource, /normalizeCompanyConfig\(/);
  assert.match(mainSource, /selectAnimationStyle\(/);
  assert.match(mainSource, /animationStyle:\s*selectAnimationStyle\(/);
});
