# Phase 49: Analyzer Panel and Mission Log Architecture - Context

**Gathered:** 2026-04-04
**Status:** Ready for planning

<domain>
## Phase Boundary

Restructure the Casinocraftz lobby layout so Utility Cards become the primary persistent control surface (Analyzer Panel) and Curriculum Shell + Tutorial dialogue move into a retractable Mission Log. Remove the 780px iframe embed. No changes to gameplay authority, RNG, payout, wallet logic, route architecture, or curriculum/lesson content.

</domain>

<decisions>
## Implementation Decisions

### Analyzer Panel layout (DTL-01)

- **D-01:** Utility Cards render in a **left sidebar** on desktop — a two-column layout with the sidebar on the left and main content (chamber grid + Mission Log) on the right.
- **D-02:** The sidebar uses **`position: sticky`** so it stays visible as the user scrolls the main content column.
- **D-03:** On mobile (below `sm` breakpoint), the sidebar becomes a **collapsible drawer** — hidden by default with a toggle button to open/close it.

### Mission Log mechanism (DTL-02)

- **D-04:** Curriculum Shell + Tutorial dialogue move into a **Mission Log section** that expands/collapses accordion-style **in-place in the main content column**, pushing content below it down when open.
- **D-05:** The Mission Log's open/collapsed state is **persisted via `sessionStorage`** — same pattern as the wallet. Returns to last state on revisit within the session.
- **D-06:** The Mission Log is **collapsed by default on first visit** (no prior `sessionStorage` value). Keeps the lobby clean on first load.

### Iframe removal

- **D-07:** The **780px Slots iframe embed is removed** from the lobby. The embedded `<iframe data-casinocraftz-slots-embed>` and its surrounding container are deleted. Users reach Slots via the chamber card CTA ("Enter Simulation →").

### Responsive contract

- **D-08:** Use existing Tailwind breakpoint semantics (`sm/md/lg`) as the responsive contract. No custom breakpoint thresholds.

### Claude's Discretion

- Exact column width ratio for the two-column desktop layout (e.g., `grid-cols-[280px_1fr]` or similar).
- Exact label/copy for the Mission Log toggle button and Analyzer Panel header text (within the "Diagnostic Terminal" vocabulary established in v2.5 brief).
- Whether the Wallet HUD stays in the lobby header or relocates — defer to what makes layout sense after sidebar restructure.
- Animation/transition for Mission Log accordion expand (CSS `max-height` transition, `details`/`summary` element, or JS toggle with `hidden`).
- Mobile drawer visual treatment (slide-in or simple show/hide).

</decisions>

<specifics>
## Specific Ideas

- The "Diagnostic Terminal" framing from the v2.5 milestone brief should inform label vocabulary: "Analyzer Panel", "Mission Log", "Simulation Chambers" — this vocabulary aligns with the broader rebranding across phases 49–51.
- Utility Cards already have `data-casinocraftz-zone="cards"` and `data-casinocraftz-card="*"` data attributes — the sidebar restructure should preserve these hooks so `cards.ts` logic continues to function.
- Tutorial dialogue and curriculum progression are driven by `mountTutorial()` and `mountLobby()` in `src/scripts/casinocraftz/` — the restructure is a DOM/layout change; script initialization must still work after markup moves.

</specifics>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Milestone and requirement contract

- `.planning/ROADMAP.md` — v2.5 phase goals and Phase 49 success criteria (DTL-01, DTL-02).
- `.planning/REQUIREMENTS.md` — DTL-01 and DTL-02 scope definitions and out-of-scope boundaries.
- `.planning/STATE.md` — current milestone status and continuity constraints.

### Project constraints and architecture

- `CLAUDE.md` — Astro/i18n/view-transition constraints and EN/PT parity expectations. Client scripts must use `astro:page-load`.

### Current implementation anchors

- `src/pages/en/casinocraftz/index.astro` — full current lobby markup (all zones, data attributes, script wiring).
- `src/pages/pt/casinocraftz/index.astro` — PT mirror — must receive identical restructure.
- `src/scripts/casinocraftz/lobby.ts` — lobby mount logic (wallet, deposit modal, balance rendering).
- `src/scripts/casinocraftz/tutorial/main.ts` — tutorial mount entry point; receives `lang` param.
- `src/scripts/casinocraftz/tutorial/cards.ts` — card activation logic keyed on `data-casinocraftz-card` attributes.
- `src/styles/global.css` — shared global styles; any new sidebar/mission-log layout classes land here.
- `src/i18n/en.json` and `src/i18n/pt.json` — any new toggle labels or panel headers need both locale strings.

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets

- `mountLobby()` in `lobby.ts`: handles wallet balance, deposit modal open/close, and amount selection. Must still mount after DOM restructure — no changes to its logic expected, only the markup it queries.
- `mountTutorial({ lang })` in `tutorial/main.ts`: drives curriculum, dialogue, and card state. Keyed entirely on `data-casinocraftz-*` data attributes — safe to move zones in markup as long as attributes are preserved.
- `wallet.ts` (`loadWallet`, `saveWallet`): established `localStorage`-based persistence pattern — `sessionStorage` for Mission Log state follows the same approach.
- Existing `hidden` attribute usage on deposit modal: confirms the codebase uses `hidden`/`removeAttribute('hidden')` for toggle visibility — consistent approach for Mission Log accordion.

### Established Patterns

- EN/PT parity via duplicated route files: **both** `src/pages/en/casinocraftz/index.astro` and `src/pages/pt/casinocraftz/index.astro` must receive the identical restructure.
- `data-casinocraftz-zone="*"` attributes partition the page into semantic zones (`foundation`, `games`, `curriculum`, `tutorial`, `cards`) — new zones for Analyzer Panel and Mission Log should follow this convention.
- Tailwind utility classes for layout (grid, flex, gap) — new two-column layout uses Tailwind grid, no custom CSS grid required unless sidebar `sticky` needs it.

### Integration Points

- The `<article class="glow-panel">` is the outer shell root with all `data-casinocraftz-*` attributes. The new two-column grid wraps the **inside** of this article — outer shell stays intact.
- `data-casinocraftz-card-activate="*"` buttons in Utility Cards are queried by `cards.ts` — these must remain in the DOM regardless of where the sidebar renders.

</code_context>

<deferred>
## Deferred Ideas

- Simulation Chambers visual redesign (desaturated baseline, dampener-gated vibrance) — Phase 50 (DTL-03, DTL-04).
- Live telemetry previews on chamber cards — Phase 51 (DTL-05).
- Mission Log copy labels and "Diagnostic Terminal" vocabulary finalization — Claude's discretion in this phase, refined in Phase 50 if needed.

</deferred>

---

_Phase: 49-analyzer-panel-and-mission-log-architecture_
_Context gathered: 2026-04-04_
