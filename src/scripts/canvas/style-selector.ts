import type { AnimationStyle, CompanyMood, IndustryCategory } from './types';
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
  other: 'particles',
};

const V2_STYLE_MATRIX: Record<IndustryCategory, AnimationStyle> = {
  tech: 'constellation',
  finance: 'timeline',
  health: 'timeline',
  retail: 'narrative',
  creative: 'spotlight',
  food: 'narrative',
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
    other: {
      elegant: 'timeline',
      minimal: 'constellation',
      dynamic: 'narrative',
      bold: 'spotlight',
      playful: 'narrative',
    },
  };

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

export { V1_STYLE_MATRIX, V2_STYLE_MATRIX };
