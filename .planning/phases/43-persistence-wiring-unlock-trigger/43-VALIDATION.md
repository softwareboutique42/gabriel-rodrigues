---
phase: 43
slug: persistence-wiring-unlock-trigger
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-04-04
---

# Phase 43 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property               | Value                                                       |
| ---------------------- | ----------------------------------------------------------- |
| **Framework**          | `node:test` (built-in, Node.js 22.x)                        |
| **Config file**        | None — tests run directly via `node --test`                 |
| **Quick run command**  | `node --test tests/casinocraftz-tutorial-contract.test.mjs` |
| **Full suite command** | `node --test tests/*.test.mjs`                              |
| **Estimated runtime**  | ~5 seconds                                                  |

---

## Sampling Rate

- **After every task commit:** Run `node --test tests/casinocraftz-tutorial-contract.test.mjs`
- **After every plan wave:** Run `node --test tests/*.test.mjs`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** ~5 seconds

---

## Per-Task Verification Map

| Task ID  | Plan | Wave | Requirement | Test Type | Automated Command                                           | File Exists  | Status     |
| -------- | ---- | ---- | ----------- | --------- | ----------------------------------------------------------- | ------------ | ---------- |
| 43-01-01 | 01   | 0    | EDU-70      | contract  | `node --test tests/casinocraftz-tutorial-contract.test.mjs` | Wave 0 gap   | ⬜ pending |
| 43-01-02 | 01   | 1    | EDU-70      | contract  | `node --test tests/casinocraftz-tutorial-contract.test.mjs` | Wave 0 gap   | ⬜ pending |
| 43-01-03 | 01   | 1    | EDU-70      | contract  | `node --test tests/casinocraftz-tutorial-contract.test.mjs` | Wave 0 gap   | ⬜ pending |
| 43-02-01 | 02   | 1    | EDU-71      | contract  | `node --test tests/casinocraftz-tutorial-contract.test.mjs` | Yes (test 7) | ⬜ pending |
| 43-02-02 | 02   | 1    | EDU-73      | contract  | `node --test tests/casinocraftz-tutorial-contract.test.mjs` | Wave 0 gap   | ⬜ pending |

_Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky_

---

## Wave 0 Requirements

- [ ] New contract test block in `tests/casinocraftz-tutorial-contract.test.mjs` covering:
  - `export function loadCompletedLessons` present in `engine.ts`
  - `ccz-near-miss-completed` present in `engine.ts`
  - `ccz-lesson-sensory-completed` present in `engine.ts`
  - `ccz-near-miss-completed` present in `main.ts` (skip handler D-06)

_Note: These assertions are added as part of the implementation plan alongside the source changes (not a separate test-first wave), since the patterns they assert against don't exist yet._

---

## Manual-Only Verifications

| Behavior                         | Requirement | Why Manual                    | Test Instructions                                                                              |
| -------------------------------- | ----------- | ----------------------------- | ---------------------------------------------------------------------------------------------- |
| Lesson 3 unlocks on page reload  | EDU-70      | Requires browser localStorage | Complete Lesson 2, reload page, verify Lesson 3 card shows unlocked state                      |
| Lesson 3 completion survives nav | EDU-73      | Requires browser localStorage | Complete Lesson 3, navigate away and back, verify Lesson 3 shows completed + counter reads 3/3 |
| Skip preserves near-miss flag    | EDU-70      | Requires browser localStorage | Skip through Lesson 3, reload page, verify near-miss completion is persisted in localStorage   |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 5s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
