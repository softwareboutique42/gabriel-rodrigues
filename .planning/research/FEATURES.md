# Feature Research

**Domain:** Sensory Conditioning educational dialogue — casino-education web app (Casinocraftz v2.2)
**Researched:** 2026-04-04
**Confidence:** HIGH (based on full codebase audit + domain research)

---

## Context: What Already Exists

Before categorizing features, this is the state of the system entering v2.2:

**Already fully authored in the codebase (not yet reachable in live UI):**

- All four Lesson 3 `TutorialStepId` values defined in `types.ts`: `sensory-conditioning-intro`, `sensory-conditioning-observe`, `sensory-conditioning-reveal`, `sensory-conditioning-complete`
- All four dialogue entries (EN + PT) authored in `dialogue.ts` — narrator + system role messages for each step
- Step definitions with essence rewards and `requiresSpins: 2` threshold authored in `engine.ts`
- `completeCurrentLesson` in `engine.ts` already branches on `sensory-conditioning` and unlocks nothing after (terminal lesson)
- `recordSpin` in `engine.ts` already handles `sensory-conditioning-observe` in the spin-gating conditional
- `SENSORY_COMPLETE_STEPS` already defined in `main.ts` and wired into both `proceedStep` and `onSpinMessage`
- `skip` button in `main.ts` already resolves `sensory-conditioning` lesson correctly
- `renderDialogue` already handles `sensory-conditioning-reveal` in the recap disclosure block
- All i18n step labels (EN + PT) already defined in `src/i18n/en.json` and `pt.json`
- Both EN and PT `index.astro` pages already pass all sensory-conditioning dataset attributes
- An E2E test in `compatibility.spec.ts` already verifies unlock, open, step, skip, and review flows for Lesson 3

**The gap:** `completeCurrentLesson` in `engine.ts` correctly unlocks `sensory-conditioning` from `near-miss`, but the `isFirstRun()` branch in `main.ts` (line 509) hardcodes `completedLessons: ['house-edge']`. There is no localStorage key for Lesson 2 or Lesson 3 completion. On page reload, Lesson 2 and Lesson 3 completion state is lost.

---

## Feature Landscape

### Table Stakes (Users Expect These)

Features users assume exist. Missing these = product feels incomplete.

| Feature                                                                                  | Why Expected                                                                 | Complexity | Notes                                                                                                                                                                                                                           |
| ---------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------- | ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Lesson 3 unlocks after Near-Miss completion                                              | Sequential lesson gating is the established contract (Lesson 1 to 2 is live) | LOW        | Engine logic already exists in `completeCurrentLesson`; unlock wiring is done. The gap is whether the sensory-conditioning card's "Locked for a later phase" copy is removed from the locked-state branch in `renderCurriculum` |
| Sensory conditioning dialogue plays through all four steps                               | User expects a complete lesson arc matching Lessons 1 and 2 structure        | LOW        | All four step definitions and dialogue messages are fully authored. The step traversal engine is shared and already handles these IDs                                                                                           |
| Spin-bridge gates `sensory-conditioning-observe` at 2 spins                              | Established precedent from `near-miss-observe` (same threshold)              | LOW        | `recordSpin` in `engine.ts` already branches on this step ID with `requiresSpins: 2`                                                                                                                                            |
| EN and PT dialogue parity                                                                | Every lesson in the system has both language versions                        | LOW        | All four dialogue steps are already authored in both languages in `dialogue.ts`                                                                                                                                                 |
| Lesson 3 completion shown in curriculum progress counter                                 | "2/3 complete, 3/3 unlocked" must be reachable                               | LOW        | `renderCurriculumProgress` reads `completedLessons.length` dynamically; works once completion fires                                                                                                                             |
| Recap / causality disclosure appears on `sensory-conditioning-reveal` after spin trigger | Pattern already exists for `probability-reveal` and `near-miss-reveal`       | LOW        | `renderDialogue` already handles `sensory-conditioning-reveal` in the `lastTransitionTrigger === 'spin'` branch                                                                                                                 |
| "Revisit lesson" replay button appears on all four steps                                 | Present on all Lesson 1 and 2 steps                                          | LOW        | `REPLAY_ENABLED_STEPS` in `main.ts` already includes all four sensory-conditioning step IDs                                                                                                                                     |

