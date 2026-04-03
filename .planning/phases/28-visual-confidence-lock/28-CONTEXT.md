# Phase 28: Visual Confidence Lock - Context

**Gathered:** 2026-04-03
**Status:** Ready for planning
**Source:** /gsd:next autonomous routing after Phase 27 completion

## Assumptions

- Phase 28 should focus on confidence and release evidence, not new visual features.
- The visual-state surface introduced in Phases 26 and 27 is now broad enough that regression risk is highest in contracts, parity, and ship-gate consistency.
- Canonical EN/PT Slots routes and deterministic gameplay authority remain the source of truth; QA should validate those surfaces rather than add alternate code paths.

## Current Baseline

- Phase 26 locked the cabinet shell structure, stable gameplay anchors, and EN/PT shell parity.
- Phase 27 added deterministic effect and atmosphere datasets plus theme-aware browser coverage for charge, sustain, win, loss, blocked, and neon-theme states.
- Current automated evidence already includes lint, targeted Node contracts, Playwright compatibility journeys, and Astro build, but that coverage is split across multiple suites and phase-specific assertions.
- Planning artifacts for v1.6 now have execution summaries for shell polish and effects, so the remaining gap is a final confidence layer that makes refreshed Slots visuals easier to audit and ship.

## Candidate Scope

- Add or tighten contracts around the full visual envelope so shell structure, effect states, theme atmosphere, and canonical route behavior regress visibly in fast tests.
- Extend compatibility coverage where current assertions are still too narrow for visual confidence, especially around parity-safe state transitions and shipping-critical selectors.
- Normalize the release evidence path for v1.6 so summary-ready validation is easy to reproduce during milestone closeout.

## Risks

- Adding redundant tests without clear coverage goals can slow the suite without materially improving confidence.
- QA work can drift into implementation churn if assertions are not scoped to stable, machine-readable contracts.
- Overly brittle checks can block valid visual changes if they encode incidental styling rather than durable surface guarantees.

## Constraints

- Reuse the existing deterministic `data-slots-*` and `data-slots-anim-*` contracts wherever possible.
- Keep browser validation timing-agnostic and avoid screenshot-only approval as the primary confidence mechanism.
- Preserve EN/PT parity, reduced-motion behavior, and canonical route expectations throughout the QA layer.

## Verification Intent

- Phase 28 should end with a ship-ready evidence path for refreshed Slots visuals using lint, targeted contracts, compatibility checks, and build.
- Contracts should make it obvious when shell, effect, theme, or parity surfaces regress.
- The resulting validation story should be concise enough to feed milestone completion without manual log spelunking.
