---
phase: 6
type: research
date: 2026-04-02
requirements_covered:
  - PACK-01
  - PACK-02
  - PACK-03
---

# Phase 6 Research: Vertical Style Pack Foundation

## Current State

### Planning and scope baseline

- Phase 6 goal in roadmap: add vertical-specific presets and deterministic routing coverage while preserving loop and quality contracts.
- Phase 6 requirements: PACK-01, PACK-02, PACK-03.
- Roadmap success criteria requires:
  - 3+ new presets available in selector and rendering correctly.
  - Seam-safe loop behavior at 12 seconds.
  - Deterministic mapping for at least 2 additional categories.
  - Stability of existing mappings.

### Existing canvas architecture relevant to Phase 6

- Deterministic routing is already centralized in src/scripts/canvas/style-selector.ts using:
  - V1_STYLE_MATRIX / V2_STYLE_MATRIX.
  - V1_MOOD_TIE_BREAKER / V2_MOOD_TIE_BREAKER.
- Runtime normalization already enforces deterministic override in src/scripts/canvas/config-normalization.ts:
  - Incoming AI animationStyle is overwritten by selectAnimationStyle(...).
- Style registry is centralized in src/scripts/canvas/animations/index.ts and types in src/scripts/canvas/types.ts.
- Version model (and available styles per version) is centralized in src/scripts/canvas/versions.ts.
- Export path in src/scripts/canvas/export.ts has duplicated style-specific inline animation code and must remain consistent with runtime behavior when adding style-driven features.

### Existing quality and loop contracts

- Loop contract is codified in src/scripts/canvas/animations/base.ts with LOOP_DURATION = 12 and loopProgress(...).
- Quality profile hooks are centralized in src/scripts/canvas/quality-profiles.ts and consumed by animation classes.
- Regression tests are currently string-contract based in tests/animation-quality-contract.test.mjs and tests/quality-profiles.test.mjs.
- Worker schema and sanitization enforce shared style/category enums in workers/company-api/src/index.ts.

### Project constraints (from CLAUDE.md)

- No new framework/library required for this phase (stay within Astro + Three.js + current test/tooling stack).
- Client scripts must follow Astro SPA navigation lifecycle patterns.
- Keep EN/PT page parity when UI markup changes are introduced.
- Node baseline: >= 22.12.0.

## Implementation Strategy

### Primary recommendation

Implement Phase 6 as a preset layer on top of existing animation styles, not as brand-new rendering engines. This satisfies PACK-01 quickly, preserves existing loop/quality guarantees, and reduces regression risk.

### Why preset layer is preferred

- Existing code already supports deterministic style routing and stable 12-second loop helpers.
- Adding three entirely new animation engines would duplicate logic in both runtime classes and export.ts inline code, significantly increasing seam-risk and drift-risk.
- Vertical presets can still be distinct by combining:
  - Existing animationStyle.
  - Deterministic parameter overrides (speed/density/complexity).
  - Optional visualElements defaults.
  - Preset naming and selector exposure.

### Proposed deterministic routing matrix expansion

- Keep all current V1 and V2 mappings intact as baseline (no remap of existing categories by default).
- Add at least 2 additional IndustryCategory values and route them deterministically to new preset defaults.
- Recommended new categories (concrete proposal):
  - education
  - hospitality
- Routing principle:
  - Existing categories keep current output unless explicitly opted into new presets.
  - New categories map to vertical presets first, with mood tie-breaker only where needed.
- If product wants zero taxonomy expansion, fallback approach is to keep current category enum and remap at least 2 existing categories to new preset defaults behind explicit test snapshots.

### Recommended vertical preset pack (minimum for PACK-01)

Define 3 new vertical preset IDs mapped to existing stable styles:

- education-story: base style narrative, medium density, lower complexity for readability.
- hospitality-orbit: base style orbit, smoother speed/intensity for premium feel.
- commerce-signal: base style signal, moderate density and stronger timing cadence.

These IDs should be selector-visible and deterministic-route targets; runtime still instantiates existing classes.

## File-Level Changes

### 1) Shared types and contracts

- src/scripts/canvas/types.ts
  - Add preset identifier type (for example AnimationPresetId) and include optional presetId in CompanyConfig.
  - If category expansion is approved, extend IndustryCategory union with education and hospitality.

### 2) Deterministic routing and matrix

- src/scripts/canvas/style-selector.ts
  - Preserve existing matrix constants unchanged for regression stability.
  - Add preset-routing structure (version + category + mood -> presetId).
  - Keep deterministic selection pure and side-effect free.
  - Ensure fallback chain remains deterministic: tie-breaker -> matrix -> safe default.

### 3) Normalization boundary

- src/scripts/canvas/config-normalization.ts
  - Resolve preset deterministically from version/industryCategory/mood.
  - Continue overwriting animationStyle from deterministic selector (do not trust worker suggestion).
  - Apply preset parameter overrides in normalization so renderer/export/share paths receive the same resolved config.

### 4) Version and selector surface

