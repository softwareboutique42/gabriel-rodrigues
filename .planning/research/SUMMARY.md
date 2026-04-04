# Project Research Summary

**Project:** Casinocraftz v2.2 — Sensory Conditioning Content
**Domain:** Casino-education web app — Lesson 3 dialogue, step progression, and persistence integration
**Researched:** 2026-04-04
**Confidence:** HIGH

## Executive Summary

Lesson 3 (Sensory Conditioning) is structurally complete in the live codebase. All four step definitions, dialogue strings in both EN and PT, type declarations, spin-bridge event handling, i18n keys, Astro dataset attributes, and the skip-button branch are already authored and wired. The curriculum card, step labels, causality disclosure, `REPLAY_ENABLED_STEPS`, and `SENSORY_COMPLETE_STEPS` constant are all present and connected. What has never shipped is an integration path for returning users: the `mountTutorial()` fast-path hardcodes `completedLessons: ['house-edge']` regardless of how far a returning user progressed. This means Lesson 3 remains permanently locked for any user who completes Lesson 2 and reloads the page. v2.2 is therefore an integration and verification milestone, not an authoring one.

The recommended approach is surgical: introduce two new localStorage keys (`ccz-near-miss-completed` and `ccz-lesson-sensory-completed`) written at the NEAR_MISS_COMPLETE_STEPS and SENSORY_COMPLETE_STEPS checkpoints in both `proceedStep()` and `onSpinMessage()`. Replace the binary `isFirstRun()` branch in `mountTutorial()` with a `loadCompletedLessons()` call that reads all three keys and reconstructs `completedLessons` and `unlockedLessons` from the chain logic. All other content is already verified-authored. This approach follows the existing `ccz-tutorial-completed` precedent, avoids full-state serialization, and keeps the scope contained to `engine.ts` and `main.ts`.

The dominant risk is scope bleed into v2.3. The sensory conditioning lesson explains conditioning through text dialogue only. Win-celebration effects (neon pulse, reel glow) and Dopamine Dampener suppression belong to Phase 45-46. Any FX code introduced in v2.2 creates a premature surface that v2.3 must reconcile. The second risk is the fast-path array ordering: reconstructed `completedLessons` must derive ordering from `CURRICULUM_LESSONS.map(l => l.id).filter(...)` rather than arbitrary push order to avoid test fragility and future parse assumptions.

## Key Findings

### Recommended Stack

No new dependencies are required. The entire tutorial layer — dialogue registry, step engine, spin-bridge observer, localStorage persistence, and i18n injection — is implemented in plain TypeScript modules with no external libraries. Extending this system to activate Lesson 3 requires changes only to `engine.ts` (new mark/load functions) and `main.ts` (mount logic and completion checkpoints). Playwright and `node:test` contract tests cover the verification layer.

**Core technologies:**

- TypeScript 5.x: tutorial engine, dialogue registry, bridge event parser — all Lesson 3 types already declared in `types.ts`
- Web Storage API (localStorage): lesson completion persistence — three-key pattern extending existing `ccz-tutorial-completed` precedent
- Window postMessage / MessageEvent: spin-bridge event reception (`ccz:spin-settled`) — `recordSpin()` already handles `sensory-conditioning-observe` with `requiresSpins: 2`
- Astro 6.x: static shell with all `data-casinocraftz-step-sensory-*` and `data-casinocraftz-lesson-sensory-conditioning-*` dataset attributes already present on both EN and PT pages
- Playwright + `node:test`: contract tests — extend existing near-miss bridge injection pattern for Lesson 3 threshold and persistence contracts

### Expected Features

The gap between what exists and what EDU-70 through EDU-73 require is precisely the persistence model. All experiential features (dialogue, spin-gate, causality reveal, recap button, completion display) are already implemented. The single gap is cross-session state restoration.

**Must have (table stakes — all P1):**

- Lesson 3 unlocks after Near-Miss completion, including across page reload — engine unlock chain exists; persistence fix required for cross-session case
- All four sensory conditioning dialogue steps render in EN and PT with correct narrator/system roles — fully authored in `dialogue.ts`
- `sensory-conditioning-observe` gated at 2 settled spins via spin-bridge — already in `recordSpin()` with `requiresSpins: 2`
- Causality disclosure renders on `sensory-conditioning-reveal` when triggered by spin — already in `renderDialogue()` for the spin-triggered branch
- Lesson 3 completion written to localStorage on `sensory-conditioning-complete` resolution — requires new `markSensoryComplete()` call
- Mount logic restores Lesson 2 and Lesson 3 completion from localStorage on page reload — requires `loadCompletedLessons()` replacing the binary `isFirstRun()` branch
- EN/PT source contracts and compatibility coverage confirm parity — dataset attributes and i18n keys already present; assertions need adding

