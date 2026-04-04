---
phase: 38-near-miss-lesson-delivery
plan: 01
subsystem: curriculum-lesson-delivery
tags: [near-miss, psychology, deterministic-triggers, bounded-progression, parity]
requires:
  - phase: 37-lesson-curriculum-shell-and-contracts
    provides: [lesson shell, bounded lesson state, curriculum datasets]
provides:
  - EDU-61 near-miss lesson delivery evidence
  - bounded unlock path from lesson one to lesson two
  - phase-39-ready psychology curriculum baseline
affects: [casinocraftz-tutorial-shell, v1.9-psychology-curriculum]
tech-stack:
  added: []
  patterns: [lesson-specific-step-order, shell-driven-lesson-unlock]
key-files:
  created:
    - .planning/phases/38-near-miss-lesson-delivery/38-01-SUMMARY.md
  modified:
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
    - .planning/REQUIREMENTS.md
key-decisions:
  - Near-miss unlocking remains shell-driven after lesson one completion rather than depending on any economy or reward system.
  - Near-miss triggers are observation-based and explicitly deny player control over odds or outcomes.
patterns-established:
  - New psychology lessons should use lesson-specific step orders while reusing the shared curriculum shell and bridge-safe runtime.
requirements-completed: [EDU-61]
duration: 35min
completed: 2026-04-04
---

# Phase 38 Plan 01: Near-Miss Lesson Delivery Summary

**Casinocraftz now ships a deterministic near-miss lesson that unlocks after lesson one, explains persuasive almost-win framing, and stays fully bounded inside the existing curriculum shell.**

## Performance

- **Duration:** ~35 min
- **Completed:** 2026-04-04
- **Tasks:** 3
- **Files modified:** 11

## Accomplishments

- Extended the lesson model with a bounded near-miss lesson step sequence and shell-driven unlock path after lesson one completion.
- Added EN/PT near-miss dialogue, causality copy, and step labels that explain perception without implying player control over results.
- Closed EDU-61 with passing source contracts, targeted Playwright coverage, lint, and build evidence.

## Files Created/Modified

- `.planning/phases/38-near-miss-lesson-delivery/38-01-SUMMARY.md` - Phase completion evidence.
- `src/scripts/casinocraftz/tutorial/types.ts` - Added near-miss step identifiers.
- `src/scripts/casinocraftz/tutorial/engine.ts` - Added lesson-specific step order and bounded near-miss unlock/open helpers.
- `src/scripts/casinocraftz/tutorial/main.ts` - Added near-miss shell opening, step labels, and recap causality handling.
- `src/scripts/casinocraftz/tutorial/dialogue.ts` - Added EN/PT near-miss lesson dialogue.
- `src/pages/en/casinocraftz/index.astro` - Added EN near-miss datasets and step label anchors.
- `src/pages/pt/casinocraftz/index.astro` - Added PT near-miss datasets and step label anchors.
- `src/i18n/en.json` - Added EN near-miss copy.
- `src/i18n/pt.json` - Added PT near-miss copy.
- `tests/casinocraftz-tutorial-contract.test.mjs` - Added source contracts for near-miss steps and anti-control copy.
- `e2e/compatibility.spec.ts` - Added browser coverage for near-miss unlock/open behavior.
- `.planning/REQUIREMENTS.md` - Marked EDU-61 complete.

## Validation

- `node --test tests/casinocraftz-tutorial-contract.test.mjs tests/compatibility-contract.test.mjs` -> PASS (28/28)
- `npx playwright test e2e/compatibility.spec.ts --project=chromium --workers=1 --grep "casinocraftz tutorial system|embedded host parity"` -> PASS (5/5)
- `npm run lint` -> PASS with one existing warning in `.claude/get-shit-done/bin/lib/state.cjs`
- `npm run build` -> PASS (Astro static build complete)

## Decisions Made

- Reused the Phase 37 curriculum shell instead of adding lesson-specific routes or duplicate navigation controls.
- Used observation thresholds for near-miss reveal gating so the lesson remains deterministic and presentation-only.

## Deviations from Plan

- One Playwright failure exposed a missing re-render after lesson selection; the shell callback was corrected to refresh datasets and UI state.

## Issues Encountered

- Initial near-miss browser test failed because opening a lesson updated in-memory state without re-rendering root datasets. Fixed in `main.ts`.

## User Setup Required

None.

## Next Phase Readiness

- Phase 39 can now focus on sensory-conditioning content and bounded curriculum progression UX on top of the near-miss-enabled shell.

---

_Phase: 38-near-miss-lesson-delivery_
_Completed: 2026-04-04_
