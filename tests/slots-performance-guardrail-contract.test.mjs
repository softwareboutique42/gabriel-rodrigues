import test from 'node:test';
import assert from 'node:assert/strict';

const {
  createSlotsPerformanceGuardrailModel,
} = await import('../src/scripts/slots/animation/performance-guardrail.ts');
const {
  createSpinAcceptedVisualEvent,
  createSlotsVisualEventStore,
} = await import('../src/scripts/slots/animation/events.ts');
const { mountSlotsAnimationRuntime } = await import('../src/scripts/slots/animation/runtime.ts');

test('PERF-10: performance guardrail degrades and recovers deterministically', () => {
  const model = createSlotsPerformanceGuardrailModel({
    warnThresholdMs: 8,
    criticalThresholdMs: 14,
    recoverSamples: 3,
  });

  model.onSample(9);
  assert.equal(model.snapshot().status, 'degraded');
  assert.equal(model.snapshot().intensityOverride, 'reduced');

  model.onSample(15);
  assert.equal(model.snapshot().intensityOverride, 'minimal');

  model.onSample(2);
  model.onSample(2);
  assert.equal(model.snapshot().status, 'degraded');

  model.onSample(2);
  assert.equal(model.snapshot().status, 'ok');
  assert.equal(model.snapshot().intensityOverride, null);
});

test('PERF-10: runtime performance snapshot is presentation-only', () => {
  const root = /** @type {HTMLElement} */ ({
    dataset: {
      slotsBalance: '40',
      slotsBet: '2',
      slotsMotion: 'full',
    },
  });

  const visualEvents = createSlotsVisualEventStore();
  const runtime = mountSlotsAnimationRuntime(root, visualEvents);

  visualEvents.emit(
    createSpinAcceptedVisualEvent({
      spinIndex: 1,
      baseSeed: 'slots-phase-13-en',
      bet: 2,
      balanceAfterDebit: 38,
    }),
  );

  assert.match(root.dataset.slotsAnimPerformance, /ok|degraded/);
  assert.match(root.dataset.slotsAnimIntensity, /full|reduced|minimal/);
  assert.equal(root.dataset.slotsBalance, '40');
  assert.equal(root.dataset.slotsBet, '2');

  runtime.dispose();
});