# Phase 35: EN/PT and Host-Mode Parity Matrix Lock - Context

**Gathered:** 2026-04-03
**Status:** Ready for planning

## Locked Decisions

- Phase 35 locks parity behavior only; no gameplay-mechanics additions and no new routes.
- PAR-50 is satisfied by enforcing EN/PT parity for copy, datasets, and interaction outcomes.
- PAR-51 is satisfied by explicit compatibility validation across embedded host mode and standalone mode.
- Canonical routes remain authoritative: /en/casinocraftz/, /pt/casinocraftz/, /en/slots/, /pt/slots/, and embed host query host=casinocraftz.

## In Scope

- Audit and lock parity-sensitive dataset/copy hooks for tutorial and slots shells.
- Extend source contracts for EN/PT namespace and selector parity where needed.
- Extend browser compatibility matrix checks for embedded and standalone behaviors.
- Preserve deterministic behavior and authority isolation from prior phases.

## Out of Scope

- New tutorial steps, new card mechanics, or gameplay authority changes.
- Route architecture changes or locale rollout changes.
- Anti-monetization closure work (Phase 36 scope).

## Canonical References

- .planning/REQUIREMENTS.md (PAR-50, PAR-51)
- .planning/ROADMAP.md (Phase 35)
- .planning/phases/34-learning-loop-clarity-and-bounded-progression-ux/34-01-SUMMARY.md
- src/pages/en/casinocraftz/index.astro
- src/pages/pt/casinocraftz/index.astro
- src/pages/en/slots/index.astro
- src/pages/pt/slots/index.astro
- src/scripts/casinocraftz/tutorial/main.ts
- src/scripts/slots/main.ts
- src/i18n/en.json
- src/i18n/pt.json
- tests/slots-i18n-parity-contract.test.mjs
- tests/casinocraftz-tutorial-contract.test.mjs
- e2e/compatibility.spec.ts

## Exit Condition

- PAR-50 and PAR-51 have passing source contracts and deterministic browser evidence for EN/PT and host-mode matrix slices.
