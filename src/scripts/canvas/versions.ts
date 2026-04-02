import type { AnimationPresetId, CompanyConfig } from './types';

export type AnimationVersionId = 'v1' | 'v2';

export interface AnimationVersion {
  id: AnimationVersionId;
  label: string;
  description: string;
  styles: CompanyConfig['animationStyle'][];
  verticalPresets: AnimationVerticalPreset[];
}

export interface AnimationVerticalPreset {
  id: AnimationPresetId;
  label: string;
  description: string;
  baseStyle: CompanyConfig['animationStyle'];
}

export const VERTICAL_PRESETS: Record<AnimationVersionId, AnimationVerticalPreset[]> = {
  v1: [],
  v2: [
    {
      id: 'education-story',
      label: 'Education Story',
      description: 'Readable narrative pacing for learning and curriculum brands.',
      baseStyle: 'narrative',
    },
    {
      id: 'hospitality-orbit',
      label: 'Hospitality Orbit',
      description: 'Smooth premium orbit motion for travel and hospitality brands.',
      baseStyle: 'orbit',
    },
    {
      id: 'commerce-signal',
      label: 'Commerce Signal',
      description: 'Clear conversion-forward signal rhythm for commerce campaigns.',
      baseStyle: 'signal',
    },
  ],
};

export const VERSIONS: AnimationVersion[] = [
  {
    id: 'v1',
    label: 'v1 — Classic',
    description: 'Four signature styles: particles, flowing, geometric, typographic',
    styles: ['particles', 'flowing', 'geometric', 'typographic'],
    verticalPresets: VERTICAL_PRESETS.v1,
  },
  {
    id: 'v2',
    label: 'v2 — Story',
    description:
      'Story-driven animations that tell what the company does, including orbit, pulse, and signal modes',
    styles: ['narrative', 'timeline', 'constellation', 'spotlight', 'orbit', 'pulse', 'signal'],
    verticalPresets: VERTICAL_PRESETS.v2,
  },
];

export function getVersion(id: string): AnimationVersion | undefined {
  return VERSIONS.find((v) => v.id === id);
}

export function getDefaultVersion(): AnimationVersion {
  return VERSIONS[0];
}
