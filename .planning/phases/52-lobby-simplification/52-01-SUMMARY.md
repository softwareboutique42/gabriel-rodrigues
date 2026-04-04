---
phase: 52-lobby-simplification
plan: "01"
subsystem: lobby
tags: [i18n, css, layout, casinocraftz]
dependency_graph:
  requires: []
  provides:
    - EN/PT translation keys for telemetry info popovers
    - Single-column lobby layout base
  affects:
    - src/pages/en/casinocraftz/index.astro
    - src/pages/pt/casinocraftz/index.astro
tech_stack:
  added: []
  patterns:
    - i18n key insertion (en.json / pt.json)
    - CSS block replacement (global.css)
key_files:
  modified:
    - src/i18n/en.json
    - src/i18n/pt.json
    - src/styles/global.css
decisions:
  - Keep .ccz-lobby-grid class in HTML and CSS (as display:block) so markup needs no change in this plan
metrics:
  duration: ~5 min
  completed: "2026-04-04"
  tasks_completed: 2
  files_modified: 3
---

# Phase 52 Plan 01: i18n Keys and Single-Column Layout Summary

Added 4 EN/PT translation keys for telemetry metric info popovers and converted the lobby CSS grid from a two-column (260px sidebar + 1fr content) layout to a plain `display: block` single column, removing all analyzer-panel sticky/drawer rules.

## What Was Done

**Task 1 — i18n keys**

Inserted 4 new keys immediately after `lobby.telemetry.impulse` in both `src/i18n/en.json` and `src/i18n/pt.json`:

- `lobby.telemetry.houseEdge.explain` — plain-language explanation of house edge
- `lobby.telemetry.signal.explain` — description of RNG signal bars
- `lobby.telemetry.impulse.explain` — explanation of bets-per-minute pacing
- `lobby.telemetry.info.ariaLabel` — accessible label for the info trigger button

**Task 2 — CSS simplification**

Replaced the 37-line `/* === CASINOCRAFTZ LOBBY LAYOUT === */` block in `src/styles/global.css` with 3 lines:

```css
/* === CASINOCRAFTZ LOBBY LAYOUT === */
.ccz-lobby-grid {
  display: block;
}
```

Removed:
- `grid-template-columns: 260px 1fr` (two-column definition)
- `@media (max-width: 639px)` mobile grid override
- All `.ccz-analyzer-panel` selectors (sticky positioning, drawer show/hide logic)
- `@media (min-width: 640px)` analyzer-drawer display rule

## Files Modified

| File | Change |
|------|--------|
| `src/i18n/en.json` | +4 keys after line 92 |
| `src/i18n/pt.json` | +4 keys after line 92 |
| `src/styles/global.css` | Replaced 37-line block with 3-line block |

## Verification Results

```
OK: all 4 keys present in both locales
OK: single-column layout in place, analyzer-panel rules removed
Build: 158 page(s) built in 10.68s — exit 0
```

## Deviations from Plan

None — plan executed exactly as written.

## Known Stubs

None. No UI components were wired in this plan; string keys are ready for consumption by plans 52-02 and 52-03.

## Threat Flags

No new network endpoints, auth paths, or trust-boundary surface introduced. All changes are build-time static assets.

## Self-Check: PASSED

- `src/i18n/en.json` — modified and verified
- `src/i18n/pt.json` — modified and verified
- `src/styles/global.css` — modified and verified
- Commit `776e74e` exists

## Status: COMPLETE
