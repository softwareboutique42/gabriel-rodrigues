# Phase 41: Slots Entry and Casino Polish - Context

**Gathered:** 2026-04-04
**Status:** Completed

## Phase Boundary

Apply a UX insertion that removes embedded Slots from Casinocraftz and improves standalone Slots presentation quality.

## Scope

- Replace Casinocraftz iframe embed with standalone Slots navigation card in EN/PT.
- Collapse Slots JSON/debug output by default.
- Improve Slots shell visual quality toward a more familiar casino-like reel presentation.
- Document how maintainers can replace symbol visuals professionally without changing RNG/payout logic.

## Guardrails

- Preserve deterministic gameplay authority boundaries.
- Keep EN/PT parity for new navigation and copy surfaces.
- Keep anti-monetization and zero-risk framing intact.

## Canonical References

- `src/pages/en/casinocraftz/index.astro`
- `src/pages/pt/casinocraftz/index.astro`
- `src/pages/en/slots/index.astro`
- `src/pages/pt/slots/index.astro`
- `src/scripts/slots/controller.ts`
- `src/styles/global.css`
- `tests/compatibility-contract.test.mjs`
- `tests/slots-i18n-parity-contract.test.mjs`
- `e2e/compatibility.spec.ts`
- `docs/slots-image-customization.md`
