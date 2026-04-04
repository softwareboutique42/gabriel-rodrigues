---
phase: 46-dampener-suppression-and-confidence-lock
plan: "01"
subsystem: slots-casinocraftz
tags: [sessionStorage, css, animation-suppression, dopamine-dampener, FX-71, FX-73]
dependency_graph:
  requires: [45-01]
  provides: [ccz:dampened sessionStorage signal, slotsAnimDampened dataset attribute, FX-71 CSS suppression block, FX-73 EN/PT parity contracts]
  affects:
    - src/scripts/casinocraftz/tutorial/cards.ts
    - src/scripts/slots/main.ts
    - src/styles/global.css
    - tests/slots-dampener-suppression-contract.test.mjs
tech_stack:
  added: []
  patterns: [cross-page sessionStorage signal, CSS compound attribute-selector suppression, source-grep contract testing]
key_files:
  created:
    - tests/slots-dampener-suppression-contract.test.mjs
  modified:
    - src/scripts/casinocraftz/tutorial/cards.ts
    - src/scripts/slots/main.ts
    - src/styles/global.css
decisions:
  - "sessionStorage tab-scoped signal ('ccz:dampened'='1') bridges Casinocraftz card activation to Slots init — no persistent state, session-cleared"
  - "Suppression is CSS-only via compound selector [data-slots-anim-dampened='true'][data-slots-anim-effect='win'] — higher specificity than base win rules, no !important needed"
  - "clearCard unconditionally removes ccz:dampened regardless of which card was previously active — correct because only one dampener card exists"
  - "Slots init reads sessionStorage once at page load before mountSlotsController — CSS takes effect on first paint"
  - "Silent absence (animation:none + border-color:transparent) is the educational payload — no muted fallback glow"
metrics:
  duration: "~8 minutes"
  completed: "2026-04-04"
  tasks_completed: 4
  files_modified: 4
---

# Phase 46 Plan 01: Dampener Suppression and Confidence Lock Summary

Cross-page sessionStorage signal bridges Casinocraftz Dopamine Dampener card activation to Slots win-celebration suppression: `cards.ts` writes `ccz:dampened`, `slots/main.ts` reads it at init and sets `data-slots-anim-dampened`, CSS compound selector silences both reel-window and frame animations when dampened and win coexist.

## Tasks Completed

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | Extend cards.ts sessionStorage write/clear | 2a2ae32 | src/scripts/casinocraftz/tutorial/cards.ts |
| 2 | Read dampened signal in slots/main.ts | 89c1e5f | src/scripts/slots/main.ts |
| 3 | Add CSS dampened suppression rules | e74eb38 | src/styles/global.css |
| 4 | Source-grep contract tests FX-71 and FX-73 | a89c3d6 | tests/slots-dampener-suppression-contract.test.mjs |

## What Was Built

### Task 1: cards.ts sessionStorage signal (src/scripts/casinocraftz/tutorial/cards.ts)

Two changes applied to the card activation functions:

1. **applyCard — sessionStorage write**: After `tutorialZone.classList.add(...)`, a guarded block writes `sessionStorage.setItem('ccz:dampened', '1')` when `cardId === 'dopamine-dampener'`. Other card IDs are unaffected. Wrapped in try/catch for private browsing safety.

2. **clearCard — sessionStorage clear**: At the top of `clearCard`, before the dataset/class cleanup, `sessionStorage.removeItem('ccz:dampened')` is called unconditionally. Wrapped in try/catch. This means deactivating any card (which calls `clearCard`) removes the signal, which is correct since activating any other card transitions away from the dampener.

### Task 2: slots/main.ts dampened signal read (src/scripts/slots/main.ts)

One block inserted in `initSlotsShell()` immediately after `root.dataset.slotsHost = hostMode`:

```ts
let dampened = false;
try {
  dampened = sessionStorage.getItem('ccz:dampened') === '1';
} catch {
  // sessionStorage unavailable (private browsing) — default to undampened.
}
root.dataset.slotsAnimDampened = dampened ? 'true' : 'false';
```

The attribute is set before `mountSlotsController` so the CSS suppression applies on first paint without a frame of win animation leaking through.

### Task 3: CSS suppression block (src/styles/global.css)

Inserted immediately after the minimal win fallback block (~line 1570), before `@media (min-width: 768px)`:

```css
/* FX-71: Dopamine Dampener suppression — disables win-celebration animations when card is active */
#slots-shell-root[data-slots-anim-dampened='true'][data-slots-anim-effect='win']
  .slots-stage__frame,
#slots-shell-root[data-slots-anim-dampened='true'][data-slots-anim-effect='win']
  .slots-stage__reel-window {
  animation: none;
  border-color: transparent;
}
```

Specificity: (1 id + 2 attrs + 1 class) — overrides the base win rules (1 id + 1 attr + 1 class) cleanly without `!important`. `border-color: transparent` removes residual cyan/gold coloring. No fallback glow — silence is the educational point.

### Task 4: Contract tests (tests/slots-dampener-suppression-contract.test.mjs)

6 source-grep contract tests following the `slots-win-celebration-contract.test.mjs` pattern:

- **FX-71 test 1**: `cards.ts` contains `sessionStorage.setItem('ccz:dampened'...)` and `dopamine-dampener`
- **FX-71 test 2**: `cards.ts` contains `sessionStorage.removeItem('ccz:dampened'...)`
- **FX-71 test 3**: `slots/main.ts` reads `ccz:dampened` via `getItem` and sets `slotsAnimDampened`
- **FX-71 test 4**: `global.css` compound selector `[data-slots-anim-dampened='true'][data-slots-anim-effect='win']` with `animation: none`
- **FX-73 test 1**: EN and PT Casinocraftz pages both have `data-casinocraftz-card-activate="dopamine-dampener"`
- **FX-73 test 2**: EN and PT Slots pages both have `data-slots-shell="cabinet"` and `slots/main.ts` contains `slotsAnimDampened`

All 6 tests pass: `node --test tests/slots-dampener-suppression-contract.test.mjs` exits 0.

## Deviations from Plan

None — plan executed exactly as written.

## Known Stubs

None — sessionStorage signal, dataset attribute, and CSS suppression are all wired end-to-end. No placeholder data or disconnected props.

## Threat Flags

None — no new network endpoints, auth paths, or trust boundaries. All changes are tab-scoped sessionStorage (presentation-only flag) and CSS attribute selectors. Threat register in the plan (T-46-01 through T-46-04) covers the full surface with accepted dispositions.

## Self-Check: PASSED

- [x] `src/scripts/casinocraftz/tutorial/cards.ts` modified — `grep -c "ccz:dampened"` returns 2
- [x] `src/scripts/slots/main.ts` modified — `grep "slotsAnimDampened"` returns match
- [x] `src/styles/global.css` modified — `grep -c "data-slots-anim-dampened='true'"` returns 2
- [x] `tests/slots-dampener-suppression-contract.test.mjs` created with 6 passing tests
- [x] Commit 2a2ae32 exists (feat casinocraftz cards.ts)
- [x] Commit 89c1e5f exists (feat slots main.ts)
- [x] Commit e74eb38 exists (feat slots global.css)
- [x] Commit a89c3d6 exists (test contract tests)
- [x] `node --test tests/slots-dampener-suppression-contract.test.mjs` exits 0, 6/6 pass
- [x] `npm run build` succeeds with no TypeScript or CSS errors
- [x] No new .ts or .js source files created (only the test .mjs file)
