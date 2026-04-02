# Phase 2: Animation Quality + Claude Schema Upgrade - Research

**Researched:** 2026-04-02  
**Domain:** Company Canvas semantic config contract, deterministic style routing, and premium-quality motion polish  
**Confidence:** MEDIUM

## Summary

Phase 2 is not a single “polish pass”. It is a coupled contract change across the Cloudflare Worker, the shared `CompanyConfig` type, the client-side style-selection path, and the animation implementations themselves. The current system still asks Claude to choose `animationStyle` directly, the shared type has no `mood` / `industryCategory` / `energyLevel` fields, and the live renderer trusts `config.animationStyle` as authoritative. That means FR-2.1 and FR-2.2 are foundational: until the semantic fields exist and the client computes the style deterministically, all motion tuning remains built on a nondeterministic routing layer.

The motion side is also broader than superficial easing tweaks. Several styles still hard-code `THREE.AdditiveBlending`, the v2 text-driven styles prioritize `visualElements` rather than the company name, and some animation behavior still derives directly from raw elapsed time rather than shared mood presets and render rules. In parallel, the current paid download path still uses `src/scripts/canvas/export.ts`, which duplicates animation logic outside the live renderer. If live preview quality improves in Phase 2 but export parity is ignored, paid downloads can immediately diverge from the previewed asset.

**Primary recommendation:** Execute Phase 2 in three plans: first lock the semantic schema and deterministic style-selection contract, then introduce shared motion/render helpers, then retune the affected animations and close preview/export parity before phase sign-off.

## Project Constraints (from CLAUDE.md)

- Stack remains Astro 6 static output with Three.js canvas rendering and Cloudflare Workers.
- All canvas scripts must remain compatible with Astro SPA navigation and `astro:page-load` lifecycle patterns.
- No new front-end frameworks or rendering libraries; use current Three.js primitives and existing project stack.
- Any page/UI changes must preserve EN/PT parity.
- Existing validation baseline is Playwright E2E at the repo root.
- Node.js baseline is `>=22.12.0`.

## Inherited Constraints From Phase 1 Artifacts

Phase 1 is complete and its acceptance rules still constrain Phase 2 work:

- Deterministic progress math remains the seam-quality baseline.
- “No perceptible pop” remains the loop acceptance standard.
- Randomness is setup-only; per-frame animation must remain deterministic from loop progress.
- Manual seam review remains an accepted validation artifact even where automated visual assertions are absent.

These constraints matter directly to FR-2.3, FR-2.4, and FR-2.7. Phase 2 should not reintroduce raw time accumulation or visual wrap pops while upgrading motion character.

<phase_requirements>

## Phase Requirements

| ID     | Description                                                                                                       | Research Support                                                                |
| ------ | ----------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------- |
| FR-2.1 | Worker returns `mood`, `industryCategory`, and `energyLevel` as structured fields                                 | See Requirement Analysis FR-2.1, Key Code Locations, and Architecture Pattern 1 |
| FR-2.2 | Client selects animation style deterministically; Claude no longer chooses at call time                           | See Requirement Analysis FR-2.2 and recommended selector contract               |
| FR-2.3 | Five moods map to distinct easing presets                                                                         | See Requirement Analysis FR-2.3 and Architecture Pattern 2                      |
| FR-2.4 | Company name dominates every style; per-character stagger reveal in `NarrativeAnimation` and `SpotlightAnimation` | See Requirement Analysis FR-2.4 and Key Code Locations for v2 styles            |
| FR-2.5 | Light backgrounds switch from additive to normal blending with reduced opacity                                    | See Requirement Analysis FR-2.5 and render-profile helper recommendation        |
| FR-2.6 | `visualElement` strings truncate to 12 chars before sprite texture creation                                       | See Requirement Analysis FR-2.6 and normalization boundary recommendation       |
| FR-2.7 | `ParticlesAnimation` and `GeometricAnimation` gain layered depth                                                  | See Requirement Analysis FR-2.7 and shared depth-profile strategy               |
| NFR-9  | Particle count caps at 400 when `navigator.hardwareConcurrency < 4`                                               | See Requirement Analysis NFR-9 and shared particle-budget helper                |

</phase_requirements>

## Current State Snapshot

The codebase is close to the right shape for Phase 2, but not yet aligned with its contract.

- `workers/company-api/src/index.ts` still asks Claude to return `animationStyle` directly and does not request `mood`, `industryCategory`, or `energyLevel`.
- `src/scripts/canvas/types.ts` has no semantic fields beyond `industry` and still treats `animationStyle` as canonical input.
- `src/scripts/canvas/main.ts` posts `{ companyName, version }`, but the worker `handleGenerate()` path only reads `companyName`; version is ignored during generation.
- `workers/company-api/src/index.ts` uses `cacheKey(companyName)` for POST generate but `cacheKey(companySlug, version)` for GET config, so version-aware cache behavior is already inconsistent.
- `src/scripts/canvas/renderer.ts` creates animations from `config.animationStyle` with no normalization or client-side routing layer.
- `NarrativeAnimation` and `SpotlightAnimation` render `visualElements` as the central scene text; the company name only exists in the DOM overlay, not as a staged typographic reveal.
- `ParticlesAnimation`, `GeometricAnimation`, `FlowingAnimation`, `NarrativeAnimation`, `ConstellationAnimation`, and `SpotlightAnimation` still hard-code additive blending in the live renderer.
- `src/scripts/canvas/export.ts` duplicates the animation logic in standalone HTML generation, including outdated elapsed-time mutation and hard-coded additive blending.
- `workers/company-api/src/stripe.ts` serializes the entire config into Stripe metadata. Adding new fields increases payload size and slightly increases the existing metadata-limit risk.

