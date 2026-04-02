import type { Paytable, WinLine } from './types.ts';

export const DEFAULT_PAYTABLE: Paytable = {
  A: 12,
  B: 8,
  C: 6,
  D: 4,
  E: 3,
};

export function calculatePayouts(winLines: WinLine[], paytable: Paytable): WinLine[] {
  return winLines.map((line) => {
    const unit = paytable[line.symbol] ?? 0;
    return {
      ...line,
      payoutUnits: unit,
    };
  });
}

export function getTotalPayoutUnits(winLines: WinLine[]): number {
  return winLines.reduce((sum, line) => sum + line.payoutUnits, 0);
}
