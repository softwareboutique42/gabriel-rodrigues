# Requirements — Company Canvas (v1.5 Growth & Observability Foundation)

**Defined:** 2026-04-03
**Core Value:** Branded, download-ready animation in under a minute.

## v1.5 Requirements

### Analytics and Observability

- [ ] **ANL-10**: Projects to Slots discovery journey emits deterministic analytics events on canonical EN/PT routes.
- [ ] **ANL-11**: Slots gameplay lifecycle (spin attempt, resolved outcome, insufficient-credit block) exposes stable analytics events without mutating gameplay authority.
- [ ] **ANL-12**: Analytics payloads include locale-safe, parity-safe dimensions (route, locale, surface, outcome category) with no PII.

### Verification Hygiene and Release Gates

- [ ] **VER-10**: Phase summaries must include a Validation section before milestone close.
- [ ] **VER-11**: Existing verification debt is backfilled for historical summaries needed by milestone-level audits.
- [ ] **VER-12**: Milestone closure checks fail fast when required validation artifacts are missing.

### QA and Compatibility Confidence

- [ ] **QA-21**: Contract and compatibility suites cover analytics hook stability and EN/PT parity for instrumented flows.
- [ ] **QA-22**: Release verification chain documents lint, targeted tests, E2E, and build outcomes for each completed v1.5 plan.

## v2+ Requirements (Deferred)

### Product Growth

- **ANL-20**: Conversion dashboards and cohort reporting in external analytics tooling.
- **ANL-21**: Experimentation framework for CTA/flow A-B testing.

## Out of Scope

| Feature                               | Reason                                                                       |
| ------------------------------------- | ---------------------------------------------------------------------------- |
| Real-money wagering analytics         | Product remains non-gambling and no-money-play for Slots.                    |
| Gameplay rule redesign                | v1.5 targets observability and verification confidence, not economy changes. |
| Full telemetry warehouse integration  | Start with lightweight event hooks and compatibility-safe payloads.          |
| User tracking across sessions/devices | Defer identity-level analytics; keep anonymous interaction events only.      |

## Traceability

| Requirement | Phase    | Status  |
| ----------- | -------- | ------- |
| ANL-10      | Phase 23 | Planned |
| ANL-11      | Phase 23 | Planned |
| ANL-12      | Phase 23 | Planned |
| VER-10      | Phase 24 | Planned |
| VER-11      | Phase 24 | Planned |
| VER-12      | Phase 24 | Planned |
| QA-21       | Phase 25 | Planned |
| QA-22       | Phase 25 | Planned |

**Coverage:**

- v1.5 requirements: 8 total
- Mapped to phases: 8
- Unmapped: 0

---

_Requirements defined: 2026-04-03_
_Last updated: 2026-04-03 at v1.5 kickoff_
