import type { CompanyConfig } from '../types';
import type { BaseAnimation } from './base';
import { ParticlesAnimation } from './particles';
import { FlowingAnimation } from './flowing';
import { GeometricAnimation } from './geometric';
import { TypographicAnimation } from './typographic';

const registry: Record<CompanyConfig['animationStyle'], new () => BaseAnimation> = {
  particles: ParticlesAnimation,
  flowing: FlowingAnimation,
  geometric: GeometricAnimation,
  typographic: TypographicAnimation,
};

export function createAnimation(style: CompanyConfig['animationStyle']): BaseAnimation {
  const AnimClass = registry[style] ?? ParticlesAnimation;
  return new AnimClass();
}