### Differentiators (Competitive Advantage)

Features that set this lesson apart from generic responsible-gambling content.

| Feature                                                   | Value Proposition                                                                                                 | Complexity | Notes                                                                                                                                                                                                                                                                                           |
| --------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------- | ---------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Observation-gated reveal (not time-gated or click-gated)  | Forces user to actually engage with the machine before the explanation lands — mirrors the real mechanism         | LOW        | Already implemented via spin-bridge; user must watch 2 settled spins before `sensory-conditioning-observe` advances                                                                                                                                                                             |
| Two-role dialogue (narrator + system)                     | Narrator frames experience emotionally; system states the math — mirrors how conditioning and cognition interact  | LOW        | Pattern established and implemented; `dialogue.ts` already uses both roles for all four Lesson 3 steps                                                                                                                                                                                          |
| Causality disclosure on spin-triggered transitions        | Explains WHY the dialogue changed after the spins — prevents the interface itself from feeling manipulative       | LOW        | `sensoryRevealCausality` copy is already authored in both i18n files and wired in `renderDialogue`                                                                                                                                                                                              |
| Lesson 3 completion persisted across page loads           | User should not lose "Lesson 3 done" state on reload — absence of this breaks trust in the educational product    | MEDIUM     | This is the primary implementation gap. A new localStorage key (`ccz-lesson-near-miss-complete` and `ccz-lesson-sensory-complete`) or expansion of the state serialization approach is needed. The `isFirstRun` branch must be extended to restore `completedLessons` correctly from these keys |
| "Sensory conditioning soon" placeholder removed on unlock | When Lesson 3 is actually accessible, the "Locked for a later phase" suffix in the description must be suppressed | LOW        | `buildLessonCopy` in `main.ts` appends `sensoryConditioningSoon` text in the locked branch. When status resolves to `active` or `complete`, the suffix is already not appended. No code change needed — only the unlock state must resolve correctly                                            |

### Anti-Features (Commonly Requested, Often Problematic)

