---
phase: 49
slug: analyzer-panel-and-mission-log-architecture
status: approved
shadcn_initialized: false
preset: none
created: 2026-04-04
---

# Phase 49 — UI Design Contract

> Visual and interaction contract for the Analyzer Panel / Mission Log layout restructure.
> No new design system introduced — contract extends and applies the existing Casinocraftz
> dark-terminal aesthetic to the new two-column lobby architecture.

---

## Design System

| Property | Value |
|----------|-------|
| Tool | none (Tailwind CSS v4 utility-first) |
| Preset | not applicable |
| Component library | none |
| Icon library | Unicode arrows/chevrons (← ▼ ▲) — no icon library |
| Primary font | JetBrains Mono (monospace, all headings/labels) |
| Body font | Space Grotesk (sans-serif, descriptive text) |

---

## Layout Architecture

### Desktop (≥ `sm` breakpoint — 640px+)

Two-column CSS grid inside the `<article class="glow-panel">` shell:

```
grid-template-columns: 260px 1fr
gap: 24px (lg token)
align-items: start
```

- **Left column:** Analyzer Panel (Utility Cards) — `position: sticky; top: 1.5rem`
- **Right column:** Main content (lobby header, chamber grid, Mission Log)

### Mobile (< `sm` — below 640px)

Single-column stack. Analyzer Panel becomes a **collapsible drawer** above the main content:
- Toggle button: full-width, monospace label `[ANALYZER PANEL ▼]` / `[ANALYZER PANEL ▲]`
- Drawer content: the 3 Utility Cards, shown/hidden via `hidden` attribute
- Default: hidden on mobile (user must tap to open)
- State persisted in `sessionStorage` key `ccz-analyzer-open`

---

## Analyzer Panel (Left Sidebar)

### Header

```
font: JetBrains Mono, 10px, uppercase, tracking-widest
color: var(--color-gold)
label: "ANALYZER PANEL"
border-bottom: 0.5px solid color-mix(in oklab, var(--color-neon) 10%, transparent)
padding-bottom: 8px
margin-bottom: 12px
```

### Card layout

Utility Cards stack **vertically** in the sidebar (single column), not the current 3-column grid.

Each card:
```
class: hud-outline-subtle p-3
gap between cards: 8px (sm token)
```

Card label:
```
font: JetBrains Mono, 11px (0.6875rem), uppercase, tracking-wider
color: var(--color-neon)
```

Card description:
```
font: Space Grotesk, 12px, color: var(--color-text-muted)
margin-bottom: 8px
```

Card activate button (locked state):
```
font: JetBrains Mono, 11px, uppercase, tracking-wider
color: var(--color-text-muted)
cursor: not-allowed
```

Card activate button (unlocked state — existing behavior from cards.ts):
```
color: var(--color-neon)
cursor: pointer
hover: color: var(--color-neon-on), background: var(--color-neon)
```

### data-attribute convention

Sidebar zone: `data-casinocraftz-zone="analyzer-panel"`
Mobile toggle button: `data-ccz-analyzer-toggle`
Mobile drawer wrapper: `data-ccz-analyzer-drawer`

---

## Mission Log

### Toggle button (always visible in main column)

```
display: flex, align-items: center, gap: 8px
font: JetBrains Mono, 10px, uppercase, tracking-widest
color: var(--color-cyan)
chevron indicator: "▼" (collapsed) / "▲" (expanded)
border: none, background: none
padding: 4px 0
margin-bottom: 0 (collapsed) / 12px (expanded)
hover: color: var(--color-neon)
```

Label copy (EN): `MISSION LOG`
Label copy (PT): `REGISTRO DE MISSÃO`

### Collapsed state

Only the toggle button visible. Zero height below it. `hidden` on inner content.

### Expanded state

Content appears below toggle. Inner container:
```
class: hud-outline-subtle p-4 sm:p-6
margin-top: 8px
```

Contains (in order):
1. Curriculum Shell (`data-casinocraftz-zone="curriculum"`)
2. Tutorial Dialogue (`data-casinocraftz-zone="tutorial"`) — **without** the iframe block

### State persistence

`sessionStorage` key: `ccz-mission-log-open`  
Default (first visit / no key): `collapsed`

### data-attribute convention

Mission Log outer wrapper: `data-casinocraftz-zone="mission-log"`
Toggle button: `data-ccz-mission-log-toggle`
Collapsible content: `data-ccz-mission-log-content`

---

## Spacing Scale

