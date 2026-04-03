---
status: complete
phase: 30-slots-integration-and-improvement-pass
source:
  - 30-01-SUMMARY.md
started: 2026-04-03T11:27:30Z
updated: 2026-04-03T11:36:24Z
---

## Current Test

[testing complete]

## Tests

### 1. EN Casinocraftz embedded host mode

expected: Open /en/casinocraftz/ and confirm the embedded Slots module is visible in the iframe. The embedded module should resolve host mode as casinocraftz, and the house-edge lesson panel should be visible inside the embedded runtime.
result: issue
reported: "the casinocraftz have the slots module embedded but clicking on spin doesnt do anything and have a lot of console errors"
severity: blocker

### 2. PT Casinocraftz embedded host mode

expected: Open /pt/casinocraftz/ and confirm the embedded Slots module is visible in the iframe. The embedded module should resolve host mode as casinocraftz, and the house-edge lesson panel should be visible inside the embedded runtime.
result: pass

### 3. Standalone slots host baseline

expected: Open /en/slots/ and /pt/slots/ directly (without host query) and confirm runtime host mode remains standalone while gameplay still works. The house-edge lesson panel should stay hidden in standalone mode.
result: issue
reported: "accessing /slots works but clicking on spin doesnt do anything"
severity: major

### 4. Canonical route and parity smoke

expected: From /en/projects/ and /pt/projects/, open Casinocraftz and ensure navigation lands on canonical /en/casinocraftz/ and /pt/casinocraftz/ routes with no /projects/casinocraftz alias drift.
result: pass

## Summary

total: 4
passed: 1
issues: 2
pending: 0
skipped: 0
blocked: 0

## Gaps

- truth: "Open /en/casinocraftz/ and confirm the embedded Slots module is visible in the iframe. The embedded module should resolve host mode as casinocraftz, and the house-edge lesson panel should be visible inside the embedded runtime."
  status: failed
  reason: "User reported: the casinocraftz have the slots module embedded but clicking on spin doesnt do anything and have a lot of console errors"
  severity: blocker
  test: 1
  root_cause: ""
  artifacts: []
  missing: []
  debug_session: ""
- truth: "Open /en/slots/ and /pt/slots/ directly (without host query) and confirm runtime host mode remains standalone while gameplay still works. The house-edge lesson panel should stay hidden in standalone mode."
  status: failed
  reason: "User reported: accessing /slots works but clicking on spin doesnt do anything"
  severity: major
  test: 3
  root_cause: ""
  artifacts: []
  missing: []
  debug_session: ""
