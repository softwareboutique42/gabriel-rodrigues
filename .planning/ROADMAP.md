# Roadmap — Company Canvas (v1.3 Slots Gameplay Foundation)

## Overview

3 phases for milestone v1.3, continuing numbering after v1.2.

```
Phase 13: Slots Core Gameplay Loop
Phase 14: Economy, UX, and i18n Parity
Phase 15: Compatibility and Regression Hardening
```

---

## Phase 13: Slots Core Gameplay Loop

**Goal:** Implement deterministic reel-spin and payout evaluation logic for a complete single-round gameplay loop.

**Requirements:** SLOT-10, SLOT-11

**Plans:** 1 plan

- [ ] 13-01-PLAN.md — Reel state model, spin orchestration, payline evaluation, and deterministic outcome contracts

**Success criteria:**

- Spin lifecycle has explicit states (`idle` -> `spinning` -> `result`) and blocks invalid transitions.
- Reel-stop and result calculation are deterministic for identical seeds/inputs.
- Win/loss outcomes match payline and payout table rules in contract tests.

**Key risks:**

- State drift between UI and logic can cause duplicate rounds or stale results.

---

## Phase 14: Economy, UX, and i18n Parity

**Goal:** Add stable credits/bet flow and bilingual gameplay UX that communicates all interaction states clearly.

**Requirements:** SLOT-12, I18N-10, UX-10

**Plans:** 1 plan

- [ ] 14-01-PLAN.md — Session-safe balance loop, interaction guardrails, and EN/PT gameplay copy parity

**Depends on:** Phase 13

**Success criteria:**

- Balance updates are correct across bet placement, round resolution, and insufficient-credit cases.
- Gameplay controls prevent invalid actions while spinning or when credits are insufficient.
- All new gameplay strings exist in both `en.json` and `pt.json` with parity coverage.

**Key risks:**

- Economy edge cases (zero credits, max bet, consecutive rounds) can desync UI from source-of-truth state.

---

## Phase 15: Compatibility and Regression Hardening

**Goal:** Lock gameplay and route behavior with regression checks while preserving canonical IA from v1.2.

**Requirements:** COMP-10, QA-10

**Plans:** 1 plan

- [ ] 15-01-PLAN.md — Contract + E2E regression gates for gameplay loop, i18n switching, and canonical routing

**Depends on:** Phases 13-14

**Success criteria:**

- Contract tests cover gameplay determinism, payouts, and balance invariants.
- E2E validates EN/PT Slots journeys and route stability across Projects/Canvas/Slots.
- Alias routes remain denied unless explicitly added in a future milestone.

**Key risks:**

- Uncovered gameplay edge cases can pass manual testing but fail under repeated rounds.

---

## Phase Dependencies

```
Phase 13 -> Phase 14 -> Phase 15
```

---

## Requirements Coverage

| Requirement | Phase    |
| ----------- | -------- |
| SLOT-10     | Phase 13 |
| SLOT-11     | Phase 13 |
| SLOT-12     | Phase 14 |
| I18N-10     | Phase 14 |
| UX-10       | Phase 14 |
| COMP-10     | Phase 15 |
| QA-10       | Phase 15 |

---

_Created: 2026-04-02 after v1.3 kickoff_
_Ready to plan: Phase 13_
