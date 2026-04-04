# Architecture Research

**Domain:** Casinocraftz v2.2 — Lesson 3 Sensory Conditioning Content
**Researched:** 2026-04-04
**Confidence:** HIGH (all findings from direct source inspection)

## System Overview

```
┌────────────────────────────────────────────────────────────────────────────┐
│  Astro Pages (static, SSG)                                                 │
│  src/pages/en/casinocraftz/index.astro                                     │
│  src/pages/pt/casinocraftz/index.astro                                     │
│                                                                            │
│  Shell root: [data-casinocraftz-shell-root]                                │
│  Zones: foundation | games | curriculum | tutorial | cards                 │
│  Dataset anchors: all EN/PT strings embedded as data-* at build time       │
└──────────────────────────────┬─────────────────────────────────────────────┘
                               │  astro:page-load
                               ▼
┌────────────────────────────────────────────────────────────────────────────┐
│  Tutorial Mount (main.ts: mountTutorial)                                   │
│                                                                            │
│  ┌─────────────┐  ┌─────────────────┐  ┌──────────────────────────────┐   │
│  │  engine.ts  │  │  dialogue.ts    │  │  cards.ts                    │   │
│  │             │  │                 │  │                              │   │
│  │ TutorialState│  │ DIALOGUE_REGISTRY│  │ STARTER_CARDS               │   │
│  │ CURRICULUM  │  │ getDialogue()   │  │ applyCard()                  │   │
│  │ TUTORIAL_   │  │                 │  │ clearCard()                  │   │
│  │ STEPS       │  └─────────────────┘  └──────────────────────────────┘   │
│  │ advanceStep │                                                           │
│  │ recordSpin  │  ┌─────────────────┐                                     │
│  │ completeLssn│  │  essence.ts     │                                     │
│  │ openLesson  │  │ awardEssence()  │                                     │
│  └─────────────┘  └─────────────────┘                                     │
│                                                                            │
│  Spin-Bridge Observer: window.addEventListener('message', onSpinMessage)   │
│  Next/Skip button handlers (AbortController cleanup on page swap)          │
└──────────────────────────────┬─────────────────────────────────────────────┘
                               │  ccz:spin-settled postMessage
                               ▼
┌────────────────────────────────────────────────────────────────────────────┐
│  Slots Runtime (src/scripts/slots/main.ts)                                 │
│                                                                            │
│  Dispatches: window.postMessage({ type: 'ccz:spin-settled', version: 1,   │
│              payload: { spinIndex } })                                     │
│  Authority: all RNG / payout / economy decisions stay inside Slots         │
└────────────────────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────────────────────┐
│  Persistence (localStorage)                                                │
│                                                                            │
│  ccz-tutorial-completed   — marks house-edge lesson done (first-run gate)  │
│  ccz-wallet               — shared AI Essence wallet                       │
└────────────────────────────────────────────────────────────────────────────┘
```

## Component Responsibilities

| Component                                       | Responsibility                                                                                                              | Status for v2.2                                                                                                                                       |
| ----------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| `engine.ts`                                     | Pure state transitions — `advanceTutorialStep`, `recordSpin`, `completeCurrentLesson`, `openLesson` with unlock chain       | Already implemented for Lesson 3. `unlockedLessons.push('sensory-conditioning')` fires when near-miss completes.                                      |
| `dialogue.ts`                                   | `DIALOGUE_REGISTRY` keyed by `TutorialStepId` with EN/PT string maps                                                        | Already implemented. All 4 Lesson 3 step IDs have EN/PT entries.                                                                                      |
| `types.ts`                                      | `TutorialStepId` union, `LessonId` union, `TutorialState` interface, bridge event types                                     | Already implemented. Sensory conditioning step IDs and `LessonId` variant present.                                                                    |
| `main.ts`                                       | Mount function, spin-bridge observer, `renderCurriculum`, `renderDialogue`, `renderCards`, `syncRootDatasets`, skip handler | Already implemented. Lesson 3 steps in `REPLAY_ENABLED_STEPS`, `SENSORY_COMPLETE_STEPS`, step labels, recap copy, and skip logic are all wired.       |
| `en/casinocraftz/index.astro`                   | Shell HTML with all dataset anchors for EN strings including all sensory-conditioning step labels and causality copy        | Already implemented. All `data-casinocraftz-step-sensory-conditioning-*` and `data-casinocraftz-lesson-sensory-conditioning-*` attributes present.    |
| `pt/casinocraftz/index.astro`                   | PT counterpart — same dataset anchors with PT i18n keys                                                                     | Already implemented with same completeness as EN page.                                                                                                |
| `src/i18n/en.json`                              | EN translation strings for all tutorial steps and curriculum copy                                                           | Already has `tutorial.step.sensoryConditioning*.label`, `tutorial.lesson.sensoryConditioning.*`, `tutorial.causality.sensoryReveal`.                  |
| `src/i18n/pt.json`                              | PT translation strings — parity with EN                                                                                     | Already has all matching keys.                                                                                                                        |
| `tests/casinocraftz-tutorial-contract.test.mjs` | Source contracts asserting types, dialogue, engine, and skip handler for Lesson 3                                           | Contract assertions for sensory-conditioning step IDs, `unlockedLessons.push`, anti-manipulation messaging, and skip handler mapping already written. |

