# Roadmap — Company Canvas (v1.5 Growth & Observability Foundation)

## Archived Milestones

- ✅ v1.0 — [milestones/v1.0-ROADMAP.md](milestones/v1.0-ROADMAP.md)
- ✅ v1.1 — [milestones/v1.1-ROADMAP.md](milestones/v1.1-ROADMAP.md)
- ✅ v1.2 Projects Hub & Slots Foundation — [milestones/v1.2-ROADMAP.md](milestones/v1.2-ROADMAP.md)
- ✅ v1.3 Slots Gameplay Foundation — [milestones/v1.3-ROADMAP.md](milestones/v1.3-ROADMAP.md)
- ✅ v1.4 Slots Animation & Sprite Upgrade — [milestones/v1.4-ROADMAP.md](milestones/v1.4-ROADMAP.md)

## Overview

3 phases for milestone v1.5, continuing numbering after v1.4.

```
Phase 23: Analytics Instrumentation Baseline
Phase 24: Verification Debt Backfill and Closure Guards
Phase 25: Runtime Compatibility Confidence for Instrumented Flows
```

---

## Phase 23: Analytics Instrumentation Baseline

**Goal:** Introduce parity-safe analytics hooks for Projects to Slots discovery and Slots gameplay lifecycle events.

**Requirements:** ANL-10, ANL-11, ANL-12

**Plans:** 1/1 plans complete

- [x] 23-01-PLAN.md — Deterministic analytics event contracts and runtime hook integration

**Depends on:** Phase 22

**Success criteria:**

- Canonical EN/PT discovery routes emit stable analytics events with shared payload shape.
- Gameplay lifecycle analytics events are emitted from presentation/runtime boundaries without authority mutation.
- Compatibility and contract checks can assert event parity and schema stability.

**Key risks:**

- Event plumbing could leak locale-specific payload drift or unstable names.

---

## Phase 24: Verification Debt Backfill and Closure Guards

**Goal:** Remove milestone verification debt and enforce summary validation sections as a release gate.

**Requirements:** VER-10, VER-11, VER-12

**Plans:** 1/1 plans complete

- [x] 24-01-PLAN.md — Validation section backfill, enforcement checks, and closeout policy hardening

**Depends on:** Phase 23

**Success criteria:**

- Historical summaries in-scope for audits include explicit Validation sections.
- Milestone closeout tooling flags missing validation artifacts before completion.
- Verification evidence remains concise, repeatable, and machine-checkable.

**Key risks:**

- Backfill changes may unintentionally rewrite historical intent instead of documenting validation evidence.

---

## Phase 25: Runtime Compatibility Confidence for Instrumented Flows

**Goal:** Lock runtime confidence for analytics-instrumented flows with deterministic contracts and compatibility E2E assertions.

**Requirements:** QA-21, QA-22

**Plans:** 0/1 plans complete

- [ ] 25-01-PLAN.md — Contract and browser parity hardening for analytics-instrumented runtime flows

**Depends on:** Phase 24

**Success criteria:**

- Contracts fail on analytics hook drift, payload-schema regressions, or EN/PT parity mismatches.
- Compatibility suite verifies instrumented canonical journeys across desktop and mobile projects.
- Verification chain outputs clear evidence suitable for milestone closeout.

**Key risks:**

- Additional assertions can become brittle if tied to copy instead of stable data hooks.

---

## Phase Dependencies

```
Phase 23 -> Phase 24 -> Phase 25
```

---

## Requirements Coverage

| Requirement | Phase    |
| ----------- | -------- |
| ANL-10      | Phase 23 |
| ANL-11      | Phase 23 |
| ANL-12      | Phase 23 |
| VER-10      | Phase 24 |
| VER-11      | Phase 24 |
| VER-12      | Phase 24 |
| QA-21       | Phase 25 |
| QA-22       | Phase 25 |

---

_Created: 2026-04-03 after v1.5 kickoff_
_Ready to plan: Phase 25_
