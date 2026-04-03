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

function stepReward(stepId: TutorialStepId): number {
  return TUTORIAL_STEPS.find((step) => step.id === stepId)?.essenceReward ?? 0;
}

function renderDialogue(zone: HTMLElement, stepId: TutorialStepId, lang: 'en' | 'pt'): void {
  const messages = getDialogue(stepId, lang);
  zone.replaceChildren();

  for (const message of messages) {
    const entry = document.createElement('div');
    entry.className = 'hud-outline-subtle p-3';
    entry.dataset.casinocraftzDialogueRole = message.role;

    const role = document.createElement('p');
    role.className = 'font-mono text-[11px] uppercase tracking-wider text-cyan mb-1';
    role.textContent = message.role;

    const text = document.createElement('p');
    text.className = 'text-sm text-text-secondary';
    text.textContent = message.text;

    entry.append(role, text);
    zone.append(entry);
  }
}

function syncRootDatasets(root: HTMLElement, state: TutorialState, essenceBalance: number): void {
  root.dataset.casinocraftzTutorialStep = state.currentStep;
  root.dataset.casinocraftzEssence = String(essenceBalance);

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
    cardRoot.className = 'hud-outline-subtle p-3';
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

    cardRoot.append(label, description, button);
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
    renderDialogue(dialogueZone, state.currentStep, lang);
    renderCards(root, cardsZone, state, (cardId) => {
      applyCard(cardId, root);
      state = {
        ...state,
        activeCard: cardId,
      };
      syncRootDatasets(root, state, essenceState.balance);
    });
  };

  const proceedStep = (): void => {
    const previousStep = state.currentStep;
    state = advanceTutorialStep(state);

    if (state.currentStep !== previousStep) {
      const reward = stepReward(previousStep);
      essenceState = awardEssence(essenceState, reward);
      state = { ...state, essenceBalance: essenceState.balance };
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
      render();
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
