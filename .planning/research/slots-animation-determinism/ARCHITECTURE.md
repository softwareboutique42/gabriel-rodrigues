# Architecture Patterns

**Domain:** Deterministic slots runtime with sprite/animation presentation layer
**Researched:** 2026-04-02

## Recommended Architecture

Deterministic engine remains authoritative. A separate presentation pipeline consumes immutable engine snapshots and deterministic event records.

Simulation path:
`Input -> Engine reducer -> RoundResult + EngineState -> DOM/test attributes`

Presentation path:
`RoundResult + Event log -> AnimationStateStore -> EffectOrchestrator -> SpriteRenderer`

No data flows back from presentation into engine outcomes.

### Component Boundaries

| Component                                     | Responsibility                                                                         | Communicates With                          |
| --------------------------------------------- | -------------------------------------------------------------------------------------- | ------------------------------------------ |
| `engine/*` (existing)                         | Deterministic round resolution, transitions, payout                                    | `slots/controller` only                    |
| `slots/presentation/event-log.ts`             | Convert engine transitions/results into typed visual events with stable IDs            | `controller`, `animation-store`, `effects` |
| `slots/presentation/animation-store.ts`       | Own animation layer state (`reels`, `symbols`, `overlays`) and per-layer tick progress | `event-log`, `effects`, `renderer`         |
| `slots/presentation/assets/atlas-registry.ts` | Load/validate atlas manifests and map symbol keys to frame keys                        | `renderer`, build pipeline                 |
| `slots/presentation/renderer/pixi-stage.ts`   | Sprite graph, z-order, frame updates, interpolation                                    | `animation-store`, `atlas-registry`        |
| `slots/presentation/effects/orchestrator.ts`  | Schedule/cancel/priority control of effect timelines                                   | `animation-store`, `renderer`              |
| `slots/controller.ts` (existing adapter)      | Dispatches engine events and passes snapshots/events to presentation                   | `engine`, `presentation`                   |

### Data Flow

1. User action dispatches `SPIN_REQUESTED` to engine.
2. Engine transitions to `spinning`; controller emits `SpinStarted` visual event with deterministic `spinId`.
3. Engine resolves `RoundResult`; controller emits `ReelsStopped`, then `PayoutResolved` with same `spinId`.
4. `animation-store` updates layer states by consuming events in order.
5. `effect-orchestrator` binds effects to `spinId` and layer channels (`reel`, `symbol`, `overlay`) with conflict rules.
6. Renderer ticks presentation at fixed interval and interpolates only visual transforms.
7. DOM data attributes continue mirroring authoritative engine state for tests.

### State Ownership

- Engine state (authoritative): deterministic, serializable, test-contract owned.
- Economy state (authoritative): deterministic, contract-test owned.
- Animation state (derived): resettable, replayable from event log; never source of truth.
- Asset state (static): atlas metadata and loaded textures.
- Effect runtime state (ephemeral): active timeline handles keyed by `spinId:eventType`.

## Patterns to Follow

### Pattern 1: Event-Sourced Presentation

**What:** Emit typed visual events from engine transitions/results, replayable in tests.
**When:** Every spin lifecycle transition and payout resolution.
**Example:**

```typescript
interface VisualEvent {
  id: string; // deterministic: `${spinIndex}:${kind}:${seq}`
  spinIndex: number;
  kind: 'SpinStarted' | 'ReelsStopped' | 'PayoutResolved' | 'InsufficientBlocked';
  tick: number; // fixed-step tick index
  payload: Record<string, unknown>;
}
```

### Pattern 2: Layered Animation State

**What:** Maintain independent layer slices to avoid cross-layer coupling.
**When:** Adding reel strips, symbol pulsing, and overlay VFX in same round.
**Example:**

```typescript
interface AnimationLayers {
  reels: Record<number, { phase: 'idle' | 'spinning' | 'settling'; progress: number }>;
  symbols: Record<string, { state: 'static' | 'highlight' | 'dim'; frame: string }>;
  overlays: Record<string, { state: 'off' | 'active' | 'cooldown'; ttlTicks: number }>;
}
```

### Pattern 3: Deterministic Effect Orchestration

**What:** Start effects from events, not from timers tied to wall-clock drift.
**When:** Win lines, anticipation, and near-miss cues.
**Example:**

```typescript
interface EffectCommand {
  key: string; // `${event.id}:${effectName}`
  channel: 'reel' | 'symbol' | 'overlay';
  priority: number;
  startTick: number;
  durationTicks: number;
  cancelOn?: string[];
}
```

## Anti-Patterns to Avoid

### Anti-Pattern 1: Dual-write state

**What:** Updating both engine and animation stores as co-equal truth.
**Why bad:** Divergence under dropped frames or aborted animations.
**Instead:** Engine is authoritative; animation store is pure projection.

### Anti-Pattern 2: Timer-coupled logic outcomes

**What:** Deciding reel stop/outcome based on `setTimeout` or animation completion callback.
**Why bad:** Non-deterministic across hardware and CI timing.
**Instead:** Resolve outcome first, then animate toward known result.

### Anti-Pattern 3: Asset key leakage into domain model

**What:** Putting atlas frame names directly in engine symbols.
**Why bad:** Couples math logic to art pipeline.
**Instead:** Use `SlotSymbol` -> renderer mapping table in presentation layer.

## Scalability Considerations

| Concern             | At 100 users               | At 10K users                       | At 1M users                                        |
| ------------------- | -------------------------- | ---------------------------------- | -------------------------------------------------- |
| Runtime determinism | Contract replay on CI      | Add event-log fixtures per release | Add differential replay harness + golden snapshots |
| Asset delivery      | Local static atlases       | Bundle splitting and cache headers | CDN + manifest version pinning                     |
| Visual regression   | Targeted smoke screenshots | Per-locale screenshot matrix       | Tiered baseline strategy by component/layer        |

## Sources

- Existing runtime: `src/scripts/slots/controller.ts`, `src/scripts/slots/engine/state-machine.ts`, `tests/slots-core-determinism-contract.test.mjs`
- https://pixijs.download/release/docs/assets.Spritesheet.html (HIGH)
- https://pixijs.com/8.x/guides/components/ticker (HIGH)
- https://developer.mozilla.org/en-US/docs/Web/API/Window/requestAnimationFrame (HIGH)
- https://gafferongames.com/post/fix_your_timestep/ (MEDIUM)
