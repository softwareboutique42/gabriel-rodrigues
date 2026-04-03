# Phase 30: Slots Integration and Improvement Pass - Context

**Gathered:** 2026-04-03
**Status:** Ready for planning
**Source:** Autonomous continuation after Phase 29 completion

## Assumptions

- Phase 29 already established canonical `/en/casinocraftz/` and `/pt/casinocraftz/` host routes.
- Standalone Slots routes remain authoritative and must stay regression-safe.
- Phase 30 should integrate Slots into Casinocraftz with minimal runtime ownership risk.

## Current Baseline

- Slots runtime currently mounts on `#slots-shell-root` and is lifecycle-safe for SPA transitions.
- Casinocraftz host pages currently provide framing only and link out to standalone Slots.
- Compatibility contracts already enforce route parity, canonical pathing, and alias deny-lists.

## Candidate Scope

- Embed Slots as module one inside Casinocraftz via canonical EN/PT host pages.
- Add deterministic host-mode hooks in Slots so embedded usage is machine-verifiable.
- Improve educational clarity for house edge and manipulation cues in host-mode presentation.
- Preserve standalone Slots behavior and route parity.

## Risks

- Integration can introduce duplicated runtime mounts or DOM conflicts.
- Embedded usage can drift from deterministic parity if host-mode is not explicit.
- Copy and UI can over-index on casino theater and dilute educational intent.

## Constraints

- Preserve canonical routes and language parity.
- Keep runtime authority in existing Slots controller/animation stack.
- Ensure no monetization drift and keep zero-risk framing explicit.

## Verification Intent

- Add source-level contracts for embedded Slots host integration in EN/PT.
- Add browser-level compatibility checks for Casinocraftz module embedding and route parity.
- Re-run targeted contracts, compatibility journeys, and production build.
