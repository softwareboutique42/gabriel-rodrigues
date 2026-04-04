# Domain Pitfalls: v2.2 Sensory Conditioning Content

**Domain:** Lesson 3 unlock and content integration — Casinocraftz casino-education web app
**Researched:** 2026-04-04
**Confidence:** HIGH (all pitfalls grounded in direct code audit of live codebase)

---

## Critical Pitfalls

Mistakes in this category cause user-visible bugs that break the lesson progression promise or silently corrupt state.

---

### Pitfall 1: Returning-User Fast-Path Does Not Reconstruct Lesson 2 Completion

**Phase:** 43 (primary gap for EDU-70)

**What goes wrong:**

`isFirstRun()` in `engine.ts` (line 79) returns `false` when `ccz-tutorial-completed` is set in localStorage. The `mountTutorial()` fast-path that runs in this branch (lines 509-518 of `main.ts`) hardcodes:

```typescript
completedLessons: ['house-edge'],
```

It does NOT include `'near-miss'`. A user who completed Lesson 2 and reloads the page finds the curriculum showing Lesson 3 as locked — because `lessonStatus()` checks `completedLessons` to determine whether `completeCurrentLesson()` already ran the unlock chain for `'near-miss'` to `'sensory-conditioning'`.

The fast-path was written when only Lesson 1 existed. It was never updated for multi-lesson state.

**Why it happens:**

`ccz-tutorial-completed` is a binary flag — it only records that Lesson 1 finished (`markTutorialComplete()` is called only inside the `HOUSE_EDGE_COMPLETE_STEPS` branch). Lessons 2 and 3 have no equivalent `markLessonComplete()` call that writes to localStorage. Completion lives entirely in in-memory `TutorialState.completedLessons`. On page reload, that memory is gone.

**Consequences:**

- Returning users who finished Lesson 2 see Lesson 3 as permanently locked
- EDU-70 is not satisfied for returning users — only for first-session flows
- The curriculum UI renders `data-casinocraftz-lesson-state="locked"` for `sensory-conditioning` even though the user earned the unlock

**Prevention:**

Add a lightweight persistence call when Near-Miss completes. The pattern already used for `ccz-tutorial-completed` is the right model. Add a parallel `localStorage.setItem('ccz-near-miss-completed', '1')` call in the `NEAR_MISS_COMPLETE_STEPS` branch of `proceedStep()` and `onSpinMessage` in `main.ts`. Then in the `!isFirstRun()` fast-path, check `localStorage.getItem('ccz-near-miss-completed')` and include `'near-miss'` in `completedLessons` and `'sensory-conditioning'` in `unlockedLessons` when the flag is present.

Do NOT serialize the full `TutorialState` to localStorage — that is explicitly flagged as over-engineering in STACK.md and introduces a deserialization surface that would need migration handling in future milestones.

**Detection:**

- Contract test: mount tutorial with `ccz-tutorial-completed` set AND `ccz-near-miss-completed` set, assert `data-casinocraftz-completed-lessons` contains `near-miss` and Lesson 3 card is not disabled
- Manual: complete Lesson 2, reload page, verify Lesson 3 card shows "ACTIVE" not "LOCKED"

---

### Pitfall 2: Skip Button on Lesson 3 Does Not Persist Near-Miss Completion Before Skipping

**Phase:** 43

**What goes wrong:**

The skip button handler in `main.ts` (lines 580-606) immediately transitions `currentStep` to `sensory-conditioning-complete` and calls `completeCurrentLesson(state)`. This correctly marks `sensory-conditioning` as complete in the in-memory `completedLessons`. However, it does NOT call any persistence that records near-miss completion — because the skip path was already past that lesson.

If `ccz-near-miss-completed` is not in localStorage when the skip fires (e.g. a user somehow opens Lesson 3 and immediately skips before Lesson 2 was persisted), a page reload would lose both the Lesson 2 and Lesson 3 completion signals and revert the curriculum to the post-Lesson-1 state.

