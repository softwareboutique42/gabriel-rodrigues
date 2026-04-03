# Phase 27: Effects and Atmosphere Pass - Research

**Researched:** 2026-04-02
**Mode:** Autonomous (`/gsd:next` -> `/gsd:plan-phase 27`)

## Objective

Define a deterministic effects-and-atmosphere layer for Slots that makes spin and outcome states feel richer without introducing gameplay branching or violating reduced-motion/performance guardrails.

## Existing Surface Map

- `src/scripts/slots/animation/runtime.ts` is already the single write path for runtime observability and is the safest place to project richer effect state.
- The visual-event stream is already stable and sufficient for effect choreography:
  - `spin-accepted`
  - `spin-resolved`
  - `spin-blocked`
- Supporting models already provide deterministic state inputs for richer presentation:
  - `reel-timeline.ts` for `spin-up`, `sustain`, `stop`, `blocked`
  - `outcome-feedback.ts` for `win` / `loss`
  - `idle-motion.ts` for idle versus active transitions
  - `theme-selection.ts` and `theme-registry.ts` for deterministic theme fallback
- Current shell markup from Phase 26 exposes stable page zones and a framed playfield that can receive state-responsive classes or datasets without changing gameplay anchors.

## Recommended Strategy

1. Extend the runtime projection layer with additional machine-readable effect/atmosphere snapshots rather than adding separate ad hoc DOM logic in the page.
2. Use CSS-driven presentation for most effects, keyed off deterministic root datasets or stable element datasets written by the runtime.
3. Reserve any JavaScript sequencing for state projection only; avoid free-running effect timers that create ambiguous ownership.
4. Make `slots-neon-v1` feel materially different through atmosphere treatment, not just token substitution.
5. Keep every enhancement intensity-aware so `full`, `reduced`, and `minimal` modes degrade predictably.

## Likely Implementation Targets

- `src/scripts/slots/animation/runtime.ts`
- `src/scripts/slots/animation/reel-timeline.ts`
- `src/scripts/slots/animation/outcome-feedback.ts`
- `src/pages/en/slots/index.astro`
- `src/pages/pt/slots/index.astro`
- `src/styles/global.css`
- `tests/slots-motion-accessibility-contract.test.mjs`
- `tests/slots-theme-variants-contract.test.mjs`
- `tests/slots-animation-event-sequencing-contract.test.mjs`
- `e2e/compatibility.spec.ts`

## Risks and Guardrails

- **Risk:** Effects become visually loud and obscure outcome readability.
  - **Guardrail:** Keep status/outcome text first-class and use atmosphere as reinforcement, not replacement.
- **Risk:** Performance degradation from richer effects on lower-end devices.
  - **Guardrail:** Route every effect through existing motion intensity and performance override policy.
- **Risk:** Theme/atmosphere drift becomes hard to validate.
  - **Guardrail:** Expose deterministic state hooks for active effect state and theme atmosphere mode.

## Planning Input Quality Check

- Scope is bounded to FX-20, FX-21, and FX-22.
- Existing runtime models provide enough state to drive richer effects without modifying controller authority.
- Validation can stay objective through deterministic dataset and compatibility assertions.
