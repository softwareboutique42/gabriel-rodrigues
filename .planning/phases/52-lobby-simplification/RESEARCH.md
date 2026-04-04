# Phase 52: Lobby Simplification - Research

**Researched:** 2026-04-04
**Domain:** Casinocraftz lobby layout, chamber cards, analyzer panel, mission log, telemetry, i18n
**Confidence:** HIGH

---

## Summary

The Casinocraftz lobby currently renders a two-column grid (`ccz-lobby-grid`) defined in `global.css` as `grid-template-columns: 260px 1fr`. The left column is the Analyzer Panel sidebar (`<aside class="ccz-analyzer-panel">`), the right column holds the main content (header, wallet HUD, chamber cards, mission log, footer). Both EN and PT pages are structurally identical, differing only in the `t()` locale calls and hard-coded hrefs (`/en/` vs `/pt/`).

The Analyzer Panel is controlled by `mountAnalyzerDrawer()` in `lobby.ts`, which persists its open/close state in `sessionStorage` under key `ccz-analyzer-open`. The Mission Log accordion is controlled by `mountMissionLog()`, persisting under `ccz-mission-log-open`. Both functions are called from `mountLobby()`. Removing both zones from the HTML means both functions will silently no-op (they guard with `if (!(toggle instanceof HTMLElement)) return`), so no JS deletion is strictly required — but dead code should be cleaned.

The live telemetry block in each chamber card uses three data attributes (`data-ccz-telemetry-edge`, `data-ccz-telemetry-signal`, `data-ccz-telemetry-pulse`) driven by a `setInterval(updateTelemetry, 2500)` loop in `mountChamberVisualSystem()`. The interval has no `setInterval` return value stored, so it cannot be cancelled without a refactor. For LBY-02 the telemetry `<div class="ccz-chamber-telemetry">` is replaced with three rows, each pairing a metric label with a `ⓘ` button instead of a live-value `<span>`. The `mountChamberVisualSystem()` function can be removed from `mountLobby()` since it will no longer find its target elements.

No existing tooltip/popover component exists in this codebase for non-blog content. The deposit modal pattern (toggle `hidden` attribute, render within the same `<article>`) is the only precedent for interactive overlays. For LBY-02 info buttons, the recommended pattern is an inline panel approach (toggle a sibling `<div hidden>` on button click) or native HTML `popover` attribute — both are zero-dependency. The codebase blog articles discuss native popover as the modern standard; the project has no Popper.js or floating-ui dependency.

**Primary recommendation:** Remove the `<aside class="ccz-analyzer-panel">` block, collapse the outer `ccz-lobby-grid` to a single column, remove the mission log `<section data-casinocraftz-zone="mission-log">`, replace each `ccz-chamber-telemetry` div with metric rows + `ⓘ` buttons, and add click-toggled inline explanation panels per metric row. Add 6 new i18n keys (3 metrics × 2 per lang) for the explanation text. Clean up JS in `lobby.ts` by removing `mountMissionLog`, `mountAnalyzerDrawer`, and `mountChamberVisualSystem` calls.

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| LBY-01 | Lobby renders as single-column with no Analyzer Panel sidebar, no Mission Log accordion | Remove `<aside class="ccz-analyzer-panel">` and `<section data-casinocraftz-zone="mission-log">` from both EN/PT pages; change `ccz-lobby-grid` CSS to single-column or remove it entirely; remove `mountMissionLog` and `mountAnalyzerDrawer` calls from `lobby.ts` |
| LBY-02 | Chamber cards show an info (`ⓘ`) button per metric (house edge, signal, impulse) that opens a contextual explanation | Replace `.ccz-chamber-telemetry` block in all 3 chamber cards × 2 pages; add click handler in `lobby.ts` that toggles a sibling `[hidden]` explanation `<div>`; add 6 new i18n keys (3 metrics, EN + PT); remove `mountChamberVisualSystem` |
</phase_requirements>

---

## Project Constraints (from CLAUDE.md)

