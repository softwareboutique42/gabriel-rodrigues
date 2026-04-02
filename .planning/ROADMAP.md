# Roadmap — Company Canvas (v1.1 New Style Packs)

## Overview

3 phases for milestone v1.1, continuing numbering after v1.0.

```
Phase 6: Vertical Style Pack Foundation
Phase 7: Export Funnel Conversion Uplift
Phase 8: Verification and Audit Automation
```

---

## Phase 6: Vertical Style Pack Foundation

**Goal:** Add new vertical-specific presets and deterministic routing coverage while preserving loop and quality contracts.

**Requirements:** PACK-01, PACK-02, PACK-03

**Plans:** 1 plan

Plans:

- [ ] 06-01-PLAN.md — Vertical presets, deterministic routing expansion, and regression locks (PACK-01, PACK-02, PACK-03)

**Success criteria:**

- At least 3 additional presets are available in selector and render correctly.
- New presets pass seam-safe loop behavior at 12-second duration.
- Deterministic selector routes at least 2 new categories to the new presets.
- Existing style mappings remain stable (no regressions in current matrix).

**Key risks:**

- New style routing could reduce existing mapping quality if tie-breakers are not updated carefully.

---

## Phase 7: Export Funnel Conversion Uplift

**Goal:** Increase successful paid exports by improving clarity and flow through the premium export journey.

**Requirements:** CONV-01, CONV-02, CONV-03

**Plans:** 0 plans

**Depends on:** Phase 6

**Success criteria:**

- Premium value proposition is visible before payment in EN/PT.
- CTA copy and flow transitions are simplified without losing required safeguards.
- Post-payment success state gives a clear export next-step outcome.

**Key risks:**

- Conversion-focused copy changes can unintentionally create i18n drift between EN/PT.

---

## Phase 8: Verification and Audit Automation

**Goal:** Standardize verification artifacts and make milestone closure audit-first by default.

**Requirements:** QVER-01, QVER-02, QVER-03

**Plans:** 0 plans

**Depends on:** Phases 6-7

**Success criteria:**

- Milestone closeout path clearly requires audit status visibility before completion.
- Phase-level verification artifacts follow a consistent, queryable structure.
- Progress output highlights verification debt to prevent silent carryover.

**Key risks:**

- Process hardening can add friction if guardrails are too rigid for small changes.

---

## Phase Dependencies

```
Phase 6 -> Phase 7 -> Phase 8
```

---

## Requirements Coverage

| Requirement | Phase   |
| ----------- | ------- |
| PACK-01     | Phase 6 |
| PACK-02     | Phase 6 |
| PACK-03     | Phase 6 |
| CONV-01     | Phase 7 |
| CONV-02     | Phase 7 |
| CONV-03     | Phase 7 |
| QVER-01     | Phase 8 |
| QVER-02     | Phase 8 |
| QVER-03     | Phase 8 |

---

_Created: 2026-04-02 after v1.1 kickoff_
_Ready to plan: Phase 6_
