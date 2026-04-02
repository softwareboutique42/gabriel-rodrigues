import test from 'node:test';
import assert from 'node:assert/strict';

const {
  createInitialEconomyState,
  debitForRound,
  settleRound,
  getSpinBlockReason,
} = await import('../src/scripts/slots/economy.ts');

test('SLOT-12: economy loop debits before spin and settles payout after result', () => {
  const initial = createInitialEconomyState();
  const debited = debitForRound(initial);
  assert.equal(debited.balance, initial.balance - initial.bet);

  const settled = settleRound(debited, 3);
  assert.equal(settled.balance, debited.balance + initial.bet * 3);
});

test('SLOT-12: insufficient-credit attempt is blocked and does not create negative balance', () => {
  const lowBalance = {
    ...createInitialEconomyState(),
    balance: 1,
    bet: 2,
  };

  const reason = getSpinBlockReason(lowBalance, 'idle');
  assert.equal(reason, 'insufficient');

  const afterDebitAttempt = debitForRound(lowBalance);
  assert.equal(afterDebitAttempt.balance, 1);
  assert.ok(afterDebitAttempt.balance >= 0);
});
