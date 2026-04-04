# Phase 47: Elementum Layout and Identity Shell - Context

**Gathered:** 2026-04-04
**Status:** Ready for planning

<domain>
## Phase Boundary

Deliver phase 47 presentation refinements on EN/PT Slots routes only: enforce a symmetric bottom HUD contract, center the bet-control cluster, and establish top-level identity/navigation anchors (`ELEMENTUM` and a back link). Do not change gameplay authority, RNG, payout, wallet, route architecture, or curriculum behavior.

</domain>

<decisions>
## Implementation Decisions

### HUD symmetry contract
- **D-01:** Use a fluid HUD height contract via `clamp(...)` rather than fixed per-breakpoint pixel heights.
- **D-02:** Symmetry must be enforced at the row level so Balance, Bet, and Spin surfaces align as one consistent baseline across responsive layouts.

### Centered bet cluster specification
- **D-03:** Bet controls use a centered stepper pattern: `- | value pill | +`.
- **D-04:** The bet cluster remains the visual midpoint between Balance and Spin in the primary HUD composition.

### Identity and navigation anchors
- **D-05:** Top-center identity label is `ELEMENTUM` on both EN and PT routes.
- **D-06:** Top-left back-link copy is identical in both locales: `← CasinoCraftz`.

### Responsive contract
- **D-07:** Use existing Tailwind breakpoint semantics (`sm/md/lg`) as the responsive contract source of truth; avoid introducing custom breakpoint thresholds in this phase.

### Delivery style
- **D-08:** Use balanced defaults: tighten and standardize current visual direction without over-constraining stylistic implementation details.

### Claude's Discretion
- Exact `clamp(...)` values for HUD height and internal spacing.
- Exact typography sizing/weight tuning for title and back-link as long as parity and readability are preserved.
- Final CSS composition details for how centered alignment is enforced under each breakpoint.

</decisions>

<specifics>
## Specific Ideas

- Maintain the current cyberpunk/neon direction while reducing layout ambiguity.
- Keep phase 47 scope on shell/layout/identity; premium material symbols and strongest tactile hover intensification remain phase 48 work.

</specifics>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Milestone and requirement contract
- `.planning/ROADMAP.md` — v2.4 phase goals and phase-47 success criteria.
- `.planning/REQUIREMENTS.md` — UIR-80 and UIR-81 scope plus out-of-scope boundaries.
- `.planning/STATE.md` — current milestone status, continuity constraints, and active blockers.

### Project constraints and architecture
- `CLAUDE.md` — Astro/i18n/view-transition constraints and EN/PT parity expectations.

### Current implementation anchors
- `src/pages/en/slots/index.astro` — current EN shell markup and HUD structure.
- `src/pages/pt/slots/index.astro` — current PT shell markup and HUD structure.
- `src/styles/global.css` — active HUD/menu/stage styling and responsive rules.
- `src/scripts/slots/main.ts` — shell menu synchronization and host-mode boot lifecycle.

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `initSlotsShell` in `src/scripts/slots/main.ts`: already mounts shell-level affordances and is suitable for top identity/nav behavior integration if any JS hooks are needed.
- Existing HUD block in EN/PT pages: provides a stable structure (`balance`, `bet`, `spin`) that can be normalized rather than replaced.
- Existing menu/telemetry dataset sync: confirms a pattern of non-authoritative UI state mapped via root datasets.

### Established Patterns
- EN/PT parity is implemented by duplicated route files with translated labels; phase-47 layout updates must mirror both files.
- Styling centralization in `src/styles/global.css` controls most slots visuals, with responsive behavior already organized via media blocks.
- Phase constraints require presentation-only changes; gameplay authority remains in slots controller/economy logic and must stay untouched.

### Integration Points
- Top identity/back-link anchors should integrate in both `src/pages/en/slots/index.astro` and `src/pages/pt/slots/index.astro` shell header zone.
- Symmetric HUD enforcement will primarily land in `.slots-stage__hud--minimal` and related meter/spin selectors in `src/styles/global.css`.

</code_context>

<deferred>
## Deferred Ideas

- Premium material reel symbol system (Gold, Rhodium, Californium) and scanline depth treatment are deferred to phase 48.
- Strongest spin-trigger tactile hover intensification is deferred to phase 48.

</deferred>

---

*Phase: 47-elementum-layout-and-identity-shell*
*Context gathered: 2026-04-04*