## Standard Stack

### Core

| Library / System   | Version                   | Purpose                                           | Why Standard                                                        |
| ------------------ | ------------------------- | ------------------------------------------------- | ------------------------------------------------------------------- |
| Astro              | `6.0.8`                   | Static frontend shell and routing                 | Existing production stack; no phase need for framework changes      |
| Three.js           | `0.183.2`                 | Canvas scene graph, materials, sprites, particles | Current rendering runtime already supports all Phase 2 requirements |
| Cloudflare Workers | `wrangler 4.77.0` locally | Brand-analysis API, caching, Stripe integration   | Existing worker contract is the authoritative schema boundary       |
| Playwright         | `1.58.2`                  | Existing browser validation suite                 | Already present and used for Company Canvas flows                   |

### Supporting

| Utility / Pattern                             | Current Source                                    | Purpose                        | When to Use                                               |
| --------------------------------------------- | ------------------------------------------------- | ------------------------------ | --------------------------------------------------------- |
| `BaseAnimation.loopTime()` / `loopProgress()` | `src/scripts/canvas/animations/base.ts`           | Seam-safe normalized motion    | All per-frame motion that must loop cleanly               |
| Shared particle texture helper                | `src/scripts/canvas/animations/particle-utils.ts` | Premium point rendering        | Any particle-based style                                  |
| Existing version selector                     | `src/scripts/canvas/versions.ts`                  | User-chosen v1/v2 style family | Deterministic style routing should key off this selection |
| Worker cache key helper                       | `workers/company-api/src/normalize.ts`            | Version-aware config lookup    | Required for consistent deterministic generation caching  |

### Alternatives Considered

| Instead of                                  | Could Use                                                      | Tradeoff                                                                    |
| ------------------------------------------- | -------------------------------------------------------------- | --------------------------------------------------------------------------- |
| Claude chooses `animationStyle` directly    | Client-side deterministic selector                             | Recommended; removes nondeterminism and keeps brand semantics in Claude     |
| Encoding mood through existing `speed` only | Central mood preset helper that maps to multiple motion values | Recommended; a single float cannot express “bold” vs “playful” correctly    |
| Per-file blending decisions                 | Shared render-profile helper from background color             | Recommended; prevents drift between styles                                  |
| Deferring export parity until Phase 3       | Live-preview-only polish in Phase 2                            | Faster short-term, but paid HTML downloads diverge from preview immediately |

**Installation:** No new packages are recommended for Phase 2. Use the existing repo stack and built-in Node runtime.

## Key Code Locations

| File / Subsystem                                 | Why It Matters In Phase 2                                                      |
| ------------------------------------------------ | ------------------------------------------------------------------------------ |
| `workers/company-api/src/index.ts`               | Worker prompt, schema shape, generate/config routes, cache key usage           |
| `workers/company-api/src/normalize.ts`           | Version-aware cache keys; currently underused on POST generate                 |
| `workers/company-api/src/stripe.ts`              | Schema growth increases config payload size for checkout/download              |
| `src/scripts/canvas/types.ts`                    | Shared wire contract must grow to include semantic fields                      |
| `src/scripts/canvas/main.ts`                     | Fetches config, stores current state, currently trusts worker-selected style   |
| `src/scripts/canvas/renderer.ts`                 | Final handoff point where selected style becomes a concrete animation instance |
| `src/scripts/canvas/versions.ts`                 | Existing v1/v2 family split must feed deterministic routing                    |
| `src/scripts/canvas/animations/base.ts`          | Common seam-safe timing primitives                                             |
| `src/scripts/canvas/animations/particles.ts`     | FR-2.5, FR-2.7, NFR-9 touchpoint                                               |
| `src/scripts/canvas/animations/geometric.ts`     | FR-2.5 and FR-2.7 touchpoint                                                   |
| `src/scripts/canvas/animations/narrative.ts`     | FR-2.3, FR-2.4, FR-2.5, FR-2.6 touchpoint                                      |
| `src/scripts/canvas/animations/spotlight.ts`     | FR-2.3, FR-2.4, FR-2.5, FR-2.6 touchpoint                                      |
| `src/scripts/canvas/animations/constellation.ts` | FR-2.5 and FR-2.6 parity concern                                               |
| `src/scripts/canvas/animations/flowing.ts`       | FR-2.5 parity concern                                                          |
| `src/scripts/canvas/animations/text-utils.ts`    | Company-name sprite rendering strategy and per-character reveal helpers        |
| `src/scripts/canvas/export.ts`                   | Preview/export parity risk; duplicated motion logic                            |
| `e2e/canvas.spec.ts`                             | Existing browser regression coverage for canvas page                           |
| `e2e/particles-loop.spec.ts`                     | Existing code-level deterministic motion regression example                    |

