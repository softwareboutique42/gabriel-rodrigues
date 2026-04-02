# Project Research Summary

**Project:** Company Canvas - v1.2 Projects Hub & Slots Foundation
**Domain:** Bilingual Astro static portfolio with project discovery layer and Slots pre-game foundation
**Researched:** 2026-04-02
**Confidence:** HIGH

## Executive Summary

v1.2 is an information architecture and foundation milestone, not a runtime rewrite. The recommended path is to keep the existing Astro/Tailwind/Cloudflare stack and keep Canvas canonical routes stable (`/en/canvas/`, `/pt/canvas/`), while introducing Projects as the discovery entry (`/en/projects/`, `/pt/projects/`) and Slots shell routes (`/en/slots/`, `/pt/slots/`). This minimizes delivery risk and preserves existing links, SEO signals, and validated Canvas flows.

Experts would ship this as a staged structural migration: first nav and i18n primitives, then Projects hub, then Slots shell, then compatibility hardening and E2E updates. This sequence matches dependencies already identified in research (keys before pages, route parity before language switching validation, and redirect/test hardening after route changes).

Primary risks are known and preventable: route breakage from path movement, nav active-state drift under Astro view transitions, EN/PT parity gaps, i18n key drift, and SPA script lifecycle leaks. Mitigation is straightforward if enforced by phase gates and test coverage.

## 1) Milestone Scope Recap (v1.2)

- Deliver Projects Hub as the new navigation/discovery surface in EN/PT.
- Replace top-nav Canvas entry with Projects entry.
- Deliver Slots shell pages in EN/PT (no gameplay mechanics, no RNG, no monetization flow changes).
- Preserve current Canvas runtime behavior and canonical routes.
- Add only supporting i18n keys, route wiring, and QA hardening needed for safe rollout.

Out of scope for v1.2:

- New game engine/framework adoption.
- Slots gameplay implementation.
- Backend/service architecture changes.
- SSR/runtime deployment model changes.

## 2) Stack Decision (What Changes vs No Changes)

### Changes

- Code-level additions only:
- New route pages for Projects and Slots in both locales.
- Header navigation update.
- EN/PT translation key additions (`nav.projects`, `projects.*`, `slots.*`).
- Optional redirect compatibility updates and E2E expansion.

### No Changes

- No package additions required for v1.2 core scope.
- Keep Astro static output, Tailwind setup, existing i18n utilities, Canvas Three.js runtime, and Cloudflare Pages deployment unchanged.
- No new frontend framework islands or game runtime dependencies.

Decision: Maintain stack stability and ship IA change through existing architecture.

## 3) Feature Priorities (Table-Stakes First)

### Table-stakes (must ship in v1.2)

- Projects hub pages in EN/PT listing Canvas and Slots.
- Top-nav migration from Canvas to Projects.
- Project status framing (Live/Foundation/Coming Next) to set expectations.
- Slots shell pages in EN/PT with explicit "in development" and "no real money" messaging.
- Full EN/PT parity for routes and strings.
- Route/link validation and compatibility checks for existing Canvas entry points.

### Differentiators (selective for v1.2)

- Narrative positioning block on Projects hub.
- Theme selector prototype on Slots shell (non-functional).
- Analytics events for hub clicks and Slots intent CTA.

### Defer to v2+

- Slots gameplay mechanics (reels, paylines, RNG).
- New game engine choices.
- Deep interactive Slots systems and production audio logic.

## 4) Architecture Integration Map + Recommended Build Order

### Integration map (current -> target)

- Header nav: `Home/Resume/Blog/Canvas` -> `Home/Resume/Blog/Projects`.
- Canvas routes: keep canonical `/en/canvas/` and `/pt/canvas/`.
- New discovery routes: add `/en/projects/`, `/pt/projects/`.
- New Slots shell routes: add `/en/slots/`, `/pt/slots/`.
- Language switching: rely on existing `getLocalizedPath` with strict EN/PT route mirroring.
- SPA scripts: preserve `astro:page-load` initialization and cleanup-safe patterns.

### Recommended build order

1. Phase A - Nav + i18n primitives

- Add EN/PT translation keys and update Header active-state mapping for Projects/Canvas/Slots paths.

2. Phase B - Projects hub pages

- Implement EN/PT Projects pages and link cards to Canvas + Slots.

3. Phase C - Slots shell foundation

- Implement EN/PT Slots shell pages and minimal `src/scripts/slots/main.ts` lifecycle-safe initializer.

4. Phase D - Compatibility hardening + QA

- Validate/extend 404 pretty-URL redirect logic as needed.
- Update E2E for navigation, i18n parity, and Canvas access through Projects.

5. Phase E - Optional alias routes

