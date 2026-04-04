---
phase: 52-lobby-simplification
plan: "02"
subsystem: casinocraftz/lobby
tags: [lobby, simplification, EN, info-buttons, cleanup]
dependency_graph:
  requires: [52-01]
  provides: [simplified-en-lobby-markup, mountInfoButtons]
  affects: [src/pages/en/casinocraftz/index.astro, src/scripts/casinocraftz/lobby.ts]
tech_stack:
  added: []
  patterns: [data-attribute-toggle, info-button-popover]
key_files:
  created: []
  modified:
    - src/pages/en/casinocraftz/index.astro
    - src/scripts/casinocraftz/lobby.ts
decisions:
  - "Promoted chamber card children directly into ccz-lobby-grid, removing min-w-0 wrapper alongside aside"
  - "Info popovers use hidden attribute toggled by JS, keeping static build-time i18n strings with no dynamic data"
metrics:
  duration: ~5 minutes
  completed: "2026-04-04T22:29:39Z"
  tasks_completed: 2
  tasks_total: 2
  files_modified: 2
---

# Phase 52 Plan 02: Strip EN Lobby HTML and Update lobby.ts Summary

EN lobby page simplified to single-column layout by removing Analyzer Panel sidebar and Mission Log accordion, replacing live-telemetry blocks with static info-button popovers wired by a new `mountInfoButtons()` function.

## Tasks Completed

| # | Name | Commit | Files |
|---|------|--------|-------|
| 1 | Strip EN lobby HTML | ef8eb4c | src/pages/en/casinocraftz/index.astro |
| 2 | Update lobby.ts | 1f9b5de | src/scripts/casinocraftz/lobby.ts |

## What Was Done

### Task 1 — Strip EN Lobby HTML

`src/pages/en/casinocraftz/index.astro`:

- Removed `<aside class="ccz-analyzer-panel" data-casinocraftz-zone="analyzer-panel">` and all its contents (desktop label, mobile toggle, analyzer drawer with 3 utility cards)
- Removed the inner `<div class="min-w-0">` wrapper that formed the right column, promoting its children directly into `.ccz-lobby-grid`
- Changed grid comment from `<!-- TWO-COLUMN LOBBY GRID -->` to `<!-- LOBBY GRID -->`
- Removed the entire `<section data-casinocraftz-zone="mission-log">` block including the accordion toggle button, `ccz-mission-log-content` container, curriculum section, and tutorial dialogue section
- Replaced the `ccz-chamber-telemetry` block on each of the 3 chamber cards (Slots, Blackjack, Roulette) with a `flex flex-col` info-button group containing 3 metric rows per card
- Each metric row has a label span and an `ⓘ` button with `data-ccz-info-toggle`, paired with a `hidden` popover div bearing `data-ccz-info-popover` and the matching unique id
- Total: 9 info toggle buttons and 9 info popover divs added across 3 cards

### Task 2 — Update lobby.ts

`src/scripts/casinocraftz/lobby.ts`:

- Deleted constants: `MISSION_LOG_KEY`, `ANALYZER_KEY`, `DAMPENER_KEY`
- Deleted functions: `mountMissionLog()`, `mountAnalyzerDrawer()`, `mountChamberVisualSystem()`
- Removed the 3 call sites from `mountLobby()`
- Added `mountInfoButtons(root: HTMLElement)` that queries all `[data-ccz-info-toggle]` buttons and attaches click handlers toggling the `hidden` attribute on the matched `[data-ccz-info-popover]` sibling
- Added `mountInfoButtons(root)` call in `mountLobby()` immediately before `renderBalance()`
- Net result: lobby.ts reduced from 219 lines to ~100 lines, containing only `mountLobby()` and `mountInfoButtons()`

## Verification Results

### Task 1 HTML checks (all passed)

```
OK: aside.ccz-analyzer-panel removed
OK: mission-log zone removed
OK: telemetry edge span removed
OK: telemetry signal span removed
OK: telemetry pulse span removed
OK: info toggle present
OK: info popover present
OK: slots info ids present
OK: blackjack info ids present
OK: roulette info ids present
```

### Task 2 lobby.ts checks (all passed)

```
OK: mountMissionLog removed
OK: mountAnalyzerDrawer removed
OK: mountChamberVisualSystem removed
OK: MISSION_LOG_KEY removed
OK: ANALYZER_KEY removed
OK: setInterval removed
OK: mountInfoButtons present
OK: data-ccz-info-toggle selector present
OK: data-ccz-info-popover selector present
```

### Build

`npm run build` exited 0. 158 pages built in 10.74s. No TypeScript errors.

## Deviations from Plan

None — plan executed exactly as written.

## Known Stubs

None. All info popover content is wired to `t('lobby.telemetry.*.explain')` i18n keys added in plan 52-01. No placeholder or empty values flow to the UI.

## Threat Flags

No new network endpoints, auth paths, or trust boundary surfaces introduced. Info popover toggle is a pure DOM attribute flip on static build-time content (accepted per T-52-03 and T-52-04 in the plan threat register).

## Self-Check: PASSED

- `src/pages/en/casinocraftz/index.astro` — exists and modified
- `src/scripts/casinocraftz/lobby.ts` — exists and modified
- Commit ef8eb4c — present in git log
- Commit 1f9b5de — present in git log
