# Phase 47: Elementum Layout and Identity Shell — Execution Summary

**Created:** 2026-04-04  
**Milestone:** v2.4 — Elementum Slots Interface Refinement  
**Requirements:** UIR-80, UIR-81  
**Status:** Ready for execution

---

## Plan Overview

Phase 47 is broken into **6 atomic plans** across **3 execution waves**, totaling **~10-12 hours** of estimated Claude execution time.

| Wave     | Plans        | Focus                                            | Autonomous | Dependencies |
| -------- | ------------ | ------------------------------------------------ | ---------- | ------------ |
| 🌊 **1** | 47-01, 47-02 | Identity markup + styling                        | ✓ Yes      | None         |
| 🌊 **2** | 47-03, 47-04 | HUD layout refactoring + responsive verification | ✓ Yes      | Wave 1       |
| 🌊 **3** | 47-05, 47-06 | Parity audit + commit + finalization             | ✓ Yes      | Wave 2       |

---

## Wave 1: Identity Shell (Markup + Styling)

**Goal:** Add and style top-level identity anchors (`ELEMENTUM` top-center + `← CasinoCraftz` top-left).  
**Delivers:** UIR-81 (visible identity anchors on EN/PT)

### Plan 47-01: Identity Markup

- **Files Modified:** `src/pages/en/slots/index.astro`, `src/pages/pt/slots/index.astro`, `src/i18n/en.json`, `src/i18n/pt.json`
- **Tasks:** 3 (Add EN header, Add PT header, Add i18n keys)
- **Effort:** ~1.5 hours
- **Autonomous:** ✓

### Plan 47-02: Identity Styling

