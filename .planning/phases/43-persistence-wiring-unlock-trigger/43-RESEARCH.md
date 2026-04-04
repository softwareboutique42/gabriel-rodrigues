# Phase 43: Persistence Wiring & Unlock Trigger - Research

**Researched:** 2026-04-04
**Domain:** Client-side tutorial engine — localStorage persistence, state reconstruction, unlock chain
**Confidence:** HIGH

<user_constraints>

## User Constraints (from CONTEXT.md)

### Locked Decisions

**D-01:** Two new localStorage keys: `ccz-near-miss-completed` and `ccz-lesson-sensory-completed`, each written as `'1'` when the respective lesson completes.

**D-02:** Keys follow the existing `ccz-tutorial-completed` precedent — simple flag pattern, `=== null` presence-check for reading, no JSON or versioned payload.

**D-03:** New exported function `loadCompletedLessons()` in `engine.ts` replaces the binary `isFirstRun()` branch in `mountTutorial()`.

**D-04:** Returns `{ completedLessons, unlockedLessons, spinsObserved: 0 }` — `completedLessons` array ordered by `CURRICULUM_LESSONS` canonical order (`['house-edge', 'near-miss', 'sensory-conditioning']`), not insertion order. `unlockedLessons` derived from `completedLessons` using the same unlock chain logic.

**D-05:** `spinsObserved` always reset to `0` unconditionally during state reconstruction (prevents off-by-one spin gate firing).

**D-06:** Skip handler in `main.ts` (around lines 579–606) must write `ccz-near-miss-completed` before calling `completeCurrentLesson()` when `currentLesson === 'sensory-conditioning'`. The skip handler bypasses `proceedStep()` and `onSpinMessage()`, so without this explicit write, near-miss completion is never persisted for skip-path users.

**D-07:** New assertions added to `tests/casinocraftz-tutorial-contract.test.mjs` as source-level `assert.match(src, /pattern/)` regex checks against raw TypeScript source strings — NOT runtime tests that instantiate engine functions. Consistent with all 28 existing tests in that file.

**D-08:** New assertions should cover: `ccz-near-miss-completed` write presence, `ccz-lesson-sensory-completed` write presence, `loadCompletedLessons` export, and skip handler near-miss write.

### Claude's Discretion

- Exact variable names inside `loadCompletedLessons()` (internal implementation detail)
- Whether `loadCompletedLessons` reads all three keys or only the two new ones (house-edge key is legacy `ccz-tutorial-completed`)
- Whether to keep `isFirstRun()` as a utility or remove it entirely

### Deferred Ideas (OUT OF SCOPE)

- Spin-bridge observation threshold coverage — Phase 44 (EDU-72)
- EN/PT parity contract lock — Phase 44
- `data-casinocraftz-spins-observed` reset verification — Phase 44
- Win-celebration effects (neon pulse, reel glow) — v2.3 (Phases 45-46)
- No FX code of any kind in this phase

</user_constraints>

<phase_requirements>

## Phase Requirements

| ID     | Description                                                                                               | Research Support                                                                                                                               |
| ------ | --------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| EDU-70 | User can access Lesson 3 after completing Lesson 2, including returning users (cross-session persistence) | `mountTutorial()` fast-path (lines 509-518) hardcodes `completedLessons: ['house-edge']`; fix via `loadCompletedLessons()` + new keys          |
| EDU-71 | Lesson 3 dialogue explains how sensory triggers condition response without changing odds                  | All 4 dialogue steps verified present in `dialogue.ts` lines 264-367 in EN and PT; no authoring required                                       |
| EDU-73 | Lesson 3 completion is tracked and persisted (localStorage)                                               | `SENSORY_COMPLETE_STEPS` constant present in `main.ts` line 49; `onSpinMessage` and `proceedStep` reach it; needs `markSensoryComplete()` call |

</phase_requirements>

## Summary

Phase 43 is an integration-only phase. All Lesson 3 content (dialogue, step definitions, spin gate, causality disclosure, i18n strings, Astro dataset anchors, skip-button branch) is fully authored and wired in the current codebase. The single blocking gap is the returning-user fast-path in `mountTutorial()` at lines 509-518 of `main.ts`. This block was written when only Lesson 1 existed: it hardcodes `completedLessons: ['house-edge']` and `unlockedLessons: ['house-edge', 'near-miss', 'sensory-conditioning']` regardless of how far the user progressed, making Lesson 3 permanently locked on reload for any user who completed Lesson 2.

