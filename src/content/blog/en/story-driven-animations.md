---
title: 'Building Story Animations That Tell What a Company Does'
description: 'How I designed four new Three.js animation styles that turn brand keywords into visual narratives — from cinematic captions to interactive star maps.'
date: 2026-03-26
tags: ['three.js', 'canvas', 'creative-coding', 'ai']
lang: 'en'
---

# Building Story Animations That Tell What a Company Does

The first version of [Company Canvas](/en/canvas/) had four animation styles — particles, flowing lines, geometric shapes, and typographic grids. They looked great, but they were abstract. You'd type "Spotify" and get a beautiful green particle cloud, but nothing in the animation said _music streaming_ or _playlists_ or _discovery_.

I wanted animations that tell a story. Not literally narrate it, but visually communicate what the company actually does using the keywords the AI already generates.

## The Idea: Use What's Already There

Every time Claude generates a brand config, it returns a `visualElements` array — 3 to 5 keywords that describe the company's core identity. For Spotify, that might be `["PLAYLISTS", "DISCOVERY", "STREAMING", "ARTISTS", "PODCASTS"]`. For Tesla: `["ELECTRIC", "INNOVATION", "AUTOPILOT", "ENERGY", "FUTURE"]`.

In v1, these keywords were ignored by the animation engine. They only showed up in the info panel. The question was: how do you turn words into motion?

## Text in Three.js Is Harder Than You'd Think

Three.js doesn't have a built-in text primitive that works well for this use case. The options are:

1. **TextGeometry** — generates 3D mesh from fonts. Heavy, requires loading font files, overkill for 2D labels.
2. **CSS2DRenderer** — overlays HTML elements on the canvas. Doesn't export to standalone HTML cleanly.
3. **CanvasTexture + Sprite** — render text to a 2D canvas, use it as a texture on a sprite. Lightweight, exportable, works everywhere.

I went with option 3. The `createTextSprite` utility renders text onto an offscreen canvas, measures it precisely, and creates a `THREE.Sprite` with the right aspect ratio:

```typescript
export function createTextSprite(text: string, color: string, fontSize = 64): THREE.Sprite {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d')!;
  const font = `bold ${fontSize}px 'Segoe UI', system-ui, sans-serif`;
  ctx.font = font;
  const metrics = ctx.measureText(text);
  // ...size canvas, draw text, create texture
  const sprite = new THREE.Sprite(material);
  const aspect = canvas.width / canvas.height;
  sprite.scale.set(scale * aspect, scale, 1);
  return sprite;
}
```

This approach has a trade-off: text isn't resolution-independent. If someone zooms in on the exported HTML, the text gets blurry. But for the target use case — 1920x1080 brand animations — it's crisp enough, and it keeps the export pipeline simple (no font loading, no external dependencies).

## Four Styles, Four Ways to Tell a Story

Each style answers a different question about the brand:

### Narrative — "What does this company believe?"

Words float up one at a time like cinematic captions. Fade in, hold, fade out. Ambient particles drift in the background. It's the simplest style, but it's effective for brands with a strong mission — the sequential reveal gives each keyword weight.

The timing math divides the 12-second loop equally across all words:

```typescript
const segmentDuration = 1 / total;
const segStart = index * segmentDuration;
const localProgress = (progress - segStart) / segmentDuration;
// Fade in (0-20%), hold (20-70%), fade out (70-100%)
```

### Timeline — "What are this company's pillars?"

A horizontal line draws across the screen, then nodes pulse into existence at intervals. Each node gets a vertical connector and a text label — brand keywords arranged like milestones. Alternating up/down placement keeps it readable.

The reveal is staggered: line first, then nodes left-to-right, then connectors, then labels. Each layer waits for the previous one to start appearing. This cascading entrance gives the animation a sense of progression.

### Constellation — "How does this company's ecosystem connect?"

Keywords become glowing star nodes arranged in a circle, connected by lines. The nodes orbit gently around their base positions, and the connecting lines follow them — so the whole constellation breathes.

This was the trickiest to get right. The line geometry needs to update every frame to track the orbiting stars:

```typescript
const positions = line.geometry.attributes.position.array as Float32Array;
positions[0] = this.stars[i].position.x;
positions[1] = this.stars[i].position.y;
positions[3] = this.stars[next].position.x;
positions[4] = this.stars[next].position.y;
line.geometry.attributes.position.needsUpdate = true;
```

Directly mutating `BufferGeometry` attribute arrays and flagging `needsUpdate` is the standard pattern in Three.js, but it's easy to forget that flag and wonder why nothing moves.

### Spotlight — "What's this brand's hero moment?"

A cinematic zoom effect: concentric rings rotate slowly while keywords cycle through the center at large scale. Each word zooms in from small, holds with a gentle pulse, then zooms out and fades. Radial particles orbit in the background.

This style works best for bold brands or product launches — it gives each keyword a dramatic entrance.

## The Export Challenge

Every animation needs to work in two contexts: the live canvas (using TypeScript classes) and the standalone HTML export (using inlined vanilla JS). That means every animation gets written twice — once as a class extending `BaseAnimation`, and once as a self-contained string in the export pipeline.

The v2 export code also needs the `createTextSprite` function inlined. I extracted it into a shared `createTextSpriteCode()` that returns the function as a string, so all four v2 export styles include it:

```typescript
case 'narrative':
case 'timeline':
case 'constellation':
case 'spotlight':
  return generateV2AnimationCode(config);
```

This dual-implementation approach is a clear trade-off. Keeping two versions in sync is maintenance overhead. A future improvement could be to compile the TypeScript classes into the export bundle directly, eliminating the duplication. But for now, the inlined approach means exports are zero-dependency HTML files that work offline.

## Teaching the AI When to Use V2

The last piece was updating the Claude prompt in the Cloudflare Worker to know about the new styles:

```
v2 — Story (text-driven, tells what the company does):
- "narrative": brands with a strong mission or story
- "timeline": companies with milestones or multi-step processes
- "constellation": companies with interconnected services or ecosystems
- "spotlight": bold brands or product launches

Prefer v2 styles when the company has a clear story to tell. Use v1 for abstract branding.
```

This lets the AI decide whether a company benefits more from abstract beauty (v1) or visual storytelling (v2). The `visualElements` keywords become critical for v2 — they're no longer decorative metadata, they're the animation content.

## What's Next

The text rendering could be sharper with SDF (signed distance field) fonts, which scale without blur. The export duplication should eventually be replaced by a proper build step. And the animation timing could be more dynamic — right now all keywords get equal screen time, but some words deserve more emphasis than others.

But the core idea works: take what the AI already knows about a company and make it visible. The animations aren't just pretty backgrounds anymore — they communicate something.
