import { loadWallet, saveWallet } from '../wallet.ts';
import type { EssenceState } from './types.ts';

export function createInitialEssenceState(): EssenceState {
  const wallet = loadWallet();
  return { balance: wallet.balance, totalEarned: 0 };
}

export function awardEssence(state: EssenceState, amount: number): EssenceState {
  const next: EssenceState = {
    balance: state.balance + amount,
    totalEarned: state.totalEarned + amount,
  };
  saveWallet({ balance: next.balance });
  return next;
}

export function spendEssence(state: EssenceState, amount: number): EssenceState {
  if (state.balance < amount) {
    throw new Error('Insufficient essence');
  }

  const next: EssenceState = {
    ...state,
    balance: state.balance - amount,
  };
  saveWallet({ balance: next.balance });
  return next;
}