The fix requires exactly three categories of change: (1) two new `mark*` functions in `engine.ts` that write the new localStorage flags at lesson completion, (2) a `loadCompletedLessons()` function in `engine.ts` that reads all three keys and reconstructs state in curriculum-canonical order, and (3) wiring in `main.ts` to call these functions at the right checkpoints — including the skip handler's near-miss persistence gap (D-06). Contract tests in `casinocraftz-tutorial-contract.test.mjs` extend the existing source-grep pattern with four new assertions.

The existing test suite has 23 passing tests and the contract test file uses a pure source-reading pattern (`readWorkspaceFile` + `assert.match`) — no runtime instantiation, no browser, no build step required. This keeps contract tests fast and deterministic. All test infrastructure is operational at `node --test tests/casinocraftz-tutorial-contract.test.mjs`.

**Primary recommendation:** Add `markNearMissComplete()`, `markSensoryComplete()`, and `loadCompletedLessons()` to `engine.ts`; replace the `isFirstRun()` branch in `mountTutorial()` with a `loadCompletedLessons()` call; add persistence writes at all three completion checkpoints (`proceedStep`, `onSpinMessage`, skip handler); add four contract assertions.

## Standard Stack

### Core

| Component       | Version  | Purpose                                   | Why Standard                                         |
| --------------- | -------- | ----------------------------------------- | ---------------------------------------------------- |
| TypeScript 5.x  | 5.x      | Tutorial engine, dialogue registry        | Project language; all tutorial modules already in TS |
| Web Storage API | Native   | localStorage persistence for lesson flags | Existing pattern: `ccz-tutorial-completed` key       |
| `node:test`     | Built-in | Source-level contract test runner         | All 28 existing contract tests use this module       |
| `node:assert`   | Built-in | Assertion library for contract tests      | Used verbatim in existing contract test file         |

### Supporting

| Component              | Version | Purpose              | When to Use                                   |
| ---------------------- | ------- | -------------------- | --------------------------------------------- |
| Playwright             | 1.58.x  | E2E browser tests    | Phase 44 (spin-bridge threshold verification) |
| Astro 6.x static shell | 6.x     | HTML dataset anchors | Unchanged; no Astro edits in this phase       |

### Alternatives Considered

| Instead of                      | Could Use                      | Tradeoff                                                                                        |
| ------------------------------- | ------------------------------ | ----------------------------------------------------------------------------------------------- |
| Simple flag keys (`'1'`)        | JSON-serialized state          | JSON would add version/migration risk; flag keys match existing precedent and are sufficient    |
| `loadCompletedLessons()` fn     | Inline branch expansion        | Inline branch becomes unmaintainable for 3+ lessons; named function is testable at source level |
| Separate `markNearMissComplete` | Reusing `markTutorialComplete` | Semantic clarity; each key has a distinct name matching the lesson; existing pattern kept       |

**Installation:** No new packages required for this phase.

## Architecture Patterns

### Relevant File Structure

```
src/scripts/casinocraftz/tutorial/
├── engine.ts          # Pure state transitions + localStorage reads/writes (MODIFY)
├── main.ts            # Mount, render, event wiring (MODIFY)
├── dialogue.ts        # Dialogue registry — all Lesson 3 content present (DO NOT MODIFY)
├── types.ts           # Type declarations — all Lesson 3 types declared (DO NOT MODIFY)
└── cards.ts           # Utility card system (DO NOT MODIFY)

tests/
└── casinocraftz-tutorial-contract.test.mjs  # Source-grep contract tests (EXTEND)

src/pages/{en,pt}/casinocraftz/
└── index.astro        # All data-casinocraftz-* dataset anchors present (DO NOT MODIFY)
```

### Pattern 1: localStorage Flag Write Pattern

**What:** Each lesson's completion writes a single `'1'` value to a namespaced key. Reading uses `=== null` presence check, not value equality.
**When to use:** Every lesson completion checkpoint in both `proceedStep()` and `onSpinMessage()` must call the appropriate `mark*` function.

```typescript
// Source: engine.ts — existing markTutorialComplete() pattern to replicate
export function markTutorialComplete(): void {
  localStorage.setItem('ccz-tutorial-completed', '1');
}

// New pattern (to add):
export function markNearMissComplete(): void {
  localStorage.setItem('ccz-near-miss-completed', '1');
}

export function markSensoryComplete(): void {
  localStorage.setItem('ccz-lesson-sensory-completed', '1');
}
```

