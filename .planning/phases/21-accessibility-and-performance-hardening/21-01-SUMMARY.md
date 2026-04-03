---
phase: 21-accessibility-and-performance-hardening
plan: 01
subsystem: testing
tags: [slots, accessibility, performance, deterministic-runtime, playwright]
requires:
  - phase: 20-animated-symbols-and-theme-variants
    provides: deterministic symbol-state and theme runtime observability hooks
provides:
  - deterministic reduced-motion and intensity policy resolution
  - deterministic performance guardrail fallback model with bounded recovery
  - EN/PT compatibility assertions for accessibility/performance runtime hooks
affects: [phase-22-regression-and-runtime-confidence-lock, slots-runtime, compatibility-tests]
tech-stack:
  added: []
  patterns:
    - presentation-only motion/performance overlays with no authority mutation
    - data-slots-anim-* snapshots for timing-agnostic contract and E2E assertions
key-files:
  created:
    - src/scripts/slots/animation/motion-policy.ts
    - src/scripts/slots/animation/performance-guardrail.ts
    - tests/slots-motion-accessibility-contract.test.mjs
    - tests/slots-performance-guardrail-contract.test.mjs
  modified:
    - src/scripts/slots/animation/runtime.ts
    - src/pages/en/slots/index.astro
    - src/pages/pt/slots/index.astro
    - tests/slots-animation-event-sequencing-contract.test.mjs
    - e2e/compatibility.spec.ts
key-decisions:
  - Keep reduced-motion and intensity controls deterministic via query -> dataset -> default resolution order.
  - Keep performance guardrail bounded to full -> reduced -> minimal with deterministic recovery windows.
  - Validate accessibility/performance behavior through stable runtime datasets rather than timing-dependent assertions.
patterns-established:
  - Motion and guardrail logic remain presentation-only and never mutate gameplay authority datasets.
  - Runtime snapshots include reduced-motion, intensity, performance, and sequence fields for EN/PT parity checks.
requirements-completed: [A11Y-10, PERF-10]
duration: 1min
completed: 2026-04-03
---

# Phase 21 Plan 01: Accessibility and Performance Hardening Summary

**Slots runtime now resolves reduced-motion and intensity deterministically, applies bounded performance fallback tiers, and exposes stable accessibility/performance observability hooks validated across EN/PT contracts and compatibility E2E.**

## Performance

- **Duration:** 1 min
- **Started:** 2026-04-03T00:30:31Z
- **Completed:** 2026-04-03T00:31:11Z
- **Tasks:** 3
- **Files modified:** 9

## Accomplishments

- Added deterministic motion policy resolution with reduced-motion-aware effective intensity mapping.
- Integrated performance guardrail sampling and bounded fallback projection into runtime observability snapshots.
- Added explicit A11Y-10/PERF-10 contracts and EN/PT compatibility assertions for accessibility/performance hooks.

## Task Commits

1. **Task 1: Add deterministic reduced-motion and intensity policy contracts** - `dce0736` (feat)
2. **Task 2: Implement deterministic performance guardrail fallback model** - `d0960af` (feat)
3. **Task 3: Add accessibility/performance contracts and compatibility assertions** - `a0883bd` (test)

## Files Created/Modified

- `src/scripts/slots/animation/motion-policy.ts` - Deterministic resolver for requested/effective motion intensity and reduced-motion behavior.
- `src/scripts/slots/animation/performance-guardrail.ts` - Deterministic budget pressure model with bounded fallback and recovery.
- `src/scripts/slots/animation/runtime.ts` - Runtime integration for motion/performance snapshots and effective intensity projection.
- `src/pages/en/slots/index.astro` - EN root dataset baseline for explicit motion intensity control.
- `src/pages/pt/slots/index.astro` - PT root dataset baseline for explicit motion intensity control.
- `tests/slots-motion-accessibility-contract.test.mjs` - A11Y-10 contracts for policy determinism and presentation-only runtime behavior.
- `tests/slots-performance-guardrail-contract.test.mjs` - PERF-10 contracts for deterministic degrade/recover behavior.
- `tests/slots-animation-event-sequencing-contract.test.mjs` - Sequencing/runtime assertions extended with accessibility/performance datasets.
- `e2e/compatibility.spec.ts` - EN/PT compatibility assertions for accessibility/performance observability hooks.

## Validation

- `npm run lint` -> pass (1 pre-existing warning in `.claude/get-shit-done/bin/lib/state.cjs`, no errors).
- `node --test tests/slots-core-determinism-contract.test.mjs tests/slots-interaction-guards-contract.test.mjs tests/slots-i18n-parity-contract.test.mjs tests/slots-animation-event-sequencing-contract.test.mjs tests/slots-symbol-states-contract.test.mjs tests/slots-theme-variants-contract.test.mjs tests/slots-motion-accessibility-contract.test.mjs tests/slots-performance-guardrail-contract.test.mjs` -> pass (23/23).
- `npx playwright test e2e/compatibility.spec.ts --project=chromium` -> pass (5/5).
- `npm run build` -> pass.
- `npm run lint && node --test tests/slots-core-determinism-contract.test.mjs tests/slots-interaction-guards-contract.test.mjs tests/slots-i18n-parity-contract.test.mjs tests/slots-animation-event-sequencing-contract.test.mjs tests/slots-symbol-states-contract.test.mjs tests/slots-theme-variants-contract.test.mjs tests/slots-motion-accessibility-contract.test.mjs tests/slots-performance-guardrail-contract.test.mjs && npx playwright test e2e/compatibility.spec.ts --project=chromium && npm run build` -> pass.

## Decisions Made

- Motion intensity precedence is query parameter (`slotsMotion`) then root dataset (`data-slots-motion`) then default.
- Reduced-motion maps requested `full` to effective `reduced`, and otherwise clamps to `minimal`.
- Performance degradation is deterministic and bounded with recover-sample hysteresis to avoid oscillation.

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

- Existing lint warning in `.claude/get-shit-done/bin/lib/state.cjs` remained out of scope for this phase.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- Accessibility/performance hardening is complete and verified for deterministic contracts plus EN/PT compatibility coverage.
- Phase 22 can focus on regression confidence lock with existing runtime observability hooks.

## Self-Check: PASSED

- FOUND: .planning/phases/21-accessibility-and-performance-hardening/21-01-SUMMARY.md
- FOUND: dce0736
- FOUND: d0960af
- FOUND: a0883bd