| Feature                                                                                           | Why Requested                                      | Why Problematic                                                                                                                                                                                                                                                                                          | Alternative                                                                                                                                                                                                        |
| ------------------------------------------------------------------------------------------------- | -------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Live audiovisual demo of conditioning effects inside the dialogue                                 | "Show don't tell" — would make the lesson visceral | Breaks the lesson/slot separation of concerns; Lesson 3 observes the existing Slots machine via spin-bridge; adding in-dialogue effects duplicates the system and risks the educational framing becoming indistinguishable from what it describes                                                        | Point the user to observe the Slots machine for 2 spins — that IS the demo. The v2.3 milestone (Sensory Effects Layer) adds win-celebration effects and Dopamine Dampener suppression, the proper vehicle for this |
| Per-spin commentary (real-time annotation of each spin during observe step)                       | Natural "teach as they watch" impulse              | Would require synchronizing dialogue with spin outcomes. The bridge only emits `ccz:spin-settled` events with a spin index, not outcome data. Real-time commentary would need outcome awareness, which couples the tutorial engine to slots payout logic, violating the deterministic authority boundary | Keep the observe step as a count-gate only; the reveal step provides retrospective explanation after the threshold is met                                                                                          |
| Storing full tutorial state (all lesson progress, essence balance, step position) in localStorage | Preserves exact user position across reloads       | Full state serialization creates a versioning hazard — if step definitions change (new steps added, IDs renamed) in future milestones, deserialized state can corrupt the engine                                                                                                                         | Persist only completion flags per lesson using simple boolean keys, matching the existing `ccz-tutorial-completed` precedent. Reconstruct live state from those flags on mount                                     |
| Requiring 3+ spins for `sensory-conditioning-observe`                                             | More exposure = more learning                      | Friction without payoff. The observe step explanation covers the concept in one spin; additional spins do not deepen the insight and increase the chance a user abandons before reaching the reveal                                                                                                      | Keep threshold at 2 spins, consistent with `near-miss-observe`                                                                                                                                                     |
| Unlocking new utility cards on Lesson 3 completion                                                | Rewards completion and adds product momentum       | The three starter cards already cover sensory conditioning conceptually. Adding cards here without new functionality creates the impression that cards have unmapped features                                                                                                                            | Defer new card mechanics to v2.3 (Dopamine Dampener's win-celebration suppression is the natural Lesson 3 payoff)                                                                                                  |
| Moral framing in dialogue copy ("gambling is bad")                                                | Seems appropriate for harm-reduction content       | Erodes educational credibility. Research on effective gambling education (Harrigan et al. 2013) consistently shows that structural-characteristic-focused content outperforms moralistic framing for reducing erroneous cognitions                                                                       | Keep dialogue in the voice already established: mechanism-first, math-backed, non-judgmental                                                                                                                       |

---

## Feature Dependencies

```
[Lesson 3 unlock trigger]
└──requires──> [Near-Miss (Lesson 2) completion flag in engine state]
└──requires──> [completeCurrentLesson pushes 'sensory-conditioning' to unlockedLessons]

[Lesson 3 dialogue progression]
└──requires──> [spin-bridge observer counting settled spins]
└──requires──> [TutorialStepId coverage in REPLAY_ENABLED_STEPS]

[Lesson 3 completion persistence (EDU-73)]
└──requires──> [new localStorage key written on SENSORY_COMPLETE_STEPS trigger]
└──requires──> [isFirstRun/mount logic extended to restore Lesson 2 + Lesson 3 completion from those keys]
└──requires──> [new localStorage key for near-miss completion, so cross-session restore is accurate]

[sensory-conditioning-reveal causality disclosure]
└──requires──> [lastTransitionTrigger === 'spin' set correctly in onSpinMessage]
└──requires──> [sensoryRevealCausality i18n key present in both locales]

[EN/PT parity lock]
└──requires──> [both locale dialogue.ts entries complete]
└──requires──> [both locale index.astro pages passing dataset attributes]
└──requires──> [both locale i18n JSON keys present]

[v2.3 Sensory Effects Layer]
└──requires──> [Lesson 3 shipped (v2.2)]
```

### Dependency Notes

- **Lesson 3 unlock requires Lesson 2 completion:** The `completeCurrentLesson` function already pushes `sensory-conditioning` to `unlockedLessons` when `currentLesson === 'near-miss'`. This works in-session. The gap is cross-session: `isFirstRun` only checks `ccz-tutorial-completed` (Lesson 1). Lesson 2 and 3 completion are not persisted to localStorage.
- **EDU-73 persistence requires new localStorage keys:** The simplest approach is two new keys — one for near-miss completion and one for sensory-conditioning completion — written when those COMPLETE_STEPS trigger. The `isFirstRun` / mount logic must read both and reconstruct `completedLessons` and `unlockedLessons` accordingly. This does not require full state serialization.
- **v2.3 Sensory Effects Layer depends on Lesson 3 being complete:** The Dopamine Dampener card's win-celebration suppression is the experiential payoff for Lesson 3 content. Lesson 3 must ship first.

---

## MVP Definition

### Launch With (v2.2 scope — all P1)

- [ ] Lesson 3 unlock trigger fires correctly after Lesson 2 completion, including across page reload (requires persistence fix)
- [ ] All four sensory-conditioning dialogue steps render in EN and PT with correct narrator/system roles
- [ ] `sensory-conditioning-observe` step is gated at 2 settled spins via spin-bridge
- [ ] `sensory-conditioning-reveal` shows causality disclosure when triggered by spin (not by Next button)
- [ ] Lesson 3 completion written to localStorage on `sensory-conditioning-complete` step resolution
- [ ] Mount logic restores Lesson 2 and Lesson 3 completion from localStorage on page reload
- [ ] EN/PT source contracts and compatibility coverage confirm parity

### Add After Validation (v2.3)

- [ ] Win-celebration effects (neon pulse, reel glow) on Slots win outcomes — requires Lesson 3 to exist first
- [ ] Dopamine Dampener card activates win-celebration suppression — functional payoff for Lesson 3 content

### Future Consideration (v2+)

- [ ] Per-lesson outcome tracking (which concepts the user revisited, which they skipped) — requires analytics infra
- [ ] Adaptive dialogue (different copy for repeat visitors vs. first-timers) — requires user identity

---

## Feature Prioritization Matrix

| Feature                                 | User Value | Implementation Cost                             | Priority |
| --------------------------------------- | ---------- | ----------------------------------------------- | -------- |
| Lesson 3 unlock from Near-Miss          | HIGH       | LOW (engine done, gap is session restore)       | P1       |
| Sensory conditioning dialogue EN + PT   | HIGH       | LOW (fully authored, needs wiring verification) | P1       |
| Spin-bridge 2-spin gate                 | HIGH       | LOW (already in recordSpin)                     | P1       |
| Lesson 3 completion persistence         | HIGH       | MEDIUM (new localStorage keys + mount logic)    | P1       |
| Causality disclosure on reveal          | MEDIUM     | LOW (already in renderDialogue)                 | P1       |
| EN/PT parity lock + compatibility tests | MEDIUM     | LOW (i18n strings exist, tests partially exist) | P1       |

**Priority key:**

- P1: Must have for launch
- P2: Should have, add when possible
- P3: Nice to have, future consideration

---

## Dialogue Beat Structure (Reference for Roadmap)

Based on the existing authored content and educational research on gambling harm reduction, the expected beat sequence for a sensory conditioning lesson:

1. **Frame the topic** — name what sensory conditioning is without judgment. Separate the mechanism from morality. (`sensory-conditioning-intro`)
2. **Observation gate** — require the user to watch the machine operate before explaining. This mirrors the classical conditioning exposure loop and makes the lesson credible by grounding it in direct experience. (`sensory-conditioning-observe`, 2-spin threshold)
3. **Causal reveal** — explain how repetition, cadence, and audiovisual bursts create anticipation and reinforce recall without altering the math. The causality disclosure explains why the dialogue changed after the spins, closing the meta-loop. (`sensory-conditioning-reveal`)
4. **Consolidation** — name what the user now knows: sensory reinforcement is an interface layer, not a signal of luck or control. (`sensory-conditioning-complete`)

This structure matches established educational animation research on erroneous cognition reduction: short format, structural characteristic focus, no moralization, observation before explanation.

**What the beats explicitly avoid:**

- Moral framing ("gambling is bad") — undermines educational credibility
- Real-money risk framing — out of scope for this zero-risk simulator
- Skill or strategy claims — conditioning is not about player decisions
- False urgency or scarcity — anti-manipulation contract must be preserved in the lesson itself

---

## Sources

- Codebase audit: `src/scripts/casinocraftz/tutorial/dialogue.ts`, `engine.ts`, `main.ts`, `types.ts`
- Codebase audit: `src/i18n/en.json`, `pt.json`
- Codebase audit: `e2e/compatibility.spec.ts`
- Codebase audit: `src/pages/en/casinocraftz/index.astro`, `src/pages/pt/casinocraftz/index.astro`
- [How flashing lights and catchy tunes make gamblers take more risks — The Conversation](https://theconversation.com/how-flashing-lights-and-catchy-tunes-make-gamblers-take-more-risks-105852)
- [Effects of Audiovisual Cues on Game Immersion during Simulated Slot Machine Gambling — Journal of Gambling Studies, Springer 2025](https://link.springer.com/article/10.1007/s10899-025-10397-9)
- [Behavioral analysis of habit formation in modern slot machine gambling — Tandfonline 2022](https://www.tandfonline.com/doi/full/10.1080/14459795.2022.2088822)
- [Reducing Erroneous Cognition — International Journal of Mental Health and Addiction, Springer](https://link.springer.com/article/10.1007/s11469-012-9424-z)
- [Increasing correct knowledge and beliefs about slot machines — Harrigan et al. 2013, GREO](<https://www.greo.ca/Modules/EvidenceCentre/files/Harrigan%20et%20al(2013)Increasing_correct_knowledge_and_beliefs_about_slot_machine.pdf>)

---

_Feature research for: Casinocraftz v2.2 Sensory Conditioning Content_
_Researched: 2026-04-04_
