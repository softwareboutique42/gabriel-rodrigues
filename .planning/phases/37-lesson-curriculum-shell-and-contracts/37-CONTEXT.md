# Phase 37: Lesson Curriculum Shell and Contracts - Context

**Gathered:** 2026-04-04
**Status:** Ready for planning

## Phase Boundary

Introduce a deterministic curriculum shell that makes lesson identity, lock state, and availability explicit without changing Slots gameplay authority or adding new psychology lesson content yet.

This phase is shell and contract work only:

- no new Slots authority paths,
- no payout/economy/RNG mutations,
- no new progression mechanics beyond bounded lesson availability.

## Locked Decisions

- EDU-60 is satisfied by making the current house-edge lesson explicitly part of a lesson registry/shell rather than a hidden one-off flow.
- PROG-61 is satisfied by bounded lesson visibility and revisit/preview controls, not by grind loops or collectible systems.
- Lesson state must be deterministic, dataset-backed, and parity-safe for EN/PT routes.
- Phase 37 can add locked placeholders for future lessons, but full near-miss and sensory-conditioning content is Phase 38/39 scope.

## In Scope (Phase 37)

- Add lesson identity and lesson availability state to tutorial types/engine/runtime.
- Add shell-level UI for current lesson and future locked lesson visibility.
- Add dataset anchors on Casinocraftz pages for lesson shell parity/contracts.
- Add source/browser contracts that prove lesson shell boundaries and bounded progression behavior.

## Out of Scope

- Full near-miss or sensory-conditioning lesson content.
- New gameplay mechanics, economy hooks, or unlock currencies.
- Any route split per lesson.

## Canonical References

- .planning/REQUIREMENTS.md (EDU-60, PROG-61)
- .planning/ROADMAP.md (Phase 37 section)
- .planning/STATE.md (current routing and progress)
- src/pages/en/casinocraftz/index.astro
- src/pages/pt/casinocraftz/index.astro
- src/scripts/casinocraftz/tutorial/types.ts
- src/scripts/casinocraftz/tutorial/engine.ts
- src/scripts/casinocraftz/tutorial/main.ts
- src/scripts/casinocraftz/tutorial/dialogue.ts
- src/i18n/en.json
- src/i18n/pt.json
- tests/casinocraftz-tutorial-contract.test.mjs
- e2e/compatibility.spec.ts

## Exit Condition

- The current lesson flow is explicitly lesson-aware.
- Lesson shell UI exposes deterministic locked/unlocked lesson state without implying grind or reward farming.
- EDU-60 and PROG-61 have passing validation evidence and a summary artifact.
