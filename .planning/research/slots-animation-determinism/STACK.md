# Technology Stack

**Project:** Deterministic Slots Animation and Sprite Runtime
**Researched:** 2026-04-02

## Recommended Stack

### Core Framework

| Technology                         | Version      | Purpose                                  | Why                                                  |
| ---------------------------------- | ------------ | ---------------------------------------- | ---------------------------------------------------- |
| TypeScript + existing slots engine | current repo | Deterministic game state and transitions | Already contract-tested and modular; no rewrite risk |
| Existing DOM/data-attribute shell  | current repo | Runtime observability + Playwright hooks | Keeps current testing strategy stable                |

### Rendering and Sprite Runtime

| Technology                                     | Version      | Purpose                                                             | Why                                                                                             |
| ---------------------------------------------- | ------------ | ------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------- |
| PixiJS                                         | 8.x          | Sprite atlas parsing, AnimatedSprite playback, layered 2D rendering | Official support for spritesheet assets, async parsing, deterministic update control via ticker |
| requestAnimationFrame + fixed-step accumulator | Web standard | Time source for presentation loop                                   | Decouples render cadence from deterministic simulation state                                    |

### Testing Infrastructure

| Technology                      | Version                         | Purpose                                           | Why                                                                                   |
| ------------------------------- | ------------------------------- | ------------------------------------------------- | ------------------------------------------------------------------------------------- |
| Node `node:test` contract tests | current repo                    | Determinism and replay guarantees                 | Existing baseline already validates state and economy invariants                      |
| Playwright                      | 1.58+ (repo), docs current 2026 | Browser orchestration and visual/state assertions | Existing E2E setup; can control clock including rAF for deterministic animation tests |

### Supporting Libraries

| Library                             | Version       | Purpose                                                   | When to Use                                                  |
| ----------------------------------- | ------------- | --------------------------------------------------------- | ------------------------------------------------------------ |
| TexturePacker-compatible atlas JSON | current tools | Sprite atlas generation (`frames`, optional `animations`) | Build-time sprite packing for reel symbols and VFX flipbooks |

## Alternatives Considered

| Category         | Recommended                                | Alternative                                 | Why Not                                                                                            |
| ---------------- | ------------------------------------------ | ------------------------------------------- | -------------------------------------------------------------------------------------------------- |
| Animation timing | Fixed-step presentation clock              | Variable-delta animation tied to frame time | Variable delta drifts behavior by device refresh rate and harms deterministic replay comparability |
| Effect triggers  | Event queue from simulation results        | Reading DOM state ad hoc                    | DOM polling introduces race conditions and brittle E2E behavior                                    |
| Rendering        | Pixi sprite layers over deterministic core | Three.js or CSS-only sprite hacks           | Higher complexity or weaker sprite-state ergonomics for 2D slots pipeline                          |

## Installation

```bash
# Core runtime
npm install pixi.js

# No new test framework required
```

## Sources

- https://pixijs.com/8.x/guides/components/assets (HIGH)
- https://pixijs.download/release/docs/assets.Spritesheet.html (HIGH)
- https://pixijs.download/release/docs/assets.SpritesheetData.html (HIGH)
- https://pixijs.com/8.x/guides/components/ticker (HIGH)
- https://developer.mozilla.org/en-US/docs/Web/API/Window/requestAnimationFrame (HIGH)
- https://gafferongames.com/post/fix_your_timestep/ (MEDIUM: industry-standard reference, not spec)
- https://playwright.dev/docs/clock (HIGH)
- https://playwright.dev/docs/test-snapshots (HIGH)
