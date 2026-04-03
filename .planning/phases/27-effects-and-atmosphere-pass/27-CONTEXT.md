# Phase 27: Effects and Atmosphere Pass - Context

**Gathered:** 2026-04-02
**Status:** Ready for planning
**Source:** /gsd:next autonomous routing (discuss-equivalent)

## Assumptions

- Phase 27 remains presentation-only and must not alter gameplay authority, spin sequencing, payout resolution, or economy rules.
- New effects must layer on top of the existing deterministic visual-event stream (`spin-accepted`, `spin-resolved`, `spin-blocked`) and runtime snapshots instead of introducing parallel state.
- Reduced-motion and performance guardrails from Phase 21 remain active constraints, not optional polish.

## Current Baseline

- Phase 26 delivered a stronger cabinet shell and clearer playfield/HUD zoning, but the active feedback layer is still mostly textual plus existing runtime datasets.
- `src/scripts/slots/animation/runtime.ts` is the canonical orchestration point where timeline, idle-motion, outcome-feedback, symbol-state, theme, and performance snapshots are written to `data-slots-anim-*` hooks.
- Existing animation models already expose deterministic surfaces for the next layer of polish:
  - `reel-timeline.ts` publishes `idle`, `spin-up`, `sustain`, `stop`, and `blocked`.
  - `outcome-feedback.ts` publishes `idle`, `win`, and `loss`.
  - `idle-motion.ts` publishes `idle-pulse` and `active-transition`.
  - `theme-registry.ts` and `theme-selection.ts` already support `slots-core-v1` and `slots-neon-v1` with deterministic fallback.
- Current contracts and compatibility checks assert runtime envelope, motion policy, performance guardrails, symbol states, and theme selection without relying on screenshot baselines.

## Candidate Scope

- Add richer visual feedback for spin acceptance, sustain, stop, resolved win/loss, and blocked states using stable runtime classes/datasets or deterministic style hooks.
- Introduce atmosphere treatments that make the refreshed cabinet feel more alive, such as ambient gradients, state-responsive lighting, or theme-aware framing layers.
- Expand or refine theme presentation so at least one coherent atmosphere pass feels intentional rather than only token-deep.
- Keep EN/PT parity and canonical Slots routing intact while respecting reduced-motion behavior and bounded performance degradation.

## Risks

- Effects can become noisy, slow, or visually chaotic if they bypass the current motion/performance policy stack.
- Theme or atmosphere work can drift into gameplay branching if state derivation is not kept strictly presentation-only.
- Browser validation can become subjective if new effects are not represented by deterministic hooks or stable DOM surfaces.

## Constraints

- Preserve existing controller-owned gameplay IDs and `data-slots-*` contract.
- Prefer runtime-driven or CSS-driven effect projection from existing visual models rather than introducing free-running timers with unclear state ownership.
- Any new effect surface should degrade cleanly across `full`, `reduced`, and `minimal` intensity modes.
- Keep Astro SPA lifecycle discipline intact through the existing `initSlotsShell()` mount/dispose boundary.

## Verification Intent

- Add or extend contracts that lock effect/theme state hooks, parity-safe theme selection, and reduced-motion-safe behavior.
- Extend compatibility checks to prove canonical EN/PT Slots flows still expose deterministic visual-state envelopes after richer effects land.
- Keep validation timing-agnostic and machine-readable, avoiding screenshot-only confidence.
