# Technology Stack

**Project:** Slots Sprite/Animation Upgrade (Astro + TypeScript, no migration)
**Researched:** 2026-04-02

## Recommended Stack

### Core Runtime

| Technology                                   | Version | Purpose                              | Why                                                              |
| -------------------------------------------- | ------- | ------------------------------------ | ---------------------------------------------------------------- |
| `pixi.js`                                    | 8.17.x  | 2D renderer for reels/symbol sprites | Best fit for atlas + batched sprite animation in browser TS apps |
| Existing deterministic engine                | Current | Authoritative game loop              | Keep payout/result logic independent from renderer timing        |
| Fixed-step simulation + render interpolation | Pattern | Stable logic at varying FPS          | Prevents frame-rate-driven drift                                 |

### Sprite Pipeline

| Technology                        | Version           | Purpose                              | Why                                                                |
| --------------------------------- | ----------------- | ------------------------------------ | ------------------------------------------------------------------ |
| Aseprite CLI                      | Current docs 2026 | Export sprite sheets + JSON metadata | Scriptable, deterministic, good tag/layer export for symbol states |
| TexturePacker (optional)          | Current docs 2026 | Production atlas packing             | Fast authoring flow + direct Pixi exporter                         |
| Pixi `Assets` + manifests/bundles | v8                | Load/unload atlas bundles safely     | Built-in caching, aliases, bundle loading                          |

### Animation & Effects

| Library                           | Version | Purpose                                 | When to Use                                                        |
| --------------------------------- | ------- | --------------------------------------- | ------------------------------------------------------------------ |
| `AnimatedSprite` (Pixi core)      | v8      | Symbol idle/win/impact frame animations | Default choice for frame-based symbol animation                    |
| `@pixi/particle-emitter`          | 5.0.x   | Win bursts, spark trails, coin pops     | Add only for controlled, budgeted VFX                              |
| `pixi-filters`                    | 6.1.x   | Glow/CRT/blur flavor effects            | Use sparingly and scope with `filterArea`                          |
| `@esotericsoftware/spine-pixi-v8` | 4.2.x   | Skeletal character animation            | Only if you need complex hero mascots; not needed for reel symbols |

## Alternatives Considered

| Category          | Recommended                       | Alternative                     | Why Not                                                  |
| ----------------- | --------------------------------- | ------------------------------- | -------------------------------------------------------- |
| Renderer          | PixiJS v8                         | Canvas 2D custom loop only      | More manual batching/atlas work for same result          |
| Atlas tool        | Aseprite CLI / TexturePacker      | `spritesheet-js`                | Stale (3 years) and non-commercial license mismatch risk |
| Animation control | Engine events -> visual timelines | Callback-driven game state      | Risks determinism regressions                            |
| Effects baseline  | Minimal core + optional tiers     | Heavy default filters/particles | Too expensive on mid/low-end mobile                      |

## Installation

```bash
# Core renderer
npm install pixi.js

# Optional effects
npm install @pixi/particle-emitter pixi-filters

# Optional advanced skeletal animation
npm install @esotericsoftware/spine-pixi-v8
```

## Sources

- https://pixijs.com/8.x/guides/components/assets
- https://pixijs.com/8.x/guides/concepts/performance-tips
- https://pixijs.download/release/docs/scene.AnimatedSprite.html
- https://www.aseprite.org/docs/cli/
- https://www.codeandweb.com/texturepacker/documentation
- https://www.npmjs.com/package/@pixi/particle-emitter
- https://www.npmjs.com/package/pixi-filters
- https://esotericsoftware.com/spine-pixi
