# Roadmap — Company Canvas

## Overview

5 phases. Build order is dependency-driven: stabilize first, polish second, export third, UX fourth, expand fifth.

```
Phase 1: Codebase Stabilization      ← fixes 3 regressions that corrupt all downstream work
Phase 2: Animation Quality            ← quality bar before encoding; Claude schema upgrade
Phase 3: Video Export                 ← core export mechanism (offscreen canvas + MediaRecorder)
Phase 4: Export UX + Aspect Ratios    ← export modal, progress bar, social media presets
Phase 5: New Animation Styles         ← ORBIT, PULSE, SIGNAL
```

---

## Phase 1: Codebase Stabilization

**Goal:** All 8 existing animation styles loop cleanly, render efficiently, and support runtime recoloring. No regressions exported.

**Requirements:** FR-1.1 – FR-1.5

**Plans:** 3 plans

Plans:

- [ ] 01-01-PLAN.md — Deterministic particle loop refactor (FR-1.1)
- [ ] 01-02-PLAN.md — Geometric material pooling and deterministic transforms (FR-1.2)
- [ ] 01-03-PLAN.md — Icon tinting, particle polish, and 8-style seam validation (FR-1.3 to FR-1.5)

**Success criteria:**

- `ParticlesAnimation` completes 3 consecutive loops with no visual state drift at the seam
- `GeometricAnimation` renders in ≤ 3 draw calls for a default scene
- Icon sprites recolor correctly at runtime by changing `SpriteMaterial.color` (no texture re-upload)
- All particle systems render with soft round dots (not square pixels)
- Zero visual pop on loop wrap-around across all 8 styles

**Research needed:** None — all fixes are identified with line-level precision in SPRITES.md and BRAND_ANIMATION.md.

**Key risks:**

- Loop seam fix changes animation timing — visual regression test all 8 styles after
- Material sharing refactor in `GeometricAnimation` may require updating the color-update path that currently calls `material.color.set()` per-shape

---

## Phase 2: Animation Quality + Claude Schema Upgrade

**Goal:** Animations clear the "more premium than Canva" bar. Claude returns structured `mood` and `industryCategory` fields. Style selection is deterministic.

**Requirements:** FR-2.1 – FR-2.7

**Success criteria:**

- Claude worker returns `mood`, `industryCategory`, `energyLevel` in every response
- Same company name + colors always produces the same animation style (deterministic selection)
- Each of the 5 mood presets has a visually distinct motion character (side-by-side comparison)
- Company name is the dominant element with per-character staggered reveal in at least 2 styles
- Light background (> 50% lightness) no longer causes washed-out additive blending artifacts
- `visualElement` truncation at 12 chars prevents sprite overflow

**Research needed:** None — easing math and Claude schema changes are well-understood patterns.

**Key risks:**

- Claude prompt engineering for new enum fields needs iteration — allocate time for prompt testing
- Easing visual calibration is subjective — plan a side-by-side comparison pass before declaring done
- `NarrativeAnimation` and `SpotlightAnimation` timing refactor may shift scene pacing

---

## Phase 3: Video Export

**Goal:** Users can download the current animation as a WebM/MP4 video file from the browser, gated behind Stripe payment.

**Requirements:** FR-3.1 – FR-3.11, NFR-2, NFR-3, NFR-7

**Success criteria:**

- Clicking "Download" after Stripe payment triggers a WebM download on Chrome/Firefox
- Downloaded file plays correctly in VLC, QuickTime, and browser `<video>` with no visual artifacts
- Live preview canvas remains active and unaffected during export
- Export progress indicator is visible and accurate
- Safari/iOS shows a clear fallback message (not a broken export)
- 12-second 1080p WebM is ≤ 10 MB
- Export completes in ≤ 36 seconds on a 4-core desktop
- Chrome/Edge produces MP4 output via WebCodecs path (when `VideoEncoder` available)

