# Phase 26: Slots Shell and Presentation Upgrade - Context

**Gathered:** 2026-04-02
**Status:** Ready for planning
**Source:** /gsd:next autonomous routing (discuss-equivalent)

## Assumptions

- Phase 26 is presentation-only and must not alter gameplay authority, payout resolution, or economy rules.
- Existing deterministic runtime hooks and EN/PT parity remain first-class constraints during shell polish.
- The current Slots routes already expose the minimum viable gameplay loop, so this phase should strengthen hierarchy and readability rather than add new game systems.

## Current Baseline

- Slots pages at `/en/slots/` and `/pt/slots/` still use the compact Phase 13 shell with a single `glow-panel`, basic balance/bet controls, and a text-first result surface.
- `src/scripts/slots/controller.ts` owns gameplay authority and already emits stable state, balance, bet, outcome, and seed updates; Phase 26 should consume these surfaces without changing their logic.
- `src/scripts/slots/animation/runtime.ts` already publishes deterministic `data-slots-anim-*` snapshots for theme, atlas, symbol states, motion policy, and reel timeline state.
- Global styling already provides the project's HUD primitives (`clip-corners`, `hud-outline-*`, scanline overlay, neon/cyan/gold tokens), but the current Slots shell does not fully use them to create a cabinet-like frame or stronger gameplay hierarchy.

## Candidate Scope

- Recompose the Slots shell into clearer visual zones for header/status, reel presentation, controls, economy HUD, and result/readout surfaces.
- Add a more intentional reel frame or cabinet treatment that makes the playfield feel anchored without introducing gameplay logic into the layout layer.
- Improve typography, spacing, and emphasis for balance, bet, state, and outcome so core signals are scannable on desktop and mobile.
- Preserve EN/PT parity and existing canonical routing while keeping disclaimers and non-gambling framing visible.

## Risks

- Shell polish can accidentally obscure important gameplay state if visual framing overwhelms readability.
- Larger presentation changes can cause mobile overflow or break contract assumptions if IDs and stable runtime hooks drift.
- Visual shell work can leak into gameplay logic if controller-owned state and presentation-owned state are not kept separate.

## Constraints

- Keep existing element IDs, route structure, and deterministic dataset hooks stable unless a stronger contract replacement is introduced in the same phase.
- Use `astro:page-load` lifecycle discipline and preserve current SPA-safe initialization boundaries.
- Respect reduced-motion and performance guardrails already established in the runtime.
- Stay inside the current design system direction: dark-first HUD shell, purposeful neon/cyan/gold accents, non-gambling tone.

## Verification Intent

- Add or extend fast contracts that lock the upgraded shell structure, critical IDs/hooks, and EN/PT parity expectations.
- Validate responsive behavior and compatibility on canonical EN/PT Slots routes before phase completion.
- Keep assertions focused on presentation hierarchy and stability, not subjective taste.
