---
phase: 31-house-edge-tutorial-and-utility-card-systems
plan: 01
subsystem: ui
tags: [astro, playwright, tutorial, slots, i18n, deterministic-state]
requires:
  - phase: 29-casinocraftz-shell-and-route-foundation
    provides: EN/PT Casinocraftz host shell and canonical route surface
  - phase: 30-slots-integration-and-improvement-pass
    provides: embedded Slots host mode and deterministic runtime compatibility hooks
provides:
  - six-step house-edge tutorial state machine and dialogue runtime
  - AI Essence progression and starter utility card unlock loop
  - postMessage bridge from embedded Slots runtime to tutorial progression
  - EN/PT tutorial DOM zones with parity-safe attributes and controls
affects: [32-casinocraftz-integration-confidence-lock, compatibility-regression, educational-flow]
tech-stack:
  added: []
  patterns:
    - pure tutorial progression helpers with immutable state returns
    - host-guarded cross-frame event bridge using visual event subscription + abort cleanup
    - Astro page lifecycle mounting via astro:page-load with teardown on astro:before-swap
key-files:
  created:
    - src/scripts/casinocraftz/tutorial/types.ts
    - src/scripts/casinocraftz/tutorial/engine.ts
    - src/scripts/casinocraftz/tutorial/essence.ts
    - src/scripts/casinocraftz/tutorial/cards.ts
    - src/scripts/casinocraftz/tutorial/dialogue.ts
    - src/scripts/casinocraftz/tutorial/main.ts
    - tests/casinocraftz-tutorial-contract.test.mjs
  modified:
    - src/scripts/slots/main.ts
    - src/pages/en/casinocraftz/index.astro
    - src/pages/pt/casinocraftz/index.astro
    - e2e/compatibility.spec.ts
key-decisions:
  - Keep tutorial/card modules authoritative and isolated from slots internals (no slots imports in cards module).
  - Trigger play-and-observe progression only from spin-resolved cross-frame messages for deterministic parity in EN/PT.
  - Preserve existing Slots runtime authority surface by adding a hostMode-guarded postMessage side channel only.
patterns-established:
  - tutorial root datasets data-casinocraftz-tutorial-step and data-casinocraftz-essence are machine-readable compatibility anchors
  - tutorial page shells pass locale copy to runtime via data attributes instead of importing i18n in script modules
requirements-completed: [EDU-40, EDU-41, SYS-40, SYS-41]
duration: 6min
completed: 2026-04-03
---

# Phase 31 Plan 01: House Edge Tutorial and Utility Card Systems Summary

**Six-step EN/PT tutorial loop now teaches house edge with deterministic spin-driven progression, AI Essence rewards, and unlockable utility cards on Casinocraftz host pages.**

## Performance

- **Duration:** 6 min
- **Started:** 2026-04-03T12:47:54Z
- **Completed:** 2026-04-03T12:53:33Z
- **Tasks:** 3
- **Files modified:** 11

## Accomplishments

- Added tutorial core contracts and deterministic progression modules (`types`, `engine`, `essence`, `cards`, `dialogue`, `main`).
- Integrated EN/PT Casinocraftz pages with tutorial and card zones, root datasets, and `astro:page-load` mount hooks.
- Added host-guarded `ccz:spin-settled` postMessage bridge in Slots and browser-level regression tests proving 3-spin tutorial auto-advance in EN/PT.

## Task Commits

Each task was committed atomically:

1. **Task 1: Define tutorial type contracts, i18n keys, and source-level contract test file** - `f86f70f` (test)
2. **Task 2: Tutorial engine, essence, cards, and dialogue core modules** - `6237ba2` (feat)
3. **Task 3: postMessage bridge, Casinocraftz page integration, tutorial main.ts entrypoint, and Playwright browser coverage** - `a6903b9` (feat)

**Plan metadata:** pending final docs commit

## Files Created/Modified

- `src/scripts/casinocraftz/tutorial/types.ts` - tutorial state/type contracts and card/dialogue/essence interfaces.
- `src/scripts/casinocraftz/tutorial/engine.ts` - pure progression helpers (`advanceTutorialStep`, `recordSpin`, `unlockCards`) and localStorage completion toggles.
- `src/scripts/casinocraftz/tutorial/essence.ts` - deterministic essence economy helpers.
- `src/scripts/casinocraftz/tutorial/cards.ts` - starter card registry and presentation-only activation helpers.
- `src/scripts/casinocraftz/tutorial/dialogue.ts` - full EN/PT narrator+system registry for six tutorial steps.
- `src/scripts/casinocraftz/tutorial/main.ts` - DOM mount/runtime for dialogue rendering, card tray state, step controls, and spin message handling.
- `src/scripts/slots/main.ts` - hostMode-guarded postMessage bridge emitting `ccz:spin-settled` on `spin-resolved` events.
- `src/pages/en/casinocraftz/index.astro` - tutorial shell/card tray DOM and runtime mount script.
- `src/pages/pt/casinocraftz/index.astro` - tutorial shell/card tray DOM and runtime mount script.
- `tests/casinocraftz-tutorial-contract.test.mjs` - source-level parity and boundary assertions.
- `e2e/compatibility.spec.ts` - EN/PT tutorial presence and spin-driven progression tests.

## Validation

- `node --test tests/casinocraftz-tutorial-contract.test.mjs tests/compatibility-contract.test.mjs`
  - Result: pass (9/9)
- `npx playwright test e2e/compatibility.spec.ts --project=chromium --grep "tutorial|casinocraftz" --workers=1`
  - Result: pass (7/7)
- `npx playwright test e2e/compatibility.spec.ts --project=chromium --workers=1`
  - Result: pass (12/12)
- `npm run lint`
  - Result: pass with 1 pre-existing warning in `.claude/get-shit-done/bin/lib/state.cjs`
- `npm run build`
  - Result: success (Astro static build complete)

## Decisions Made

- Kept `cards.ts` strictly presentation-only and independent from `src/scripts/slots/*` authority modules.
- Used slots visual event subscription in `initSlotsShell()` for bridge emission to avoid gameplay authority changes.
- Kept tutorial initialization on page shell datasets so contract tests can assert deterministic machine-readable state at load.

## Deviations from Plan

None - plan executed exactly as written. Tutorial/card i18n key set was already present in the repository baseline, so no extra locale delta was required during Task 1.

## Issues Encountered

None.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- EDU-40, EDU-41, SYS-40, SYS-41 are satisfied with contract and browser evidence.
- Phase 32 can consume the new tutorial datasets and bridge guarantees for integration confidence verification.

## Self-Check: PASSED

- Verified required created files exist in workspace.
- Verified task commits `f86f70f`, `6237ba2`, and `a6903b9` exist in git history.
