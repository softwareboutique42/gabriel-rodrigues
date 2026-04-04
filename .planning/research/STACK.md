# Stack Research

**Domain:** Lesson 3 Sensory Conditioning Content — Casinocraftz casino-education web app
**Researched:** 2026-04-04
**Confidence:** HIGH

## Context

This is a subsequent-milestone research pass for v2.2 Sensory Conditioning Content (Phases 43–44). The base stack (Astro 6, Tailwind v4, Three.js, Cloudflare Pages, Playwright) is already validated and locked. This document covers only the **delta** needed for v2.2. No new runtime dependencies are required. All work stays within existing module boundaries.

---

## Recommended Stack

### Core Technologies (existing — no changes)

| Technology                        | Version | Purpose                                                        | Why                                                                                                                |
| --------------------------------- | ------- | -------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| Astro                             | 6.x     | Static page shell, i18n routing, data-attribute injection      | Already powering EN/PT Casinocraftz routes                                                                         |
| TypeScript                        | 5.x     | Tutorial engine, dialogue registry, bridge event parser        | Entire tutorial layer is typed; adding Lesson 3 requires no type system change                                     |
| Tailwind CSS                      | v4      | Class-based styling for dialogue entries and lesson cards      | Established tokens (neon, cyan, gold, text-secondary) cover all Lesson 3 UI                                        |
| Web Storage API (localStorage)    | native  | Lesson completion persistence via `ccz-tutorial-completed` key | Already used for Lesson 1 and Lesson 2 completion state                                                            |
| Window postMessage / MessageEvent | native  | Spin-bridge event reception (`ccz:spin-settled`)               | Already wired in `main.ts`; `recordSpin()` and `sensory-conditioning-observe` step already handle 2-spin threshold |

### Module Boundaries (existing — extend in place)

| File                                            | Change for v2.2                                                                                                                                                            | Status                                               |
| ----------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------- |
| `src/scripts/casinocraftz/tutorial/dialogue.ts` | All 4 step keys (`sensory-conditioning-intro/observe/reveal/complete`) with EN/PT strings already present                                                                  | VERIFY and activate                                  |
| `src/scripts/casinocraftz/tutorial/engine.ts`   | `sensory-conditioning` lesson registered, all 4 steps in `TUTORIAL_STEPS`, `requiresSpins: 2` set, `completeCurrentLesson()` chain already pushes `'sensory-conditioning'` | VERIFY unlock trigger wiring end-to-end              |
| `src/scripts/casinocraftz/tutorial/types.ts`    | All `TutorialStepId` variants for sensory conditioning already declared                                                                                                    | No change needed                                     |
| `src/scripts/casinocraftz/tutorial/main.ts`     | `SENSORY_COMPLETE_STEPS`, `REPLAY_ENABLED_STEPS`, skip-button branch, `sensoryRevealCausality`, and step-label strings all present                                         | VERIFY integration; fix `isFirstRun()` fast-path gap |
| `src/pages/en/casinocraftz/index.astro`         | All `data-casinocraftz-step-sensory-*` and `data-casinocraftz-lesson-sensory-conditioning-*` data attributes already present                                               | Confirm `.soon` copy suppression when unlocked       |
| `src/pages/pt/casinocraftz/index.astro`         | PT counterpart must mirror EN attribute set                                                                                                                                | VERIFY parity                                        |
| `src/i18n/en.json`                              | Keys `tutorial.step.sensoryConditioning*.label`, `tutorial.lesson.sensoryConditioning.*`, `tutorial.causality.sensoryReveal` all present                                   | No change needed                                     |
| `src/i18n/pt.json`                              | Same keys present in PT                                                                                                                                                    | No change needed                                     |

### Supporting Libraries (no additions needed)

No new npm packages are required for v2.2. The dialogue system, spin-bridge observer, step-gate counter, lesson unlock trigger, and localStorage persistence are all implemented as plain TypeScript modules with no external dependencies.

