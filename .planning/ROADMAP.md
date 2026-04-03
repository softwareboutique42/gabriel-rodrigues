# Roadmap — Company Canvas (v1.8 Deterministic Learning Loop Expansion)

## Archived Milestones

- ✅ v1.0 — [milestones/v1.0-ROADMAP.md](milestones/v1.0-ROADMAP.md)
- ✅ v1.1 — [milestones/v1.1-ROADMAP.md](milestones/v1.1-ROADMAP.md)
- ✅ v1.2 Projects Hub & Slots Foundation — [milestones/v1.2-ROADMAP.md](milestones/v1.2-ROADMAP.md)
- ✅ v1.3 Slots Gameplay Foundation — [milestones/v1.3-ROADMAP.md](milestones/v1.3-ROADMAP.md)
- ✅ v1.4 Slots Animation & Sprite Upgrade — [milestones/v1.4-ROADMAP.md](milestones/v1.4-ROADMAP.md)
- ✅ v1.5 Growth & Observability Foundation — [milestones/v1.5-ROADMAP.md](milestones/v1.5-ROADMAP.md)
- ✅ v1.6 Slots Visual Polish & Atmosphere — [milestones/v1.6-ROADMAP.md](milestones/v1.6-ROADMAP.md)
- ✅ v1.7 Casinocraftz Foundation and Slots Integration — [milestones/v1.7-ROADMAP.md](milestones/v1.7-ROADMAP.md)

## Current Milestone

4 phases for milestone v1.8, continuing numbering after v1.7.

```
Phase 33: Bridge and Authority Hardening
Phase 34: Learning Loop Clarity and Bounded Progression UX
Phase 35: EN/PT and Host-Mode Parity Matrix Lock
Phase 36: Confidence Lock and Release Evidence
```

---

## Phase 33: Bridge and Authority Hardening

**Goal:** Stabilize deterministic Slots-to-tutorial bridge contracts with versioned compatibility while preserving strict authority boundaries.

**Requirements:** BRG-50, BRG-51

**Plans:** 1/1 plans complete

- [x] 33-01-PLAN.md — Versioned bridge contract and authority boundary hardening

**Depends on:** Phase 32

**Success criteria:**

- Bridge events remain deterministic and backward-compatible in embedded and standalone host modes.
- Tutorial/card layers remain presentation-only and cannot mutate gameplay authority surfaces.

**Key risks:**

- Bridge drift can silently desynchronize tutorial progression and runtime datasets.

---

## Phase 34: Learning Loop Clarity and Bounded Progression UX

**Goal:** Improve user understanding of transitions and bounded progression using deterministic explanatory UX inside existing gameplay surfaces.

**Requirements:** LEARN-50, LEARN-51, PROG-50

**Plans:** 0/1 plans complete

- [ ] 34-01-PLAN.md — Step causality explanations, recap/replay prompts, and bounded card progression visibility

**Depends on:** Phase 33

**Success criteria:**

- Users can see why tutorial transitions happened after relevant spin sequences.
- Recap/replay prompts and bounded progression states are clear without adding new gameplay mechanics.

**Key risks:**

- Explanatory overlays can become noisy and reduce scanability if not scoped tightly.

---

## Phase 35: EN/PT and Host-Mode Parity Matrix Lock

**Goal:** Lock parity behavior across EN/PT and embedded/standalone host modes for all v1.8 learning loop surfaces.

**Requirements:** PAR-50, PAR-51

**Plans:** 0/1 plans complete

- [ ] 35-01-PLAN.md — EN/PT dataset/copy parity and host-mode matrix compatibility assertions

**Depends on:** Phase 34

**Success criteria:**

- EN/PT copy, datasets, and interaction outcomes remain parity-locked across host modes.
- Compatibility suite enforces embedded and standalone matrix expectations.

**Key risks:**

- Locale or host-specific branches can bypass deterministic parity checks.

---

## Phase 36: Confidence Lock and Release Evidence

**Goal:** Close v1.8 with deterministic confidence gates, anti-monetization assertions, and auditable release artifacts.

**Requirements:** SAFE-50, SAFE-51

**Plans:** 0/1 plans complete

- [ ] 36-01-PLAN.md — Final confidence lock, anti-monetization guardrails, and release verification chain

**Depends on:** Phase 35

**Success criteria:**

- Anti-monetization and zero-risk framing checks remain enforced in contracts and browser coverage.
- Release evidence captures targeted tests, compatibility checks, lint, and build with reproducible artifacts.

**Key risks:**

- Confidence gates can appear green while missing one host/locale matrix slice unless verification scope is explicit.

---

## Phase Dependencies

```
Phase 33 -> Phase 34 -> Phase 35 -> Phase 36
```

---

## Requirements Coverage

| Requirement | Phase    |
| ----------- | -------- |
| BRG-50      | Phase 33 |
| BRG-51      | Phase 33 |
| LEARN-50    | Phase 34 |
| LEARN-51    | Phase 34 |
| PROG-50     | Phase 34 |
| PAR-50      | Phase 35 |
| PAR-51      | Phase 35 |
| SAFE-50     | Phase 36 |
| SAFE-51     | Phase 36 |

---

_Created: 2026-04-03 after v1.8 kickoff_
_Ready to execute: Phase 33 plan 01_