## Architecture Patterns

### Pattern 1: Semantic Worker Output, Deterministic Client Routing

**What:** Claude returns semantic brand axes; the client derives the final `animationStyle` deterministically.

**Recommended contract:**

- Worker remains responsible for brand semantics: colors, tagline, description, `industry`, `mood`, `industryCategory`, `energyLevel`, `visualElements`.
- Client remains responsible for deterministic style selection.
- `version` remains a user-controlled input that constrains the available style family.
- `energyLevel` must tune motion intensity only, not style identity, otherwise FR-2.2 is weakened.

**Recommended selector signature:**

```ts
selectAnimationStyle({ version, industryCategory, mood }): CompanyConfig['animationStyle']
```

**Why:** This cleanly separates AI inference from deterministic presentation logic and fixes the current “same company, different style on cache miss” failure mode.

### Pattern 2: Shared Motion Presets + Render Profile

**What:** Centralize mood easing, light-background blending rules, and particle-budget decisions in shared helpers rather than re-implementing them per animation.

**Recommended helper responsibilities:**

- `getMoodPreset(mood)` returns easing family, stagger, hold ratio, overshoot, and pulse behavior.
- `getRenderProfile(backgroundHex)` returns `isLightBackground`, `blending`, and default opacity rules.
- `getParticleBudget(baseCount)` applies mobile cap and any later export-specific reductions.

**Why:** FR-2.3, FR-2.5, and NFR-9 are cross-cutting rules. If they are applied ad hoc inside each animation file, the phase will drift immediately.

### Pattern 3: Normalize Once At The Boundary

**What:** Clamp and normalize external data immediately after fetch, before any animation setup occurs.

**Normalization responsibilities:**

- truncate `visualElements` to max 12 characters
- clamp `energyLevel` to 0–1
- coerce invalid `mood` / `industryCategory` to safe fallbacks
- overwrite `animationStyle` with the deterministic client-selected result

**Best boundary:** directly in `src/scripts/canvas/main.ts` after `await res.json()` and before `currentConfig` / `startRenderer()`.

**Why:** FR-2.6 should not depend on every animation remembering to truncate text before sprite creation.

### Pattern 4: Name-First Composition For Text-Driven Styles

**What:** In v2 text-driven styles, `visualElements` support the story, but the company name carries the typographic hierarchy.

**Recommended composition rule:**

- Company name appears as the largest scene-level text treatment.
- `visualElements` become secondary labels, callouts, satellites, or supporting captions.
- In `NarrativeAnimation` and `SpotlightAnimation`, the company name reveal uses per-character stagger and longest hold duration.

**Why:** The current overlay already shows the company name globally, but FR-2.4 asks for dominance in the animation itself, not just in static DOM chrome.

### Anti-Patterns To Avoid

- Letting Claude remain the authoritative source of `animationStyle`.
- Using `energyLevel` as a hidden tie-breaker for style selection.
- Applying light-background blending changes only in live preview while leaving `export.ts` unchanged.
- Implementing per-character reveal by mutating one long canvas sprite; build characters or grouped segments explicitly.
- Treating z-position alone as “depth” in an orthographic camera. Scale, opacity, and speed must also vary.

## Requirement Analysis

### FR-2.1 - Worker Returns `mood`, `industryCategory`, `energyLevel`

**Current gap:**

- Worker prompt in `workers/company-api/src/index.ts` requests `animationStyle` but none of the three required semantic fields.
- `CompanyConfig` in `src/scripts/canvas/types.ts` has no corresponding properties.
- No validation or normalization exists for new enum fields.

**Implementation strategy:**

1. Expand the worker prompt schema to request:
   - `mood: "bold" | "elegant" | "playful" | "minimal" | "dynamic"`
   - `industryCategory: "tech" | "finance" | "health" | "retail" | "creative" | "food" | "other"`
   - `energyLevel: 0..1`
2. Add lightweight worker-side normalization before cache write.
3. Extend `CompanyConfig` with the new fields.
4. Treat missing or invalid values as recoverable:
   - fallback `mood: "dynamic"`
   - fallback `industryCategory: "other"`
   - clamp `energyLevel` into `[0, 1]`

**Likely files:**

- `workers/company-api/src/index.ts`
- `src/scripts/canvas/types.ts`
- possibly a new worker-local normalizer helper if the prompt parsing is extracted

**Key risk:** new fields make the stored config larger, which marginally worsens the existing Stripe metadata split fragility in `workers/company-api/src/stripe.ts`.

**Validation:** response contract assertions, manual worker smoke, and client-side rendering smoke using mocked payloads.

### FR-2.2 - Deterministic Client Style Selection

**Current gap:**

- Worker system prompt tells Claude to choose one of eight styles.
- `CanvasRenderer` trusts `config.animationStyle` directly.
- `main.ts` posts `version`, but worker generation ignores it.
- POST generate cache key does not include version even though GET config does.

