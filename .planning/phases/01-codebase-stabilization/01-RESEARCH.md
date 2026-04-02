# Phase 1: Codebase Stabilization - Research

**Researched:** 2026-04-02  
**Domain:** Three.js canvas animation stabilization (loop seam correctness, draw-call efficiency, runtime recoloring, particle polish)  
**Confidence:** HIGH

<user_constraints>

## User Constraints (from CONTEXT.md)

### Locked Decisions

### Loop Seam Validation

- **D-01:** Seam acceptance is based on deterministic progress math plus a quick visual pass.
- **D-02:** Seam strictness is "no perceptible pop" with deterministic state continuity at wrap-around.
- **D-03:** Random values are generated at setup only; per-frame animation must remain deterministic from loop progress.
- **D-04:** Verification artifact for this phase is a manual checklist in context/discussion docs (no new automated harness required in Phase 1).

### Claude's Discretion

- The exact checklist formatting and review cadence can be decided during planning as long as D-01 through D-04 are preserved.

### Deferred Ideas (OUT OF SCOPE)

None - discussion stayed within phase scope.
</user_constraints>

<phase_requirements>

## Phase Requirements

| ID     | Description                                                                                         | Research Support                                                                                                                                                               |
| ------ | --------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| FR-1.1 | Particles loop uses pure deterministic sin/cos(progress \* 2pi); no unbounded velocity accumulation | See Recommendations FR-1.1 and Code Examples for [src/scripts/canvas/animations/particles.ts](src/scripts/canvas/animations/particles.ts)                                      |
| FR-1.2 | Geometric animation shares one material per palette color index; max 3 draw calls                   | See Recommendations FR-1.2 for [src/scripts/canvas/animations/geometric.ts](src/scripts/canvas/animations/geometric.ts)                                                        |
| FR-1.3 | Icons render white-on-transparent and use SpriteMaterial.color for tint                             | See Recommendations FR-1.3 for [src/scripts/canvas/icons/draw.ts](src/scripts/canvas/icons/draw.ts) and [src/scripts/canvas/icons/index.ts](src/scripts/canvas/icons/index.ts) |
| FR-1.4 | All PointsMaterial use 64x64 radial gradient texture map                                            | See Recommendations FR-1.4 across all relevant animation files                                                                                                                 |
| FR-1.5 | All 8 styles complete seamless 12s loop with no perceptible seam pop                                | See Recommendations FR-1.5 and validation checklist over 8-style registry in [src/scripts/canvas/animations/index.ts](src/scripts/canvas/animations/index.ts)                  |

</phase_requirements>

## Summary

Phase 1 should be implemented as targeted stabilization work, not a redesign. The codebase already has a solid base architecture: fixed loop duration, shared animation base class, and a clean style registry for all 8 active styles. The main defects are localized and align directly with FR-1.1 through FR-1.4.

The highest-risk seam regressions come from time accumulation in update loops (direct elapsed-driven rotation/drift and incremental rotation updates), not from setup randomness. Fixing these requires converting per-frame mutation to deterministic closed-form functions of normalized loop progress. This approach preserves style identity while guaranteeing wrap continuity.

**Primary recommendation:** Execute a five-stream stabilization pass mapped one-to-one to FR-1.1 to FR-1.5, with deterministic-progress refactors first, then material/texture correctness, then full 8-style seam validation.

## Project Constraints (from CLAUDE.md)

- Stack is Astro 6 static site, Three.js-based canvas feature; no framework replacement.
- New client behavior must remain compatible with current canvas architecture and static deployment.
- No new front-end frameworks or rendering libraries (aligned with NFR-6).
- Keep bilingual contract intact for any user-facing text changes (not expected in this phase).
- Existing test command baseline is Playwright E2E via npm scripts.

## Standard Stack

### Core

| Library                     | Version                             | Purpose                                          | Why Standard                                                                 |
| --------------------------- | ----------------------------------- | ------------------------------------------------ | ---------------------------------------------------------------------------- |
| three                       | project-installed (already in repo) | Rendering, materials, geometry, particle systems | Existing production dependency and all required primitives already available |
| Astro client canvas scripts | existing                            | Runtime integration and event lifecycle          | Current architecture already supports phase goals                            |

### Supporting

| Utility                             | Purpose                                    | When to Use                                 |
| ----------------------------------- | ------------------------------------------ | ------------------------------------------- |
| BaseAnimation.loopTime/loopProgress | Deterministic normalized loop math         | All update functions that must seam cleanly |
| CanvasTexture                       | Procedural soft particle and icon textures | FR-1.3 and FR-1.4 implementations           |

### Alternatives Considered

