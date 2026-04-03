import test from 'node:test';
import assert from 'node:assert/strict';

const { createSlotsAtlasRegistry, snapshotSlotsAtlasRegistry } = await import(
  '../src/scripts/slots/animation/atlas-registry.ts'
);
const {
  SYMBOL_FRAME_MAP,
  REQUIRED_SYMBOL_FRAME_KEYS,
  getFrameKeyForSymbol,
  snapshotSymbolFrameMap,
} = await import('../src/scripts/slots/animation/symbol-frame-map.ts');
const { createSlotsVisualEventStore, createSpinAcceptedVisualEvent } = await import(
  '../src/scripts/slots/animation/events.ts'
);
const { mountSlotsAnimationRuntime } = await import('../src/scripts/slots/animation/runtime.ts');

test('SPRITE-10: SlotSymbol to frame mapping is deterministic and complete', () => {
  assert.deepEqual(Object.keys(SYMBOL_FRAME_MAP).sort(), ['A', 'B', 'C', 'D', 'E']);
  assert.deepEqual([...REQUIRED_SYMBOL_FRAME_KEYS].sort(), [
    'symbol-a',
    'symbol-b',
    'symbol-c',
    'symbol-d',
    'symbol-e',
  ]);

  assert.equal(getFrameKeyForSymbol('A'), 'symbol-a');
  assert.equal(getFrameKeyForSymbol('E'), 'symbol-e');

  assert.deepEqual(snapshotSymbolFrameMap(), {
    A: 'symbol-a',
    B: 'symbol-b',
    C: 'symbol-c',
    D: 'symbol-d',
    E: 'symbol-e',
  });
});

test('SPRITE-10: atlas registry reports deterministic readiness and missing frames', () => {
  const readyRegistry = createSlotsAtlasRegistry(
    {
      atlasId: 'slots-core-v1',
      frameKeys: REQUIRED_SYMBOL_FRAME_KEYS,
    },
    REQUIRED_SYMBOL_FRAME_KEYS,
  );

  assert.equal(readyRegistry.isReady(), true);
  assert.deepEqual(readyRegistry.missingFrames(), []);
  assert.equal(readyRegistry.hasFrame('symbol-c'), true);

  const missingRegistry = createSlotsAtlasRegistry(
    {
      atlasId: 'slots-core-v1',
      frameKeys: ['symbol-a', 'symbol-b'],
    },
    REQUIRED_SYMBOL_FRAME_KEYS,
  );

  const missingSnapshot = snapshotSlotsAtlasRegistry(missingRegistry);
  assert.equal(missingSnapshot.ready, false);
  assert.deepEqual(missingSnapshot.missing, ['symbol-c', 'symbol-d', 'symbol-e']);
});

test('ANIM-12: runtime atlas and idle hooks are presentation-only', () => {
  const root = /** @type {HTMLElement} */ ({
    dataset: {
      slotsBalance: '40',
      slotsBet: '2',
    },
  });
  const visualEvents = createSlotsVisualEventStore();
  const runtime = mountSlotsAnimationRuntime(root, visualEvents);

  assert.equal(root.dataset.slotsAnimAtlas, 'ready');
  assert.equal(root.dataset.slotsAnimAtlasId, 'slots-core-v1');
  assert.equal(root.dataset.slotsAnimTheme, 'slots-core-v1');
  assert.equal(root.dataset.slotsAnimIdle, 'idle-pulse');
  assert.equal(JSON.parse(root.dataset.slotsAnimSymbolStates).A, 'idle');
  assert.equal(root.dataset.slotsAnimSeq, '0');

  visualEvents.emit(
    createSpinAcceptedVisualEvent({
      spinIndex: 1,
      baseSeed: 'slots-phase-13-en',
      bet: 2,
      balanceAfterDebit: 38,
    }),
  );

  assert.equal(root.dataset.slotsAnimIdle, 'active-transition');
  assert.equal(JSON.parse(root.dataset.slotsAnimSymbolStates).D, 'spin');
  assert.equal(root.dataset.slotsBalance, '40');
  assert.equal(root.dataset.slotsBet, '2');

  runtime.dispose();
});

test('ANIM-12: runtime atlas/symbol snapshots are deterministic across repeated mounts', () => {
  const makeRoot = () =>
    /** @type {HTMLElement} */ ({
      dataset: {
        slotsBalance: '40',
        slotsBet: '2',
        slotsTheme: 'slots-core-v1',
      },
    });

  const collectSnapshot = () => {
    const root = makeRoot();
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

    const snapshot = {
      state: root.dataset.slotsAnimState,
      atlas: root.dataset.slotsAnimAtlas,
      atlasId: root.dataset.slotsAnimAtlasId,
      theme: root.dataset.slotsAnimTheme,
      idle: root.dataset.slotsAnimIdle,
      seq: root.dataset.slotsAnimSeq,
      symbolStates: root.dataset.slotsAnimSymbolStates,
      symbolMap: root.dataset.slotsAnimSymbolMap,
    };

    runtime.dispose();
    return snapshot;
  };

  const first = collectSnapshot();
  const second = collectSnapshot();

  assert.deepEqual(second, first);
});
