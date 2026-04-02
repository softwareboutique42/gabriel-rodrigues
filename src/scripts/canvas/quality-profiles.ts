import type { CompanyMood } from './types';

export type MoodPreset = {
  entryEasing: string;
  holdRatio: number;
  exitEasing: string;
  overshoot: number;
  intensityScale: number;
  staggerStep: number;
};

export type RenderProfile = {
  isLightBackground: boolean;
  blending: 'additive' | 'normal';
  opacity: number;
};

export const QUALITY_PROFILE_CONSTANTS = {
  lightnessThreshold: 50,
  lightBackgroundOpacity: 0.7,
  mobileConcurrencyThreshold: 4,
  mobileParticleCap: 400,
} as const;

export const MOOD_PRESETS: Record<CompanyMood, MoodPreset> = {
  bold: {
    entryEasing: 'easeInQuad',
    holdRatio: 0.64,
    exitEasing: 'hardStop',
    overshoot: 0,
    intensityScale: 1.2,
    staggerStep: 0.05,
  },
  elegant: {
    entryEasing: 'easeInOutCubic',
    holdRatio: 0.58,
    exitEasing: 'easeInOutCubic',
    overshoot: 0,
    intensityScale: 0.86,
    staggerStep: 0.09,
  },
  playful: {
    entryEasing: 'springIn',
    holdRatio: 0.52,
    exitEasing: 'springOut',
    overshoot: 0.18,
    intensityScale: 1.06,
    staggerStep: 0.08,
  },
  minimal: {
    entryEasing: 'linear',
    holdRatio: 0.7,
    exitEasing: 'linear',
    overshoot: 0,
    intensityScale: 0.72,
    staggerStep: 0.12,
  },
  dynamic: {
    entryEasing: 'easeOutQuad',
    holdRatio: 0.55,
    exitEasing: 'easeInCubic',
    overshoot: 0.04,
    intensityScale: 1,
    staggerStep: 0.07,
  },
};

function normalizeHex(hex: string): string {
  const trimmed = hex.trim();
  if (/^#[0-9a-fA-F]{6}$/.test(trimmed)) return trimmed;
  if (/^#[0-9a-fA-F]{3}$/.test(trimmed)) {
    const r = trimmed[1];
    const g = trimmed[2];
    const b = trimmed[3];
    return `#${r}${r}${g}${g}${b}${b}`;
  }
  return '#000000';
}

function getBackgroundLightnessPercent(hex: string): number {
  const normalized = normalizeHex(hex).slice(1);
  const r = parseInt(normalized.slice(0, 2), 16) / 255;
  const g = parseInt(normalized.slice(2, 4), 16) / 255;
  const b = parseInt(normalized.slice(4, 6), 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  return ((max + min) / 2) * 100;
}

function getHardwareConcurrency(): number {
  if (typeof navigator === 'undefined') return Number.POSITIVE_INFINITY;
  if (typeof navigator.hardwareConcurrency !== 'number') return Number.POSITIVE_INFINITY;
  return navigator.hardwareConcurrency;
}

export function getMoodPreset(mood: CompanyMood): MoodPreset {
  return MOOD_PRESETS[mood] ?? MOOD_PRESETS.dynamic;
}

export function getRenderProfile(backgroundHex: string): RenderProfile {
  const isLightBackground =
    getBackgroundLightnessPercent(backgroundHex) > QUALITY_PROFILE_CONSTANTS.lightnessThreshold;

  if (isLightBackground) {
    return {
      isLightBackground,
      blending: 'normal',
      opacity: QUALITY_PROFILE_CONSTANTS.lightBackgroundOpacity,
    };
  }

  return {
    isLightBackground,
    blending: 'additive',
    opacity: 1,
  };
}

export function getParticleBudget(baseCount: number): number {
  const normalizedBaseCount = Math.max(0, Math.floor(baseCount));
  if (getHardwareConcurrency() < QUALITY_PROFILE_CONSTANTS.mobileConcurrencyThreshold) {
    return Math.min(normalizedBaseCount, QUALITY_PROFILE_CONSTANTS.mobileParticleCap);
  }
  return normalizedBaseCount;
}
