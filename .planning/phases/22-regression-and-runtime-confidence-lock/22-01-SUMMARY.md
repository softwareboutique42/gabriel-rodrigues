---
phase: 22-regression-and-runtime-confidence-lock
plan: 01
subsystem: testing
tags: [playwright, contracts, i18n, slots, determinism]
requires:
  - phase: 21-accessibility-and-performance-hardening
    provides: deterministic motion/accessibility/performance runtime datasets and guardrails
provides:
  - deterministic contract lock for runtime sequencing, sprite snapshots, and EN/PT parity
  - hardened Playwright compatibility assertions for canonical slots routes in chromium and mobile-chrome
  - QA-20 validation evidence chain (lint, contracts, E2E, build, full chained gate)
affects: [qa-20, slots-runtime, compatibility, regression-gates]
tech-stack:
  added: []
  patterns:
    - tdd-first contract and E2E hardening with red-green commits per task
    - shared Playwright runtime envelope assertions for EN/PT parity checks
key-files:
  created:
    - .planning/phases/22-regression-and-runtime-confidence-lock/22-01-SUMMARY.md
  modified:
    - tests/slots-animation-event-sequencing-contract.test.mjs
    - tests/slots-sprite-atlas-contract.test.mjs
    - tests/slots-symbol-states-contract.test.mjs
    - tests/slots-i18n-parity-contract.test.mjs
    - src/pages/en/slots/index.astro
    - src/pages/pt/slots/index.astro
    - e2e/compatibility.spec.ts
key-decisions:
  - Preserve timing-agnostic QA-20 checks via dataset hooks instead of visual screenshot assertions.
  - Promote slots balance/bet translation labels to data attributes to guarantee EN/PT runtime parity observability.
  - Consolidate compatibility runtime checks into a shared helper to prevent assertion drift between locales.
patterns-established:
  - 'Contracts assert deterministic sequence monotonicity and non-overwrite behavior on blocked flows.'
  - 'Compatibility E2E treats data-slots-anim-* hooks as the primary oracle across EN/PT canonical routes.'
requirements-completed: [QA-20]
duration: 8min
completed: 2026-04-03
---

# Phase 22 Plan 01: Regression and Runtime Confidence Lock Summary

**Deterministic slots runtime confidence lock with stronger sequencing/snapshot contracts and EN/PT parity-safe Playwright coverage for QA-20**

## Performance

- **Duration:** 8 min
- **Started:** 2026-04-03T00:45:10Z
- **Completed:** 2026-04-03T00:52:42Z
- **Tasks:** 2
- **Files modified:** 7

## Accomplishments

- Expanded contract coverage to enforce monotonic runtime sequence progression, blocked-event non-overwrite invariants, and deterministic sprite/symbol snapshot behavior.
- Added EN/PT parity contract requirements for runtime label datasets and implemented missing `data-slots-label-balance`/`data-slots-label-bet` hooks on both locale routes.
- Hardened Playwright compatibility checks with a shared runtime envelope helper and deterministic blocked-flow sequence progression assertion.

## Task Commits

Each task was committed atomically:

1. **Task 1: Harden deterministic contract coverage for runtime sequencing, sprite snapshots, and EN/PT parity**

- `41193e8` (`test`): RED contracts for sequencing/snapshot/parity hardening
- `fc964b3` (`feat`): GREEN implementation exposing missing EN/PT runtime label hooks

2. **Task 2: Harden Playwright compatibility coverage for deterministic EN/PT runtime parity**

- `ee0fd34` (`test`): RED helper usage to enforce consolidated parity assertions
- `6356f32` (`feat`): GREEN helper implementation and blocked-flow seq progression check

## Files Created/Modified

- `tests/slots-animation-event-sequencing-contract.test.mjs` - Added monotonic sequence and blocked non-overwrite runtime assertions.
- `tests/slots-sprite-atlas-contract.test.mjs` - Added deterministic atlas/symbol snapshot repeatability checks across remounts.
- `tests/slots-symbol-states-contract.test.mjs` - Added resolved-to-blocked symbol-state deterministic transition coverage.
- `tests/slots-i18n-parity-contract.test.mjs` - Added parity checks for runtime balance/bet label hooks and canonical route datasets.
- `src/pages/en/slots/index.astro` - Added `data-slots-label-balance` and `data-slots-label-bet` datasets.
- `src/pages/pt/slots/index.astro` - Added `data-slots-label-balance` and `data-slots-label-bet` datasets.
- `e2e/compatibility.spec.ts` - Consolidated EN/PT runtime envelope checks and added blocked-flow sequence lock assertion.

## Validation

- `npm run lint` -> Pass (0 errors, 1 pre-existing warning in `.claude/get-shit-done/bin/lib/state.cjs` for unused eslint-disable).
- `node --test tests/slots-core-determinism-contract.test.mjs tests/slots-animation-event-sequencing-contract.test.mjs tests/slots-sprite-atlas-contract.test.mjs tests/slots-symbol-states-contract.test.mjs tests/slots-i18n-parity-contract.test.mjs tests/slots-motion-accessibility-contract.test.mjs tests/slots-performance-guardrail-contract.test.mjs` -> Pass (24/24 tests).
- `npx playwright test e2e/compatibility.spec.ts --project=chromium --project=mobile-chrome` -> Pass (10/10 tests).
- `npm run build` -> Pass (Astro build complete, 152 pages; non-blocking Vite chunk/CSS warnings).
- `npm run lint && node --test ... && npx playwright test ... && npm run build` -> Pass end-to-end chain.

## Decisions Made

- Hardened parity checks using machine-readable hooks (`data-slots-*`, `data-slots-anim-*`) and kept assertions timing-agnostic.
- Kept deterministic E2E expectations copy-resilient where possible by matching outcome/state patterns rather than locale-specific fixed outcomes.

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

- RED failure in Task 1 revealed missing runtime label datasets (`data-slots-label-balance`, `data-slots-label-bet`) on locale pages; resolved in Task 1 GREEN commit.
- RED failure in Task 2 intentionally triggered by undefined helper (`expectRuntimeParityEnvelope`) and resolved by implementing shared helper assertions.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- QA-20 regression confidence lock gates are in place with deterministic contract/E2E coverage and full validation evidence.
- Ready for verification/closeout of phase 22 plan 01.
