import type { SlotSymbol } from '../engine/types.ts';

export const SYMBOL_FRAME_MAP: Record<SlotSymbol, string> = {
  A: 'symbol-a',
  B: 'symbol-b',
  C: 'symbol-c',
  D: 'symbol-d',
  E: 'symbol-e',
};

export const REQUIRED_SYMBOL_FRAME_KEYS = Object.freeze(Object.values(SYMBOL_FRAME_MAP));

export function getFrameKeyForSymbol(symbol: SlotSymbol): string {
  return SYMBOL_FRAME_MAP[symbol];
}

export function snapshotSymbolFrameMap(): Readonly<Record<SlotSymbol, string>> {
  return Object.freeze({ ...SYMBOL_FRAME_MAP });
}
