---
phase: 52-lobby-simplification
plan: "03"
subsystem: casinocraftz/lobby
tags: [i18n, lobby, pt-locale, parity, telemetry, info-popovers]
dependency_graph:
  requires: [52-02]
  provides: [PT lobby parity with EN]
  affects: [src/pages/pt/casinocraftz/index.astro]
tech_stack:
  added: []
  patterns: [info-button popover toggle, PT i18n key usage]
key_files:
  modified:
    - src/pages/pt/casinocraftz/index.astro
decisions:
  - Element ids for info popovers are locale-agnostic (ccz-info-edge-slots etc.) to share lobby.ts query logic across EN and PT
metrics:
  duration: ~5 minutes
  completed: "2026-04-04T22:33:24Z"
  tasks_completed: 1
  tasks_total: 1
  files_modified: 1
---

# Phase 52 Plan 03: Mirror EN Lobby Simplification to PT Summary

PT lobby page simplified to structural parity with EN — analyzer panel removed, mission log removed, telemetry blocks replaced with info-button popovers using PT i18n keys.

## What Was Done

Applied the same three structural changes made to EN in plan 52-02 to `src/pages/pt/casinocraftz/index.astro`:

**Change 1 — Grid flattening:** Removed the entire `<aside class="ccz-analyzer-panel">` block (utility cards sidebar) and the inner `<div class="min-w-0">` wrapper that created the two-column layout. Children promoted one level. Comment changed from `TWO-COLUMN LOBBY GRID` to `LOBBY GRID`.

**Change 2 — Mission Log removal:** Removed the full `<section data-casinocraftz-zone="mission-log">` block including the curriculum and tutorial dialogue sections it contained.

**Change 3 — Telemetry to info-button popovers:** Replaced the `ccz-chamber-telemetry` div in each of the 3 chamber cards (Slots, Blackjack, Roulette) with 3 info-button rows per card — 9 buttons total, 9 popover divs. Used PT i18n keys (`t('lobby.telemetry.signal')` renders "SINAL", explanations use `.explain` keys). Element ids are locale-agnostic (`ccz-info-edge-slots` etc.) to share the `mountInfoButtons()` logic in the shared `lobby.ts` script.

PT-specific hrefs preserved: `/pt/slots/` and `/pt/projects/`.

## Verification Results

All 13 automated checks passed:

```
OK: PT: aside.ccz-analyzer-panel removed
OK: PT: mission-log zone removed
OK: PT: telemetry edge span removed
OK: PT: telemetry signal span removed
OK: PT: telemetry pulse span removed
OK: PT: info toggle present
OK: PT: info popover present
OK: PT: slots ids present
OK: PT: blackjack ids present
OK: PT: roulette ids present
OK: Parity: same info-toggle count
OK: Parity: same info-popover count
OK: PT uses PT slots href
```

`npm run build` exited 0 — 158 pages built successfully.

## Commits

| Hash | Message |
|------|---------|
| ed8dec4 | feat(52-03): mirror EN lobby simplification to PT locale |

## Deviations from Plan

None — plan executed exactly as written.

## Known Stubs

None — all i18n keys were added in plan 52-01 and are wired to real PT translation strings.

## Self-Check: PASSED

- File exists: `src/pages/pt/casinocraftz/index.astro` - FOUND
- Commit ed8dec4 - FOUND
- Build: exit 0 - PASSED
- All 13 verification checks: PASSED
