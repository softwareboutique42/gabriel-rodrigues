# Phase 14 Validation Plan

## Purpose

Define validation coverage for Slots economy loop, interaction guardrails, and EN/PT gameplay copy parity.

## Validation Matrix

| Requirement    | Behavior                                                                                         | Validation Type      | Command / Method                                                                                                                                    | Owner Plan |
| -------------- | ------------------------------------------------------------------------------------------------ | -------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- | ---------- |
| SLOT-12        | Valid rounds debit bet before spin and settle payout after result without negative balance drift | Contract             | `node --test tests/slots-economy-contract.test.mjs`                                                                                                 | 14-01      |
| SLOT-12        | Insufficient-credit attempts do not mutate balance or round state                                | Contract             | `node --test tests/slots-economy-contract.test.mjs tests/slots-interaction-guards-contract.test.mjs`                                                | 14-01      |
| UX-10          | Spin is blocked during `spinning` and when credits are below bet, with explicit status feedback  | Contract             | `node --test tests/slots-interaction-guards-contract.test.mjs`                                                                                      | 14-01      |
| I18N-10        | New gameplay economy/UX keys are present and non-empty in EN/PT with parity                      | Contract             | `node --test tests/slots-i18n-parity-contract.test.mjs`                                                                                             | 14-01      |
| SLOT-12, UX-10 | Economy/guardrails preserve deterministic phase-13 behavior and shell safety                     | Integration Contract | `node --test tests/slots-core-determinism-contract.test.mjs tests/slots-payline-evaluation-contract.test.mjs tests/slots-shell-foundation.test.mjs` | 14-01      |
| I18N-10        | Site build remains healthy with updated locale files/pages                                       | Build Gate           | `npm run build`                                                                                                                                     | 14-01      |

## Commands

- node --test tests/slots-economy-contract.test.mjs tests/slots-interaction-guards-contract.test.mjs tests/slots-i18n-parity-contract.test.mjs
- node --test tests/slots-economy-contract.test.mjs tests/slots-interaction-guards-contract.test.mjs tests/slots-core-determinism-contract.test.mjs tests/slots-payline-evaluation-contract.test.mjs tests/slots-shell-foundation.test.mjs
- node --test tests/slots-i18n-parity-contract.test.mjs tests/slots-economy-contract.test.mjs tests/slots-interaction-guards-contract.test.mjs tests/slots-core-determinism-contract.test.mjs tests/slots-payline-evaluation-contract.test.mjs tests/slots-shell-foundation.test.mjs
- npm run build
