# Phase 19: Sprite Atlas Integration and UI Motion - Context

**Gathered:** 2026-04-02
**Status:** Ready for planning
**Source:** /gsd:next -> /gsd:discuss-phase 19

<domain>
## Phase Boundary

Introduce sprite-atlas-backed symbol presentation and subtle idle/UI motion polish while preserving deterministic gameplay authority and EN/PT parity.

In scope:

- Add a production-ready symbol-to-frame mapping contract from gameplay symbols to atlas frames.
- Introduce atlas loading/validation primitives for Slots runtime presentation layer.
- Integrate idle and UI transition motion behaviors that are non-blocking and deterministic-state-driven.
- Keep runtime observability stable via deterministic hooks and existing contract patterns.

Out of scope:

- Animated symbol state packs beyond baseline frame integration (Phase 20).
- Theme variant architecture and multi-theme sprite packs (Phase 20).
- Reduced-motion controls and explicit performance budget enforcement (Phase 21).
- Full regression lock expansion and visual CI hardening (Phase 22).
  </domain>

<decisions>
## Implementation Decisions

### Authority and determinism preservation

- Engine/economy remain authoritative sources of truth.
- Sprite and motion layers are projection-only and must never gate payout or transition timing.
- Phase 18 visual event flow remains the source signal for Phase 19 presentation wiring.

### Atlas integration strategy

- Keep domain symbols independent from asset frame names via adapter mapping.
- Validate atlas schema and frame availability before runtime binding.
- Ensure missing-frame handling is deterministic and non-crashing.

### UI motion scope

- Idle and UI transitions should be subtle, non-blocking, and route-stable.
- Motion must preserve EN/PT behavior parity and status clarity.
- Avoid heavy timing-sensitive effects in this phase.

### Existing architecture compatibility

- Reuse current slots animation runtime boundaries from Phase 18.
- Preserve Astro SPA lifecycle mount/dispose safety and listener cleanup patterns.
- Keep machine-readable runtime hooks stable for compatibility tests.

### Claude's Discretion

- Exact file/module split for atlas registry, symbol mapper, and motion helpers.
- Whether to wire baseline atlas rendering via DOM/CSS state classes or a lightweight renderer adapter in this phase.
- Exact idle motion intensity/curves as long as interactions remain non-blocking and deterministic.
  </decisions>

<specifics>
## Specific Ideas

- Add an atlas registry module with schema guards for required symbol frames.
- Add a symbol-frame adapter table that maps core symbols to atlas keys.
- Extend runtime observability with presentation-only hooks for atlas readiness and active symbol state.
- Add subtle idle pulse/transition cues tied to existing state flow without introducing timing brittleness.
  </specifics>

<canonical_refs>

## Canonical References

- `.planning/ROADMAP.md`
- `.planning/REQUIREMENTS.md`
- `.planning/PROJECT.md`
- `.planning/STATE.md`
- `.planning/phases/18-slots-animation-runtime-foundation/18-CONTEXT.md`
- `.planning/phases/18-slots-animation-runtime-foundation/18-01-SUMMARY.md`
- `.planning/phases/18-slots-animation-runtime-foundation/18-01-VERIFICATION.md`
- `.planning/research/slots-animation-determinism/SUMMARY.md`
- `.planning/research/slots-animation-determinism/ARCHITECTURE.md`
- `.planning/research/slots-animation-determinism/STACK.md`
- `src/scripts/slots/controller.ts`
- `src/scripts/slots/main.ts`
- `src/scripts/slots/animation/events.ts`
- `src/scripts/slots/animation/runtime.ts`
- `src/scripts/slots/animation/reel-timeline.ts`
- `src/scripts/slots/animation/outcome-feedback.ts`
- `e2e/compatibility.spec.ts`
- `tests/slots-animation-event-sequencing-contract.test.mjs`
  </canonical_refs>

<code_context>

## Existing Code Insights

### Reusable assets

- `src/scripts/slots/animation/events.ts`: immutable, typed event contract suitable for sprite/motion projection.
- `src/scripts/slots/animation/runtime.ts`: current SPA-safe orchestration and stable data hook surface.
- `src/scripts/slots/main.ts`: mount/dispose lifecycle integration point for phase additions.

### Established patterns

- Deterministic authority transitions are already isolated from presentation writes.
- Runtime observability relies on stable data attributes and non-timing-fragile checks.
- Compatibility tests emphasize state-driven assertions over frame-perfect visuals.

### Integration points

- Visual events (`spin-accepted`, `spin-resolved`, `spin-blocked`) are the canonical trigger stream for sprite/motion state.
- Existing EN/PT runtime flow should remain unchanged while visual layer quality increases.
  </code_context>

<deferred>
## Deferred Ideas

- Multi-state animated symbols and celebratory overlays tied to payout tiers.
- Theme variant tokenization and runtime theme switching.
- Reduced-motion UX controls and adaptive quality tiers.
- Broader screenshot/visual baseline strategy in CI.
  </deferred>

---

_Phase: 19-sprite-atlas-integration-and-ui-motion_
_Context gathered: 2026-04-02_