**Why it happens:**

The skip handler was designed for the current-lesson boundary only. It does not audit what should have been persisted for previous lessons. Near-miss persistence is a new contract that does not exist yet — the skip handler cannot retroactively satisfy it unless explicitly written to do so.

**Consequences:**

Less severe than Pitfall 1 because skip is a deliberate action, but a user who skips Lesson 3 and reloads sees an inconsistent state — Lesson 3 dialogue zone reflects completion but the curriculum card reverts to locked if the fast-path does not find the right signals.

**Prevention:**

When writing the `ccz-near-miss-completed` persistence call (per Pitfall 1 fix), also invoke it inside the skip handler before calling `completeCurrentLesson()` when `state.currentLesson === 'sensory-conditioning'`. This ensures the skip path is covered by the same guard.

**Detection:**

- Contract: complete Lesson 2 (persist flag), open Lesson 3 via `handleLessonOpen`, click skip, reload — assert Lesson 3 card still reflects completion

---

### Pitfall 3: `spinsObserved` Non-Zero on Resume Breaks the 2-Spin Threshold

**Phase:** 44 (spin-bridge threshold work)

**What goes wrong:**

`openLesson()` in `engine.ts` (line 162) correctly resets `spinsObserved: 0`. The pitfall is introduced if a developer adds a "resume from last step" feature as part of fixing Pitfall 1 and forgets to reset `spinsObserved`. A user resuming at `sensory-conditioning-observe` with `spinsObserved: 1` (from a botched resume) would need only one more spin to advance — the threshold fires after one observation spin instead of two.

`recordSpin()` in `engine.ts` (lines 106-123) uses `state.spinsObserved + 1` unconditionally. The threshold check is `nextSpinCount >= requiredSpins`. If the counter starts at 1 due to a botched resume, `nextSpinCount` on the first spin is 2, which satisfies `>= 2` — advancing immediately.

**Consequences:**

The 2-spin observation gate in `sensory-conditioning-observe` fires too early, skipping to `sensory-conditioning-reveal` after only one actual observation spin. The educational pacing of the step is broken.

**Prevention:**

Any state reconstruction code added in Phase 43 to fix Pitfall 1 must explicitly set `spinsObserved: 0` when the current step is reconstructed. Never carry `spinsObserved` forward from a persisted token. The current `openLesson()` implementation is safe; the risk is introduced only if careless extension restores a partial step position without resetting the counter.

**Detection:**

- Unit test `recordSpin()`: with `spinsObserved: 0` and `requiresSpins: 2`, spin 1 must NOT advance the step, spin 2 MUST
- Unit test failure case: with `spinsObserved: 1` and `requiresSpins: 2`, spin 1 DOES advance — document this as the guard to prevent

---

## Moderate Pitfalls

Mistakes that cause test failures, parity drift, or subtle UX issues without catastrophic state loss.

---

### Pitfall 4: Spin-Bridge Double-Fire in Playwright Tests

**Phase:** 44

**What goes wrong:**

The `onSpinMessage` handler in `main.ts` (lines 608-638) calls `recordSpin(state)` and checks whether `state.currentStep` changed. If a Playwright test injects two `ccz:spin-settled` events synchronously in a single `page.evaluate()` call without a microtask break between them, both handlers read the same closure-captured `state` before the first one's mutation is reflected. With `requiresSpins: 2` and `spinsObserved` at 0, each call computes `nextSpinCount: 1` and neither fires the advance — the test then incorrectly observes that two spins were NOT enough.

The inverse bug: if `spinsObserved` is already at 1 when two events arrive simultaneously, both compute `nextSpinCount: 2`, both call `advanceTutorialStep`, and the second call fires on an already-advanced state. The `index === stepOrder.length - 1` guard prevents out-of-bounds, but `render()` and `celebrateTutorialAdvance()` both run twice.