## Critical Finding: Lesson 3 Content Is Already Authored

After direct source inspection, the following are confirmed present:

- `DIALOGUE_REGISTRY` entries for all 4 sensory-conditioning steps in both EN and PT
- `CURRICULUM_LESSONS[2]` defined as `{ id: 'sensory-conditioning', stepIds: [...] }` with all 4 step IDs
- `TUTORIAL_STEPS` entries for all 4 sensory-conditioning steps including `requiresSpins: 2` on `sensory-conditioning-observe`
- `recordSpin()` already matches on `'sensory-conditioning-observe'` as a spin-gated step
- `completeCurrentLesson()` already unlocks `'sensory-conditioning'` when `currentLesson === 'near-miss'`
- Skip handler already maps `currentLesson === 'sensory-conditioning'` to `'sensory-conditioning-complete'`
- `SENSORY_COMPLETE_STEPS` constant wiring completion in both `proceedStep` (UI path) and `onSpinMessage` (bridge path)
- Step labels for all 4 sensory steps in `syncRootDatasets`
- Recap disclosure in `renderDialogue` for `'sensory-conditioning-reveal'` with `casinocraftzCausalitySensoryReveal` copy key
- All sensory dataset anchors on both EN and PT shell pages
- All EN/PT i18n keys with required anti-manipulation phrasing

## Actual Gap: Persistence Is Binary, Not Per-Lesson

The v2.2 requirements specify `EDU-70` (Lesson 3 accessible after Lesson 2 completion) and `EDU-73` (Lesson 3 completion persisted). These are the actual open gaps.

### Current Persistence Model

Only one localStorage key exists for lesson state: `ccz-tutorial-completed`. This is written by `markTutorialComplete()` when the house-edge lesson completes.

The `isFirstRun()` check reads this single key. In `mountTutorial`, the non-first-run branch hard-codes:

```typescript
completedLessons: ['house-edge'],       // near-miss NOT marked complete
unlockedLessons: ['house-edge', 'near-miss', 'sensory-conditioning'],
```

This means returning users see all lessons unlocked in the curriculum but the `completedLessons` array does not reflect whether near-miss or sensory-conditioning were actually completed in a prior session.

### Impact

- **EDU-70**: The curriculum card for Lesson 3 correctly shows `locked` for first-time users (because `unlockedLessons` starts as `['house-edge']`). But after near-miss completes and the user navigates away then returns, Lesson 3 shows as unlocked without Lesson 2 being marked complete in `completedLessons`. The lesson progression display is inconsistent with actual history.
- **EDU-73**: Sensory conditioning completion is not written to localStorage, so a completed Lesson 3 resets to `active` on next page load.

## Recommended Architecture for v2.2

### Persistence Layer Extension (No New Modules)

Introduce per-lesson completion flags in localStorage. This avoids serializing TutorialState (which would create a schema migration problem) while giving each lesson independent persistence.

```
Proposed localStorage keys:
  ccz-tutorial-completed          (existing) — house-edge completion flag
  ccz-lesson-near-miss-completed  (new)      — near-miss completion flag
  ccz-lesson-sensory-completed    (new)      — sensory-conditioning completion flag
```

