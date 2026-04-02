# Project Research Summary

**Project:** Company Canvas — Animated Brand Asset Generator
**Domain:** Generative browser-side animation with AI-driven brand analysis and pay-per-download export
**Researched:** 2026-04-02
**Confidence:** HIGH (rendering stack, competitor landscape), MEDIUM (video export browser compatibility, color theory rules)

---

## Executive Summary

Company Canvas sits in an underserved niche: fully generative brand animation with instant live preview, no template browsing, and a pay-once download model. Every major competitor (Canva, Renderforest, Animaker, Jitter) either forces subscription lock-in, requires account creation before export, or produces template-based output that looks identical across thousands of users. The Three.js generative approach combined with Claude AI brand analysis already differentiates on the two axes competitors are weakest at — genuine brand specificity and zero friction to first preview. The architecture and rendering stack are already solid. What remains is closing three gaps: (1) video export, (2) animation polish, and (3) making the AI-driven differentiation more visible to users.

The recommended technical path is well-validated. The existing codebase uses Three.js r183 with an OrthographicCamera, established sprite/particle patterns, and a clean render loop — exactly the right foundation for video export via `canvas.captureStream(0)` + `MediaRecorder`. The primary export target is WebM (Chrome/Firefox, ~65–70% of desktop users) with a WebCodecs + `mp4-muxer` upgrade path that reaches Safari 26.1+. No new rendering libraries are needed; everything is achievable with existing Three.js primitives. The critical architectural requirement for video export is that the animation clock must become externally drivable — the current `THREE.Clock` tied to wall time must be replaceable with a synthetic counter during export.

The highest risks are not technical unknowns — they are known patterns that need to be implemented correctly. The most critical: the animation clock refactor required before any export can be reliable, the `preserveDrawingBuffer: true` requirement on the WebGL renderer, and the nondeterminism in Claude's `animationStyle` selection (same company input can produce different styles on cache miss). A secondary risk is the existing draw-call explosion in `GeometricAnimation` (one material per shape instead of shared materials), which needs fixing before adding more animation complexity. The research-to-roadmap path is clear: fix the known regressions first, then build export, then add polish and new animation styles.

---

## Key Findings

### Rendering Stack (from SPRITES.md)

The existing Three.js rendering stack is correct and needs targeted improvements, not a rewrite. Two patterns that need immediate fixes are identified, along with clear upgrade paths.

**Core technologies (already in place):**

- `THREE.Sprite` + `CanvasTexture`: text labels and procedural industry icons — correct pattern, used throughout
- `THREE.Points` + `PointsMaterial` with `vertexColors: true`: particle fields — correct pattern, already optimal for draw call budget
- `THREE.MeshBasicMaterial` + `BufferGeometry`: geometric shapes — correct, but `GeometricAnimation` creates one material per shape instead of sharing, causing a draw-call explosion (~20 draw calls where ~3 is possible)
- `AdditiveBlending` throughout: additive blending on dark backgrounds is the single biggest free visual quality lever — already used correctly

**Immediate fixes needed (before adding features):**

- `GeometricAnimation` material sharing: creates a new `MeshBasicMaterial` per shape; fix by grouping shapes by palette index and sharing one material per color
- Icon colorization: draw functions bake color into canvas pixels; convert to white-on-transparent and apply color via `SpriteMaterial.color` (Pattern A tinting) to enable runtime recoloring without texture re-upload
- Soft particle texture: add a 64×64 radial gradient `CanvasTexture` as `PointsMaterial.map`; all particle animations immediately look more polished with zero architectural change

**Validated not needed:**

- No new animation libraries (GSAP, three-SpriteMixer, CCapture.js, InstancedSpriteMesh) — Three.js primitives cover all requirements
- Sprite sheet flipbooks — not relevant to this use case
- Custom `ShaderMaterial` — not needed for any current or planned animation style

### Expected Features (from BRAND_ANIMATION.md + COMPETITIVE.md)

The market validates the existing feature direction. The gaps to close are export quality and animation parameter expressiveness.

**Must have (table stakes — users will compare against Canva):**

- Non-linear easing on all motion — linear movement is the single strongest "amateur" signal; the codebase currently uses basic linear/sin lerps
- Clean loop seam — animation must return to start state without visual pop; `Particles` currently has unbounded velocity accumulation that drifts after one loop
- MP4/WebM video export at 1080p — the current HTML export differentiates, but users expect a downloadable video
- Brand colors visibly driving the animation — already implemented via Claude AI analysis; protect this
- Typography hierarchy — company name must be the dominant typographic element with correct weight and spacing

