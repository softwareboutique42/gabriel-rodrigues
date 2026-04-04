# Phase 43: Persistence Wiring & Unlock Trigger - Discussion Log (Assumptions Mode)

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions captured in CONTEXT.md — this log preserves the analysis.

**Date:** 2026-04-04
**Phase:** 43-persistence-wiring-unlock-trigger
**Mode:** assumptions
**Areas analyzed:** localStorage Key Design, loadCompletedLessons() API Shape, Skip Handler Persistence Gap, Contract Test Coverage Shape

## Assumptions Presented

### localStorage Key Design

| Assumption                                                                            | Confidence | Evidence                                                                                |
| ------------------------------------------------------------------------------------- | ---------- | --------------------------------------------------------------------------------------- |
| Two new keys `ccz-near-miss-completed` and `ccz-lesson-sensory-completed`, each `'1'` | Confident  | `engine.ts:83` — `markTutorialComplete()` pattern; `isFirstRun()` null-check at line 79 |

### loadCompletedLessons() API Shape

| Assumption                                                                                              | Confidence | Evidence                                                                                           |
| ------------------------------------------------------------------------------------------------------- | ---------- | -------------------------------------------------------------------------------------------------- |
| Returns `{completedLessons, unlockedLessons}` in CURRICULUM_LESSONS canonical order; `spinsObserved: 0` | Confident  | `engine.ts:509-518` fast-path; `syncRootDatasets` emits `.join(',')` — order matters for contracts |

### Skip Handler Persistence Gap

| Assumption                                                                                                | Confidence | Evidence                                                                   |
| --------------------------------------------------------------------------------------------------------- | ---------- | -------------------------------------------------------------------------- |
| Skip handler must write `ccz-near-miss-completed` before `completeCurrentLesson()` when skipping Lesson 3 | Confident  | Direct read of `main.ts:579-606` — near-miss write absent from skip branch |

### Contract Test Coverage Shape

| Assumption                                                                   | Confidence | Evidence                                                                                                             |
| ---------------------------------------------------------------------------- | ---------- | -------------------------------------------------------------------------------------------------------------------- |
| Source-level `assert.match()` regex checks, not runtime engine instantiation | Confident  | All 28 existing tests in `casinocraftz-tutorial-contract.test.mjs` use `readWorkspaceFile()` + `assert.match()` only |

## Corrections Made

No corrections — all assumptions confirmed.

## External Research

None required — codebase provided complete evidence for all four areas.
