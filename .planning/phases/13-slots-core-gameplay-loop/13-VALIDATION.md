# Phase 13 Validation Plan

## Purpose

Define validation coverage for deterministic Slots core gameplay loop delivery in Phase 13.

## Validation Matrix

| Requirement      | Behavior                                                                                               | Validation Type        | Command / Method                                                                          | Owner Plan |
| ---------------- | ------------------------------------------------------------------------------------------------------ | ---------------------- | ----------------------------------------------------------------------------------------- | ---------- |
| SLOT-10          | Explicit `idle -> spinning -> result` lifecycle blocks invalid transitions and duplicate spin triggers | Contract               | `node --test tests/slots-core-determinism-contract.test.mjs`                              | 13-01      |
| SLOT-10          | Identical seed/config/spinIndex yields identical stops, matrix, and outcome                            | Contract               | `node --test tests/slots-core-determinism-contract.test.mjs` (run twice for consistency)  | 13-01      |
| SLOT-11          | Payline evaluation computes win/loss from resolved symbols with deterministic payout units             | Contract               | `node --test tests/slots-payline-evaluation-contract.test.mjs`                            | 13-01      |
| SLOT-10, SLOT-11 | Core loop integration preserves shell lifecycle and canonical EN/PT route baseline                     | Contract + Integration | `node --test tests/slots-shell-foundation.test.mjs tests/compatibility-contract.test.mjs` | 13-01      |
| SLOT-10, SLOT-11 | Build remains healthy after gameplay loop integration                                                  | Build Gate             | `npm run build`                                                                           | 13-01      |

## Commands

- node --test tests/slots-core-determinism-contract.test.mjs
- node --test tests/slots-core-determinism-contract.test.mjs
- node --test tests/slots-payline-evaluation-contract.test.mjs
- node --test tests/slots-shell-foundation.test.mjs tests/compatibility-contract.test.mjs
- npm run build