### Development Tools (no changes)

| Tool                          | Purpose                     | Notes                                                                                        |
| ----------------------------- | --------------------------- | -------------------------------------------------------------------------------------------- |
| Playwright                    | E2E compatibility contracts | Extend existing near-miss bridge injection pattern for Lesson 3 contracts                    |
| `node:test` + `assert/strict` | Source-level contract tests | New contract assertions for sensory-conditioning unlock, 2-spin gate, completion persistence |
| ESLint + Prettier             | Code quality                | No config changes needed                                                                     |

---

## Installation

```bash
# No new packages required for v2.2
# All capabilities ship within the existing dependency tree
```

---

## Alternatives Considered

| Recommended                                               | Alternative                            | Why Not                                                                                                                                                   |
| --------------------------------------------------------- | -------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Extend existing `dialogue.ts` registry                    | Separate Lesson 3 dialogue module      | Unnecessary fragmentation; the registry pattern is flat by design and already includes Lesson 3 keys                                                      |
| Extend `engine.ts` `completeCurrentLesson()` unlock chain | New unlock service                     | The chain (`house-edge` → `near-miss` → `sensory-conditioning`) is already implemented; a parallel mechanism duplicates state                             |
| `localStorage` plain string flag for completion           | IndexedDB or sessionStorage            | localStorage is already the persistence contract for `ccz-tutorial-completed` and the wallet; consistency matters more than capability                    |
| `window.postMessage` for spin-bridge                      | Custom EventTarget or BroadcastChannel | The iframe-to-parent postMessage bridge is the established authority boundary contract (BRG-50, BRG-51); no change warranted for a content-only milestone |

---

## What NOT to Add

| Avoid                                              | Why                                                                                                                                                                                              | Use Instead                                                                          |
| -------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------ |
| Any new npm dependency                             | v2.2 is pure content — dialogue strings, step wiring, unlock trigger; no new capability surface                                                                                                  | Existing TypeScript module system handles everything                                 |
| A new lesson-state localStorage key                | `ccz-tutorial-completed` covers Lesson 1; lesson progression lives in in-memory `TutorialState.completedLessons`; a separate `ccz-lesson3-completed` key diverges from the single-source pattern | `TutorialState.completedLessons` (already contains `'sensory-conditioning'` branch)  |
| Animated sensory effects in v2.2                   | Win-celebration effects (neon pulse, reel glow) are scoped to v2.3 Sensory Effects Layer; shipping them early creates premature FX-71/FX-72 surface and scope bleed                              | Deliver effects in Phase 45–46 only                                                  |
| Audio / sound cues                                 | No audio capability exists in the codebase; adding it requires `prefers-reduced-motion` equivalents and significant scope                                                                        | Reference sounds conceptually in dialogue copy only                                  |
| Full `TutorialState` serialization to localStorage | Over-engineering for 3-lesson curriculum; `isFirstRun()` + in-memory state is the validated pattern                                                                                              | Extend only if a future milestone explicitly requires cross-session step restoration |
| React / Vue / Svelte islands                       | The entire tutorial layer is vanilla TS; introducing a component framework for dialogue rendering adds bundle weight and maintenance surface with no benefit                                     | Continue building dialogue DOM in `renderDialogue()`                                 |

---

## Stack Patterns by Variant

**Activating Lesson 3 (what v2.2 actually needs):**

- Confirm all four `sensory-conditioning-*` keys in `DIALOGUE_REGISTRY` return correct EN/PT strings via `getDialogue()`
- Confirm `TUTORIAL_STEPS` has `requiresSpins: 2` on `sensory-conditioning-observe`
- Confirm `completeCurrentLesson()` pushes `'sensory-conditioning'` into `completedLessons` when `state.currentLesson === 'near-miss'` triggers the unlock
- Confirm `data-casinocraftz-lesson-sensory-conditioning-soon` is consumed only when `status === 'locked'` in `renderCurriculum()` — the conditional exists; verify the `.soon` string no longer appends once status becomes `'active'`

