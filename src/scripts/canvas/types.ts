export type AnimationStyle =
  | 'particles'
  | 'flowing'
  | 'geometric'
  | 'typographic'
  | 'narrative'
  | 'timeline'
  | 'constellation'
  | 'spotlight'
  | 'orbit'
  | 'pulse'
  | 'signal';

export type CompanyMood = 'bold' | 'elegant' | 'playful' | 'minimal' | 'dynamic';

export type IndustryCategory =
  | 'tech'
  | 'finance'
  | 'health'
  | 'retail'
  | 'creative'
  | 'food'
  | 'other';

export interface CompanyConfig {
  companyName: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
  };
  tagline: string;
  industry: string;
  description: string;
  mood: CompanyMood;
  industryCategory: IndustryCategory;
  energyLevel: number;
  animationStyle: AnimationStyle;
  animationParams: {
    speed: number;
    density: number;
    complexity: number;
  };
  visualElements: string[];
  version?: string;
}

export interface AnimationController {
  init(canvas: HTMLCanvasElement, config: CompanyConfig): void;
  start(): void;
  stop(): void;
  dispose(): void;
}
