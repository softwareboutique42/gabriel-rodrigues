---
status: complete
phase: 34-learning-loop-clarity-and-bounded-progression-ux
source:
  - 34-01-SUMMARY.md
started: 2026-04-03T18:10:00Z
updated: 2026-04-03T18:30:00Z
---

## Current Test

[testing complete]

## Tests

### 1. Spin-triggered causality explanation appears on probability-reveal (EN)

expected: Open /en/casinocraftz/, advance to play-and-observe, trigger 3 embedded spins, and confirm the tutorial reaches probability-reveal with explicit causality wording explaining the transition.
result: pass

### 2. Replay control is visible from house-edge-intro and non-mutating

expected: On /en/casinocraftz/, confirm replay is hidden on welcome, visible from house-edge-intro onward, and clicking replay does not change step, spins, cards, or essence datasets.
result: pass

### 3. Spin-triggered recap disclosure is scoped correctly

expected: Confirm recap disclosure is absent before spin-triggered probability-reveal, appears after the spin-trigger path, and contains deterministic explanation copy.
result: pass

### 4. Card lock/unlock badges reflect bounded progression (EN)

expected: Confirm starter cards show LOCKED badges initially and UNLOCKED badges after advancing to card-unlock, without changing unlock mechanics.
result: pass

### 5. EN/PT parity for replay, recap, and card status behavior

expected: Repeat key checks on /pt/casinocraftz/ and confirm parity-equivalent behavior and localized labels for replay/recap/card status.
result: pass

## Summary

total: 5
passed: 5
issues: 0
pending: 0
skipped: 0
blocked: 0

## Gaps

None.
