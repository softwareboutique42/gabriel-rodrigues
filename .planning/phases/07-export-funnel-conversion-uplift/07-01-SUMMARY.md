---
phase: 07-export-funnel-conversion-uplift
plan: 01
subsystem: Export Funnel Conversion Uplift
tags: [conversion, copy, i18n, post-payment, e2e]
type: completed
completed_date: 2026-04-02
requirements_met: [CONV-01, CONV-02, CONV-03]
dependency_graph:
  requires: [phase-6-foundation]
  provides: [phase-7-conversion]
  affects: [08-01-PLAN]
key_files:
  created:
    - .planning/phases/07-export-funnel-conversion-uplift/07-01-SUMMARY.md
  modified:
    - src/i18n/en.json
    - src/i18n/pt.json
    - src/pages/en/canvas/index.astro
    - src/pages/pt/canvas/index.astro
    - src/scripts/canvas/main.ts
    - tests/export-contract.test.mjs
    - e2e/canvas-export.spec.ts
---

# Phase 7 Plan 01 Summary

Status: complete

## Outcome

Completed the Phase 7 export funnel conversion uplift with minimal value framing, single CTA path, and immediate post-payment confirmation.

1. Added concise value prop copy (`canvas.exportModal.valueProp`) adjacent to the checkout CTA in EN/PT export modal — no expanded marketing block, one line per locale.
2. Wired `canvas.download.paymentConfirmed` i18n key and `data-payment-confirmed-text` attribute to the download-processing panel in both Astro pages, providing localized immediate confirmation text.
3. Updated `handlePaymentReturn` in `main.ts` to emit a "Payment confirmed — starting your export." status immediately on panel show, before the download fetch resolves, giving users instant post-Stripe feedback (CONV-03).
4. Extended `tests/export-contract.test.mjs` with 6 new CONV assertions covering locale key parity, data-attribute wiring, DOM source usage, and ordering guarantee (paymentConfirmed before fetch).
5. Added 2 new Playwright E2E tests asserting the export modal renders value framing text and a single checkout CTA in both EN and PT locales.

## Validation

- node --test tests/export-contract.test.mjs: pass (23/23)
- npm run build: pass (148 pages, no new warnings)
- npx playwright test e2e/canvas-export.spec.ts --grep "value framing": pass (4/4 across chromium + mobile)
- Full E2E suite: 10 passed, 2 pre-existing mobile-chrome DPR failures (offscreen canvas 2× scale) unrelated to Phase 7

## Residual Risk

- Pre-existing mobile-chrome DPR failures: capture dimensions assert 720×720 / 1080×1920 but mobile-chrome emulation applies 2× DPR producing 1440×1440 / 2160×3840. Unrelated to Phase 7 scope; no rollback triggered.
- `paymentConfirmed` status appears briefly before `preparing` replaces it; not asserted in E2E due to timing sensitivity — covered by contract test ordering assertion instead.

## Rollback Notes

If conversion funnel regressions appear (locale parity breaks, CTA ambiguity, or return-flow status becomes unclear):

1. Revert `canvas.exportModal.valueProp` and `canvas.download.paymentConfirmed` from `src/i18n/en.json` and `src/i18n/pt.json`.
2. Revert `data-payment-confirmed-text` attribute and value prop paragraph from EN/PT Astro pages.
3. Revert `setDownloadStatus(statusEl, 'paymentConfirmed', ...)` call from `handlePaymentReturn` in `src/scripts/canvas/main.ts`.
4. Re-run `node --test tests/export-contract.test.mjs`, `npx playwright test e2e/canvas-export.spec.ts`, and `npm run build` to confirm baseline restoration.
