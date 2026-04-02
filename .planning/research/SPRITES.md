# Sprite-Based Animation in Canvas/Three.js

**Project:** Company Canvas — animated brand asset generator
**Researched:** 2026-04-02
**Confidence:** HIGH (codebase + Three.js docs), MEDIUM (ecosystem patterns from WebSearch)

---

## Codebase Baseline

Before recommending anything new, it is important to understand what is already in place.

The existing system uses Three.js r183 with an `OrthographicCamera` and a `BaseAnimation` class hierarchy. There are already **two distinct sprite mechanisms** in production:

1. **`THREE.Sprite` + `CanvasTexture`** — used for text (company slogans, word animations) via `createTextSprite()` in `text-utils.ts`. Each text string gets its own offscreen canvas drawn with `fillText`, converted to a `CanvasTexture`, then wrapped in `SpriteMaterial`. This pattern is actively used by Narrative, Spotlight, Timeline, and Constellation animations.

2. **`THREE.Sprite` + `CanvasTexture`** — used for procedural industry icons via `icons/index.ts`. A 128x128 canvas is drawn with one of ~10 procedural `DrawFn` functions keyed to industry keyword matching, then converted to a sprite placed in the bottom-right corner with float/pulse animation.

3. **`THREE.Points` + `PointsMaterial`** — used for particle fields in Particles, Flowing, Narrative, Spotlight, Constellation animations. Currently monochromatic per-group (not per-particle textured).

The existing sprite approach is correct and idiomatic for this use case. The gaps are around: per-particle shape customization, sprite sheet flipbooks for complex icon animations, and deeper colorization control.

---

## Key Findings

### 1. Sprite Approaches Available in Three.js

**`THREE.Sprite` + `SpriteMaterial`**

- Always camera-facing billboard. Good for text labels, icon overlays, HUD-style elements.
- `SpriteMaterial.color` multiplies the texture: a greyscale (white-on-transparent) sprite tinted with `material.color = new THREE.Color(hex)` gives full runtime colorization at near-zero cost. This is the canonical tinting pattern.
- HSL shift via `color.setHSL()` works. Known quirk: `setHSL` adjustments can behave unexpectedly on SpriteMaterial specifically — set color via `new THREE.Color(hex)` then call `.setHSL()` on that object separately before assigning, rather than calling setHSL on `material.color` directly.
- One draw call per unique material. Many sprites sharing one material = one draw call. Sprites with different materials multiply draw calls.

**`THREE.Points` + `PointsMaterial`**

- One draw call for thousands of particles. Already used extensively in the codebase.
- `PointsMaterial.map` accepts a texture for custom particle shapes (soft circles, star shapes, cross shapes). This is a zero-cost upgrade to the existing particle system: swap the square default for a radial gradient PNG to get soft glowing dots.
- `vertexColors: true` already used in `ParticlesAnimation` — each particle has its own RGB from the brand palette. This is already optimal.
- Size limit: `PointsMaterial.sizeAttenuation` makes particles perspective-correct, but in OrthographicCamera scenes (which this project uses) size is in world units, not pixels — behaves consistently.

**`THREE.InstancedMesh`**

- For shaped particles that need rotation, per-instance transform, or non-square geometry. Replaces `Points` when particle shape or individual orientation matters.
- One draw call for N instances. More CPU overhead per frame than `Points` to update the instance matrix buffer, but necessary if you want rotated triangles, diamonds, or hexagons.
- `InstancedMesh` does not support `Sprite` internally — you construct it from a `PlaneGeometry` + `MeshBasicMaterial` and manage billboard orientation yourself (or accept fixed-orientation shapes, which works for 2D orthographic scenes).

**`THREE.Sprite` + `ShaderMaterial` (not supported)**

- `THREE.Sprite` does not accept `ShaderMaterial` — it requires `SpriteMaterial`. For full custom shaders on a billboard, use `InstancedMesh` with a `PlaneGeometry` and a custom `ShaderMaterial`, handle billboard manually if needed.
- For this orthographic 2D project, billboarding is not needed — shapes face the camera by definition.

