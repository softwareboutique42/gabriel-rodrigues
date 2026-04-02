# Roadmap — Company Canvas (v1.3 Slots Gameplay Foundation)

## Overview

5 phases for milestone v1.3, continuing numbering after v1.2.

```
Phase 13: Slots Core Gameplay Loop
Phase 14: Economy, UX, and i18n Parity
Phase 15: Compatibility and Regression Hardening
Phase 16: Milestone Verification Backfill
Phase 17: Slots Runtime Coverage Hardening
```

---

## Phase 13: Slots Core Gameplay Loop

**Goal:** Implement deterministic reel-spin and payout evaluation logic for a complete single-round gameplay loop.

**Requirements:** SLOT-10, SLOT-11

**Plans:** 1 plan

- [x] 13-01-PLAN.md — Reel state model, spin orchestration, payline evaluation, and deterministic outcome contracts

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

- [x] 14-01-PLAN.md — Session-safe balance loop, interaction guardrails, and EN/PT gameplay copy parity

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
- [x] 15-01-PLAN.md — Contract + E2E regression gates for gameplay loop, i18n switching, and canonical routing

**Depends on:** Phases 13-14

**Success criteria:**

- Contract tests cover gameplay determinism, payouts, and balance invariants.
- E2E validates EN/PT Slots journeys and route stability across Projects/Canvas/Slots.
- Alias routes remain denied unless explicitly added in a future milestone.

**Key risks:**

- Uncovered gameplay edge cases can pass manual testing but fail under repeated rounds.

---

## Phase 16: Milestone Verification Backfill

**Goal:** Close the v1.3 audit blocker by backfilling verification artifacts and restoring requirement-level audit traceability for the already-shipped Slots gameplay work.

**Requirements:** SLOT-10, SLOT-11, SLOT-12, I18N-10, UX-10, COMP-10, QA-10

**Gap Closure:** Closes orphaned milestone requirements caused by missing phase verification artifacts for phases 13-15.

**Plans:** 1 plan

- [x] 16-01-PLAN.md — Backfill verification artifacts for phases 13-15 and rerun v1.3 milestone audit

**Depends on:** Phases 13-15

**Success criteria:**

- Phase 13, 14, and 15 each have `VERIFICATION.md` artifacts aligned with their summaries and completed requirements.
- `.planning/v1.3-MILESTONE-AUDIT.md` can be rerun without orphaned requirement failures.
- REQUIREMENTS traceability reflects the gap-closure phase until milestone audit passes.

**Key risks:**

- Verification backfill can drift from actual shipped evidence if phase artifacts are recreated loosely instead of from recorded validation commands.

---

## Phase 17: Slots Runtime Coverage Hardening

**Goal:** Strengthen runtime confidence for the Slots milestone by adding browser coverage for PT gameplay transitions, insufficient-credit states, and localized runtime messaging.

**Requirements:** —

**Gap Closure:** Closes non-blocking audit tech debt from the v1.3 milestone review.

**Plans:** 0 plans

**Depends on:** Phase 16

**Success criteria:**

- Playwright exercises PT runtime spin behavior, not just attribute presence after navigation.
- Browser coverage includes an insufficient-credit blocked gameplay path.
- Runtime-rendered localized messaging is asserted directly in browser flows where practical.

**Key risks:**

- Browser-only hardening can add maintenance cost if assertions become coupled too tightly to transient copy.

---

## Phase Dependencies

```
Phase 13 -> Phase 14 -> Phase 15 -> Phase 16 -> Phase 17
```

---

## Requirements Coverage

| Requirement | Phase    |
| ----------- | -------- |
| SLOT-10     | Phase 16 |
| SLOT-11     | Phase 16 |
| SLOT-12     | Phase 16 |
| I18N-10     | Phase 16 |
| UX-10       | Phase 16 |
| COMP-10     | Phase 16 |
| QA-10       | Phase 16 |

---

_Created: 2026-04-02 after v1.3 kickoff_
_Ready to plan: Phase 17_
