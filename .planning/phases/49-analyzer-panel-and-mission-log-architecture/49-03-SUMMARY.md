---
phase: 49-analyzer-panel-and-mission-log-architecture
plan: 03
subsystem: ui
tags: [astro, pt, i18n, structural-mirror]

requires:
  - phase: 49-analyzer-panel-and-mission-log-architecture
    provides: Restructured EN lobby from Plan 02
provides:
  - Restructured PT lobby with identical structure to EN version
  - PT translations used throughout (PAINEL ANALISADOR, REGISTRO DE MISSÃO, CÂMARAS DE SIMULAÇÃO)
  - PT-locale paths (/pt/slots/, /pt/projects/)
  - Exact structural parity with EN route ensured
affects: [49-04]

tech-stack:
  added: []
  patterns:
    - "Localization pattern: structural parity across EN and PT routes, only i18n keys and paths differ"

key-files:
  created: []
  modified:
    - src/pages/pt/casinocraftz/index.astro

key-decisions:
  - Mirrored EN restructure exactly: same HTML structure, same .ccz-lobby-grid, same toggle logic
  - Updated only locale-specific values: useTranslations('pt'), data-casinocraftz-lang="pt"
  - Changed /en/ paths to /pt/ (href="/pt/slots/", href="/pt/projects/")
  - Kept all data-casinocraftz-* attributes unchanged (JS logic is locale-agnostic)

patterns-established:
  - EN/PT parity strategy: apply structural changes to both routes, translate i18n keys in JSON files, update path prefixes

requirements-completed:
  - DTL-01
  - DTL-02

duration: 5min
completed: 2026-04-04
---

# Phase 49-03 Summary

**PT Casinocraftz lobby mirrored from EN restructure: identical two-column grid layout with PT translations and paths.**

## What Was Built

- **PT lobby structurally identical to EN version**:
  - Same `.ccz-lobby-grid` two-column layout
  - Same Analyzer Panel sidebar with 3 Utility Cards
  - Same Mission Log accordion
  - Same mobile toggles (sm:hidden button for drawer on mobile)
- **Locale-specific updates**:
  - `useTranslations('pt')` for PT locale
  - `data-casinocraftz-lang="pt"` attribute
  - All `t('key')` calls resolve to PT strings from i18n/pt.json
  - `/pt/slots/` and `/pt/projects/` paths
- **No JavaScript changes**: Both EN and PT use the same lobby.ts logic (DOM queries are locale-agnostic)
- **iframe removed**: Same as EN version — no 780px embed in PT tutorial section

## Self-Check: PASSED

- `useTranslations('pt')` for PT locale ✓
- `data-casinocraftz-lang="pt"` attribute present ✓
- `.ccz-lobby-grid` and `.ccz-analyzer-panel` classes applied identically to EN ✓
- Mobile toggle button (sm:hidden sm:hidden) with PT labels from data-label-open/close ✓
- Analyzer drawer (id="ccz-analyzer-drawer" data-ccz-analyzer-drawer hidden) present ✓
- Mission Log toggle with PT translation keys ✓
- All `/pt/` paths updated (slots, projects) ✓
- 3 Utility Cards in sidebar with PT card labels ✓
- No iframe in tutorial section ✓
- Chambers section uses `t('lobby.chambers.label')` (PT: CÂMARAS DE SIMULAÇÃO) ✓
- All data-casinocraftz-* attributes match EN version ✓
