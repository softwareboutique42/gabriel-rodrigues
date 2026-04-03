import type { SlotSymbol } from '../engine/types.ts';
import type { SlotsVisualEvent } from './events.ts';

export type SymbolAnimationState = 'idle' | 'spin' | 'win-react';

export interface SymbolStatesSnapshot {
  spinIndex: number | null;
  symbols: Readonly<Record<SlotSymbol, SymbolAnimationState>>;
}

export interface SymbolStatesModel {
  onVisualEvent: (event: Readonly<SlotsVisualEvent>) => void;
  snapshot: () => SymbolStatesSnapshot;
}

function createSymbolStateRecord(
  state: SymbolAnimationState,
): Readonly<Record<SlotSymbol, SymbolAnimationState>> {
  return Object.freeze({
    A: state,
    B: state,
    C: state,
    D: state,
    E: state,
  });
}

export function createIdleSymbolStates(): Readonly<Record<SlotSymbol, SymbolAnimationState>> {
  return createSymbolStateRecord('idle');
}

export function createSymbolStatesModel(): SymbolStatesModel {
  let snapshot: SymbolStatesSnapshot = {
    spinIndex: null,
    symbols: createIdleSymbolStates(),
  };

  return {
    onVisualEvent(event) {
      if (event.type === 'spin-accepted') {
        snapshot = {
          spinIndex: event.spinIndex,
          symbols: createSymbolStateRecord('spin'),
        };
        return;
      }

      if (event.type === 'spin-resolved') {
        snapshot = {
          spinIndex: event.spinIndex,
          symbols: createSymbolStateRecord(event.outcome === 'win' ? 'win-react' : 'idle'),
        };
        return;
      }

      snapshot = {
        spinIndex: event.spinIndex,
        symbols: createIdleSymbolStates(),
      };
    },
    snapshot() {
      return {
        spinIndex: snapshot.spinIndex,
        symbols: Object.freeze({ ...snapshot.symbols }),
      };
    },
  };
}
