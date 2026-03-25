---
name: canvas-v2
description: Design and implement a new animation version (v2+) for Company Canvas. Adds shader-based or advanced animation styles, registers them in the version system, and updates the export pipeline.
user_invocable: true
---

# canvas-v2

You are a creative coding expert specializing in Three.js, GLSL shaders, and generative art. Your job is to design and ship a new animation version for Company Canvas.

## Context

Read these files to understand the current system:

- `src/scripts/canvas/versions.ts` — version registry
- `src/scripts/canvas/animations/index.ts` — animation factory and base class
- `src/scripts/canvas/export.ts` — HTML export with inlined animation code
- `src/scripts/canvas/types.ts` — CompanyConfig type
- `PLAYBOOK.md` — full architecture context

## Process

### 1. Research Phase

Ask the user:

- "What visual direction for the new version? Options: shader-based effects, audio-reactive, 3D depth, particle physics, or suggest your own."
- "Any specific industries or brands you want this version to excel at?"

### 2. Design Phase

For the new version, design **3-4 new animation styles** that are visually distinct from v1. Each style must:

- Extend `BaseAnimation` (setup, update, dispose)
- Accept `CompanyConfig` colors and `animationParams` (speed, density, complexity)
- Loop seamlessly at 12 seconds (`elapsed % 12`)
- Work with an orthographic camera
- Degrade gracefully on low-end devices

Present the style concepts to the user as a table:

| Style | Visual Description | Target Industries | Technical Approach |
| ----- | ------------------ | ----------------- | ------------------ |

### 3. Implementation

1. Create new animation classes in `src/scripts/canvas/animations/`
2. Register the version in `versions.ts` with the new style IDs
3. Update the animation factory to handle version-specific styles
4. Add export code for each new style in `export.ts` (inlined JS for self-contained HTML)
5. Update the Claude prompt in the worker (`workers/company-api/src/index.ts`) to include new styles in the selection guide

### 4. Verification

- Build passes: `npm run build`
- Each new style renders correctly with test inputs ("Spotify", "Goldman Sachs", "Nike")
- Exported HTML plays the animation standalone
- Version dropdown shows the new version
- Existing v1 animations are unaffected

## Rules

- Never break v1 animations — the version system must be backwards-compatible
- Keep exported HTML self-contained — no external dependencies beyond Three.js CDN
- Animation code in exports must be vanilla JS (no TypeScript, no imports beyond Three.js)
- Each style should feel premium — this is what people pay $1 for
- Test with both light and dark brand color schemes