| Instead of                | Could Use                               | Tradeoff                                                        |
| ------------------------- | --------------------------------------- | --------------------------------------------------------------- |
| PointsMaterial radial map | Custom shader particles                 | More complexity than needed for phase scope                     |
| SpriteMaterial tint       | Re-draw canvas texture on color changes | Extra CPU/GPU texture upload cost and harder runtime recoloring |

## Architecture Patterns

### Recommended Structure For Phase 1

- Keep fixes in existing animation and icon modules only.
- Avoid cross-cutting refactors outside canvas script domain.
- Add small shared helpers only if reused by at least two files (for particle texture and seam math).

### Pattern 1: Deterministic Loop State

**What:** Every animated property must be computed from progress = loopTime(elapsed) / LOOP_DURATION.  
**When to use:** Any position, rotation, opacity, and scale update.  
**Target files:**

- [src/scripts/canvas/animations/particles.ts](src/scripts/canvas/animations/particles.ts)
- [src/scripts/canvas/animations/geometric.ts](src/scripts/canvas/animations/geometric.ts)
- [src/scripts/canvas/animations/narrative.ts](src/scripts/canvas/animations/narrative.ts)
- [src/scripts/canvas/animations/spotlight.ts](src/scripts/canvas/animations/spotlight.ts)
- [src/scripts/canvas/animations/constellation.ts](src/scripts/canvas/animations/constellation.ts)
- [src/scripts/canvas/animations/timeline.ts](src/scripts/canvas/animations/timeline.ts)

### Pattern 2: Shared Materials By Color Bucket

**What:** Use a fixed material pool keyed by palette index instead of per-mesh material creation.  
**When to use:** Geometric style shape meshes with only color/opacity variance.  
**Target file:** [src/scripts/canvas/animations/geometric.ts](src/scripts/canvas/animations/geometric.ts)

### Pattern 3: White Texture + Runtime Tint

**What:** Draw procedural icon in white alpha, apply brand tint with SpriteMaterial.color.  
**When to use:** All industry icon sprites.  
**Target files:**

- [src/scripts/canvas/icons/draw.ts](src/scripts/canvas/icons/draw.ts)
- [src/scripts/canvas/icons/index.ts](src/scripts/canvas/icons/index.ts)

### Anti-Patterns To Avoid

- Direct elapsed-based state accumulation (for example rotation += step or position += drift) inside looped scenes.
- Creating new MeshBasicMaterial for every geometric shape.
- Hard-coding icon color into canvas pixels.
- PointsMaterial without a texture map (square particles).

## Concrete Recommendations (FR-1.1 to FR-1.5)

### FR-1.1 - Particle Loop Correctness

**Target file:** [src/scripts/canvas/animations/particles.ts](src/scripts/canvas/animations/particles.ts)

**Likely code-level changes:**

- Keep randomized seeds only in createScene (base position, phase seed, amplitude seed).
- Replace velocity accumulation terms:
  - remove positions[i3] = bx + drift _ speed + velocities[i3] _ t \* 60
  - remove positions[i3+1] = by + wave _ speed + velocities[i3+1] _ t \* 60
- Introduce deterministic closed-form offsets per particle:
  - angle = progress _ 2 _ Math.PI + phaseSeed
  - x = bx + cos(angle _ freqX) _ ampX \* speed
  - y = by + sin(angle _ freqY) _ ampY \* speed
- Keep points.rotation.z tied to progress-based sinusoid (already deterministic).

**Why:** Eliminates seam drift and satisfies strict deterministic continuity.

### FR-1.2 - Geometric Draw-Call Efficiency

**Target file:** [src/scripts/canvas/animations/geometric.ts](src/scripts/canvas/animations/geometric.ts)

**Likely code-level changes:**

- Build a reusable material pool of exactly 3 MeshBasicMaterial instances (primary, secondary, accent).
- During shape creation, assign material by color index from pool rather than new material per shape.
- Move dynamic opacity from material mutation to either:
  - mesh-level visibility threshold plus fixed opacity, or
  - color alpha via grouped opacity strategy per color pool using synchronized curve.
- Replace incremental rotation (group.rotation.z += ...) with deterministic formula:
  - group.rotation.z = baseRotation + sin(phase _ rotFreq + rotPhase) _ rotAmp

**Why:** Material reuse unlocks the 3 draw-call cap and removes a known seam risk from incremental rotation.

### FR-1.3 - Icon Runtime Recoloring

**Target files:**

- [src/scripts/canvas/icons/draw.ts](src/scripts/canvas/icons/draw.ts)
- [src/scripts/canvas/icons/index.ts](src/scripts/canvas/icons/index.ts)

**Likely code-level changes:**

