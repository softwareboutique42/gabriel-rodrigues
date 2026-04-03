# Phase 32: Casinocraftz Integration Confidence Lock - Context

**Gathered:** 2026-04-03
**Status:** Ready for planning
**Source:** Auto-mode discuss context after Phase 31 completion

## Locked Decisions

- Phase 32 is a confidence-lock phase only. No net-new gameplay, economy, tutorial-step, or card-mechanic features are in scope.
- Canonical routes remain authoritative: /en/casinocraftz/, /pt/casinocraftz/, embedded /{lang}/slots/?host=casinocraftz, and standalone /{lang}/slots/.
- Tutorial and starter-card systems from Phase 31 stay authority-isolated from Slots internals.
- Play-and-observe progression remains driven by ccz:spin-settled bridge events from spin-resolved visuals.
- Compatibility anchors on machine-readable datasets remain first-class release contracts.
- Release confidence requires evidence across contracts, targeted browser checks, lint, and production build.

## User Constraints and Non-Negotiables

- Keep zero-risk, anti-gambling educational framing explicit.
- Preserve deterministic authority boundaries: tutorial/cards/presentation layers must not mutate Slots gameplay authority, RNG, payout, or state-machine internals.
- Preserve EN/PT parity across routes, host embedding behavior, tutorial/card surfaces, and machine-readable datasets.
- Keep scope tight to integration validation and release evidence capture.
- Avoid route alias drift and avoid introducing new runtime ownership surfaces.

## In Scope (Confidence Lock Only)

- Contract hardening for integrated Casinocraftz shell + embedded Slots + tutorial + starter-card loop.
- EN/PT compatibility assertions for canonical route parity, embedded host parity, and tutorial progression parity.
- Deterministic runtime compatibility checks for standalone and embedded Slots states used by integrated flow.
- Release evidence collection for the integrated surface: lint, targeted tests, browser checks, and build artifacts/log references.
- Reconciliation checks ensuring Phase 30 and Phase 31 outputs compose into one stable flow without hook drift.

## Deferred / Out of Scope

- New tutorial beats, new cards, new card effects, or redesign of progression logic.
- Any gameplay authority changes (engine behavior, RNG, payout tables, economy rules, spin lifecycle semantics).
- New monetization systems, real-money flows, microtransactions, or PvP/collection expansion.
- Broad visual redesign or non-critical UX expansion unrelated to integration confidence.
- New route families or URL scheme changes beyond existing canonical surfaces.

## Auto-Mode Gray-Area Defaults

- Prefer extending existing contract and compatibility suites over introducing new test frameworks.
- Prefer deterministic, machine-readable assertions over screenshot or pixel-diff checks.
- Prefer targeted high-signal checks for integrated risk points instead of broad exploratory additions.
- Treat pre-existing lint warnings outside this phase scope as non-blocking unless they affect integrated Casinocraftz confidence.
- Use current chromium-based compatibility coverage as the primary browser lock unless phase planning explicitly broadens the matrix.

## Concrete Verification Intent

- Source contracts:
  - Keep tutorial/card boundary assertions intact (including no slots imports in card module).
  - Keep canonical embed host contracts and parity contracts for EN/PT surfaces.
  - Keep deterministic hook and route mapping invariants machine-verifiable.
- Browser compatibility:
  - Validate embedded Casinocraftz host parity in EN/PT, including seed/state visibility and clean runtime error surface.
  - Validate tutorial zones, starter-card tray presence, and deterministic 3-spin play-and-observe progression to probability-reveal in EN/PT.
  - Validate standalone Slots runtime compatibility still publishes expected machine-readable state envelope in EN/PT.
- Release chain evidence:
  - Run targeted node contract tests for integration boundaries and parity.
  - Run targeted Playwright compatibility specs for Casinocraftz + tutorial + slots-runtime invariants.
  - Run lint and production build, then record outcomes as phase release evidence.

## Explicit Preservation Note

Phase 32 must preserve deterministic authority boundaries and EN/PT parity as release gates, not best-effort goals. Any confidence-lock change that weakens those guarantees is out of scope and must be deferred to a dedicated feature phase.