**Should have (differentiators):**

- Observation-gated reveal (spin count, not time or click) — mirrors the real conditioning loop; already implemented
- Two-role dialogue (narrator + system) — mirrors how conditioning and cognition interact; already authored
- Causality disclosure on spin-triggered transitions — explains why dialogue changed after spins; already wired

**Defer (v2+):**

- Win-celebration effects (neon pulse, reel glow) — v2.3 Phases 45-46 only
- Dopamine Dampener card win-celebration suppression — requires v2.2 to ship first; v2.3 payoff
- Per-lesson outcome tracking (revisit analytics) — requires analytics infra
- Adaptive dialogue for repeat vs. first-time visitors — requires user identity

### Architecture Approach

The system is a pure client-side tutorial engine mounted on `astro:page-load`. The Astro shell provides dataset anchors for all i18n strings at build time. `engine.ts` owns pure state transitions and localStorage writes. `main.ts` owns DOM rendering, event wiring, and spin-bridge message handling. All Lesson 3 content flows through existing entry points — no new modules, no new HTML structure, no new i18n files. The only structural addition is three helper functions in `engine.ts` and a mount logic replacement in `main.ts`.

**Major components:**

1. `engine.ts` — pure state transitions and persistence: `advanceTutorialStep`, `recordSpin`, `completeCurrentLesson`, plus new `markNearMissComplete`, `markSensoryComplete`, `loadCompletedLessons`
2. `main.ts` — mount, render, event wiring: replace `isFirstRun()` fast-path branch with `loadCompletedLessons()`; add persistence calls at both NEAR_MISS_COMPLETE_STEPS and SENSORY_COMPLETE_STEPS checkpoints in `proceedStep()` and `onSpinMessage()`
3. `dialogue.ts` — `DIALOGUE_REGISTRY` with all 4 Lesson 3 step entries in EN/PT — unchanged; all content verified present
4. Astro shell pages (EN + PT) — all `data-casinocraftz-*` dataset anchors already present — unchanged
5. Contract tests (`casinocraftz-tutorial-contract.test.mjs`, `compatibility-contract.test.mjs`) — extend with persistence key write assertions, spin threshold boundary cases, and `data-casinocraftz-lesson-sensory-conditioning-soon` parity assertion

**Authority boundary (unchanged from v2.1):** Slots runtime owns all RNG and payout decisions. Tutorial observes spin count only via the `ccz:spin-settled` postMessage bridge. Tutorial never reads Slots internal state. This boundary is enforced by contract test import assertions and the iframe separation contract (BRG-50, BRG-51).

### Critical Pitfalls

1. **Returning-user fast-path hardcodes `completedLessons: ['house-edge']`** — the dominant gap for EDU-70; `mountTutorial()` was written when only Lesson 1 existed and never updated for multi-lesson state; fix by adding `ccz-near-miss-completed` localStorage flag written at NEAR_MISS_COMPLETE_STEPS and calling `loadCompletedLessons()` in mount to reconstruct state from curriculum-canonical ordering
2. **Skip button on Lesson 3 does not persist near-miss completion** — if the user skips Lesson 3 before the near-miss flag was written, a reload resets both lessons; fix by writing `ccz-near-miss-completed` inside the skip handler before `completeCurrentLesson()` when `currentLesson === 'sensory-conditioning'`
3. **`spinsObserved` non-zero on resume breaks the 2-spin threshold** — any state reconstruction code that carries `spinsObserved` forward from a persisted token causes the observe gate to fire after one spin instead of two; always set `spinsObserved: 0` in state reconstruction; never persist this counter
4. **`completedLessons` array ordering** — reconstructed array must derive from `CURRICULUM_LESSONS.map(l => l.id).filter(...)` not arbitrary push order; `data-casinocraftz-completed-lessons` must emit `'house-edge,near-miss'` not `'near-miss,house-edge'`; verify by value in contract assertion, not substring match
5. **Scope bleed — FX code in v2.2** — Lesson 3 explains conditioning through text only; no CSS animation hooks, no motion classes, no audio references in code belong in this milestone; all effects work is Phase 45-46 (v2.3)

