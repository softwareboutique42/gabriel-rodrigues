import { resolveRound } from './engine/round.ts';
import { createInitialEngineState, transitionEngineState } from './engine/state-machine.ts';
import {
  adjustBet,
  createInitialEconomyState,
  debitForRound,
  getSpinBlockReason,
  settleRound,
} from './economy.ts';
import { saveWallet } from '../casinocraftz/wallet.ts';
import type { EngineState } from './engine/types.ts';
import {
  createSpinAcceptedVisualEvent,
  createSpinBlockedVisualEvent,
  createSpinResolvedVisualEvent,
  createSlotsVisualEventStore,
  type SlotsVisualEventStore,
} from './animation/events.ts';
import { ANALYTICS_EVENT_NAMES, emitAnalyticsEvent } from '../analytics/events.ts';
import { getSlotSymbolLabel } from './symbols.ts';

const SPIN_DELAY_MS = 240;
const LANDING_BOUNCE_MS = 420;
const BALANCE_TICK_MIN_MS = 280;
const BALANCE_TICK_MAX_MS = 900;
const REEL_LANDING_STAGGER_MS = 64;
const WIN_CRESCENDO_BASE_MS = 720;

export interface SlotsControllerMount {
  visualEvents: SlotsVisualEventStore;
}

function setText(id: string, value: string): void {
  const el = document.getElementById(id);
  if (el) el.textContent = value;
}

function animateNumericText(id: string, target: number, durationMs: number): void {
  const el = document.getElementById(id);
  if (!el) return;

  const initial = Number.parseInt(el.textContent ?? '', 10);
  if (!Number.isFinite(initial) || initial === target) {
    el.textContent = String(target);
    return;
  }

  const start = performance.now();
  const diff = target - initial;
  el.classList.add('slots-meter__value--ticking');

  const tick = (now: number) => {
    const elapsed = Math.min(1, (now - start) / durationMs);
    const eased = 1 - Math.pow(1 - elapsed, 4);
    const current = Math.round(initial + diff * eased);
    el.textContent = String(current);
    if (elapsed < 1) {
      window.requestAnimationFrame(tick);
    } else {
      el.classList.remove('slots-meter__value--ticking');
    }
  };

  window.requestAnimationFrame(tick);
}

function applySpinCadence(root: HTMLElement): void {
  const frame = root.querySelector<HTMLElement>('[data-slots-reel-frame]');
  if (frame) {
    frame.classList.add('slots-stage--spin-cadence');
  }

  const windows = Array.from(root.querySelectorAll<HTMLElement>('[data-slots-reel-window]'));
  windows.forEach((windowEl) => windowEl.classList.add('slots-reel-window--spinning'));
}

function clearSpinCadence(root: HTMLElement): void {
  const frame = root.querySelector<HTMLElement>('[data-slots-reel-frame]');
  if (frame) {
    frame.classList.remove('slots-stage--spin-cadence');
  }

  const windows = Array.from(root.querySelectorAll<HTMLElement>('[data-slots-reel-window]'));
  windows.forEach((windowEl) => windowEl.classList.remove('slots-reel-window--spinning'));
}

function triggerReelLandingBounce(root: HTMLElement): void {
  const reducedMotion = root.dataset.slotsAnimReducedMotion === 'true';
  const minimalIntensity = root.dataset.slotsAnimIntensity === 'minimal';
  if (reducedMotion || minimalIntensity) {
    return;
  }

  const windows = Array.from(root.querySelectorAll<HTMLElement>('[data-slots-reel-window]'));
  windows.forEach((windowEl, index) => {
    windowEl.classList.remove('slots-reel-window--landed');
    window.setTimeout(() => {
      windowEl.classList.remove('slots-reel-window--landed');
      void windowEl.offsetWidth;
      windowEl.classList.add('slots-reel-window--landed');
    }, index * REEL_LANDING_STAGGER_MS);
  });

  window.setTimeout(
    () => {
      windows.forEach((windowEl) => windowEl.classList.remove('slots-reel-window--landed'));
    },
    LANDING_BOUNCE_MS + (windows.length - 1) * REEL_LANDING_STAGGER_MS,
  );
}

function triggerWinCrescendo(root: HTMLElement, payout: number): void {
  const reducedMotion = root.dataset.slotsAnimReducedMotion === 'true';
  const minimalIntensity = root.dataset.slotsAnimIntensity === 'minimal';
  if (reducedMotion || minimalIntensity) {
    return;
  }

  const normalized = Math.max(0.35, Math.min(1, payout / 12));
  root.dataset.slotsWinCrescendo = 'true';
  root.style.setProperty('--slots-win-intensity', normalized.toFixed(2));

  const duration = WIN_CRESCENDO_BASE_MS + Math.round(normalized * 380);
  window.setTimeout(() => {
    root.dataset.slotsWinCrescendo = 'false';
    root.style.removeProperty('--slots-win-intensity');
  }, duration);
}

