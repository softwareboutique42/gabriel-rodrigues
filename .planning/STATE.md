---
gsd_state_version: 1.0
milestone: v2.2
milestone_name: Sensory Conditioning Content
status: executing
stopped_at: Phase 43 UI-SPEC approved
last_updated: "2026-04-04T13:49:21.404Z"
last_activity: 2026-04-04
progress:
  total_phases: 2
  completed_phases: 0
  total_plans: 1
  completed_plans: 0
  percent: 0
---

# STATE.md - Company Canvas

## Project Reference

See: .planning/PROJECT.md (updated 2026-04-04)

**Core Value:** Branded, download-ready animation in under a minute — no design tools, no agency.
**Current Focus:** Phase 43 — persistence-wiring-unlock-trigger

## Current Position

Phase: 43 (persistence-wiring-unlock-trigger) — EXECUTING
Plan: 1 of 1
**Phase:** 43 of 44 (Persistence Wiring & Unlock Trigger)
**Plan:** —
**Status:** Executing Phase 43
**Last Activity:** 2026-04-04

## Progress

```
Progress: ░░░░░░░░░░ 0%
```

Phases: 0/2 complete

## Phase Summary

| Phase    | Name                                               | Status | Goal                                                                                      |
| -------- | -------------------------------------------------- | ------ | ----------------------------------------------------------------------------------------- |
| Phase 43 | Persistence Wiring & Unlock Trigger                | ○      | Fix returning-user fast-path; write Lesson 2/3 completion to localStorage                 |
| Phase 44 | Spin-Bridge Threshold, Causality Copy & EN/PT Lock | ○      | Verify 2-spin gate, causality disclosure, parity; close release evidence for EDU-70 to 73 |

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
- [v1.9 kickoff]: Scope the next milestone to psychology curriculum expansion, not collection meta or PvP systems.
- [v1.9 kickoff]: Phase 37 introduces lesson-shell/state foundations only; new psychology content lands in later phases.
- [v1.9 kickoff]: Existing lesson-one house-edge flow remains canonical while lesson selection becomes deterministic and bounded.
- [Phase 37]: Lesson shell uses dataset-backed current/unlocked/completed lesson anchors with future lessons visible as locked previews.
- [Phase 37]: Revisit behavior stays bounded to the current unlocked lesson and does not create gameplay mutations or reward loops.
- [Phase 38]: Near-miss unlock is bounded to house-edge completion and remains shell-driven rather than economy-driven.
- [Phase 38]: Near-miss trigger logic uses observed-spin thresholds to explain perception without implying player influence over outcomes.
- [Phase 39]: Sensory-conditioning unlock is bounded to near-miss completion and stays presentation-only.
- [Phase 39]: Curriculum shell now exposes explicit progress copy stating that lessons unlock only via prior lesson completion, never spending or grind.
- [Phase 40]: Source and browser contracts now lock EN/PT curriculum datasets, completed-lesson review behavior, and anti-manipulation copy for the full three-lesson shell.
- [Phase 40]: Lesson-three skip now resolves to `sensory-conditioning-complete`, preserving lesson-scoped completion semantics.
- [Phase 41]: Casinocraftz module surface now routes to standalone `/en/slots/` and `/pt/slots/` via explicit slots-access cards instead of iframe embedding.
- [Phase 41]: Slots round JSON output is collapsed by default and reel windows render casino-style symbol labels while preserving deterministic authority boundaries.
- [Phase 41]: Maintainer documentation added for professional symbol image upgrades without touching payout/RNG logic.
- [v2.1 kickoff]: Scope this milestone to production symbol atlas delivery and parity-safe reel rendering only.
- [v2.1 kickoff]: Keep RNG, payouts, and authority modules unchanged; all changes remain presentation-only.
- [Phase 42]: Reel windows now render atlas-backed symbol assets via deterministic `data-slots-symbol` mapping while preserving controller authority boundaries.
- [Phase 42]: Compatibility contracts and EN/PT parity checks now lock symbol asset references and documentation safety guidance.
- [v2.2 kickoff]: Integration-only milestone — all Lesson 3 content is already authored; only persistence model and verification are missing.
- [v2.2 kickoff]: No FX code (neon pulse, reel glow) allowed in v2.2 — that is Phase 45-46 (v2.3).
- [v2.2 kickoff]: Three-key localStorage pattern (`ccz-tutorial-completed`, `ccz-near-miss-completed`, `ccz-lesson-sensory-completed`) extends existing precedent.

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

- None.

## Blockers / Concerns

- [Phase 44 prep]: Playwright spin injection sequencing — synchronous double-injection in `page.evaluate()` can cause state misread. Inspect existing near-miss E2E bridge helpers before extending pattern to Lesson 3 contracts.

## Session Continuity

Last session: 2026-04-04T13:41:50.503Z
Stopped at: Phase 43 UI-SPEC approved
Resume file: .planning/phases/43-persistence-wiring-unlock-trigger/43-UI-SPEC.md
