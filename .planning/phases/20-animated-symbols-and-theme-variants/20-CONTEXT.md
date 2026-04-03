# Phase 20: Animated Symbols and Theme Variants - Context

**Gathered:** 2026-04-02
**Status:** Ready for planning
**Source:** /gsd:discuss-phase 20

<domain>
## Phase Boundary

Add animated symbol states and at least one theme variant in the Slots presentation layer while preserving deterministic gameplay behavior and EN/PT parity.

In scope:

- Add animated symbol state support for core symbols (`idle`, `spin`, `win-react`) through shared presentation contracts.
- Introduce at least one additional visual theme variant selectable without changing gameplay authority logic.
- Keep symbol animation and theme switching projection-only, driven by existing deterministic visual/runtime events.
- Preserve stable observability hooks and SPA-safe lifecycle behavior established in Phases 18-19.

Out of scope:

- Motion accessibility controls and intensity profiles (Phase 21).
- Runtime performance budget enforcement and profiling gates (Phase 21).
- Expanded regression lock and broader browser matrix hardening (Phase 22).
- Gameplay rules/payout/payline model changes.
  </domain>

<decisions>
## Implementation Decisions

### Authority and determinism preservation

- Engine/economy modules remain the only authoritative gameplay sources.
- Symbol animation and theme systems must not mutate payout, balance, seed, or state-machine transitions.
- Presentation reacts to existing deterministic event flow (`spin-accepted`, `spin-resolved`, `spin-blocked`) and runtime snapshots.

### Animated symbol state model

- Animated state coverage targets core symbols first and uses shared state contracts (`idle`, `spin`, `win-react`) rather than symbol-specific ad hoc logic.
- Fallback behavior for missing animation frames must be deterministic and non-crashing.
- Symbol animation sequencing should remain compatible with existing atlas mapping boundaries from Phase 19.

### Theme variant architecture

- Theme variants are presentation-only packs (tokens/assets/config) with no gameplay branching.
- Theme selection should be runtime-configurable in a way that remains stable across EN/PT routes and Astro SPA navigation.
- Theme asset assumptions must be validated through deterministic contracts and stable runtime hooks.

### Existing architecture compatibility

- Reuse runtime boundaries from `src/scripts/slots/animation/runtime.ts` and current slots controller integration.
- Maintain deterministic `data-slots-anim-*` observability strategy for contract and E2E assertions.
- Preserve idempotent mount/dispose and re-navigation safety.

### Claude's Discretion

- Exact module split for symbol animation state adapters and theme registry/selector helpers.
- Exact storage mechanism for theme selection (in-memory/session-safe/local preference) as long as behavior is deterministic and non-authoritative.
- Exact symbol animation timings/easing profiles within current runtime stability constraints.
  </decisions>

<specifics>
## Specific Ideas

- Add a symbol animation state adapter that maps visual event phases to symbol animation states.
- Extend atlas contracts to include per-state frame groups (or frame sequences) per core symbol.
- Add a theme registry with at least `slots-core-v1` plus one variant and deterministic fallback to core theme.
- Expose theme/animation observability hooks for stable E2E assertions (for example active theme id and per-symbol animation state snapshots).
  </specifics>

<canonical_refs>

## Canonical References

- `.planning/ROADMAP.md`
- `.planning/REQUIREMENTS.md`
- `.planning/PROJECT.md`
- `.planning/STATE.md`
- `.planning/phases/19-sprite-atlas-integration-and-ui-motion/19-CONTEXT.md`
- `.planning/phases/19-sprite-atlas-integration-and-ui-motion/19-01-SUMMARY.md`
- `.planning/phases/19-sprite-atlas-integration-and-ui-motion/19-01-VERIFICATION.md`
- `src/scripts/slots/animation/runtime.ts`
- `src/scripts/slots/animation/symbol-frame-map.ts`
- `src/scripts/slots/animation/atlas-registry.ts`
- `src/scripts/slots/animation/events.ts`
- `src/scripts/slots/main.ts`
- `tests/slots-sprite-atlas-contract.test.mjs`
- `tests/slots-animation-event-sequencing-contract.test.mjs`
- `e2e/compatibility.spec.ts`
  </canonical_refs>

<code_context>

## Existing Code Insights

### Reusable assets

- `src/scripts/slots/animation/symbol-frame-map.ts`: deterministic domain-symbol mapping boundary.
- `src/scripts/slots/animation/atlas-registry.ts`: readiness and missing-frame contract pattern.
- `src/scripts/slots/animation/runtime.ts`: SPA-safe orchestration and runtime observability write path.

### Established patterns

- Presentation-only runtime state is asserted via stable `data-slots-anim-*` hooks.
- Contracts and compatibility E2E avoid frame-perfect timing and favor deterministic state checks.
- Runtime lifecycle is idempotent across Astro view transitions.

### Integration points

- Visual event stream is the canonical trigger for symbol animation state transitions.
- Theme variant selection must remain inside presentation runtime without authority coupling.
  </code_context>

<deferred>
## Deferred Ideas

- Motion intensity controls and reduced-motion UX surface.
- Device-tier performance quality policies and enforcement.
- Expanded celebratory effects tied to payout tiers beyond core symbol-state support.
- Visual baseline/screenshot matrix rollout in CI.
  </deferred>

---

_Phase: 20-animated-symbols-and-theme-variants_
_Context gathered: 2026-04-02_
