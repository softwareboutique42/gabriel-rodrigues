# Phase 20: Animated Symbols and Theme Variants - Research

**Researched:** 2026-04-02
**Domain:** Deterministic symbol-state animation and presentation-only theme variants over existing Slots runtime
**Confidence:** HIGH

## Summary

Phase 20 should extend the current animation runtime with symbol state playback and theme packs while preserving the existing deterministic authority boundary. The safest path is to keep all new behavior inside presentation modules driven by existing visual events and runtime snapshots.

Recommended sequence:

1. Add deterministic symbol animation state contracts for `idle`, `spin`, and `win-react`.
2. Add theme registry + selection wiring with presentation-only fallback to default theme.
3. Extend runtime observability and tests to assert theme/symbol state behavior without timing-fragile checks.

## Requirement Mapping

| ID        | Description                                                                         | Research Support                                              |
| --------- | ----------------------------------------------------------------------------------- | ------------------------------------------------------------- |
| SPRITE-11 | Animated symbol states for core symbols without gameplay logic changes              | Symbol state adapter + event-driven playback boundaries       |
| SPRITE-12 | Additional visual theme variant via shared tokens/assets without gameplay branching | Theme registry/selection and deterministic fallback contracts |

## Architecture Notes

- Keep `SlotSymbol` as domain-owned type; map to per-theme animation groups in presentation only.
- Trigger symbol-state transitions from visual events (`spin-accepted`, `spin-resolved`, `spin-blocked`) and current runtime phase.
- Theme selection must not alter payout/economy/state transitions and must remain stable across EN/PT routes.
- Maintain SPA lifecycle safety with idempotent mount/dispose and no duplicate subscriptions.

## Proposed Modules

- `src/scripts/slots/animation/symbol-states.ts`
- `src/scripts/slots/animation/theme-registry.ts`
- `src/scripts/slots/animation/theme-selection.ts`
- `src/scripts/slots/animation/runtime.ts` (integration)

## Test Strategy

- Add `tests/slots-symbol-states-contract.test.mjs` for deterministic symbol state projection and authority boundaries.
- Add `tests/slots-theme-variants-contract.test.mjs` for theme registration, selection, and fallback determinism.
- Extend `e2e/compatibility.spec.ts` for stable EN/PT assertions on theme id and symbol-state observability hooks.
- Keep existing determinism, i18n parity, and sequencing suites green.

## Risks and Mitigations

- **Theme asset drift:** enforce deterministic theme schema checks and fallback behavior.
- **Authority coupling:** forbid gameplay imports in theme/symbol-state modules.
- **SPA leaks:** retain AbortController cleanup and idempotent runtime disposal.

## Validation Baseline

- `npm run lint`
- `node --test tests/slots-core-determinism-contract.test.mjs tests/slots-interaction-guards-contract.test.mjs tests/slots-i18n-parity-contract.test.mjs tests/slots-animation-event-sequencing-contract.test.mjs tests/slots-sprite-atlas-contract.test.mjs tests/slots-symbol-states-contract.test.mjs tests/slots-theme-variants-contract.test.mjs`
- `npx playwright test e2e/compatibility.spec.ts --project=chromium`
- `npm run build`
