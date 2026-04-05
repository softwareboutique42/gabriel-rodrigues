import type { SlotSymbol } from './engine/types.ts';

export const SLOT_SYMBOL_LABELS: Record<SlotSymbol, string> = {
  A: 'ANTIMATTER',
  B: 'CALIFORNIUM',
  C: 'DIAMOND',
  D: 'GOLD',
  E: 'TRITIUM',
};

export function getSlotSymbolLabel(symbol: SlotSymbol): string {
  return SLOT_SYMBOL_LABELS[symbol];
}