| Token | Value | Usage |
|-------|-------|-------|
| xs | 4px | Icon gaps, chevron spacing |
| sm | 8px | Card gaps in sidebar, compact padding |
| md | 16px | Card internal padding, section gaps |
| lg | 24px | Column gap, section breaks |
| xl | 32px | Major layout section separation |

Exceptions: sidebar sticky top offset uses `1.5rem` (24px) to clear the site nav.

---

## Typography

| Role | Size | Weight | Font | Color |
|------|------|--------|------|-------|
| Panel/zone label | 10px | 400 | JetBrains Mono | `--color-gold` or `--color-cyan` (per zone) |
| Card label | 11px | 400 | JetBrains Mono | `--color-neon` |
| Card description | 12px | 400 | Space Grotesk | `--color-text-muted` |
| Mission Log toggle | 10px | 400 | JetBrains Mono | `--color-cyan` |
| Mobile drawer toggle | 11px | 700 | JetBrains Mono | `--color-text-primary` |

---

## Color

| Role | Value | Usage |
|------|-------|-------|
| Dominant (60%) | `#0e0e0e` | Page background, outer shell |
| Secondary (30%) | `#131313` | Card surfaces, sidebar background |
| Accent — neon (10%) | `#8eff71` | Card labels, active states, CTAs |
| Accent — cyan | `#8ff5ff` | Zone labels (Mission Log toggle, curriculum header) |
| Accent — gold | `#ffd709` | Analyzer Panel header, wallet HUD, chamber section label |
| Text primary | `#e8e6e3` | Mobile drawer toggle |
| Text muted | `#7f7d78` | Card descriptions, locked button states |

Accent reserved for: card labels (neon), active card activate buttons (neon), Mission Log toggle (cyan), panel section labels (gold/cyan per zone).

---

## Copywriting Contract

| Element | EN Copy | PT Copy |
|---------|---------|---------|
| Analyzer Panel header | `ANALYZER PANEL` | `PAINEL ANALISADOR` |
| Mobile drawer toggle (closed) | `ANALYZER PANEL ▼` | `PAINEL ANALISADOR ▼` |
| Mobile drawer toggle (open) | `ANALYZER PANEL ▲` | `PAINEL ANALISADOR ▲` |
| Mission Log toggle (closed) | `MISSION LOG ▼` | `REGISTRO DE MISSÃO ▼` |
| Mission Log toggle (open) | `MISSION LOG ▲` | `REGISTRO DE MISSÃO ▲` |
| Chamber section label | `SIMULATION CHAMBERS` | `CÂMARAS DE SIMULAÇÃO` |

> Note: "SIMULATION CHAMBERS" replaces "Game Lobby" as the label above the chamber grid — this fits Phase 49 vocabulary alignment even though the full visual rework is Phase 50.

---

## Interaction Contract

### Mission Log accordion

- Toggle click → toggle `hidden` on `[data-ccz-mission-log-content]`
- On toggle: write `sessionStorage.setItem('ccz-mission-log-open', open ? '1' : '0')`
- On `astro:page-load`: read `sessionStorage.getItem('ccz-mission-log-open')` → apply state
- Default (null key): collapsed

### Mobile Analyzer Panel drawer

- Toggle click → toggle `hidden` on `[data-ccz-analyzer-drawer]`
- On toggle: write `sessionStorage.setItem('ccz-analyzer-open', open ? '1' : '0')`
- On `astro:page-load`: read key → apply state
- Default (null key): hidden (collapsed)

### Reduced motion

No CSS transitions used for toggle visibility (instant `hidden` attribute toggle). Fully accessible with `prefers-reduced-motion` by default — no special handling needed.

---

## Registry Safety

| Registry | Blocks Used | Safety Gate |
|----------|-------------|-------------|
| None — custom Tailwind only | N/A | not required |

---

## Checker Sign-Off

- [x] Dimension 1 Copywriting: PASS — EN/PT copy locked for all new UI elements
- [x] Dimension 2 Visuals: PASS — extends existing `hud-outline-subtle`, `glow-panel`, `clip-corners` patterns
- [x] Dimension 3 Color: PASS — uses existing design tokens, no new colors introduced
- [x] Dimension 4 Typography: PASS — JetBrains Mono + Space Grotesk, sizes within established range
- [x] Dimension 5 Spacing: PASS — 4px base grid, existing Tailwind tokens
- [x] Dimension 6 Registry Safety: PASS — no third-party component registries

**Approval:** approved 2026-04-04
