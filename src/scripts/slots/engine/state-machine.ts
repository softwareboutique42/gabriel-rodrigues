import type { EngineState, StateTransitionEvent } from './types.ts';

export function createInitialEngineState(): EngineState {
  return {
    status: 'idle',
    spinIndex: 0,
    lastResult: null,
  };
}

export function transitionEngineState(
  state: EngineState,
  event: StateTransitionEvent,
): EngineState {
  if (event.type === 'RESET_TO_IDLE') {
    return {
      ...state,
      status: 'idle',
    };
  }

  if (event.type === 'SPIN_REQUESTED') {
    if (state.status === 'spinning') return state;
    return {
      ...state,
      status: 'spinning',
      spinIndex: state.spinIndex + 1,
    };
  }

  if (event.type === 'SPIN_RESOLVED') {
    if (state.status !== 'spinning' || !event.result) return state;
    return {
      ...state,
      status: 'result',
      lastResult: event.result,
    };
  }

  return state;
}
