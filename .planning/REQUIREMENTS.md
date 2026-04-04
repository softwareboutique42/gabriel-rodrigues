# Requirements — Company Canvas (v2.1 Symbol Atlas Production Upgrade)

**Defined:** 2026-04-04
**Core Value:** Branded, download-ready animation in under a minute.

## v2.1 Requirements

### Symbol Visual Delivery

- [x] **VIS-62**: Slots reel windows render production symbol atlas assets mapped from deterministic symbol IDs, replacing text-first fallback presentation.

### Parity and Accessibility Guardrails

- [x] **PAR-62**: EN/PT Slots routes keep parity-safe symbol rendering behavior and preserve existing dataset/testing hooks.
- [x] **SAFE-62**: Symbol atlas upgrade remains presentation-only, keeps reduced-motion readability, and does not modify RNG/payout/economy authority.

## Deferred Beyond v2.1

### Future Expansion

- **VIS-63**: Add per-symbol micro-motion overlays and win-tier-specific reel highlight choreography.

## Out of Scope

| Feature                                                | Reason                                                                          |
| ------------------------------------------------------ | ------------------------------------------------------------------------------- |
| Real-money deposits, withdrawals, or checkout surfaces | Violates transparent zero-risk product premise.                                 |
| Dynamic odds personalization per user                  | Breaks deterministic explanation model and introduces fairness ambiguity.       |
| Locale-first rollout (EN only or PT only)              | EN/PT parity is a hard requirement, not a phased nice-to-have.                  |
| Runtime authority refactor of Slots engine             | v2.1 focuses on presentation-only symbol rendering, not core authority changes. |
| Collection meta or economy-driven unlock loops         | Breaks bounded educational and deterministic progression principles.            |

## Traceability

| Requirement | Phase    | Status   |
| ----------- | -------- | -------- |
| VIS-62      | Phase 42 | Complete |
| PAR-62      | Phase 42 | Complete |
| SAFE-62     | Phase 42 | Complete |

**Coverage:**

- v2.1 requirements: 3 total
- Mapped to phases: 3
- Unmapped: 0

---

_Requirements defined: 2026-04-04_
_Last updated: 2026-04-04 after Phase 42 completion and v2.1 closeout_
