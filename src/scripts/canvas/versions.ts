import type { CompanyConfig } from './types';

export interface AnimationVersion {
  id: string;
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
];

export function getVersion(id: string): AnimationVersion | undefined {
  return VERSIONS.find((v) => v.id === id);
}

export function getDefaultVersion(): AnimationVersion {
  return VERSIONS[0];
}