- Only if product requires nested marketing URLs (`/projects/canvas/`), add aliases that redirect to canonical `/canvas/`.

## 5) Top Pitfalls + Mitigations by Phase

1. Route breakage during IA change (Phase B/D)

- Mitigation: keep Canvas canonical; add compatibility redirects if aliases introduced; smoke-test old/new EN/PT URLs with query params.

2. Nav active-state drift under ClientRouter transitions (Phase A)

- Mitigation: centralize route-to-nav mapping; test both hard-load and in-app navigation states.

3. EN/PT parity gaps (Phase B/C)

- Mitigation: treat locale route pairs as atomic acceptance criteria; block phase completion if one locale missing.

4. Translation key drift (Phase A/C)

- Mitigation: enforce same-commit key additions for `en.json` and `pt.json`; run parity diff/checklist before merge.

5. Script lifecycle leaks in Slots shell (Phase C)

- Mitigation: initialize on `astro:page-load`, guard by page root, cleanup with abort/dispose pattern to avoid duplicate handlers.

6. Research outputs not decision-ready for next milestone (Phase D)

- Mitigation: require explicit recommendation, confidence, licensing constraints, and v1.3 implications in each research artifact.

## 6) Suggested Requirement IDs (for Roadmap Planning)

- RQ-V12-001: Replace header Canvas nav item with Projects and ensure active-state coverage for `/projects`, `/canvas`, and `/slots` routes.
- RQ-V12-002: Create Projects hub pages at `/en/projects/` and `/pt/projects/` with cards linking to Canvas and Slots.
- RQ-V12-003: Preserve canonical Canvas routes (`/en/canvas/`, `/pt/canvas/`) with no regression to existing query-based flows.
- RQ-V12-004: Create Slots shell pages at `/en/slots/` and `/pt/slots/` with clearly visible "in development" and "no real money" messaging.
- RQ-V12-005: Add EN/PT translation keys for all new nav/projects/slots copy and enforce key parity.
- RQ-V12-006: Ensure language switch from each new route resolves to an existing counterpart route.
- RQ-V12-007: Add/adjust 404 and/or alias compatibility behavior so legacy or pretty Canvas links continue to resolve.
- RQ-V12-008: Implement `src/scripts/slots/main.ts` using Astro SPA-safe lifecycle hooks and idempotent initialization.
- RQ-V12-009: Update E2E coverage for navigation labels, project flow (`Projects -> Canvas/Slots`), and EN/PT route parity.
- RQ-V12-010: Define and capture milestone analytics events for Projects card clicks and Slots intent CTA (if differentiator scope included).

## Implications for Roadmap

Suggested phase structure: 4 required phases + 1 optional compatibility phase.

- Phase A (Nav + i18n) should be first because every downstream page depends on keys and route labeling.
- Phase B (Projects hub) should precede Slots shell to establish the new discovery model immediately with low risk.
- Phase C (Slots shell) should remain intentionally thin to avoid leaking gameplay scope into v1.2.
- Phase D (compatibility + QA) should gate release to prevent regressions in URLs, i18n switching, and SPA behavior.
- Phase E (aliases) should be conditional and last because it adds routing complexity without enabling core milestone value.

### Research Flags

Needs deeper research during planning:

- Phase D redirect strategy details if alias routes are introduced (`/projects/canvas/*` compatibility and canonical signaling).
- Analytics taxonomy specifics if events will drive v1.3 prioritization.

Standard patterns (can proceed without additional research):

- Phase A nav/i18n key work.
- Phase B static Projects hub implementation.
- Phase C shell-only Slots route and lifecycle-safe script scaffold.

## Confidence Assessment

| Area         | Confidence | Notes                                                                                                |
| ------------ | ---------- | ---------------------------------------------------------------------------------------------------- |
| Stack        | HIGH       | Directly aligned to current repo constraints and milestone scope; no runtime changes required.       |
| Features     | HIGH       | Table-stakes and defer boundaries are explicit in milestone research and constraints.                |
| Architecture | HIGH       | Integration map and phase order validated against existing route/i18n/script patterns.               |
| Pitfalls     | HIGH       | Risks are concrete, recurring in bilingual SPA/static migrations, and paired with clear mitigations. |

**Overall confidence:** HIGH

### Gaps to Address

- Confirm whether nested `/projects/canvas/` aliases are required by product or can remain deferred.
- Confirm whether analytics instrumentation is mandatory in v1.2 or optional differentiator.
- Validate canonical/hreflang/meta behavior if any route aliasing is added.

## Sources

### Primary

- `.planning/research/STACK.md`
- `.planning/research/FEATURES.md`
- `.planning/research/ARCHITECTURE.md`
- `.planning/research/PITFALLS.md`

---

_Research completed: 2026-04-02_  
_Ready for roadmap: yes_
