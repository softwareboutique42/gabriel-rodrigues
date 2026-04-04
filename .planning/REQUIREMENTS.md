# Requirements: Casinocraftz - v2.6 Lobby Focus & Slots Command Center

**Defined:** 2026-04-04
**Core Value:** Companies get a branded, download-ready animation asset in under a minute - no design tools, no agency, no waiting.

## v2.6 Requirements

Requirements for milestone v2.6. Each maps to roadmap phases 52–54.

### Lobby Focus & Slots Command Center

- [x] **LBY-01**: User sees the lobby as a clean launcher — header, wallet HUD (balance + deposit), and chamber cards only. No Analyzer Panel sidebar, no Mission Log accordion.
- [x] **LBY-02**: User can tap an info (`ⓘ`) button on each chamber card metric (house edge, signal, impulse) to read a contextual explanation of what that metric means and what it is based on.
- [ ] **LBY-03**: User can open a full-height side drawer from the `+` button in the slot game, containing three sections: Analyzer Panel (utility cards), Mission Log (curriculum + tutorial), and Settings (routes, motion, theme).
- [ ] **LBY-04**: Drawer state persists across navigation; `+` toggles to `×` when open; Escape closes the drawer; focus is trapped inside while open.
- [ ] **LBY-05**: Tutorial progression (unlock triggers, card activation effects, dampener state) works correctly from within the slots drawer context; EN/PT parity and accessibility checks pass; `npm run build` is clean.

## Future Requirements

Deferred to future milestones. See .planning/FUTURE-MILESTONES.md.

### Slots Expansion Tracks

- See FUTURE-MILESTONES.md for BJ-_ and RL-_ milestone families

## Out of Scope

| Feature | Reason |
|---------|--------|
| New tutorial lesson curriculum content | v2.6 reorganizes delivery surfaces, not educational narrative scope |
| New payment/export flows | milestone focus is lobby simplification and slots command center |
| Slots RNG/payout authority changes | v2.6 targets UI architecture only |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| LBY-01 | Phase 52 | Complete |
| LBY-02 | Phase 52 | Complete |
| LBY-03 | Phase 53 | Pending |
| LBY-04 | Phase 53 | Pending |
| LBY-05 | Phase 54 | Pending |

**Coverage:**

- v2.6 requirements: 5 total
- Mapped to phases: 5
- Unmapped: 0 ✓

---
_Requirements defined: 2026-04-04_
_Last updated: 2026-04-04 after v2.6 milestone initialization_