**Should have (competitive differentiators):**

- `mood` field in Claude's JSON response (`bold | elegant | playful | minimal | dynamic`) to drive easing presets deterministically, not heuristically
- Multiple export aspect ratios — 1920×1080 (LinkedIn/web), 1080×1080 (Instagram feed), 1080×1920 (Reels/TikTok)
- Layered depth / parallax — foreground elements faster/brighter than background; currently absent in Particles and Geometric
- Staggered per-character text reveal for company name — `createTextSprite` utility exists; needs a character-splitting loop
- At least one new animation style from the recommended set (ORBIT or PULSE are highest value for underserved industries)

**Defer to v2+:**

- Real-time audio/music sync
- User-uploaded logo SVG (SVGLoader path is documented but adds UX complexity)
- Transparent background export (GIF/APNG/WebM with alpha)
- Server-side rendering for Safari/iOS (Safari cannot capture canvas; solving this requires a server)
- `logo-reveal` style with SVG path draw animation (high value but requires SVGLoader integration and per-frame canvas updates)

### Architecture Approach (from SPRITES.md + VIDEO_EXPORT.md)

The current architecture is a clean `CanvasRenderer` class driving a `WebGLRenderer` on an `HTMLCanvasElement` via a `requestAnimationFrame` loop. The render loop is the central integration point for video export. One structural refactor is required and nothing else needs to change.

**Major components:**

1. `CanvasRenderer` — owns the Three.js scene, camera, renderer, and animation loop; must gain an `exportMode` flag and a synthetic clock parameter before video export can work
2. `BaseAnimation` + 8 concrete animation classes — each owns its scene graph; the `GeometricAnimation` material-sharing fix is the only pre-requisite change needed here
3. Cloudflare Worker (brand analysis) — receives company name + colors, returns `CompanyConfig` JSON via Claude AI; needs `mood`, `industryCategory`, and `energyLevel` fields added to the schema to enable deterministic style selection
4. Export subsystem (to be built) — wraps the existing render loop with a synthetic clock, drives `captureStream(0)` + `MediaRecorder`, assembles and triggers download; lives as an `ExportController` class that takes a `CanvasRenderer` reference
5. Payment gate (Stripe, existing) — triggers download after payment confirmation; no changes needed to integrate with video export

**Key architectural constraint:** The `ExportController` must use a separate offscreen canvas renderer instance (not the live preview canvas) to avoid freezing the UI during export. The user watches the live preview while the offscreen canvas renders deterministically.

### Critical Pitfalls (consolidated across all research files)

1. **Animation clock not externalized before export** — `clock.getElapsedTime()` returns wall time; during frame-by-frame export this produces wrong elapsed values for later frames. Fix: add `manualElapsed` parameter to the render loop; when set, use it instead of `clock`. This is the single most critical prerequisite for video export. (VIDEO_EXPORT.md)

2. **`preserveDrawingBuffer` not set on renderer** — Without `preserveDrawingBuffer: true`, the WebGL back buffer is cleared after each `render()` call; `captureStream()` and `createImageBitmap()` return blank frames. The current renderer does not set this flag. Either add the flag (slight performance cost) or call `requestFrame()` synchronously inside the render callback before the buffer clears. (VIDEO_EXPORT.md)

3. **Loop seam pop from accumulated state** — `ParticlesAnimation` uses `velocities[i] * t * 60` (unbounded accumulation). After one loop the state does not match frame 0. All position/opacity values must be computed from `f(sin/cos(progress * 2π))` where `progress = (elapsed % LOOP_DURATION) / LOOP_DURATION`. This is a correctness regression that makes the current export HTML visually degrade over time. (BRAND_ANIMATION.md)

4. **Style selection nondeterminism** — Claude picks `animationStyle` freeform with no exposed `industryCategory` or `mood` intermediate. Same input, different API call → different style. Fix: add `industryCategory` and `mood` enums to the Claude response schema; make style selection rule-based on the client using these axes. (BRAND_ANIMATION.md)

5. **`GeometricAnimation` draw-call explosion** — Creates one `MeshBasicMaterial` per shape. 20 shapes = 20 draw calls. Fix is two lines: create palette array of 3 shared materials, assign `palette[i % 3]` per shape. Fix before adding any new animation complexity. (SPRITES.md)

6. **iOS Safari has no video export path** — `canvas.captureStream()` is not supported on iOS; `MediaRecorder` WebM is not supported on any Safari. Do not ship a broken export button. Gate the feature with `MediaRecorder.isTypeSupported()` and show a clear fallback message directing to Chrome/Firefox, or offer the existing HTML export as the fallback. (VIDEO_EXPORT.md)