## Implications for Roadmap

The two-phase structure confirmed in `FUTURE-MILESTONES.md` (Phase 43-44) is directly supported by research. Phase 43 addresses the single real implementation gap. Phase 44 is verification and confidence lock. The ratio of implementation to verification is approximately 30/70 — most of the work is confirming what already exists, not writing new behavior.

### Phase 43: Persistence Wiring and Unlock Trigger (EDU-70, EDU-73)

**Rationale:** The unlock trigger and completion persistence are the only gaps preventing Lesson 3 from being reachable for returning users. Nothing else in the lesson is broken — only the cross-session state reconstruction. This must come first because Phase 44 verification cannot produce meaningful results until the persistence model is correct.

**Delivers:** Returning users who completed Lesson 2 see Lesson 3 as unlocked on reload; Lesson 3 completion survives page navigation; curriculum progress counter reaches 3/3; skip path also correctly persists near-miss completion before advancing.

**Addresses:** EDU-70 (unlock after Near-Miss, including across reload), EDU-73 (Lesson 3 completion persisted)

**Avoids:** Pitfall 1 (fast-path hardcoding), Pitfall 2 (skip handler gap), Pitfall 6 (array ordering), full-state serialization anti-pattern

**Files changed:** `engine.ts` (add `markNearMissComplete`, `markSensoryComplete`, `loadCompletedLessons`), `main.ts` (replace `isFirstRun()` branch; add persistence calls in `proceedStep()` and `onSpinMessage()`), contract test file (new assertions for persistence key writes and state reconstruction ordering)

### Phase 44: Spin-Bridge Threshold, Causality Copy, EN/PT Parity Lock (EDU-71, EDU-72)

**Rationale:** All content for EDU-71 (sensory dialogue) and EDU-72 (spin-bridge gate) is already authored and structurally wired. Phase 44 verifies that the wiring holds end-to-end with the new persistence model in place, locks EN/PT parity, and produces release evidence for all four EDU requirements.

**Delivers:** Confirmed 2-spin threshold behavior in contracts and Playwright; causality disclosure verified on spin-triggered reveal; EN/PT attribute parity locked including `data-casinocraftz-lesson-sensory-conditioning-soon`; release evidence for EDU-70 through EDU-73.

**Addresses:** EDU-71 (sensory conditioning dialogue end-to-end), EDU-72 (2-spin observation gate verified)

**Avoids:** Pitfall 3 (spinsObserved non-zero on resume), Pitfall 4 (rapid spin injection in Playwright), Pitfall 5 (sensoryConditioningSoon attribute removal), Pitfall 7 (FX scope bleed), Pitfall 8 (causality fallback drift)

**Files changed:** Contract tests (spin threshold boundary assertions, causality assertion, `.soon` attribute parity assertion); Playwright test sequencing (await between bridge event injections, not synchronous double-fire)

### Phase Ordering Rationale

- Phase 43 before Phase 44 is mandatory: verification in Phase 44 depends on the persistence model introduced in Phase 43. Running parity checks against a broken returning-user flow produces false negatives.
- Both phases are change-minimal: only `engine.ts` and `main.ts` are modified in Phase 43; Phase 44 is test-and-verification only with no production code changes. No HTML changes, no i18n file changes, no new modules.
- Skip button gap (Pitfall 2) is addressed in Phase 43 alongside the main persistence fix to avoid a second pass at the same code surface.
- Array ordering (Pitfall 6) is enforced in Phase 43 implementation and verified by explicit value assertion in Phase 44 — the two phases share a single verification loop.

### Research Flags

Phases with well-documented patterns (skip research-phase — no additional research needed):

- **Phase 43:** The implementation pattern is fully specified in ARCHITECTURE.md — exact function names, localStorage key names, data flow diagram, and dependency order are all enumerated. Direct code audit confirms all surrounding logic. No unknowns remain.
- **Phase 44:** All content is already authored; verification steps are enumerated in ARCHITECTURE.md. The Playwright bridge injection pattern is established from the near-miss E2E suite. Only inspect existing near-miss test helpers to confirm they await between spin injections before adding Lesson 3 contracts.

## Confidence Assessment