**Implementation strategy:**

1. Keep `version` as a user-selected family constraint.
2. Introduce a pure selector on the client that computes `animationStyle` from `version + industryCategory + mood`.
3. Immediately overwrite the fetched `config.animationStyle` with the deterministic result before rendering or checkout.
4. Update worker generate route to read version if backward-compatible parity with share URLs is required.
5. Align POST and GET cache-key usage around `cacheKey(name, version)`.

**Recommended deterministic routing shape:**

- Version gate first:
  - `v1` limits output to `particles | flowing | geometric | typographic`
  - `v2` limits output to `narrative | timeline | constellation | spotlight`
- Industry chooses the default pair:
  - `tech` -> `particles` / `constellation`
  - `finance` -> `geometric` / `timeline`
  - `health` -> `flowing` / `timeline`
  - `retail` -> `typographic` / `narrative`
  - `creative` -> `typographic` / `spotlight`
  - `food` -> `flowing` / `narrative`
  - `other` -> `particles` / `narrative`
- Mood resolves within the pair.
- `energyLevel` adjusts motion intensity only after style has been selected.

**Likely files:**

- `src/scripts/canvas/main.ts`
- `src/scripts/canvas/renderer.ts`
- `src/scripts/canvas/versions.ts`
- `src/scripts/canvas/types.ts`
- `workers/company-api/src/index.ts`
- `workers/company-api/src/normalize.ts`

**Sequencing constraint:** this must land before any visual retuning, because every subsequent style-quality judgment depends on stable style routing.

**Validation:** pure selector tests plus browser E2E that a mocked semantic payload always resolves to the same displayed style.

### FR-2.3 - Distinct Easing Presets Per Mood

**Current gap:**

- The current system only has scalar `speed`, `density`, `complexity`.
- Mood is not represented in the config.
- Animations still mix simple fades, sinusoidal pulses, and elapsed-time oscillation without shared intent.

**Implementation strategy:**

1. Add a shared mood-preset helper returning a small preset object per mood.
2. Map mood to motion behaviors, not just speed:
   - `bold` -> short entry window, harder stop, higher contrast pulse
   - `elegant` -> longer ease-in-out and longer hold
   - `playful` -> overshoot / spring-like reveal and brighter secondary motion
   - `minimal` -> lower amplitude, softer opacity range, near-linear timing
   - `dynamic` -> quick reveal, slower settle, more active secondary particles
3. Apply presets first in `NarrativeAnimation` and `SpotlightAnimation`, then in `ParticlesAnimation` and `GeometricAnimation` where pulse and drift character matter.

**Likely files:**

- new shared helper under `src/scripts/canvas/` or `src/scripts/canvas/animations/`
- `src/scripts/canvas/animations/narrative.ts`
- `src/scripts/canvas/animations/spotlight.ts`
- `src/scripts/canvas/animations/particles.ts`
- `src/scripts/canvas/animations/geometric.ts`
- likely parity updates in `src/scripts/canvas/export.ts`

**Key risk:** visual feel is subjective. Preset calibration needs side-by-side comparison rather than only code review.

**Validation:** side-by-side manual review of five mood presets using the same company config except for mood.

### FR-2.4 - Company Name Dominance + Per-Character Reveal In Narrative/Spotlight

**Current gap:**

- The DOM overlay shows company name, but the in-scene typographic focus in `NarrativeAnimation` and `SpotlightAnimation` is still the `visualElements` list.
- `createTextSprite()` renders whole words, not staged character groups.

**Implementation strategy:**

1. Keep the DOM overlay as the universal persistent brand anchor.
2. Add scene-level company-name typography for the two v2 hero styles:
   - build a grouped company-name sprite sequence by character or short segments
   - reveal each character with mood-driven stagger
   - give the company name the longest hold duration in the loop
3. Reposition `visualElements` to secondary roles:
   - `NarrativeAnimation`: supporting captions around or after the company-name reveal
   - `SpotlightAnimation`: rotate secondary keywords while the company name remains central hero text
4. Audit other styles to ensure the overlay remains the largest and highest-contrast type treatment.

**Likely files:**

- `src/scripts/canvas/animations/narrative.ts`
- `src/scripts/canvas/animations/spotlight.ts`
- `src/scripts/canvas/animations/text-utils.ts`
- `src/pages/en/canvas/index.astro`
- `src/pages/pt/canvas/index.astro`
- possibly `src/scripts/canvas/export.ts`

**Key risk:** per-character sprite creation can multiply textures. Keep character count bounded and avoid per-frame sprite recreation.

**Validation:** manual visual review with at least two long-name and two short-name companies.

### FR-2.5 - Light Background Blending Guard

**Current gap:**

- Additive blending is hard-coded throughout the live animation files.
- Export HTML also hard-codes additive blending and would remain visually washed out if only the live renderer changes.

**Implementation strategy:**

