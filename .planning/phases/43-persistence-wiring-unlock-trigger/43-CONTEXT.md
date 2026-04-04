# Phase 43: Persistence Wiring & Unlock Trigger - Context

**Gathered:** 2026-04-04 (assumptions mode)
**Status:** Ready for planning

<domain>
## Phase Boundary

Fix the returning-user fast-path in `mountTutorial()` so users who completed Lesson 2 (Near-Miss) see Lesson 3 (Sensory Conditioning) unlocked on reload. Add localStorage persistence for near-miss and Lesson 3 completion. All Lesson 3 dialogue content is already authored — this phase is wiring, not authoring.

Requirements: EDU-70, EDU-71, EDU-73
</domain>

<decisions>
## Implementation Decisions

### localStorage Key Design

- **D-01:** Two new localStorage keys: `ccz-near-miss-completed` and `ccz-lesson-sensory-completed`, each written as `'1'` when the respective lesson completes.
- **D-02:** Keys follow the existing `ccz-tutorial-completed` precedent — simple flag pattern, `=== null` presence-check for reading, no JSON or versioned payload.

### loadCompletedLessons() Function

- **D-03:** New exported function `loadCompletedLessons()` in `engine.ts` replaces the binary `isFirstRun()` branch in `mountTutorial()`.
- **D-04:** Returns `{ completedLessons, unlockedLessons, spinsObserved: 0 }` — `completedLessons` array ordered by `CURRICULUM_LESSONS` canonical order (`['house-edge', 'near-miss', 'sensory-conditioning']`), not insertion order. `unlockedLessons` derived from `completedLessons` using the same unlock chain logic.
- **D-05:** `spinsObserved` always reset to `0` unconditionally during state reconstruction (prevents off-by-one spin gate firing).

### Skip Handler Persistence

- **D-06:** Skip handler in `main.ts` (around lines 579–606) must write `ccz-near-miss-completed` before calling `completeCurrentLesson()` when `currentLesson === 'sensory-conditioning'`. The skip handler bypasses `proceedStep()` and `onSpinMessage()`, so without this explicit write, near-miss completion is never persisted for skip-path users.

### Contract Test Coverage

- **D-07:** New assertions added to `tests/casinocraftz-tutorial-contract.test.mjs` as source-level `assert.match(src, /pattern/)` regex checks against raw TypeScript source strings — NOT runtime tests that instantiate engine functions. Consistent with all 28 existing tests in that file.
- **D-08:** New assertions should cover: `ccz-near-miss-completed` write presence, `ccz-lesson-sensory-completed` write presence, `loadCompletedLessons` export, and skip handler near-miss write.

### Claude's Discretion

- Exact variable names inside `loadCompletedLessons()` (internal implementation detail)
- Whether `loadCompletedLessons` reads all three keys or only the two new ones (house-edge key is legacy `ccz-tutorial-completed`)
- Whether to keep `isFirstRun()` as a utility or remove it entirely

</decisions>

<canonical_refs>

## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Core implementation files

- `src/scripts/casinocraftz/tutorial/engine.ts` — `isFirstRun()` (line ~79), `markTutorialComplete()` (line ~83), `CURRICULUM_LESSONS` (lines ~10-35), `mountTutorial()` fast-path (lines ~509-518), `openLesson()`, `isLessonUnlocked()` (line ~137)
- `src/scripts/casinocraftz/tutorial/main.ts` — skip handler (lines ~579-606), `proceedStep()` (line ~564), `onSpinMessage()` (line ~624), `syncRootDatasets()` call

### Test files

- `tests/casinocraftz-tutorial-contract.test.mjs` — existing source-level contract pattern (all 28 tests use `readWorkspaceFile()` + `assert.match()`)

### Requirements and roadmap

- `.planning/REQUIREMENTS.md` — EDU-70, EDU-71, EDU-73 acceptance criteria
- `.planning/ROADMAP.md` — Phase 43 success criteria (5 criteria)
- `.planning/research/SUMMARY.md` — research synthesis, pitfall list

</canonical_refs>

<code_context>

## Existing Code Insights

### Reusable Assets

- `markTutorialComplete()` in `engine.ts` — existing localStorage write pattern to follow for new keys
- `isFirstRun()` in `engine.ts` — existing localStorage read pattern (returns `localStorage.getItem(key) === null`)
- `syncRootDatasets()` in `main.ts` — emits `state.completedLessons.join(',')` to `data-casinocraftz-completed-lessons`; order of array elements matters for contract assertions

### Established Patterns

- localStorage keys use `ccz-` prefix, kebab-case, set to `'1'`, checked via `=== null`
- Contract tests: `readWorkspaceFile(filePath)` returns source string; `assert.match(src, /regex/)` asserts presence
- Exported engine functions are testable at source level (contract tests grep for the export name)
- `AbortController` pattern controls event listener lifecycle — no new `window.addEventListener` calls needed for Phase 43 (spin observation is Phase 44)

### Integration Points

- `mountTutorial()` in `main.ts` calls `isFirstRun()` and branches; replace this branch with `loadCompletedLessons()` call
- Skip handler in `main.ts` calls `completeCurrentLesson(state)` — add near-miss localStorage write before this call
- EN/PT Astro pages at `src/pages/en/casinocraftz/index.astro` and `src/pages/pt/casinocraftz/index.astro` — do NOT modify (content already authored, data-attributes already present)

</code_context>

<specifics>
## Specific Ideas

- The `data-casinocraftz-completed-lessons` dataset emits joined lesson IDs — contract tests should assert `'house-edge,near-miss'` (comma-separated, canonical order) when both lessons are complete
- No modifications to dialogue.ts, types.ts, or Astro pages — all Lesson 3 content is pre-authored

</specifics>

<deferred>
## Deferred Ideas

- Spin-bridge observation threshold coverage — Phase 44 (EDU-72)
- EN/PT parity contract lock — Phase 44
- `data-casinocraftz-spins-observed` reset verification — Phase 44

None — analysis stayed within Phase 43 scope.
</deferred>

---

_Phase: 43-persistence-wiring-unlock-trigger_
_Context gathered: 2026-04-04_
