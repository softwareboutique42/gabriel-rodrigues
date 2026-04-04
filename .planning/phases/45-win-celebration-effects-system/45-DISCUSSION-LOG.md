# Phase 45: Win-Celebration Effects System - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-04-04
**Phase:** 45-win-celebration-effects-system
**Areas discussed:** Reel window glow, Effect prominence, Win-state persistence

---

## Reel Window Glow

| Option | Description | Selected |
|--------|-------------|----------|
| Cyan neon (Recommended) | `--color-cyan` (#00e5ff) — matches brand accent, differentiates reels from gold frame | |
| Gold (same as frame) | rgba(255,215,9,...) — unified gold palette, simpler | |
| Both — reel gets cyan, frame intensified gold | Two-tone win moment: reels = cyan, frame = gold amplified | ✓ |

**User's choice:** Both — reel gets cyan, frame intensified gold

---

| Option | Description | Selected |
|--------|-------------|----------|
| Animate — brief pulse (Recommended) | New @keyframes, 2 iterations, synced with slots-win-flare timing | ✓ |
| Static glow only | No animation, just box-shadow/border on win | |
| You decide | Claude picks based on visual coherence | |

**User's choice:** Animate — brief pulse

---

## Effect Prominence

| Option | Description | Selected |
|--------|-------------|----------|
| Moderate uplift (Recommended) | Raise outer glow to ~0.35–0.40 opacity, keep 2 iterations | |
| Keep current frame, reel is enough | Leave slots-win-flare as-is | |
| Full dramatic pulse | Raise to 0.55+, brief scale nudge or brightness flash, casino-style | ✓ |

**User's choice:** Full dramatic pulse

---

| Option | Description | Selected |
|--------|-------------|----------|
| Same for all wins (Recommended) | Flat treatment — no payout-intensity scaling | ✓ |
| You decide | Claude decides based on runtime exposure | |

**User's choice:** Same for all wins

---

## Win-State Persistence

| Option | Description | Selected |
|--------|-------------|----------|
| Hold a static highlight (Recommended) | Win CSS stays active until next spin-accepted event | ✓ |
| Reset to idle after animation | JS timeout or fill-mode change clears dataset after ~1.9s | |
| Dim but don't clear | Reel glow fades to softer persistent cyan, frame dims | |

**User's choice:** Hold a static highlight

---

## Claude's Discretion

- Exact `@keyframes slots-reel-win-pulse` curve and shadow values
- Whether scale nudge uses transform or filter
- Selector structure for extending reduced/minimal blocks
- Test file placement and contract assertion style
- Verification approach for FX-70/FX-72

## Deferred Ideas

None
