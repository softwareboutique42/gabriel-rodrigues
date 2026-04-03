# Architecture Patterns

**Domain:** Astro + TypeScript slots frontend with deterministic engine
**Researched:** 2026-04-02

## Recommended Architecture

Deterministic engine remains authoritative. A dedicated visual runtime translates engine state/events into reel and sprite animations.

### Component Boundaries

| Component                                | Responsibility                                        | Communicates With       |
| ---------------------------------------- | ----------------------------------------------------- | ----------------------- |
| Engine (`state-machine`, round resolver) | Authoritative spin state and result data              | Controller only         |
| Slots Controller                         | Converts engine transitions into UI + visual commands | Engine + Visual Adapter |
| Visual Adapter (new module)              | Maps state/events to Pixi scene actions               | Controller + Pixi Scene |
| Pixi Scene (new module)                  | Reel containers, symbol sprites, VFX, asset cache     | Visual Adapter          |
| Astro page shell                         | Lifecycle setup and disposal                          | `initSlotsShell`        |

### Data Flow

1. User triggers spin.
2. Engine resolves deterministic state/result.
3. Controller emits visual commands (`startReels`, `stopReel(i)`, `playWinTier(n)`).
4. Pixi scene animates commands; logic is never derived from animation completion.
5. UI/i18n updates from engine result and status keys.

## Patterns to Follow

### Pattern 1: Visual Adapter Layer

**What:** Add an adapter between controller and renderer.
**When:** Immediately when introducing Pixi.
**Example:**

```typescript
visualAdapter.onSpinStarted({ spinIndex });
visualAdapter.onSpinResolved({ result, spinIndex });
```

### Pattern 2: Atlas-First Asset Contracts

**What:** Treat atlas JSON + image as versioned artifacts.
**When:** For every symbol pack release.
**Example:**

```typescript
await Assets.loadBundle('slots-core');
const reelA = Assets.get('atlas.symbols.reelA');
```

## Anti-Patterns to Avoid

### Anti-Pattern 1: Animation Completion Decides Payout State

**Why bad:** Any dropped/skipped frame can alter behavior.
**Instead:** Payout is final in engine before VFX starts.

### Anti-Pattern 2: One Giant Atlas for All Effects

**Why bad:** Memory overhead and slow uploads on lower devices.
**Instead:** Separate core symbols from optional VFX atlases.

## Scalability Considerations

| Concern              | At 100 users   | At 10K users                        | At 1M users                               |
| -------------------- | -------------- | ----------------------------------- | ----------------------------------------- |
| Runtime stability    | Manual QA      | CI perf smoke tests                 | Device-tier quality policies              |
| Asset updates        | Manual exports | Scripted atlas pipeline             | Versioned asset manifests + cache busting |
| Accessibility parity | Spot checks    | Automated reduced-motion assertions | Continuous a11y regression suite          |

## Sources

- https://pixijs.com/8.x/guides/components/application
- https://pixijs.com/8.x/guides/components/assets
- https://pixijs.com/8.x/guides/concepts/performance-tips
- Workspace slots architecture (`src/scripts/slots/*`)