1. Add a shared helper to compute background lightness from hex.
2. If background lightness is greater than 50%, switch the affected materials from `THREE.AdditiveBlending` to `THREE.NormalBlending` and reduce base opacity to `0.7`.
3. Apply this helper in all animation material creation sites that currently rely on additive blending.
4. Mirror the same rule in `src/scripts/canvas/export.ts` if Phase 2 requires preview/export parity.

**Likely files:**

- `src/scripts/canvas/animations/particles.ts`
- `src/scripts/canvas/animations/flowing.ts`
- `src/scripts/canvas/animations/geometric.ts`
- `src/scripts/canvas/animations/narrative.ts`
- `src/scripts/canvas/animations/constellation.ts`
- `src/scripts/canvas/animations/spotlight.ts`
- `src/scripts/canvas/export.ts`

**Key risk:** changing blending without retuning opacity can flatten dark themes or make minimal styles disappear on light palettes.

**Validation:** explicit light-background test fixtures plus dark-background regression smoke.

### FR-2.6 - Truncate `visualElement` Strings To 12 Characters

**Current gap:**

- Worker prompt allows free-form keywords.
- Every v2 style slices the array length, but none clamp string length before sprite generation.
- Export HTML inlines the raw `visualElements` array as well.

**Implementation strategy:**

1. Update the worker prompt to request max-12-char keywords.
2. Enforce client-side truncation anyway before any call to `createTextSprite()`.
3. Keep truncation centralized at the normalization boundary, not inside each animation file.
4. If desired, uppercase after truncation to preserve consistent width behavior.

**Likely files:**

- `workers/company-api/src/index.ts`
- `src/scripts/canvas/main.ts`
- `src/scripts/canvas/export.ts`
- potentially `src/scripts/canvas/text` helpers if a shared label-normalization helper is added

**Key risk:** truncating too late means layout bugs survive in preview or export. Normalize before state is stored.

**Validation:** contract tests and manual long-keyword fixtures.

### FR-2.7 - Layered Depth In Particles And Geometric

**Current gap:**

- `ParticlesAnimation` varies position seeds but not depth personality strongly enough.
- `GeometricAnimation` uses an orthographic camera and all groups currently read as a single visual plane.

**Implementation strategy:**

1. Introduce explicit foreground / midground / background layers.
2. For `ParticlesAnimation`:
   - assign each particle a depth tier at setup
   - vary z-offset, point size, opacity, speed multiplier, and brightness by tier
3. For `GeometricAnimation`:
   - assign layer metadata per group
   - vary scale, opacity, orbit radius, rotation amplitude, and z-position by layer
4. Because the camera is orthographic, depth should be simulated with scale + opacity + speed, not z-position alone.

**Likely files:**

- `src/scripts/canvas/animations/particles.ts`
- `src/scripts/canvas/animations/geometric.ts`
- possibly shared helper for depth-tier math
- possibly `src/scripts/canvas/export.ts` if parity is required

**Key risk:** extra visual richness can regress Phase 1 seam quality if any layer uses incremental mutation instead of deterministic progress-based formulas.

**Validation:** manual visual review across three loops, with focus on seam continuity and foreground/background separation.

### NFR-9 - Mobile Particle Cap At 400 For Low Hardware Concurrency

**Current gap:**

- `ParticlesAnimation` still computes `Math.floor(800 * density)` with no hardware-tier cap.
- Other particle systems are already below 400 in practice, but no shared rule exists.

**Implementation strategy:**

1. Add a shared particle-budget helper:
   - if `navigator.hardwareConcurrency < 4`, cap computed count at `400`
2. Use the helper in any particle-count computation site, even if most current v2 styles stay below the threshold.
3. Keep the rule runtime-only; do not push device-derived data into the worker contract.

**Likely files:**

- `src/scripts/canvas/animations/particles.ts`
- `src/scripts/canvas/animations/narrative.ts`
- `src/scripts/canvas/animations/constellation.ts`
- `src/scripts/canvas/animations/spotlight.ts`
- any shared helper location used by these files

**Key risk:** if the rule is applied only to `ParticlesAnimation`, later styles can accidentally violate the same budget rule.

**Validation:** Playwright mobile project plus a focused unit/helper test around the particle-budget function.

## Sequencing And Dependencies

### Required Order

1. **Schema and routing foundation first**
   - FR-2.1 and FR-2.2 must land before motion work.
   - Reason: every preview, cache entry, info panel, and checkout payload depends on the resolved style contract.

2. **Shared helpers second**
   - FR-2.3, FR-2.5, FR-2.6, and NFR-9 should be encoded in shared helpers before animation-by-animation tuning.
   - Reason: once motion retuning starts, late helper introduction causes duplicate rework.

3. **Animation retuning third**
   - FR-2.4 and FR-2.7 should consume the shared presets/helpers and inherit the deterministic routing already in place.
   - Reason: these are the highest-touch animation edits and the most subjective verification step.

4. **Preview/export parity before phase gate**
   - If Phase 2 changes the current product experience, `src/scripts/canvas/export.ts` must either be updated or the divergence must be accepted explicitly as a temporary exception.
   - Recommendation: do not accept divergence silently.

### Wave Opportunities

