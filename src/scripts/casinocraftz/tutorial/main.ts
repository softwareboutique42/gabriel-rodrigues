import { STARTER_CARDS, applyCard, clearCard } from './cards.ts';
import { getDialogue } from './dialogue.ts';
import {
  TUTORIAL_STEPS,
  advanceTutorialStep,
  createInitialTutorialState,
  isFirstRun,
  markTutorialComplete,
  recordSpin,
  unlockCards,
} from './engine.ts';
import { awardEssence, createInitialEssenceState } from './essence.ts';
import type { TutorialStepId, TutorialState, UtilityCardId } from './types.ts';

interface MountTutorialOptions {
  lang: 'en' | 'pt';
}

let activeController: AbortController | null = null;

const REPLAY_ENABLED_STEPS: TutorialStepId[] = [
  'house-edge-intro',
  'play-and-observe',
  'probability-reveal',
  'card-unlock',
  'complete',
];

function stepReward(stepId: TutorialStepId): number {
  return TUTORIAL_STEPS.find((step) => step.id === stepId)?.essenceReward ?? 0;
}

function pulseElement(element: Element | null, className: string): void {
  if (!(element instanceof HTMLElement)) return;
  element.classList.remove(className);
  requestAnimationFrame(() => {
    element.classList.add(className);
    window.setTimeout(() => element.classList.remove(className), 520);
  });
}

function celebrateTutorialAdvance(root: HTMLElement): void {
  pulseElement(root.querySelector('[data-casinocraftz-dialogue]'), 'ccz-flash-in');
  pulseElement(root.querySelector('[data-casinocraftz-essence-display]'), 'ccz-essence-pulse');
}

function celebrateCardActivation(root: HTMLElement, cardId: UtilityCardId): void {
  pulseElement(
    root.querySelector(`[data-casinocraftz-card="${cardId}"]`),
    'ccz-card-activation-burst',
  );
}

function renderDialogue(
  root: HTMLElement,
  zone: HTMLElement,
  stepId: TutorialStepId,
  lang: 'en' | 'pt',
  state?: TutorialState,
): void {
  const messages = getDialogue(stepId, lang);
  const copy = buildCardCopy(root);
  zone.replaceChildren();

  for (const message of messages) {
    const entry = document.createElement('div');
    entry.className = 'hud-outline-subtle p-3 ccz-dialogue-entry';
    entry.dataset.casinocraftzDialogueRole = message.role;
    entry.style.animationDelay = `${zone.childElementCount * 60}ms`;

    const role = document.createElement('p');
    role.className = 'font-mono text-[11px] uppercase tracking-wider text-cyan mb-1';
    role.textContent = message.role;

    const text = document.createElement('p');
    text.className = 'text-sm text-text-secondary';
    text.textContent = message.text;

    entry.append(role, text);
    zone.append(entry);
  }

  if (REPLAY_ENABLED_STEPS.includes(stepId)) {
    const replayBtnWrapper = document.createElement('div');
    replayBtnWrapper.className = 'mt-2';

    const replayBtn = document.createElement('button');
    replayBtn.className =
      'font-mono text-xs text-cyan uppercase tracking-wider hover:text-neon transition-colors ccz-replay-btn';
    replayBtn.dataset.casinocraftzReplay = 'true';
    replayBtn.textContent = copy.replayLesson;

    replayBtn.addEventListener('click', () => {
      renderDialogue(root, zone, stepId, lang, state);
    });

    replayBtnWrapper.append(replayBtn);
    zone.append(replayBtnWrapper);
  }

  // Recap disclosure (only for spin-triggered transitions)
  if (state?.lastTransitionTrigger === 'spin' && stepId === 'probability-reveal') {
    const recapWrapper = document.createElement('div');
    recapWrapper.className = 'mt-3';

    const details = document.createElement('details');
    details.className = 'hud-outline-subtle p-3 ccz-recap-details';
    details.dataset.casinocraftzRecap = 'true';

    const summary = document.createElement('summary');
    summary.className = 'font-mono text-xs text-cyan uppercase tracking-wider cursor-pointer';
    summary.textContent = copy.whyTransition;

    const content = document.createElement('p');
    content.className = 'text-sm text-text-secondary mt-2';
    content.textContent = copy.probabilityRevealCausality;

    details.append(summary, content);
    recapWrapper.append(details);
    zone.append(recapWrapper);
  }
}