**Why it happens:**

JavaScript is single-threaded so true concurrent reads are impossible in production (the message handler is async, state is updated before the next handler runs). The risk is isolated to test helpers that fire bridge events without awaiting state updates.

**Consequences:**

In production: harmless. In tests: flaky assertions on `data-casinocraftz-spins-observed` or step advancement after two rapid injections.

**Prevention:**

In Playwright tests, await a `data-casinocraftz-tutorial-step` attribute assertion (or at minimum `page.waitForTimeout(50)`) between spin injections. Do not fire both bridge events in one synchronous `evaluate()` call without a microtask break.

**Detection:**

- If the 2-spin gate contract test intermittently passes or fails, check whether both events are injected in the same `evaluate()` call

---

### Pitfall 5: `sensoryConditioningSoon` Copy Renders After Lesson 3 Unlocks if Attribute Is Removed

**Phase:** 43

**What goes wrong:**

In `renderCurriculum()` (lines 255-263 of `main.ts`), the Lesson 3 description appends `.sensoryConditioningSoon` only when `status === 'locked'`. The conditional is correct. The pitfall is in `buildLessonCopy()` (line 173):

```typescript
sensoryConditioningSoon:
  root.dataset.casinocraftzLessonSensoryConditioningSoon ?? 'Locked for a later phase.',
```

If a developer removes the `data-casinocraftz-lesson-sensory-conditioning-soon` attribute from either the EN or PT Astro page (thinking it is dead code once Lesson 3 is active), the fallback hardcodes English text "Locked for a later phase." on both routes. The PT page would show English fallback copy if the lesson is locked — a parity failure that the `extractCasinocraftzDatasetNames` compatibility contract would NOT catch (it checks attribute name presence, not value resolution).

**Consequences:**

PT users see English fallback text in the curriculum card for Lesson 3 when it is locked.

**Prevention:**

Do not remove `data-casinocraftz-lesson-sensory-conditioning-soon` from either Astro page. The `.soon` string is inert once unlocked (never reaches the conditional) but must stay present to keep the fallback chain correct. Add an explicit contract assertion for this attribute in Phase 44 parity lock.

**Detection:**

- Compatibility contract test: assert `enCasinocraftz` and `ptCasinocraftz` both match `data-casinocraftz-lesson-sensory-conditioning-soon`

---

### Pitfall 6: `completedLessons` Array Ordering in the Fast-Path Reconstruction

**Phase:** 43

**What goes wrong:**

`syncRootDatasets()` writes:

```typescript
root.dataset.casinocraftzCompletedLessons = state.completedLessons.join(',');
```

If the fast-path reconstruction builds `completedLessons` by conditionally pushing flags in check order rather than deriving from curriculum order, the resulting string may be `'near-miss,house-edge'` instead of `'house-edge,near-miss'`. Any Playwright assertion that checks the dataset string value as a substring will be fragile — and any future code that parses this string and assumes lesson order will break.

**Consequences:**

Test fragility. Potentially misleading audit evidence from dataset inspection.

**Prevention:**

When building the reconstructed `completedLessons` array in the fast-path, always derive ordering from `CURRICULUM_LESSONS.map(l => l.id).filter(id => /* flag is set */)` rather than pushing flags in arbitrary check order. This guarantees curriculum-canonical ordering regardless of which flags exist.

**Detection:**

- Contract test: assert `data-casinocraftz-completed-lessons` value is `'house-edge,near-miss'` when both flags are set (not just that it contains both substrings)

---

### Pitfall 7: Scope Bleed — Sensory FX Elements in v2.2

**Phase:** 43-44

**What goes wrong:**

v2.3 (Phases 45-46) is explicitly scoped to add win-celebration effects (neon pulse, reel glow) and the Dopamine Dampener suppression wiring. A developer implementing Lesson 3 dialogue might add `data-slots-win-glow` class hooks or CSS animation calls alongside the sensory conditioning copy because the lesson talks about lights and sounds. This is scope bleed.