### Pattern 2: loadCompletedLessons() State Reconstruction

**What:** Reads all three localStorage flags, derives `completedLessons` by filtering `CURRICULUM_LESSONS` in canonical order, derives `unlockedLessons` from the completion chain.
**When to use:** Called once in `mountTutorial()` to replace the binary `isFirstRun()` branch.

```typescript
// Pseudocode — exact variable names are Claude's discretion (D-03, D-04, D-05)
export function loadCompletedLessons(): {
  completedLessons: LessonId[];
  unlockedLessons: LessonId[];
  spinsObserved: 0;
} {
  const houseEdgeDone = localStorage.getItem('ccz-tutorial-completed') !== null;
  const nearMissDone = localStorage.getItem('ccz-near-miss-completed') !== null;
  const sensoryDone = localStorage.getItem('ccz-lesson-sensory-completed') !== null;

  // Canonical order enforced by CURRICULUM_LESSONS filter (NOT push order)
  const completedLessons = CURRICULUM_LESSONS.map((l) => l.id).filter((id) => {
    if (id === 'house-edge') return houseEdgeDone;
    if (id === 'near-miss') return nearMissDone;
    if (id === 'sensory-conditioning') return sensoryDone;
    return false;
  });

  // Unlock chain: always unlock house-edge; unlock near-miss if house-edge done; etc.
  const unlockedLessons: LessonId[] = ['house-edge'];
  if (houseEdgeDone) unlockedLessons.push('near-miss');
  if (nearMissDone) unlockedLessons.push('sensory-conditioning');

  return { completedLessons, unlockedLessons, spinsObserved: 0 };
}
```

### Pattern 3: mountTutorial() Fast-Path Replacement

**What:** Replace the binary `isFirstRun()` block (lines 509-518 of `main.ts`) with a `loadCompletedLessons()` call that merges reconstructed state into `createInitialTutorialState()`.
**When to use:** The new branch must handle 0-, 1-, 2-, and 3-lesson completion states.

```typescript
// BEFORE (lines 509-518, main.ts):
if (!isFirstRun()) {
  state = {
    ...state,
    currentStep: 'complete',
    completedSteps: TUTORIAL_STEPS.map((step) => step.id),
    unlockedLessons: ['house-edge', 'near-miss', 'sensory-conditioning'],
    completedLessons: ['house-edge'],
    cardsUnlocked: ['probability-seer', 'dopamine-dampener', 'house-edge'],
  };
}

// AFTER (replace with loadCompletedLessons()):
const loaded = loadCompletedLessons();
if (loaded.completedLessons.length > 0) {
  state = {
    ...state,
    unlockedLessons: loaded.unlockedLessons,
    completedLessons: loaded.completedLessons,
    spinsObserved: 0, // Always 0 (D-05)
    // cardsUnlocked: preserve existing logic for house-edge completers
    cardsUnlocked: loaded.completedLessons.includes('house-edge')
      ? ['probability-seer', 'dopamine-dampener', 'house-edge']
      : [],
    // currentStep: position to the last completed lesson's final step
    currentStep: loaded.completedLessons.includes('sensory-conditioning')
      ? 'sensory-conditioning-complete'
      : loaded.completedLessons.includes('near-miss')
        ? 'near-miss-complete'
        : 'complete',
  };
}
```

### Pattern 4: Skip Handler Near-Miss Persistence (D-06)

**What:** When `currentLesson === 'sensory-conditioning'` and the user clicks skip, near-miss was completed in a prior session but may not yet have been written to localStorage if the user is mid-flow. Write `ccz-near-miss-completed` before `completeCurrentLesson()`.
**When to use:** Inside the skip event handler, before the `completeCurrentLesson(state)` call.

```typescript
// In skip handler (~line 583, main.ts):
if (state.currentLesson === 'sensory-conditioning') {
  markNearMissComplete(); // Ensure near-miss is persisted before sensory completion
}
// ... then existing completeCurrentLesson(state) call
```

### Pattern 5: Contract Test Source-Grep Pattern

**What:** All 28 existing contract tests use `readWorkspaceFile(filePath)` to get raw TypeScript source as a string, then `assert.match(src, /regex/)` to confirm presence.
**When to use:** All four new assertions (D-08) must follow this exact pattern — no require/import of engine functions, no runtime execution.

