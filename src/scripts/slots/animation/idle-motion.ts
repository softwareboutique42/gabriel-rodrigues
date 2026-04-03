import type { SlotsVisualEvent } from './events.ts';

export type IdleMotionState = 'idle-pulse' | 'active-transition';

export interface IdleMotionSnapshot {
  state: IdleMotionState;
  spinIndex: number | null;
}

export interface IdleMotionModel {
  onVisualEvent: (event: Readonly<SlotsVisualEvent>) => void;
  snapshot: () => IdleMotionSnapshot;
}

export function createIdleMotionModel(): IdleMotionModel {
  let snapshot: IdleMotionSnapshot = {
    state: 'idle-pulse',
    spinIndex: null,
  };

  return {
    onVisualEvent(event) {
      if (event.type === 'spin-accepted') {
        snapshot = {
          state: 'active-transition',
          spinIndex: event.spinIndex,
        };
        return;
      }

      snapshot = {
        state: 'idle-pulse',
        spinIndex: event.spinIndex,
      };
    },
    snapshot() {
      return { ...snapshot };
    },
  };
}