**Primary wiring gap — returning user fast-path:**

The `isFirstRun()` fast-path in `mountTutorial()` currently hardcodes `completedLessons: ['house-edge']` for returning visitors. If a user has completed Lesson 2, the fast-path must also reflect `'near-miss'` in `completedLessons` and `'sensory-conditioning'` in `unlockedLessons`. This is the single most critical integration fix for EDU-70. The resolution is either:

1. Persist a richer completion signal to localStorage (e.g., `ccz-completed-lessons` as a JSON array), OR
2. Detect `near-miss` completion from an existing localStorage signal and reconstruct state accordingly

Option 2 is preferred (minimal scope). Check whether any existing key encodes near-miss completion — if not, add `ccz-near-miss-completed` on near-miss lesson completion alongside the existing `ccz-tutorial-completed` flag.

**If a future milestone needs cross-session step resumption:**

- Add `ccz-tutorial-state` localStorage key with serialized `TutorialState` subset
- Parse it in `mountTutorial()` before `createInitialTutorialState()`
- Do not add this in v2.2; the current flag-based approach is sufficient

---

## Version Compatibility

| Package                       | Compatible With                  | Notes                                                                              |
| ----------------------------- | -------------------------------- | ---------------------------------------------------------------------------------- |
| Astro 6.x                     | TypeScript 5.x, Tailwind v4      | No changes to build config                                                         |
| Playwright (current)          | Astro dev server + built preview | Bridge event injection via `page.evaluate()` already tested in near-miss E2E suite |
| `node:test` + `assert/strict` | Node.js >= 22.12.0               | Already used in existing contract test files                                       |

---

## Key Finding: Implementation is Structurally Complete; Integration Verification is the Work

A direct code audit of the live codebase reveals that the sensory conditioning lesson is already structurally present:

- `dialogue.ts`: All 4 step keys with EN/PT strings written
- `engine.ts`: Lesson registered, `requiresSpins: 2` set, unlock chain written, completion handling in place
- `types.ts`: All `TutorialStepId` variants declared
- `main.ts`: `SENSORY_COMPLETE_STEPS`, skip-button branch, causality copy, step labels all present
- `src/pages/en/casinocraftz/index.astro`: All `data-casinocraftz-step-sensory-*` attributes injected
- `src/i18n/en.json` + `src/i18n/pt.json`: All required translation keys present

**What remains for v2.2 is verification and one integration gap, not authoring:**

1. Fix the `isFirstRun()` fast-path so a returning user who completed Lesson 2 sees Lesson 3 as unlocked
2. Confirm the `.soon` copy path suppresses correctly once Lesson 3 is `'active'`
3. Verify PT Astro page attribute parity against EN page
4. Write Playwright contracts covering: Lesson 3 locked without Lesson 2, unlocks after Lesson 2, 2-spin threshold gates observe → reveal, completion persists

---

## Sources

- Code audit: `src/scripts/casinocraftz/tutorial/dialogue.ts` — HIGH confidence (direct read)
- Code audit: `src/scripts/casinocraftz/tutorial/engine.ts` — HIGH confidence (direct read)
- Code audit: `src/scripts/casinocraftz/tutorial/types.ts` — HIGH confidence (direct read)
- Code audit: `src/scripts/casinocraftz/tutorial/main.ts` — HIGH confidence (direct read)
- Code audit: `src/pages/en/casinocraftz/index.astro` — HIGH confidence (direct read)
- Code audit: `src/i18n/en.json` + `src/i18n/pt.json` — HIGH confidence (direct grep)
- `.planning/PROJECT.md` — milestone scope, requirement IDs EDU-70 through EDU-73
- `.planning/FUTURE-MILESTONES.md` — phase sketch confirming Phase 43–44 boundaries

---

_Stack research for: v2.2 Sensory Conditioning Content (Casinocraftz)_
_Researched: 2026-04-04_