- **Routing:** All pages live under `src/pages/en/` and `src/pages/pt/` — both language versions must be updated together.
- **i18n:** Translation strings in `src/i18n/en.json` and `src/i18n/pt.json`. Use `t()` helper; do not inline English copy in templates.
- **View Transitions / SPA mode:** All client scripts must use `document.addEventListener('astro:page-load', ...)` — already the pattern in lobby pages. No change needed.
- **Commit conventions:** Conventional Commits enforced via commitlint + husky. Do not skip hooks.
- **Testing:** Playwright E2E tests in `e2e/`. Existing test `e2e/casinocraftz.spec.ts` does not test the analyzer panel, mission log, or telemetry blocks — it tests tutorial progression. No existing tests will break from this phase, but new tests for LBY-02 info buttons should be added.
- **Design system:** Use existing utility classes (`hud-outline-subtle`, `font-mono`, `text-text-muted`, `text-cyan`, etc.). Dark-first, monospace, neon/cyan accents only.

---

## Standard Stack

No new dependencies are required for this phase. All work is HTML structure changes, CSS class adjustments, i18n key additions, and TypeScript edits.

### Core (unchanged)
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Astro 6 | — | Page templates | Project framework |
| Tailwind CSS v4 | — | Utility classes | Project style system |
| TypeScript | — | `lobby.ts` logic | Project standard |

### Installation
No new packages to install.

---

## Architecture Patterns

### Current Two-Column Layout Structure

```
<article data-casinocraftz-shell-root>
  <div class="ccz-lobby-grid">            ← grid: 260px 1fr
    <aside class="ccz-analyzer-panel">    ← LEFT: remove entirely (LBY-01)
      ...3 utility cards...
    </aside>
    <div class="min-w-0">                 ← RIGHT: becomes the only column
      <header>...</header>                ← keep: title + badge + disclaimer + wallet HUD
      <section data-zone="games">        ← keep: chamber cards
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
          ...3 chamber cards each with ccz-chamber-telemetry...
        </div>
      </section>
      <section data-zone="mission-log">  ← remove entirely (LBY-01)
        ...curriculum + tutorial...
      </section>
      <div> footer </div>
    </div>
  </div>
  <div data-ccz-deposit-modal>...</div>  ← keep unchanged
</article>
```

### Target Single-Column Structure

```
<article data-casinocraftz-shell-root>
  <div>                                  ← remove ccz-lobby-grid class (or keep but change CSS)
    <header>...</header>                 ← keep as-is
    <section data-zone="games">         ← keep: chamber cards with info buttons
      ...
    </section>
    <div> footer </div>                 ← keep as-is
  </div>
  <div data-ccz-deposit-modal>...</div> ← keep unchanged
</article>
```

### CSS Changes Required

**In `src/styles/global.css`:**

1. The `.ccz-lobby-grid` rule (line 162) currently defines `grid-template-columns: 260px 1fr`. This must change to either:
   - Remove the class from the HTML wrapper div and delete the CSS rules, OR
   - Change `ccz-lobby-grid` to `display: block` (simplest, no HTML change needed beyond removing aside)

2. The `.ccz-analyzer-panel` rule (line 175) and its `@media` variants (lines 180–197) become dead CSS after the aside is removed. They should be deleted for cleanliness.

3. No changes needed to `.ccz-chamber-card`, `.ccz-chamber-telemetry` CSS — the telemetry container class itself can be repurposed for the info-button rows, or simply removed and replaced with plain Tailwind utility classes.

### Telemetry Block: Current vs. Target

**Current (per chamber card):**
```html
<div class="ccz-chamber-telemetry hud-outline-soft p-2 text-[10px] font-mono uppercase tracking-wider">
  <p class="text-cyan mb-1">{t('lobby.telemetry.label')}</p>
  <div class="flex justify-between text-text-muted">
    <span>{t('lobby.telemetry.houseEdge')}</span>
    <span data-ccz-telemetry-edge>--</span>           ← live value updated by setInterval
  </div>
  <div class="flex justify-between text-text-muted mt-1">
    <span>{t('lobby.telemetry.signal')}</span>
    <span data-ccz-telemetry-signal aria-live="polite">----</span>
  </div>
  <div class="flex justify-between text-text-muted mt-1">
    <span>{t('lobby.telemetry.impulse')}</span>
    <span data-ccz-telemetry-pulse>--</span>
  </div>
</div>
```

