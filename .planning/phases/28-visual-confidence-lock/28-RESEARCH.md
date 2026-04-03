# Phase 28: Visual Confidence Lock - Research

**Researched:** 2026-04-03
**Mode:** Autonomous (`/gsd:next` -> `/gsd:plan-phase 28`)

## Objective

Define the final confidence layer for the v1.6 Slots refresh so shell, effects, atmosphere, parity, and release evidence are locked without adding new presentation scope.

## Existing Surface Map

- Fast contracts already cover shell structure, EN/PT key parity, animation sequencing, motion accessibility, theme fallback, symbol states, sprite atlas readiness, deterministic gameplay, economy guards, performance guardrails, analytics hooks, and canonical routing.
- Browser compatibility already covers Projects discovery, EN/PT language switching, alias-route denial, canonical Slots runtime parity, blocked PT flow, and neon-theme query behavior.
- Phase 26 and Phase 27 introduced a larger visual surface area through cabinet zones plus effect and atmosphere datasets, but those guarantees are still spread across multiple suites rather than summarized by a final confidence-focused layer.

## Recommended Strategy

1. Add one holistic fast contract that treats the refreshed Slots visual envelope as a ship surface rather than a collection of isolated attributes.
2. Expand compatibility coverage only where it materially improves release confidence: minimal-intensity theme behavior and blocked-state analytics/readout integrity.
3. Keep all assertions machine-readable and timing-agnostic by leaning on deterministic datasets and canonical UI text rather than screenshots.
4. Reuse the existing lint + targeted contracts + compatibility + build release chain so milestone closeout remains summary-ready.

## Likely Implementation Targets

- `tests/slots-visual-envelope-contract.test.mjs`
- `e2e/compatibility.spec.ts`
- `.planning/phases/28-visual-confidence-lock/28-01-SUMMARY.md`

## Risks and Guardrails

- **Risk:** Confidence work becomes redundant or brittle.
  - **Guardrail:** Add only assertions that span multiple existing guarantees or capture ship-critical user journeys.
- **Risk:** QA phase drifts into feature work.
  - **Guardrail:** Restrict modifications to tests, validation, and planning artifacts unless a regression demands a production fix.
- **Risk:** Validation remains hard to summarize at milestone closeout.
  - **Guardrail:** Preserve the single chained gate and capture it in the phase summary.

## Planning Input Quality Check

- Scope remains tightly aligned to QA-30 and QA-31.
- The repository already exposes enough deterministic hooks to lock refreshed visuals without screenshot baselines.
- Phase 28 can reasonably complete in one plan focused on tests, compatibility, and release evidence.
