import { resolveRound } from './engine/round.ts';
import { createInitialEngineState, transitionEngineState } from './engine/state-machine.ts';
import type { EngineState } from './engine/types.ts';

const SPIN_DELAY_MS = 240;

function setText(id: string, value: string): void {
  const el = document.getElementById(id);
  if (el) el.textContent = value;
}

function renderState(root: HTMLElement, state: EngineState): void {
  root.dataset.slotsState = state.status;

  const button = document.getElementById('slots-spin-button') as HTMLButtonElement | null;
  if (button) {
    button.disabled = state.status === 'spinning';
  }

  const result = state.lastResult;
  if (result) {
    root.dataset.slotsOutcome = result.outcome;
    root.dataset.slotsPayout = String(result.totalPayoutUnits);
    setText('slots-gameplay-status', `State: ${state.status}`);
    setText('slots-gameplay-outcome', `Outcome: ${result.outcome} (${result.totalPayoutUnits})`);
    setText('slots-gameplay-seed', `Seed: ${result.seed}`);

    const pre = document.getElementById('slots-round-result');
    if (pre) {
      pre.textContent = JSON.stringify(result, null, 2);
    }
    return;
  }

  setText('slots-gameplay-status', `State: ${state.status}`);
  setText('slots-gameplay-outcome', 'Outcome: pending');
  setText('slots-gameplay-seed', 'Seed: -');
}

export function mountSlotsController(root: HTMLElement, signal: AbortSignal): void {
  let state = createInitialEngineState();
  renderState(root, state);

  const spinButton = document.getElementById('slots-spin-button') as HTMLButtonElement | null;
  if (!spinButton) return;

  const baseSeed = root.getAttribute('data-slots-seed') ?? 'slots-phase-13';

  const onSpin = () => {
    const requested = transitionEngineState(state, { type: 'SPIN_REQUESTED' });
    if (requested === state) return;
    state = requested;
    renderState(root, state);

    const activeSpin = state.spinIndex;
    window.setTimeout(() => {
      const result = resolveRound({ baseSeed, spinIndex: activeSpin });
      state = transitionEngineState(state, { type: 'SPIN_RESOLVED', result });
      renderState(root, state);
    }, SPIN_DELAY_MS);
  };

  spinButton.addEventListener('click', onSpin, { signal });
}