**Target (per chamber card, LBY-02):**
```html
<!-- Replace the entire ccz-chamber-telemetry block with: -->
<div class="hud-outline-soft p-2 text-[10px] font-mono uppercase tracking-wider flex flex-col gap-1">
  <div class="flex items-center justify-between text-text-muted">
    <span>{t('lobby.telemetry.houseEdge')}</span>
    <button
      data-ccz-metric-info="house-edge"
      data-ccz-metric-info-target="house-edge-{gameId}"
      class="text-cyan hover:text-neon transition-colors ml-2"
      aria-label="{t('lobby.telemetry.info.ariaLabel')}"
    >ⓘ</button>
  </div>
  <div id="ccz-info-house-edge-{gameId}" data-ccz-metric-panel hidden
    class="text-[9px] text-text-secondary mt-0.5 leading-relaxed">
    {t('lobby.telemetry.houseEdge.explain')}
  </div>

  <div class="flex items-center justify-between text-text-muted mt-1">
    <span>{t('lobby.telemetry.signal')}</span>
    <button data-ccz-metric-info="signal" ... >ⓘ</button>
  </div>
  <div id="ccz-info-signal-{gameId}" data-ccz-metric-panel hidden ...>
    {t('lobby.telemetry.signal.explain')}
  </div>

  <div class="flex items-center justify-between text-text-muted mt-1">
    <span>{t('lobby.telemetry.impulse')}</span>
    <button data-ccz-metric-info="impulse" ... >ⓘ</button>
  </div>
  <div id="ccz-info-impulse-{gameId}" data-ccz-metric-panel hidden ...>
    {t('lobby.telemetry.impulse.explain')}
  </div>
</div>
```

Note: The planner must decide whether to use `id`-linked targets or `data-`-linked siblings for the panel toggle. Using a `data-ccz-metric-info-target` pointing to a sibling `div` is simpler than using IDs (no need to make IDs unique per card). The simplest pattern: each `ⓘ` button toggles the immediately-following sibling `div[data-ccz-metric-panel]`.

### JS Pattern: Info Button Toggle

**New function in `lobby.ts`:**
```typescript
function mountMetricInfoButtons(root: HTMLElement): void {
  root.querySelectorAll<HTMLButtonElement>('[data-ccz-metric-info]').forEach((btn) => {
    btn.addEventListener('click', () => {
      // The explanation panel is the next sibling element
      const panel = btn.closest('[class]')?.nextElementSibling;
      if (!(panel instanceof HTMLElement)) return;
      if (panel.hasAttribute('hidden')) {
        panel.removeAttribute('hidden');
      } else {
        panel.setAttribute('hidden', '');
      }
    });
  });
}
```

Add `mountMetricInfoButtons(root)` call inside `mountLobby()`. Remove calls to `mountMissionLog(root)`, `mountAnalyzerDrawer(root)`, `mountChamberVisualSystem(root)`.

### Anti-Patterns to Avoid

- **Leaving `mountChamberVisualSystem` in place:** Without `data-ccz-telemetry-edge/signal/pulse` elements in the DOM, `signalEls.length === 0` causes it to return early — it will not error. But the `setInterval` is never registered either, which is correct. Still, the function should be removed from the call list to avoid confusion.
- **Leaving `mountMissionLog` / `mountAnalyzerDrawer` in place:** They guard with `if (!(toggle instanceof HTMLElement)) return`, so they silently no-op. Removing is cleaner and avoids sessionStorage keys being written on every mount.
- **Not removing sessionStorage persistence code:** `MISSION_LOG_KEY` (`ccz-mission-log-open`) and `ANALYZER_KEY` (`ccz-analyzer-open`) constants and their `sessionStorage.setItem` calls become dead code after removing the functions. Clean them up.
- **Forgetting the `<div class="min-w-0">` wrapper:** The right-column content div has `min-w-0` which is a flexbox/grid overflow guard. After collapsing to single column it can be removed or changed to a plain `<div>`, but the content inside must be preserved verbatim.
- **Missing PT page update:** Both `src/pages/en/casinocraftz/index.astro` and `src/pages/pt/casinocraftz/index.astro` are structurally identical. Every HTML change must be applied to both files. The only differences are `t('en')` vs `t('pt')` and `/en/slots/` vs `/pt/slots/` hrefs.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead |
|---------|-------------|-------------|
| Inline metric explanation disclosure | Custom floating tooltip with JS positioning | Toggle `hidden` on a sibling `<div>` — native, zero-dep |
| Animated tooltip | CSS keyframe pop-in | Keep it simple: `hidden` attribute toggle with optional `transition` via Tailwind |

---

## i18n Keys: Exact Inventory