```javascript
// Source: tests/casinocraftz-tutorial-contract.test.mjs — existing pattern
test('persistence keys are written at lesson completion checkpoints', () => {
  const engineSource = readWorkspaceFile('src/scripts/casinocraftz/tutorial/engine.ts');
  const mainSource = readWorkspaceFile('src/scripts/casinocraftz/tutorial/main.ts');

  // D-08: loadCompletedLessons export
  assert.match(engineSource, /export function loadCompletedLessons/);
  // D-08: ccz-near-miss-completed write
  assert.match(engineSource, /ccz-near-miss-completed/);
  // D-08: ccz-lesson-sensory-completed write
  assert.match(engineSource, /ccz-lesson-sensory-completed/);
  // D-08: skip handler near-miss write (D-06)
  assert.match(mainSource, /ccz-near-miss-completed/);
});
```

### Anti-Patterns to Avoid

- **JSON payload in localStorage:** Do not use `JSON.stringify` or versioned objects. The flag pattern (`'1'` / `=== null`) is established and sufficient.
- **Persisting `spinsObserved`:** Never write spin count to localStorage. Always reset to `0` in `loadCompletedLessons()` return value (D-05).
- **Push-order `completedLessons` array:** Never build `completedLessons` via `push` operations that depend on flag-check order. Always derive from `CURRICULUM_LESSONS.map(...).filter(...)` to guarantee canonical ordering.
- **FX code:** No animation classes, CSS keyframes, motion references, or audio hooks in this phase. All FX belongs to Phases 45-46.
- **Modifying Astro pages or dialogue.ts:** All content is pre-authored. Do not touch these files.
- **Runtime contract tests:** Do not instantiate engine functions in tests. All assertions must be source-grep patterns against raw TypeScript source strings.

## Don't Hand-Roll

| Problem                          | Don't Build                | Use Instead                                              | Why                                                          |
| -------------------------------- | -------------------------- | -------------------------------------------------------- | ------------------------------------------------------------ |
| Lesson unlock chain              | Custom unlock logic        | Extend existing `completeCurrentLesson()` in `engine.ts` | Chain logic already handles near-miss → sensory-conditioning |
| State reconstruction ordering    | Arbitrary insertion order  | `CURRICULUM_LESSONS.map(...).filter(...)`                | Canonical order is stable; filter ensures no ghost entries   |
| Source-level contract assertions | Runtime test instantiation | `readWorkspaceFile()` + `assert.match(/regex/)`          | Matches all 28 existing tests; fast, no build step needed    |

**Key insight:** The engine's unlock chain logic (`completeCurrentLesson`) already handles all three lesson transitions. `loadCompletedLessons()` only needs to read persisted flags and reconstruct the same state the engine would have produced, not re-implement the chain.

## Common Pitfalls

### Pitfall 1: fast-path `completedLessons` hardcode

**What goes wrong:** `mountTutorial()` lines 509-518 hardcode `completedLessons: ['house-edge']` regardless of actual history. A user who completed Lesson 2 and reloads sees Lesson 3 locked.
**Why it happens:** Fast-path was written when only Lesson 1 existed and never updated.
**How to avoid:** Replace the entire block with `loadCompletedLessons()` call. Do not patch the existing block — replace it entirely.
**Warning signs:** If the returned state from `loadCompletedLessons()` is merged shallowly and `completedLessons` defaults to the initial state `[]`, the branch still fires incorrectly.

### Pitfall 2: Skip handler near-miss persistence gap

**What goes wrong:** When user skips Lesson 3, the skip handler calls `completeCurrentLesson()` directly without ever writing `ccz-near-miss-completed`. On reload, `loadCompletedLessons()` sees no near-miss flag, so Lesson 3 appears locked again.
**Why it happens:** Skip bypasses both `proceedStep()` and `onSpinMessage()`, which are the natural write points. The near-miss flag was assumed to be written earlier, but may not have been if the user skipped Lesson 2 as well and the Lesson 2 skip only wrote the house-edge flag.
**How to avoid:** Write `ccz-near-miss-completed` explicitly inside the skip handler when `currentLesson === 'sensory-conditioning'` (D-06), before `completeCurrentLesson()`.
**Warning signs:** Contract assertion D-08 for `mainSource` matching `ccz-near-miss-completed` will fail if this write is absent.

