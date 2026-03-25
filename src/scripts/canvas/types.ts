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
  animationStyle: 'particles' | 'flowing' | 'geometric' | 'typographic';
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
