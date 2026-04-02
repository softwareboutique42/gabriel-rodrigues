import type { CompanyConfig, CompanyMood, IndustryCategory } from './types';

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

  return {
    ...config,
    mood: sanitizeMood(config.mood),
    industryCategory: sanitizeIndustryCategory(config.industryCategory),
    energyLevel: clamp01(config.energyLevel),
    visualElements: normalizeVisualElements(config.visualElements),
  };
}