7. **`VideoFrame` objects must be closed after encoding** — In the WebCodecs path, each `VideoFrame` holds GPU memory. Failing to call `frame.close()` after encoding causes a stall after ~50 frames. (VIDEO_EXPORT.md)

---

## Implications for Roadmap

### Phase 1: Codebase Stabilization

**Rationale:** Three known regressions exist that will corrupt any feature built on top of them: the loop seam in Particles, the draw-call explosion in Geometric, and the icon colorization lock-in. These are not new work — they are fixes that unblock everything else. Until the loop seam is fixed, exported HTML already delivers degraded quality. Until material sharing is fixed, adding new animation styles multiplies a performance problem.

**Delivers:** A stable, performant baseline where all 8 existing animation styles loop cleanly, render efficiently, and support runtime recoloring.

**Addresses:**

- Fix `ParticlesAnimation` velocity accumulation → deterministic `sin/cos(progress)` positions
- Fix `GeometricAnimation` material sharing → one material per palette color
- Convert icon `DrawFn` functions to white-on-transparent; move color to `SpriteMaterial.color`
- Add 64×64 radial gradient texture to all `PointsMaterial.map` instances (immediate visual quality improvement, trivial effort)

**Avoids:** Loop seam pop pitfall, draw-call explosion pitfall, icon recolor pitfall

**Research flags:** Standard patterns — no phase research needed.

---

### Phase 2: Animation Quality + Claude Schema Upgrade

**Rationale:** The competitive quality bar is non-linear easing and temporal arc (intro / hold / resolution). The current animations use basic linear/sin lerps and a single `speed` float that cannot express mood. This phase upgrades animation expressiveness before adding new styles or export, so new styles start from a quality baseline, not a linear-lerp baseline. The Claude schema upgrade is coupled here because new animation parameters need new inputs.

**Delivers:** Animations that clear the "more premium than Canva" bar. Claude returns structured `mood` and `industryCategory` fields. Style selection becomes deterministic.

**Addresses:**

- Add `mood` enum and `industryCategory` enum to Claude worker response schema
- Add `energyLevel` float and `palette.temperature` field
- Implement easing presets per mood: bold (fast ease-in, hard stop), elegant (slow ease-in-out), playful (spring/overshoot)
- Add `entrySpeed` and `holdIntensity` as separate parameters (replace single `speed` float)
- Make style selection rule-based on client from `industryCategory × mood` axes
- Staggered per-character company name reveal in `NarrativeAnimation` and `SpotlightAnimation`
- Add layered depth (z-offset + speed variation) to `ParticlesAnimation` and `GeometricAnimation`
- Fix `Spotlight` and `Narrative` timing hierarchy: brand name is last to appear, longest hold duration
- Guard blending mode: if background lightness > 50%, switch `AdditiveBlending` to `NormalBlending` with `opacity: 0.7`
- Enforce `visualElement` max length (12 chars) in Claude prompt to prevent sprite texture overflow

**Avoids:** Style nondeterminism pitfall, single-axis mood parameter pitfall, light-background blending bug

**Research flags:** Easing spring parameters may need tuning in practice — standard cubic-bezier values are documented but visual feel requires iteration.

---

### Phase 3: Video Export

**Rationale:** MP4/WebM export is the table-stakes feature that turns this from a demo into a deliverable product. It must come after Phase 1 (loop seam fix is mandatory — exporting a broken loop produces permanently wrong output) and is independent of Phase 2 (animation quality). The architecture requires one structural change to `CanvasRenderer` (externalized clock) and a new `ExportController` class.

**Delivers:** Downloadable WebM at 1920×1080 / 30fps in Chrome and Firefox (65–70% of desktop users). Progress indicator. UI stays responsive during export via offscreen canvas.

**Addresses:**

- Add `exportMode: boolean` and `manualElapsed: number` to `CanvasRenderer`
- Add `preserveDrawingBuffer: true` to `WebGLRenderer` instantiation (or synchronous `requestFrame()` pattern)
- Implement `ExportController`: synthetic clock loop, `captureStream(0)`, `MediaRecorder`, chunk assembly, download trigger
- Use separate offscreen canvas renderer for export (live preview continues uninterrupted)
- Force `renderer.setPixelRatio(1)` and `renderer.setSize(1920, 1080)` during export
- Add 100ms warm-up delay before recording starts (first frames may be partially initialized)
- Reduce particle count by 30% in export mode to offset encode overhead
- Gate feature with `MediaRecorder.isTypeSupported()` — show clear Safari fallback message
- Show "Keep this tab active during export" warning

