import test from 'node:test';
import assert from 'node:assert/strict';

const {
  createSlotsThemeRegistry,
  DEFAULT_SLOTS_THEMES,
  snapshotSlotsTheme,
} = await import('../src/scripts/slots/animation/theme-registry.ts');
const {
  readRequestedThemeId,
  resolveSlotsThemeSelection,
} = await import('../src/scripts/slots/animation/theme-selection.ts');
const { createSlotsVisualEventStore } = await import('../src/scripts/slots/animation/events.ts');
const { mountSlotsAnimationRuntime } = await import('../src/scripts/slots/animation/runtime.ts');

test('SPRITE-12: theme registry resolves default and fallback deterministically', () => {
  const registry = createSlotsThemeRegistry(DEFAULT_SLOTS_THEMES, 'slots-core-v1');

  assert.deepEqual(registry.listThemeIds().sort(), ['slots-core-v1', 'slots-neon-v1']);
  assert.equal(registry.resolveTheme().id, 'slots-core-v1');
  assert.equal(registry.resolveTheme('slots-neon-v1').id, 'slots-neon-v1');
  assert.equal(registry.resolveTheme('unknown-theme').id, 'slots-core-v1');

  const snapshot = snapshotSlotsTheme(registry.resolveTheme('slots-neon-v1'));
  assert.equal(snapshot.id, 'slots-neon-v1');
  assert.equal(snapshot.atlasId, 'slots-neon-v1');
});

test('SPRITE-12: theme selection resolves from query, dataset, then fallback', () => {
  const registry = createSlotsThemeRegistry(DEFAULT_SLOTS_THEMES, 'slots-core-v1');

  const fromQuery = /** @type {HTMLElement} */ ({ dataset: { slotsTheme: 'slots-core-v1' } });
  const fromDataset = /** @type {HTMLElement} */ ({ dataset: { slotsTheme: 'slots-neon-v1' } });
  const fromFallback = /** @type {HTMLElement} */ ({ dataset: {} });

  assert.equal(readRequestedThemeId(fromQuery, '?slotsTheme=slots-neon-v1'), 'slots-neon-v1');
  assert.equal(resolveSlotsThemeSelection(fromQuery, registry, '?slotsTheme=slots-neon-v1').id, 'slots-neon-v1');
  assert.equal(readRequestedThemeId(fromDataset, ''), 'slots-neon-v1');
  assert.equal(resolveSlotsThemeSelection(fromDataset, registry, '').id, 'slots-neon-v1');
  assert.equal(resolveSlotsThemeSelection(fromFallback, registry, '').id, 'slots-core-v1');
});

test('SPRITE-12: runtime theme selection stays presentation-only', () => {
  const root = /** @type {HTMLElement} */ ({
    dataset: {
      slotsTheme: 'unknown-theme',
      slotsBalance: '40',
      slotsBet: '2',
    },
  });
  const visualEvents = createSlotsVisualEventStore();
  const runtime = mountSlotsAnimationRuntime(root, visualEvents);

  assert.equal(root.dataset.slotsAnimTheme, 'slots-core-v1');
  assert.equal(root.dataset.slotsAnimAtmosphereTheme, 'core');
  assert.equal(root.dataset.slotsBalance, '40');
  assert.equal(root.dataset.slotsBet, '2');

  runtime.dispose();
});

test('SPRITE-12: neon theme projects deterministic atmosphere variant without authority drift', () => {
  const root = /** @type {HTMLElement} */ ({
    dataset: {
      slotsTheme: 'slots-neon-v1',
      slotsBalance: '40',
      slotsBet: '2',
    },
  });
  const visualEvents = createSlotsVisualEventStore();
  const runtime = mountSlotsAnimationRuntime(root, visualEvents);

  assert.equal(root.dataset.slotsAnimTheme, 'slots-neon-v1');
  assert.equal(root.dataset.slotsAnimAtmosphereTheme, 'neon');
  assert.equal(root.dataset.slotsAnimAtmosphere, 'idle');
  assert.equal(root.dataset.slotsBalance, '40');
  assert.equal(root.dataset.slotsBet, '2');

  runtime.dispose();
});
