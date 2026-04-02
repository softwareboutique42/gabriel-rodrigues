# Phase 1: Codebase Stabilization - Context

**Gathered:** 2026-04-02
**Status:** Ready for planning

<domain>
## Phase Boundary

Stabilize the existing 8 animation styles so loops are seamless, rendering is efficient, sprites support runtime recoloring, and particle visuals meet the polished quality bar. This phase does not add new styles or export features.

</domain>

<decisions>
## Implementation Decisions

### Loop Seam Validation

- **D-01:** Seam acceptance is based on deterministic progress math plus a quick visual pass.
- **D-02:** Seam strictness is "no perceptible pop" with deterministic state continuity at wrap-around.
- **D-03:** Random values are generated at setup only; per-frame animation must remain deterministic from loop progress.
- **D-04:** Verification artifact for this phase is a manual checklist in context/discussion docs (no new automated harness required in Phase 1).

### Claude's Discretion

- The exact checklist formatting and review cadence can be decided during planning as long as D-01 through D-04 are preserved.

</decisions>

<canonical_refs>

## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Phase Definition And Requirements

- `.planning/ROADMAP.md` - Phase 1 goal, success criteria, and dependency boundary.
- `.planning/REQUIREMENTS.md` - FR-1.1 through FR-1.5 and relevant non-functional constraints.
- `.planning/PROJECT.md` - Product constraints and scope guardrails.

### Research Findings

- `.planning/research/SPRITES.md` - Findings on sprite/material behavior, draw-call implications, and particle polish patterns.
- `.planning/research/BRAND_ANIMATION.md` - Motion quality guidance, loop seam risks, and polish criteria.

### Existing Implementation References

- `src/scripts/canvas/animations/base.ts` - Loop duration and loop progress helpers used across styles.
- `src/scripts/canvas/animations/particles.ts` - Current particle update logic and seam-risk area.
- `src/scripts/canvas/animations/geometric.ts` - Current shape/material usage and draw-call behavior.
- `src/scripts/canvas/icons/index.ts` - Current icon texture/material colorization behavior.
- `src/scripts/canvas/icons/draw.ts` - Procedural icon drawing functions.

</canonical_refs>

<code_context>

## Existing Code Insights

### Reusable Assets

- `BaseAnimation.loopTime()` and `BaseAnimation.loopProgress()` already provide normalized loop timing for deterministic animation updates.
- `createAnimation()` registry in `src/scripts/canvas/animations/index.ts` centralizes all 8 existing styles for uniform seam validation coverage.
- `icons/draw.ts` provides procedural icon templates that can support white-template rendering for runtime tinting.

### Established Patterns

- Animations derive from `BaseAnimation` and implement `createScene()` plus `update(elapsed, delta)`.
- Time progression is expected to run from modulo loop time (`elapsed % LOOP_DURATION`).
- Additive blending is heavily used in current styles; material choices affect final perceived loop smoothness and quality.

### Integration Points

- Phase 1 fixes land in existing animation modules under `src/scripts/canvas/animations/`.
- Icon recoloring behavior is implemented through `src/scripts/canvas/icons/`.
- No route/page contract changes are required for this phase.

</code_context>

<specifics>
## Specific Ideas

- Keep seam validation practical: deterministic formulas first, then visual confirmation across all 8 styles.

</specifics>

<deferred>
## Deferred Ideas

None - discussion stayed within phase scope.

</deferred>

---

_Phase: 01-codebase-stabilization_
_Context gathered: 2026-04-02_
