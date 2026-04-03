# Phase 30: Slots Integration and Improvement Pass - Research

**Researched:** 2026-04-03
**Mode:** Autonomous execution

## Objective

Deliver Slots inside Casinocraftz without destabilizing deterministic runtime behavior or EN/PT parity.

## Strategy

1. Keep standalone `/en/slots/` and `/pt/slots/` pages as authoritative runtime surfaces.
2. Integrate module one through same-origin embedding in `/en/casinocraftz/` and `/pt/casinocraftz/`.
3. Add explicit host-mode metadata for embedded slots (`host=casinocraftz`) to keep behavior inspectable.
4. Add educational clarity cues for house edge and manipulation framing in host-mode only.
5. Expand source and browser compatibility checks for integration behavior.

## Why this approach

- Minimizes risk by avoiding runtime duplication and preserving existing Slots ownership boundaries.
- Supports progressive migration toward deeper inline integration in later phases.
- Enables deterministic assertions at both source and browser levels.

## Implementation Targets

- `src/pages/en/casinocraftz/index.astro`
- `src/pages/pt/casinocraftz/index.astro`
- `src/pages/en/slots/index.astro`
- `src/pages/pt/slots/index.astro`
- `src/i18n/en.json`
- `src/i18n/pt.json`
- `tests/compatibility-contract.test.mjs`
- `tests/slots-i18n-parity-contract.test.mjs`
- `e2e/compatibility.spec.ts`

## Validation

- Targeted contracts for route parity, i18n parity, and embedded host hooks.
- Browser compatibility checks for EN/PT Casinocraftz embedded module behavior.
- Lint and production build verification.
