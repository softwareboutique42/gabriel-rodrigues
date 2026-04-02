# Phase 15 Validation Plan

## Purpose

Define fail-fast compatibility and regression hardening gates for COMP-10 and QA-10.

## Validation Matrix

| Requirement    | Behavior                                                                                         | Validation Type | Command / Method                                                                                                                                                                                     | Owner Plan |
| -------------- | ------------------------------------------------------------------------------------------------ | --------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------- |
| COMP-10        | Canonical EN/PT route matrix for Projects/Canvas/Slots remains exact under counterpart switching | Contract        | `node --test tests/compatibility-contract.test.mjs`                                                                                                                                                  | 15-01      |
| COMP-10        | Alias route deny-list remains enforced (`/projects/canvas/*`, `/projects/slots/*`)               | Contract + E2E  | `node --test tests/compatibility-contract.test.mjs` and `npx playwright test e2e/compatibility.spec.ts --project=chromium`                                                                           | 15-01      |
| QA-10          | Deterministic gameplay, payout, economy arithmetic, and interaction guards remain stable         | Contract        | `node --test tests/slots-core-determinism-contract.test.mjs tests/slots-payline-evaluation-contract.test.mjs tests/slots-economy-contract.test.mjs tests/slots-interaction-guards-contract.test.mjs` | 15-01      |
| QA-10          | EN/PT gameplay key parity and translated rendering hooks remain intact                           | Contract        | `node --test tests/slots-i18n-parity-contract.test.mjs`                                                                                                                                              | 15-01      |
| COMP-10, QA-10 | Runtime EN/PT compatibility journeys remain stable in focused Chromium checks                    | E2E             | `npx playwright test e2e/compatibility.spec.ts --project=chromium`                                                                                                                                   | 15-01      |
| COMP-10, QA-10 | Build remains healthy after hardening updates                                                    | Build Gate      | `npm run build`                                                                                                                                                                                      | 15-01      |

## Command Order (Fail Fast)

1. `node --test tests/compatibility-contract.test.mjs tests/slots-core-determinism-contract.test.mjs tests/slots-payline-evaluation-contract.test.mjs tests/slots-economy-contract.test.mjs tests/slots-interaction-guards-contract.test.mjs tests/slots-i18n-parity-contract.test.mjs`
2. `npx playwright test e2e/compatibility.spec.ts --project=chromium`
3. `npm run build`

## Full Gate Command

- `node --test tests/compatibility-contract.test.mjs tests/slots-core-determinism-contract.test.mjs tests/slots-payline-evaluation-contract.test.mjs tests/slots-economy-contract.test.mjs tests/slots-interaction-guards-contract.test.mjs tests/slots-i18n-parity-contract.test.mjs && npx playwright test e2e/compatibility.spec.ts --project=chromium && npm run build`