### Keys to REMOVE (no longer rendered after LBY-01)
These keys become unreferenced after the HTML changes. They should be kept in the JSON files unless a cleanup pass is in scope — removing them is out of scope for this phase to avoid unnecessary churn.

| Key | Current EN value |
|-----|-----------------|
| `lobby.analyzerPanel.label` | "ANALYZER PANEL" |
| `lobby.analyzerPanel.toggle.open` | "ANALYZER PANEL ▼" |
| `lobby.analyzerPanel.toggle.close` | "ANALYZER PANEL ▲" |
| `lobby.missionLog.toggle.open` | "MISSION LOG ▼" |
| `lobby.missionLog.toggle.close` | "MISSION LOG ▲" |
| `lobby.telemetry.label` | "LIVE TELEMETRY" |

### Keys RETAINED (still rendered in new metric rows)
| Key | EN value | PT value |
|-----|---------|---------|
| `lobby.telemetry.houseEdge` | "HOUSE EDGE" | "HOUSE EDGE" |
| `lobby.telemetry.signal` | "SIGNAL" | "SINAL" |
| `lobby.telemetry.impulse` | "IMPULSE" | "IMPULSO" |

### Keys to ADD (new, for LBY-02 explanation panels)
| Key | Suggested EN value | Suggested PT value |
|-----|-------------------|-------------------|
| `lobby.telemetry.houseEdge.explain` | "The casino keeps a fixed % of all bets over time. A 5.6% edge means for every $100 wagered, the house expects to keep $5.60." | "O cassino retém uma % fixa de todas as apostas ao longo do tempo. Uma vantagem de 5.6% significa que para cada $100 apostados, a casa espera guardar $5.60." |
| `lobby.telemetry.signal.explain` | "Oscillating waveform showing simulated bet-frequency pressure. Visual noise — not a real indicator of upcoming wins." | "Forma de onda oscilante mostrando pressão simulada de frequência de apostas. Ruído visual — não é um indicador real de ganhos futuros." |
| `lobby.telemetry.impulse.explain` | "Simulated impulse-per-minute: how many micro-decisions the chamber induces per minute. Higher = more conditioning pressure." | "Impulso simulado por minuto: quantas micro-decisões a câmara induz por minuto. Mais alto = maior pressão de condicionamento." |
| `lobby.telemetry.info.ariaLabel` | "What does this metric mean?" | "O que significa esta métrica?" |

Note: The explanation copy above is a suggestion. The planner/user may revise wording. The keys themselves are the binding contract.

---

## Common Pitfalls

### Pitfall 1: `data-ccz-analyzer-drawer` visibility overridden by CSS

**What goes wrong:** The CSS at `global.css:193-196` sets `.ccz-analyzer-panel [data-ccz-analyzer-drawer] { display: block }` for `min-width: 640px`. If the `<aside>` HTML is removed but the CSS rule remains, there is no DOM target and no harm. But if only `hidden` is added without removing the aside, the CSS `display: block` overrides `[hidden]`'s `display: none`. This is the existing behavior on desktop — the drawer is always visible on sm+ regardless of the `hidden` attribute.

**How to avoid:** Remove the entire `<aside class="ccz-analyzer-panel">` block from the HTML. Remove the `.ccz-lobby-grid` / `.ccz-analyzer-panel` CSS rules from `global.css` in the same task.

### Pitfall 2: Panel ID collision across chamber cards

**What goes wrong:** If info panel `<div>` elements use `id` attributes (e.g., `id="ccz-info-house-edge"`), duplicate IDs exist across the three chamber cards, violating HTML validity and breaking `document.getElementById()`.

**How to avoid:** Use DOM sibling traversal (`btn.parentElement.nextElementSibling`) or `data-ccz-metric-panel` + `closest()` to find the panel, not IDs. Alternatively, use unique IDs per card by combining metric + game name (e.g., `ccz-info-house-edge-slots`).

### Pitfall 3: `mountChamberVisualSystem` setInterval never cleared

**What goes wrong:** `window.setInterval(updateTelemetry, 2500)` on line 218 of `lobby.ts` stores no reference. With Astro View Transitions, `astro:page-load` fires on every SPA navigation, calling `mountLobby()` again. Each call registers another setInterval, causing stacking intervals. In the current code this already exists as a known issue (no AbortController cleanup). After LBY-02, removing `mountChamberVisualSystem` from the call chain eliminates the interval entirely — this is a net improvement.

