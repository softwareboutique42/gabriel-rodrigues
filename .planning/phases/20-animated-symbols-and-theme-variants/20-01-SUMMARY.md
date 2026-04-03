---
phase: 20-animated-symbols-and-theme-variants
plan: 01
subsystem: ui
tags: [slots, symbol-states, theme-variants, deterministic-events, astro-spa, playwright]
requires:
  - phase: 19-sprite-atlas-integration-and-ui-motion
    provides: atlas-backed symbol mapping and deterministic runtime observability hooks
provides:
  - Deterministic symbol-state projection (`idle`, `spin`, `win-react`) from visual runtime events
  - Presentation-only theme registry with deterministic default and fallback behavior
  - Runtime observability snapshots for active theme and symbol states used by contracts/E2E
affects: [21-accessibility-and-performance-hardening, 22-regression-and-runtime-confidence-lock]
tech-stack:
  added: []
  patterns:
    [
      event-driven-symbol-states,
      presentation-only-theme-selection,
      deterministic-fallback-resolution,
    ]
key-files:
  created:
    - src/scripts/slots/animation/symbol-states.ts
    - src/scripts/slots/animation/theme-registry.ts
    - src/scripts/slots/animation/theme-selection.ts
    - tests/slots-symbol-states-contract.test.mjs
    - tests/slots-theme-variants-contract.test.mjs
    - .planning/phases/20-animated-symbols-and-theme-variants/20-01-SUMMARY.md
  modified:
    - src/scripts/slots/animation/runtime.ts
    - src/pages/en/slots/index.astro
    - src/pages/pt/slots/index.astro
    - tests/slots-animation-event-sequencing-contract.test.mjs
    - tests/slots-sprite-atlas-contract.test.mjs
    - e2e/compatibility.spec.ts
key-decisions:
  - Symbol states are derived strictly from immutable visual events and never write gameplay authority state.
  - Theme selection order is deterministic (query -> dataset -> default) with explicit fallback.
patterns-established:
  - Runtime publishes stable `data-slots-anim-symbol-state` and `data-slots-anim-theme` hooks for browser-safe assertions.
  - EN/PT slots shells set explicit default theme metadata to keep parity deterministic across locales.
requirements-completed: [SPRITE-11, SPRITE-12]
duration: 15min
completed: 2026-04-03
---

# Phase 20 Plan 01 Summary

Status: complete

## Outcome

Implemented deterministic animated symbol states and presentation-only theme variants on top of the existing slots runtime without changing payout, evaluation, or interaction authority boundaries.

1. Added symbol-state contracts to map runtime visual flow into deterministic per-symbol states (`idle`, `spin`, `win-react`).
2. Added theme registry and selection helpers with deterministic fallback and explicit default handling.
3. Integrated active theme and symbol-state observability hooks into runtime snapshots for contract and browser assertions.
4. Added dedicated contract coverage for symbol-state sequencing and theme fallback behavior.
5. Extended compatibility coverage to assert EN/PT parity for active theme and symbol-state hooks.

## Validation

- `npm run lint && node --test tests/slots-core-determinism-contract.test.mjs tests/slots-interaction-guards-contract.test.mjs tests/slots-i18n-parity-contract.test.mjs tests/slots-animation-event-sequencing-contract.test.mjs tests/slots-sprite-atlas-contract.test.mjs tests/slots-symbol-states-contract.test.mjs tests/slots-theme-variants-contract.test.mjs && npx playwright test e2e/compatibility.spec.ts --project=chromium && npm run build`: pass (lint/build warnings only; no failures).

## Rollback Notes

- Revert `src/scripts/slots/animation/symbol-states.ts`, `src/scripts/slots/animation/theme-registry.ts`, and `src/scripts/slots/animation/theme-selection.ts` to remove Phase 20 symbol-state/theme primitives.
- Revert `src/scripts/slots/animation/runtime.ts` to remove symbol-state/theme observability integration.
- Revert `src/pages/en/slots/index.astro` and `src/pages/pt/slots/index.astro` if explicit default theme metadata must be removed.
- Revert `tests/slots-symbol-states-contract.test.mjs`, `tests/slots-theme-variants-contract.test.mjs`, `tests/slots-animation-event-sequencing-contract.test.mjs`, `tests/slots-sprite-atlas-contract.test.mjs`, and `e2e/compatibility.spec.ts` to reset Phase 20 validation expectations.
