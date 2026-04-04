import type {
  LessonId,
  TutorialLesson,
  TutorialStep,
  TutorialState,
  TutorialStepId,
  UtilityCardId,
} from './types.ts';

export const CURRICULUM_LESSONS: TutorialLesson[] = [
  {
    id: 'house-edge',
    stepIds: [
      'welcome',
      'house-edge-intro',
      'play-and-observe',
      'probability-reveal',
      'card-unlock',
      'complete',
    ],
  },
  {
    id: 'near-miss',
    stepIds: ['near-miss-intro', 'near-miss-observe', 'near-miss-reveal', 'near-miss-complete'],
  },
  {
    id: 'sensory-conditioning',
    stepIds: [
      'sensory-conditioning-intro',
      'sensory-conditioning-observe',
      'sensory-conditioning-reveal',
      'sensory-conditioning-complete',
    ],
  },
];

export const TUTORIAL_STEPS: TutorialStep[] = [
  { id: 'welcome', essenceReward: 5 },
  { id: 'house-edge-intro', essenceReward: 10 },
  { id: 'play-and-observe', essenceReward: 15, requiresSpins: 3 },
  { id: 'probability-reveal', essenceReward: 10 },
  { id: 'card-unlock', essenceReward: 20 },
  { id: 'complete', essenceReward: 0 },
  { id: 'near-miss-intro', essenceReward: 5 },
  { id: 'near-miss-observe', essenceReward: 10, requiresSpins: 2 },
  { id: 'near-miss-reveal', essenceReward: 10 },
  { id: 'near-miss-complete', essenceReward: 0 },
  { id: 'sensory-conditioning-intro', essenceReward: 5 },
  { id: 'sensory-conditioning-observe', essenceReward: 10, requiresSpins: 2 },
  { id: 'sensory-conditioning-reveal', essenceReward: 10 },
  { id: 'sensory-conditioning-complete', essenceReward: 0 },
];

const STARTER_CARD_IDS: UtilityCardId[] = ['probability-seer', 'dopamine-dampener', 'house-edge'];

function getStep(id: TutorialStepId): TutorialStep {
  return TUTORIAL_STEPS.find((step) => step.id === id) ?? TUTORIAL_STEPS[0];
}

function getLesson(lessonId: LessonId): TutorialLesson {
  return CURRICULUM_LESSONS.find((lesson) => lesson.id === lessonId) ?? CURRICULUM_LESSONS[0];
}

export function createInitialTutorialState(): TutorialState {
  return {
    currentLesson: 'house-edge',
    currentStep: 'welcome',
    completedSteps: [],
    spinsObserved: 0,
    essenceBalance: 0,
    unlockedLessons: ['house-edge'],
    completedLessons: [],
    cardsUnlocked: [],
    activeCard: null,
    lastTransitionTrigger: null,
  };
}

export function isFirstRun(): boolean {
  return localStorage.getItem('ccz-tutorial-completed') === null;
}

export function markTutorialComplete(): void {
  localStorage.setItem('ccz-tutorial-completed', '1');
}

export function advanceTutorialStep(state: TutorialState): TutorialState {
  const stepOrder = getLesson(state.currentLesson).stepIds;
  const index = stepOrder.indexOf(state.currentStep);
  if (index === -1 || index === stepOrder.length - 1) {
    return { ...state };
  }

  const nextStep = stepOrder[index + 1];
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

  if (
    state.currentStep !== 'play-and-observe' &&
    state.currentStep !== 'near-miss-observe' &&
    state.currentStep !== 'sensory-conditioning-observe'
  ) {
    return withSpin;
  }

  const requiredSpins = getStep(state.currentStep).requiresSpins ?? 0;
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

export function isLessonUnlocked(state: TutorialState, lessonId: LessonId): boolean {
  return state.unlockedLessons.includes(lessonId);
}

export function completeCurrentLesson(state: TutorialState): TutorialState {
  const completedLessons = state.completedLessons.includes(state.currentLesson)
    ? state.completedLessons
    : [...state.completedLessons, state.currentLesson];
  const unlockedLessons = [...state.unlockedLessons];

  if (state.currentLesson === 'house-edge' && !unlockedLessons.includes('near-miss')) {
    unlockedLessons.push('near-miss');
  }

  if (state.currentLesson === 'near-miss' && !unlockedLessons.includes('sensory-conditioning')) {
    unlockedLessons.push('sensory-conditioning');
  }

  return {
    ...state,
    completedLessons,
    unlockedLessons,
  };
}

export function openLesson(state: TutorialState, lessonId: LessonId): TutorialState {
  if (!isLessonUnlocked(state, lessonId)) {
    return { ...state };
  }

  const firstStep = getLesson(lessonId).stepIds[0];
  if (!firstStep) {
    return { ...state };
  }

  return {
    ...state,
    currentLesson: lessonId,
    currentStep: firstStep,
    spinsObserved: 0,
    lastTransitionTrigger: null,
    activeCard: null,
  };
}
