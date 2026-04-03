# Phase 26: Slots Shell and Presentation Upgrade - Research

**Researched:** 2026-04-02
**Mode:** Autonomous (`/gsd:next` -> `/gsd:plan-phase 26`)

## Objective

Define a presentation-first upgrade path for Slots that improves shell hierarchy, reel framing, and atmosphere without changing gameplay authority or breaking EN/PT parity.

## Existing Surface Map

- Canonical Slots routes already exist and are parity-safe at `/en/slots/` and `/pt/slots/`.
- Gameplay authority remains in `src/scripts/slots/controller.ts`, which owns balance, bet, spin, outcome, and seed updates through stable DOM IDs and `data-slots-*` datasets.
- Visual runtime observability is already published from `src/scripts/slots/animation/runtime.ts` through deterministic `data-slots-anim-*` snapshots.
- Current shell structure is still compact and text-heavy, with limited cabinet/playfield framing and weak separation between controls, status, and results.

## Recommended Strategy

1. Preserve the controller/runtime contract and redesign only the page composition and styling layer for Phase 26.
2. Recompose the shell into explicit zones:
   - header/status strip
   - framed playfield/reel surface
   - economy and controls HUD
   - result/readout area
   - visible compliance/disclaimer block
3. Favor shared CSS primitives in `src/styles/global.css` over one-off inline utility noise when introducing cabinet/frame treatments.
4. Keep every existing gameplay ID and machine-readable dataset hook stable so later phases can layer motion/effects without authority drift.
5. Add contract coverage for shell structure and parity, then extend browser compatibility checks to prove the upgraded shell still supports canonical EN/PT flows.

## Likely Implementation Targets

- `src/pages/en/slots/index.astro`
- `src/pages/pt/slots/index.astro`
- `src/styles/global.css`
- `src/i18n/en.json`
- `src/i18n/pt.json`
- `tests/slots-shell-foundation.test.mjs`
- `tests/slots-i18n-parity-contract.test.mjs`
- `e2e/compatibility.spec.ts`

## Risks and Guardrails

- **Risk:** Shell upgrades hide or fragment core gameplay information.
  - **Guardrail:** Treat balance, bet, state, and outcome as primary HUD surfaces with explicit layout anchors.
- **Risk:** Decorative layout work breaks mobile readability or EN/PT parity.
  - **Guardrail:** Keep mirrored page structure and verify both locales in static contracts plus compatibility E2E.
- **Risk:** Presentation work accidentally mutates gameplay authority by moving logic into page code.
  - **Guardrail:** Constrain logic changes to view composition/styling and preserve controller-owned IDs and datasets.

## Planning Input Quality Check

- Scope is bounded to VIS-20, VIS-21, and VIS-22.
- Existing runtime hooks provide enough deterministic surface area for safe shell polish without new engine abstractions.
- Validation can stay objective by checking structure, parity, canonical routing, and compatibility rather than subjective visual taste.