Changes are confined to `engine.ts` and `main.ts` only.

**engine.ts additions:**

- `markNearMissComplete()` — writes `ccz-lesson-near-miss-completed`
- `markSensoryComplete()` — writes `ccz-lesson-sensory-completed`
- `loadCompletedLessons()` — reads all three keys, returns `{ completedLessons: LessonId[], unlockedLessons: LessonId[] }` derived from the chain logic

**main.ts changes:**

- Replace the binary `isFirstRun()` branch with a call to `loadCompletedLessons()` during state initialization
- In `proceedStep()`: at the `NEAR_MISS_COMPLETE_STEPS` check, call `markNearMissComplete()`; at the `SENSORY_COMPLETE_STEPS` check, call `markSensoryComplete()`
- In `onSpinMessage()`: same two calls at the same check points

## Files: New vs Modified vs Unchanged

| File                                            | Action    | Why                                                                                                |
| ----------------------------------------------- | --------- | -------------------------------------------------------------------------------------------------- |
| `src/scripts/casinocraftz/tutorial/engine.ts`   | Modify    | Add `markNearMissComplete`, `markSensoryComplete`, `loadCompletedLessons`                          |
| `src/scripts/casinocraftz/tutorial/main.ts`     | Modify    | Replace `isFirstRun()` branch; call new mark functions from both `proceedStep` and `onSpinMessage` |
| `tests/casinocraftz-tutorial-contract.test.mjs` | Modify    | Assert new engine exports and persistence key writes                                               |
| `src/scripts/casinocraftz/tutorial/dialogue.ts` | Unchanged | All Lesson 3 content already present                                                               |
| `src/scripts/casinocraftz/tutorial/types.ts`    | Unchanged | All Lesson 3 types already present                                                                 |
| `src/scripts/casinocraftz/tutorial/cards.ts`    | Unchanged | No card changes for this lesson                                                                    |
| `src/scripts/casinocraftz/tutorial/essence.ts`  | Unchanged | Essence rewards already wired                                                                      |
| `src/pages/en/casinocraftz/index.astro`         | Unchanged | All dataset anchors already present                                                                |
| `src/pages/pt/casinocraftz/index.astro`         | Unchanged | All dataset anchors already present                                                                |
| `src/i18n/en.json`                              | Unchanged | All Lesson 3 keys present                                                                          |
| `src/i18n/pt.json`                              | Unchanged | All Lesson 3 keys present                                                                          |

## Data Flow

### Lesson 3 Unlock Flow (First-Time Path)

```
User completes near-miss-complete step
    |
    v
proceedStep() or onSpinMessage() hits NEAR_MISS_COMPLETE_STEPS check
    |
    v
completeCurrentLesson(state) adds 'near-miss' to completedLessons
    + unlockedLessons.push('sensory-conditioning')
markNearMissComplete() writes ccz-lesson-near-miss-completed to localStorage
    |
    v
render() → renderCurriculum() renders Lesson 3 card with status 'active'
    |
    v
User navigates away and returns (page reload)
    |
    v
mountTutorial fires on astro:page-load
loadCompletedLessons() reads all keys:
  ccz-tutorial-completed           → 'house-edge' in completedLessons
  ccz-lesson-near-miss-completed   → 'near-miss' in completedLessons
  (ccz-lesson-sensory-completed absent) → sensory-conditioning not in completedLessons
  → unlockedLessons = ['house-edge', 'near-miss', 'sensory-conditioning'] (chain)
    |
    v
Lesson 3 card renders as 'active', Lessons 1+2 render as 'complete'
```

### Lesson 3 Spin-Bridge Progression Flow

