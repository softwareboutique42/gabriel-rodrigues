# Phase 42: Symbol Atlas Production Upgrade - Context

**Gathered:** 2026-04-04
**Status:** Ready for planning

## Phase Boundary

Deliver production-grade reel symbol visuals by replacing text-first fallback rendering with atlas-backed symbol assets.

## In Scope

- Integrate symbol atlas/image rendering for `A` through `E` in standalone Slots routes.
- Preserve deterministic symbol-state behavior and existing machine-readable dataset hooks.
- Keep EN/PT parity and reduced-motion readability in the new visual layer.
- Strengthen tests/contracts to lock presentation-only boundaries.

## Out of Scope

- Any changes to RNG, payout, paylines, or economy authority modules.
- New monetization surfaces or progression systems.
- Non-slots route redesign.

## Canonical References

- `src/scripts/slots/controller.ts`
- `src/pages/en/slots/index.astro`
- `src/pages/pt/slots/index.astro`
- `src/styles/global.css`
- `docs/slots-image-customization.md`
- `tests/compatibility-contract.test.mjs`
- `tests/slots-i18n-parity-contract.test.mjs`
- `e2e/compatibility.spec.ts`

## Exit Condition

Atlas-backed symbol rendering is shipped with deterministic presentation-only boundaries and passing parity/confidence checks.