function getMessage(root: HTMLElement, key: string, fallback: string): string {
  const value = root.dataset[key as keyof DOMStringMap];
  return value ?? fallback;
}

function getLocaleFromSeed(baseSeed: string): 'en' | 'pt' {
  return baseSeed.endsWith('-pt') ? 'pt' : 'en';
}

function renderReelWindows(root: HTMLElement, state: EngineState): void {
  const windows = Array.from(root.querySelectorAll<HTMLElement>('[data-slots-reel-window]'));
  if (windows.length === 0) {
    return;
  }

  const symbols = state.lastResult?.matrix?.[1] ?? ['A', 'B', 'C'];
  windows.forEach((windowEl, index) => {
    const symbol = symbols[index] ?? 'A';
    windowEl.dataset.slotsSymbol = symbol;
    const label = getSlotSymbolLabel(symbol);
    windowEl.setAttribute('aria-label', `Reel symbol ${label}`);
    windowEl.setAttribute('title', label);
    const span = windowEl.querySelector('span');
    if (span) {
      span.textContent = label;
    }
  });
}

function renderState(
  root: HTMLElement,
  state: EngineState,
  balance: number,
  bet: number,
  feedbackKey: string,
): void {
  root.dataset.slotsState = feedbackKey === 'insufficient' ? 'insufficient' : state.status;
  root.dataset.slotsBalance = String(balance);
  root.dataset.slotsBet = String(bet);
  renderReelWindows(root, state);

  const button = document.getElementById('slots-spin-button') as HTMLButtonElement | null;
  if (button) {
    button.disabled = state.status === 'spinning' || balance < bet;
  }

  const decBetButton = document.getElementById('slots-bet-dec') as HTMLButtonElement | null;
  if (decBetButton) decBetButton.disabled = state.status === 'spinning';
  const incBetButton = document.getElementById('slots-bet-inc') as HTMLButtonElement | null;
  if (incBetButton) incBetButton.disabled = state.status === 'spinning';

  const shouldAnimateBalance =
    feedbackKey === 'result' &&
    state.lastResult?.outcome === 'win' &&
    state.lastResult.totalPayoutUnits > 0;

  if (shouldAnimateBalance) {
    const payout = state.lastResult?.totalPayoutUnits ?? 0;
    const dynamicDuration = Math.max(
      BALANCE_TICK_MIN_MS,
      Math.min(BALANCE_TICK_MAX_MS, Math.round(240 + payout * 58)),
    );
    animateNumericText('slots-balance-value', balance, dynamicDuration);
  } else {
    setText('slots-balance-value', String(balance));
  }
  setText('slots-bet-value', String(bet));

  const statusMap: Record<string, string> = {
    idle: getMessage(root, 'slotsMsgIdle', 'Idle'),
    spinning: getMessage(root, 'slotsMsgSpinning', 'Spinning'),
    result: getMessage(root, 'slotsMsgResult', 'Result ready'),
    insufficient: getMessage(root, 'slotsMsgInsufficient', 'Insufficient credits'),
    blockedSpinning: getMessage(root, 'slotsMsgBlockedSpinning', 'Wait for current spin to finish'),
  };

  setText(
    'slots-gameplay-status',
    `${getMessage(root, 'slotsLabelState', 'State')}: ${statusMap[feedbackKey]}`,
  );

  const result = state.lastResult;
  if (result) {
    root.dataset.slotsOutcome = result.outcome;
    root.dataset.slotsPayout = String(result.totalPayoutUnits);
    setText(
      'slots-gameplay-outcome',
      `${getMessage(root, 'slotsLabelOutcome', 'Outcome')}: ${result.outcome} (${result.totalPayoutUnits})`,
    );
    setText('slots-gameplay-seed', `${getMessage(root, 'slotsLabelSeed', 'Seed')}: ${result.seed}`);

    const pre = document.getElementById('slots-round-result');
    if (pre) {
      pre.textContent = JSON.stringify(result, null, 2);
    }
    return;
  }

  setText(
    'slots-gameplay-outcome',
    `${getMessage(root, 'slotsLabelOutcome', 'Outcome')}: ${getMessage(root, 'slotsMsgPending', 'pending')}`,
  );
  setText('slots-gameplay-seed', `${getMessage(root, 'slotsLabelSeed', 'Seed')}: -`);
}