```
User is in sensory-conditioning-observe step (spinsObserved < 2)
    |
    v
User spins in /en/slots/ or /pt/slots/
    |
    v
Slots main.ts fires:
  window.postMessage({ type: 'ccz:spin-settled', version: 1, payload: { spinIndex } })
    |
    v
onSpinMessage() receives MessageEvent
parseSpinSettledBridgeEvent(event.data) validates envelope → { spinIndex: N }
    |
    v
recordSpin(state):
  spinsObserved++ → now 1
  currentStep still 'sensory-conditioning-observe' (threshold not reached)
syncRootDatasets() updates data-ccz-spins-observed
    |
    v
Second spin arrives → recordSpin(state):
  spinsObserved++ → now 2
  requiresSpins for 'sensory-conditioning-observe' is 2
  advanceTutorialStep() → currentStep = 'sensory-conditioning-reveal'
  lastTransitionTrigger = 'spin'
    |
    v
render() → renderDialogue() for 'sensory-conditioning-reveal':
  Shows main dialogue messages
  lastTransitionTrigger === 'spin': renders recap <details> with
    casinocraftzCausalitySensoryReveal copy
    |
    v
User clicks Next twice (reveal → complete)
proceedStep() hits SENSORY_COMPLETE_STEPS:
  completeCurrentLesson(state)
  markSensoryComplete() → writes ccz-lesson-sensory-completed
  clearCard(root)
  render()
```

### Authority Boundary

```
Slots (RNG / payout / economy)      Tutorial (step state / lesson progress)
─────────────────────────────────   ─────────────────────────────────────────
All outcome decisions               Observes spin count only
No read access to tutorial state    No read access to Slots internals
                 |                            ^
                 └── postMessage ─────────────┘
                     { type: 'ccz:spin-settled', version: 1,
                       payload: { spinIndex } }
```

This boundary is enforced by contract test assertions: `engine.ts`, `cards.ts`, and `main.ts` must not import from `slots/rng`, `slots/payout`, or `slots/economy`.

## Build Order for Phases 43 and 44

### Phase 43: Persistence Wiring and Unlock Trigger (EDU-70, EDU-73)

All work is in `engine.ts` and `main.ts`. No HTML, no i18n, no dialogue changes.

**Dependency order (each step unblocks the next):**

1. Add `markNearMissComplete()` and `markSensoryComplete()` to `engine.ts`
   — These are write-only functions. Safe to add before they are called.

2. Add `loadCompletedLessons()` to `engine.ts`
   — Reads all three keys. Returns hydrated `completedLessons` and derived `unlockedLessons`.
   — Depends on step 1 to know which keys to read.

3. Update `mountTutorial` in `main.ts` to replace the binary `isFirstRun()` branch
   — Call `loadCompletedLessons()` and merge into initial state.
   — Depends on step 2.

4. Add `markNearMissComplete()` call in `proceedStep` at `NEAR_MISS_COMPLETE_STEPS` check
   — Depends on step 1 being exported.

5. Add `markSensoryComplete()` call in `proceedStep` at `SENSORY_COMPLETE_STEPS` check
   — Depends on step 1 being exported.

6. Repeat steps 4 and 5 for the `onSpinMessage` path
   — Both paths must write persistence to avoid state divergence between UI-button and spin-triggered completions.

7. Add contract assertions for new engine exports and persistence key writes

### Phase 44: Spin-Bridge Threshold, Causality Copy, EN/PT Parity Lock (EDU-71, EDU-72)

All content is already implemented. Phase 44 is verification and confidence lock.

**Task order:**

1. Verify `recordSpin()` integration with the new persistence model: Lesson 3 observe step advances at exactly spin count 2. Run engine unit tests if they exist; otherwise add a contract assertion.

2. Verify causality recap renders: `lastTransitionTrigger === 'spin'` at `sensory-conditioning-reveal` shows the `<details>` element with correct copy from `casinocraftzCausalitySensoryReveal`.

3. Run `casinocraftz-tutorial-contract.test.mjs` — existing `sensory-conditioning lesson contracts` test passes; new persistence assertions from Phase 43 pass.

4. Run `compatibility-contract.test.mjs` — EN/PT dataset parity and anti-manipulation copy checks pass.

5. Verify curriculum progress bar reflects state after a full Lesson 3 completion and reload round-trip.

6. Document release evidence (observable state transitions for each EDU requirement).

## Integration Points

### Internal Boundaries

