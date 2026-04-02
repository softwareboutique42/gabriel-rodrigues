import type { SlotSymbol, WinLine } from './types.ts';

export function evaluateCenterPayline(matrix: SlotSymbol[][]): WinLine[] {
  if (!matrix.length) return [];
  const centerRow = matrix[Math.floor(matrix.length / 2)];
  if (!centerRow || !centerRow.length) return [];

  const first = centerRow[0];
  const allMatch = centerRow.every((symbol) => symbol === first);
  if (!allMatch) return [];

  return [
    {
      lineId: 'center-row',
      symbol: first,
      count: centerRow.length,
      payoutUnits: 0,
    },
  ];
}
