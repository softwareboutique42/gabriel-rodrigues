# Phase 45: Win-Celebration Effects System - Context

**Gathered:** 2026-04-04
**Status:** Ready for planning

<domain>
## Phase Boundary

Add visible win-celebration effects to the Slots runtime: a cyan neon pulse on reel windows and an amplified gold frame effect — both driven by the existing `data-slots-anim-effect='win'` dataset hook, both respecting the current motion-policy stack (`full`/`reduced`/`minimal`).

No new authority logic, no changes to RNG/payouts/economy. All effects are CSS-only, triggered by existing `runtime.ts` output.

</domain>

<decisions>
## Implementation Decisions

### Reel Window Glow

- **D-01:** Reel windows (`.slots-stage__reel-window`) get a **cyan neon glow** (`--color-cyan: #00e5ff`) on win — separate from the gold frame effect. Two-tone win moment: reels = cyan, frame = gold.
- **D-02:** The reel glow **animates** — new `@keyframes slots-reel-win-pulse`, ~2 iterations, timed to match the existing `slots-win-flare` cadence (~0.95s). Not static-only.
- **D-03:** All wins receive the same treatment — flat effect, no payout-intensity scaling. Keeps the effect layer presentation-only with no payout logic crossing the boundary.

### Frame Effect Amplification

- **D-04:** The existing `slots-win-flare` gold frame effect is **amplified to full dramatic pulse**: outer glow raised to ~0.55+ opacity (from current 0.18), with a brief scale nudge or brightness flash. Casino-style impact while staying within existing motion-policy guardrails.

### Win-State Persistence

- **D-05:** The win visual state **holds as a static highlight until the next spin** (`spin-accepted` event). After animation completes: reel glow and gold frame borders remain visible, celebrate aura stays. No timeout, no reset JS — current `data-slots-anim-effect` lifecycle is correct and intentional.

### Motion Policy Integration

- **D-06:** New reel-win-pulse and amplified frame effect must integrate with the existing intensity stack:
  - `reduced`: 1 iteration (extend existing `animation-iteration-count: 1` rule to cover new reel animation)
  - `minimal`: animation: none, box-shadow only (extend existing minimal block to cover new reel selector)
- **D-07:** `prefers-reduced-motion` is already handled via motion-policy → no additional media query needed.

### Claude's Discretion

- Exact `@keyframes slots-reel-win-pulse` curve and shadow values (within cyan neon palette)
- Whether "scale nudge" on frame is via `transform: scale(1.01)` or `filter: brightness(1.15)` — either is valid
- Exact selector structure for extending existing `reduced`/`minimal` blocks
- Test file placement and contract assertion style (extend existing pattern from Phase 27/28)
- Verification approach for FX-70/FX-72 (source-grep contract + E2E attribute check, consistent with prior phase patterns)

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Animation runtime

- `src/scripts/slots/animation/runtime.ts` — resolves and writes `data-slots-anim-effect`, `data-slots-anim-atmosphere`, `data-slots-anim-intensity`; `resolveEffectState()` already returns `'win'` correctly
- `src/scripts/slots/animation/outcome-feedback.ts` — publishes `win`/`loss`/`idle` status from `spin-resolved` events
- `src/scripts/slots/animation/motion-policy.ts` — canonical motion intensity resolution; `full`/`reduced`/`minimal`

### CSS effects layer

- `src/styles/global.css` — contains all existing `[data-slots-anim-effect='win']` and `[data-slots-anim-intensity='...']` rules; new rules extend this file (lines ~1350–1540)

### Slots pages (EN/PT canonical routes)

- `src/pages/en/slots/index.astro`
- `src/pages/pt/slots/index.astro`

### Existing test infrastructure

- `tests/compatibility-contract.test.mjs` — source-grep contract pattern to extend for FX-70/FX-72
- `e2e/compatibility.spec.ts` — E2E pattern for dataset attribute assertions

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets

- `data-slots-anim-effect='win'` — already set by `runtime.ts` when `timelineSnapshot.phase === 'stop' && feedbackSnapshot.status === 'win'`. No new TS needed.
- `slots-win-flare` @keyframes — existing gold frame pulse; amplify values in-place, don't create a new keyframe set
- `data-slots-anim-intensity` — already on `#slots-shell-root`; reduced/minimal rules already exist for win frame; just extend selectors to include new reel rules

### Established Patterns

- All effects are CSS attribute selectors on `#slots-shell-root[data-slots-anim-effect='win']` — no JS class toggling
- `reduced` intensity: adds `animation-iteration-count: 1` to existing animation rules
- `minimal` intensity: `animation: none !important` on a broad selector block + box-shadow fallback

### Integration Points

- `src/styles/global.css` ~lines 1350–1540: add new `@keyframes slots-reel-win-pulse` and extend `[data-slots-anim-effect='win']` block to include `.slots-stage__reel-window`
- Extend existing reduced/minimal selector lists to cover the new reel animation

</code_context>

<specifics>
## Specific Ideas

- Two-tone win moment is the key visual intent: **cyan reels + gold frame** working together. Don't merge them into the same color.
- "Full dramatic pulse" on the frame means clearly visible — not the current subtle 0.18 glow. Casino-style. Still CSS-only, still policy-gated.

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope.

</deferred>

---

*Phase: 45-win-celebration-effects-system*
*Context gathered: 2026-04-04*