- Once the selector contract and normalization boundary are stable, the work can split into two partially parallel streams:
  - shared render/motion helper implementation
  - animation-specific composition retuning
- Export parity should be a late wave after the live renderer behavior is stabilized, otherwise the duplicate HTML logic will be reworked twice.

## Recommended Plan Decomposition

| Plan  | Scope                                                      | Requirements                                | Depends On           | Wave Notes                                                         |
| ----- | ---------------------------------------------------------- | ------------------------------------------- | -------------------- | ------------------------------------------------------------------ |
| 02-01 | Semantic schema + deterministic style-selection foundation | FR-2.1, FR-2.2, FR-2.6                      | None                 | Must land first                                                    |
| 02-02 | Shared motion/render infrastructure                        | FR-2.3, FR-2.5, NFR-9                       | 02-01                | Can expose helpers used by later animation pass                    |
| 02-03 | Animation retuning + parity validation                     | FR-2.4, FR-2.7, closeout for FR-2.3/2.5/2.6 | 02-01, ideally 02-02 | Include preview/export parity decision and side-by-side validation |

### Plan 02-01 - Semantic Schema + Deterministic Routing

**Primary outcomes:**

- Worker returns new semantic fields.
- Client normalizes fetched config.
- Client computes `animationStyle` deterministically.
- Version-aware cache and generate route contract are clarified.

**Main files:**

- `workers/company-api/src/index.ts`
- `workers/company-api/src/normalize.ts`
- `src/scripts/canvas/types.ts`
- `src/scripts/canvas/main.ts`
- `src/scripts/canvas/versions.ts`
- likely new selector helper file

**Primary risk:** backward compatibility tension around keeping `animationStyle` in the wire contract while making the client authoritative.

### Plan 02-02 - Shared Motion / Render Infrastructure

**Primary outcomes:**

- Central mood presets
- Central render-profile helper for background blending
- Central particle-budget helper
- Shared truncation / normalization utilities

**Main files:**

- new helper modules under `src/scripts/canvas/`
- animation files that consume helper outputs
- possibly `src/scripts/canvas/export.ts` if parity is treated as in-scope here

**Primary risk:** helper API drift if created before Plan 02-01 stabilizes the semantic field names.

### Plan 02-03 - Animation Retuning + Phase Validation

**Primary outcomes:**

- `NarrativeAnimation` and `SpotlightAnimation` gain company-name hero treatment and per-character reveal.
- `ParticlesAnimation` and `GeometricAnimation` gain layered depth.
- Phase-wide mood presets are tuned visually.
- Preview/export parity is either closed or explicitly documented as deferred with approval.

**Main files:**

- `src/scripts/canvas/animations/narrative.ts`
- `src/scripts/canvas/animations/spotlight.ts`
- `src/scripts/canvas/animations/particles.ts`
- `src/scripts/canvas/animations/geometric.ts`
- `src/scripts/canvas/animations/text-utils.ts`
- `src/scripts/canvas/export.ts`
- targeted Playwright/spec files and manual checklist artifact(s)

**Primary risk:** subjective visual tuning can expand scope unless the phase gate uses explicit side-by-side review criteria.

## Don’t Hand-Roll

| Problem                     | Don’t Build                                          | Use Instead                                   | Why                                                     |
| --------------------------- | ---------------------------------------------------- | --------------------------------------------- | ------------------------------------------------------- |
| Style routing               | Per-call Claude style choice                         | Pure client selector matrix                   | Deterministic and testable                              |
| Mood behavior               | One-off easing math in every animation file          | Shared mood preset helper                     | Prevents drift and re-tuning overhead                   |
| Light-background behavior   | Per-file ad hoc opacity tweaks                       | Shared render-profile helper                  | Cross-cutting rule with many touchpoints                |
| Mobile particle performance | Inline `hardwareConcurrency` checks in one file only | Shared particle-budget helper                 | Enforces NFR-9 consistently                             |
| Text truncation             | Late truncation inside sprite constructors           | Boundary normalization before state is stored | Keeps preview, info panel, checkout, and export aligned |

## Common Pitfalls

### Pitfall 1: Version Still Does Not Participate In Generation

**What goes wrong:** the UI exposes v1/v2, but generated configs still behave as if version were advisory only.  
**Why it happens:** POST generate currently ignores `version`.  
**How to avoid:** make version part of the deterministic selector contract and align POST/GET cache handling.  
**Warning sign:** the same company generates a v2 style while `v1` is selected.

### Pitfall 2: `energyLevel` Starts Affecting Style Identity

**What goes wrong:** same `industryCategory + mood` yields different styles.  
**Why it happens:** energy gets used as a hidden tie-breaker.  
**How to avoid:** constrain `energyLevel` to motion intensity only.  
**Warning sign:** selector tests need energy-specific branches.

### Pitfall 3: Preview And Download Diverge

**What goes wrong:** users pay for an HTML asset that does not match the live preview.  
**Why it happens:** `src/scripts/canvas/export.ts` duplicates old animation logic.  
**How to avoid:** either update parity in this phase or document the deferment explicitly and visibly.  
**Warning sign:** live style fixes only modify `src/scripts/canvas/animations/*`.

