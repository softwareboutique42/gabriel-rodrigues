import type { TutorialStep, TutorialState, TutorialStepId, UtilityCardId } from './types.ts';

export const TUTORIAL_STEPS: TutorialStep[] = [
  { id: 'welcome', essenceReward: 5 },
  { id: 'house-edge-intro', essenceReward: 10 },
  { id: 'play-and-observe', essenceReward: 15, requiresSpins: 3 },
  { id: 'probability-reveal', essenceReward: 10 },
  { id: 'card-unlock', essenceReward: 20 },
  { id: 'complete', essenceReward: 0 },
];

const STEP_ORDER: TutorialStepId[] = TUTORIAL_STEPS.map((step) => step.id);
const STARTER_CARD_IDS: UtilityCardId[] = ['probability-seer', 'dopamine-dampener', 'house-edge'];

function getStep(id: TutorialStepId): TutorialStep {
  return TUTORIAL_STEPS.find((step) => step.id === id) ?? TUTORIAL_STEPS[0];
}

export function createInitialTutorialState(): TutorialState {
  return {
    currentStep: 'welcome',
    completedSteps: [],
    spinsObserved: 0,
    essenceBalance: 0,
    cardsUnlocked: [],
    activeCard: null,
  };
}

export function isFirstRun(): boolean {
  return localStorage.getItem('ccz-tutorial-completed') === null;
}

export function markTutorialComplete(): void {
  localStorage.setItem('ccz-tutorial-completed', '1');
}

export function advanceTutorialStep(state: TutorialState): TutorialState {
  const index = STEP_ORDER.indexOf(state.currentStep);
  if (index === -1 || index === STEP_ORDER.length - 1) {
    return { ...state };
  }

  const nextStep = STEP_ORDER[index + 1];
  const completedSteps = state.completedSteps.includes(state.currentStep)
    ? state.completedSteps
    : [...state.completedSteps, state.currentStep];

  return {
    ...state,
    currentStep: nextStep,
    completedSteps,
  };
}

export function recordSpin(state: TutorialState): TutorialState {
  const nextSpinCount = state.spinsObserved + 1;
  const withSpin = { ...state, spinsObserved: nextSpinCount };

  if (state.currentStep !== 'play-and-observe') {
    return withSpin;
  }

  const requiredSpins = getStep('play-and-observe').requiresSpins ?? 0;
  if (nextSpinCount < requiredSpins) {
    return withSpin;
  }

  return advanceTutorialStep(withSpin);
}

export function unlockCards(state: TutorialState): TutorialState {
  if (state.currentStep !== 'card-unlock') {
    return { ...state };
  }

  return {
    ...state,
    cardsUnlocked: [...STARTER_CARD_IDS],
  };
}