**Consequences:**

Ships unreviewed FX code that belongs to v2.3, potentially breaking `prefers-reduced-motion` contracts before the FX-72 requirement is addressed. Creates a premature surface that v2.3 must reconcile or work around.

**Prevention:**

Lesson 3 explains sensory conditioning through text dialogue only. No visual effects, no CSS animation hooks, no audio references in code (only in copy). All effects work is Phase 45-46. STACK.md anti-feature table explicitly calls this out.

**Detection:**

- Phase 44 parity contract should assert that no new `prefers-reduced-motion` media query appears in the casinocraftz Astro pages or tutorial scripts as part of v2.2

---

### Pitfall 8: `data-casinocraftz-causality-sensory-reveal` Fallback Diverges from i18n Source

**Phase:** 44

**What goes wrong:**

`buildCardCopy()` in `main.ts` (lines 358-361) provides a hardcoded English fallback string for `sensoryRevealCausality`. The canonical value lives in `en.json` key `tutorial.causality.sensoryReveal` and is injected via the Astro attribute `data-casinocraftz-causality-sensory-reveal`. If a developer edits `en.json` to refine copy but does not update the hardcoded fallback, the two drift apart. The fallback is shown only when the attribute is missing — but it is invisible in source-level contract tests (which read the Astro file with the attribute present, never the rendered DOM with the attribute absent).

**Consequences:**

Minor — affects only degraded/fallback path. No user should normally hit this unless the Astro attribute is accidentally removed. Risk is primarily copy inconsistency.

**Prevention:**

Treat hardcoded fallbacks in `buildCardCopy()` as emergency guards, not canonical copy. Any copy edit must update `en.json` and `pt.json` as the source of truth. Do not edit fallback strings independently.

**Detection:**

- Code review: compare `tutorial.causality.sensoryReveal` in `en.json` against the fallback string in `buildCardCopy()` at PR time

---

## Phase-Specific Warnings

| Phase | Topic                                        | Likely Pitfall                                                                                               | Mitigation                                                                                                                     |
| ----- | -------------------------------------------- | ------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------ |
| 43    | Returning-user state reconstruction (EDU-70) | Pitfall 1: fast-path hardcodes `completedLessons: ['house-edge']`; Lesson 3 stays locked for returning users | Add `ccz-near-miss-completed` localStorage flag; update fast-path branch to read it                                            |
| 43    | Skip button persistence                      | Pitfall 2: skip on Lesson 3 does not persist near-miss completion signal                                     | Write `ccz-near-miss-completed` in skip handler before `completeCurrentLesson()` when current lesson is `sensory-conditioning` |
| 43    | `.soon` copy suppression                     | Pitfall 5: `sensoryConditioningSoon` attribute accidentally removed; PT fallback defaults to English         | Keep attribute in both Astro pages; add contract assertion                                                                     |
| 43    | `completedLessons` array order               | Pitfall 6: push order in fast-path does not match curriculum order                                           | Derive array from `CURRICULUM_LESSONS` filter                                                                                  |
| 44    | Spin-bridge 2-spin gate                      | Pitfall 3: `spinsObserved` non-zero on resume causes threshold to fire after one spin                        | Ensure all state reconstruction sets `spinsObserved: 0`; add unit tests for threshold boundary values                          |
| 44    | Rapid spin injection in tests                | Pitfall 4: two `ccz:spin-settled` events injected synchronously cause state misread                          | Await step-change assertion between injected bridge events in Playwright helpers                                               |
| 43-44 | Scope discipline                             | Pitfall 7: FX code smuggled into Lesson 3 dialogue implementation                                            | Phase gate — no CSS animation or motion hooks in v2.2                                                                          |
| 44    | Causality copy                               | Pitfall 8: fallback string in `buildCardCopy()` drifts from `en.json`                                        | Treat fallback as guard only; canonical source is i18n JSON                                                                    |

