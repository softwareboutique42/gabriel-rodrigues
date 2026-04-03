# Domain Pitfalls

**Domain:** Sprite-heavy slots animation in deterministic web game
**Researched:** 2026-04-02

## Critical Pitfalls

### Pitfall 1: Game State Coupled to Animation Completion

**What goes wrong:** Wins/payout status are delayed or missed when animation is interrupted.
**Why it happens:** Renderer callback treated as source of truth.
**Consequences:** Determinism regression and flaky tests.
**Prevention:** Engine decides outcome first; animation is side-effect only.
**Detection:** Run with animations disabled and confirm identical outcome traces.

### Pitfall 2: Unbounded Filter/Particle Usage

**What goes wrong:** Frame drops during spin/win moments.
**Why it happens:** Expensive post-processing on full scene each frame.
**Consequences:** Janky reels and poor mobile UX.
**Prevention:** Cap particle count, scope filters, define per-device quality tiers.
**Detection:** 100-spin soak with p95/p99 frame-time budget assertions.

### Pitfall 3: Atlas Pipeline Drift

**What goes wrong:** Wrong frames, missing animations, cache mismatch after asset updates.
**Why it happens:** Ad-hoc naming and manual export inconsistencies.
**Consequences:** Broken symbol states in production.
**Prevention:** Versioned atlas artifacts and strict naming/tag contracts.
**Detection:** CI check validates required animation/state frame groups.

## Moderate Pitfalls

### Pitfall 1: SPA Lifecycle Leaks

**What goes wrong:** Multiple render loops/listeners after route changes.
**Prevention:** Keep AbortController + explicit Pixi scene destroy on page swap.

### Pitfall 2: Motion Accessibility as an Afterthought

**What goes wrong:** Reduced-motion users get incomplete visual feedback.
**Prevention:** Design reduced-motion variants with equal state clarity.

## Minor Pitfalls

### Pitfall 1: Over-engineering custom rendering abstractions too early

**What goes wrong:** Slower delivery with little user value.
**Prevention:** Start with thin adapter and evolve only when required.

## Phase-Specific Warnings

| Phase Topic                       | Likely Pitfall               | Mitigation                            |
| --------------------------------- | ---------------------------- | ------------------------------------- |
| Sprite pipeline setup             | Naming/packing inconsistency | Scripted export and validation        |
| Symbol/reel animation integration | Logic/render coupling        | Event boundary + adapter layer        |
| VFX polish                        | Budget blowups on mobile     | Quality tiers and perf budgets        |
| Accessibility pass                | Motion-only communication    | Non-motion equivalents + ARIA updates |

## Sources

- Pixi performance guidance
- MDN reduced motion
- Workspace SPA lifecycle patterns
