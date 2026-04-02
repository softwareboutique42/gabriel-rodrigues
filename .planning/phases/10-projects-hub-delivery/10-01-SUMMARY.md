---
phase: 10-projects-hub-delivery
plan: 01
subsystem: Projects Hub Delivery
tags: [projects-hub, i18n, routing, canonical-links, contracts]
type: completed
completed_date: 2026-04-02
requirements_met: [HUB-02, HUB-03, I18N-02]
dependency_graph:
  requires: [phase-9-nav-i18n-primitives]
  provides: [phase-10-projects-hub]
  affects: [11-01-PLAN, 12-01-PLAN]
key_files:
  created:
    - src/pages/en/projects/index.astro
    - src/pages/pt/projects/index.astro
    - tests/projects-hub-delivery.test.mjs
    - .planning/phases/10-projects-hub-delivery/10-01-SUMMARY.md
  modified:
    - src/i18n/en.json
    - src/i18n/pt.json
    - .planning/ROADMAP.md
---

# Phase 10 Plan 01 Summary

Status: complete

## Outcome

Delivered bilingual Projects hub pages as the discovery surface for Canvas and Slots, with canonical CTA routing and route-context language switching preserved.

1. Added `/en/projects/` and `/pt/projects/` pages using a two-card hero split (Canvas + Slots) with medium-detail cards and one CTA each.
2. Kept CTA links canonical-only to locale routes (`/en|pt/canvas/` and `/en|pt/slots/`) with no `/projects/*` aliases.
3. Preserved language-switch route context by relying on existing `getLocalizedPath(Astro.url.pathname, targetLang)` behavior.
4. Added focused contract coverage for projects parity, canonical links, and projects/canvas/slots counterpart-switch expectations.

## Validation

- `npm run build`: pass (150 pages built)
- `node --test tests/nav-i18n-primitives.test.mjs`: pass (3/3)
- `node --test tests/projects-hub-delivery.test.mjs`: pass (4/4)

## Rollback Notes

If discovery routing or language-switch regressions appear:

1. Revert projects page files (`src/pages/en/projects/index.astro`, `src/pages/pt/projects/index.astro`).
2. Revert Phase 10 i18n keys in `src/i18n/en.json` and `src/i18n/pt.json` together to preserve parity.
3. Revert `tests/projects-hub-delivery.test.mjs` if contracts need reset to baseline.
4. Re-run build + both contract suites to confirm restoration.
