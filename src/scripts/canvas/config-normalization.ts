import type { AnimationPresetId, CompanyConfig, CompanyMood, IndustryCategory } from './types';
import { selectAnimationPreset, selectAnimationStyle } from './style-selector';
import { getVersion } from './versions';

export const FALLBACK_MOOD: CompanyMood = 'dynamic';
export const FALLBACK_INDUSTRY_CATEGORY: IndustryCategory = 'other';
export const FALLBACK_ENERGY_LEVEL = 0.6;
export const FALLBACK_PRESET_ID: AnimationPresetId | null = null;

const COMPANY_MOODS: CompanyMood[] = ['bold', 'elegant', 'playful', 'minimal', 'dynamic'];
const INDUSTRY_CATEGORIES: IndustryCategory[] = [
  'tech',
  'finance',
  'health',
  'retail',
  'creative',
  'food',
  'education',
  'hospitality',
  'other',
];

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

type PresetOverride = {
  style: CompanyConfig['animationStyle'];
  params: CompanyConfig['animationParams'];
  visualElements: string[];
};

const PRESET_OVERRIDES: Record<AnimationPresetId, PresetOverride> = {
  'education-story': {
    style: 'narrative',
    params: { speed: 0.95, density: 0.58, complexity: 0.55 },
    visualElements: ['learning', 'curriculum', 'lesson'],
  },
  'hospitality-orbit': {
    style: 'orbit',
    params: { speed: 0.9, density: 0.62, complexity: 0.6 },
    visualElements: ['suite', 'guest', 'lounge'],
  },
  'commerce-signal': {
    style: 'signal',
    params: { speed: 1.15, density: 0.68, complexity: 0.64 },
    visualElements: ['cart', 'checkout', 'offer'],
  },
};

const PRESET_IDS_BY_VERSION = {
  v1: new Set<AnimationPresetId>(),
  v2: new Set<AnimationPresetId>(['education-story', 'hospitality-orbit', 'commerce-signal']),
};

function clampRange(value: unknown, min: number, max: number, fallback: number): number {
  const numeric = typeof value === 'number' ? value : Number(value);
  if (!Number.isFinite(numeric)) return fallback;
  if (numeric < min) return min;
  if (numeric > max) return max;
  return numeric;
}

export function clamp01(value: unknown, fallback = FALLBACK_ENERGY_LEVEL): number {
  const numeric = typeof value === 'number' ? value : Number(value);
  if (!Number.isFinite(numeric)) return fallback;
  if (numeric < 0) return 0;
  if (numeric > 1) return 1;
  return numeric;
}

export function sanitizeMood(value: unknown): CompanyMood {
  return COMPANY_MOODS.includes(value as CompanyMood) ? (value as CompanyMood) : FALLBACK_MOOD;
}

export function sanitizeIndustryCategory(value: unknown): IndustryCategory {
  return INDUSTRY_CATEGORIES.includes(value as IndustryCategory)
    ? (value as IndustryCategory)
    : FALLBACK_INDUSTRY_CATEGORY;
}

function normalizeVisualElements(value: unknown): string[] {
  if (!Array.isArray(value)) return [];

  return value
    .filter((item): item is string => typeof item === 'string')
    .map((item) => item.trim().slice(0, 12))
    .filter((item) => item.length > 0);
}

export function sanitizePresetId(value: unknown, version: 'v1' | 'v2'): AnimationPresetId | null {
  if (typeof value !== 'string') return FALLBACK_PRESET_ID;
  return PRESET_IDS_BY_VERSION[version].has(value as AnimationPresetId)
    ? (value as AnimationPresetId)
    : FALLBACK_PRESET_ID;
}

export function normalizeCompanyConfig(raw: CompanyConfig | unknown): CompanyConfig {
  if (!isObject(raw)) {
    throw new Error('Invalid company config payload');
  }

  const config = raw as CompanyConfig;

  const normalizedMood = sanitizeMood(config.mood);
  const normalizedIndustryCategory = sanitizeIndustryCategory(config.industryCategory);
  const normalizedVersion = getVersion(config.version ?? 'v1')?.id ?? 'v1';
  const normalizedPreset =
    sanitizePresetId(config.presetId, normalizedVersion) ??
    selectAnimationPreset({
      version: normalizedVersion,
      industryCategory: normalizedIndustryCategory,
      mood: normalizedMood,
    });
  const presetOverride = normalizedPreset ? PRESET_OVERRIDES[normalizedPreset] : null;
  const normalizedVisualElements = normalizeVisualElements(config.visualElements);

  return {
    ...config,
    version: normalizedVersion,
    presetId: normalizedPreset ?? undefined,
    mood: normalizedMood,
    industryCategory: normalizedIndustryCategory,
    energyLevel: clamp01(config.energyLevel),
    animationStyle:
      presetOverride?.style ??
      selectAnimationStyle({
        version: normalizedVersion,
        industryCategory: normalizedIndustryCategory,
        mood: normalizedMood,
      }),
    animationParams: {
      speed: clampRange(presetOverride?.params.speed ?? config.animationParams?.speed, 0.5, 2, 1),
      density: clampRange(
        presetOverride?.params.density ?? config.animationParams?.density,
        0.3,
        1,
        0.7,
      ),
      complexity: clampRange(
        presetOverride?.params.complexity ?? config.animationParams?.complexity,
        0.3,
        1,
        0.8,
      ),
    },
    visualElements:
      normalizedVisualElements.length > 0
        ? normalizedVisualElements
        : (presetOverride?.visualElements ?? []),
  };
}