**Custom `ShaderMaterial` on Meshes**

- Enables: SDF-based glyph rendering, noise-driven color gradients, animated UV offsets for sprite sheet playback, per-vertex HSL shift. Most powerful option.
- Cost: requires writing GLSL. Debugging is harder. Not needed for most animation styles in this project.
- Best used for: a dedicated "logo reveal" or "brand stamp" animation where precise control over a glyph shape or gradient sweep is required.

---

### 2. Sprite Sheet Formats

**PNG Texture Atlas (recommended)**

- Pack multiple frames into a single PNG arranged in a grid. Use `texture.repeat` and `texture.offset` to select which frame is displayed each tick.
- For a 4x4 grid of frames: `texture.repeat.set(0.25, 0.25)`, then `texture.offset.set(col * 0.25, row * 0.25)`.
- Always use **power-of-two dimensions** (256x256, 512x512, 1024x1024). WebGL 1 cannot generate mipmaps for non-POT textures; WebGL 2 can, but POT is still faster on all browsers. Three.js will warn in the console for non-POT textures.
- Add **1–2px padding between frames** to prevent texture bleed at frame edges when using linear filtering.
- Use `texture.minFilter = THREE.LinearFilter` (not the default `LinearMipmapLinearFilter`) for sprite sheets to avoid mipmap blending across frame borders.

**Individual frames (avoid for animation)**

- Loading one texture per frame creates one WebGL texture object per frame. Switching frames means uploading new textures to GPU. Expensive. Only valid for preloaded static icon sets, not frame-by-frame animation.

**SVG sprites**

- Three.js has an `SVGLoader` that parses SVG paths into `BufferGeometry` via `ShapePath`. Good for one-time logo shape loading, not for flipbook animation.
- SVG cannot be used directly as a `SpriteMaterial` map — must be rasterized first. Rasterize via an offscreen canvas (`drawImage` on an `<img>` with an SVG src blob URL), then wrap in `CanvasTexture`. This is viable for static icon sprites.
- For the procedural icons already in the codebase, the 2D canvas draw approach is strictly better than SVG loading: no parse/render step, full programmatic color control.

**Procedural canvas textures (current approach — correct)**

- Draw to offscreen canvas, convert to `CanvasTexture`. Already used for text and icons.
- Do NOT set `needsUpdate = true` every frame on a `CanvasTexture` unless the content changes. Each `needsUpdate = true` triggers a full `texSubImage2D` GPU upload (~5x slower than static textures). The existing codebase does this correctly — textures are created once at scene init and never updated.

---

### 3. Runtime Colorization

**Pattern A: Multiply tint (recommended, zero-cost)**

```typescript
// Greyscale icon drawn on canvas as white-on-transparent
// At runtime, set the material color to any brand hex:
const material = new THREE.SpriteMaterial({
  map: texture, // white icon on transparent background
  color: new THREE.Color(brandHex), // multiplied with texture
  transparent: true,
});
// To change color at runtime:
(sprite.material as THREE.SpriteMaterial).color.set(newHex);
```

The GPU multiplies the texture RGB by `material.color`. A pure-white icon becomes whatever `material.color` is. This is how the industry icon system should work — currently drawing with color directly baked into the canvas, which locks the color at creation time.

**Pattern B: Color at canvas draw time (current approach)**

```typescript
// Current: color is burned into the canvas pixels
drawFn(ctx, config.colors.accent); // <- color locked here
```

This works but makes runtime re-colorization expensive (requires redraw + texture re-upload). Acceptable for one-time scene creation; unacceptable if colors need to animate or update without scene teardown.

**Pattern C: ShaderMaterial uniform (most flexible, most complex)**

```glsl
// fragment shader
uniform sampler2D map;
uniform vec3 brandColor;
void main() {
  vec4 texel = texture2D(map, vUv);
  gl_FragColor = vec4(texel.rgb * brandColor, texel.a);
}
```

