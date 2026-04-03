---
phase: 01-codebase-stabilization
plan: 01
subsystem: ui
tags: [threejs, animation, loop-seam, deterministic-motion]
requires: []
provides:
  - Deterministic, progress-based particle motion without elapsed-time accumulation
  - Normalized loop helper behavior for seam-safe wrap continuity
affects: [phase-01-seam-validation, animation-stability]
tech-stack:
  added: []
  patterns:
    [closed-form trigonometric motion from normalized loop progress, setup-time randomness only]
key-files:
  created: [e2e/particles-loop.spec.ts]
  modified: [src/scripts/canvas/animations/particles.ts, src/scripts/canvas/animations/base.ts]
key-decisions:
  - Preserve particle variety with setup-time seeds (phase/frequency/amplitude) while keeping runtime deterministic
  - Normalize loop modulo in BaseAnimation to prevent negative elapsed wrap anomalies
patterns-established:
  - 'Particles derive positions from sin/cos(progress * 2pi + seed), never accumulated velocity * elapsed terms'
  - 'Seam-critical update paths use BaseAnimation loop helpers only'
requirements-completed: [FR-1.1]
duration: 5min
completed: 2026-04-02
---

# Phase 1 Plan 01: Particle Loop Determinism Summary

**ParticlesAnimation now computes seam-safe, deterministic closed-form positions from normalized loop progress while eliminating unbounded velocity drift.**

## Performance

- **Duration:** 5 min
- **Started:** 2026-04-02T08:22:00-03:00
- **Completed:** 2026-04-02T11:26:38Z
- **Tasks:** 2
- **Files modified:** 3

## Accomplishments

- Replaced `velocities[i] * t * 60` drift terms with progress-driven closed-form sin/cos offsets in `ParticlesAnimation`.
- Preserved randomness at setup only via per-particle phase/frequency/amplitude seeds, honoring deterministic runtime constraints.
- Normalized `BaseAnimation.loopTime()` modulo behavior to improve wrap continuity for seam-critical timing consumers.

## Task Commits

Each task was committed atomically:

1. **Task 1 (TDD RED): Refactor particle motion to pure progress-based formulas** - `05faeef` (test)
2. **Task 1 (TDD GREEN): Refactor particle motion to pure progress-based formulas** - `9e1d841` (fix)
3. **Task 2: Align particle loop math with base timing helpers** - `2539a16` (fix)

## Files Created/Modified

- `e2e/particles-loop.spec.ts` - Failing-then-passing TDD guard for velocity accumulation removal and loop helper usage.
- `src/scripts/canvas/animations/particles.ts` - Deterministic per-particle motion formulas from normalized loop progress.
- `src/scripts/canvas/animations/base.ts` - Non-negative modulo normalization for loop-time helper.

## Decisions Made

- Used per-particle random seeds generated during scene setup to retain variation while ensuring deterministic runtime behavior.
- Kept seam-critical progression anchored to loop helper primitives to enforce D-01/D-02 continuity constraints.

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

- Commitlint initially rejected a malformed commit header; resolved by using a standard conventional commit header with separate body.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- FR-1.1 deterministic particle loop behavior is implemented and verified (`npm run lint`, `npm run build`).
- Particle loop math now conforms to D-01/D-02/D-03 constraints and is ready for broader Phase 1 seam validation.

---

_Phase: 01-codebase-stabilization_
_Completed: 2026-04-02_

## Self-Check: PASSED

- FOUND: .planning/phases/01-codebase-stabilization/01-01-SUMMARY.md
- FOUND: commit 05faeef
- FOUND: commit 9e1d841
- FOUND: commit 2539a16

## Validation

- Historical validation evidence is partially available from surviving session artifacts.
- Where command-by-command outputs were not preserved, this summary explicitly marks evidence as unavailable rather than inferring results.
- Backfill added in Phase 24 to satisfy milestone auditability and closure-guard requirements.
