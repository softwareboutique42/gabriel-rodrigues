# Requirements — Company Canvas

## Functional Requirements

### FR-1: Codebase Stabilization

**FR-1.1** The `ParticlesAnimation` render loop MUST compute all particle positions as a pure function of `sin/cos(progress × 2π)` where `progress = (elapsed % LOOP_DURATION) / LOOP_DURATION`. Unbounded velocity accumulation (`velocities[i] * t * 60`) is a correctness defect.

**FR-1.2** `GeometricAnimation` MUST share one `MeshBasicMaterial` per palette color index, not create a new material per shape. Maximum 3 draw calls for palette-sized shape sets.

**FR-1.3** Icon draw functions MUST render white-on-transparent and use `SpriteMaterial.color` for brand color application. Color MUST NOT be baked into canvas pixel data.

**FR-1.4** All `PointsMaterial` instances MUST use a 64×64 radial gradient `CanvasTexture` as `.map`. Square-pixel particles are not acceptable for a "polished" output.

**FR-1.5** All 8 existing animation styles MUST complete a full 12-second loop and return visually to the exact start state without any perceptible pop or jump at the seam.

---

### FR-2: Animation Quality + Claude Schema

**FR-2.1** The Cloudflare Worker MUST return `mood`, `industryCategory`, and `energyLevel` as structured fields in the `CompanyConfig` JSON response, in addition to the existing fields.

- `mood`: `"bold" | "elegant" | "playful" | "minimal" | "dynamic"`
- `industryCategory`: `"tech" | "finance" | "health" | "retail" | "creative" | "food" | "other"`
- `energyLevel`: float 0–1

**FR-2.2** Animation style selection MUST be deterministic on the client: given the same `industryCategory` and `mood`, the same animation style MUST always be selected. Claude MUST NOT make this selection at call time.

**FR-2.3** Each mood value MUST map to a distinct easing preset:

- `bold` → fast ease-in, hard stop
- `elegant` → slow ease-in-out (cubic)
- `playful` → spring/overshoot
- `minimal` → subtle linear fade
- `dynamic` → fast in, slow out

**FR-2.4** The company name MUST be the dominant typographic element in every animation style, with correct visual weight and character spacing. Per-character staggered reveal MUST be implemented in at least `NarrativeAnimation` and `SpotlightAnimation`.

**FR-2.5** When `colors.background` lightness > 50%, all animations MUST switch from `AdditiveBlending` to `NormalBlending` with `opacity: 0.7`.

**FR-2.6** `visualElement` strings received from Claude MUST be truncated to a maximum of 12 characters before sprite texture creation.

**FR-2.7** `ParticlesAnimation` and `GeometricAnimation` MUST implement layered depth: z-offset and speed variation between foreground (closer, faster, brighter) and background (farther, slower, dimmer) element groups.

---

### FR-3: Video Export

**FR-3.1** Users MUST be able to download the current animation as a WebM video file directly from the browser. No server-side rendering required.

**FR-3.2** Export MUST be gated behind Stripe payment. Free users can preview; paid users can download. The existing Stripe integration MUST be extended, not replaced.

**FR-3.3** The `CanvasRenderer` MUST accept an `exportMode: boolean` flag and a `manualElapsed: number` parameter. When `exportMode` is true, `manualElapsed` MUST be used instead of `THREE.Clock.getElapsedTime()`.

**FR-3.4** The `WebGLRenderer` instantiation MUST set `preserveDrawingBuffer: true` during export, or the `requestFrame()` synchronous pattern MUST be used inside the render callback.

**FR-3.5** Export MUST use a separate offscreen canvas renderer instance. The live preview canvas MUST remain active and unaffected during export.

**FR-3.6** Default export settings: 1920×1080 pixels, 30 fps, one full loop duration (12 seconds), WebM format.

**FR-3.7** Export MUST include a 100ms warm-up delay before recording begins.

**FR-3.8** Export MUST display a progress indicator to the user during capture.

**FR-3.9** Export MUST be gated with `MediaRecorder.isTypeSupported()`. On unsupported browsers (Safari, iOS), a clear message MUST be shown directing the user to Chrome or Firefox, or offering the existing HTML export as fallback.

**FR-3.10** On Chrome/Edge where `VideoEncoder` is available, the export SHOULD use the WebCodecs + `mp4-muxer` path to produce MP4 output. `VideoFrame` objects MUST be closed after encoding to prevent GPU memory accumulation.

**FR-3.11** Particle count MUST be reduced by 30% in export mode to offset encoding overhead.

---

### FR-4: Export UX + Aspect Ratios

**FR-4.1** An export modal MUST allow selection of:

- Format: WebM (all browsers) / MP4 (Chrome/Edge via WebCodecs)
- Aspect ratio: 16:9 (1920×1080), 1:1 (1080×1080), 9:16 (1080×1920)
- Quality: 1080p (default) / 720p

**FR-4.2** The export modal MUST display a progress bar showing frame N of total N.

**FR-4.3** The export modal MUST display a "Keep this tab active during export" warning.

**FR-4.4** The `ExportController` MUST resize the canvas correctly for non-16:9 aspect ratios before capture begins.

**FR-4.5** All export modal UI strings MUST have EN and PT translations in `src/i18n/en.json` and `src/i18n/pt.json`.

---

### FR-5: New Animation Styles

**FR-5.1** ORBIT style MUST be implemented: central company name with `visualElements` as satellite keywords orbiting at varying radii and speeds. Suitable for `industryCategory: creative | entertainment | platform`.

**FR-5.2** PULSE style MUST be implemented: concentric rings expanding outward from center, company name fading in at center. Suitable for `industryCategory: finance | health | government`.

**FR-5.3** SIGNAL style MUST be implemented: grid-aligned node-edge graph with rectilinear connections. Suitable for `industryCategory: tech` and `mood: bold`.

**FR-5.4** All new styles MUST: loop cleanly at 12 seconds, use the Phase 2 easing presets, respect brand color input, pass the loop seam requirement (FR-1.5).

**FR-5.5** Claude worker MUST be updated to include the three new style IDs in its selection schema.

---

## Non-Functional Requirements

**NFR-1** All animations MUST maintain 60 fps during live preview at the user's native resolution on a modern desktop browser.

**NFR-2** Export MUST complete in ≤ 3× real-time on a 4-core desktop (i.e., a 12-second animation exports in ≤ 36 seconds).

**NFR-3** The exported WebM file MUST be ≤ 10 MB for a 12-second 1080p output.

**NFR-4** Every user-facing string introduced in any phase MUST have EN and PT translations. The bilingual requirement is non-negotiable.

**NFR-5** All new client-side scripts MUST use the `astro:page-load` event and the `AbortController` cleanup pattern.

**NFR-6** No new front-end frameworks or rendering libraries may be introduced. Three.js primitives only.

**NFR-7** No server-side video rendering infrastructure. All encoding occurs in the browser.

**NFR-8** The feature MUST be deployed as static output to Cloudflare Pages with no SSR server.

**NFR-9** Mobile GPU: particle count MUST cap at 400 when `navigator.hardwareConcurrency < 4`.

---

## Constraints (hard limits)

- Tech stack: Astro 6, Three.js, Cloudflare Workers, Stripe — no new frameworks
- Billing: Stripe already integrated — extend existing payment flow only
- Export: browser-side capture only — no server-side FFmpeg
- Deployment: static output only — no Node server, no SSR
- i18n: every user-facing string must have EN + PT versions

---

_Written: 2026-04-02 — based on research synthesis_
