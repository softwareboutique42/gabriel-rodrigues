import type { SlotsVisualEvent } from './events.ts';

export type OutcomeFeedbackStatus = 'idle' | 'win' | 'loss';

export interface OutcomeFeedbackSnapshot {
  status: OutcomeFeedbackStatus;
  spinIndex: number | null;
}

export interface OutcomeFeedbackModel {
  onVisualEvent: (event: Readonly<SlotsVisualEvent>) => void;
  snapshot: () => OutcomeFeedbackSnapshot;
}

export function createOutcomeFeedbackModel(): OutcomeFeedbackModel {
  let snapshot: OutcomeFeedbackSnapshot = {
    status: 'idle',
    spinIndex: null,
  };

  return {
    onVisualEvent(event) {
      if (event.type !== 'spin-resolved') return;
      snapshot = {
        status: event.outcome,
        spinIndex: event.spinIndex,
      };
    },
    snapshot() {
      return { ...snapshot };
    },
  };
}
