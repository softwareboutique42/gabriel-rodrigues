import test from 'node:test';
import assert from 'node:assert/strict';

const {
  createSlotsVisualEventStore,
  createSpinAcceptedVisualEvent,
  createSpinBlockedVisualEvent,
  createSpinResolvedVisualEvent,
} = await import('../src/scripts/slots/animation/events.ts');

test('ANIM-10: visual event snapshots are immutable and preserve sequence order', () => {
  const store = createSlotsVisualEventStore();

  const accepted = createSpinAcceptedVisualEvent({
    spinIndex: 1,
    baseSeed: 'slots-phase-13-en',
    bet: 2,
    balanceAfterDebit: 38,
  });
  store.emit(accepted);

  const resolved = createSpinResolvedVisualEvent({
    spinIndex: 1,
    seed: 'slots-phase-13-en:1',
    outcome: 'loss',
    totalPayoutUnits: 0,
    stops: [0, 1, 2],
  });
  store.emit(resolved);

  const blocked = createSpinBlockedVisualEvent({
    spinIndex: 2,
    reason: 'insufficient',
    balance: 0,
    bet: 10,
  });
  store.emit(blocked);

  assert.deepEqual(
    store.snapshot().map((event) => event.type),
    ['spin-accepted', 'spin-resolved', 'spin-blocked'],
  );

  const [firstSnapshot] = store.snapshot();
  assert.throws(() => {
    // @ts-expect-error read-only contract check
    firstSnapshot.type = 'spin-blocked';
  });
});