**How to avoid:** Remove the `mountChamberVisualSystem(root)` call from `mountLobby()`. Delete the function body or leave it commented with a note.

### Pitfall 4: Explanation panels not hidden by default

**What goes wrong:** If `hidden` is not set on new `[data-ccz-metric-panel]` divs in the initial HTML, they render open by default. Since these are static HTML in `.astro` files, JS does not set `hidden` on mount.

**How to avoid:** Add `hidden` attribute directly in the `.astro` template on every explanation div.

---

## Code Examples

### Pattern: Toggle `hidden` on sibling element (existing project pattern)
Source: `lobby.ts` `mountMissionLog()` — [VERIFIED: read file]

```typescript
toggle.addEventListener('click', () => {
  if (content.hasAttribute('hidden')) {
    content.removeAttribute('hidden');
  } else {
    content.setAttribute('hidden', '');
  }
});
```

This is the established toggle pattern in this codebase. Info buttons should use the same idiom.

### Pattern: Deposit modal CSS-only selected state
Source: `global.css:708` — [VERIFIED: read file]

```css
.ccz-deposit-amount--selected {
  color: var(--color-neon);
  box-shadow: inset 0 0 0 1px var(--color-neon);
}
```

For info button "open" state, the same `box-shadow` pattern or a simple `text-neon` class swap can indicate active state.

### Pattern: `hud-outline-soft` for inset panels
Source: `global.css:114` — [VERIFIED: read file]

```css
.hud-outline-soft {
  /* existing project HUD border utility */
}
```

Use `hud-outline-soft` for the explanation panel container to stay consistent with the telemetry block visual language.

---

## Exact Data Attribute Inventory

### Data attributes to REMOVE from both lobby pages (previously driven by JS, now dead):
- `data-ccz-analyzer-toggle` — on mobile toggle button inside `<aside>`
- `data-ccz-analyzer-drawer` — on drawer div inside `<aside>`
- `data-ccz-mission-log-toggle` — on mission log toggle button
- `data-ccz-mission-log-content` — on mission log content div
- `data-ccz-telemetry-edge` — live value target, 3× per page
- `data-ccz-telemetry-signal` — live value target, 3× per page
- `data-ccz-telemetry-pulse` — live value target, 3× per page

### Data attributes on `<article>` to REMOVE (only referenced by removed logic):
None — all `data-casinocraftz-*` attributes on the root `<article>` are used by `tutorial/main.ts`, not by lobby logic. They should remain untouched.

### Data attributes to ADD (new, for LBY-02):
- `data-ccz-metric-info` — on each `ⓘ` button; value: `"house-edge"` | `"signal"` | `"impulse"`
- `data-ccz-metric-panel` — on each explanation `<div>`

---

## sessionStorage Keys Inventory

| Key | Used By | Action |
|-----|---------|--------|
| `ccz-mission-log-open` | `mountMissionLog()` | Remove reads/writes when function is deleted |
| `ccz-analyzer-open` | `mountAnalyzerDrawer()` | Remove reads/writes when function is deleted |
| `ccz:dampened` | `mountChamberVisualSystem()` → `applyDampenerVisualState()` | Remove reads when function is deleted |

The `ccz:dampened` key is also read in `mountChamberVisualSystem` to toggle vibrance state on the root element (`root.dataset.cczVibrance`). After removing `mountChamberVisualSystem`, the `data-ccz-vibrance` attribute will never be set, meaning the CSS custom properties for `[data-ccz-vibrance='enabled']` (lines 2233–2239 of `global.css`) become dead. This is acceptable for this phase — the dampener visual system is a larger concern for a future phase if needed.

---

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Playwright (project standard) |
| Config file | `playwright.config.ts` |
| Quick run command | `npm run test -- --grep "casinocraftz"` |
| Full suite command | `npm run test` |

### Phase Requirements → Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| LBY-01 | Lobby page loads with no `.ccz-analyzer-panel` element in DOM | smoke | `npm run test -- --grep "LBY-01"` | No — Wave 0 |
| LBY-01 | Lobby page loads with no `[data-ccz-mission-log-toggle]` element in DOM | smoke | included above | No — Wave 0 |
| LBY-02 | Each chamber card has 3 `ⓘ` buttons; clicking one shows explanation panel | interaction | `npm run test -- --grep "LBY-02"` | No — Wave 0 |
| LBY-02 | Clicking `ⓘ` a second time hides the panel | interaction | included above | No — Wave 0 |

