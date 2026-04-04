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

🚧 **v2.2 Sensory Conditioning Content** — Phases 43–44

**Milestone Goal:** Unlock Lesson 3 of the Casinocraftz curriculum for returning users by fixing the persistence model and verifying that sensory conditioning dialogue, spin-bridge observation, and EN/PT parity all hold end-to-end.

## Phases

- [x] **Phase 43: Persistence Wiring & Unlock Trigger** - Fix the returning-user fast-path and write Lesson 2/3 completion to localStorage (completed 2026-04-04)
- [ ] **Phase 44: Spin-Bridge Threshold, Causality Copy & EN/PT Parity Lock** - Verify 2-spin gate, causality disclosure, and parity; close release evidence

## Phase Details

### Phase 43: Persistence Wiring & Unlock Trigger

**Goal**: Returning users who completed Lesson 2 see Lesson 3 unlocked on reload, and Lesson 3 completion survives page navigation
**Depends on**: Phase 42 (v2.1 complete)
**Requirements**: EDU-70, EDU-71, EDU-73
**Success Criteria** (what must be TRUE):

1. User who completed Lesson 2 (Near-Miss) and reloads the page sees Lesson 3 (Sensory Conditioning) in an unlocked state
2. User who completes Lesson 3 and reloads the page sees Lesson 3 as completed and the curriculum counter reads 3/3
3. User who skips through Lesson 3 via the skip button has Near-Miss completion correctly persisted before skip fires
4. The reconstructed `completedLessons` array emits in curriculum-canonical order (house-edge, near-miss) not push order
5. All four Lesson 3 dialogue steps render in EN and PT with correct narrator/system roles

**Plans:** 1/1 plans complete

Plans:

- [ ] 43-01-PLAN.md — Persistence functions, fast-path replacement, completion checkpoint wiring, contract tests

### Phase 44: Spin-Bridge Threshold, Causality Copy & EN/PT Parity Lock

**Goal**: Contract and Playwright coverage confirms the 2-spin observe gate, causality disclosure, and EN/PT attribute parity — producing release evidence for all four EDU requirements
**Depends on**: Phase 43
**Requirements**: EDU-72
**Success Criteria** (what must be TRUE):

1. Contract test confirms `sensory-conditioning-observe` does not advance before 2 settled spins have been received
2. Contract test confirms `sensory-conditioning-observe` advances exactly on the second settled spin
3. Causality disclosure renders in EN and PT when the spin-triggered `sensory-conditioning-reveal` transition fires
4. `data-casinocraftz-lesson-sensory-conditioning-soon` attribute is asserted by name in the parity contract, preventing accidental removal

**Plans**: TBD

## Progress

| Phase                                                  | Milestone | Plans Complete | Status      | Completed |
| ------------------------------------------------------ | --------- | -------------- | ----------- | --------- |
| 43. Persistence Wiring & Unlock Trigger                | v2.2      | 0/1            | Complete    | 2026-04-04 |
| 44. Spin-Bridge Threshold, Causality Copy & EN/PT Lock | v2.2      | 0/TBD          | Not started | -         |

---

_Updated: 2026-04-04 — Phase 43 plan created_