function syncRootDatasets(root: HTMLElement, state: TutorialState, essenceBalance: number): void {
  root.dataset.casinocraftzTutorialStep = state.currentStep;
  root.dataset.casinocraftzEssence = String(essenceBalance);
  root.dataset.casinocraftzSpinsObserved = String(state.spinsObserved);

  const essenceDisplay = root.querySelector('[data-casinocraftz-essence-display]');
  if (essenceDisplay instanceof HTMLElement) {
    const label = root.dataset.casinocraftzEssenceLabel ?? 'AI Essence';
    essenceDisplay.textContent = `${label}: ${essenceBalance}`;
  }
}

function buildCardCopy(root: HTMLElement): Record<string, string> {
  return {
    title: root.dataset.casinocraftzCardsTitle ?? 'Utility Cards',
    activate: root.dataset.casinocraftzActivateLabel ?? 'Activate',
    replayLesson: root.dataset.casinocraftzReplayLabel ?? 'Revisit lesson',
    whyTransition: root.dataset.casinocraftzRecapLabel ?? 'Why did this happen?',
    probabilityRevealCausality:
      root.dataset.casinocraftzCausalityProbabilityReveal ??
      "The probability-reveal step is unlocked after observing 3 complete spins. You've reached that threshold.",
    statusLocked: root.dataset.casinocraftzCardStatusLocked ?? 'LOCKED',
    statusUnlocked: root.dataset.casinocraftzCardStatusUnlocked ?? 'UNLOCKED',
    probabilitySeerLabel: root.dataset.casinocraftzCardProbabilitySeerLabel ?? 'Probability Seer',
    probabilitySeerDescription:
      root.dataset.casinocraftzCardProbabilitySeerDescription ??
      'Reveals per-symbol probability percentages on the reel display.',
    dopamineDampenerLabel:
      root.dataset.casinocraftzCardDopamineDampenerLabel ?? 'Dopamine Dampener',
    dopamineDampenerDescription:
      root.dataset.casinocraftzCardDopamineDampenerDescription ??
      'Suppresses win celebration cues for analysis.',
    houseEdgeLabel: root.dataset.casinocraftzCardHouseEdgeLabel ?? 'House Edge',
    houseEdgeDescription:
      root.dataset.casinocraftzCardHouseEdgeDescription ??
      'Shows the house edge percentage as a persistent HUD overlay.',
  };
}

function renderCards(
  root: HTMLElement,
  cardsZone: HTMLElement,
  state: TutorialState,
  onActivate: (cardId: UtilityCardId) => void,
): void {
  cardsZone.replaceChildren();
  const copy = buildCardCopy(root);

  const title = document.createElement('p');
  title.className = 'font-mono text-xs text-gold uppercase tracking-wider mb-3';
  title.textContent = copy.title;

  const grid = document.createElement('div');
  grid.className = 'grid grid-cols-1 sm:grid-cols-3 gap-3';

  for (const card of STARTER_CARDS) {
    const cardRoot = document.createElement('div');
    cardRoot.className = 'hud-outline-subtle p-3 ccz-card-root';
    cardRoot.dataset.casinocraftzCard = card.id;

    const label = document.createElement('p');
    label.className = 'font-mono text-xs text-neon uppercase tracking-wider mb-1';
    if (card.id === 'probability-seer') {
      label.textContent = copy.probabilitySeerLabel;
    } else if (card.id === 'dopamine-dampener') {
      label.textContent = copy.dopamineDampenerLabel;
    } else {
      label.textContent = copy.houseEdgeLabel;
    }

    // Add status badge
    const badgeText = state.cardsUnlocked.includes(card.id)
      ? copy.statusUnlocked
      : copy.statusLocked;
    const badgeClass = state.cardsUnlocked.includes(card.id) ? 'text-neon' : 'text-text-muted';

    const badge = document.createElement('span');
    badge.className = `font-mono text-[10px] ${badgeClass} uppercase tracking-wider ccz-card-badge`;
    badge.dataset.casinocraftzCardStatus = badgeText.toLowerCase();
    badge.textContent = badgeText;

    const labelContainer = document.createElement('div');
    labelContainer.className = 'flex items-center gap-2 mb-1';
    labelContainer.append(label, badge);

    const description = document.createElement('p');
    description.className = 'text-xs text-text-muted mb-2';
    if (card.id === 'probability-seer') {
      description.textContent = copy.probabilitySeerDescription;
    } else if (card.id === 'dopamine-dampener') {
      description.textContent = copy.dopamineDampenerDescription;
    } else {
      description.textContent = copy.houseEdgeDescription;
    }

    const button = document.createElement('button');
    button.dataset.casinocraftzCardActivate = card.id;
    button.className = 'font-mono text-xs text-text-muted uppercase tracking-wider';
    button.textContent = copy.activate;

    const enabled = state.cardsUnlocked.includes(card.id);
    button.disabled = !enabled;
    button.setAttribute('aria-disabled', enabled ? 'false' : 'true');
    if (enabled) {
      button.classList.remove('text-text-muted');
      button.classList.add('text-cyan');
      button.addEventListener('click', () => onActivate(card.id));
    }

    cardRoot.append(labelContainer, description, button);
    grid.append(cardRoot);
  }

  cardsZone.append(title, grid);
}