- Update draw function contract to ignore brand color and always draw white strokes/fills on transparent canvas.
- In icon creation, call drawFn(ctx, '#ffffff') or remove color parameter entirely and hardcode white in draw implementations.
- Set sprite tint with material color:
  - color: new THREE.Color(config.colors.accent)
- Keep opacity/rotation/pulse animation on material/sprite only; no texture redraw required for recoloring.

**Why:** Guarantees runtime tint flexibility and avoids expensive texture re-upload path.

### FR-1.4 - Soft Particle Rendering Polish

**Target files:**

- [src/scripts/canvas/animations/particles.ts](src/scripts/canvas/animations/particles.ts)
- [src/scripts/canvas/animations/narrative.ts](src/scripts/canvas/animations/narrative.ts)
- [src/scripts/canvas/animations/spotlight.ts](src/scripts/canvas/animations/spotlight.ts)
- [src/scripts/canvas/animations/constellation.ts](src/scripts/canvas/animations/constellation.ts)

**Likely code-level changes:**

- Create one 64x64 radial gradient CanvasTexture helper (white center to transparent edge).
- Apply as PointsMaterial.map for every PointsMaterial instance.
- Ensure transparent true, depthWrite false, and suitable blending remain consistent.
- Optionally set alphaTest around 0.01 to clip fully transparent fragments cleanly.

**Why:** Removes square-point artifact and standardizes premium particle appearance.

### FR-1.5 - 8-Style Seam Correctness Across 12s Loop

**Target files (all style implementations + registry):**

- [src/scripts/canvas/animations/index.ts](src/scripts/canvas/animations/index.ts)
- [src/scripts/canvas/animations/particles.ts](src/scripts/canvas/animations/particles.ts)
- [src/scripts/canvas/animations/flowing.ts](src/scripts/canvas/animations/flowing.ts)
- [src/scripts/canvas/animations/geometric.ts](src/scripts/canvas/animations/geometric.ts)
- [src/scripts/canvas/animations/typographic.ts](src/scripts/canvas/animations/typographic.ts)
- [src/scripts/canvas/animations/narrative.ts](src/scripts/canvas/animations/narrative.ts)
- [src/scripts/canvas/animations/timeline.ts](src/scripts/canvas/animations/timeline.ts)
- [src/scripts/canvas/animations/constellation.ts](src/scripts/canvas/animations/constellation.ts)
- [src/scripts/canvas/animations/spotlight.ts](src/scripts/canvas/animations/spotlight.ts)

**Likely code-level changes:**

- Replace elapsed-driven oscillators with progress-driven oscillators where currently using raw elapsed.
- Replace any incremental mutation inside update loops with closed-form expressions from progress.
- For staged reveal styles (timeline, narrative, spotlight, constellation), ensure wrap window near progress 1.0 transitions smoothly into progress 0.0 with no abrupt visibility reset.
- Add/maintain short manual seam checklist artifact (D-04) covering all 8 styles at default params.

**Why:** FR-1.5 is global and depends on strict deterministic math, not style-specific patching alone.

## Don't Hand-Roll

| Problem                         | Don't Build                                    | Use Instead                                                 | Why                                               |
| ------------------------------- | ---------------------------------------------- | ----------------------------------------------------------- | ------------------------------------------------- |
| Soft particle sprite assets     | External image pipeline for particle dots      | Runtime 64x64 CanvasTexture radial map                      | Fast, deterministic, no asset management overhead |
| Icon recolor runtime            | Canvas redraw and texture upload every recolor | SpriteMaterial.color tint multiplication                    | Better runtime performance and simpler state      |
| Seam testing harness in Phase 1 | New custom automation framework                | Manual deterministic checklist per D-04 + quick visual pass | Explicitly required by phase context              |

## Common Pitfalls

### Pitfall 1: Hidden Accumulators Cause Seam Pop

- What goes wrong: animation appears smooth in first cycle but pops at wrap.
- Why: position/rotation depends on cumulative elapsed mutations.
- Avoidance: enforce progress-based closed form for all animated props.
- Warning sign: using += inside update or elapsed directly in oscillators where wrap continuity is required.

### Pitfall 2: Material Sharing Breaks If Opacity Is Per-Shape

- What goes wrong: developers revert to per-shape materials to preserve opacity variance.
- Why: shared material couples opacity across meshes.
- Avoidance: redesign opacity variation via synchronized curves or geometry grouping.
- Warning sign: new MeshBasicMaterial allocation inside creation loop.

### Pitfall 3: Particle Texture Applied To Some Styles Only

- What goes wrong: mixed quality where some effects remain square pixels.
- Why: multiple PointsMaterial locations across style files.
- Avoidance: enumerate every PointsMaterial constructor and require map assignment.
- Warning sign: any PointsMaterial config without map.

