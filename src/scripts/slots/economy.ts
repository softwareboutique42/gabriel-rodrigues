import type { SlotsRoundState } from './engine/types.ts';
import { loadWallet } from '../casinocraftz/wallet.ts';

export interface EconomyState {
  balance: number;
  bet: number;
  minBet: number;
}

export type SpinBlockReason = 'spinning' | 'insufficient' | null;

export function createInitialEconomyState(): EconomyState {
  return {
    balance: loadWallet().balance,
    bet: 2,
    minBet: 1,
  };
}

export function adjustBet(state: EconomyState, delta: number): EconomyState {
  const nextBet = Math.min(state.balance, Math.max(state.minBet, state.bet + delta));
  return {
    ...state,
    bet: nextBet,
  };
}

export function getSpinBlockReason(
  state: EconomyState,
  roundState: SlotsRoundState,
): SpinBlockReason {
  if (roundState === 'spinning') return 'spinning';
  if (state.balance < state.bet) return 'insufficient';
  return null;
}

export function debitForRound(state: EconomyState): EconomyState {
  if (state.balance < state.bet) return state;
  return {
    ...state,
    balance: state.balance - state.bet,
  };
}

export function settleRound(state: EconomyState, payoutUnits: number): EconomyState {
  return {
    ...state,
    balance: state.balance + state.bet * payoutUnits,
  };
}
