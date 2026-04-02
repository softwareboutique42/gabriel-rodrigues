import type { CompanyConfig } from './types';

export type AnimationVersionId = 'v1' | 'v2';

export interface AnimationVersion {
  id: AnimationVersionId;
  label: string;
  description: string;
  styles: CompanyConfig['animationStyle'][];
}

export const VERSIONS: AnimationVersion[] = [
  {
    id: 'v1',
    label: 'v1 — Classic',
    description: 'Four signature styles: particles, flowing, geometric, typographic',
    styles: ['particles', 'flowing', 'geometric', 'typographic'],
  },
  {
    id: 'v2',
    label: 'v2 — Story',
    description: 'Story-driven animations that tell what the company does, including orbit mode',
    styles: ['narrative', 'timeline', 'constellation', 'spotlight', 'orbit'],
  },
];

export function getVersion(id: string): AnimationVersion | undefined {
  return VERSIONS.find((v) => v.id === id);
}

export function getDefaultVersion(): AnimationVersion {
  return VERSIONS[0];
}
