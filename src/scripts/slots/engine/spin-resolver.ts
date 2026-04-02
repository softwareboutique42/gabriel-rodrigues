import { createSeededRng } from './rng.ts';
import type { ReelConfig, SlotSymbol } from './types.ts';

export interface SpinResolution {
  stops: number[];
  matrix: SlotSymbol[][];
}

function readVisibleWindow(strip: SlotSymbol[], stopIndex: number, rows: number): SlotSymbol[] {
  const out: SlotSymbol[] = [];
  for (let i = 0; i < rows; i += 1) {
    out.push(strip[(stopIndex + i) % strip.length]);
  }
  return out;
}

export function resolveSpin(config: ReelConfig, seed: string): SpinResolution {
  const rng = createSeededRng(seed);
  const stops: number[] = [];

  for (const strip of config.reels) {
    const stop = Math.floor(rng() * strip.length);
    stops.push(stop);
  }

  const matrix: SlotSymbol[][] = [];
  for (let row = 0; row < config.visibleRows; row += 1) {
    const rowSymbols: SlotSymbol[] = [];
    for (let reelIndex = 0; reelIndex < config.reels.length; reelIndex += 1) {
      const strip = config.reels[reelIndex];
      const window = readVisibleWindow(strip, stops[reelIndex], config.visibleRows);
      rowSymbols.push(window[row]);
    }
    matrix.push(rowSymbols);
  }

  return { stops, matrix };
}
