# Feature Landscape

**Domain:** Browser slots with richer sprite animation
**Researched:** 2026-04-02

## Table Stakes

| Feature                                        | Why Expected               | Complexity | Notes                                               |
| ---------------------------------------------- | -------------------------- | ---------- | --------------------------------------------------- |
| Animated symbol states (`idle`, `spin`, `win`) | Standard in modern slot UX | Medium     | Use atlas tags or naming conventions for state sets |
| Reel stop choreography                         | Core game feel             | Medium     | Deterministic stop order from engine events         |
| Atlas-based symbols                            | Prevent texture thrash     | Medium     | Group high-frequency symbols into shared atlases    |
| Reduced-motion visual mode                     | Accessibility baseline     | Low        | Alternate visual path, same game logic              |
| EN/PT message parity in outcomes               | Existing product contract  | Low        | Keep state model language-agnostic                  |

## Differentiators

| Feature                                 | Value Proposition          | Complexity | Notes                                         |
| --------------------------------------- | -------------------------- | ---------- | --------------------------------------------- |
| Contextual win effects by payout tier   | Better excitement scaling  | Medium     | Tie VFX intensity to payout class             |
| Rare-symbol hero animations             | Stronger identity          | Medium     | Keep rare and budgeted to avoid overdraw      |
| Replay-friendly animation timeline logs | Easier debugging and trust | Medium     | Emit visual event traces with seed/spin index |

## Anti-Features

| Anti-Feature                                                   | Why Avoid                    | What to Do Instead                           |
| -------------------------------------------------------------- | ---------------------------- | -------------------------------------------- |
| Replacing deterministic engine with animation timeline control | Breaks correctness and tests | Keep visuals as subscribers to engine events |
| Overusing full-screen filters every spin                       | Frame-time spikes on mobile  | Use short scoped bursts and quality tiers    |
| Building a custom atlas packer before shipping                 | High maintenance and low ROI | Use Aseprite CLI or TexturePacker first      |

## Feature Dependencies

Engine state events -> reel animation orchestration -> symbol state animations -> optional VFX tiers -> accessibility/i18n parity checks

## MVP Recommendation

Prioritize:

1. Atlas pipeline + symbol state animation.
2. Reel/win/idle event mapping from existing controller/engine states.
3. Performance and reduced-motion guardrails.

Defer: Spine/complex skeletal characters unless there is a clear product need.

## Sources

- PixiJS assets/performance docs
- Aseprite CLI docs
- MDN prefers-reduced-motion
