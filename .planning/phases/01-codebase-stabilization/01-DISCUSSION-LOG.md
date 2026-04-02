# Phase 1: Codebase Stabilization - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md - this log preserves the alternatives considered.

**Date:** 2026-04-02
**Phase:** 01-codebase-stabilization
**Areas discussed:** Loop seam validation approach

---

## Loop Seam Validation

### Primary acceptance gate

| Option                           | Description                                                                         | Selected |
| -------------------------------- | ----------------------------------------------------------------------------------- | -------- |
| Deterministic math + visual pass | Use progress-based formulas as source of truth and confirm with quick human review. | ✓        |
| Visual pass only                 | Rely on manual eyeballing without explicit deterministic checks.                    |          |
| Automated visual diff first      | Build screenshot/video diff gate now and treat manual review as secondary.          |          |
| You decide                       | Let Claude choose the most pragmatic option for Phase 1.                            |          |

**User's choice:** Deterministic math + visual pass
**Notes:** Deterministic progress-based behavior is required and then visually confirmed.

### Seam strictness

| Option                                                    | Description                                                   | Selected |
| --------------------------------------------------------- | ------------------------------------------------------------- | -------- |
| No perceptible pop + deterministic state continuity       | Visually seamless and computed from loop progress each frame. | ✓        |
| Exact numeric equality at t=0 and t=12 for all properties | Hard equality across every animated property.                 |          |
| Best effort visual smoothness                             | Allow small visible discontinuities if performance is better. |          |
| You decide                                                | Let Claude choose the strictness level.                       |          |

**User's choice:** No perceptible pop + deterministic state continuity
**Notes:** Visual quality is the governing gate while preserving deterministic continuity.

### Randomization policy

| Option                                                   | Description                                                     | Selected |
| -------------------------------------------------------- | --------------------------------------------------------------- | -------- |
| Randomize once at setup, animate deterministically after | No per-frame stochastic drift; loop is purely progress-based.   | ✓        |
| Keep per-frame random perturbations                      | Allow random jitter during updates even if seam gets harder.    |          |
| Introduce seeded RNG everywhere now                      | Refactor all random setup to deterministic seeds in this phase. |          |
| You decide                                               | Let Claude select the policy.                                   |          |

**User's choice:** Randomize once at setup, animate deterministically after
**Notes:** Avoid per-frame stochastic updates that can break seam continuity.

### Verification artifact level

| Option                                      | Description                                                         | Selected |
| ------------------------------------------- | ------------------------------------------------------------------- | -------- |
| Manual checklist in discussion/context only | Capture expected checks in docs, no new automated test harness now. | ✓        |
| Add automated test harness now              | Create explicit seam regression tests as part of Phase 1 work.      |          |
| Lightweight script + manual review          | Add a small local script for spot checks, but no CI gating yet.     |          |
| You decide                                  | Let Claude pick the verification artifact level.                    |          |

**User's choice:** Manual checklist in discussion/context only
**Notes:** Keep phase velocity high and reserve harness work for a later phase if needed.

---

## Claude's Discretion

- Checklist formatting details and sequencing are left to planning.

## Deferred Ideas

- None.
