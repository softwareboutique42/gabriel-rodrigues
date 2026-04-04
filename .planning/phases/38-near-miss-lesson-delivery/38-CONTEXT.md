# Phase 38: Near-Miss Lesson Delivery - Context

**Gathered:** 2026-04-04
**Status:** Ready for planning

## Phase Boundary

Deliver the near-miss psychology lesson on top of the new curriculum shell using deterministic triggers, explanatory copy, and bounded recap behavior.

This phase adds lesson content only:

- no new Slots gameplay authority,
- no reward currencies or unlock loops,
- no new route branching per lesson.

## Locked Decisions

- EDU-61 must explain the persuasive feeling of almost-winning outcomes without implying player influence over results.
- Near-miss delivery should reuse the lesson shell introduced in Phase 37 rather than inventing a second navigation model.
- Trigger rules must remain deterministic and derived from existing bridge/visual evidence.
- Any recap or replay affordance must stay presentation-only and parity-safe.

## In Scope (Phase 38)

- Add near-miss lesson copy and deterministic step flow.
- Unlock near-miss lesson through bounded shell logic after lesson one completion.
- Add contracts/browser checks proving near-miss lesson state, copy, and trigger behavior.

## Out of Scope

- Sensory-conditioning lesson content.
- New reward systems, collection meta, or economy-coupled lesson unlocks.
- Changes to Slots RNG, payout, or economy internals.

## Canonical References

- .planning/REQUIREMENTS.md (EDU-61)
- .planning/ROADMAP.md (Phase 38 section)
- .planning/STATE.md
- .planning/phases/37-lesson-curriculum-shell-and-contracts/37-01-SUMMARY.md
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

- Near-miss lesson is reachable through the existing curriculum shell.
- Lesson copy and trigger behavior are deterministic and explicitly educational.
- EDU-61 has passing validation evidence and a summary artifact.
