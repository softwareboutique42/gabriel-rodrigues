---
phase: 34-learning-loop-clarity-and-bounded-progression-ux
plan: 01
subsystem: ui
tags: [casinocraftz, tutorial, cards, i18n, compatibility, playwright]
requires:
  - phase: 33-bridge-and-authority-hardening
    provides: [versioned-bridge-envelope, safe-parser, authority-isolation-contracts]
provides:
  - spin-triggered causality messaging for probability-reveal
  - replay and recap controls inside tutorial zone without state mutation
  - deterministic LOCKED/UNLOCKED card status badges with EN/PT parity
affects: [casinocraftz-tutorial, cards-surface, e2e-compatibility, i18n-parity]
tech-stack:
  added: []
  patterns:
    [dataset-localized-ui-copy, spin-trigger-context-flag, source-contract-and-e2e-validation]
key-files:
  created:
    - .planning/phases/34-learning-loop-clarity-and-bounded-progression-ux/34-01-SUMMARY.md
  modified:
    - src/scripts/casinocraftz/tutorial/dialogue.ts
    - src/scripts/casinocraftz/tutorial/engine.ts
    - src/scripts/casinocraftz/tutorial/main.ts
    - src/pages/en/casinocraftz/index.astro
    - src/pages/pt/casinocraftz/index.astro
    - tests/casinocraftz-tutorial-contract.test.mjs
    - e2e/compatibility.spec.ts
key-decisions:
  - Replay and recap labels are dataset-localized to avoid locale-conditional logic in runtime render paths.
  - Replay visibility is bounded to house-edge-intro onward to keep welcome step concise and intentional.
  - Card lock badges are presentation-only and computed directly from state.cardsUnlocked.
patterns-established:
  - Transition-cause UI behavior via TutorialState.lastTransitionTrigger with no authority coupling.
  - Deterministic selectors use canonical data-casinocraftz-* kebab-case attributes for E2E stability.
requirements-completed: [LEARN-50, LEARN-51, PROG-50]
duration: 35min
completed: 2026-04-03
---

# Phase 34 Plan 01: Learning Loop Clarity and Bounded Progression UX Summary

**Spin-triggered tutorial causality, non-mutating replay/recap controls, and deterministic card lock transparency now ship inside existing Casinocraftz tutorial/cards surfaces with EN/PT parity.**

## Performance

- **Duration:** ~35 min
- **Completed:** 2026-04-03
- **Tasks:** 3
- **Files modified:** 7

## Accomplishments

- Added causality-first probability-reveal lead copy and recap disclosure logic tied specifically to spin-triggered transitions.
- Added replay CTA behavior from house-edge-intro onward that re-renders current dialogue without mutating spins, cards, or essence.
- Added LOCKED/UNLOCKED status chips on each starter card, computed deterministically from `state.cardsUnlocked` and localized via EN/PT dataset labels.
- Corrected compatibility E2E selectors to canonical `data-casinocraftz-*` attributes and validated spin-driven progression plus tutorial system coverage.

## Files Created/Modified

- `.planning/phases/34-learning-loop-clarity-and-bounded-progression-ux/34-01-SUMMARY.md` - Phase completion artifact.
- `src/scripts/casinocraftz/tutorial/dialogue.ts` - Causality-first `probability-reveal` narrator line (EN/PT).
- `src/scripts/casinocraftz/tutorial/engine.ts` - Deterministic initialization of `lastTransitionTrigger`.
- `src/scripts/casinocraftz/tutorial/main.ts` - Replay gate, recap rendering, localized dataset copy, spin-count dataset, card lock badge localization.
- `src/pages/en/casinocraftz/index.astro` - Added dataset translation keys for replay/recap/causality/card-status labels.
- `src/pages/pt/casinocraftz/index.astro` - Added parity dataset translation keys for replay/recap/causality/card-status labels.
- `tests/casinocraftz-tutorial-contract.test.mjs` - Updated contracts for replay localization path and recap dataset usage.
- `e2e/compatibility.spec.ts` - Fixed selectors and progression steps for replay/recap/card-badge deterministic checks.

## Validation

- `node --test tests/casinocraftz-tutorial-contract.test.mjs tests/slots-i18n-parity-contract.test.mjs` -> PASS (29/29).
- `npx playwright test e2e/compatibility.spec.ts --project=chromium --workers=1 --grep "play-and-observe step advances to probability-reveal after 3 spins via postMessage bridge - EN|play-and-observe step advances to probability-reveal after 3 spins via postMessage bridge - PT|casinocraftz tutorial system"` -> PASS (4/4).
- `npm run lint` -> PASS with 1 pre-existing warning in `.claude/get-shit-done/bin/lib/state.cjs` (unused eslint-disable directive).
- `npm run build` -> PASS (static build completed).

## Decisions Made

- Kept all behavior in existing tutorial/cards zones and avoided new mechanics/routes to preserve phase scope.
- Kept authority boundaries intact by limiting transition metadata (`lastTransitionTrigger`) to presentation behavior only.
- Used root dataset localization for new UI labels to preserve EN/PT parity and avoid locale-specific runtime branches.

## Deviations from Plan

None - plan executed as written.

## Issues Encountered

- E2E selectors used non-canonical attribute names (`data-casinocraftzreplay`, camel-cased card status selectors); fixed to canonical kebab-case dataset attributes.

## User Setup Required

None.

## Next Phase Readiness

- LEARN-50, LEARN-51, and PROG-50 are validated in source contracts and targeted browser tests.
- No blockers identified for advancing Phase 34 workflow.

---

_Phase: 34-learning-loop-clarity-and-bounded-progression-ux_
_Completed: 2026-04-03_
