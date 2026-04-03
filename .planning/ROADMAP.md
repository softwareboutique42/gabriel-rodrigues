# Roadmap — Company Canvas (v1.6 Analytics Productization and Experimentation)

## Archived Milestones

- ✅ v1.0 — [milestones/v1.0-ROADMAP.md](milestones/v1.0-ROADMAP.md)
- ✅ v1.1 — [milestones/v1.1-ROADMAP.md](milestones/v1.1-ROADMAP.md)
- ✅ v1.2 Projects Hub & Slots Foundation — [milestones/v1.2-ROADMAP.md](milestones/v1.2-ROADMAP.md)
- ✅ v1.3 Slots Gameplay Foundation — [milestones/v1.3-ROADMAP.md](milestones/v1.3-ROADMAP.md)
- ✅ v1.4 Slots Animation & Sprite Upgrade — [milestones/v1.4-ROADMAP.md](milestones/v1.4-ROADMAP.md)
- ✅ v1.5 Growth & Observability Foundation — [milestones/v1.5-ROADMAP.md](milestones/v1.5-ROADMAP.md)

## Overview

3 phases for milestone v1.6, continuing numbering after v1.5.

```
Phase 26: Analytics Reporting Foundations
Phase 27: Experimentation Framework Delivery
Phase 28: Release Confidence Automation
```

---

## Phase 26: Analytics Reporting Foundations

**Goal:** Transform analytics events into deterministic reporting primitives for funnel and gameplay visibility.

**Requirements:** ANL-20, ANL-21, ANL-22

**Plans:** 0/1 plans complete

- [ ] 26-01-PLAN.md — Deterministic reporting views and parity-safe aggregation foundations

**Depends on:** Phase 25

**Success criteria:**

- Reporting layer exposes canonical Projects-to-Slots conversion and gameplay summary metrics.
- Aggregations remain deterministic and parity-safe across EN/PT contexts.
- Reporting contracts validate schema stability and reproducibility.

**Key risks:**

- Aggregation logic may drift from canonical event schema if not contract-locked.

---

## Phase 27: Experimentation Framework Delivery

**Goal:** Deliver deterministic experiment assignment and lifecycle controls for CTA and flow testing.

**Requirements:** EXP-10, EXP-11, EXP-12

**Plans:** 0/1 plans complete

- [ ] 27-01-PLAN.md — Variant assignment, lifecycle toggles, and parity-safe experiment reporting

**Depends on:** Phase 26

**Success criteria:**

- Deterministic assignment supports stable A/B comparisons across EN/PT surfaces.
- Experiment enable/disable controls avoid brittle codepath branching.
- Experiment telemetry integrates with reporting primitives for variant comparison.

**Key risks:**

- Variant-assignment drift could invalidate experiment comparisons.

---

## Phase 28: Release Confidence Automation

**Goal:** Automate milestone confidence gates with deterministic lint/test/e2e/build workflows and summary-ready outputs.

**Requirements:** REL-10, REL-11

**Plans:** 0/1 plans complete

- [ ] 28-01-PLAN.md — Unified release confidence runner and machine-checkable output formatting

**Depends on:** Phase 27

**Success criteria:**

- Confidence gate executes deterministic lint/test/e2e/build sequence with stable pass/fail output.
- Gate output can be consumed directly in phase summaries and milestone closeout checks.
- Closeout readiness is visible without manual log spelunking.

**Key risks:**

- Overly strict gate coupling can block valid releases if outputs are not normalized.

---

## Phase Dependencies

```
Phase 26 -> Phase 27 -> Phase 28
```

---

## Requirements Coverage

| Requirement | Phase    |
| ----------- | -------- |
| ANL-20      | Phase 26 |
| ANL-21      | Phase 26 |
| ANL-22      | Phase 26 |
| EXP-10      | Phase 27 |
| EXP-11      | Phase 27 |
| EXP-12      | Phase 27 |
| REL-10      | Phase 28 |
| REL-11      | Phase 28 |

---

_Created: 2026-04-03 after v1.6 kickoff_
_Ready to discuss: Phase 26_
