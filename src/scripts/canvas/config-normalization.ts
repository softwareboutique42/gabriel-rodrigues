import type { CompanyConfig, CompanyMood, IndustryCategory } from './types';
import { selectAnimationStyle } from './style-selector';
import { getVersion } from './versions';

export const FALLBACK_MOOD: CompanyMood = 'dynamic';
export const FALLBACK_INDUSTRY_CATEGORY: IndustryCategory = 'other';
export const FALLBACK_ENERGY_LEVEL = 0.6;

const COMPANY_MOODS: CompanyMood[] = ['bold', 'elegant', 'playful', 'minimal', 'dynamic'];
const INDUSTRY_CATEGORIES: IndustryCategory[] = [
  'tech',
  'finance',
  'health',
  'retail',
  'creative',
  'food',
  'other',
];

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
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

export function normalizeCompanyConfig(raw: CompanyConfig | unknown): CompanyConfig {
  if (!isObject(raw)) {
    throw new Error('Invalid company config payload');
  }

  const config = raw as CompanyConfig;

  const normalizedMood = sanitizeMood(config.mood);
  const normalizedIndustryCategory = sanitizeIndustryCategory(config.industryCategory);
  const normalizedVersion = getVersion(config.version ?? 'v1')?.id ?? 'v1';

  return {
    ...config,
    version: normalizedVersion,
    mood: normalizedMood,
    industryCategory: normalizedIndustryCategory,
    energyLevel: clamp01(config.energyLevel),
    animationStyle: selectAnimationStyle({
      version: normalizedVersion,
      industryCategory: normalizedIndustryCategory,
      mood: normalizedMood,
    }),
    visualElements: normalizeVisualElements(config.visualElements),
  };
}