export function mountSlotsController(root: HTMLElement, signal: AbortSignal): SlotsControllerMount {
  let state = createInitialEngineState();
  let economy = createInitialEconomyState();
  let feedbackKey = 'idle';
  const visualEvents = createSlotsVisualEventStore();
  renderState(root, state, economy.balance, economy.bet, feedbackKey);

  const spinButton = document.getElementById('slots-spin-button') as HTMLButtonElement | null;
  if (!spinButton) return { visualEvents };
  const decBetButton = document.getElementById('slots-bet-dec') as HTMLButtonElement | null;
  const incBetButton = document.getElementById('slots-bet-inc') as HTMLButtonElement | null;

  const baseSeed = root.getAttribute('data-slots-seed') ?? 'slots-phase-13';
  const locale = getLocaleFromSeed(baseSeed);
  const route = `/${locale}/slots/`;

  const onAdjustBet = (delta: number) => {
    economy = adjustBet(economy, delta);
    feedbackKey = 'idle';
    renderState(root, state, economy.balance, economy.bet, feedbackKey);
  };

  const onSpin = () => {
    const blocked = getSpinBlockReason(economy, state.status);
    if (blocked) {
      visualEvents.emit(
        createSpinBlockedVisualEvent({
          spinIndex: blocked === 'spinning' ? state.spinIndex : state.spinIndex + 1,
          reason: blocked,
          balance: economy.balance,
          bet: economy.bet,
        }),
      );
      emitAnalyticsEvent({
        name: ANALYTICS_EVENT_NAMES.SLOTS_SPIN_BLOCKED,
        route,
        locale,
        surface: 'slots',
        payload: {
          blocked_reason: blocked,
          spin_index: blocked === 'spinning' ? state.spinIndex : state.spinIndex + 1,
          balance: economy.balance,
          bet: economy.bet,
        },
      });
      feedbackKey = blocked === 'insufficient' ? 'insufficient' : 'blockedSpinning';
      renderState(root, state, economy.balance, economy.bet, feedbackKey);
      return;
    }

    const requested = transitionEngineState(state, { type: 'SPIN_REQUESTED' });
    if (requested === state) return;
    state = requested;
    economy = debitForRound(economy);
    applySpinCadence(root);
    emitAnalyticsEvent({
      name: ANALYTICS_EVENT_NAMES.SLOTS_SPIN_ATTEMPT,
      route,
      locale,
      surface: 'slots',
      payload: {
        spin_index: state.spinIndex,
        bet: economy.bet,
        balance_after_debit: economy.balance,
      },
    });
    visualEvents.emit(
      createSpinAcceptedVisualEvent({
        spinIndex: state.spinIndex,
        baseSeed,
        bet: economy.bet,
        balanceAfterDebit: economy.balance,
      }),
    );
    feedbackKey = 'spinning';
    renderState(root, state, economy.balance, economy.bet, feedbackKey);

    const activeSpin = state.spinIndex;
    window.setTimeout(() => {
      const result = resolveRound({ baseSeed, spinIndex: activeSpin });
      state = transitionEngineState(state, { type: 'SPIN_RESOLVED', result });
      economy = settleRound(economy, result.totalPayoutUnits);
      clearSpinCadence(root);
      triggerReelLandingBounce(root);
      if (result.outcome === 'win' && result.totalPayoutUnits > 0) {
        triggerWinCrescendo(root, result.totalPayoutUnits);
      }
      saveWallet({ balance: economy.balance });
      emitAnalyticsEvent({
        name: ANALYTICS_EVENT_NAMES.SLOTS_SPIN_RESOLVED,
        route,
        locale,
        surface: 'slots',
        payload: {
          spin_index: result.spinIndex,
          outcome: result.outcome,
          payout: result.totalPayoutUnits,
        },
      });
      visualEvents.emit(
        createSpinResolvedVisualEvent({
          spinIndex: result.spinIndex,
          seed: result.seed,
          outcome: result.outcome,
          totalPayoutUnits: result.totalPayoutUnits,
          stops: result.stops,
        }),
      );
      feedbackKey = 'result';
      renderState(root, state, economy.balance, economy.bet, feedbackKey);
    }, SPIN_DELAY_MS);
  };

  spinButton.addEventListener('click', onSpin, { signal });
  if (decBetButton) decBetButton.addEventListener('click', () => onAdjustBet(-1), { signal });
  if (incBetButton) incBetButton.addEventListener('click', () => onAdjustBet(1), { signal });

  return { visualEvents };
}