- **Files Modified:** `src/styles/global.css`
- **Tasks:** 5 (Header container, back-link styling, identity label, z-index layering, header positioning verification)
- **Effort:** ~2.5 hours
- **Autonomous:** ✓
- **Key Features:**
  - Responsive sizing via clamp() (per D-01: locked decision)
  - Neon color scheme: lime back-link (#b8ff2c), cyan ELEMENTUM label (#8ff5ff)
  - Fade-in animation respects reduced-motion preference
  - Monospace font for tactical feel
  - Hover/active states on interactive elements

---

## Wave 2: HUD Layout (Refactoring + Verification)

**Goal:** Enforce symmetric HUD row height with centered bet stepper pattern.  
**Delivers:** UIR-80 (symmetric HUD with standardized height)

### Plan 47-03: HUD Layout Refactoring

- **Files Modified:** `src/styles/global.css`
- **Tasks:** 5 (Grid height/gap with clamp, meter standardization, controls alignment, adjuster buttons, spin button height)
- **Effort:** ~2 hours
- **Autonomous:** ✓
- **Key Features:**
  - `.slots-stage__hud--minimal`: `min-height: clamp(5rem, 12vh, 7rem)`
  - Grid gap: `gap: clamp(0.6rem, 1.4vw, 1.2rem)` (fluid spacing)
  - Stepper centered: `- | value | +` pattern between Balance and Spin
  - All three surfaces (Balance meter, Bet meter, Spin button) align to common baseline

### Plan 47-04: Responsive Verification

- **Files Modified:** None (verification-only)
- **Tasks:** 5 (Conflict detection, cabinet layout check, clamp() math verification, reduced-motion check, manual checklist)
- **Effort:** ~1 hour
- **Autonomous:** ✓ (with checkpoint for manual breakpoint testing)
- **Focus:**
  - Search for conflicting media queries
  - Verify clamp() functions scale smoothly (no jumps)
  - Confirm no horizontal overflow at sm/md/lg breakpoints
  - Document responsive testing checklist for executor

---

## Wave 3: Validation & Commitment

**Goal:** Audit EN/PT parity, verify accessibility, and finalize commits.  
**Delivers:** UIR-80 + UIR-81 complete with full verification

### Plan 47-05: Parity & Accessibility Audit

- **Files Modified:** None (audit-only)
- **Tasks:** 5 (Markup parity, translation key parity, locale-specific CSS check, accessibility audit, lint + format)
- **Effort:** ~1.5 hours
- **Autonomous:** ✓
- **Verifications:**
  - EN/PT markup identical (no locale-specific visual asymmetry)
  - Translation keys present: `slots.shell.identity.elementum`, `slots.shell.identity.backLink`
  - Color contrast: lime & cyan both > 8:1 (WCAG AAA)
  - Reduced-motion: animation disabled under `prefers-reduced-motion: reduce`
  - Aria labels: back-link has `aria-label="Back to Casinocraftz"`
  - ESLint & Prettier: all checks pass

### Plan 47-06: Commit & Finalization

- **Files Modified:** `.planning/ROADMAP.md`, `.planning/STATE.md`, git commits
- **Tasks:** 5 (Aggregate commits, update ROADMAP, update STATE, commit artifacts, verify planning files)
- **Effort:** ~1 hour
- **Autonomous:** ✓
- **Output:**
  - 5-6 conventional-commit formatted commits
  - ROADMAP.md Phase 47 marked ✓ COMPLETE
  - STATE.md updated: 1/2 phases done, 50% progress
  - Phase 48 marked ◐ ready for planning

---

## Requirements Coverage

| Requirement                                                    | Delivered By             | Status |
| -------------------------------------------------------------- | ------------------------ | ------ |
| **UIR-80:** Symmetric bottom HUD with standardized height      | Plan 47-03, 47-04        | ✓ Full |
| **UIR-81:** Top-center ELEMENTUM + top-left back-link on EN/PT | Plan 47-01, 47-02, 47-05 | ✓ Full |

---

## Locked Decisions (Honored in Plans)

| Decision                                                          | How Honored                                          | Plan(s)             |
| ----------------------------------------------------------------- | ---------------------------------------------------- | ------------------- |
| **D-01:** Clamp() for responsive sizing (not fixed pixels)        | All responsive values use clamp()                    | 47-02, 47-03, 47-04 |
| **D-02:** Symmetry at row level (Balance/Bet/Spin align)          | HUD row height enforced via min-height clamp         | 47-03, 47-04        |
| **D-03:** Bet stepper pattern: - \| value \| +                    | Centered stepper maintained                          | 47-03               |
| **D-04:** Stepper as visual midpoint                              | Grid layout positions stepper between Balance & Spin | 47-03               |
| **D-05:** ELEMENTUM label top-center                              | Absolute positioning, left: 50%, centered            | 47-02               |
| **D-06:** ← CasinoCraftz back-link top-left                       | Absolute positioning in header                       | 47-02               |
| **D-07:** Use sm/md/lg Tailwind semantics (no custom breakpoints) | All responsive uses clamp() + standard breakpoints   | 47-02, 47-03, 47-04 |
| **D-08:** Balanced defaults (tighten current direction)           | UI styling follows cyberpunk/neon direction          | 47-02               |

---

## File Changes Summary

### Modified Files

| File                             | Changes                                                                               | Plans               |
| -------------------------------- | ------------------------------------------------------------------------------------- | ------------------- |
| `src/pages/en/slots/index.astro` | Add `.slots-shell__header` with ELEMENTUM + back-link                                 | 47-01               |
| `src/pages/pt/slots/index.astro` | Mirror EN header markup                                                               | 47-01               |
| `src/styles/global.css`          | Identity styling (header, back-link, label) + HUD refactoring (grid, meters, buttons) | 47-02, 47-03, 47-04 |
| `src/i18n/en.json`               | Add `slots.shell.identity.elementum`, `slots.shell.identity.backLink` keys            | 47-01               |
| `src/i18n/pt.json`               | Add same translation keys (identical values)                                          | 47-01               |

### Planning Artifacts

| File            | Purpose                                     |
| --------------- | ------------------------------------------- |
| `47-01-PLAN.md` | Wave 1 Task 1: Identity markup              |
| `47-02-PLAN.md` | Wave 1 Task 2: Identity styling             |
| `47-03-PLAN.md` | Wave 2 Task 1: HUD layout refactoring       |
| `47-04-PLAN.md` | Wave 2 Task 2: Responsive verification      |
| `47-05-PLAN.md` | Wave 3 Task 1: Parity & accessibility audit |
| `47-06-PLAN.md` | Wave 3 Task 2: Commit & finalization        |

---

## Accessibility & Motion Policy

✓ **Reduced-motion:** Fade-in animation on ELEMENTUM label disabled under `prefers-reduced-motion: reduce`  
✓ **Color Contrast:** All text > 8:1 (WCAG AAA) on dark background  
✓ **Aria Labels:** Back-link has clear aria-label for screen readers  
✓ **Semantic HTML:** ELEMENTUM label is `<span>` (not aria-hidden), naturally accessible

---

## Estimated Timeline

| Wave      | Plans        | Time           | Notes                                               |
| --------- | ------------ | -------------- | --------------------------------------------------- |
| 1         | 47-01, 47-02 | 4 hours        | Parallel executable (no dependencies)               |
| 2         | 47-03, 47-04 | 3 hours        | Depends on Wave 1; can execute parallel after 47-01 |
| 3         | 47-05, 47-06 | 2.5 hours      | Sequential verification then commit                 |
| **Total** | **6 plans**  | **~9.5 hours** | Includes all verification and testing               |

---

## Next Steps After Phase 47 Completion

1. ✓ Execute all 6 plans through Wave 3
2. ✓ Verify UIR-80 + UIR-81 delivered
3. → Begin Phase 48 planning: Material Reels and Tactile Interaction Polish (UIR-82, UIR-83, UIR-84)

---

**Plan created by:** GSD Planner Agent  
**Consistency check:** ✓ All locked decisions honored, no scope reduction, requirements fully covered  
**Ready for:** `/gsd-execute-phase 47`