Update `material.uniforms.brandColor.value.set(hex)` each frame if animated. Zero texture re-upload cost. Requires `ShaderMaterial` on a `PlaneGeometry`, not a `Sprite`.

**Pattern D: HSL animation (accent pulse effects)**

```typescript
const color = new THREE.Color(baseBrandHex);
// Each frame: shift hue slightly for "breathing" effect
color.offsetHSL(hueShiftAmount, 0, 0);
material.color.copy(color);
```

Use sparingly. Looks cheap if overused. Best for subtle accent highlights, not primary brand colors.

**Recommendation for this project:** Convert existing icon draw functions to draw in white (`#ffffff`) and use Pattern A (multiply tint) so colors remain changeable at runtime without texture re-upload.

---

### 4. Polished Animation Styles for Marketing Assets

These are the styles that read as professional at export time:

**Logo/Name Reveal**

- Masked wipe: text sprite fades in with a horizontal clip mask, left-to-right over ~0.8s. Already approximated by the opacity fade in `NarrativeAnimation`.
- Character stagger: individual letter sprites stagger in with 30–50ms offsets. Requires splitting text to per-character sprites. More complex but much higher polish.
- SVG path draw: load brand logo as SVG, animate `dashOffset` to draw it stroke by stroke. Requires `SVGLoader` + `Line2` from Three.js examples.

**Particle Systems (already implemented)**

- The existing `ParticlesAnimation` is solid. Key upgrade: use a `map` texture on `PointsMaterial` (a soft radial gradient PNG, 64x64) to replace square pixels with glowing circles. One texture load, zero CPU cost.
- Burst-and-settle: particles spawn at center, explode outward, then drift slowly. Good for "launch" or "energy" industry moods.

**Geometric Shapes**

- Already implemented as `GeometricAnimation`. To add sprite-like polish: replace `RingGeometry` rings with instanced hexagons or diamonds (`Shape` + `ShapeGeometry`) and animate with staggered reveal timing rather than continuous rotation.

**Flowing Lines / Waves**

- Already implemented as `FlowingAnimation`. Line-based, not sprite-based. Appropriate for finance/data/analytics industries. Upgrade: use `Line2` (from `three/examples/jsm/lines/Line2`) for fat lines with variable width — much more polished than `LineBasicMaterial` at 1px.

**Grid/Mosaic Reveal**

- Already implemented as `TypographicAnimation` (colored tiles). Extension: use a `SpriteMaterial` map on tiles so each tile shows a fragment of the brand palette rather than flat color. Very close to current implementation.

**Text-Forward Kinetic Typography**

- Already implemented via `createTextSprite`. Upgrade path: per-character sprites with stagger, easing functions (ease-out cubic instead of linear), and spring-style overshoot on scale.

---

### 5. Performance at 60fps

**Current draw call count (estimated per style):**

- `ParticlesAnimation`: ~3 draw calls (1 Points + background geometry)
- `GeometricAnimation`: 1 draw call (all shapes share one material if created identically — but current code creates unique materials per shape, meaning N draw calls for N shapes). This is the biggest performance bug in the existing system.
- `NarrativeAnimation`: 5–7 draw calls (1 per word sprite + particles)
- `SpotlightAnimation`: 8–10 draw calls (ring + glow + outer ring + particles + 5 word sprites)
- `ConstellationAnimation`: 12+ draw calls (stars + connections + labels)

**Key rules:**

- `THREE.Points`: one draw call regardless of particle count. Keep all ambient particles in a single `Points` object with `vertexColors: true`. Already done in `ParticlesAnimation`; partially broken in `SpotlightAnimation` which creates separate `Points` for radial particles.
- Share materials: if 20 geometric shapes use the same color, they should share one `MeshBasicMaterial` instance, not create 20 clones. Current `GeometricAnimation` creates a new material per shape.
- `AdditiveBlending` on all particle/sprite layers: already done correctly throughout the codebase. Additive blending does not require depth sorting, unlike `NormalBlending` with transparency.
- Avoid `CanvasTexture.needsUpdate = true` in the animation loop. Already done correctly — textures are static after creation.
- CPU particle updates: the current approach mutates `Float32Array` position buffers each frame and sets `needsUpdate = true`. For 800 particles this is fine. Above ~5000 particles, move to GPU animation (shader-based position update). For this use case (marketing asset, not game), 800–1200 particles is the sweet spot for visual density vs. CPU cost.
- Target draw call budget: under 20 draw calls per frame. All current styles are within this.
- `renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))`: already implemented correctly. DPR > 2 (some phones report 3) would quadruple the pixel count for marginal visual gain.