**Tier 2 upgrade (same phase, behind runtime flag):**

- `if ('VideoEncoder' in window)`: use WebCodecs + `mp4-muxer` for true MP4 output
- `VideoFrame.close()` after each encode (prevents GPU memory stall after ~50 frames)

**Avoids:** Clock externalization pitfall, `preserveDrawingBuffer` pitfall, iOS blank-export pitfall, `VideoFrame` leak pitfall

**Research flags:** WebCodecs + `mp4-muxer` integration is well-documented but the frame submission loop needs careful timing — recommend a spike implementation before committing to the full export UX.

---

### Phase 4: Export UX + Multiple Aspect Ratios

**Rationale:** The export experience is a direct conversion driver. Users who get a clean 1080p WebM that works immediately in LinkedIn/Instagram will convert to paid again. The aspect ratio selection (16:9 / 1:1 / 9:16) is a single UI addition with outsized impact — it addresses the full social media workflow without rebuilding anything in the renderer.

**Delivers:** Export modal with format/aspect-ratio selection, progress bar, estimated time, and download confirmation. Social-ready presets.

**Addresses:**

- Export modal UI: format selector (WebM / MP4), aspect ratio selector (16:9 / 1:1 / 9:16), quality selector (1080p / 720p)
- Canvas resize logic in `ExportController` for non-16:9 aspect ratios
- Progress bar (frame N of total N frames)
- "Keep tab active" warning

**Avoids:** Tab-visibility throttle pitfall (warn the user), 4K overhead pitfall (`setPixelRatio(1)` already required)

**Research flags:** Standard UX patterns — no phase research needed.

---

### Phase 5: New Animation Styles

**Rationale:** Five new styles are documented in BRAND_ANIMATION.md, mapped to underserved industry × mood combinations. New styles are highest value after export is working — a new style without export is a preview feature; a new style with export is a new product offering for a different industry vertical.

**Priority order based on coverage gaps:**

1. **ORBIT** (central brand name + satellite keywords orbiting at different radii) — covers Creative, Entertainment, Platform businesses; `visualElements` array is already the exact data this needs
2. **PULSE** (concentric rings expanding outward, brand name fades in at center) — covers Finance, Insurance, Healthcare, Government; most underserved by current 8 styles
3. **SIGNAL** (grid-aligned node-edge graph, rectilinear) — covers Tech/SaaS more precisely than Constellation (organic) and Timeline (sequential)

**Delivers:** 3 additional styles with proper `industryCategory × mood` mappings; Claude schema updated to include new style IDs

**Avoids:** Non-deterministic style selection (already fixed in Phase 2)

**Research flags:** ORBIT trail rendering (fading trails behind satellites) has multiple implementation approaches — `Line2` vs per-vertex opacity buffer vs particle trail. Recommend research spike before implementation.

---

### Phase Ordering Rationale

- Phase 1 before everything: loop seam regression and draw-call explosion are defects, not features. Skipping them means each subsequent phase inherits compounding quality debt.
- Phase 2 before Phase 3: exporting a low-quality animation produces a low-quality file. The quality bar must be raised before encoding is the bottleneck.
- Phase 3 before Phase 4: export UX requires the underlying export mechanism to exist. No point designing the modal before the encoder works.
- Phase 5 after Phase 3: new styles without export are preview-only; with export, each style is a distinct product offering for a different industry vertical.
- Phase 2 and Phase 5 are the only phases that touch the Cloudflare Worker / Claude prompt. Coupling the schema changes to Phase 2 means Phase 5 only needs to add new style IDs, not restructure the API.

### Research Flags

Phases likely needing a research spike during planning:

- **Phase 3 (Video Export):** The WebCodecs + `mp4-muxer` frame submission loop is well-documented in isolation but untested against the specific `CanvasRenderer` architecture. A 1-hour spike (render 30 frames to a file, verify output) is strongly recommended before building the full export UX.
- **Phase 5 (ORBIT trails):** Trail rendering approach needs a decision — `Line2` (clean, fat lines), per-vertex opacity fade on a `BufferGeometry` (more control), or spawning a particle trail per satellite (most flexible, higher CPU). Pick one before implementation.

Phases with standard patterns (skip research):

- **Phase 1:** All fixes are in the existing codebase with documented solutions.
- **Phase 2:** Easing math and Claude schema changes are well-understood; the challenge is visual calibration, not technical research.
- **Phase 4:** Export modal UX is standard UI work.

---

## Confidence Assessment

