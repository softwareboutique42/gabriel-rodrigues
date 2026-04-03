# Feature Landscape

**Domain:** Deterministic Slots Animation + Sprite Orchestration
**Researched:** 2026-04-02

## Table Stakes

Features users and QA infrastructure should expect.

| Feature                                              | Why Expected                                                    | Complexity | Notes                                                              |
| ---------------------------------------------------- | --------------------------------------------------------------- | ---------- | ------------------------------------------------------------------ |
| Sprite atlas symbol rendering                        | Reduces texture swaps and standard for slot symbol art          | Medium     | Build atlas JSON + image pairs for symbols and VFX                 |
| Animation state layers (`reel`, `symbol`, `overlay`) | Needed to separate spin motion from win effects and UI feedback | Medium     | Presentation-only state should not mutate deterministic game state |
| Deterministic effect trigger queue                   | Win/near-miss/stop effects must match round result exactly      | Medium     | Trigger from result events with stable IDs                         |
| Test-visible runtime hooks                           | Existing tests rely on attributes and serializable state        | Low        | Keep and extend `data-slots-*` observability                       |

## Differentiators

| Feature                                                     | Value Proposition                                                | Complexity | Notes                                                       |
| ----------------------------------------------------------- | ---------------------------------------------------------------- | ---------- | ----------------------------------------------------------- |
| Replayable animation timeline from event log                | Enables debugging and deterministic repros of visual regressions | High       | Drive animation from event stream + tick index              |
| Layered effect orchestration with priority/cancel semantics | Prevents conflicting VFX and improves polish                     | High       | Introduce explicit orchestration graph and conflict rules   |
| Deterministic screenshot baselines with frozen clock        | Stable visual QA even with animation-heavy UI                    | Medium     | Use Playwright clock and style masking for volatile regions |

## Anti-Features

| Anti-Feature                                              | Why Avoid                                      | What to Do Instead                                                     |
| --------------------------------------------------------- | ---------------------------------------------- | ---------------------------------------------------------------------- |
| Let animation timing decide game outcomes                 | Breaks determinism and contract guarantees     | Keep simulation authoritative; animation only consumes resolved events |
| Randomized particle/effect behavior without seeded source | Flaky visual tests and non-replayable outcomes | Derive effect randomness from deterministic event seed/ID              |
| DOM-driven state machine for VFX                          | Races and hidden coupling                      | Use explicit orchestrator state and event bus                          |

## Feature Dependencies

`Deterministic event log` -> `Animation state layers` -> `Effect orchestration`

`Sprite atlas asset pipeline` -> `Renderer symbol mapping` -> `Animation playback`

`Clock control in tests` -> `Deterministic visual assertions`

## MVP Recommendation

Prioritize:

1. Sprite atlas manifest + renderer adapter
2. Presentation state layers that consume existing round results
3. Event-driven effect orchestrator with cancel/priority rules

Defer: Rich particle systems and shader-heavy effects until deterministic replay tests are in place.

## Sources

- Existing code: `src/scripts/slots/controller.ts`, `src/scripts/slots/engine/*.ts`
- https://pixijs.download/release/docs/assets.SpritesheetData.html (HIGH)
- https://playwright.dev/docs/clock (HIGH)
- https://playwright.dev/docs/test-assertions (HIGH)
