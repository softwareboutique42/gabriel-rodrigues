# Feature Landscape

**Domain:** Educational transparent casino simulation (v1.8)
**Researched:** 2026-04-03

## Table Stakes

Features users should immediately notice in v1.8. Missing these makes the product feel inconsistent with the transparent-education promise.

| Feature                                                     | Why Expected                                                                       | Complexity | Notes                                                                           |
| ----------------------------------------------------------- | ---------------------------------------------------------------------------------- | ---------- | ------------------------------------------------------------------------------- |
| Deterministic lesson progression with clear next-step UI    | Users need to know exactly what to do next after each spin/tutorial action         | Medium     | Show current lesson step, completion status, and next action in the host shell  |
| Observable spin transparency panel                          | Educational simulation must expose why outcomes happen, not just show win/loss     | Medium     | Keep seed/outcome/house-edge context visible and understandable in both locales |
| Progress persistence and safe resume                        | Users expect to continue where they left off without losing tutorial/card progress | Low        | Resume from last completed step and preserve deterministic state transitions    |
| Utility card state visibility (locked/unlocked/active)      | Card progression only feels real when status and effects are visible in the UI     | Medium     | Preserve presentation-only card authority boundary from slots internals         |
| EN/PT parity across progression surfaces                    | Existing product contract requires mirrored educational flow in both languages     | Medium     | Every new label/state/help cue appears in EN and PT with equivalent behavior    |
| Zero-risk framing always visible at progression touchpoints | Product promise is educational and anti-gambling, not entertainment monetization   | Low        | Keep explicit no-real-money and no-microtransaction framing on relevant screens |

## Differentiators

Features that make v1.8 feel meaningfully better without jumping into deferred deep-psychology or full progression expansion.

| Feature                                                             | Value Proposition                                                          | Complexity | Notes                                                                              |
| ------------------------------------------------------------------- | -------------------------------------------------------------------------- | ---------- | ---------------------------------------------------------------------------------- |
| Spin-to-lesson causality callouts                                   | Connects each spin result to the exact lesson claim being taught           | Medium     | Lightweight inline explanation block after important tutorial transitions          |
| Lesson recap cards with mastery checkpoints                         | Turns one-pass tutorial into an observable learning loop users can revisit | Medium     | Keep checkpoints deterministic; avoid adaptive or personalized manipulation models |
| Bounded progression map (current loop + immediate upcoming unlocks) | Gives motivation and orientation without shipping a large meta system      | Medium     | Show only near-term path; defer full progression tree to future milestone          |
| "Try again with same context" replay prompt                         | Reinforces determinism and trust by encouraging repeat observation         | Low        | Re-run learning beat without introducing new economy mechanics                     |

## Anti-Features

Scope boundaries for v1.8. These are intentionally excluded even if adjacent ideas look attractive.

| Anti-Feature                                                                                    | Why Avoid                                                               | What to Do Instead                                                                     |
| ----------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------- | -------------------------------------------------------------------------------------- |
| Deep psychology curriculum expansion (near-miss manipulation, sensory conditioning full module) | Explicitly deferred and likely to bloat milestone scope                 | Keep v1.8 focused on clarity and reinforcement of the existing house-edge-first lesson |
| Full progression expansion into broad card collection/combat meta                               | High complexity and distracts from educational transparency core        | Ship bounded progression visibility only (short horizon, utility-first)                |
| Any monetization surfaces (deposits, paid packs, premium unlock tracks)                         | Violates zero-risk educational framing and anti-monetization guardrails | Preserve fake/free economy and educational utility-card framing                        |
| Dynamic odds adaptation per user behavior                                                       | Undermines deterministic trust and complicates explainability           | Keep deterministic rules fixed and explanations tied to observable state               |
| Locale-asymmetric feature rollout (EN first, PT later)                                          | Breaks parity contracts and multiplies QA risk                          | Release progression/tutorial changes in EN/PT together                                 |

## Feature Dependencies

Deterministic spin/runtime envelope -> tutorial state progression -> utility card unlock/state rendering -> progression map/recap presentation -> EN/PT parity verification -> anti-monetization regression checks

## MVP Recommendation

Prioritize:

1. Deterministic progression clarity pass (step status, next action, resume behavior).
2. Observable transparency + causality layer (seed/outcome/house-edge context tied to tutorial beats).
3. Bounded progression visibility (near-term unlock map + lesson recap checkpoints).

Defer:

- Deep psychology lesson expansion: deferred by v1.7 requirement baseline (EDU-50).
- Large progression/meta-system expansion: postpone until post-v1.8 after learning-loop telemetry and UX validation.

## Sources

- .planning/milestones/v1.7-REQUIREMENTS.md
- .planning/milestones/v1.7-ROADMAP.md
- .planning/v1.7-MILESTONE-AUDIT.md
- .planning/PROJECT.md
- .planning/MILESTONES.md
