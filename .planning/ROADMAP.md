# Roadmap — Company Canvas (v1.2 Projects Hub & Slots Foundation)

## Overview

4 phases for milestone v1.2, continuing numbering after v1.1.

```
Phase 9: Navigation and i18n Primitives
Phase 10: Projects Hub Delivery
Phase 11: Slots Shell Foundation
Phase 12: Compatibility and QA Hardening
```

---

## Phase 9: Navigation and i18n Primitives

**Goal:** Establish bilingual navigation and translation primitives for Projects/Slots without breaking existing Canvas access.

**Requirements:** HUB-01, I18N-01

**Plans:** 1 plan

- [x] 09-01-PLAN.md — Header Projects nav swap, active-state primitives, and EN/PT i18n parity guards

**Success criteria:**

- Header navigation exposes Projects as the top-level entry and removes direct Canvas nav link.
- Required EN/PT keys for navigation, projects, and slots labels are present and parity-checked.
- Navigation active-state logic includes `/projects`, `/canvas`, and `/slots` surfaces consistently.

**Key risks:**

- Missing EN/PT key parity can cascade into broken labels in later phases.

---

## Phase 10: Projects Hub Delivery

**Goal:** Deliver Projects hub pages in EN/PT as the discovery surface for Canvas and Slots while preserving canonical Canvas routes.

**Requirements:** HUB-02, HUB-03, I18N-02

**Plans:** 1 plan

- [x] 10-01-PLAN.md — EN/PT projects hub pages, canonical CTA routes, and language-switch parity checks

**Depends on:** Phase 9

**Success criteria:**

- `/en/projects/` and `/pt/projects/` pages exist with clear cards for Canvas and Slots.
- Canvas remains canonical at `/en/canvas/` and `/pt/canvas/` with no route regression.
- Language switching from projects and canvas paths resolves to valid counterpart routes.

**Key risks:**

- Navigation restructuring can break legacy discovery paths if links are not updated consistently.

---

## Phase 11: Slots Shell Foundation

**Goal:** Add EN/PT Slots shell routes and SPA-safe bootstrap structure, explicitly scoped to non-gameplay foundation.

**Requirements:** SLOT-01, SLOT-02, SLOT-03

**Plans:** 1 plan

- [x] 11-01-PLAN.md — EN/PT slots shell routes, compliance disclaimer contract, and SPA-safe bootstrap lifecycle

**Depends on:** Phases 9-10

**Success criteria:**

- `/en/slots/` and `/pt/slots/` render shell pages with in-development and non-real-money disclaimers.
- Slots shell script wiring uses Astro SPA-safe lifecycle (`astro:page-load` + cleanup guard).
- No gameplay logic, RNG, or monetization features are introduced in this milestone.

**Key risks:**

- Shell pages can accidentally expand into gameplay scope without clear milestone boundaries.

---

## Phase 12: Compatibility and QA Hardening

**Goal:** Lock discovery/navigation/i18n behavior with regression coverage and compatibility checks for the new IA.

**Requirements:** COMP-01

**Plans:** 1 plan

- [ ] 12-01-PLAN.md — Compatibility contracts, EN/PT route-switch E2E checks, and canonical-route hardening gates

**Depends on:** Phases 9-11

**Success criteria:**

- E2E coverage verifies Projects -> Canvas/Slots discovery flow in EN/PT.
- i18n switching and navigation labels are regression-locked across updated routes.
- Compatibility checks confirm canonical Canvas routes remain stable post-restructure.

**Key risks:**

- Inadequate regression coverage can hide route/language breakage until after deployment.

---

## Phase Dependencies

```
Phase 9 -> Phase 10 -> Phase 11 -> Phase 12
```

---

## Requirements Coverage

| Requirement | Phase    |
| ----------- | -------- |
| HUB-01      | Phase 9  |
| HUB-02      | Phase 10 |
| HUB-03      | Phase 10 |
| SLOT-01     | Phase 11 |
| SLOT-02     | Phase 11 |
| SLOT-03     | Phase 11 |
| I18N-01     | Phase 9  |
| I18N-02     | Phase 10 |
| COMP-01     | Phase 12 |

---

_Created: 2026-04-02 after v1.2 kickoff_
_Ready to plan: Phase 9_
