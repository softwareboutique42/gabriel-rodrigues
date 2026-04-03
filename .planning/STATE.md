---
gsd_state_version: 1.0
milestone: v1.8
milestone_name: deterministic-learning-loop-expansion
status: active
stopped_at: Completed Phase 36 plan 01
last_updated: '2026-04-03T20:20:00.000Z'
last_activity: 2026-04-03
progress:
  total_phases: 4
  completed_phases: 4
  total_plans: 4
  completed_plans: 4
  percent: 100
---

# STATE.md - Company Canvas

## Project Reference

See: .planning/PROJECT.md (updated 2026-04-03)

**Core Value:** Branded, download-ready animation in under a minute — no design tools, no agency.
**Current Focus:** v1.8 archived and documented — waiting for clean commit boundary to create release tag

## Current Position

**Phase:** Phase 36 - Confidence Lock and Release Evidence
**Plan:** 36-01
**Status:** Completed, ready for milestone closure
**Last Activity:** 2026-04-03

## Progress

```
Progress: ██████████ 100%
```

Phases: 4/4 complete

## Phase Summary

| Phase    | Name                                             | Status | Goal                                                                        |
| -------- | ------------------------------------------------ | ------ | --------------------------------------------------------------------------- |
| Phase 33 | Bridge and Authority Hardening                   | ✓      | Stabilize deterministic bridge contracts and authority boundaries           |
| Phase 34 | Learning Loop Clarity and Bounded Progression UX | ✓      | Improve transition clarity and bounded progression understanding            |
| Phase 35 | EN/PT and Host-Mode Parity Matrix Lock           | ✓      | Lock locale and host-mode parity for v1.8 surfaces                          |
| Phase 36 | Confidence Lock and Release Evidence             | ✓      | Finalize anti-monetization guardrails and release evidence confidence gates |

## Key Decisions

| Decision                        | Rationale                                     | Outcome                                     |
| ------------------------------- | --------------------------------------------- | ------------------------------------------- |
| Preset style library            | Predictable quality, faster v1                | ✓ Confirmed                                 |
| Browser-side MP4 capture        | Avoids server infra                           | ✓ Confirmed (MediaRecorder + WebCodecs)     |
| Industry + mood as style axes   | Deterministic, expressive                     | ✓ Confirmed — requires Claude schema change |
| Free preview / paid export      | Maximizes conversion                          | ✓ Confirmed — Stripe already wired          |
| Fix regressions before features | Loop seam + draw calls corrupt all downstream | ✓ Phase 1 locks this in                     |
| Phase 5 parallel with 3-4       | New styles don't depend on export             | ✓ Dependency graph allows this              |

## Decisions

