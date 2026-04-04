---
phase: 37-lesson-curriculum-shell-and-contracts
plan: 01
subsystem: curriculum-shell
tags: [curriculum, lesson-shell, deterministic-state, bounded-progression, i18n]
requires:
  - phase: 36-confidence-lock-and-release-evidence
    provides: [deterministic host shell baseline, parity-safe tutorial surfaces]
provides:
  - EDU-60 deterministic multi-lesson curriculum shell foundation
  - PROG-61 bounded lesson preview and revisit controls
  - phase-38-ready lesson state and dataset anchors
affects: [casinocraftz-tutorial-shell, v1.9-psychology-curriculum]
tech-stack:
  added: []
  patterns: [dataset-backed-lesson-state, bounded-shell-preview-controls]
key-files:
  created:
    - .planning/phases/37-lesson-curriculum-shell-and-contracts/37-01-SUMMARY.md
  modified:
    - src/scripts/casinocraftz/tutorial/types.ts
    - src/scripts/casinocraftz/tutorial/engine.ts
    - src/scripts/casinocraftz/tutorial/main.ts
    - src/pages/en/casinocraftz/index.astro
    - src/pages/pt/casinocraftz/index.astro
    - src/i18n/en.json
    - src/i18n/pt.json
    - tests/casinocraftz-tutorial-contract.test.mjs
    - .planning/REQUIREMENTS.md
key-decisions:
  - Current lesson flow remained canonical while future lessons were exposed as locked previews rather than incomplete routes.
  - Lesson state was anchored in deterministic datasets to support parity and later curriculum expansion.
patterns-established:
  - Curriculum growth should happen through shell-level lesson state first, then content delivery in later phases.
requirements-completed: [EDU-60, PROG-61]
duration: 35min
completed: 2026-04-04
---

# Phase 37 Plan 01: Lesson Curriculum Shell and Contracts Summary

**Casinocraftz now has a deterministic curriculum shell with one active lesson, two locked psychology lesson previews, and bounded revisit controls without any gameplay authority changes.**

## Performance

- **Duration:** ~35 min
- **Completed:** 2026-04-04
- **Tasks:** 3
- **Files modified:** 9

## Accomplishments

- Added lesson-aware tutorial state and deterministic lesson datasets for current, unlocked, and completed curriculum state.
- Shipped a bounded curriculum rail on EN/PT Casinocraftz pages with lesson one active and future lessons visible as locked previews.
- Closed EDU-60 and PROG-61 with passing source contracts, lint, and build evidence.

## Files Created/Modified

- `.planning/phases/37-lesson-curriculum-shell-and-contracts/37-01-SUMMARY.md` - Phase completion evidence.
- `src/scripts/casinocraftz/tutorial/types.ts` - Added lesson identifiers and bounded lesson state contracts.
- `src/scripts/casinocraftz/tutorial/engine.ts` - Added curriculum lesson registry and lesson completion helpers.
- `src/scripts/casinocraftz/tutorial/main.ts` - Rendered curriculum shell and synchronized lesson datasets.
- `src/pages/en/casinocraftz/index.astro` - Added EN curriculum shell dataset anchors and shell container.
- `src/pages/pt/casinocraftz/index.astro` - Added PT curriculum shell dataset anchors and shell container.
- `src/i18n/en.json` - Added EN curriculum shell copy.
- `src/i18n/pt.json` - Added PT curriculum shell copy.
- `tests/casinocraftz-tutorial-contract.test.mjs` - Added lesson shell source contracts.
- `.planning/REQUIREMENTS.md` - Marked EDU-60 and PROG-61 complete.

## Validation

- `node --test tests/casinocraftz-tutorial-contract.test.mjs tests/compatibility-contract.test.mjs` -> PASS (27/27)
- `npm run lint` -> PASS with one existing warning in `.claude/get-shit-done/bin/lib/state.cjs`
- `npm run build` -> PASS (Astro static build complete)

## Decisions Made

- Kept future lessons visible but locked instead of introducing placeholder routes or partial lesson content.
- Revisit behavior stays bounded to the currently unlocked lesson so progression remains educational, not collectible.

## Deviations from Plan

None - plan executed as written.

## Issues Encountered

- One new source contract used the wrong identifier spelling and was corrected to match the runtime naming.

## User Setup Required

None.

## Next Phase Readiness

- Phase 37 shell foundation is complete and phase 38 can now focus on near-miss lesson delivery instead of lesson infrastructure.

---

_Phase: 37-lesson-curriculum-shell-and-contracts_
_Completed: 2026-04-04_
