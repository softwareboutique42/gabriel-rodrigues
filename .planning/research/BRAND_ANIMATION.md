# Brand-driven Animation Design Research

**Domain:** Generative canvas animation for brand marketing assets
**Researched:** 2026-04-02
**Overall confidence:** HIGH (stack is well-understood; motion design principles are well-documented; some social media specs shift fast so verify before shipping)

---

## 1. Industry Visual Motifs

What visual language users and competitors expect from each vertical. These map directly to the `industry` field Claude returns in `CompanyConfig`.

| Industry            | Expected Motif                                         | Geometry Primitives                       | Color Expectation                         |
| ------------------- | ------------------------------------------------------ | ----------------------------------------- | ----------------------------------------- |
| Tech / SaaS         | Grid lines, node-edge graphs, circuit traces, hexagons | Lines, rings, sparse particles            | Dark background, neon accent (blue/green) |
| Finance / Fintech   | Bars, upward trajectories, shield/lock, minimal grids  | Rectangles, precise geometry, clean lines | Dark navy/charcoal, gold/white accent     |
| Health / Wellness   | Organic curves, soft flows, circular forms, pulses     | Sine waves, soft blobs, breathing rings   | Greens, teals, warm whites, muted pastels |
| Food / Consumer     | Warm, tactile, playful shapes, energetic               | Bubbles, arcs, bold blobs                 | Warm palette, high saturation             |
| Retail / Fashion    | Elegance, symmetry, kinetic type, clean whitespace     | Minimal geometry, strong typography       | Monochrome or high-contrast brand colors  |
| Creative / Design   | Generative, abstract, rule-breaking                    | Anything — but intentional                | Vivid, brand-forward                      |
| Energy / Industrial | Bold, mechanical, large-scale, impactful               | Large shapes, slow-moving heaviness       | Orange/yellow, dark backgrounds           |

**Key insight (HIGH confidence):** Industry drives _shape grammar_ (what primitives are used) while mood drives _how they move_. These are orthogonal axes and should be designed as independent parameters.

---

## 2. Animation Mood — Motion Pattern Mapping

Each mood is defined by three motion primitives: easing curve, timing character, and visual weight.

| Mood    | Easing Curve                          | Timing           | Visual Weight         | Example Motion                                 |
| ------- | ------------------------------------- | ---------------- | --------------------- | ---------------------------------------------- |
| Bold    | Fast ease-in, hard stop               | Short, punchy    | Heavy, high contrast  | Elements snap into place, impact frames        |
| Elegant | Slow ease-in-out, long settle         | Slow, deliberate | Light, sparse         | Elements drift in, long fade arcs              |
| Playful | Spring/bounce (y > 1 overshoot)       | Irregular rhythm | Medium, dense         | Bounce on entry, jitter, joyful offsets        |
| Minimal | Linear or very subtle ease            | Very slow        | Ultralight, near-zero | Barely-there fades, static with micro-movement |
| Dynamic | Ease-out burst, fast then slow settle | Variable tempo   | High density          | Particle explosions, rapid stagger reveals     |

**Current gap:** The codebase's `animationParams.speed` is a single float (0–1). Mood requires at minimum three separate parameters: `entryEasing`, `holdBehavior`, and `exitEasing`. A single scalar cannot encode the difference between "slow drift" (elegant) and "gentle bounce" (playful).

**Recommended easing presets (cubic-bezier values for GSAP/custom lerp):**

- Bold entry: `cubic-bezier(0.77, 0, 0.175, 1)` — sharp deceleration
- Elegant drift: `cubic-bezier(0.25, 0.1, 0.25, 1)` — smooth, unhurried
- Playful spring: spring with mass=1, stiffness=180, damping=12 (overshoot ~1.1)
- Minimal: `linear` or `cubic-bezier(0.4, 0, 0.6, 1)` — near imperceptible

---

## 3. Color Theory — Driving Animation Parameters from Brand Input

### Extracting Perceptual Properties

Given a hex color, convert to HSL/HSV to drive animation parameters:

