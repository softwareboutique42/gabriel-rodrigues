# Phase 21: Accessibility and Performance Hardening - Research

**Researched:** 2026-04-02
**Domain:** Reduced-motion and runtime performance guardrails for Slots animation runtime
**Confidence:** HIGH

## Summary

Phase 21 should harden the current Slots presentation runtime by adding deterministic motion accessibility controls and performance fallback policies while preserving gameplay authority boundaries.

Recommended sequence:

1. Add reduced-motion and intensity-tier resolution at the presentation runtime boundary.
2. Add deterministic performance budget model with observable fallback state.
3. Expand contracts and compatibility coverage for reduced-motion parity and guardrail behavior.

## Requirement Mapping

| ID      | Description                                                    | Research Support                                                        |
| ------- | -------------------------------------------------------------- | ----------------------------------------------------------------------- |
| A11Y-10 | Reduced-motion and intensity controls preserve behavior parity | Motion preference resolver + intensity policy model + parity assertions |
| PERF-10 | Animation runtime respects guardrails under load               | Performance budget model + deterministic degrade path + runtime hooks   |

## Architecture Notes

- Keep all accessibility/performance logic inside presentation modules (`src/scripts/slots/animation/*`).
- Preserve existing deterministic event flow and authority boundaries from phases 18-20.
- Write machine-readable runtime hooks for motion mode/intensity/performance state using `data-slots-anim-*` attributes.
- Maintain SPA safety with idempotent mount/dispose and no persistent leaked listeners.

## Proposed Modules

- `src/scripts/slots/animation/motion-policy.ts`
- `src/scripts/slots/animation/performance-guardrail.ts`
- `src/scripts/slots/animation/runtime.ts` (integration)

## Test Strategy

- Add `tests/slots-motion-accessibility-contract.test.mjs` for reduced-motion and intensity policy determinism.
- Add `tests/slots-performance-guardrail-contract.test.mjs` for performance budget snapshots and fallback behavior.
- Extend `tests/slots-animation-event-sequencing-contract.test.mjs` for runtime observability hooks.
- Extend `e2e/compatibility.spec.ts` with EN/PT assertions for accessibility/performance runtime attributes.

## Risks and Mitigations

- **Authority coupling risk:** keep no imports from controller/economy/engine in new policy modules.
- **Timing brittleness risk:** assert state snapshots, not frame-perfect animation timing.
- **Over-degradation risk:** keep fallback levels deterministic and bounded (`full` -> `reduced` -> `minimal`).

## Validation Baseline

- `npm run lint`
- `node --test tests/slots-core-determinism-contract.test.mjs tests/slots-interaction-guards-contract.test.mjs tests/slots-i18n-parity-contract.test.mjs tests/slots-animation-event-sequencing-contract.test.mjs tests/slots-symbol-states-contract.test.mjs tests/slots-theme-variants-contract.test.mjs tests/slots-motion-accessibility-contract.test.mjs tests/slots-performance-guardrail-contract.test.mjs`
- `npx playwright test e2e/compatibility.spec.ts --project=chromium`
- `npm run build`
