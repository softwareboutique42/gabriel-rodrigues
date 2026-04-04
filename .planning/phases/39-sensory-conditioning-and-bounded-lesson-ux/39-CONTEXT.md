# Phase 39: Sensory Conditioning and Bounded Lesson UX - Context

**Gathered:** 2026-04-04
**Status:** Ready for planning

## Phase Boundary

Deliver the sensory-conditioning lesson and tighten bounded curriculum progression UX without adding any gameplay authority, reward loops, or route branching.

This phase adds explanatory lesson content and shell-level UX only:

- no Slots RNG/payout/economy changes,
- no collectible or grind unlock systems,
- no new standalone lesson routes.

## Locked Decisions

- EDU-62 must explain audiovisual reinforcement as a presentation-layer tactic, not as evidence that the player can influence results.
- PROG-60 must be satisfied through transparent locked/unlocked/completed lesson visibility and bounded revisit controls.
- Sensory-conditioning delivery should build on the shared shell and near-miss-ready lesson model from Phase 38.
- Any progression visibility changes must remain deterministic and parity-safe in EN/PT.

## In Scope (Phase 39)

- Add sensory-conditioning lesson content and deterministic step flow.
- Promote lesson three from locked preview to bounded unlocked state after near-miss completion.
- Tighten curriculum shell progress visibility and revisit UX so lesson progression remains explicit and non-grindable.

## Out of Scope

- Final parity matrix lock and release evidence closure.
- Any economy-linked unlock mechanic or meta-system.
- Gameplay runtime authority changes.

## Canonical References

- .planning/REQUIREMENTS.md (EDU-62, PROG-60)
- .planning/ROADMAP.md (Phase 39 section)
- .planning/STATE.md
- .planning/phases/38-near-miss-lesson-delivery/38-01-SUMMARY.md
- src/scripts/casinocraftz/tutorial/types.ts
- src/scripts/casinocraftz/tutorial/engine.ts
- src/scripts/casinocraftz/tutorial/main.ts
- src/scripts/casinocraftz/tutorial/dialogue.ts
- src/pages/en/casinocraftz/index.astro
- src/pages/pt/casinocraftz/index.astro
- src/i18n/en.json
- src/i18n/pt.json
- tests/casinocraftz-tutorial-contract.test.mjs
- e2e/compatibility.spec.ts

## Exit Condition

- Sensory-conditioning lesson is reachable through the existing curriculum shell.
- Lesson progression visibility is explicitly bounded and transparent across the shell.
- EDU-62 and PROG-60 have passing validation evidence and a summary artifact.