| Derived Property                            | Drives                                          |
| ------------------------------------------- | ----------------------------------------------- |
| **Saturation** (0–100%)                     | Particle opacity / bloom intensity              |
| **Lightness** (0–100%)                      | Background luminosity, glow radius              |
| **Hue** (0–360°)                            | Palette temperature (warm vs cool motion feel)  |
| **Hue distance** (primary vs secondary)     | Contrast ratio → animation energy level         |
| **Palette temperature** (red/orange = warm) | Speed multiplier (warm = faster, cool = slower) |

### Specific Rules (MEDIUM confidence — inferred from color theory literature + common practice)

- **High saturation palette** (>70%): Increase particle density, enable additive blending, raise bloom. Low saturation: reduce density, use multiply blending or no blending.
- **Dark background** (#000–#1a1a1a range): Additive blending is safe and looks premium. Light background: additive blending washes out; use normal blending with low opacity.
- **Analogous palette** (hue spread < 60°): Elegant, harmonious — suits slow, flowing animations. Complementary palette (spread ~180°): High-energy contrast — suits bold/dynamic.
- **Monochromatic palette**: Minimal or typographic style; subtle opacity variation carries the animation.
- **Neon colors** (high saturation + mid-to-high lightness): Additive blending creates natural "glow" for free — no post-processing needed.

### What Claude AI currently provides vs what it could

**Currently provided** (from `CompanyConfig`):

- `colors.primary`, `colors.secondary`, `colors.accent`, `colors.background` — hex values
- `industry` — string
- `animationStyle` — one of 8 preset strings
- `animationParams.speed`, `.density`, `.complexity` — three floats 0–1
- `visualElements` — array of up to 5 keyword strings
- `tagline`, `description` — narrative text

**What Claude could additionally provide (and the prompt could request):**

- `mood` — explicit enum: `bold | elegant | playful | minimal | dynamic`
- `palette.temperature` — `warm | cool | neutral` (derivable from hue, but Claude can infer from brand feel)
- `palette.contrast` — `high | medium | low`
- `motionPersonality` — free-text hint: "tech companies move with precision", "health brands breathe"
- `industryCategory` — normalized enum for motif selection: `tech | finance | health | food | retail | creative`
- `energyLevel` — float 0–1 (maps directly to speed + density scaling)
- `visualTone` — `dark | light | neutral` (determines blending mode selection)

All of these are inferable from a company name by Claude with a structured prompt. The current prompt likely uses free-form inference; making them explicit JSON fields makes the rendering deterministic.

---

## 4. What Makes a Canvas Animation Look Polished vs Amateurish

### Polished

- **Consistent loop:** Animation returns to its start state cleanly. No visual "pop" or jump at the loop boundary. The existing `LOOP_DURATION = 12` with `elapsed % LOOP_DURATION` is the right approach — but all opacity/scale/position must be computed from normalized `progress` (0–1), not accumulated state.
- **Staggered reveals:** Elements appear one at a time with offset delays (done well in Constellation and Timeline). Simultaneous reveals feel cheap.
- **Layered depth:** Foreground elements move faster/brighter than background; parallax creates perceived 3D space. Currently absent in Particles and Geometric — all elements are on z=0.
- **Restraint:** 2–3 active colors maximum. 1 dominant color + 1 accent. The existing palette of 3 is at the limit — any more produces visual noise.
- **Additive blending + dark background = free glow:** Already used throughout — this is the single biggest visual quality lever.
- **Timing hierarchy:** The most important element (brand name / key message) should be the last to appear and have the longest hold duration. Currently Spotlight does this correctly; Narrative does not (equal time per element).

### Amateurish (what to avoid)

- **Uniform motion:** Every element moves at the same speed. Even tiny phase offsets (`+ index * 0.3`) dramatically improve quality.
- **Jitter from floating point accumulation:** Updating positions by `+= velocity` each frame accumulates error over time. Use `sin/cos(elapsed)` deterministic position instead. Particles currently uses both, which causes visible drift after ~30 seconds.
- **GPU texture uploads every frame:** Creating `new THREE.Color()` or `new THREE.Vector3()` inside the update loop allocates GC pressure. Pre-allocate.
- **Flash to black at loop boundary:** Occurs when opacity is computed as `1 - progress` with no cross-fade. Wrap with a short crossfade window at `progress > 0.95`.
- **All elements the same size:** Scale variation (0.5x to 2x range) is free visual richness.
- **Abrupt starts:** Animation pops on at frame 1. Everything should fade in from 0 over 0.3–0.5 seconds.

---

## 5. Recommended Preset Styles (3–5 Styles)

These are the five highest-impact, most-differentiating styles for the industry × mood axes. Each is distinct in visual grammar and covers a different use case.

---

### Style 1: SIGNAL

**Visual description:** Sparse, sharp geometric nodes connected by crisp line segments. Nodes pulse with the brand primary color. Connection lines draw in one by one. Background is near-black with faint secondary-color grid dots.
**Motion character:** Precise, fast entry (50ms per node stagger), then slow steady pulse hold. Clean loop.
**Industry fit:** Tech, SaaS, AI, Fintech, Consulting
**Mood:** Bold / Minimal
**Why differentiating:** No existing style does sharp geometry with structured grid. Closest is Constellation but Signal is rectilinear (grid-aligned), not organic/circular. Reads "infrastructure", "network", "system".
**Parameters to drive from brand:** Node count from `density`; connection pattern (ring vs star vs grid) from `complexity`; pulse speed from `speed`.

---

### Style 2: FLUX

**Visual description:** Multiple flowing sine curves spanning full canvas width, layered at different vertical offsets. Curves breathe independently — phase offsets create interference patterns. Colors cycle through primary → secondary → accent across curve layers.
**Motion character:** Slow ease, long period (8–12s full wave). No sudden changes. Feels aquatic.
**Industry fit:** Health, Wellness, Biotech, Sustainability, Beauty
**Mood:** Elegant / Playful
**Why differentiating:** This is the existing `flowing` animation refined. The current implementation is strong; the key upgrade is making curves respond to saturation (more saturation = tighter, faster waves) and adding a subtle camera drift on Z to create perceived depth.
**Parameters to drive from brand:** Wave frequency from `complexity`; number of curves from `density`; amplitude from `speed`.

---

### Style 3: STAMP

**Visual description:** Bold typographic grid — large letters or words from the company tagline fill a mosaic tile layout. Tiles flip in with a staggered wave reveal. Brand colors dominate the tiles; off-brand tiles are near-black. Selected tiles pulse with accent color.
**Motion character:** Quick staggered flip-reveal (like a stadium card section). Then slow ambient pulse. Loop resets with a gentle fade.
**Industry fit:** Retail, Fashion, Consumer Goods, Sports, Media
**Mood:** Bold / Dynamic
**Why differentiating:** The existing `typographic` style is close but uses abstract tiles. STAMP makes each tile a letter/word unit, so the brand name literally constructs itself. High readability in thumbnail previews.
**Parameters to drive from brand:** Tile size from `density`; flip speed from `speed`; number of colored tiles from `complexity`.

---

### Style 4: ORBIT

**Visual description:** Central brand name rendered large in the middle. 3–5 satellite words (from `visualElements`) orbit at different radii and speeds. Each satellite leaves a faint trail. Everything is on a deep-space dark background.
**Motion character:** Smooth circular orbits, no easing (constant angular velocity). Satellites have slight size variation (closer = larger). Trails fade over ~1 second.
**Industry fit:** Creative Agencies, Technology Platforms, Media, Entertainment
**Mood:** Elegant / Dynamic
**Why differentiating:** None of the 8 existing styles use orbital mechanics. The pattern is immediately recognizable as "planetary system" = innovation, ecosystem, platform thinking. High visual richness from trail rendering alone.
**Parameters to drive from brand:** Orbit radius and speed from `speed`; number of satellites = `visualElements.length`; trail length from `complexity`.

---

### Style 5: PULSE

**Visual description:** Single centered concentric ring system. Rings expand outward from center and fade as they reach the viewport edge. Each ring is in a different brand color. Frequency and ring size modulate with the beat of an implicit rhythm. Company name fades in at center once rings establish.
**Motion character:** Radially symmetric, hypnotic. Rings emit on a regular interval (2–3s between pulses). Very calm.
**Industry fit:** Finance, Insurance, Healthcare, Government, B2B SaaS
**Mood:** Minimal / Elegant
**Why differentiating:** Conveys stability, trust, broadcasting, reach. None of the current 8 styles use outward-expanding rings as the primary motif (Spotlight has concentric rings but they are static structure, not the motion itself). Extremely legible in both large format and small thumbnail.
**Parameters to drive from brand:** Pulse rate from `speed`; ring thickness from `density`; number of simultaneous rings from `complexity`.

---

## 6. Claude AI Brand Analysis — Current State and Improvements

### What the worker currently generates

From `main.ts`, the worker returns a full `CompanyConfig` JSON with: company name, 4 hex colors, tagline, industry string, description, one of 8 animation style strings, three animation params (speed/density/complexity), and an array of 5 visual element keywords.

The style selection appears to be done by Claude heuristically (no evidence of deterministic rules in the client code). This means the same company entered twice might get different styles.

### Problems with the current approach

1. **`animationStyle` is a string enum** — Claude picks one of 8 styles freeform. There is no intermediate concept of "industry category" or "mood" that could drive style selection deterministically. If we add industry × mood as axes, Claude should return those axes, and the client selects the style.
2. **No mood field** — Claude infers personality but never exposes it. The caller cannot know if a "particles" animation should be aggressive (bold) or dreamy (elegant).
3. **`visualElements` are underconstrained** — they're just 5 free-form strings. For Constellation and Timeline they work as labels, but for future styles they'd benefit from being typed (e.g., `keywords`, `values`, `products`, `verbs`).
4. **Color validation is client-side only** — worker might return invalid hex; `isValidHex` guards it. Prompt should enforce `#RRGGBB` format.

### Recommended additions to the Claude prompt / JSON schema

```json
{
  "industryCategory": "tech | finance | health | food | retail | creative | energy | other",
  "mood": "bold | elegant | playful | minimal | dynamic",
  "energyLevel": 0.0,
  "palette": {
    "temperature": "warm | cool | neutral",
    "contrast": "high | medium | low"
  },
  "visualElements": {
    "keywords": ["string x5"],
    "emotionalTone": "string"
  }
}
```

With `industryCategory` and `mood`, the client can deterministically select a style preset and tune parameters — removing nondeterminism from style selection while still letting Claude drive the brand semantics.

---

## 7. Social Media Asset Specifications (2024–2025)

### Recommended export dimensions and durations

| Format         | Aspect Ratio | Resolution | Duration    | Notes                                               |
| -------------- | ------------ | ---------- | ----------- | --------------------------------------------------- |
| Instagram Reel | 9:16         | 1080×1920  | 15–30s      | 60fps preferred; algorithm favors 15–30s            |
| Instagram Feed | 1:1 or 4:5   | 1080×1080  | 3–60s       | Square is safest cross-platform fallback            |
| TikTok         | 9:16         | 1080×1920  | 15–60s      | Under 30s gets best completion rate                 |
| LinkedIn       | 16:9         | 1920×1080  | 15–30s      | Desktop dominant; landscape works; 16:9 recommended |
| Twitter/X      | 16:9 or 1:1  | 1280×720   | 15–30s      | Autoplay muted; visual must work without audio      |
| YouTube Shorts | 9:16         | 1080×1920  | Max 60s     | Same dimensions as Reel                             |
| General Web/OG | 16:9         | 1920×1080  | 10–15s loop | For embeds, website hero sections                   |

### Current canvas dimensions

The existing canvas is rendered at `canvas.clientWidth * devicePixelRatio` — responsive to container. For export, a fixed 1920×1080 (16:9) render target is the correct choice as it can be cropped to any of the above.

### Export approach (current state)

The current download path generates an HTML file (`generateExportHTML`) — not a video. This is the existing product; video export would be a future feature.

**When video export is added:**

- Use `canvas.captureStream(30)` + `MediaRecorder` to capture WebM (VP9)
- Chrome supports `video/webm;codecs=vp9`; Safari supports `video/mp4` only
- For cross-browser MP4: record WebM in-browser, convert server-side via Cloudflare Worker with FFmpeg WASM, or use the `canvas-record` npm package which uses WebCodecs API (Chrome 94+, Edge 94+, no Safari support as of early 2025)
- Target 30fps for smooth playback; 12s loop duration matches existing `LOOP_DURATION`
- Add `SharedArrayBuffer` headers (`COEP: require-corp`, `COOP: same-origin`) if using ffmpeg.wasm in-browser

---

## Risks and Pitfalls

### Critical

- **Loop seam pop:** If any animation parameter is not computed purely from `progress` (normalized 0–1 elapsed time), accumulated state will cause a visible jump at the loop boundary. The Particles animation currently uses `velocities[i] * t * 60` which is unbounded — this creates visible drift beyond one loop. All position offsets must be `f(sin/cos(progress * 2π))` only.
- **Style selection nondeterminism:** Claude picking `animationStyle` freeform means the same company can get different styles on different API calls (cache miss). This is bad UX. Add `industryCategory` + `mood` to the schema, make style selection rule-based on the client.
- **Dark-only assumption:** All styles use `THREE.AdditiveBlending` which only looks good on dark backgrounds. The current `background` color field is set by Claude but rendering blending mode is hardcoded. A light-background brand will look washed out. Guard: if `background` lightness > 50%, switch to `THREE.NormalBlending` with `opacity = 0.7`.

### Moderate

- **Single-axis mood parameter:** `animationParams.speed` is one float trying to encode mood (fast = bold, slow = elegant). This is insufficient. Bold needs fast entry with slow hold; playful needs variable speed with springiness. Expand to at least two parameters: `entrySpeed` and `holdIntensity`.
- **`visualElements` label length:** Constellation and Spotlight render `visualElements` as sprite text. Long strings (> 12 chars) break the layout — the sprite texture is fixed size. Add a `maxLength: 12` constraint in the Claude prompt.
- **GPU memory on mobile:** Particles creates 800 \* density points. On low-end mobile, 560+ particles with per-frame position updates will drop below 30fps. Cap at 400 particles on mobile (`navigator.hardwareConcurrency < 4` or canvas width < 768px).
- **Three.js version drift:** `three` is at whatever version was installed. `THREE.AdditiveBlending`, `THREE.PointsMaterial`, and `BufferGeometry` APIs are stable, but `RingGeometry` constructor order changed between r125 and r150. Pin the version in `package.json`.

### Minor

- **Tagline truncation in Spotlight/Narrative:** Visual elements are shown one at a time centered. If the element string wraps (> 20 chars), `createTextSprite` produces a blurry texture. Enforce max character count in the Claude prompt.
- **Color cycling modulo 3:** All animations cycle colors as `palette[i % 3]` — only 3 colors are used regardless of how many elements exist. This means element 0 and element 3 get the same color. For Constellation (5 nodes), this is fine. For future styles with 6+ elements, add a 4th neutral tone.
- **No reduced-motion fallback content:** The existing code correctly freezes on `prefers-reduced-motion`, but the frozen state shows a black canvas. It should show a static brand card (company name + palette swatches) instead.

---

## Sources

- [Motion Brand Guidelines: The Ultimate 2026 Guide](https://www.everything.design/blog/motion-brand-guidelines) — motion as brand identity element
- [10 Principles of Motion Design (VMG Studios)](https://blog.vmgstudios.com/10-principles-motion-design) — timing, hierarchy, contrast
- [Color Theory for Motion Design (LottieFiles)](https://lottiefiles.com/blog/tips-and-tutorials/color-theory-for-motion-design) — HSL driving animation parameters
- [5 Steps for Including Motion Design in Your System](https://www.designsystems.com/5-steps-for-including-motion-design-in-your-system/) — easing as brand personality
- [Social Media Video Sizes 2025 (Sprinklr)](https://www.sprinklr.com/blog/social-media-video-sizes/) — aspect ratios and duration specs
- [Saving Canvas Animations With MediaRecorder (Theodo)](https://blog.theodo.com/2023/03/saving-canvas-animations/) — WebM export implementation
- [canvas-record (npm)](https://www.npmjs.com/package/canvas-record) — WebCodecs-based MP4 export
- [Creating a Generative Artwork with Three.js (Codrops, Jan 2025)](https://tympanus.net/codrops/2025/01/15/creating-generative-artwork-with-three-js/) — Three.js generative patterns
- [Three.js Tips and Tricks (Discover Three.js)](https://discoverthreejs.com/tips-and-tricks/) — GPU performance, avoid per-frame allocations
- [Custom Easing (web.dev)](https://web.dev/custom-easing/) — cubic-bezier for brand personality
