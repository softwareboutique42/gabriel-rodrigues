# Phase 51: Live Telemetry Chamber Integration - Context

**Gathered:** 2026-04-04
**Status:** Ready for planning

<domain>
## Phase Boundary

Replace static chamber blurbs with live telemetry previews and preserve EN/PT parity with accessibility-safe behavior.

</domain>

<decisions>
## Implementation Decisions

### Telemetry surface
- **D-01:** Each chamber card exposes a telemetry block with house-edge, signal, and impulse fields.
- **D-02:** Telemetry updates are rendered on interval in lobby runtime code, independent of payout authority.

### Safety and parity
- **D-03:** Reduced-motion users receive non-animated signal fallback.
- **D-04:** EN/PT parity is enforced through mirrored markup and i18n keys.

### Claude's Discretion
- Exact telemetry cadence values and deterministic numeric ranges.

</decisions>

<canonical_refs>
## Canonical References

- `.planning/ROADMAP.md`
- `.planning/REQUIREMENTS.md`
- `.planning/phases/50-simulation-chambers-visual-system/50-CONTEXT.md`
- `src/pages/en/casinocraftz/index.astro`
- `src/pages/pt/casinocraftz/index.astro`
- `src/scripts/casinocraftz/lobby.ts`
- `src/i18n/en.json`
- `src/i18n/pt.json`

</canonical_refs>
