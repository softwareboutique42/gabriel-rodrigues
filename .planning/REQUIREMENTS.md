# Requirements — Company Canvas (v1.6 Analytics Productization and Experimentation)

**Defined:** 2026-04-03
**Core Value:** Branded, download-ready animation in under a minute.

## v1.6 Requirements

### Growth Analytics Productization

- [ ] **ANL-20**: Analytics reporting primitives provide conversion views for Projects -> Canvas/Slots discovery funnels.
- [ ] **ANL-21**: Analytics reporting includes gameplay progression metrics (attempt, outcome, blocked reason) with EN/PT parity-safe dimensions.
- [ ] **ANL-22**: Reporting artifacts are deterministic and reproducible from machine-readable event fields.

### Experimentation Framework

- [ ] **EXP-10**: CTA and flow experiments support deterministic variant assignment and logging for EN/PT routes.
- [ ] **EXP-11**: Experiment lifecycle includes enable/disable controls without codepath instability.
- [ ] **EXP-12**: Experiment reporting can compare variant performance using parity-safe dimensions.

### Release Confidence Automation

- [ ] **REL-10**: Milestone closeout can run a single deterministic confidence gate covering lint, targeted tests, E2E, and build.
- [ ] **REL-11**: Confidence gate output is summary-ready and machine-checkable for planning artifacts.

## v2+ Requirements (Deferred)

### Product Growth

- **ANL-30**: Cohort and retention analysis across recurring visitors.
- **EXP-20**: Multi-armed bandit experiment allocation.

## Out of Scope

| Feature                               | Reason                                                                 |
| ------------------------------------- | ---------------------------------------------------------------------- |
| User-identifying analytics enrichment | Keep telemetry anonymous and parity-safe by default.                   |
| Real-money monetization experiments   | Product direction remains non-gambling and no-money-play for Slots.    |
| Full BI platform migration            | v1.6 focuses on in-repo reporting primitives and confidence workflows. |

## Traceability

| Requirement | Phase    | Status  |
| ----------- | -------- | ------- |
| ANL-20      | Phase 26 | Planned |
| ANL-21      | Phase 26 | Planned |
| ANL-22      | Phase 26 | Planned |
| EXP-10      | Phase 27 | Planned |
| EXP-11      | Phase 27 | Planned |
| EXP-12      | Phase 27 | Planned |
| REL-10      | Phase 28 | Planned |
| REL-11      | Phase 28 | Planned |

**Coverage:**

- v1.6 requirements: 8 total
- Mapped to phases: 8
- Unmapped: 0

---

_Requirements defined: 2026-04-03_
_Last updated: 2026-04-03 at v1.6 kickoff_