| Area                   | Confidence | Notes                                                                                                                                                                                                |
| ---------------------- | ---------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Rendering / Three.js   | HIGH       | Codebase read + Three.js docs + community sources. Specific bugs identified with line-level precision.                                                                                               |
| Video Export           | MEDIUM     | Core APIs (captureStream, MediaRecorder, WebCodecs) are well-documented. Browser compatibility table is verified. Exact timing behavior under GPU load is hardware-dependent and may require tuning. |
| Brand Animation Design | HIGH       | Motion design principles are stable and well-sourced. Social media specs are current as of early 2026 but shift fast — verify before shipping.                                                       |
| Competitive Landscape  | MEDIUM     | Based on public pricing pages and review sites; no direct API/UX access to competitors. Pricing may have changed.                                                                                    |

**Overall confidence:** HIGH for build decisions, MEDIUM for market timing and Safari compatibility specifics.

### Gaps to Address

- **Safari video export:** No reliable browser-side path exists today. Safari 26.1 (future) adds WebCodecs support. Until that ships, Safari users get the HTML export as fallback. This is a known gap, not a blocker — document it explicitly in the export UX.
- **Easing visual calibration:** The documented cubic-bezier values for each mood are starting points, not final values. Plan for a visual calibration pass after initial implementation where all 5 mood presets are compared side-by-side.
- **Claude prompt engineering for structured fields:** Adding `mood`, `industryCategory`, `energyLevel`, and `palette.temperature` to the schema requires prompt updates in the Cloudflare Worker. The exact prompt phrasing to get consistent enum values from Claude needs testing — allocate time for prompt iteration.
- **Export file size on slow connections:** A 12-second 1080p WebM at 4 Mbps is ~6 MB. For users on slow connections, this is a noticeable download. Consider offering a 720p option (target: ~2 MB) as the default with 1080p as "high quality."
- **Mobile GPU performance:** 800 particles at full density may drop below 30 fps on low-end Android. The existing `density` parameter handles this conceptually, but a hard mobile cap (`navigator.hardwareConcurrency < 4` → max 400 particles) is needed.

---

## Sources

### Primary (HIGH confidence)

- Three.js documentation: `SpriteMaterial`, `PointsMaterial`, `CanvasTexture`, `InstancedMesh` — https://threejs.org/docs/
- MDN: MediaStream Recording API — https://developer.mozilla.org/en-US/docs/Web/API/MediaStream_Recording_API
- MDN: MediaRecorder.isTypeSupported() — https://developer.mozilla.org/en-US/docs/Web/API/MediaRecorder/isTypeSupported_static
- Can I use: MediaRecorder API — https://caniuse.com/mediarecorder
- Can I use: WebCodecs API — https://caniuse.com/webcodecs
- Codebase read: `src/scripts/canvas/**` (Three.js r183, April 2026)

### Secondary (MEDIUM confidence)

- Three.js forum: CanvasTexture performance (Firefox/Safari) — https://discourse.threejs.org/t/canvas-texture-update-cause-performance-issue-in-firefox-and-safari/7441
- Three.js forum: SpriteMaterial HSL quirk — https://discourse.threejs.org/t/changing-hue-or-saturation-not-working-in-a-spritematerial-using-sethsl/14338
- devtails.xyz: Save HTML Canvas to MP4 via WebCodecs — https://devtails.xyz/adam/how-to-save-html-canvas-to-mp4-using-web-codecs-api
- npm: mp4-muxer — https://www.npmjs.com/package/mp4-muxer
- Codrops: Building Efficient Three.js Scenes (Feb 2025) — https://tympanus.net/codrops/2025/02/11/building-efficient-three-js-scenes-optimize-performance-while-maintaining-quality/
- School of Motion: State of Motion Design 2025 — https://www.schoolofmotion.com/blog/eoy2025
- Jitter Reviews 2026 — G2 — https://www.g2.com/products/jitter-jitter/reviews
- Renderforest Reviews 2026 — Capterra — https://www.capterra.com/p/141544/Renderforest/reviews/
- LottieFiles: Color Theory for Motion Design — https://lottiefiles.com/blog/tips-and-tutorials/color-theory-for-motion-design

### Tertiary (LOW confidence)

- Social media video specs (Sprinklr) — https://www.sprinklr.com/blog/social-media-video-sizes/ — specs shift frequently; verify before shipping
- WebKit Bug 181663: canvas.captureStream on iOS — https://bugs.webkit.org/show_bug.cgi?id=181663 — bug may be resolved in future WebKit versions

---

_Research completed: 2026-04-02_
_Ready for roadmap: yes_