### Pitfall 3: `spinsObserved` non-zero on resume

**What goes wrong:** If `loadCompletedLessons()` carries over a non-zero `spinsObserved` (e.g., from a serialized state), the 2-spin threshold in `sensory-conditioning-observe` fires on the first spin instead of the second.
**Why it happens:** `recordSpin()` increments then checks `>= requiresSpins`; if `spinsObserved` starts at 1, the threshold fires immediately.
**How to avoid:** `loadCompletedLessons()` must always return `spinsObserved: 0` — never read or persist this counter (D-05).
**Warning signs:** Any state reconstruction that omits an explicit `spinsObserved: 0` reset.

### Pitfall 4: `completedLessons` push-order gives wrong dataset value

**What goes wrong:** If `completedLessons` is built via push operations in flag-check order rather than `CURRICULUM_LESSONS` filter order, the array could be `['near-miss', 'house-edge']` instead of `['house-edge', 'near-miss']`. `syncRootDatasets` emits this as `data-casinocraftz-completed-lessons="near-miss,house-edge"`, which breaks contract assertions expecting `"house-edge,near-miss"`.
**Why it happens:** It is natural to push flags as they are checked, producing insertion-order rather than canonical order.
**How to avoid:** Always derive `completedLessons` from `CURRICULUM_LESSONS.map(l => l.id).filter(...)` (D-04).
**Warning signs:** Contract assertion checking `data-casinocraftzCompletedLessons` value against `'house-edge,near-miss'` fails; substring match may also fail.

### Pitfall 5: Missing `markNearMissComplete` / `markSensoryComplete` calls in `onSpinMessage`

**What goes wrong:** Persistence writes added only to `proceedStep()` but not to `onSpinMessage()`. Users who reach completion via spin (not button click) have no flag written.
**Why it happens:** `proceedStep()` and `onSpinMessage()` are parallel completion paths. Both contain `NEAR_MISS_COMPLETE_STEPS.includes(state.currentStep)` branches that call `completeCurrentLesson()`.
**How to avoid:** Add `markNearMissComplete()` / `markSensoryComplete()` calls alongside every `completeCurrentLesson()` call in both functions.
**Warning signs:** Manual test: complete Lesson 2 via spin, reload — Lesson 3 locked. Complete via button — Lesson 3 unlocked. Asymmetric behavior indicates incomplete wiring.

## Code Examples

### Verified completion checkpoint locations in main.ts

```typescript
// proceedStep() — lines 560-572 (verified in source)
if (HOUSE_EDGE_COMPLETE_STEPS.includes(state.currentStep)) {
  state = completeCurrentLesson(state);
  markTutorialComplete(); // existing house-edge write
  clearCard(root);
} else if (NEAR_MISS_COMPLETE_STEPS.includes(state.currentStep)) {
  state = completeCurrentLesson(state);
  // ADD: markNearMissComplete() here
  clearCard(root);
} else if (SENSORY_COMPLETE_STEPS.includes(state.currentStep)) {
  state = completeCurrentLesson(state);
  // ADD: markSensoryComplete() here
  clearCard(root);
}

// onSpinMessage() — lines 620-628 (verified in source)
if (HOUSE_EDGE_COMPLETE_STEPS.includes(state.currentStep)) {
  state = completeCurrentLesson(state);
  markTutorialComplete(); // existing house-edge write
} else if (NEAR_MISS_COMPLETE_STEPS.includes(state.currentStep)) {
  state = completeCurrentLesson(state);
  // ADD: markNearMissComplete() here
} else if (SENSORY_COMPLETE_STEPS.includes(state.currentStep)) {
  state = completeCurrentLesson(state);
  // ADD: markSensoryComplete() here
}
```

### Verified skip handler in main.ts (lines 579-606)

```typescript
// Skip handler — the relevant branch (verified in source):
skipButton.addEventListener(
  'click',
  () => {
    state = {
      ...state,
      currentStep:
        state.currentLesson === 'near-miss'
          ? 'near-miss-complete'
          : state.currentLesson === 'sensory-conditioning'
            ? 'sensory-conditioning-complete'
            : 'complete',
      completedSteps: [
        /* ... */
      ],
    };
    // ADD before completeCurrentLesson():
    // if (state.currentLesson === 'sensory-conditioning') markNearMissComplete();
    // if (state.currentLesson === 'near-miss' || state.currentLesson === 'sensory-conditioning') {
    //   markNearMissComplete / markSensoryComplete as appropriate
    // }
    state = completeCurrentLesson(state);
    if (state.currentLesson === 'house-edge') {
      markTutorialComplete();
    }
    clearCard(root);
    render();
  },
  { signal },
);
```

