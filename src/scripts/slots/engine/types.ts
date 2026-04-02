export type SlotsRoundState = 'idle' | 'spinning' | 'result';

export type SlotSymbol = 'A' | 'B' | 'C' | 'D' | 'E';

export interface WinLine {
  lineId: string;
  symbol: SlotSymbol;
  count: number;
  payoutUnits: number;
}

export interface RoundResult {
  seed: string;
  spinIndex: number;
  stops: number[];
  matrix: SlotSymbol[][];
  paylinesChecked: number;
  winLines: WinLine[];
  totalPayoutUnits: number;
  outcome: 'win' | 'loss';
}

export interface EngineState {
  status: SlotsRoundState;
  spinIndex: number;
  lastResult: RoundResult | null;
}

export interface ReelConfig {
  reels: SlotSymbol[][];
  visibleRows: number;
}

export interface Paytable {
  [key: string]: number;
}

export interface StateTransitionEvent {
  type: 'SPIN_REQUESTED' | 'SPIN_RESOLVED' | 'RESET_TO_IDLE';
  result?: RoundResult;
}
