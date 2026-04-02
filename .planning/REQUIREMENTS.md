# Requirements — Company Canvas (v1.3 Slots Gameplay Foundation)

**Defined:** 2026-04-02
**Core Value:** Branded, download-ready animation in under a minute.

## v1.3 Requirements

### Gameplay Core

- [ ] **SLOT-10**: Functional reel spin system with deterministic stopping behavior and predictable state transitions.
- [ ] **SLOT-11**: Payline evaluation and payout calculation logic produces correct outcomes across win/loss cases.
- [ ] **SLOT-12**: Session-safe credits/bet loop supports placing bets, resolving rounds, and updating balance without negative-state bugs.

### UX and Bilingual Parity

- [ ] **I18N-10**: All new Slots gameplay copy and status labels are present in both EN/PT with parity checks.
- [ ] **UX-10**: Gameplay interaction states (idle, spinning, result, insufficient credits) are clearly communicated and prevent invalid actions.

### Compatibility and Safety

- [ ] **COMP-10**: Existing canonical routes (`/en|pt/projects/`, `/en|pt/canvas/`, `/en|pt/slots/`) remain stable after gameplay integration.
- [ ] **QA-10**: Gameplay logic and route/i18n behavior are regression-locked with contract tests plus focused E2E flows.

## v2+ Requirements (Deferred)

### Payments and Monetization

- **SLOT-20**: Real-money wagering, deposits, and cash payouts.
- **SLOT-21**: Regulatory compliance flows for gambling jurisdictions.

### Growth and Analytics

- **ANL-10**: Analytics instrumentation for Projects → Slots funnel and gameplay events.

## Out of Scope

| Feature                             | Reason                                                             |
| ----------------------------------- | ------------------------------------------------------------------ |
| Real-money betting / payouts        | Not part of foundation milestone; legal/compliance work not scoped |
| Multiplayer or tournament mechanics | Single-player core loop first for reliability                      |
| New rendering framework             | Maintain current Astro + Three.js architecture                     |
| `/projects/slots/*` alias routes    | Keep canonical routing simple and unchanged                        |

## Traceability

| Requirement | Phase    | Status  |
| ----------- | -------- | ------- |
| SLOT-10     | Phase 13 | Pending |
| SLOT-11     | Phase 13 | Pending |
| SLOT-12     | Phase 14 | Pending |
| I18N-10     | Phase 14 | Pending |
| UX-10       | Phase 14 | Pending |
| COMP-10     | Phase 15 | Pending |
| QA-10       | Phase 15 | Pending |

**Coverage:**

- v1.3 requirements: 7 total
- Mapped to phases: 7
- Unmapped: 0

---

_Requirements defined: 2026-04-02_
_Last updated: 2026-04-02 after v1.3 kickoff_