- [Phase 01]: Geometric animation now uses palette-indexed MeshBasicMaterial pooling to satisfy FR-1.2 without per-shape material churn.
- [Phase 01]: Seam-sensitive geometric transforms were rewritten as progress-driven closed-form formulas to preserve D-01/D-02/D-03 continuity.
- [Phase 18]: Controller emits immutable visual event snapshots at accepted/resolved/blocked authority checkpoints.
- [Phase 18]: Runtime observability relies on deterministic data-slots-anim-\* hooks, including monotonic sequence counter.
- [Phase 19]: Symbol-to-frame mapping is presentation-only, deterministic, and isolated from gameplay authority.
- [Phase 19]: Runtime now publishes atlas readiness and idle-motion snapshots for EN/PT compatibility assertions.
- [Phase 20]: Symbol-state projection (`idle`, `spin`, `win-react`) is deterministic and event-derived with no gameplay mutation path.
- [Phase 20]: Theme selection resolves presentation-only overlays with deterministic query/dataset/default fallback order.
- [Phase 21-accessibility-and-performance-hardening]: Motion policy resolves deterministically via query->dataset->default while preserving presentation-only boundaries.
- [Phase 21-accessibility-and-performance-hardening]: Performance fallback progression remains bounded and deterministic with recover-sample hysteresis.
- [Phase 21-accessibility-and-performance-hardening]: Accessibility/performance assertions rely on stable data-slots-anim-\* snapshots across EN/PT routes.
- [Phase 27-effects-and-atmosphere-pass]: Runtime effect and atmosphere datasets are derived from timeline, feedback, and theme snapshots without authority drift.
- [Phase 27-effects-and-atmosphere-pass]: Neon atmosphere overrides remain presentation-only and preserve canonical route behavior.
- [v1.7 kickoff]: The first tutorial lesson will focus on house edge.
- [v1.7 kickoff]: AI cards start as utility tools, not a battle system.
- [v1.7 kickoff]: Educational delivery should be hybrid, with narrative framing plus direct system explanations.
- [v1.7 kickoff]: Phase 30 and Phase 31 are intended to run in parallel after Phase 29 stabilizes the host shell.
- [Phase 31-house-edge-tutorial-and-utility-card-systems]: Tutorial/card modules remain authority-isolated from slots runtime internals.
- [Phase 31-house-edge-tutorial-and-utility-card-systems]: Play-and-observe progression advances only via ccz:spin-settled bridge events from spin-resolved visuals.
- [Phase 31-house-edge-tutorial-and-utility-card-systems]: Casinocraftz tutorial root datasets are first-class compatibility anchors for EN/PT deterministic assertions.
- [Phase 33]: parseSpinSettledBridgeEvent exported for testability; source-reading tests match project pattern
- [Phase 33]: Legacy unversioned bridge payloads accepted backward-compatibly (version === undefined)

## Performance Metrics

| Phase        | Plan  | Duration  | Tasks   | Files      | Completed  |
| ------------ | ----- | --------- | ------- | ---------- | ---------- |
| 29           | 29-01 | 1 session | 3       | 10+        | 2026-04-03 |
| 30           | 30-01 | 1 session | 3       | 9+         | 2026-04-03 |
| 30           | 30-02 | 1 session | 3       | 3+         | 2026-04-03 |
| 31           | 31-01 | 6min      | 3       | 11         | 2026-04-03 |
| Phase 33 P01 | 35    | 4 tasks   | 7 files | 2026-04-03 |
| Phase 34 P01 | 35    | 3 tasks   | 7 files | 2026-04-03 |
| Phase 35 P01 | 20    | 3 tasks   | 1 file  | 2026-04-03 |
| Phase 36 P01 | 15    | 3 tasks   | 1 file  | 2026-04-03 |

## Pending Todos

- Commit milestone closure artifacts and create release tag `v1.8` on the finalized commit.

## Blockers / Concerns

Milestone release tagging is blocked until the working tree is committed/clean; current repository has multiple modified and untracked files.

## Session Continuity

Last session: 2026-04-03T14:45:49.511Z
Stopped at: Completed 33-01-PLAN.md
Stopped at: Gathered Phase 29 context
Stopped at: Planned Phase 29 plan 01
Stopped at: Completed Phase 29 plan 01
Stopped at: Planned Phase 30 plan 01
Stopped at: Completed Phase 30 plan 01
Stopped at: Planned Phase 30 plan 02
Stopped at: Completed Phase 30 plan 02
Stopped at: Discussed Phase 31 context (auto)
Stopped at: Planned Phase 31 plan 01
Stopped at: Discussed Phase 32 context (auto)
Stopped at: Planned Phase 32 plan 01
Stopped at: Completed 32-01-PLAN.md
Stopped at: Completed Phase 32
Stopped at: Audited v1.7 milestone (passed)
Stopped at: Completed milestone v1.7
Stopped at: Started v1.8 milestone definition
Stopped at: Discussed Phase 33 context (auto)
Stopped at: Planned Phase 33 plan 01
Stopped at: Discussed Phase 36 context (auto)
Stopped at: Planned Phase 36 plan 01
Stopped at: Completed Phase 36 plan 01
Resume file: None
