# Requirements — Company Canvas (v1.2 Projects Hub & Slots Foundation)

**Defined:** 2026-04-02
**Core Value:** Branded, download-ready animation in under a minute.

## v1.2 Requirements

### Navigation and Discovery

- [ ] **HUB-01**: Header navigation replaces direct Canvas top-menu item with Projects while preserving clear access paths to Canvas and Slots.
- [ ] **HUB-02**: Projects hub exists at `/en/projects/` and `/pt/projects/` and lists Canvas and Slots with clear status labels.
- [ ] **HUB-03**: Existing canonical Canvas routes (`/en/canvas/`, `/pt/canvas/`) remain unchanged and reachable without route regressions.

### Slots Foundation

- [ ] **SLOT-01**: Slots shell pages exist at `/en/slots/` and `/pt/slots/` with bilingual parity and explicit in-development messaging.
- [ ] **SLOT-02**: Slots shell includes clear non-gambling/no-real-money disclaimer copy in both locales.
- [ ] **SLOT-03**: Slots client bootstrap follows Astro SPA-safe lifecycle patterns (`astro:page-load` + idempotent init/cleanup).

### i18n and Compatibility

- [ ] **I18N-01**: All new user-facing strings for Projects/Slots/navigation are added to both `en.json` and `pt.json` with parity.
- [ ] **I18N-02**: Language switch behavior resolves correctly between EN/PT counterparts for `/projects/`, `/slots/`, and `/canvas/` routes.
- [ ] **COMP-01**: Navigation and route changes are regression-locked by E2E coverage for discovery flow (`Projects -> Canvas/Slots`) and locale switching.

## v2+ Requirements (Deferred)

### Slots Gameplay

- **SLOT-10**: Functional slot machine gameplay (reels, paylines, payouts, win logic).
- **SLOT-11**: Game economy/balance tuning and progression systems.

### Growth and Analytics

- **ANL-10**: Analytics instrumentation for Projects/Slots funnel interactions.

## Out of Scope

| Feature                             | Reason                                                       |
| ----------------------------------- | ------------------------------------------------------------ |
| `/projects/canvas/*` alias routes   | Deferred to avoid unnecessary routing complexity in v1.2     |
| Slots gameplay implementation       | Foundation-only milestone; gameplay is a future milestone    |
| New framework or game engine        | Preserve current Astro static architecture and delivery pace |
| Mandatory analytics instrumentation | Deferred by decision for v1.2 scope control                  |

## Traceability

| Requirement | Phase    | Status  |
| ----------- | -------- | ------- |
| HUB-01      | Phase 9  | Pending |
| HUB-02      | Phase 10 | Pending |
| HUB-03      | Phase 10 | Pending |
| SLOT-01     | Phase 11 | Pending |
| SLOT-02     | Phase 11 | Pending |
| SLOT-03     | Phase 11 | Pending |
| I18N-01     | Phase 9  | Pending |
| I18N-02     | Phase 10 | Pending |
| COMP-01     | Phase 12 | Pending |

**Coverage:**

- v1.2 requirements: 9 total
- Mapped to phases: 9
- Unmapped: 0

---

_Requirements defined: 2026-04-02_
_Last updated: 2026-04-02 after v1.2 kickoff_
