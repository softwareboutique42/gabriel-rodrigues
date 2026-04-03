import type { EssenceState } from './types.ts';

export function createInitialEssenceState(): EssenceState {
  return { balance: 0, totalEarned: 0 };
}

export function awardEssence(state: EssenceState, amount: number): EssenceState {
  return {
    balance: state.balance + amount,
    totalEarned: state.totalEarned + amount,
  };
}

export function spendEssence(state: EssenceState, amount: number): EssenceState {
  if (state.balance < amount) {
    throw new Error('Insufficient essence');
  }

  return {
    ...state,
    balance: state.balance - amount,
  };
}