| Boundary                 | Communication                                                | Notes                                                                                                                  |
| ------------------------ | ------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------- |
| Slots → Casinocraftz     | `window.postMessage` (ccz:spin-settled, v1 envelope)         | One-way only. `parseSpinSettledBridgeEvent` validates version, type, and spinIndex. Unknown versions silently ignored. |
| engine.ts → localStorage | Direct `localStorage.getItem/setItem` in mark/load functions | No abstraction layer. engine.ts is the sole writer for lesson completion keys.                                         |
| Astro shell → main.ts    | Dataset attributes on `[data-casinocraftz-shell-root]`       | All EN/PT strings injected at build time. No runtime i18n fetching.                                                    |
| main.ts → engine.ts      | Direct function calls (pure functions returning new state)   | No events, no shared mutable state. State object passed forward immutably.                                             |
| main.ts → dialogue.ts    | `getDialogue(stepId, lang)` call                             | Returns `DialogueMessage[]` from `DIALOGUE_REGISTRY`.                                                                  |

### External Services

None for this milestone. All lesson state is client-side with localStorage persistence.

## Anti-Patterns

### Anti-Pattern 1: Adding New HTML to the Astro Shell for Lesson 3

**What people do:** Add new `<section>` or curriculum card HTML blocks to the Astro pages for Lesson 3 specifically.

**Why it's wrong:** The curriculum zone is rendered entirely by `renderCurriculum()` from TypeScript. Adding shell HTML for one lesson breaks the data-driven rendering pattern and creates a maintenance split between the Astro template and the TypeScript renderer.

**Do this instead:** All lesson UI is generated by `renderCurriculum()` from the `CURRICULUM_LESSONS` array. The Astro shell provides dataset anchors for string keys only — not structural HTML per lesson.

### Anti-Pattern 2: Writing New i18n Keys for Lesson 3

**What people do:** Add new `tutorial.lesson.sensoryConditioning.*` keys to the JSON files, assuming they are missing.

**Why it's wrong:** All Lesson 3 i18n keys are already present in both `en.json` and `pt.json` and covered by the tutorial contract parity assertion. Adding duplicates or renamed keys breaks the existing contract without providing value.

**Do this instead:** Use the existing keys. The dataset anchors already reference them and the contract tests already verify EN/PT parity.

### Anti-Pattern 3: Serializing Full TutorialState to localStorage

**What people do:** Store the entire `TutorialState` object as JSON, then deserialize on load.

**Why it's wrong:** Couples persistence format to in-memory state shape. If `TutorialState` evolves, stale localStorage payloads silently corrupt state. Creates a schema migration problem with no tooling.

**Do this instead:** Persist only boolean completion signals per lesson (simple string keys). Derive full state by running the chain logic from those signals on every mount. `loadCompletedLessons()` re-runs the unlock chain from persisted signals rather than storing its output.

### Anti-Pattern 4: Importing Slots Modules from Tutorial Scripts

**What people do:** Read Slots RNG state, spin history, or outcome data directly from tutorial scripts to detect near-miss patterns.

**Why it's wrong:** Violates the authority boundary contract enforced by contract tests. The tutorial observes spin count only via postMessage — it never reads Slots internal state.

**Do this instead:** Rely exclusively on the `ccz:spin-settled` postMessage bridge. The tutorial counts events by incrementing `spinsObserved` — it does not inspect what the spin outcome was.

## Sources

- Direct inspection: `src/scripts/casinocraftz/tutorial/engine.ts`
- Direct inspection: `src/scripts/casinocraftz/tutorial/dialogue.ts`
- Direct inspection: `src/scripts/casinocraftz/tutorial/main.ts`
- Direct inspection: `src/scripts/casinocraftz/tutorial/types.ts`
- Direct inspection: `src/pages/en/casinocraftz/index.astro`
- Direct inspection: `src/pages/pt/casinocraftz/index.astro`
- Direct inspection: `src/i18n/en.json` and `src/i18n/pt.json`
- Direct inspection: `tests/casinocraftz-tutorial-contract.test.mjs`
- Direct inspection: `tests/compatibility-contract.test.mjs`
- Project context: `.planning/PROJECT.md` (v2.2 requirements EDU-70 through EDU-73)
- Project context: `.planning/FUTURE-MILESTONES.md` (Phase 43-44 sketch)

---

_Architecture research for: Casinocraftz v2.2 Sensory Conditioning Content_
_Researched: 2026-04-04_
