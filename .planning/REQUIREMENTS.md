# Requirements — Company Canvas (v1.8 Deterministic Learning Loop Expansion)

**Defined:** 2026-04-03
**Core Value:** Branded, download-ready animation in under a minute.

## v1.8 Requirements

### Bridge and Authority Hardening

- [x] **BRG-50**: Slots-to-tutorial bridge events are versioned and backward-compatible so host integration remains deterministic across route modes.
- [x] **BRG-51**: Tutorial and card layers remain presentation-only and cannot mutate Slots gameplay authority, economy, payout, or RNG paths.

### Learning Loop Clarity and Progression UX

- [ ] **LEARN-50**: Users receive deterministic step guidance that explains why a tutorial transition occurred after each relevant spin sequence.
- [ ] **LEARN-51**: Tutorial recap and replay prompts are available in-shell without introducing new gameplay mechanics.
- [ ] **PROG-50**: Starter-card progression remains bounded and transparent with clear lock/unlock state explanations.

### Parity and Host Integration

- [ ] **PAR-50**: EN/PT copy, datasets, and interaction outcomes stay parity-locked across embedded and standalone Slots host modes.
- [ ] **PAR-51**: Compatibility checks explicitly validate host-mode matrix behavior for Casinocraftz embed and standalone routes.

### Confidence and Release Guardrails

- [ ] **SAFE-50**: Anti-monetization deny-list and zero-risk framing remain enforced by source contracts and browser checks.
- [ ] **SAFE-51**: Release verification captures deterministic contracts, targeted compatibility checks, lint, and build evidence for v1.8 changes.

## v2+ Requirements (Deferred)

### Future Expansion

- **EDU-60**: Multi-lesson psychology curriculum (near-miss deep dive and sensory conditioning progression trees).
- **SYS-60**: Collection meta or PvP card mechanics beyond bounded utility-card progression.

## Out of Scope

| Feature                                                | Reason                                                                    |
| ------------------------------------------------------ | ------------------------------------------------------------------------- |
| Real-money deposits, withdrawals, or checkout surfaces | Violates transparent zero-risk product premise.                           |
| Dynamic odds personalization per user                  | Breaks deterministic explanation model and introduces fairness ambiguity. |
| Locale-first rollout (EN only or PT only)              | EN/PT parity is a hard requirement, not a phased nice-to-have.            |
| Runtime authority refactor of Slots engine             | v1.8 extends learning clarity, not gameplay authority architecture.       |

## Traceability

| Requirement | Phase    | Status   |
| ----------- | -------- | -------- |
| BRG-50      | Phase 33 | Complete |
| BRG-51      | Phase 33 | Complete |
| LEARN-50    | Phase 34 | Pending  |
| LEARN-51    | Phase 34 | Pending  |
| PROG-50     | Phase 34 | Pending  |
| PAR-50      | Phase 35 | Pending  |
| PAR-51      | Phase 35 | Pending  |
| SAFE-50     | Phase 36 | Pending  |
| SAFE-51     | Phase 36 | Pending  |

**Coverage:**

- v1.8 requirements: 9 total
- Mapped to phases: 9
- Unmapped: 0

---

_Requirements defined: 2026-04-03_
_Last updated: 2026-04-03 after v1.8 milestone kickoff_
