import test from 'node:test';
import assert from 'node:assert/strict';

const { createInitialEconomyState, debitForRound, settleRound, getSpinBlockReason } =
  await import('../src/scripts/slots/economy.ts');

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

test('QA-10: deterministic multi-round economy replay stays stable and non-negative', () => {
  const outcomes = [0, 3, 0, 2, 1];

  const runReplay = () => {
    let state = createInitialEconomyState();
    const checkpoints = [];

    for (const payoutUnits of outcomes) {
      const blocked = getSpinBlockReason(state, 'idle');
      assert.equal(blocked, null);

      state = debitForRound(state);
      assert.ok(state.balance >= 0);

      state = settleRound(state, payoutUnits);
      assert.ok(state.balance >= 0);
      checkpoints.push(state.balance);
    }

    return checkpoints;
  };

  const first = runReplay();
  const second = runReplay();

  assert.deepEqual(first, second);
});
