import test from 'node:test';
import assert from 'node:assert/strict';

const {
  createSpinAcceptedVisualEvent,
  createSpinBlockedVisualEvent,
  createSpinResolvedVisualEvent,
  createSlotsVisualEventStore,
} = await import('../src/scripts/slots/animation/events.ts');
const { mountSlotsAnimationRuntime } = await import('../src/scripts/slots/animation/runtime.ts');

function createRoot(dataset = {}) {
  return /** @type {HTMLElement} */ ({
    dataset: {
      slotsBalance: '40',
      slotsBet: '2',
      ...dataset,
    },
  });
}

async function flushMicrotask() {
  await new Promise((resolve) => queueMicrotask(resolve));
}

async function withMockedPerformanceNow(samples, callback) {
  const descriptor = Object.getOwnPropertyDescriptor(globalThis, 'performance');
  let index = 0;
  const fallback = samples[samples.length - 1] ?? 0;

  Object.defineProperty(globalThis, 'performance', {
    configurable: true,
    value: {
      now() {
        const value = samples[index] ?? fallback;
        index += 1;
        return value;
      },
    },
  });

  try {
    await callback();
  } finally {
    if (descriptor) {
      Object.defineProperty(globalThis, 'performance', descriptor);
    } else {
      delete globalThis.performance;
    }
  }
}

test('QA-30: refreshed slots visual envelope stays deterministic across idle, sustain, resolved, and blocked states', async () => {
  const root = createRoot();
  const visualEvents = createSlotsVisualEventStore();
  const runtime = mountSlotsAnimationRuntime(root, visualEvents);

  assert.equal(root.dataset.slotsAnimTheme, 'slots-core-v1');
  assert.equal(root.dataset.slotsAnimAtmosphereTheme, 'core');
  assert.equal(root.dataset.slotsAnimState, 'idle');
  assert.equal(root.dataset.slotsAnimOutcome, 'idle');
  assert.equal(root.dataset.slotsAnimEffect, 'idle');
  assert.equal(root.dataset.slotsAnimAtmosphere, 'idle');
  assert.equal(root.dataset.slotsAnimIntensityRequested, 'full');
  assert.equal(root.dataset.slotsAnimIntensity, 'full');
  assert.equal(root.dataset.slotsAnimSeq, '0');

  visualEvents.emit(
    createSpinAcceptedVisualEvent({
      spinIndex: 1,
      baseSeed: 'slots-phase-13-en',
      bet: 2,
      balanceAfterDebit: 38,
    }),
  );

  assert.equal(root.dataset.slotsAnimState, 'spin-up');
  assert.equal(root.dataset.slotsAnimEffect, 'charge');
  assert.equal(root.dataset.slotsAnimAtmosphere, 'charge');
  assert.equal(root.dataset.slotsAnimSpinIndex, '1');
  assert.equal(root.dataset.slotsAnimSeq, '1');

  await flushMicrotask();

  assert.equal(root.dataset.slotsAnimState, 'sustain');
  assert.equal(root.dataset.slotsAnimEffect, 'sustain');
  assert.equal(root.dataset.slotsAnimAtmosphere, 'vortex');
  assert.equal(root.dataset.slotsAnimSeq, '1');

  visualEvents.emit(
    createSpinResolvedVisualEvent({
      spinIndex: 1,
      seed: 'slots-phase-13-en:1',
      outcome: 'loss',
      totalPayoutUnits: 0,
      stops: [1, 2, 3],
    }),
  );

  assert.equal(root.dataset.slotsAnimState, 'stop');
  assert.equal(root.dataset.slotsAnimOutcome, 'loss');
  assert.equal(root.dataset.slotsAnimEffect, 'loss');
  assert.equal(root.dataset.slotsAnimAtmosphere, 'shadow');
  assert.equal(root.dataset.slotsAnimResolvedSpinIndex, '1');
  assert.equal(root.dataset.slotsAnimSeq, '2');

  visualEvents.emit(
    createSpinBlockedVisualEvent({
      spinIndex: 2,
      reason: 'insufficient',
      balance: 0,
      bet: 10,
    }),
  );

  assert.equal(root.dataset.slotsAnimState, 'blocked');
  assert.equal(root.dataset.slotsAnimOutcome, 'loss');
  assert.equal(root.dataset.slotsAnimEffect, 'blocked');
  assert.equal(root.dataset.slotsAnimAtmosphere, 'caution');
  assert.equal(root.dataset.slotsAnimBlockedReason, 'insufficient');
  assert.equal(root.dataset.slotsAnimResolvedSpinIndex, '1');
  assert.equal(root.dataset.slotsAnimSeq, '3');
  assert.equal(root.dataset.slotsBalance, '40');
  assert.equal(root.dataset.slotsBet, '2');

  runtime.dispose();
});

test('QA-30: neon theme and minimal motion remain deterministic in the visual envelope', async () => {
  const root = createRoot({
    slotsTheme: 'slots-neon-v1',
    slotsMotion: 'minimal',
  });
  const visualEvents = createSlotsVisualEventStore();
  const runtime = mountSlotsAnimationRuntime(root, visualEvents);

  assert.equal(root.dataset.slotsAnimTheme, 'slots-neon-v1');
  assert.equal(root.dataset.slotsAnimAtmosphereTheme, 'neon');
  assert.equal(root.dataset.slotsAnimIntensityRequested, 'minimal');
  assert.equal(root.dataset.slotsAnimIntensity, 'minimal');
  assert.equal(root.dataset.slotsAnimIdle, 'idle-static');
  assert.equal(root.dataset.slotsAnimEffect, 'idle');
  assert.equal(root.dataset.slotsAnimAtmosphere, 'idle');

  visualEvents.emit(
    createSpinAcceptedVisualEvent({
      spinIndex: 4,
      baseSeed: 'slots-phase-13-en',
      bet: 2,
      balanceAfterDebit: 38,
    }),
  );

  assert.equal(root.dataset.slotsAnimIntensity, 'minimal');
  assert.equal(root.dataset.slotsAnimEffect, 'charge');
  assert.equal(root.dataset.slotsAnimAtmosphere, 'charge');

  await flushMicrotask();

  assert.equal(root.dataset.slotsAnimState, 'sustain');
  assert.equal(root.dataset.slotsAnimEffect, 'sustain');
  assert.equal(root.dataset.slotsAnimAtmosphere, 'vortex');
  assert.equal(root.dataset.slotsAnimAtmosphereTheme, 'neon');

  runtime.dispose();
});

test('QA-31: performance override can force safer intensity without mutating gameplay authority datasets', async () => {
  await withMockedPerformanceNow([0, 20], async () => {
    const root = createRoot({
      slotsTheme: 'slots-core-v1',
      slotsMotion: 'full',
    });
    const visualEvents = createSlotsVisualEventStore();
    const runtime = mountSlotsAnimationRuntime(root, visualEvents);

    visualEvents.emit(
      createSpinAcceptedVisualEvent({
        spinIndex: 6,
        baseSeed: 'slots-phase-13-en',
        bet: 2,
        balanceAfterDebit: 38,
      }),
    );

    assert.equal(root.dataset.slotsAnimPerformance, 'degraded');
    assert.equal(root.dataset.slotsAnimIntensityRequested, 'full');
    assert.equal(root.dataset.slotsAnimIntensity, 'minimal');
    assert.equal(root.dataset.slotsAnimEffect, 'charge');
    assert.equal(root.dataset.slotsAnimAtmosphere, 'charge');
    assert.equal(root.dataset.slotsBalance, '40');
    assert.equal(root.dataset.slotsBet, '2');

    runtime.dispose();
  });
});