export function parseSpinSettledBridgeEvent(data: unknown): { spinIndex: number } | null {
  if (data === null || typeof data !== 'object') return null;
  const d = data as Record<string, unknown>;
  if (d['type'] !== 'ccz:spin-settled') return null;

  let spinIndex: unknown;

  if (d['version'] === 1) {
    // v1 versioned envelope
    const payload = d['payload'];
    if (payload === null || typeof payload !== 'object') return null;
    spinIndex = (payload as Record<string, unknown>)['spinIndex'];
  } else if (d['version'] === undefined) {
    // legacy unversioned payload — backward compatible
    spinIndex = d['spinIndex'];
  } else {
    // unknown version (>= 2 or unexpected) — silently ignore
    return null;
  }

  if (!Number.isInteger(spinIndex) || (spinIndex as number) < 0) return null;
  return { spinIndex: spinIndex as number };
}

export function mountTutorial({ lang }: MountTutorialOptions): void {
  const root = document.querySelector('[data-casinocraftz-shell-root]');
  if (!(root instanceof HTMLElement)) {
    return;
  }

  const dialogueZone = root.querySelector('[data-casinocraftz-dialogue]');
  const cardsZone = root.querySelector('[data-casinocraftz-zone="cards"]');
  const nextButton = root.querySelector('[data-casinocraftz-tutorial-next]');
  const skipButton = root.querySelector('[data-casinocraftz-tutorial-skip]');

  if (!(dialogueZone instanceof HTMLElement) || !(cardsZone instanceof HTMLElement)) {
    return;
  }

  if (activeController) {
    activeController.abort();
  }
  activeController = new AbortController();
  const { signal } = activeController;

  let state = createInitialTutorialState();
  let essenceState = createInitialEssenceState();

  if (!isFirstRun()) {
    state = {
      ...state,
      currentStep: 'complete',
      completedSteps: TUTORIAL_STEPS.map((step) => step.id),
      cardsUnlocked: ['probability-seer', 'dopamine-dampener', 'house-edge'],
    };
  }

  const render = (): void => {
    syncRootDatasets(root, state, essenceState.balance);
    renderDialogue(root, dialogueZone, state.currentStep, lang, state);
    renderCards(root, cardsZone, state, (cardId) => {
      applyCard(cardId, root);
      state = {
        ...state,
        activeCard: cardId,
      };
      syncRootDatasets(root, state, essenceState.balance);
      celebrateCardActivation(root, cardId);
    });
  };

  const proceedStep = (): void => {
    const previousStep = state.currentStep;
    state = advanceTutorialStep(state);
    state = { ...state, lastTransitionTrigger: 'ui' };

    if (state.currentStep !== previousStep) {
      const reward = stepReward(previousStep);
      essenceState = awardEssence(essenceState, reward);
      state = { ...state, essenceBalance: essenceState.balance };
      celebrateTutorialAdvance(root);
    }

    state = unlockCards(state);

    if (state.currentStep === 'complete') {
      markTutorialComplete();
      clearCard(root);
    }

    render();
  };

  if (nextButton instanceof HTMLButtonElement) {
    nextButton.addEventListener('click', proceedStep, { signal });
  }

  if (skipButton instanceof HTMLButtonElement) {
    skipButton.addEventListener(
      'click',
      () => {
        state = {
          ...state,
          currentStep: 'complete',
          completedSteps: TUTORIAL_STEPS.map((step) => step.id),
        };
        markTutorialComplete();
        clearCard(root);
        render();
      },
      { signal },
    );
  }

  const onSpinMessage = (event: MessageEvent): void => {
    const parsed = parseSpinSettledBridgeEvent(event.data);
    if (parsed === null) {
      return;
    }

    const previousStep = state.currentStep;
    state = recordSpin(state);

    if (state.currentStep === 'card-unlock') {
      state = unlockCards(state);
    }

    if (state.currentStep !== previousStep) {
      state = { ...state, lastTransitionTrigger: 'spin' };
      render();
      celebrateTutorialAdvance(root);
      return;
    }

    syncRootDatasets(root, state, essenceState.balance);
  };

  window.addEventListener('message', onSpinMessage, { signal });
  document.addEventListener('astro:before-swap', () => activeController?.abort(), {
    once: true,
    signal,
  });

  render();
}
