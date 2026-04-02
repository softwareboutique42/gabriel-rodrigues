# Phase 4 Validation Plan

## Purpose

Define validation coverage for export UX modal/options work and aspect-ratio export behavior.

## Validation Matrix

| Requirement | Behavior                                                               | Validation Type | Command / Method                                                                           | Owner Plan   |
| ----------- | ---------------------------------------------------------------------- | --------------- | ------------------------------------------------------------------------------------------ | ------------ |
| FR-4.1      | Export options support format/aspect ratio/quality contracts           | Contract + UI   | node --test tests/export-contract.test.mjs; Playwright export UI checks                    | 04-01, 04-02 |
| FR-4.2      | Export progress bar and frame status are visible during export         | UI + e2e        | npx playwright test e2e/canvas-export.spec.ts --project=chromium                           | 04-01, 04-03 |
| FR-4.3      | Keep-tab-active warning shown during export                            | UI + e2e        | npx playwright test e2e/canvas-export.spec.ts --project=chromium -g "Keep this tab active" | 04-03        |
| FR-4.4      | Export dimensions reflect selected aspect ratio/quality before capture | Contract + e2e  | node --test tests/export-contract.test.mjs; targeted Playwright assertions                 | 04-01, 04-04 |
| FR-4.5      | EN/PT strings exist for all new export UX labels                       | Static + build  | npm run build; i18n key checks                                                             | 04-01, 04-05 |
| NFR-4       | All newly introduced user text is bilingual                            | Static + review | npm run build; compare en/pt keys                                                          | 04-01+       |

## Commands

- node --test tests/export-contract.test.mjs
- npx playwright test e2e/canvas-export.spec.ts --project=chromium
- npm run build
- npm run lint