**Research flags:** WebCodecs + `mp4-muxer` frame submission loop needs a 1-hour spike against the actual `CanvasRenderer` before full implementation. Verify 30 frames render correctly to a file before building the full export UX.

**Key risks:**

- `preserveDrawingBuffer: true` has a GPU memory cost — benchmark before/after on integrated graphics
- `THREE.Clock` externalization touches every animation class's update method — thorough regression testing needed
- Offscreen canvas is a separate WebGL context — some GPU drivers limit concurrent contexts

---

## Phase 4: Export UX + Aspect Ratios

**Goal:** Export modal with format/aspect-ratio selection, progress bar, and social-ready presets.

**Requirements:** FR-4.1 – FR-4.5, NFR-4

**Success criteria:**

- Export modal opens cleanly in both EN and PT
- 16:9 / 1:1 / 9:16 all produce correctly proportioned output (no letterboxing, correct canvas resize)
- 720p option produces a file ≤ 3 MB
- "Keep tab active" warning is displayed during export
- All strings present in both `en.json` and `pt.json`

**Research needed:** None — standard modal UX.

**Key risks:**

- Canvas resize for 9:16 (portrait) in Three.js OrthographicCamera requires recalculating frustum bounds — test all animation styles in portrait before shipping

---

## Phase 5: New Animation Styles

**Goal:** 3 new styles covering industry verticals underserved by the current 8.

**Requirements:** FR-5.1 – FR-5.5, NFR-1, NFR-6

**Priority order:**

1. **ORBIT** — central name + orbiting satellite keywords (Creative/Entertainment/Platform)
2. **PULSE** — expanding concentric rings (Finance/Health/Government)
3. **SIGNAL** — grid node-edge graph (Tech/bold)

**Success criteria:**

- Each new style loops cleanly at 12 seconds (no seam pop)
- Each style uses Phase 2 easing presets
- Each style correctly maps to at least 2 `industryCategory` values in the selection matrix
- Claude worker updated to include new style IDs
- All 3 styles match visual quality of existing Phase-2-polished styles

**Research flags:** ORBIT trail rendering approach (satellite fading trails) needs a decision before implementation — `Line2` vs per-vertex opacity buffer vs particle trail. Pick one approach and spike before full build.

**Key risks:**

- ORBIT trail rendering is the highest-complexity animation primitive in the project — time-box the spike
- Adding 3 styles to Claude's selection logic requires prompt re-testing to ensure correct routing

---

## Phase Dependencies

```
Phase 1 ──► Phase 2 ──► Phase 3 ──► Phase 4
                    └─────────────────────────► Phase 5
```

Phase 5 depends on Phase 2 (Claude schema, easing presets, deterministic selection) but NOT on Phases 3–4. If export is blocked, Phase 5 can be built in parallel after Phase 2.

---

## Requirements Coverage

| Requirement                        | Phase                                    |
| ---------------------------------- | ---------------------------------------- |
| FR-1.1 – FR-1.5 (stabilization)    | Phase 1                                  |
| FR-2.1 – FR-2.7 (quality + schema) | Phase 2                                  |
| FR-3.1 – FR-3.11 (video export)    | Phase 3                                  |
| FR-4.1 – FR-4.5 (export UX)        | Phase 4                                  |
| FR-5.1 – FR-5.5 (new styles)       | Phase 5                                  |
| NFR-1 (60 fps preview)             | Phase 1 (baseline), Phase 5 (new styles) |
| NFR-2 (export speed)               | Phase 3                                  |
| NFR-3 (file size)                  | Phase 3                                  |
| NFR-4 (bilingual)                  | Phase 4                                  |
| NFR-5 (astro:page-load)            | Phase 3                                  |
| NFR-6 (no new libs)                | All                                      |
| NFR-7 (no server render)           | Phase 3                                  |
| NFR-8 (static deploy)              | All                                      |
| NFR-9 (mobile particle cap)        | Phase 2                                  |

---

_Created: 2026-04-02 — based on research synthesis_
_Phases: 5_
_Ready to plan: Phase 1_