**Mobile / export considerations:**

- The export generates standalone HTML running on the user's device. Cannot control target hardware. Keep particle counts at `density * 800`, complexity-scaled. The existing scaling pattern via `animationParams.density` is the right approach.
- For video export (MediaRecorder), performance drops because encoding happens in parallel with rendering. Reduce particle count by 30% in export mode, or pre-warm the scene before recording begins.

---

### 6. Third-Party Libraries — Recommendation

**Do not add any new libraries.** The constraint is no new frameworks, and the justification is strong:

- `three-sprites` / `three-SpriteMixer` / `InstancedSpriteMesh`: these libraries add sprite sheet flipbook animation helpers. Useful for game sprite sheets. Not relevant here — we are not doing frame-by-frame character animation.
- GSAP: adds ~30KB gzipped. Already not in the project. The current hand-rolled easing (`Math.sin`, linear progress, `Math.min(progress/0.2, 1)`) is sufficient. GSAP would help with timeline sequencing but adds a dependency for something achievable in ~50 lines of vanilla JS.
- `@motionone/three`: similar rationale, external dependency.
- Lottie/rive: designed for vector animation playback from design tools. Would require uploading Lottie JSON files per animation variant. Adds a CDN dependency to the exported HTML. Inappropriate for this use case.

**The existing Three.js installation already contains everything needed.** Sprite sheets, custom shaders, instancing, and canvas textures are all native Three.js primitives.

---

### 7. Industry + Mood Differentiation via Animation Style

Animation style can meaningfully signal industry vertical and emotional register. Concrete mappings:

| Industry                | Mood                  | Style Recommendation | Visual Signature                                                  |
| ----------------------- | --------------------- | -------------------- | ----------------------------------------------------------------- |
| Tech / SaaS             | Confident, forward    | `constellation`      | Node graph with glowing edges, data flowing between concepts      |
| Tech / SaaS             | Playful, startup      | `particles`          | Dense additive particle field, fast speed param                   |
| Finance / Insurance     | Trust, stability      | `timeline`           | Horizontal timeline with smooth sequential reveals, muted palette |
| Finance / Fintech       | Growth, modern        | `flowing`            | Rising sine waves with primary/secondary color pair               |
| Healthcare              | Care, precision       | `spotlight`          | Centered ring reveal, slow speed, high contrast on white bg       |
| Healthcare              | Clinical              | `geometric`          | Sparse hexagonal grids at low opacity                             |
| Education               | Curiosity             | `narrative`          | Word-by-word kinetic stagger, high density background             |
| Energy / Sustainability | Power, scale          | `particles`          | Burst from center, fast speed, electric/warm palette              |
| Retail / Consumer       | Vibrant, dynamic      | `geometric`          | Dense shapes, fast rotation, saturated colors                     |
| Aerospace / Defense     | Precision, scope      | `constellation`      | Star map with slow drift, cool palette                            |
| Creative / Agency       | Expressive            | `typographic`        | Color grid mosaic at high complexity                              |
| Logistics / Automotive  | Movement, reliability | `flowing`            | Parallel horizontal lines with wave amplitude                     |

The existing `animationStyle` field in `CompanyConfig` maps well to this table. The AI backend could emit both `animationStyle` and tuned `animationParams` (`speed`, `density`, `complexity`) based on industry + description, without any new animation styles needing to be built.

**New styles that would genuinely differentiate:**

