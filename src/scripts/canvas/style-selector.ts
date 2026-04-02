import type { AnimationPresetId, AnimationStyle, CompanyMood, IndustryCategory } from './types';
import type { AnimationVersionId } from './versions';

type SelectorInput = {
  version: AnimationVersionId;
  industryCategory: IndustryCategory;
  mood: CompanyMood;
};

const V1_STYLE_MATRIX: Record<IndustryCategory, AnimationStyle> = {
  tech: 'particles',
  finance: 'geometric',
  health: 'flowing',
  retail: 'typographic',
  creative: 'typographic',
  food: 'flowing',
  education: 'typographic',
  hospitality: 'flowing',
  other: 'particles',
};

const V2_STYLE_MATRIX: Record<IndustryCategory, AnimationStyle> = {
  tech: 'signal',
  finance: 'pulse',
  health: 'pulse',
  retail: 'narrative',
  creative: 'orbit',
  food: 'narrative',
  education: 'narrative',
  hospitality: 'orbit',
  other: 'narrative',
};

const V1_MOOD_TIE_BREAKER: Partial<Record<IndustryCategory, Record<CompanyMood, AnimationStyle>>> =
  {
    other: {
      elegant: 'flowing',
      minimal: 'geometric',
      dynamic: 'particles',
      bold: 'particles',
      playful: 'typographic',
    },
  };

const V2_MOOD_TIE_BREAKER: Partial<Record<IndustryCategory, Record<CompanyMood, AnimationStyle>>> =
  {
    tech: {
      elegant: 'signal',
      minimal: 'signal',
      dynamic: 'signal',
      bold: 'signal',
      playful: 'constellation',
    },
    finance: {
      elegant: 'pulse',
      minimal: 'pulse',
      dynamic: 'timeline',
      bold: 'pulse',
      playful: 'timeline',
    },
    health: {
      elegant: 'pulse',
      minimal: 'pulse',
      dynamic: 'pulse',
      bold: 'timeline',
      playful: 'timeline',
    },
    creative: {
      elegant: 'orbit',
      minimal: 'orbit',
      dynamic: 'orbit',
      bold: 'spotlight',
      playful: 'orbit',
    },
    other: {
      elegant: 'timeline',
      minimal: 'constellation',
      dynamic: 'narrative',
      bold: 'spotlight',
      playful: 'narrative',
    },
  };

const VERTICAL_PRESET_ROUTING: Partial<
  Record<AnimationVersionId, Partial<Record<IndustryCategory, AnimationPresetId>>>
> = {
  v2: {
    education: 'education-story',
    hospitality: 'hospitality-orbit',
    retail: 'commerce-signal',
  },
};

export function selectAnimationPreset({
  version,
  industryCategory,
}: SelectorInput): AnimationPresetId | null {
  return VERTICAL_PRESET_ROUTING[version]?.[industryCategory] ?? null;
}

export function selectAnimationStyle({
  version,
  industryCategory,
  mood,
}: SelectorInput): AnimationStyle {
  if (version === 'v2') {
    return V2_MOOD_TIE_BREAKER[industryCategory]?.[mood] ?? V2_STYLE_MATRIX[industryCategory];
  }

  return V1_MOOD_TIE_BREAKER[industryCategory]?.[mood] ?? V1_STYLE_MATRIX[industryCategory];
}

export { V1_STYLE_MATRIX, V2_STYLE_MATRIX, VERTICAL_PRESET_ROUTING };
