# Phase 53: Slots Side Drawer - Research

**Researched:** 2026-04-04
**Domain:** Slots shell drawer architecture, tutorial zone migration, EN/PT parity, drawer accessibility/state
**Confidence:** HIGH

---

## Summary

Phase 53 can be implemented without adding dependencies by expanding the existing slots `+` menu into a full-height side drawer and reusing existing tutorial/card systems.

Current baseline:
- `src/pages/en/slots/index.astro` and `src/pages/pt/slots/index.astro` render a compact `Signal Settings` popover (`[data-slots-menu]`) opened by `[data-slots-menu-toggle]`.
- `src/scripts/slots/main.ts` already owns menu open/close, Escape close, and menu value syncing.
- `src/scripts/casinocraftz/tutorial/main.ts` already renders curriculum/dialogue/cards from data attributes and only needs required containers and controls to exist in DOM.
- `src/styles/global.css` contains compact menu styles (`.slots-shell__menu-toggle`, `.slots-shell__menu-drawer`) that can be replaced with full-height side-drawer styles.

Migration strategy for LBY-03/LBY-04:
1. Replace small popover markup with full-height right drawer markup in slots pages.
2. Keep the `+` trigger but toggle its symbol to `x` when open and persist state in `sessionStorage`.
3. Add drawer sections:
- Analyzer: utility cards region (`data-casinocraftz-zone="cards"`) so tutorial card renderer can populate.
- Mission Log: curriculum + dialogue zones (`data-casinocraftz-curriculum`, `data-casinocraftz-dialogue`) plus next/skip controls.
- Settings: existing routes/motion/theme rows from current slots menu.
4. Mount tutorial logic in slots pages and provide required `data-casinocraftz-*` dataset labels on slots root.
5. Add focus trap while drawer is open and restore focus to trigger on close.
6. Mirror EN -> PT structure exactly with locale text/hrefs parity.

No schema or backend work is required. This is a frontend-only phase.

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| LBY-03 | `+` opens full-height side drawer with Analyzer, Mission Log, Settings | Replace compact menu drawer markup/styles; add tutorial/card zones in slots pages; mount tutorial on slots route |
| LBY-04 | Drawer persistence + `+`/`x` state + Escape close + focus trap | Extend `mountSlotsMenu()` state model with sessionStorage, icon sync, focus loop, and close semantics |

</phase_requirements>

---

## Key Files and Contracts

### Slots shell menu controller
- `src/scripts/slots/main.ts`
- Existing `setOpen(open)` updates `aria-expanded` and `aria-hidden`.
- Existing Escape handler closes menu.
- Existing `syncMenuValues()` populates routes/motion/theme labels.

### Slots page markup (EN/PT)
- `src/pages/en/slots/index.astro`
- `src/pages/pt/slots/index.astro`
- Existing markup has only settings rows in drawer; no mission/analyzer sections.

### Tutorial renderer contracts
- `src/scripts/casinocraftz/tutorial/main.ts`
- Required containers:
  - `[data-casinocraftz-curriculum]`
  - `[data-casinocraftz-dialogue]`
  - `[data-casinocraftz-zone="cards"]`
- Optional controls consumed when present:
  - `[data-casinocraftz-tutorial-next]`
  - `[data-casinocraftz-tutorial-skip]`

### Style surface
- `src/styles/global.css`
- Replace compact floating popover style with off-canvas full-height drawer style.
- Keep existing aesthetic language (neon/cyan, tactical HUD).

---

## Common Pitfalls

1. Missing tutorial containers in slots drawer causes `mountTutorial()` to return early with no Analyzer/Mission content.
2. Reusing one static drawer id across locales is fine, but section data attributes must match tutorial script contracts exactly.
3. Persisting drawer state but not icon/aria causes UI mismatch after navigation.
4. Focus trap must include wrap-around for Shift+Tab and Tab; Escape close alone does not satisfy LBY-04.
5. EN/PT drift risk is high because drawer markup is substantial; phase plan must enforce mirror edits.

---

## Recommended Verification

- Build gate: `npm run build`
- Behavior checks (DOM-level):
  - Drawer opens/closes; trigger `aria-expanded` flips true/false
  - Trigger icon switches `+` <-> `x`
  - `sessionStorage` key keeps drawer open across Astro navigation
  - Escape closes drawer
  - Focus cycles within drawer controls when open
- Parity checks:
  - EN and PT slots pages both contain all three drawer sections
  - PT retains locale-specific route links and translated labels

---

## Validation Architecture

Phase 53 should use a two-layer verification loop:

1. Fast structural assertions (shell one-liners) after each task:
- presence of required data attributes/sections in EN/PT slots pages
- presence of persistence/focus-trap logic in `src/scripts/slots/main.ts`

2. Build and e2e smoke at wave end:
- `npm run build`
- focused Playwright smoke for EN/PT drawer open/close and keyboard behavior

This keeps feedback fast while still validating user-observable behavior.
