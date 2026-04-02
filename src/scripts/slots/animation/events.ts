import type { RoundResult } from '../engine/types.ts';

export type SlotsVisualEventType = 'spin-accepted' | 'spin-resolved' | 'spin-blocked';

export interface SpinAcceptedVisualEvent {
  type: 'spin-accepted';
  spinIndex: number;
  baseSeed: string;
  bet: number;
  balanceAfterDebit: number;
}

export interface SpinResolvedVisualEvent {
  type: 'spin-resolved';
  spinIndex: number;
  seed: string;
  outcome: RoundResult['outcome'];
  totalPayoutUnits: number;
  stops: number[];
}

export interface SpinBlockedVisualEvent {
  type: 'spin-blocked';
  spinIndex: number;
  reason: 'spinning' | 'insufficient';
  balance: number;
  bet: number;
}

export type SlotsVisualEvent =
  | SpinAcceptedVisualEvent
  | SpinResolvedVisualEvent
  | SpinBlockedVisualEvent;

type VisualEventListener = (event: Readonly<SlotsVisualEvent>) => void;

export interface SlotsVisualEventStore {
  emit: (event: SlotsVisualEvent) => void;
  subscribe: (listener: VisualEventListener) => () => void;
  snapshot: () => ReadonlyArray<Readonly<SlotsVisualEvent>>;
}

function deepFreeze<T>(value: T): T {
  if (!value || typeof value !== 'object' || Object.isFrozen(value)) return value;

  const record = value as Record<string, unknown>;
  for (const key of Object.keys(record)) {
    const nested = record[key];
    if (nested && typeof nested === 'object') {
      deepFreeze(nested);
    }
  }

  return Object.freeze(value);
}

function immutableEvent(event: SlotsVisualEvent): Readonly<SlotsVisualEvent> {
  if (event.type === 'spin-resolved') {
    return deepFreeze({
      ...event,
      stops: [...event.stops],
    });
  }
  return deepFreeze({ ...event });
}

export function createSlotsVisualEventStore(): SlotsVisualEventStore {
  const history: Array<Readonly<SlotsVisualEvent>> = [];
  const listeners = new Set<VisualEventListener>();

  return {
    emit(event) {
      const snapshot = immutableEvent(event);
      history.push(snapshot);
      for (const listener of listeners) {
        listener(snapshot);
      }
    },
    subscribe(listener) {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
    snapshot() {
      return [...history];
    },
  };
}

export function createSpinAcceptedVisualEvent(
  input: Omit<SpinAcceptedVisualEvent, 'type'>,
): SpinAcceptedVisualEvent {
  return {
    type: 'spin-accepted',
    ...input,
  };
}

export function createSpinResolvedVisualEvent(
  input: Omit<SpinResolvedVisualEvent, 'type'>,
): SpinResolvedVisualEvent {
  return {
    type: 'spin-resolved',
    ...input,
  };
}

export function createSpinBlockedVisualEvent(
  input: Omit<SpinBlockedVisualEvent, 'type'>,
): SpinBlockedVisualEvent {
  return {
    type: 'spin-blocked',
    ...input,
  };
}
