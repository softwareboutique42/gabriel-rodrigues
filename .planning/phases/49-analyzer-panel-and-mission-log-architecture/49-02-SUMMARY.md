---
phase: 49-analyzer-panel-and-mission-log-architecture
plan: 02
subsystem: ui
tags: [astro, lobby, restructure, responsive, sessionStorage]

requires:
  - phase: 49-analyzer-panel-and-mission-log-architecture
    provides: i18n keys and CSS classes (from Plan 01)
provides:
  - Restructured EN lobby with two-column grid layout
  - Analyzer Panel sidebar (sticky desktop, collapsible mobile)
  - Mission Log accordion (wraps curriculum + tutorial)
  - mountMissionLog() and mountAnalyzerDrawer() JS functions for toggle state
  - sessionStorage persistence for both toggles
affects: [49-03, 49-04]

tech-stack:
  added: []
  patterns:
    - "JS toggle pattern: use sessionStorage for state persistence across page reloads within session"
    - "Desktop/mobile breakpoint: 640px (Tailwind sm) controls layout (grid vs block) and visibility"
    - "Data attributes for state: data-ccz-mission-log-toggle, data-ccz-analyzer-toggle, etc."

key-files:
  created: []
  modified:
    - src/pages/en/casinocraftz/index.astro
    - src/scripts/casinocraftz/lobby.ts

key-decisions:
  - Wrapped article content in .ccz-lobby-grid (two-column 260px+1fr grid on desktop, block on mobile)
  - Moved 3 Utility Cards to sticky left sidebar (<aside class="ccz-analyzer-panel">)
  - Created Mission Log section that wraps curriculum and tutorial sections accordion-style
  - Removed 780px iframe block from tutorial secton
  - Changed "Game Lobby" label to t('lobby.chambers.label') for SIMULATION CHAMBERS branding
  - Toggle labels use data- attributes (data-label-open, data-label-close) to update dynamically

patterns-established:
  - sessionStorage usage for client-side state: keys ccz-mission-log-open and ccz-analyzer-open
  - Mobile drawer respects viewport width: resize event checks if user enlarged window
  - CSS overrides hidden attribute on desktop (media query min-width: 640px)

requirements-completed:
  - DTL-01
  - DTL-02

duration: 25min
completed: 2026-04-04
---

# Phase 49-02 Summary

**EN Casinocraftz lobby restructured: two-column grid with sticky Analyzer Panel sidebar and Mission Log accordion. 780px iframe removed. sessionStorage persists toggle state.**

## What Was Built

- **Article content wrapped in `.ccz-lobby-grid`**: two-column layout (260px sidebar + 1fr main) on desktop, single-column block on mobile
- **Analyzer Panel sidebar**: 
  - Desktop: label + 3 Utility Cards in vertical stack, sticky positioned
  - Mobile: toggle button controls visibility via `hidden` attribute, respects sessionStorage
- **Mission Log accordion**: 
  - Toggle button (chevron expands/collapses)
  - Content div contains curriculum + tutorial sections
  - Default: collapsed on first visit, respects sessionStorage within session
- **JavaScript functions added to lobby.ts**:
  - `mountMissionLog()`: toggles content visibility, persists state to sessionStorage key `ccz-mission-log-open`
  - `mountAnalyzerDrawer()`: toggles sidebar visibility on mobile, persists state to sessionStorage key `ccz-analyzer-open`
  - Desktop drawer always visible (CSS override)
  - Resize event handler: drawer shown on desktop if window enlarged from mobile
- **iframe removed**: The 780px Slots embed block fully deleted from tutorial section
- **Section label updated**: "Game Lobby" → `{t('lobby.chambers.label')}` ("SIMULATION CHAMBERS")

## Self-Check: PASSED

- `.ccz-lobby-grid` wrapper present, 260px+1fr grid applied on desktop ✓
- `<aside class="ccz-analyzer-panel">` contains 3 cards in vertical stack (flex flex-col gap-2) ✓
- Mobile toggle button (sm:hidden) with data-label-open/close attributes ✓
- Drawer element (id="ccz-analyzer-drawer" data-ccz-analyzer-drawer hidden) present ✓
- Mission Log toggle button (data-ccz-mission-log-toggle) visible ✓
- Mission Log content div (id="ccz-mission-log-content" data-ccz-mission-log-content hidden) wraps curriculum + tutorial ✓
- No iframe element in tutorial section (or any iframe with data-casinocraftz-slots-embed) ✓
- Chambers section label uses `t('lobby.chambers.label')` ✓
- `mountMissionLog()` and `mountAnalyzerDrawer()` functions exported and called from mountLobby() ✓
- sessionStorage keys: ccz-mission-log-open, ccz-analyzer-open ✓
