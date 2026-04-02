import { evaluateCenterPayline } from './paylines.ts';
import { calculatePayouts, DEFAULT_PAYTABLE, getTotalPayoutUnits } from './payout.ts';
import { resolveSpin } from './spin-resolver.ts';
import type { ReelConfig, RoundResult } from './types.ts';

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
