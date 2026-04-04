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
- ✅ v2.3 Sensory Effects Layer — [milestones/v2.3-ROADMAP.md](milestones/v2.3-ROADMAP.md)
- ✅ v2.5 Diagnostic Terminal Lobby Redesign — [milestones/v2.5-ROADMAP.md](milestones/v2.5-ROADMAP.md)

## Current Milestone

### v2.6 - Lobby Focus & Slots Command Center

**Goal:** Refocus each surface — the lobby becomes a clean launcher (chambers + deposit only), and the slot game becomes the command center for all analytical and educational tools via an expanded side drawer behind the `+` icon.

**Total phases:** 3  
**Starting phase:** 52

| Phase | Name | Goal | Requirements | Success Criteria |
| ----- | ---- | ---- | ------------ | ---------------- |
| 52 | Lobby Simplification | Complete ✅ | Complete | 2026-04-04 |
| 53 | Slots Side Drawer | Expand `+` into full side drawer with Analyzer, Mission Log, Settings | LBY-03, LBY-04 | — |
| 54 | State Migration & Parity | Tutorial progression and card activation work from slots; EN/PT + a11y verified | LBY-05 | — |

### Phase Details

#### Phase 52: Lobby Simplification

**Goal:** Strip the lobby to its essential launcher role — header, balance/deposit, and chamber cards only.

**Requirements:** LBY-01, LBY-02

**Success Criteria:**

1. Lobby renders as a single-column layout with no Analyzer Panel sidebar and no Mission Log accordion.
2. Chamber cards show an info (`ⓘ`) button per metric (house edge, signal, impulse) that opens a contextual explanation instead of live telemetry numbers.
3. EN/PT lobby parity maintained across the simplified layout.

**Plans:** 3/3 plans complete

Plans:
- [x] 52-01-PLAN.md — i18n strings and lobby layout restructure
- [x] 52-02-PLAN.md — EN lobby strip and info button implementation
- [x] 52-03-PLAN.md — PT lobby mirror

#### Phase 53: Slots Side Drawer

**Goal:** Transform the `+` button from a small Signal Settings dropdown into a full-height side drawer housing Analyzer Panel, Mission Log, and Settings.

**Requirements:** LBY-03, LBY-04

**Success Criteria:**

1. `+` button opens a slide-in side drawer with three sections: Analyzer (utility cards), Mission Log (curriculum + tutorial), Settings (routes, motion, theme).
2. Drawer state persists in sessionStorage; `+` toggles to `×` when open; Escape closes it.
3. EN/PT drawer parity maintained.

**Plans:** 0/2 plans complete

Plans:
- [ ] 53-01-PLAN.md — EN slots drawer architecture and section migration
- [ ] 53-02-PLAN.md — PT slots drawer mirror

#### Phase 54: State Migration & Parity

**Goal:** Confirm tutorial progression, card activation, and all effects work correctly from the slots drawer context; verify EN/PT and accessibility.

**Requirements:** LBY-05

**Success Criteria:**

1. Tutorial unlock triggers (3 spins → Probability Seer, lesson completion → Dopamine Dampener + House Edge) fire correctly from within slots.
2. Card activation from the drawer applies effects to the running game (probability overlay, dampener suppression, house edge HUD).
3. `npm run build` passes with no orphaned selectors or errors.
4. Accessibility: drawer focus trap, Escape closes, aria-labels on info buttons and drawer sections.

**Plans:** 0/1 plans complete

Plans:
- [ ] 54-01-PLAN.md — state migration audit, parity verification, build gate
