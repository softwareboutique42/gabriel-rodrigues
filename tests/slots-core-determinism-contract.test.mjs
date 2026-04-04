import test from 'node:test';
import assert from 'node:assert/strict';

const { resolveRound } = await import('../src/scripts/slots/engine/round.ts');
const { createInitialEngineState, transitionEngineState } =
  await import('../src/scripts/slots/engine/state-machine.ts');

const FIXTURE_CONFIG = {
  reels: [
    ['A', 'B', 'C', 'D', 'E'],
    ['B', 'C', 'D', 'E', 'A'],
    ['C', 'D', 'E', 'A', 'B'],
  ],
  visibleRows: 3,
};

test('SLOT-10: deterministic round result for identical seed and spin index', () => {
  const a = resolveRound({ baseSeed: 'phase13-seed', spinIndex: 4, config: FIXTURE_CONFIG });
  const b = resolveRound({ baseSeed: 'phase13-seed', spinIndex: 4, config: FIXTURE_CONFIG });

  assert.deepEqual(a.stops, b.stops);
  assert.deepEqual(a.matrix, b.matrix);
  assert.equal(a.outcome, b.outcome);
  assert.equal(a.totalPayoutUnits, b.totalPayoutUnits);
});

test('SLOT-10: seed composition changes deterministically with spin index', () => {
  const a = resolveRound({ baseSeed: 'phase13-seed', spinIndex: 1, config: FIXTURE_CONFIG });
  const b = resolveRound({ baseSeed: 'phase13-seed', spinIndex: 2, config: FIXTURE_CONFIG });

  assert.equal(a.seed, 'phase13-seed:1');
  assert.equal(b.seed, 'phase13-seed:2');
  assert.notEqual(a.seed, b.seed);
});

test('SLOT-10: state machine blocks invalid transitions and duplicate spin requests', () => {
  const idle = createInitialEngineState();

  const invalidResolve = transitionEngineState(idle, { type: 'SPIN_RESOLVED' });
  assert.deepEqual(invalidResolve, idle);

  const spinning = transitionEngineState(idle, { type: 'SPIN_REQUESTED' });
  assert.equal(spinning.status, 'spinning');
  assert.equal(spinning.spinIndex, 1);

  const duplicate = transitionEngineState(spinning, { type: 'SPIN_REQUESTED' });
  assert.equal(duplicate, spinning);
});
