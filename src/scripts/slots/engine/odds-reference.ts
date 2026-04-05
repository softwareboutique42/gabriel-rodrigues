import type { Paytable, ReelConfig, SlotSymbol } from './types.ts';

export interface SymbolOddsReferenceRow {
  symbol: SlotSymbol;
  payoutUnits: number;
  comboChance: number;
}

function countSymbolOccurrences(strip: readonly SlotSymbol[], symbol: SlotSymbol): number {
  let count = 0;
  for (const value of strip) {
    if (value === symbol) count += 1;
  }
  return count;
}

export function buildThreeOfKindOddsReference(
  config: ReelConfig,
  paytable: Paytable,
): SymbolOddsReferenceRow[] {
  const symbols = Object.keys(paytable) as SlotSymbol[];

  return symbols
    .map((symbol) => {
      const comboChance = config.reels.reduce((acc, strip) => {
        if (strip.length === 0) return 0;
        const frequency = countSymbolOccurrences(strip, symbol) / strip.length;
        return acc * frequency;
      }, 1);

      return {
        symbol,
        payoutUnits: paytable[symbol] ?? 0,
        comboChance,
      };
    })
    .sort((a, b) => b.payoutUnits - a.payoutUnits);
}
