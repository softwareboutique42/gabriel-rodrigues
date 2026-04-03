# Research Summary: Slots Animation Stack Additions

**Domain:** Browser-based slots animation and sprite pipeline
**Researched:** 2026-04-02
**Overall confidence:** HIGH

## Executive Summary

The best stack addition for this codebase is PixiJS v8 as a focused rendering layer, not a framework replacement. It directly supports atlases, animated sprites, and asset lifecycle controls while fitting cleanly into the existing Astro + TypeScript shell and deterministic engine architecture.

For sprite pipeline workflow, Aseprite CLI should be the baseline because it is scriptable and deterministic for frame/tag exports. TexturePacker is a strong optional upgrade for artist speed and packing efficiency, but not required for MVP capability.

For richer visuals, start with AnimatedSprite and event-driven reel choreography, then add controlled effects (`@pixi/particle-emitter`, selective `pixi-filters`) behind quality tiers. This sequencing keeps correctness and performance stable while improving motion quality.

The main architectural rule is strict separation: engine decides outcomes, renderer visualizes outcomes. This is especially important for reduced-motion accessibility and EN/PT parity so presentation differences never alter game behavior.

## Key Findings

**Stack:** PixiJS v8 + Aseprite CLI (+ optional TexturePacker), with optional particle/filter libraries.
**Architecture:** Add a Visual Adapter layer between slots controller and Pixi scene.
**Critical pitfall:** Callback-driven logic from animation completion.

## Implications for Roadmap

Based on research, suggested phase structure:

1. **Sprite Pipeline Foundation** - establish atlas contracts and loading bundles
   - Addresses: atlas workflow, symbol state frame groups
   - Avoids: asset drift and runtime mismatch

2. **Animation Runtime Integration** - connect engine events to reel/symbol animation orchestration
   - Addresses: reel/win/idle animations
   - Avoids: deterministic logic coupling to visual timing

3. **VFX + Performance Safety** - add particles/filters with explicit budgets and quality tiers
   - Addresses: richer effects without regressions
   - Avoids: mobile jank and memory churn

4. **Accessibility + Parity Hardening** - reduced-motion and EN/PT behavior parity tests
   - Addresses: inclusive UX and language consistency
   - Avoids: mode/locale-specific behavioral drift

**Phase ordering rationale:** establish asset and event contracts first, then animation behavior, then optional effects, then hardening.

**Research flags for phases:**

- Phase 3: Needs device-tier budgets agreed before effect scope expands.
- Phase 4: Needs automated reduced-motion parity checks in runtime tests.

## Confidence Assessment

| Area         | Confidence | Notes                                                      |
| ------------ | ---------- | ---------------------------------------------------------- |
| Stack        | HIGH       | Based on current Pixi v8 docs and package ecosystem status |
| Features     | HIGH       | Aligned with current slot animation expectations           |
| Architecture | HIGH       | Matches existing code boundaries in slots scripts          |
| Pitfalls     | HIGH       | Repeatedly observed in animation-heavy deterministic games |

## Gaps to Address

- Define concrete frame-time SLOs for desktop and mobile tiers.
- Decide whether TexturePacker licensing is acceptable vs Aseprite-only pipeline.
- Define exactly which effects are disabled/simplified in reduced-motion mode.
