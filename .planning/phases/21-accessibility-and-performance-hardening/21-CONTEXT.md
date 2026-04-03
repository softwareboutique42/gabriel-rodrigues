# Phase 21: Accessibility and Performance Hardening - Context

**Gathered:** 2026-04-02
**Status:** Ready for planning
**Source:** /gsd:discuss-phase 21

<domain>
## Phase Boundary

Enforce motion accessibility and runtime performance guardrails for the Slots animation/sprite runtime while preserving deterministic gameplay behavior and EN/PT parity.

In scope:

- Add reduced-motion behavior for Slots runtime that respects user/system preference and keeps gameplay state readable.
- Add motion intensity tiers for presentation effects without introducing gameplay authority branching.
- Add runtime performance guardrails for animation-heavy gameplay loops (budgets, fallbacks, and deterministic degradation path).
- Keep SPA lifecycle safety, deterministic event sequencing, and observability hooks stable.

Out of scope:

- New gameplay capabilities, payout/economy rule changes, or seed/state-machine behavior changes.
- New sprite/theme feature expansion beyond guardrail/accessibility hardening.
- Broad regression lock expansion and final confidence closure (Phase 22).
- Visual style redesign unrelated to accessibility/performance goals.
  </domain>

<decisions>
## Implementation Decisions

### Authority and determinism preservation

- Accessibility/performance controls remain presentation-only overlays.
- Engine/economy/controller stay the sole authoritative gameplay sources.
- Degradation logic must not alter payout outcomes, spin acceptance rules, or deterministic event ordering.

### Reduced-motion behavior

- Slots should honor `prefers-reduced-motion` and expose equivalent gameplay feedback without animation-heavy transitions.
- Reduced-motion mode should keep state/outcome communication explicit using existing textual/runtime hooks.
- Existing global reduced-motion CSS baseline may be reused, but Slots runtime still needs explicit animation model behavior when motion is reduced.

### Motion intensity controls

- Introduce deterministic intensity tiers (for example `full`, `reduced`, `minimal`) at the runtime presentation layer.
- Intensity selection must degrade effects progressively (idle pulses, transition emphasis, celebratory reactions) without removing critical status affordances.
- EN/PT behavior parity is mandatory for every tier.

### Performance guardrails

- Define measurable runtime guardrails for active gameplay loops (frame pacing and/or long-task pressure indicators).
- On budget pressure, runtime should deterministically fall back to lower-intensity visual modes before risking interaction regressions.
- Guardrail behavior must be observable through stable machine-readable hooks for contracts/E2E assertions.

### Existing architecture compatibility

- Reuse SPA-safe mount/dispose boundaries in `src/scripts/slots/main.ts` and animation runtime orchestration.
- Preserve `data-slots-anim-*` observability strategy and timing-agnostic assertion style.
- Maintain compatibility with existing symbol-state/theme modules from Phase 20.

### Claude's Discretion

- Exact module split for motion preference resolver, intensity policy, and performance budget monitor.
- Exact thresholds and sampling windows for runtime guardrails, as long as they are deterministic and testable.
- Exact UI exposure approach for intensity control (attribute/config driven) if parity and authority boundaries are preserved.
  </decisions>

<specifics>
## Specific Ideas

- Add a reduced-motion resolver utility (media-query + runtime override) consumed by Slots animation runtime.
- Add an intensity policy layer that maps runtime visuals into tiered behavior without changing state semantics.
- Add performance-budget snapshots (for example `ok|degraded`) exposed via stable `data-slots-anim-*` attributes.
- Extend compatibility and contract coverage to assert reduced-motion parity and deterministic degradation behavior.
  </specifics>

<canonical_refs>

## Canonical References

- `.planning/ROADMAP.md`
- `.planning/REQUIREMENTS.md`
- `.planning/PROJECT.md`
- `.planning/STATE.md`
- `.planning/phases/20-animated-symbols-and-theme-variants/20-CONTEXT.md`
- `.planning/phases/20-animated-symbols-and-theme-variants/20-01-SUMMARY.md`
- `.planning/phases/20-animated-symbols-and-theme-variants/20-01-VERIFICATION.md`
- `src/scripts/slots/main.ts`
- `src/scripts/slots/animation/runtime.ts`
- `src/scripts/slots/animation/events.ts`
- `src/scripts/slots/animation/reel-timeline.ts`
- `src/scripts/slots/animation/outcome-feedback.ts`
- `src/scripts/slots/animation/symbol-states.ts`
- `src/scripts/slots/animation/theme-registry.ts`
- `src/scripts/slots/animation/theme-selection.ts`
- `src/styles/global.css`
- `src/scripts/canvas/main.ts`
- `tests/slots-animation-event-sequencing-contract.test.mjs`
- `tests/slots-symbol-states-contract.test.mjs`
- `tests/slots-theme-variants-contract.test.mjs`
- `e2e/compatibility.spec.ts`
  </canonical_refs>

<code_context>

## Existing Code Insights

### Reusable assets

- `src/scripts/slots/animation/runtime.ts`: centralized place where visual models are applied and runtime snapshots are written.
- `src/scripts/slots/main.ts`: SPA-safe lifecycle boundary for runtime mount/dispose.
- `src/styles/global.css`: existing project-level reduced-motion baseline pattern.

### Established patterns

- Runtime assertions use deterministic `data-slots-anim-*` hooks rather than timing-fragile pixel checks.
- Contract and Playwright coverage rely on state-driven assertions and EN/PT parity guarantees.
- Presentation modules avoid gameplay authority writes.

### Integration points

- Visual event stream and timeline/feedback models remain canonical sources for animation state progression.
- Theme and symbol-state snapshots from Phase 20 should be preserved while adding accessibility/performance overlays.
  </code_context>

<deferred>
## Deferred Ideas

- CI visual baseline/screenshot pipelines for expanded browser matrix (Phase 22 confidence lock).
- More aggressive cinematic celebration effects and adaptive flair packs.
- Product-level performance dashboards/telemetry beyond runtime guardrails.
  </deferred>

---

_Phase: 21-accessibility-and-performance-hardening_
_Context gathered: 2026-04-02_
