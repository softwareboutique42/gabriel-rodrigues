import test from 'node:test';
import assert from 'node:assert/strict';

const {
  createSlotsVisualEventStore,
  createSpinAcceptedVisualEvent,
  createSpinBlockedVisualEvent,
  createSpinResolvedVisualEvent,
} = await import('../src/scripts/slots/animation/events.ts');
const { createReelTimelineModel } = await import('../src/scripts/slots/animation/reel-timeline.ts');
const { createOutcomeFeedbackModel } = await import(
  '../src/scripts/slots/animation/outcome-feedback.ts'
);
const { mountSlotsAnimationRuntime } = await import('../src/scripts/slots/animation/runtime.ts');

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

test('ANIM-10: reel timeline progresses through spin-up, sustain, and stop deterministically', () => {
  const timeline = createReelTimelineModel();

  timeline.onVisualEvent(
    createSpinAcceptedVisualEvent({
      spinIndex: 4,
      baseSeed: 'slots-phase-13-en',
      bet: 2,
      balanceAfterDebit: 32,
    }),
  );
  assert.equal(timeline.snapshot().phase, 'spin-up');

  timeline.advanceToSustain(4);
  assert.equal(timeline.snapshot().phase, 'sustain');

  timeline.onVisualEvent(
    createSpinResolvedVisualEvent({
      spinIndex: 4,
      seed: 'slots-phase-13-en:4',
      outcome: 'win',
      totalPayoutUnits: 5,
      stops: [2, 4, 1],
    }),
  );

  assert.equal(timeline.snapshot().phase, 'stop');
  assert.equal(timeline.snapshot().lastResolvedSpinIndex, 4);
});

test('ANIM-11: outcome feedback derives from resolved results only', () => {
  const feedback = createOutcomeFeedbackModel();

  feedback.onVisualEvent(
    createSpinAcceptedVisualEvent({
      spinIndex: 8,
      baseSeed: 'slots-phase-13-en',
      bet: 3,
      balanceAfterDebit: 11,
    }),
  );
  assert.equal(feedback.snapshot().status, 'idle');

  feedback.onVisualEvent(
    createSpinResolvedVisualEvent({
      spinIndex: 8,
      seed: 'slots-phase-13-en:8',
      outcome: 'loss',
      totalPayoutUnits: 0,
      stops: [0, 0, 0],
    }),
  );
  assert.equal(feedback.snapshot().status, 'loss');
});

test('ANIM-10: runtime mount/dispose is idempotent across re-subscriptions', () => {
  const root = /** @type {HTMLElement} */ ({ dataset: {} });
  const visualEvents = createSlotsVisualEventStore();

  const runtime = mountSlotsAnimationRuntime(root, visualEvents);
  const runtimeAgain = mountSlotsAnimationRuntime(root, visualEvents);

  visualEvents.emit(
    createSpinAcceptedVisualEvent({
      spinIndex: 1,
      baseSeed: 'slots-phase-13-en',
      bet: 2,
      balanceAfterDebit: 38,
    }),
  );
  visualEvents.emit(
    createSpinResolvedVisualEvent({
      spinIndex: 1,
      seed: 'slots-phase-13-en:1',
      outcome: 'loss',
      totalPayoutUnits: 0,
      stops: [1, 1, 1],
    }),
  );

  assert.equal(root.dataset.slotsAnimState, 'stop');
  assert.equal(root.dataset.slotsAnimOutcome, 'loss');
  assert.equal(root.dataset.slotsAnimAtlas, 'ready');
  assert.equal(root.dataset.slotsAnimIdle, 'idle-pulse');
  assert.equal(root.dataset.slotsAnimTheme, 'slots-core-v1');
  assert.equal(JSON.parse(root.dataset.slotsAnimSymbolStates).A, 'idle');
  assert.equal(root.dataset.slotsAnimSeq, '2');

  runtime.dispose();
  runtime.dispose();
  runtimeAgain.dispose();
});

test('ANIM-11: blocked visual events never overwrite resolved feedback outcome', () => {
  const root = /** @type {HTMLElement} */ ({ dataset: {} });
  const visualEvents = createSlotsVisualEventStore();
  const runtime = mountSlotsAnimationRuntime(root, visualEvents);

  visualEvents.emit(
    createSpinResolvedVisualEvent({
      spinIndex: 3,
      seed: 'slots-phase-13-en:3',
      outcome: 'win',
      totalPayoutUnits: 4,
      stops: [1, 2, 3],
    }),
  );
  assert.equal(root.dataset.slotsAnimOutcome, 'win');

  visualEvents.emit(
    createSpinBlockedVisualEvent({
      spinIndex: 4,
      reason: 'insufficient',
      balance: 0,
      bet: 10,
    }),
  );

  assert.equal(root.dataset.slotsAnimState, 'blocked');
  assert.equal(root.dataset.slotsAnimOutcome, 'win');
  assert.equal(root.dataset.slotsAnimAtlas, 'ready');
  assert.equal(root.dataset.slotsAnimTheme, 'slots-core-v1');
  assert.equal(JSON.parse(root.dataset.slotsAnimSymbolStates).B, 'idle');

  runtime.dispose();
});
