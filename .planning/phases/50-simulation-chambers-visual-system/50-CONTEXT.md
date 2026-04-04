# Phase 50: Simulation Chambers Visual System - Context

**Gathered:** 2026-04-04
**Status:** Ready for planning

<domain>
## Phase Boundary

Reframe lobby game cards into Simulation Chambers with a clinical desaturated baseline and dampener-gated vibrance.

</domain>

<decisions>
## Implementation Decisions

### Chamber visual baseline
- **D-01:** Use desaturated chamber card styling as the default visual mode.
- **D-02:** Keep card layout and interactions unchanged while restyling surface, border, and telemetry shell.

### Dampener gating
- **D-03:** Vibrant chamber accents activate only when Dopamine Dampener is not active.
- **D-04:** Dampener state source of truth is `sessionStorage` key `ccz:dampened`.

### Parity and motion
- **D-05:** EN/PT chamber markup remains structurally mirrored.
- **D-06:** Reduced-motion users should not receive high-frequency visual transitions.

### Claude's Discretion
- Exact gradient values and variable mix percentages for baseline and vibrant states.

</decisions>

<canonical_refs>
## Canonical References

- `.planning/ROADMAP.md`
- `.planning/REQUIREMENTS.md`
- `.planning/phases/49-analyzer-panel-and-mission-log-architecture/49-CONTEXT.md`
- `src/pages/en/casinocraftz/index.astro`
- `src/pages/pt/casinocraftz/index.astro`
- `src/scripts/casinocraftz/lobby.ts`
- `src/scripts/casinocraftz/tutorial/cards.ts`
- `src/styles/global.css`

</canonical_refs>