| Area         | Confidence | Notes                                                                                                        |
| ------------ | ---------- | ------------------------------------------------------------------------------------------------------------ |
| Stack        | HIGH       | Direct source inspection of all tutorial modules; no new dependencies; existing patterns fully applicable    |
| Features     | HIGH       | All feature state verified by direct codebase audit; gap identified by reading `isFirstRun()` fast-path      |
| Architecture | HIGH       | All component responsibilities confirmed by direct code read; data flow derived from actual source, not docs |
| Pitfalls     | HIGH       | All pitfalls identified from live code audit with specific line references; not inferred from documentation  |

**Overall confidence:** HIGH

### Gaps to Address

- **Playwright spin injection sequencing:** Pitfall 4 identifies that synchronous double-injection in `page.evaluate()` can cause state misread. Inspect existing near-miss E2E bridge helpers at the start of Phase 44 to confirm they await between spin events before extending the pattern to Lesson 3 contracts.
- **`ccz-near-miss-completed` key name conflicts:** The key namespace (`ccz-*`) is consistent with existing keys. FUTURE-MILESTONES.md v2.3-v2.13 introduces no conflicting localStorage key. Low risk; no action needed before Phase 43.
- **`data-casinocraftz-lesson-sensory-conditioning-soon` persistence:** ARCHITECTURE.md confirms both Astro pages already have this attribute. Phase 44 must add an explicit contract assertion by name to prevent accidental removal in future refactors (the current `extractCasinocraftzDatasetNames` compatibility contract checks attribute name presence but not this specific attribute explicitly).

## Sources

### Primary (HIGH confidence — direct code audit)

- `src/scripts/casinocraftz/tutorial/engine.ts` — `isFirstRun()`, `recordSpin()`, `completeCurrentLesson()`, `openLesson()`, lesson unlock chain
- `src/scripts/casinocraftz/tutorial/main.ts` — `mountTutorial()` fast-path (lines 509-518), skip handler (lines 580-606), `onSpinMessage` (lines 608-638), `renderCurriculum()`, `buildLessonCopy()`, `SENSORY_COMPLETE_STEPS`, `REPLAY_ENABLED_STEPS`
- `src/scripts/casinocraftz/tutorial/dialogue.ts` — `DIALOGUE_REGISTRY` Lesson 3 entries (lines 264-367), all four EN/PT step entries confirmed present
- `src/scripts/casinocraftz/tutorial/types.ts` — `TutorialStepId`, `LessonId`, `TutorialState` — all Lesson 3 variants declared
- `src/pages/en/casinocraftz/index.astro` and `src/pages/pt/casinocraftz/index.astro` — all sensory-conditioning dataset attributes confirmed present
- `src/i18n/en.json` and `src/i18n/pt.json` — all Lesson 3 i18n keys including `tutorial.causality.sensoryReveal` confirmed present
- `tests/casinocraftz-tutorial-contract.test.mjs` — existing Lesson 3 contract surface (unlock, open, step, skip, review flows)
- `tests/compatibility-contract.test.mjs` — EN/PT parity contract surface
- `.planning/PROJECT.md` — EDU-70 through EDU-73 requirement scope and milestone goal
- `.planning/FUTURE-MILESTONES.md` — Phase 43-44 sketch, v2.3 FX scope boundary

### Secondary (MEDIUM confidence — domain research)

- [How flashing lights and catchy tunes make gamblers take more risks — The Conversation](https://theconversation.com/how-flashing-lights-and-catchy-tunes-make-gamblers-take-more-risks-105852) — sensory conditioning mechanism overview
- [Effects of Audiovisual Cues on Game Immersion during Simulated Slot Machine Gambling — Journal of Gambling Studies, Springer 2025](https://link.springer.com/article/10.1007/s10899-025-10397-9) — audiovisual cue research supporting observation-gated lesson design
- [Behavioral analysis of habit formation in modern slot machine gambling — Tandfonline 2022](https://www.tandfonline.com/doi/full/10.1080/14459795.2022.2088822) — conditioning loop research
- [Increasing correct knowledge and beliefs about slot machines — Harrigan et al. 2013, GREO](<https://www.greo.ca/Modules/EvidenceCentre/files/Harrigan%20et%20al(2013)Increasing_correct_knowledge_and_beliefs_about_slot_machine.pdf>) — structural-characteristic-focus over moralization, observation before explanation, anti-moral-framing rationale

---

_Research completed: 2026-04-04_
_Ready for roadmap: yes_