## Code Examples

### Deterministic Rotation Pattern

Use this pattern when replacing accumulated rotation:

- current anti-pattern: rotation += delta
- target pattern: rotation = baseRotation + sin(progress _ 2pi _ freq + phase) \* amplitude

### Particle Deterministic Offset Pattern

Use this pattern in particle update:

- cache particle seeds at setup
- compute angle from progress each frame
- set position from base + trigonometric offsets only

## Environment Availability

Step 2.6: SKIPPED (no external dependencies identified).  
Phase 1 scope is confined to in-repo TypeScript and Three.js runtime behavior.

## Validation Architecture

### Test Framework

| Property           | Value                                        |
| ------------------ | -------------------------------------------- |
| Framework          | Playwright E2E (existing project setup)      |
| Config file        | [playwright.config.ts](playwright.config.ts) |
| Quick run command  | npm run test                                 |
| Full suite command | npm run test                                 |

### Phase Requirements To Validation Map

| Req ID | Behavior                                     | Validation Type                           | Command / Method                                                     | File Exists?                                          |
| ------ | -------------------------------------------- | ----------------------------------------- | -------------------------------------------------------------------- | ----------------------------------------------------- |
| FR-1.1 | deterministic particle loop                  | manual visual + deterministic code review | manual checklist, plus focused preview run                           | checklist to be documented in phase context artifacts |
| FR-1.2 | geometric material pooling and draw call cap | runtime inspection                        | browser devtools draw-call check on geometric style                  | manual for Phase 1                                    |
| FR-1.3 | icon tint via SpriteMaterial.color           | code review + runtime recolor smoke       | verify icon draw white template and tint updates                     | manual for Phase 1                                    |
| FR-1.4 | all PointsMaterial mapped to radial texture  | code scan + visual check                  | inspect constructors and run style previews                          | manual for Phase 1                                    |
| FR-1.5 | no seam pop across 8 styles over 12s loop    | manual seam pass                          | run each style through at least 3 loops and evaluate seam continuity | manual checklist required by D-04                     |

### Sampling Rate

- Per task commit: run targeted preview and checklist items for touched styles.
- Per wave merge: complete all 8-style seam checklist once.
- Phase gate: full checklist pass with no perceptible seam pop and FR-1.2 draw-call target met.

### Wave 0 Gaps

- No dedicated automated seam assertion harness exists (acceptable for this phase per D-04).
- Draw-call and seam checks require documented manual execution steps.

## Risks

- Refactoring to shared materials may alter intended per-shape opacity rhythm in geometric style.
- Deterministic seam fixes can subtly change motion personality; visual regression review required.
- Applying particle maps to all styles may require per-style size/opacity retuning to avoid over-bloom.
- Some styles currently use raw elapsed for aesthetic pulses; direct conversion to progress may flatten feel if not tuned with per-style phase offsets.

## Open Questions

1. Should FR-1.2 enforce exactly three draw calls or allow fewer when density is low?  
   Recommendation: treat three as maximum cap, not fixed minimum.
2. Should a shared helper be introduced for radial particle texture creation?  
   Recommendation: yes if used in 3+ files to reduce drift and ensure FR-1.4 consistency.

## Sources

### Primary (HIGH confidence)

- [src/scripts/canvas/animations/base.ts](src/scripts/canvas/animations/base.ts) - loop timing primitives and disposal behavior.
- [src/scripts/canvas/animations/index.ts](src/scripts/canvas/animations/index.ts) - canonical list of 8 styles.
- [src/scripts/canvas/animations/particles.ts](src/scripts/canvas/animations/particles.ts) - FR-1.1 defect location.
- [src/scripts/canvas/animations/geometric.ts](src/scripts/canvas/animations/geometric.ts) - FR-1.2 defect location.
- [src/scripts/canvas/icons/index.ts](src/scripts/canvas/icons/index.ts) and [src/scripts/canvas/icons/draw.ts](src/scripts/canvas/icons/draw.ts) - FR-1.3 defect location.
- [.planning/research/SPRITES.md](.planning/research/SPRITES.md) - sprite/material and soft-particle recommendations.
- [.planning/research/BRAND_ANIMATION.md](.planning/research/BRAND_ANIMATION.md) - seam quality and polish guidance.
- [CLAUDE.md](CLAUDE.md) - project constraints and testing commands.

## Metadata

**Confidence breakdown:**

- Standard stack: HIGH - in-repo dependencies and architecture are explicit.
- Architecture: HIGH - required fixes are localized and directly observable in source.
- Pitfalls: HIGH - existing code contains concrete examples of seam and material issues.

**Research date:** 2026-04-02  
**Valid until:** 2026-05-02
