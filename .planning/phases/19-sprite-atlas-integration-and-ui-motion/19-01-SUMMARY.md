---
phase: 19-sprite-atlas-integration-and-ui-motion
plan: 01
subsystem: ui
tags: [slots, sprite-atlas, motion, deterministic-events, astro-spa, playwright]
requires:
  - phase: 18-slots-animation-runtime-foundation
    provides: deterministic visual event contract and runtime lifecycle scaffolding
provides:
  - Deterministic symbol-to-frame mapping boundary for atlas-backed visuals
  - Atlas readiness snapshot and missing-frame observability hooks
  - Subtle idle/UI motion model integrated into presentation runtime
affects:
  [
    20-animated-symbols-and-theme-variants,
    21-accessibility-and-performance-hardening,
    22-regression-and-runtime-confidence-lock,
  ]
tech-stack:
  added: []
  patterns:
    [
      presentation-only-atlas-contract,
      symbol-frame-adapter,
      non-blocking-idle-motion,
      deterministic-observability-hooks,
    ]
key-files:
  created:
    - src/scripts/slots/animation/symbol-frame-map.ts
    - src/scripts/slots/animation/atlas-registry.ts
    - src/scripts/slots/animation/idle-motion.ts
    - tests/slots-sprite-atlas-contract.test.mjs
    - .planning/phases/19-sprite-atlas-integration-and-ui-motion/19-01-SUMMARY.md
  modified:
    - src/scripts/slots/animation/runtime.ts
    - tests/slots-animation-event-sequencing-contract.test.mjs
    - e2e/compatibility.spec.ts
key-decisions:
  - SlotSymbol values remain domain-owned and map to atlas frame keys only inside presentation modules.
  - Runtime publishes atlas/idle snapshots through data-slots-anim-* hooks to keep browser assertions deterministic and timing-agnostic.
patterns-established:
  - Atlas readiness is deterministic and reported as explicit ready/missing state.
  - Idle/UI motion is event-driven and non-authoritative, with no gameplay mutation path.
requirements-completed: [SPRITE-10, ANIM-12]
duration: 15min
completed: 2026-04-02
---

# Phase 19 Plan 01 Summary

Status: complete

## Outcome

Implemented the Phase 19 sprite atlas and UI motion pass on top of the existing deterministic animation runtime without changing gameplay authority boundaries.

1. Added a deterministic symbol-to-frame mapping adapter and required-frame contract for atlas-backed symbol presentation.
2. Added atlas readiness utilities with explicit missing-frame detection and runtime snapshots.
3. Added a subtle idle/UI motion model (`idle-pulse` and `active-transition`) wired to existing visual events.
4. Extended runtime observability with stable presentation hooks (`data-slots-anim-atlas`, `data-slots-anim-atlas-id`, `data-slots-anim-idle`, `data-slots-anim-symbol-map`, optional `data-slots-anim-atlas-missing`).
5. Added dedicated sprite-atlas contract coverage and expanded compatibility assertions for EN/PT runtime parity.

## Validation

- `npm run lint && node --test tests/slots-core-determinism-contract.test.mjs tests/slots-interaction-guards-contract.test.mjs tests/slots-i18n-parity-contract.test.mjs tests/slots-animation-event-sequencing-contract.test.mjs tests/slots-sprite-atlas-contract.test.mjs && npx playwright test e2e/compatibility.spec.ts --project=chromium && npm run build`: pass.

## Rollback Notes

- Revert `src/scripts/slots/animation/symbol-frame-map.ts`, `src/scripts/slots/animation/atlas-registry.ts`, and `src/scripts/slots/animation/idle-motion.ts` to remove Phase 19 sprite/motion primitives.
- Revert `src/scripts/slots/animation/runtime.ts` to drop atlas and idle observability hooks.
- Revert `tests/slots-sprite-atlas-contract.test.mjs`, `tests/slots-animation-event-sequencing-contract.test.mjs`, and `e2e/compatibility.spec.ts` if runtime observability contracts need to be reset.
