---
phase: 44-spin-bridge-threshold-causality-copy-en-pt-parity-lock
plan: 01
subsystem: tutorial-tests
tags: [casinocraftz, tutorial, contract-tests, parity, causality, spin-bridge]

# Dependency graph
requires:
  - phase: 43-persistence-wiring-unlock-trigger
    provides: lesson 3 persistence and returning-user unlock path
  - phase: 39-sensory-conditioning-lesson
    provides: sensory-conditioning lesson copy, steps, and dataset hooks
provides:
  - explicit contract evidence for the sensory-conditioning 2-spin gate shape
  - explicit EN/PT causality key lock for `tutorial.causality.sensoryReveal`
  - explicit EN/PT page parity lock for `data-casinocraftz-lesson-sensory-conditioning-soon`
  - explicit sensory-conditioning recap-key guard in `main.ts`
affects: [casinocraftz tutorial contracts, release evidence, EN/PT parity]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - append source-grep contract assertions to the existing node:test suite
    - lock removal-sensitive dataset and locale keys by exact string match
    - keep verification-only phases production-code-free

key-files:
  created: []
  modified:
    - tests/casinocraftz-tutorial-contract.test.mjs

key-decisions:
  - 'Used source-grep contract assertions instead of direct TypeScript runtime imports to preserve the existing node:test pattern and avoid a TS loader dependency'
  - 'Added an explicit sensory-conditioning recap-key assertion rather than relying on the generic recap contract alone'
  - 'Kept all release-evidence assertions inside the existing tutorial contract suite instead of creating a new file'

patterns-established:
  - 'Pattern: verification-only phase evidence can extend existing source-grep contract suites without touching production code'
  - 'Pattern: EN/PT parity locks use exact attribute-name presence assertions in both Astro pages'

requirements-completed: [EDU-72]

# Metrics
duration: <1min
completed: 2026-04-04
---

# Phase 44 Plan 01: Spin-Bridge Contract Locks Summary

**Added explicit contract evidence for the Lesson 3 two-spin gate, causality disclosure key, and EN/PT parity-sensitive sensory-conditioning dataset attribute**

## Performance

- **Duration:** <1 min
- **Started:** 2026-04-04T15:42:16Z
- **Completed:** 2026-04-04T15:42:16Z
- **Tasks:** 2
- **Files modified:** 1

## Accomplishments

- Added `Spin-Bridge: sensory-conditioning-observe step requires exactly 2 spins in engine`
- Added `Spin-Bridge: recordSpin guards advancement on sensory-conditioning-observe step name`
- Added dedicated EN/PT causality key lock for `tutorial.causality.sensoryReveal`
- Added dedicated EN/PT parity lock for `data-casinocraftz-lesson-sensory-conditioning-soon`
- Added explicit `casinocraftzCausalitySensoryReveal` guard in `main.ts`
- Contract suite passed green with 29/29 tests

## Task Commits

Each task was committed atomically:

1. **Task 1: Add spin-bridge gate contract assertions** - `d56e76a` (test)
2. **Task 2: Lock causality key and EN/PT parity evidence** - `3290974` (test)

## Files Created/Modified

- `tests/casinocraftz-tutorial-contract.test.mjs` - Added five Phase 44 release-evidence test blocks for spin-bridge, causality, parity, and sensory recap-key coverage

## Validation

- `node --test tests/casinocraftz-tutorial-contract.test.mjs` - 29/29 pass

## Decisions Made

- Stayed with source-grep assertions instead of direct `engine.ts` runtime imports because the existing contract suite is `.mjs`-based and already uses `readWorkspaceFile()` consistently
- Added a sensory-specific recap-key assertion because the pre-existing generic recap test only proved the spin gate and generic recap attribute, not the Lesson 3 copy path itself
- Kept the work contract-only and production-code-free, matching the phase boundary

## Deviations from Plan

The discuss log originally preferred functional import-and-call tests for `recordSpin()`. Execution used source-grep assertions instead to avoid introducing a TypeScript test-loader requirement into the established Node test runner flow. This preserved the zero-new-package constraint and still satisfied the plan's must-haves.

## Issues Encountered

None.

## Next Phase Readiness

- Contract-level release evidence for EDU-72 exists in the canonical tutorial contract suite
- Causality copy and parity-sensitive dataset attributes now have explicit removal guards
- Browser-level proof can proceed independently in Plan 02

---

## Self-Check: PASSED

- tests/casinocraftz-tutorial-contract.test.mjs: FOUND
- Commit d56e76a: FOUND
- Commit 3290974: FOUND
- 44-01-SUMMARY.md: FOUND

_Phase: 44-spin-bridge-threshold-causality-copy-en-pt-parity-lock_
_Completed: 2026-04-04_