import test from 'node:test';
import assert from 'node:assert/strict';

const {
  createSpinAcceptedVisualEvent,
  createSpinResolvedVisualEvent,
  createSpinBlockedVisualEvent,
  createSlotsVisualEventStore,
} = await import('../src/scripts/slots/animation/events.ts');
const { createSymbolStatesModel } = await import('../src/scripts/slots/animation/symbol-states.ts');
const { mountSlotsAnimationRuntime } = await import('../src/scripts/slots/animation/runtime.ts');

test('SPRITE-11: symbol state model transitions deterministically across event sequence', () => {
  const model = createSymbolStatesModel();

  assert.deepEqual(model.snapshot().symbols, {
    A: 'idle',
    B: 'idle',
    C: 'idle',
    D: 'idle',
    E: 'idle',
  });

  model.onVisualEvent(
    createSpinAcceptedVisualEvent({
      spinIndex: 2,
      baseSeed: 'slots-phase-13-en',
      bet: 2,
      balanceAfterDebit: 38,
    }),
  );
  assert.equal(model.snapshot().symbols.A, 'spin');

  model.onVisualEvent(
    createSpinResolvedVisualEvent({
      spinIndex: 2,
      seed: 'slots-phase-13-en:2',
      outcome: 'win',
      totalPayoutUnits: 5,
      stops: [0, 1, 2],
    }),
  );
  assert.equal(model.snapshot().symbols.C, 'win-react');

  model.onVisualEvent(
    createSpinBlockedVisualEvent({
      spinIndex: 3,
      reason: 'insufficient',
      balance: 0,
      bet: 10,
    }),
  );
  assert.equal(model.snapshot().symbols.E, 'idle');
});

test('SPRITE-11: runtime symbol-state hooks are presentation-only and deterministic', () => {
  const root = /** @type {HTMLElement} */ ({
    dataset: {
      slotsBalance: '40',
      slotsBet: '2',
      slotsTheme: 'slots-neon-v1',
    },
  });

  const visualEvents = createSlotsVisualEventStore();
  const runtime = mountSlotsAnimationRuntime(root, visualEvents);

  assert.equal(root.dataset.slotsAnimTheme, 'slots-neon-v1');
  assert.deepEqual(JSON.parse(root.dataset.slotsAnimSymbolStates), {
    A: 'idle',
    B: 'idle',
    C: 'idle',
    D: 'idle',
    E: 'idle',
  });

  visualEvents.emit(
    createSpinAcceptedVisualEvent({
      spinIndex: 1,
      baseSeed: 'slots-phase-13-en',
      bet: 2,
      balanceAfterDebit: 38,
    }),
  );

  assert.equal(JSON.parse(root.dataset.slotsAnimSymbolStates).A, 'spin');
  assert.equal(root.dataset.slotsBalance, '40');
  assert.equal(root.dataset.slotsBet, '2');

  runtime.dispose();
});
