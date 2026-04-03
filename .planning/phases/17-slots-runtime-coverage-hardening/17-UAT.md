---
status: complete
phase: 17-slots-runtime-coverage-hardening
source:
  - 17-01-SUMMARY.md
started: 2026-04-02T22:52:31Z
updated: 2026-04-02T22:58:06Z
---

## Current Test

[testing complete]

## Tests

### 1. EN slots runtime status and seed

expected: Open /en/slots/, trigger one spin, and confirm the gameplay panel reports the live runtime states in English. You should see State move from Idle to Spinning to Result ready, Outcome update from pending to a resolved win/loss entry, and Seed update from - to a deterministic value for the completed spin.
result: pass

### 2. PT slots runtime status and seed

expected: Open /pt/slots/, trigger one spin, and confirm the gameplay panel reports the live runtime states in Portuguese. You should see Estado move from Parado to Girando to Resultado pronto, Resultado update from pendente to a resolved win/loss entry, and Seed update from - to a deterministic value for the completed spin.
result: pass

### 3. PT insufficient-credit block

expected: On /pt/slots/, raise the bet to the maximum through the UI controls and keep spinning until the balance can no longer cover the bet. At that point the spin action should be blocked, the gameplay state should communicate Saldo insuficiente, and the runtime panel should remain stable instead of starting another spin.
result: pass

## Summary

total: 3
passed: 3
issues: 0
pending: 0
skipped: 0
blocked: 0

## Gaps

None.
