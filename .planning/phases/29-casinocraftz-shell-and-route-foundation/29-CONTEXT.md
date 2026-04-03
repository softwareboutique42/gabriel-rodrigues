# Phase 29: Casinocraftz Shell and Route Foundation - Context

**Gathered:** 2026-04-03
**Status:** Ready for planning
**Source:** /casinocraftz-next autonomous routing (discuss-equivalent)

## Assumptions

- Phase 29 is foundational and should not attempt to deliver the full tutorial or card systems yet.
- The first deliverable is a canonical EN/PT Casinocraftz host surface that can safely embed Slots as the first module in later phases.
- Existing standalone Slots routes remain authoritative during Phase 29; integration work happens in Phase 30.

## Current Baseline

- Projects discovery currently links directly to `/en/slots/` and `/pt/slots/` from `src/pages/en/projects/index.astro` and `src/pages/pt/projects/index.astro`.
- Header navigation marks `/projects`, `/canvas`, and `/slots` as the shared projects surface in `src/components/Header.astro`.
- Existing contracts (`tests/compatibility-contract.test.mjs`, `tests/nav-i18n-primitives.test.mjs`) enforce canonical route mapping and alias deny-list assumptions around current projects/canvas/slots paths.
- EN/PT translation files contain mature Slots copy but no Casinocraftz namespace yet.

## Candidate Scope

- Introduce canonical browser routes for Casinocraftz under `/en/casinocraftz/` and `/pt/casinocraftz/` with explicit zero-risk educational framing.
- Update projects discovery and navigation primitives to recognize Casinocraftz as a first-class surface while preserving existing canonical behavior for Canvas and legacy Slots.
- Define shell-level structural zones and stable host hooks intended for future embedded modules.
- Add EN/PT copy primitives for the Casinocraftz shell and framing language.

## Risks

- Route updates can regress language-switch parity or accidentally create alias drift.
- A casino-inspired visual shell can conflict with the educational anti-gambling posture if compliance framing is not explicit.
- Premature embedding of Slots in this phase can blur responsibility boundaries and reduce parallelization clarity for Phases 30 and 31.

## Constraints

- Preserve EN/PT counterpart mapping and canonical route discipline used throughout the codebase.
- Keep Phase 29 focused on shell and route foundations only; defer tutorial and card logic to later phases.
- Maintain Astro SPA lifecycle safety (`astro:page-load` + cleanup patterns) for any new client behavior.
- Ensure all new user-facing strings have parity in `src/i18n/en.json` and `src/i18n/pt.json`.

## Verification Intent

- Extend or add fast source contracts to lock canonical Casinocraftz routes, nav detection, and EN/PT copy parity.
- Keep compatibility checks objective through route assertions and stable shell selectors, not screenshots.
- Ensure Phase 29 outputs are intentionally structured to enable parallel execution of Phase 30 and Phase 31.
