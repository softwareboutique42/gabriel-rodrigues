# Requirements: Casinocraftz — v2.3 Sensory Effects Layer

**Defined:** 2026-04-04
**Core Value:** Companies get a branded, download-ready animation asset in under a minute — no design tools, no agency, no waiting.

## v2.3 Requirements

Requirements for milestone v2.3. Each maps to roadmap phases 45–46.

### Sensory Effects

- [ ] **FX-70**: Win outcomes trigger visible celebration effect (neon pulse, reel glow)
- [x] **FX-71**: Dopamine Dampener card suppresses win-celebration effects when active
- [ ] **FX-72**: Effects system respects `prefers-reduced-motion` and motion-policy guardrails
- [x] **FX-73**: EN/PT parity for effects system

## Future Requirements

Deferred to future milestones. See `.planning/FUTURE-MILESTONES.md`.

### Blackjack (v2.4–v2.8)

- See FUTURE-MILESTONES.md for BJ-10 through BJ-53

### Roulette (v2.9–v2.13)

- See FUTURE-MILESTONES.md for RL-10 through RL-53

## Out of Scope

| Feature                                         | Reason                                                                    |
| ----------------------------------------------- | ------------------------------------------------------------------------- |
| Gameplay authority changes            | Deterministic authority boundary preserved; all changes remain presentation-only |
| New curriculum lessons                | v2.3 focuses on effect feedback, not new educational lesson authoring           |
| New economy or payout rules           | Effects layer must not touch slots RNG, payouts, or wallet logic                |

## Traceability

Which phases cover which requirements. Updated during roadmap creation.

| Requirement | Phase    | Status  |
| ----------- | -------- | ------- |
| FX-70       | Phase 45 | Pending |
| FX-71       | Phase 46 | Complete |
| FX-72       | Phase 45 | Pending |
| FX-73       | Phase 46 | Complete |

**Coverage:**

- v2.2 requirements: 4 total
- Mapped to phases: 4
- Unmapped: 0 ✓

---

_Requirements defined: 2026-04-04_
_Last updated: 2026-04-04 after v2.2 milestone closeout_
