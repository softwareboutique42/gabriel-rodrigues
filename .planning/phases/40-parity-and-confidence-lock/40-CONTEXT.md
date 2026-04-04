# Phase 40: Parity and Confidence Lock - Context

**Gathered:** 2026-04-04
**Status:** Ready for planning

## Phase Boundary

Lock EN/PT parity and final confidence evidence for the full three-lesson psychology curriculum.

This phase is verification and guardrail hardening only:

- no new lesson content,
- no new gameplay mechanics,
- no route or authority refactors.

## Locked Decisions

- PAR-60 must be proven across copy, datasets, lesson availability, and revisit behavior for the full curriculum shell.
- SAFE-60 must prove the psychology curriculum remains anti-manipulative and never implies control over results.
- SAFE-61 must produce a reproducible validation chain for the full v1.9 scope.
- Existing house-edge, near-miss, and sensory-conditioning flows from Phases 37-39 are baseline and must remain green.

## In Scope (Phase 40)

- Tighten source/browser parity checks for the complete curriculum shell.
- Add or strengthen anti-manipulation assertions for psychology lesson copy and UX.
- Publish final release evidence for v1.9.

## Out of Scope

- Any new curriculum content or additional lessons.
- Any gameplay/runtime authority changes.
- New routes, monetization features, or meta-systems.

## Canonical References

- .planning/REQUIREMENTS.md (PAR-60, SAFE-60, SAFE-61)
- .planning/ROADMAP.md (Phase 40 section)
- .planning/STATE.md
- .planning/phases/39-sensory-conditioning-and-bounded-lesson-ux/39-01-SUMMARY.md
- src/pages/en/casinocraftz/index.astro
- src/pages/pt/casinocraftz/index.astro
- src/scripts/casinocraftz/tutorial/main.ts
- src/scripts/casinocraftz/tutorial/dialogue.ts
- src/i18n/en.json
- src/i18n/pt.json
- tests/casinocraftz-tutorial-contract.test.mjs
- tests/compatibility-contract.test.mjs
- e2e/compatibility.spec.ts

## Exit Condition

- PAR-60, SAFE-60, and SAFE-61 are complete with passing deterministic source/browser/lint/build evidence.
- A final phase summary captures release evidence and milestone-close readiness.
