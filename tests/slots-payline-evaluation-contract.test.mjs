import test from 'node:test';
import assert from 'node:assert/strict';

const { evaluateCenterPayline } = await import('../src/scripts/slots/engine/paylines.ts');
const {
  calculatePayouts,
  DEFAULT_PAYTABLE,
  getTotalPayoutUnits,
} = await import('../src/scripts/slots/engine/payout.ts');

test('SLOT-11: center-row three-of-a-kind yields deterministic win payout', () => {
  const winMatrix = [
    ['C', 'D', 'E'],
    ['A', 'A', 'A'],
    ['E', 'B', 'D'],
  ];

  const wins = evaluateCenterPayline(winMatrix);
  const settled = calculatePayouts(wins, DEFAULT_PAYTABLE);
  const total = getTotalPayoutUnits(settled);

  assert.equal(settled.length, 1);
  assert.equal(settled[0].lineId, 'center-row');
  assert.equal(settled[0].symbol, 'A');
  assert.equal(settled[0].count, 3);
  assert.equal(settled[0].payoutUnits, DEFAULT_PAYTABLE.A);
  assert.equal(total, DEFAULT_PAYTABLE.A);
});

test('SLOT-11: non-matching center row yields loss with zero payout units', () => {
  const lossMatrix = [
    ['A', 'D', 'E'],
    ['A', 'B', 'C'],
    ['E', 'B', 'D'],
  ];

  const wins = evaluateCenterPayline(lossMatrix);
  const settled = calculatePayouts(wins, DEFAULT_PAYTABLE);
  const total = getTotalPayoutUnits(settled);

  assert.equal(wins.length, 0);
  assert.equal(settled.length, 0);
  assert.equal(total, 0);
});