### Pitfall 4: Company Name Is Still Only A DOM Overlay

**What goes wrong:** requirement says the animation itself should make the name dominant, but only static chrome changes.  
**Why it happens:** overlay text is easier to tune than scene typography.  
**How to avoid:** implement scene-level company-name reveal in the required hero styles.  
**Warning sign:** `NarrativeAnimation` and `SpotlightAnimation` still build only `visualElements` sprites.

### Pitfall 5: Z-Offset Alone Is Mistaken For Depth

**What goes wrong:** the scene still reads flat despite “depth” work.  
**Why it happens:** orthographic cameras do not create perspective.  
**How to avoid:** couple depth tier with scale, opacity, brightness, and speed.  
**Warning sign:** only `position.z` changes in the diff.

### Pitfall 6: Light-Background Fix Lands Only In One Or Two Styles

**What goes wrong:** some palettes still wash out badly.  
**Why it happens:** additive blending is spread across many files.  
**How to avoid:** enumerate every additive material site and route them through the same helper.  
**Warning sign:** `THREE.AdditiveBlending` remains in multiple untouched files after the phase.

## Code Examples

Verified patterns adapted to this codebase:

### Deterministic Selector Boundary

```ts
function resolveFetchedConfig(raw: CompanyConfig, version: string): CompanyConfig {
  const normalizedMood = normalizeMood(raw.mood);
  const normalizedIndustryCategory = normalizeIndustryCategory(raw.industryCategory);
  const visualElements = raw.visualElements.map(truncateVisualElement).slice(0, 5);

  return {
    ...raw,
    mood: normalizedMood,
    industryCategory: normalizedIndustryCategory,
    energyLevel: clamp01(raw.energyLevel),
    visualElements,
    animationStyle: selectAnimationStyle({
      version,
      industryCategory: normalizedIndustryCategory,
      mood: normalizedMood,
    }),
  };
}
```

### Shared Render Profile

```ts
function getRenderProfile(backgroundHex: string) {
  const lightness = getHexLightness(backgroundHex);
  if (lightness > 0.5) {
    return {
      blending: THREE.NormalBlending,
      opacityMultiplier: 0.7,
      isLightBackground: true,
    };
  }

  return {
    blending: THREE.AdditiveBlending,
    opacityMultiplier: 1,
    isLightBackground: false,
  };
}
```

### Company-Name Stagger For Hero Styles

```ts
const preset = getMoodPreset(config.mood);
const chars = buildCharacterSprites(config.companyName, config.colors.primary);
const stagger = preset.characterStagger;

chars.forEach((sprite, index) => {
  const revealAt = heroStart + index * stagger;
  const localProgress = getWindowedProgress(progress, revealAt, revealAt + preset.entryWindow);
  applyHeroReveal(sprite, localProgress, preset);
});
```

### Shared Particle Budget Helper

```ts
function getParticleCount(baseCount: number): number {
  const concurrency = navigator.hardwareConcurrency ?? 4;
  if (concurrency < 4) return Math.min(baseCount, 400);
  return baseCount;
}
```

## Environment Availability

| Dependency | Required By                                    | Available | Version                  | Fallback                                   |
| ---------- | ---------------------------------------------- | --------- | ------------------------ | ------------------------------------------ |
| Node.js    | Root scripts and any pure unit/helper tests    | Yes       | `v22.22.1`               | None needed                                |
| npm        | Root Playwright validation and package scripts | Yes       | `10.9.4`                 | None needed                                |
| Wrangler   | Worker-local smoke validation                  | Yes       | `4.77.0`                 | `npm` scripts inside `workers/company-api` |
| Playwright | Browser validation                             | Yes       | repo dependency `1.58.2` | Manual browser validation if needed        |

## Validation Architecture

### Test Framework

| Property           | Value                                                       |
| ------------------ | ----------------------------------------------------------- |
| Framework          | Playwright E2E (`@playwright/test` 1.58.2)                  |
| Config file        | `playwright.config.ts`                                      |
| Quick run command  | `npx playwright test e2e/canvas.spec.ts --project=chromium` |
| Full suite command | `npm run test`                                              |

### Phase Requirements To Validation Map

| Req ID | Behavior                                               | Test Type                             | Automated Command / Method                             | File Exists?                |
| ------ | ------------------------------------------------------ | ------------------------------------- | ------------------------------------------------------ | --------------------------- |
| FR-2.1 | worker returns semantic fields with safe values        | contract / unit                       | add pure normalization tests or worker-route smoke     | No - Wave 0 gap             |
| FR-2.2 | same semantic payload resolves to same style           | pure selector test + E2E              | pure selector spec plus `e2e/canvas.spec.ts` extension | No - Wave 0 gap             |
| FR-2.3 | five moods are visually distinct                       | manual side-by-side comparison        | manual matrix using fixed payloads                     | No - manual artifact needed |
| FR-2.4 | company name dominates; staggered reveal in two styles | manual visual + browser smoke         | manual review with fixed fixtures                      | No - manual artifact needed |
| FR-2.5 | light backgrounds avoid washout                        | browser smoke + manual visual         | add light-palette fixture path or mocked payload       | No - Wave 0 gap             |
| FR-2.6 | `visualElements` truncate before sprite creation       | pure normalization test               | helper test                                            | No - Wave 0 gap             |
| FR-2.7 | particles/geometric show layered depth with clean seam | manual visual + targeted code review  | manual checklist                                       | No - manual artifact needed |
| NFR-9  | low-concurrency devices cap particle counts            | helper/unit + mobile Playwright smoke | helper test and `mobile-chrome` project smoke          | No - Wave 0 gap             |

