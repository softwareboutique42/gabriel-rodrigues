export type TutorialStepId =
  | 'welcome'
  | 'house-edge-intro'
  | 'play-and-observe'
  | 'probability-reveal'
  | 'card-unlock'
  | 'complete';

export type UtilityCardId = 'probability-seer' | 'dopamine-dampener' | 'house-edge';

export interface TutorialStep {
  id: TutorialStepId;
  essenceReward: number;
  requiresSpins?: number;
}

export interface TutorialState {
  currentStep: TutorialStepId;
  completedSteps: TutorialStepId[];
  spinsObserved: number;
  essenceBalance: number;
  cardsUnlocked: UtilityCardId[];
  activeCard: UtilityCardId | null;
}

export interface UtilityCard {
  id: UtilityCardId;
  labelKey: string;
  descriptionKey: string;
}

export interface DialogueMessage {
  id: string;
  role: 'narrator' | 'system';
  text: string;
}

export interface EssenceState {
  balance: number;
  totalEarned: number;
}
