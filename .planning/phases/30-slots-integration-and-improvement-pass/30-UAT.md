---
status: diagnosed
phase: 30-slots-integration-and-improvement-pass
source:
  - 30-01-SUMMARY.md
started: 2026-04-03T11:27:30Z
updated: 2026-04-03T12:04:53Z
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
passed: 2
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
  root_cause: "Failure is not reproducible in current repo state; likely stale/environment-specific observation combined with missing embedded-spin console regression coverage."
  artifacts:
  - path: "e2e/compatibility.spec.ts"
    issue: "Embedded iframe test asserts visibility/host but does not click spin or assert console/page error cleanliness."
  - path: "public/sw.js"
    issue: "Static cache key can preserve stale client assets across updates, increasing environment drift risk."
    missing:
  - "Add Playwright coverage for spin interaction inside embedded iframe on EN/PT Casinocraftz routes."
  - "Fail embedded test when iframe console/page errors are detected."
  - "Version service-worker cache key or add cache-busting strategy to reduce stale-client mismatch reports."
    debug_session: ".planning/debug/30-embedded-spin-failure.md"
- truth: "Open /en/slots/ and /pt/slots/ directly (without host query) and confirm runtime host mode remains standalone while gameplay still works. The house-edge lesson panel should stay hidden in standalone mode."
  status: failed
  reason: "User reported: accessing /slots works but clicking on spin doesnt do anything"
  severity: major
  test: 3
  root_cause: "Investigation inconclusive in current codebase; standalone spin path passes automation, likely route mismatch (/slots vs /en/slots|/pt/slots) or environment-specific client state."
  artifacts:
  - path: "src/pages/en/slots/index.astro"
    issue: "Canonical standalone route is locale-prefixed; no direct /slots route exists in project pages tree."
  - path: "src/scripts/slots/controller.ts"
    issue: "Spin listener and state transitions are present and covered by passing EN/PT automation."
    missing:
  - "Capture exact failing URL and console trace from manual environment when failure appears."
  - "Add regression test that explicitly rejects non-canonical /slots access path if reached via alias or redirect drift."
    debug_session: ".planning/debug/30-standalone-spin-failure.md"
