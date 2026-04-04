---
phase: 33
plan: 01
subsystem: bridge-and-authority-hardening
requirements-completed: [BRG-50, BRG-51]
tags: [bridge, versioning, authority-isolation, tutorial, casinocraftz, slots]
dependency-graph:
  requires: []
  provides: [versioned-bridge-envelope, safe-parser, authority-isolation-contracts]
  affects: [casinocraftz-tutorial, slots-shell, bridge-event-contract]
tech-stack:
  added: []
  patterns: [versioned-postMessage-envelope, source-reading-contract-tests, fail-safe-parser]
key-files:
  created:
    - .planning/phases/33-bridge-and-authority-hardening/33-VALIDATION.md
    - .planning/phases/33-bridge-and-authority-hardening/33-VERIFICATION.md
    - .planning/debug/bridge-validation-report.json
  modified:
    - src/scripts/casinocraftz/tutorial/types.ts
    - src/scripts/slots/main.ts
    - src/scripts/casinocraftz/tutorial/main.ts
    - tests/casinocraftz-tutorial-contract.test.mjs
    - tests/compatibility-contract.test.mjs
    - tests/slots-i18n-parity-contract.test.mjs
    - e2e/compatibility.spec.ts
decisions:
  - Source-reading approach for contract tests (no tsx — Node >= 22 but no --experimental-strip-types in test command)
  - parseSpinSettledBridgeEvent exported for testability and clean authority boundary
  - Legacy unversioned payload (version === undefined) accepted for backward compatibility
  - Unknown versions silently return null, no throw, no state mutation
metrics:
  duration: ~35 minutes
  completed: 2026-04-03
  tasks: 4
  files: 7
---

# Phase 33 Plan 01: Bridge and Authority Hardening Summary

**One-liner:** Versioned `ccz:spin-settled` envelope (v1 + legacy backward compat) with exported fail-safe parser and authority isolation contracts across tutorial/engine/cards.

## Tasks Completed

| #   | Task                                                 | Commit        | Files                                      |
| --- | ---------------------------------------------------- | ------------- | ------------------------------------------ |
| 1   | Define bridge types and evolve sender/receiver       | `f46e8c8`     | types.ts, slots/main.ts, tutorial/main.ts  |
| 2   | Add versioning + authority isolation contract tests  | `65b96b5`     | 3 test files                               |
| 3   | Lock EN/PT bridge parity in Playwright suite         | `ce80fb4`     | e2e/compatibility.spec.ts                  |
| 4   | Execute release evidence chain and publish artifacts | (docs commit) | VALIDATION.md, VERIFICATION.md, SUMMARY.md |

## What Was Built

### BRG-50: Versioned Bridge Contract

- `src/scripts/slots/main.ts`: postMessage evolved from `{ type, spinIndex }` to `{ type, version: 1, payload: { spinIndex } }`
- `src/scripts/casinocraftz/tutorial/main.ts`: exported `parseSpinSettledBridgeEvent(data: unknown)` function accepting v1 and legacy payloads; returns null for unknown version, invalid spinIndex, or malformed data
- `src/scripts/casinocraftz/tutorial/types.ts`: Added `BridgeEvent`, `SpinSettledV1Payload`, `SpinSettledLegacyPayload`, `CczSpinSettledEvent` types

### BRG-51: Authority Isolation

- `tutorial/engine.ts`, `tutorial/cards.ts`, `tutorial/main.ts`: no imports from `slots/` internals (rng, payout, economy)
- Bridge event consumed only to call `recordSpin(state)` on the tutorial state machine — Slots authority untouched
- 3 authority isolation contract tests lock this in source

## Test Results

- Node contract tests: 27/27 PASS
- Playwright bridge-parity specs: 3/3 PASS (48s)
- Lint: 0 errors
- Build: 154 pages, no errors

## Validation

- `node --test tests/casinocraftz-tutorial-contract.test.mjs tests/compatibility-contract.test.mjs tests/slots-i18n-parity-contract.test.mjs` - 27/27 PASS
- `npx playwright test e2e/compatibility.spec.ts --project=chromium --workers=1 --grep "casinocraftz" --reporter=json > .planning/debug/bridge-validation-report.json` - PASS
- `npm run lint` - PASS with one unrelated pre-existing warning in `.claude/`
- `npm run build` - PASS, 154 pages built

## Deviations from Plan

None — plan executed exactly as written. Source-reading approach was used for behavioral contract tests (consistent with existing project test patterns, no tsx available).

## Self-Check: PASSED

| Artifact                                                                         | Exists |
| -------------------------------------------------------------------------------- | ------ |
| `src/scripts/casinocraftz/tutorial/types.ts` (BridgeEvent)                       | ✓      |
| `src/scripts/slots/main.ts` (version: 1 envelope)                                | ✓      |
| `src/scripts/casinocraftz/tutorial/main.ts` (parseSpinSettledBridgeEvent export) | ✓      |
| `tests/casinocraftz-tutorial-contract.test.mjs` (13 new tests)                   | ✓      |
| `tests/compatibility-contract.test.mjs` (2 new tests)                            | ✓      |
| `tests/slots-i18n-parity-contract.test.mjs` (2 new tests)                        | ✓      |
| `e2e/compatibility.spec.ts` (1 new spec)                                         | ✓      |
| `.planning/debug/bridge-validation-report.json`                                  | ✓      |
| `.planning/phases/33-bridge-and-authority-hardening/33-VALIDATION.md`            | ✓      |
| `.planning/phases/33-bridge-and-authority-hardening/33-VERIFICATION.md`          | ✓      |

Commits verified: `f46e8c8`, `65b96b5`, `ce80fb4`
