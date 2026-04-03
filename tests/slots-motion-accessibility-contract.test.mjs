import test from 'node:test';
import assert from 'node:assert/strict';

const { resolveSlotsMotionPolicy } = await import('../src/scripts/slots/animation/motion-policy.ts');
const { createSlotsVisualEventStore } = await import('../src/scripts/slots/animation/events.ts');
const { mountSlotsAnimationRuntime } = await import('../src/scripts/slots/animation/runtime.ts');

test('A11Y-10: motion policy resolves deterministically from query, dataset, then default', () => {
  const fromQuery = /** @type {HTMLElement} */ ({ dataset: { slotsMotion: 'full' } });
  const fromDataset = /** @type {HTMLElement} */ ({ dataset: { slotsMotion: 'reduced' } });
  const fromDefault = /** @type {HTMLElement} */ ({ dataset: {} });

  assert.deepEqual(resolveSlotsMotionPolicy(fromQuery, '?slotsMotion=minimal', false), {
    requestedIntensity: 'minimal',
    effectiveIntensity: 'minimal',
    reducedMotion: false,
    source: 'query',
  });
  assert.deepEqual(resolveSlotsMotionPolicy(fromDataset, '', false), {
    requestedIntensity: 'reduced',
    effectiveIntensity: 'reduced',
    reducedMotion: false,
    source: 'dataset',
  });
  assert.deepEqual(resolveSlotsMotionPolicy(fromDefault, '', false), {
    requestedIntensity: 'full',
    effectiveIntensity: 'full',
    reducedMotion: false,
    source: 'default',
  });
});

test('A11Y-10: reduced-motion preference caps effective intensity deterministically', () => {
  const root = /** @type {HTMLElement} */ ({ dataset: { slotsMotion: 'full' } });

  assert.equal(resolveSlotsMotionPolicy(root, '', true).effectiveIntensity, 'reduced');
  root.dataset.slotsMotion = 'reduced';
  assert.equal(resolveSlotsMotionPolicy(root, '', true).effectiveIntensity, 'minimal');
  root.dataset.slotsMotion = 'minimal';
  assert.equal(resolveSlotsMotionPolicy(root, '', true).effectiveIntensity, 'minimal');
});

test('A11Y-10: runtime emits accessibility snapshots without mutating authority state', () => {
  const root = /** @type {HTMLElement} */ ({
    dataset: {
      slotsMotion: 'minimal',
      slotsBalance: '40',
      slotsBet: '2',
    },
  });
  const visualEvents = createSlotsVisualEventStore();
  const runtime = mountSlotsAnimationRuntime(root, visualEvents);

  assert.equal(root.dataset.slotsAnimIntensityRequested, 'minimal');
  assert.equal(root.dataset.slotsAnimIntensity, 'minimal');
  assert.equal(root.dataset.slotsAnimIdle, 'idle-static');
  assert.equal(root.dataset.slotsAnimEffect, 'idle');
  assert.equal(root.dataset.slotsAnimAtmosphere, 'idle');
  assert.equal(root.dataset.slotsAnimAtmosphereTheme, 'core');
  assert.equal(root.dataset.slotsBalance, '40');
  assert.equal(root.dataset.slotsBet, '2');

  runtime.dispose();
}
);