### Sampling Rate
- Per task commit: `npm run test -- --grep "casinocraftz"`
- Per wave merge: `npm run test`
- Phase gate: Full suite green before `/gsd-verify-work`

### Wave 0 Gaps
- [ ] `e2e/casinocraftz-lobby-simplification.spec.ts` — new test file covering LBY-01 and LBY-02
- [ ] Existing `e2e/casinocraftz.spec.ts` — no changes needed, tests tutorial progression which is untouched

---

## Environment Availability

Step 2.6: SKIPPED (no external dependencies — phase is HTML/CSS/TS/i18n changes only)

---

## Security Domain

Step skipped — this phase contains no authentication, session management, access control, cryptographic, or user-input validation concerns. All changes are presentational DOM structure and static copy edits.

---

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | The `<div class="min-w-0">` wrapper around main content can have its class changed to plain `<div>` without breaking layout | Architecture Patterns | Low — `min-w-0` is only relevant in grid/flex contexts; removing the grid makes it irrelevant |
| A2 | Explanation copy for the 3 new i18n keys (suggested in this document) will be accepted as-is or user will revise them | i18n Keys to ADD | Medium — copy is editorial; planner should flag these for user approval before committing |
| A3 | The `ccz:dampened` / `data-ccz-vibrance` visual system (chamber card color shift) is acceptable to lose for this phase | sessionStorage Inventory | Low — vibrance is a tutorial-gated feature; tutorial zone is being removed in LBY-01 |

---

## Open Questions

1. **Explanation panel copy**
   - What we know: Three new i18n keys are needed (`lobby.telemetry.houseEdge.explain`, `lobby.telemetry.signal.explain`, `lobby.telemetry.impulse.explain`)
   - What's unclear: Exact wording — particularly the PT translations
   - Recommendation: Use placeholder text in Wave 0; user reviews and approves copy before merge

2. **`ⓘ` button accessibility label**
   - What we know: Each button needs `aria-label` since `ⓘ` alone is insufficient for screen readers
   - What's unclear: Whether a single generic `aria-label` ("What does this metric mean?") or metric-specific labels ("What is House Edge?") are preferred
   - Recommendation: Use metric-specific aria-labels (`lobby.telemetry.houseEdge.ariaLabel`, etc.) for maximum clarity; this adds 3 more keys per language

3. **Wallet HUD position after single-column**
   - What we know: The wallet HUD is currently inside the `<header>` with `flex sm:items-start sm:justify-between`, placing it to the right of the title block on desktop
   - What's unclear: The phase spec says "header (title + badge + disclaimer)" and "wallet HUD (balance + deposit button)" are separate items in the single-column layout — this may or may not mean they should stack vertically
   - Recommendation: Preserve current header flex layout (title left, wallet right) — it already works in a single column since the header's own flex is independent of the outer grid

---

## Sources

### Primary (HIGH confidence)
- `src/pages/en/casinocraftz/index.astro` — full file read [VERIFIED: Read tool]
- `src/pages/pt/casinocraftz/index.astro` — full file read [VERIFIED: Read tool]
- `src/scripts/casinocraftz/lobby.ts` — full file read [VERIFIED: Read tool]
- `src/i18n/en.json` lines 65–92 — all `lobby.*` keys [VERIFIED: Read tool]
- `src/i18n/pt.json` lines 65–92 — all `lobby.*` keys [VERIFIED: Read tool]
- `src/styles/global.css` lines 161–197, 708–711, 2224–2264 — all ccz-lobby/chamber CSS [VERIFIED: Read tool]
- `e2e/casinocraftz.spec.ts` — full file read [VERIFIED: Read tool]
- `.planning/config.json` — `workflow.nyquist_validation: true` confirmed [VERIFIED: Read tool]

### Secondary (MEDIUM confidence)
- No external sources required — all findings derived from direct codebase inspection

---

## Metadata

**Confidence breakdown:**
- Layout/CSS structure: HIGH — read exact CSS rules and HTML templates
- JS function names / sessionStorage keys: HIGH — read exact source
- i18n keys: HIGH — read exact JSON files
- New key suggestions (copy): ASSUMED — editorial choices, not code facts
- Info button pattern: HIGH — established by existing `mountMissionLog` toggle idiom

**Research date:** 2026-04-04
**Valid until:** 2026-05-04 (stable codebase, no fast-moving deps)