- `logo-reveal`: SVG path draw animation for clients with a recognizable wordmark. High perceived value.
- `mosaic`: Image/color tiles that assemble into a brand composition. Tile-based, uses `PlaneGeometry` + texture atlas.
- `data-flow`: Directed graph with animated edge particles flowing along bezier curves. Strong signal for B2B data/analytics companies.

---

## Recommended Approach for This Project

Given the existing codebase, the highest-ROI improvements in sprite/animation quality are:

**1. Add a `map` texture to `PointsMaterial` for soft particles (trivial cost)**
Create a 64x64 canvas with a radial white-to-transparent gradient at init time. Set it as `PointsMaterial.map`. All existing particle animations immediately look more polished. Zero architectural change.

**2. Convert icon draw functions to draw in white; use SpriteMaterial color for tinting (small refactor)**
Change `drawFn(ctx, config.colors.accent)` to `drawFn(ctx, '#ffffff')` and set `material.color = new THREE.Color(config.colors.accent)`. This decouples color from texture and enables runtime recoloring without canvas redraw.

**3. Fix material sharing in GeometricAnimation (performance fix)**
Group shapes by color index, share one `MeshBasicMaterial` per color. Reduces draw calls from ~20 to ~3 for that style. This is a correctness/performance fix, not a visual change.

**4. Add character-stagger to text sprite creation (polish, moderate effort)**
Split the company name into individual character sprites in `NarrativeAnimation` and `SpotlightAnimation` with staggered reveal timing. The `createTextSprite` utility is already there; it needs a loop that calls it per character with computed x offsets.

**5. For a new `logo-reveal` style: use CanvasTexture with path drawing (high value, moderate effort)**
Using a 2D canvas path animation (or SVG rasterized to canvas) with progressive `lineWidth` clip mask, convert frames to `CanvasTexture`. Because the texture only needs to update during the reveal phase (~1–2 seconds), `needsUpdate = true` for ~60–120 frames is acceptable. After reveal completes, stop updating the texture.

---

## Risks and Pitfalls to Avoid

**Pitfall 1: Multiple CanvasTexture updates per frame**
`texture.needsUpdate = true` triggers a full GPU re-upload. The current codebase correctly does this only at creation. Never set it in the animation loop unless absolutely required (e.g., the `logo-reveal` style above has a narrow justification window).

**Pitfall 2: One material per shape (draw call explosion)**
`GeometricAnimation` creates a new material per shape (current code lines 27–34). 20 shapes = 20 draw calls. Fix: create one material per palette color and reuse across all shapes of that color.

**Pitfall 3: Non-power-of-two canvas textures**
`createTextSprite` sizes canvas to text metrics (`Math.ceil(metrics.width + padding * 2)`). These are never POT. This is intentional and acceptable for text sprites where the image is always unique per string. For shared/reused sprites (icons, particle textures), always use POT dimensions: 64, 128, 256.

**Pitfall 4: Depth sorting with NormalBlending**
`NormalBlending` transparent objects must be depth-sorted back-to-front each frame or transparency compositing artifacts appear. All animated layered sprites should use `AdditiveBlending` (already done in the codebase) or accept z-ordering artifacts. Additive blending does not need sorting and is free.

**Pitfall 5: SpriteMaterial.color HSL quirk**
Calling `material.color.setHSL(h, s, l)` directly on `SpriteMaterial.color` can produce unexpected results in some Three.js versions. Workaround: `const c = new THREE.Color(); c.setHSL(h, s, l); material.color.copy(c);`

**Pitfall 6: Export HTML uses CDN Three.js**
`export.ts` loads Three.js from `unpkg.com/three@0.183.2`. If that CDN is unavailable or rate-limited, exported animations break. This is a known fragility. Bundle Three.js into the export blob for production quality, or use a reliable CDN with a fallback.

**Pitfall 7: CanvasTexture in Firefox/Safari**
Firefox and Safari historically have higher CPU cost for canvas texture updates than Chrome, especially for larger canvases. Keep icon canvas at 128x128 (current) and particle shape textures at 64x64 or smaller.