- src/scripts/canvas/versions.ts
  - Add preset metadata grouped by version and vertical (label/description/base style).
  - Keep legacy style arrays for compatibility; append preset declarations in same module to avoid fragmentation.
- src/scripts/canvas/main.ts
  - Add preset selector wiring (populate options, include selected preset during generation/fetch flow).
  - Update info panel to display resolved preset label plus base style.
- src/pages/en/canvas/index.astro and src/pages/pt/canvas/index.astro
  - Add selector control for presets (required EN/PT parity).

### 5) Animation and export consistency

- src/scripts/canvas/animations/index.ts
  - No new class required if using preset layer over existing styles.
- src/scripts/canvas/export.ts
  - Ensure export receives normalized preset-resolved config and does not bypass deterministic overrides.
  - If presetId impacts textual overlays or defaults, mirror logic in export code path.

### 6) Worker schema and sanitization

- workers/company-api/src/index.ts
  - If IndustryCategory expands, update:
    - prompt schema enum text.
    - VALID_INDUSTRY_CATEGORIES.
    - sanitizeIndustryCategory.
  - Keep animationStyle as best-effort only (current rule already correct).

### 7) Regression and contract tests

- tests/animation-quality-contract.test.mjs
  - Add assertions for:
    - new preset identifiers in shared contracts.
    - deterministic matrix includes new category routes.
    - existing style matrix entries remain present.
  - Add explicit “stability locks” for current mappings that must not change.
- tests/quality-profiles.test.mjs
  - No new structure required unless preset overrides add new quality constants.
- Optional new test file: tests/style-selector-matrix-contract.test.mjs
  - Snapshot-like contract for deterministic routing matrix coverage and fallback behavior.

## Risk Mitigations

### Risk: deterministic matrix regression for existing categories

Mitigation:

- Add explicit tests asserting legacy mapping values remain unchanged for tech/finance/health/retail/creative/food/other in both base and mood tie-breaker paths.
- Require targeted test run before merge.

### Risk: loop seam regressions when presets change timing

Mitigation:

- Do not change LOOP_DURATION.
- Restrict preset overrides to bounded speed/density/complexity ranges already in use.
- Require manual visual seam check at 0s/12s/24s for each new preset.

### Risk: runtime/export behavior drift

Mitigation:

- Route both runtime and export through normalized config structure.
- Add contract assertion that export path still consumes normalized animationStyle and quality constants.

### Risk: worker/client enum mismatch

Mitigation:

- Update shared category/style enum literals in both client and worker in same change set.
- Add tests that assert worker schema strings include any newly introduced categories.

### Risk: i18n parity drift in selector UI

Mitigation:

- Add EN/PT selector controls in same PR and verify translated labels/placeholder keys exist for both locales.

## Validation Plan

### Fast contract checks (primary)

- Run:
  - node --test tests/animation-quality-contract.test.mjs
  - node --test tests/quality-profiles.test.mjs
- Add and run (if created):
  - node --test tests/style-selector-matrix-contract.test.mjs

### Integration sanity checks

- npm run build
- Manual UI smoke on both routes:
  - /en/canvas/
  - /pt/canvas/

### Deterministic routing matrix verification

- Verify at least 2 additional categories resolve to new presets in deterministic selector.
- Verify existing category outputs remain stable by direct matrix assertions.
- Verify unknown/invalid category still falls back to other path deterministically.

### Loop and quality regression safeguards

- For each new preset, confirm seamless cycle continuity at 12-second boundaries.
- Confirm no regression in quality profile hooks (mood presets, blending/profile behavior, particle budget helpers).
- Confirm export fallback path still functions after preset selection.

## Acceptance Criteria (PACK-01..03 + roadmap)

- PACK-01
  - At least 3 new vertical-specific preset options are visible in selector UI.
  - Presets are available in both EN and PT canvas pages.
  - Selecting each preset renders successfully without runtime errors.

- PACK-02
  - Each new preset uses existing loop-safe animation foundations and completes seam-safe 12-second loops.
  - Preset output continues to respect brand colors and existing easing/quality contracts.

- PACK-03
  - Deterministic selector routes at least 2 additional industry categories to new preset defaults.
  - Existing mapping matrix values remain stable and covered by regression assertions.

- Roadmap success criteria alignment
  - 3+ new presets added and rendered.
  - Seam-safe 12-second behavior verified.
  - Deterministic matrix extended for 2+ additional categories.
  - Existing matrix stability explicitly guarded by tests.

## Open Questions

1. Should new vertical coverage be implemented by expanding IndustryCategory (education/hospitality) or by remapping existing categories only?
2. Should presets be version-specific (v2 only) or available across both v1 and v2 with constrained base-style compatibility?
3. Should preset selection be user-visible override only, deterministic default only, or both (default + user override)?
4. Is export output expected to display preset label metadata, or only resolved animation style + company branding?
5. Do we want strict matrix snapshot tests (hard-lock all entries) or targeted lock tests (only critical legacy entries)?
