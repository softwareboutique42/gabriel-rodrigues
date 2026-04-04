import test from 'node:test';
import assert from 'node:assert/strict';

const { createInitialEconomyState, adjustBet, getSpinBlockReason } =
  await import('../src/scripts/slots/economy.ts');

test('UX-10: spin is blocked during spinning state even with enough balance', () => {
  const state = createInitialEconomyState();
  assert.equal(getSpinBlockReason(state, 'spinning'), 'spinning');
});

test('UX-10: spin is blocked when balance is below current bet', () => {
  const state = { ...createInitialEconomyState(), balance: 1, bet: 4 };
  assert.equal(getSpinBlockReason(state, 'idle'), 'insufficient');
});

test('UX-10: bet adjustments stay within configured min/max guardrails', () => {
  const base = createInitialEconomyState();
  const clampedDown = adjustBet({ ...base, bet: base.minBet }, -5);
  const clampedUp = adjustBet({ ...base, bet: base.maxBet }, 5);

  assert.equal(clampedDown.bet, base.minBet);
  assert.equal(clampedUp.bet, base.maxBet);
});