### Verified CURRICULUM_LESSONS canonical order (engine.ts lines 10-35)

```typescript
export const CURRICULUM_LESSONS: TutorialLesson[] = [
  { id: 'house-edge', stepIds: [...] },
  { id: 'near-miss', stepIds: [...] },
  { id: 'sensory-conditioning', stepIds: [...] },
];
// CURRICULUM_LESSONS.map(l => l.id) always produces:
// ['house-edge', 'near-miss', 'sensory-conditioning']
// Filter against this to guarantee completedLessons ordering.
```

### Verified Lesson 3 dialogue (dialogue.ts — all four steps confirmed)

All four sensory-conditioning step entries are present in `dialogue.ts` lines 264-367:

- `sensory-conditioning-intro`: narrator + system, EN + PT
- `sensory-conditioning-observe`: narrator + system, EN + PT
- `sensory-conditioning-reveal`: narrator + system, EN + PT (`do not alter RNG` / `nao alteram RNG` verified)
- `sensory-conditioning-complete`: narrator + system, EN + PT

No dialogue authoring is required for this phase.

## State of the Art

| Old Approach                                 | Current Approach                                     | When Changed    | Impact                                        |
| -------------------------------------------- | ---------------------------------------------------- | --------------- | --------------------------------------------- |
| Binary `isFirstRun()` branch (single lesson) | `loadCompletedLessons()` multi-lesson reconstruction | Phase 43 (this) | Enables 3-lesson returning-user state restore |
| `completedLessons: ['house-edge']` hardcode  | Derived from 3 localStorage flags in canonical order | Phase 43 (this) | Lesson 3 unlocks correctly on reload          |
| No persistence for Lesson 2/3 completion     | `markNearMissComplete()` + `markSensoryComplete()`   | Phase 43 (this) | Cross-session unlock chain works end-to-end   |

**Deprecated/outdated:**

- The `isFirstRun()` fast-path block at lines 509-518 of `main.ts` is the piece of code that must be replaced. Whether `isFirstRun()` itself is kept or removed is Claude's discretion — it is no longer used in `mountTutorial()` after this change.

## Environment Availability

Step 2.6: This phase is purely code changes with no external dependencies beyond the project's own modules. Node.js 22.22.1 (verified, meets >=22.12.0 requirement) and the contract test runner (`node:test`) are available. No external service availability check is needed.

| Dependency | Required By          | Available | Version         | Fallback |
| ---------- | -------------------- | --------- | --------------- | -------- |
| Node.js    | Contract test runner | Yes       | 22.22.1         | —        |
| TypeScript | Tutorial modules     | Yes       | via Astro build | —        |

## Validation Architecture

### Test Framework

| Property           | Value                                                       |
| ------------------ | ----------------------------------------------------------- |
| Framework          | `node:test` (built-in, Node.js 22.x)                        |
| Config file        | None — tests run directly via `node --test`                 |
| Quick run command  | `node --test tests/casinocraftz-tutorial-contract.test.mjs` |
| Full suite command | `node --test tests/*.test.mjs`                              |

### Phase Requirements → Test Map

| Req ID | Behavior                                                        | Test Type | Automated Command                                           | File Exists? |
| ------ | --------------------------------------------------------------- | --------- | ----------------------------------------------------------- | ------------ |
| EDU-70 | `loadCompletedLessons` exported from engine.ts                  | contract  | `node --test tests/casinocraftz-tutorial-contract.test.mjs` | Wave 0 gap   |
| EDU-70 | `ccz-near-miss-completed` written at near-miss completion       | contract  | `node --test tests/casinocraftz-tutorial-contract.test.mjs` | Wave 0 gap   |
| EDU-70 | Skip handler writes `ccz-near-miss-completed` for Lesson 3 skip | contract  | `node --test tests/casinocraftz-tutorial-contract.test.mjs` | Wave 0 gap   |
| EDU-71 | All 4 sensory dialogue steps present in EN/PT                   | contract  | `node --test tests/casinocraftz-tutorial-contract.test.mjs` | Yes (test 7) |
| EDU-73 | `ccz-lesson-sensory-completed` written at sensory completion    | contract  | `node --test tests/casinocraftz-tutorial-contract.test.mjs` | Wave 0 gap   |