**Pitfall 8: MediaRecorder for video export needs timing**
If adding video export (MP4/WebM via `MediaRecorder` + `canvas.captureStream()`), the recording must start after the scene is fully warmed up (first 2–3 frames rendered), otherwise the first frame is often black or partially initialized. Add a 100ms delay after `renderer.render()` before starting recording.

---

## Code Patterns Worth Noting

**Soft particle texture (one-time init):**

```typescript
function createParticleTexture(): THREE.Texture {
  const canvas = document.createElement('canvas');
  canvas.width = 64;
  canvas.height = 64;
  const ctx = canvas.getContext('2d')!;
  const gradient = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
  gradient.addColorStop(0, 'rgba(255,255,255,1)');
  gradient.addColorStop(0.4, 'rgba(255,255,255,0.6)');
  gradient.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 64, 64);
  const texture = new THREE.CanvasTexture(canvas);
  texture.minFilter = THREE.LinearFilter;
  return texture;
}
// Use in PointsMaterial:
// map: createParticleTexture(), alphaTest: 0.01
```

**Sprite sheet frame selection:**

```typescript
// For a 4-column, 4-row atlas (16 frames):
const cols = 4,
  rows = 4;
texture.repeat.set(1 / cols, 1 / rows);
// Select frame N (0-indexed, left-to-right, top-to-bottom):
function setFrame(texture: THREE.Texture, frame: number): void {
  const col = frame % cols;
  const row = Math.floor(frame / cols);
  texture.offset.set(col / cols, 1 - (row + 1) / rows); // Y is flipped in UV space
}
```

**White-draw icon + runtime tint:**

```typescript
// In draw.ts: change draw functions to use white
const drawCircuitBoard: DrawFn = (ctx, _color) => {
  ctx.strokeStyle = '#ffffff'; // always white
  // ... rest unchanged
};
// In icons/index.ts: tint at material level
const material = new THREE.SpriteMaterial({
  map: texture,
  color: new THREE.Color(config.colors.accent), // tint here
  transparent: true,
  opacity: 0,
  depthWrite: false,
});
// To re-tint at runtime: material.color.set(newHex)
```

**Shared material for geometric shapes:**

```typescript
// Instead of new material per shape:
const palette = [primary, secondary, accent].map(
  (hex) =>
    new THREE.MeshBasicMaterial({
      color: hex,
      transparent: true,
      opacity: 0.5,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    }),
);
// Per shape: reuse palette[i % 3] — one draw call per material, not per mesh
```

---

## Sources

- Three.js docs: `SpriteMaterial`, `PointsMaterial`, `CanvasTexture`, `InstancedMesh` — https://threejs.org/docs/
- Three.js forum: high-performance texture atlas with animated sprite particles — https://discourse.threejs.org/t/high-performance-texture-atlas-with-animated-sprite-particles/72613
- Codrops: Building Efficient Three.js Scenes (Feb 2025) — https://tympanus.net/codrops/2025/02/11/building-efficient-three-js-scenes-optimize-performance-while-maintaining-quality/
- WebGL best practices, MDN — https://developer.mozilla.org/en-US/docs/Web/API/WebGL_API/WebGL_best_practices
- Three.js forum: CanvasTexture performance (Firefox/Safari) — https://discourse.threejs.org/t/canvas-texture-update-cause-performance-issue-in-firefox-and-safari/7441
- Three.js forum: SpriteMaterial HSL quirk — https://discourse.threejs.org/t/changing-hue-or-saturation-not-working-in-a-spritematerial-using-sethsl/14338
- utsubo.com: 100 Three.js Tips (2026) — https://www.utsubo.com/blog/threejs-best-practices-100-tips
- GitHub: three-sprites library — https://github.com/riokoe/three-sprites
- GitHub: three-SpriteMixer — https://github.com/felixmariotto/three-SpriteMixer
- Codebase read: `src/scripts/canvas/**` (r183, April 2026)
