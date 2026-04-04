# Roadmap — Company Canvas

## Archived Milestones

- ✅ v1.0 — [milestones/v1.0-ROADMAP.md](milestones/v1.0-ROADMAP.md)
- ✅ v1.1 — [milestones/v1.1-ROADMAP.md](milestones/v1.1-ROADMAP.md)
- ✅ v1.2 Projects Hub & Slots Foundation — [milestones/v1.2-ROADMAP.md](milestones/v1.2-ROADMAP.md)
- ✅ v1.3 Slots Gameplay Foundation — [milestones/v1.3-ROADMAP.md](milestones/v1.3-ROADMAP.md)
- ✅ v1.4 Slots Animation & Sprite Upgrade — [milestones/v1.4-ROADMAP.md](milestones/v1.4-ROADMAP.md)
- ✅ v1.5 Growth & Observability Foundation — [milestones/v1.5-ROADMAP.md](milestones/v1.5-ROADMAP.md)
- ✅ v1.6 Slots Visual Polish & Atmosphere — [milestones/v1.6-ROADMAP.md](milestones/v1.6-ROADMAP.md)
- ✅ v1.7 Casinocraftz Foundation and Slots Integration — [milestones/v1.7-ROADMAP.md](milestones/v1.7-ROADMAP.md)
- ✅ v1.8 Deterministic Learning Loop Expansion — [milestones/v1.8-ROADMAP.md](milestones/v1.8-ROADMAP.md)
- ✅ v1.9 Psychology Curriculum Expansion — [milestones/v1.9-ROADMAP.md](milestones/v1.9-ROADMAP.md)
- ✅ v2.0 Slots Entry and Casino Polish — [milestones/v2.0-ROADMAP.md](milestones/v2.0-ROADMAP.md)
- ✅ v2.1 Symbol Atlas Production Upgrade — [milestones/v2.1-ROADMAP.md](milestones/v2.1-ROADMAP.md)

## Current Milestone

🚧 **v2.3 Sensory Effects Layer** — Phases 45–46

**Milestone Goal:** Add visible Slots celebration effects and card-based suppression while preserving motion-policy safety and EN/PT parity.

## Phases

- [ ] **Phase 45: Win-Celebration Effects System** - Add motion-policy-safe win celebration cues driven by existing Slots outcome hooks
- [ ] **Phase 46: Dampener Suppression and Confidence Lock** - Wire Dopamine Dampener suppression and close EN/PT confidence evidence

## Phase Details

### Phase 45: Win-Celebration Effects System

**Goal**: Introduce demonstrable win-celebration effects in Slots without breaking deterministic runtime boundaries or motion-policy guarantees
**Depends on**: Phase 44 (v2.2 complete)
**Requirements**: FX-70, FX-72
**Success Criteria** (what must be TRUE):

1. Win outcomes trigger visible celebration effects on canonical EN/PT Slots routes
2. Effects remain presentation-only and use existing runtime outcome hooks rather than new authority logic
3. `prefers-reduced-motion` and current motion-policy guardrails remain respected

**Plans:** 1 plan

Plans:

- [ ] 45-01-PLAN.md — Win celebration CSS (reel-win-pulse keyframes, amplified frame flare, motion-policy extensions) plus FX-70/FX-72 contract tests

### Phase 46: Dampener Suppression and Confidence Lock

**Goal**: Make the Dopamine Dampener card suppress celebration effects and close EN/PT confidence evidence for the full effects layer
**Depends on**: Phase 45
**Requirements**: FX-71, FX-73
**Success Criteria** (what must be TRUE):

1. Dopamine Dampener suppresses win celebration effects when active
2. Suppression behavior remains deterministic and presentation-only
3. EN/PT source contracts and browser coverage lock the effects layer release

**Plans:** 0/1 planned

Plans:

- [ ] 46-01-PLAN.md — Dampener suppression wiring plus parity-safe confidence coverage

## Progress

| Phase                                                  | Milestone | Plans Complete | Status      | Completed  |
| ------------------------------------------------------ | --------- | -------------- | ----------- | ---------- |
| 45. Win-Celebration Effects System                     | v2.3      | 0/1            | Not started | -          |
| 46. Dampener Suppression and Confidence Lock           | v2.3      | 0/1            | Not started | -          |

---

_Updated: 2026-04-04 — v2.2 archived; v2.3 activated_