---

## What Is NOT a Pitfall for v2.2

These are noted because they might be assumed to be risks but are verified safe given the current codebase state:

- **Dialogue content authoring:** All four `sensory-conditioning-*` step entries in `DIALOGUE_REGISTRY` are already written in both EN and PT with correct prefixed IDs. No new text authoring is needed.
- **Type system gaps:** `TutorialStepId`, `LessonId`, and `TutorialState` already include all Lesson 3 variants. No type changes are needed.
- **Astro attribute parity:** Both EN and PT `index.astro` pages already expose identical `data-casinocraftz-*` attribute sets for all Lesson 3 step labels, causality strings, and curriculum card copy. The `extractCasinocraftzDatasetNames` compatibility contract enforces this at the attribute-name level.
- **`requiresSpins: 2` misconfiguration:** `sensory-conditioning-observe` already has `requiresSpins: 2` set in `TUTORIAL_STEPS`. No change needed.
- **`REPLAY_ENABLED_STEPS` omission:** All four `sensory-conditioning-*` step IDs are already in `REPLAY_ENABLED_STEPS`. The replay button will render correctly without any change.
- **New localStorage key collision:** `ccz-near-miss-completed` does not conflict with any existing key (`ccz-tutorial-completed`, `ccz-wallet`). The key namespace is safe.
- **Deterministic authority violation:** Lesson 3 is pure educational content. It observes spins via the bridge but calls only the read-side `recordSpin()` which mutates in-memory state only. No pathway exists to feed lesson step counts back into the slots RNG or payout engine. The authority boundary is structurally enforced by the iframe separation contract (BRG-50, BRG-51).
- **`SENSORY_COMPLETE_STEPS` wiring:** Already declared in `main.ts` (line 49) and consumed in both `proceedStep()` and `onSpinMessage`. The completion trigger is wired for both the UI-next path and the spin-bridge path.

---

## Sources

- Direct code audit: `src/scripts/casinocraftz/tutorial/engine.ts` — `isFirstRun()`, `recordSpin()`, `completeCurrentLesson()`, `openLesson()` — HIGH confidence
- Direct code audit: `src/scripts/casinocraftz/tutorial/main.ts` — `mountTutorial()` fast-path (lines 509-518), skip handler (lines 580-606), `onSpinMessage` (lines 608-638), `renderCurriculum()` (lines 202-287), `buildLessonCopy()` (lines 156-184), `buildCardCopy()` (lines 346-377) — HIGH confidence
- Direct code audit: `src/scripts/casinocraftz/tutorial/dialogue.ts` — `DIALOGUE_REGISTRY` Lesson 3 entries (lines 264-367) — HIGH confidence
- Direct code audit: `src/scripts/casinocraftz/tutorial/types.ts` — `TutorialStepId`, `LessonId`, `TutorialState` — HIGH confidence
- Direct code audit: `src/pages/en/casinocraftz/index.astro` and `src/pages/pt/casinocraftz/index.astro` — attribute parity, lines 1-79 of each — HIGH confidence
- Direct code audit: `tests/compatibility-contract.test.mjs` — contract surface, gap analysis (lines 145-167) — HIGH confidence
- `.planning/PROJECT.md` — EDU-70 through EDU-73 requirement scope — HIGH confidence
- `.planning/FUTURE-MILESTONES.md` — Phase 43-44 sketch, v2.3 FX scope boundary — HIGH confidence
- `.planning/research/STACK.md` — anti-feature table, localStorage key guidance, fast-path gap documentation — HIGH confidence

---

_Pitfall research for: v2.2 Sensory Conditioning Content (Casinocraftz)_
_Researched: 2026-04-04_
_Replaces: stale v1.8 PITFALLS.md content_