### Sampling Rate

- **Per task commit:** run targeted selector/helper tests plus the smallest relevant Playwright canvas check.
- **Per plan merge:** run `e2e/canvas.spec.ts` and `e2e/particles-loop.spec.ts` in Chromium.
- **Phase gate:** full browser pass plus a manual side-by-side mood matrix and light-background review.

### Wave 0 Gaps

- No existing pure test harness for selector, normalization, render-profile, or particle-budget helpers.
- No worker contract tests around generated semantic fields.
- No current fixture-based visual review artifact for the five moods.
- No current explicit preview/export parity check for Company Canvas downloads.

## Open Questions

1. **Should Phase 2 update `src/scripts/canvas/export.ts` for parity, or is divergence acceptable until Phase 3?**
   - What we know: the current paid artifact is still HTML export, and it duplicates outdated animation logic.
   - What is unclear: whether the phase should spend effort on a subsystem that Phase 3 may replace for video export.
   - Recommendation: update parity for any user-visible live-preview changes that affect paid output, or explicitly defer with approval.

2. **How strict should backward compatibility be for worker-returned `animationStyle`?**
   - What we know: FR-2.1 keeps existing fields, but FR-2.2 says Claude must not choose style at call time.
   - What is unclear: whether the worker should still emit a legacy style value or leave it as client-overwritten output.
   - Recommendation: keep the field for compatibility, but treat it as client-overwritten immediately after fetch.

3. **Should company-name hero treatment extend beyond `NarrativeAnimation` and `SpotlightAnimation` in Phase 2?**
   - What we know: those two are mandatory, and other styles already have the DOM overlay.
   - What is unclear: whether the product bar expects deeper in-scene name treatment across all eight styles.
   - Recommendation: satisfy the strict requirement in the two mandated styles and audit the rest via overlay hierarchy rather than expanding scope prematurely.

## Sources

### Primary (HIGH confidence)

- `CLAUDE.md` - project constraints, canvas architecture, and SPA script rules
- `.planning/STATE.md` - phase readiness and locked project decisions
- `.planning/ROADMAP.md` - Phase 2 goal, success criteria, and dependency boundaries
- `.planning/REQUIREMENTS.md` - FR-2.1 through FR-2.7 and NFR-9
- `.planning/phases/01-codebase-stabilization/01-RESEARCH.md` - inherited seam-quality and validation standards
- `.planning/phases/01-codebase-stabilization/01-CONTEXT.md` - deterministic loop and review constraints carried forward
- `workers/company-api/src/index.ts` - current worker schema and routing behavior
- `workers/company-api/src/normalize.ts` - cache key behavior
- `workers/company-api/src/stripe.ts` - config persistence path for checkout/download
- `src/scripts/canvas/types.ts` - shared config contract
- `src/scripts/canvas/main.ts` - fetch, state normalization point, and renderer startup
- `src/scripts/canvas/renderer.ts` - authoritative animation instantiation path
- `src/scripts/canvas/versions.ts` - version-family split
- `src/scripts/canvas/animations/base.ts` - deterministic loop helpers
- `src/scripts/canvas/animations/particles.ts`
- `src/scripts/canvas/animations/geometric.ts`
- `src/scripts/canvas/animations/narrative.ts`
- `src/scripts/canvas/animations/spotlight.ts`
- `src/scripts/canvas/animations/constellation.ts`
- `src/scripts/canvas/animations/flowing.ts`
- `src/scripts/canvas/animations/text-utils.ts`
- `src/scripts/canvas/export.ts` - preview/export parity and duplicated animation logic
- `e2e/canvas.spec.ts` and `e2e/particles-loop.spec.ts` - current validation baseline

### Secondary (MEDIUM confidence)

- `.planning/research/BRAND_ANIMATION.md` - motion-design research and known Phase 2 concerns
- `.planning/research/SUMMARY.md` - roadmap-level synthesis and previously identified nondeterminism risk
- `.planning/codebase/CONCERNS.md` - schema-size and export divergence risks that intersect Phase 2

## Metadata

**Confidence breakdown:**

- Standard stack: HIGH - all tools and libraries are already present in the repo and locally available.
- Architecture: HIGH - the current code makes the required touchpoints and sequencing constraints explicit.
- Motion calibration: MEDIUM - the quality bar for mood presets and typographic dominance still needs visual tuning.
- Pitfalls: HIGH - preview/export drift, version-routing gaps, and schema-growth risks are directly observable in source.

**Research date:** 2026-04-02  
**Valid until:** 2026-05-02
