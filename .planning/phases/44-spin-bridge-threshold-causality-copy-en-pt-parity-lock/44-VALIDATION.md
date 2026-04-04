---
phase: 44
slug: spin-bridge-threshold-causality-copy-en-pt-parity-lock
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-04-04
---

# Phase 44 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property               | Value                                               |
| ---------------------- | --------------------------------------------------- |
| **Framework**          | Node test runner (vitest / node:test) + Playwright  |
| **Config file**        | `playwright.config.ts`, `tests/casinocraftz-tutorial-contract.test.mjs` |
| **Quick run command**  | `node --test tests/casinocraftz-tutorial-contract.test.mjs` |
| **Full suite command** | `npm run test`                                      |
| **Estimated runtime**  | ~30 seconds                                         |

---

## Sampling Rate

- **After every task commit:** Run `node --test tests/casinocraftz-tutorial-contract.test.mjs`
- **After every plan wave:** Run `npm run test`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 30 seconds

---

## Per-Task Verification Map

| Task ID   | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status     |
| --------- | ---- | ---- | ----------- | --------- | ----------------- | ----------- | ---------- |
| 44-01-01  | 01   | 1    | EDU-72      | contract  | `node --test tests/casinocraftz-tutorial-contract.test.mjs` | ✅ existing | ⬜ pending |
| 44-01-02  | 01   | 1    | EDU-72      | contract  | `node --test tests/casinocraftz-tutorial-contract.test.mjs` | ✅ existing | ⬜ pending |
| 44-01-03  | 01   | 1    | EDU-72      | contract  | `node --test tests/casinocraftz-tutorial-contract.test.mjs` | ✅ existing | ⬜ pending |
| 44-01-04  | 01   | 1    | EDU-72      | contract  | `node --test tests/casinocraftz-tutorial-contract.test.mjs` | ✅ existing | ⬜ pending |
| 44-02-01  | 02   | 2    | EDU-72      | e2e       | `npm run test`    | ❌ W0       | ⬜ pending |

_Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky_

---

## Wave 0 Requirements

- [ ] `e2e/casinocraftz.spec.ts` — new E2E test file for spin-bridge and causality disclosure

_Existing contract test infrastructure covers all contract-level requirements._

---

## Manual-Only Verifications

_All phase behaviors have automated verification._

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 30s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
