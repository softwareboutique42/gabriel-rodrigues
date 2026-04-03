# Research Summary: Deterministic Slots Sprite + Animation Architecture

**Domain:** Slots runtime presentation architecture (deterministic core + sprite/effects layer)
**Researched:** 2026-04-02
**Overall confidence:** HIGH

## Executive Summary

The existing slots runtime already has the right deterministic foundation: a pure engine, explicit state machine, serializable round result, and contract coverage. The safest expansion is not to modify those invariants, but to add a separate presentation pipeline that consumes engine events and snapshots.

Sprite atlases should be introduced as a presentation concern only. Keep domain symbols (`A`..`E`) in engine types and map them to atlas frame keys in a renderer adapter. This prevents art-pipeline churn from affecting deterministic game logic.

Animation should be modeled as layered derived state (`reels`, `symbols`, `overlays`) driven by a deterministic visual event log keyed by `spinIndex` and fixed-step ticks. Effects orchestration must use channels, priorities, and deterministic IDs so overlap behavior is stable and replayable.

Testing should remain layered: contracts own correctness and determinism, Playwright owns user-visible behavior. Add deterministic visual harness controls (clock, fixed-step, masked volatility) rather than shifting core logic verification into E2E.

## Key Findings

**Stack:** Add PixiJS 8.x for atlas/sprite ergonomics, but keep existing TypeScript deterministic engine authoritative.
**Architecture:** Event-sourced presentation projection with strict separation from simulation state.
**Critical pitfall:** Letting animation timing influence outcome or transition validity.

## Implications for Roadmap

Based on research, suggested phase structure:

1. **Phase 1: Asset and Renderer Foundation** - Introduce atlas pipeline + symbol-to-frame adapter + renderer scaffold
   - Addresses: sprite atlas ingestion and deterministic symbol rendering
   - Avoids: direct coupling of engine symbols to art frame keys

2. **Phase 2: Animation State Layers** - Add derived animation store and fixed-step update loop
   - Addresses: layered reel/symbol/overlay state ownership
   - Avoids: ad hoc timer-driven animation state mutations

3. **Phase 3: Effect Orchestration** - Implement deterministic event queue with channels/priority/cancel semantics
   - Addresses: win/near-miss/stop effects and conflict handling
   - Avoids: effect collisions and non-replayable sequencing

4. **Phase 4: Test Hardening and Visual Stability** - Extend contract + Playwright coverage with clock-controlled visual assertions
   - Addresses: stable coverage as animation complexity increases
   - Avoids: flaky CI from unconstrained animation timing

**Phase ordering rationale:**

- Atlas and renderer scaffolding must precede animation layering.
- Layering must precede orchestration to avoid baking policy into renderer internals.
- Deterministic test harness updates should land alongside orchestration to lock behavior before adding extra polish.

**Research flags for phases:**

- Phase 1: Needs strict schema validation of atlas outputs.
- Phase 2: Needs careful fixed-step loop integration with existing SPA lifecycle.
- Phase 3: Needs policy decisions on effect priority/cancellation matrix.
- Phase 4: Standard patterns exist; lower implementation risk.

## Confidence Assessment

| Area         | Confidence | Notes                                                                              |
| ------------ | ---------- | ---------------------------------------------------------------------------------- |
| Stack        | HIGH       | Backed by current Pixi and Playwright docs + current repository constraints        |
| Features     | HIGH       | Directly aligned to deterministic slots requirements and existing tests            |
| Architecture | HIGH       | Consistent with current engine/controller boundaries and fixed-step best practices |
| Pitfalls     | MEDIUM     | Some pitfalls are from cross-project field experience and game-loop references     |

## Gaps to Address

- Final decision on atlas tooling (exact CLI/tooling in build pipeline).
- Concrete effect-priority matrix (e.g., anticipation vs payout overlap behavior).
- Whether to include deterministic screenshot baselines in CI by default or only nightly.
