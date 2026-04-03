# Roadmap — Company Canvas (v1.7 Casinocraftz Foundation and Slots Integration)

## Archived Milestones

- ✅ v1.0 — [milestones/v1.0-ROADMAP.md](milestones/v1.0-ROADMAP.md)
- ✅ v1.1 — [milestones/v1.1-ROADMAP.md](milestones/v1.1-ROADMAP.md)
- ✅ v1.2 Projects Hub & Slots Foundation — [milestones/v1.2-ROADMAP.md](milestones/v1.2-ROADMAP.md)
- ✅ v1.3 Slots Gameplay Foundation — [milestones/v1.3-ROADMAP.md](milestones/v1.3-ROADMAP.md)
- ✅ v1.4 Slots Animation & Sprite Upgrade — [milestones/v1.4-ROADMAP.md](milestones/v1.4-ROADMAP.md)
- ✅ v1.5 Growth & Observability Foundation — [milestones/v1.5-ROADMAP.md](milestones/v1.5-ROADMAP.md)
- ✅ v1.6 Slots Visual Polish & Atmosphere — [milestones/v1.6-ROADMAP.md](milestones/v1.6-ROADMAP.md)

## Overview

4 phases for milestone v1.7, continuing numbering after v1.6.

```
Phase 29: Casinocraftz Shell and Route Foundation
Phase 30: Slots Integration and Improvement Pass
Phase 31: House Edge Tutorial and Utility Card Systems
Phase 32: Casinocraftz Integration Confidence Lock
```

---

## Phase 29: Casinocraftz Shell and Route Foundation

**Goal:** Establish canonical browser routes and a distinct Casinocraftz shell that frames the experience as a transparent, zero-risk casino simulation.

**Requirements:** CCZ-40, CCZ-41

**Plans:** 1/1 plans complete

- [x] 29-01-PLAN.md — Canonical Casinocraftz routes, shell framing, and EN/PT project foundations

**Depends on:** Phase 28

**Success criteria:**

- Canonical EN/PT Casinocraftz routes exist and clearly communicate the anti-gambling, zero-risk premise.
- The visual shell feels intentionally futuristic and educational rather than like a conventional casino lobby.
- The route and shell structure create a stable host surface for the embedded Slots module and future Casinocraftz modules.

**Key risks:**

- The shell can accidentally glamorize casino aesthetics unless the transparent-teaching posture stays explicit.

---

## Phase 30: Slots Integration and Improvement Pass

**Goal:** Move the Slots game inside Casinocraftz as the first playable module and improve the slot experience where that supports clarity, teaching, and retention.

**Requirements:** SLOT-40, SLOT-41

**Plans:** 2/2 plans complete

- [x] 30-01-PLAN.md — Embed the Slots module in Casinocraftz and improve educational gameplay surfaces
- [x] 30-02-PLAN.md — Close embedded and standalone spin-failure gaps with deterministic EN/PT regression guards

**Depends on:** Phase 29

**Success criteria:**

- The Slots module runs inside Casinocraftz without losing deterministic authority boundaries or EN/PT parity.
- Improvements to the slot experience make house edge, blocked states, outcomes, and manipulation cues easier to understand.
- The integration leaves room for the standalone Slots route to remain stable or intentionally transition without route confusion.

**Key risks:**

- Integration can create route, lifecycle, or state-ownership drift if the host shell and slot runtime are not cleanly separated.

---

## Phase 31: House Edge Tutorial and Utility Card Systems

**Goal:** Deliver the first educational loop through a house-edge-first tutorial, hybrid dialogue, AI Essence rewards, and three starter utility cards.

**Requirements:** EDU-40, EDU-41, SYS-40, SYS-41

**Plans:** 1/1 plans complete

- [x] 31-01-PLAN.md — Tutorial beats, dialogue engine, AI Essence, and starter utility cards

**Depends on:** Phase 29

**Success criteria:**

- The first-run experience teaches house edge through play rather than static explanation alone.
- Narrative dialogue and direct explanatory UI work together without becoming noisy or preachy.
- Probability Seer, Dopamine Dampener, and House Edge cards each have a concrete utility that supports the lesson instead of acting as trophies only.

**Key risks:**

- The lesson loop can collapse into exposition unless tutorial events, rewards, and utility cards reinforce each other.

---

## Phase 32: Casinocraftz Integration Confidence Lock

**Goal:** Lock the integrated Casinocraftz experience with deterministic contracts, EN/PT compatibility coverage, and release evidence.

**Requirements:** SYS-42, QA-40, QA-41

**Plans:** 0/1 plans complete

- [ ] 32-01-PLAN.md — Integrated QA, route parity, and release validation for Casinocraftz plus embedded Slots

**Depends on:** Phase 30, Phase 31

**Success criteria:**

- Contracts and browser checks protect the integrated Casinocraftz shell, embedded Slots module, tutorial flow, and starter-card loop.
- Release verification captures lint, targeted tests, browser checks, and build evidence for the new project surface.
- Parallel phase outputs reconcile cleanly into one canonical product flow.

**Key risks:**

- Parallel tracks can diverge in route assumptions, UI structure, or runtime hooks if the integration contract is not made explicit.

---

## Phase Dependencies

```
Phase 29 -> Phase 30
Phase 29 -> Phase 31
Phase 30 -> Phase 32
Phase 31 -> Phase 32
```

---

## Requirements Coverage

| Requirement | Phase    |
| ----------- | -------- |
| CCZ-40      | Phase 29 |
| CCZ-41      | Phase 29 |
| SLOT-40     | Phase 30 |
| SLOT-41     | Phase 30 |
| EDU-40      | Phase 31 |
| EDU-41      | Phase 31 |
| SYS-40      | Phase 31 |
| SYS-41      | Phase 31 |
| SYS-42      | Phase 32 |
| QA-40       | Phase 32 |
| QA-41       | Phase 32 |

---

_Created: 2026-04-03 after v1.7 kickoff_
_Ready to execute: Phase 32 plan 01_
