import type { SlotsVisualEvent } from './events.ts';

export type ReelTimelinePhase = 'idle' | 'spin-up' | 'sustain' | 'stop' | 'blocked';

export interface ReelTimelineSnapshot {
  phase: ReelTimelinePhase;
  activeSpinIndex: number | null;
  lastResolvedSpinIndex: number | null;
  blockedReason: 'spinning' | 'insufficient' | null;
}

export interface ReelTimelineModel {
  onVisualEvent: (event: Readonly<SlotsVisualEvent>) => void;
  advanceToSustain: (spinIndex: number) => void;
  snapshot: () => ReelTimelineSnapshot;
}

export function createReelTimelineModel(): ReelTimelineModel {
  let snapshot: ReelTimelineSnapshot = {
    phase: 'idle',
    activeSpinIndex: null,
    lastResolvedSpinIndex: null,
    blockedReason: null,
  };

  return {
    onVisualEvent(event) {
      if (event.type === 'spin-accepted') {
        snapshot = {
          phase: 'spin-up',
          activeSpinIndex: event.spinIndex,
          lastResolvedSpinIndex: snapshot.lastResolvedSpinIndex,
          blockedReason: null,
        };
        return;
      }

      if (event.type === 'spin-resolved') {
        snapshot = {
          phase: 'stop',
          activeSpinIndex: null,
          lastResolvedSpinIndex: event.spinIndex,
          blockedReason: null,
        };
        return;
      }

      snapshot = {
        ...snapshot,
        phase: 'blocked',
        blockedReason: event.reason,
      };
    },
    advanceToSustain(spinIndex) {
      if (snapshot.phase !== 'spin-up' || snapshot.activeSpinIndex !== spinIndex) return;
      snapshot = {
        ...snapshot,
        phase: 'sustain',
      };
    },
    snapshot() {
      return { ...snapshot };
    },
  };
}
