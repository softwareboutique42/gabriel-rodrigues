import { evaluateCenterPayline } from './paylines.ts';
import { calculatePayouts, DEFAULT_PAYTABLE, getTotalPayoutUnits } from './payout.ts';
import { resolveSpin } from './spin-resolver.ts';
import type { ReelConfig, RoundResult, SlotSymbol } from './types.ts';

export const DEFAULT_REEL_CONFIG: ReelConfig = {
  reels: [
    ['A', 'B', 'C', 'D', 'E', 'B', 'C', 'D'],
    ['B', 'C', 'D', 'E', 'A', 'C', 'D', 'A'],
    ['C', 'D', 'E', 'A', 'B', 'D', 'A', 'B'],
  ],
  visibleRows: 3,
};

export interface ResolveRoundInput {
  baseSeed: string;
  spinIndex: number;
  config?: ReelConfig;
}

export function resolveRound({
  baseSeed,
  spinIndex,
  config = DEFAULT_REEL_CONFIG,
}: ResolveRoundInput): RoundResult {
  const seed = `${baseSeed}:${spinIndex}`;
  const { stops, matrix } = resolveSpin(config, seed);
  const winLines = calculatePayouts(evaluateCenterPayline(matrix), DEFAULT_PAYTABLE);
  const totalPayoutUnits = getTotalPayoutUnits(winLines);

  return {
    seed,
    spinIndex,
    stops,
    matrix,
    paylinesChecked: 1,
    winLines,
    totalPayoutUnits,
    outcome: totalPayoutUnits > 0 ? 'win' : 'loss',
  };
}

// Easter egg: guaranteed jackpot result (all reels land on 'A')
export function resolveGuaranteedWin(seed: string, spinIndex: number): RoundResult {
  const sym: SlotSymbol = 'A';
  const matrix: SlotSymbol[][] = [[sym, sym, sym], [sym, sym, sym], [sym, sym, sym]];
  const payoutUnits = DEFAULT_PAYTABLE[sym] ?? 12;
  return {
    seed,
    spinIndex,
    stops: [0, 0, 0],
    matrix,
    paylinesChecked: 1,
    winLines: [{ lineId: 'center-row', symbol: sym, count: 3, payoutUnits }],
    totalPayoutUnits: payoutUnits,
    outcome: 'win',
  };
}
