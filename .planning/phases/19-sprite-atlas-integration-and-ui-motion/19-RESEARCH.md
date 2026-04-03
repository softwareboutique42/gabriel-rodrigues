# Phase 19: Sprite Atlas Integration and UI Motion - Research

**Researched:** 2026-04-02
**Domain:** Deterministic sprite-atlas integration over existing Slots animation runtime
**Confidence:** HIGH

## Summary

Phase 19 should extend the existing presentation-only runtime introduced in Phase 18 by adding sprite-atlas readiness and symbol-to-frame mapping without touching authoritative gameplay logic. The best integration point remains the current animation runtime boundary and event flow (`spin-accepted`, `spin-resolved`, `spin-blocked`).

The lowest-risk path is:

1. Add atlas registry + schema validation and deterministic symbol frame mapping.
2. Add subtle idle/UI motion state hooks driven by existing event/state flow.
3. Expand contract and compatibility coverage with deterministic, non-timing-fragile assertions.

## Requirement Mapping

| ID        | Description                                                         | Research Support                                                            |
| --------- | ------------------------------------------------------------------- | --------------------------------------------------------------------------- |
| SPRITE-10 | Symbol visuals migrate to atlas pipeline with deterministic mapping | Atlas registry + symbol map contracts and validation tests                  |
| ANIM-12   | Idle/UI transitions are subtle, non-blocking, EN/PT consistent      | Presentation-only motion hooks and compatibility checks on canonical routes |

## Architecture Notes

- Keep `SlotSymbol` (`A`..`E`) as domain type and map to frame keys in presentation layer only.
- Validate atlas frame availability at runtime initialization and expose deterministic readiness hook.
- Preserve SPA mount/dispose behavior and avoid persistent listeners across route transitions.
- Avoid frame-time-dependent business assertions; prefer state and data attribute checks.

## Proposed Modules

- `src/scripts/slots/animation/atlas-registry.ts`
- `src/scripts/slots/animation/symbol-frame-map.ts`
- `src/scripts/slots/animation/idle-motion.ts`
- `src/scripts/slots/animation/runtime.ts` (integration)

## Test Strategy

- Add deterministic contract file for atlas + symbol mapping and motion projection boundaries.
- Extend compatibility E2E with stable `data-slots-anim-*` presentation hooks for atlas readiness and idle state.
- Keep existing determinism/guards/i18n contracts green.

## Risks and Mitigations

- **Atlas drift/missing frames:** mitigate with schema and frame presence checks.
- **Authority coupling:** keep all sprite/motion logic in animation modules; no engine/economy writes.
- **SPA leaks:** continue AbortController and idempotent runtime disposal pattern.

## Validation Baseline

- `npm run lint`
- `node --test tests/slots-core-determinism-contract.test.mjs tests/slots-interaction-guards-contract.test.mjs tests/slots-i18n-parity-contract.test.mjs tests/slots-animation-event-sequencing-contract.test.mjs tests/slots-sprite-atlas-contract.test.mjs`
- `npx playwright test e2e/compatibility.spec.ts --project=chromium`
- `npm run build`