### Sampling Rate

- **Per task commit:** `node --test tests/casinocraftz-tutorial-contract.test.mjs`
- **Per wave merge:** `node --test tests/casinocraftz-tutorial-contract.test.mjs`
- **Phase gate:** All 23 existing tests plus new assertions green before `/gsd:verify-work`

### Wave 0 Gaps

- [ ] New contract test block in `tests/casinocraftz-tutorial-contract.test.mjs` covering D-08 assertions:
  - `export function loadCompletedLessons` present in `engine.ts`
  - `ccz-near-miss-completed` present in `engine.ts`
  - `ccz-lesson-sensory-completed` present in `engine.ts`
  - `ccz-near-miss-completed` present in `main.ts` (skip handler D-06)

These assertions must be added as part of the implementation plan (not a separate test-first wave), since the source patterns they assert against do not exist yet.

## Open Questions

1. **Whether to remove `isFirstRun()` entirely**
   - What we know: After the `mountTutorial()` fast-path is replaced, `isFirstRun()` is no longer called anywhere in production code.
   - What's unclear: Whether any tests assert its presence (none visible in contract test file).
   - Recommendation: Keep `isFirstRun()` for now (lower-risk, avoids an unintentional test break). Claude may choose to remove it — no plan task needs to specify this either way.

2. **Skip handler: near-miss write when user also skipped Lesson 2**
   - What we know: If a user skipped Lesson 2, `mountTutorial()` fast-path for that session still set `completedLessons: ['house-edge']` (old code). The skip of Lesson 2 called `completeCurrentLesson()` which writes the unlock chain into `state`, but no localStorage flag was written for near-miss.
   - What's unclear: Whether the skip handler for Lesson 2 (i.e., `currentLesson === 'near-miss'`) also needs `markNearMissComplete()`. Based on D-06 wording, D-06 only specifies the Lesson 3 skip path. However, the same gap exists for Lesson 2 skip — the Lesson 2 skip handler also calls `completeCurrentLesson()` without writing near-miss flag.
   - Recommendation: Write `markNearMissComplete()` in the Lesson 2 skip branch too (when `currentLesson === 'near-miss'`), mirroring the same logic. This closes the gap symmetrically and costs one line. The planner should include this in the skip handler task.

## Sources

### Primary (HIGH confidence — direct source audit)

- `src/scripts/casinocraftz/tutorial/engine.ts` — `isFirstRun()` line 79, `markTutorialComplete()` line 83, `CURRICULUM_LESSONS` lines 10-35, `completeCurrentLesson()` lines 141-160, unlock chain lines 147-152
- `src/scripts/casinocraftz/tutorial/main.ts` — `mountTutorial()` fast-path lines 509-518, `proceedStep()` completion branches lines 560-572, skip handler lines 579-606, `onSpinMessage` completion branches lines 620-628, `NEAR_MISS_COMPLETE_STEPS` line 48, `SENSORY_COMPLETE_STEPS` line 49
- `src/scripts/casinocraftz/tutorial/dialogue.ts` — Lesson 3 entries lines 264-367, all four steps confirmed in EN and PT with correct roles
- `tests/casinocraftz-tutorial-contract.test.mjs` — 23 tests passing, source-grep pattern verified
- `.planning/research/SUMMARY.md` — Project research synthesis, all pitfall list items verified by direct code audit

### Secondary (MEDIUM confidence — planning context)

- `.planning/phases/43-persistence-wiring-unlock-trigger/43-CONTEXT.md` — locked decisions D-01 through D-08
- `.planning/REQUIREMENTS.md` — EDU-70, EDU-71, EDU-73 acceptance criteria
- `.planning/STATE.md` — v2.2 kickoff decisions confirming three-key localStorage pattern

## Metadata

**Confidence breakdown:**

- Standard stack: HIGH — no new dependencies; all patterns derived from existing codebase
- Architecture: HIGH — all component roles verified by direct source read; no inference from documentation
- Pitfalls: HIGH — all pitfalls identified from live code audit with specific line references
- Test infrastructure: HIGH — contract test runner confirmed operational at `node --test tests/casinocraftz-tutorial-contract.test.mjs`; 23/23 tests passing

**Research date:** 2026-04-04
**Valid until:** 2026-05-04 (stable codebase, no external dependencies)
