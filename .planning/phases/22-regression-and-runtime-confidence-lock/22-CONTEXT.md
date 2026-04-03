# Phase 22: Regression and Runtime Confidence Lock - Context

**Gathered:** 2026-04-03
**Status:** Ready for planning
**Source:** /gsd:discuss-phase 22 --auto

## Assumptions

### Regression Strategy

- **Assumption:** Phase 22 should harden and extend existing deterministic contract and compatibility suites instead of introducing screenshot/pixel-diff assertions.
  - **Why this way:** Existing coverage already locks runtime behavior through machine-readable hooks and timing-agnostic checks in `tests/slots-animation-event-sequencing-contract.test.mjs`, `tests/slots-sprite-atlas-contract.test.mjs`, `tests/slots-symbol-states-contract.test.mjs`, `tests/slots-theme-variants-contract.test.mjs`, `tests/slots-motion-accessibility-contract.test.mjs`, `tests/slots-performance-guardrail-contract.test.mjs`, and `e2e/compatibility.spec.ts`. Phase 22 goal in `.planning/ROADMAP.md` calls for contract + Playwright hardening.
  - **If wrong:** Adding visual-fragile assertions will increase flaky failures and block milestone closure with non-actionable regressions.
  - **Confidence:** Confident

### Deterministic Runtime Contract Lock

- **Assumption:** Regression lock should explicitly preserve fixed-seed determinism and monotonic visual event sequencing as first-class release gates.
  - **Why this way:** Deterministic seed and engine behavior are already contract-defined in `tests/slots-core-determinism-contract.test.mjs`, while visual sequencing and sequence snapshots are asserted in `tests/slots-animation-event-sequencing-contract.test.mjs`. Runtime exposes stable sequencing/state datasets in `src/scripts/slots/animation/runtime.ts`, and controller emits accepted/resolved/blocked event boundaries in `src/scripts/slots/controller.ts`.
  - **If wrong:** Runtime changes could silently drift event ordering or seed/result coupling, producing inconsistent outcomes across runs without immediate detection.
  - **Confidence:** Confident

### EN/PT Parity and Selector Stability

- **Assumption:** Playwright hardening should keep EN/PT parity assertions on canonical routes using existing stable selectors and `data-slots-*` / `data-slots-anim-*` hooks.
  - **Why this way:** EN/PT route parity and runtime text/state assertions already exist in `e2e/compatibility.spec.ts`; localized gameplay keys are parity-locked in `tests/slots-i18n-parity-contract.test.mjs`; both locale pages expose mirrored runtime datasets in `src/pages/en/slots/index.astro` and `src/pages/pt/slots/index.astro`.
  - **If wrong:** Locale-specific regressions (missing keys, selector drift, route mismatch) may pass one locale and fail in production for the other.
  - **Confidence:** Confident

### Verification Chain for Milestone Closure

- **Assumption:** Phase 22 should treat full verification-chain success (lint, targeted contracts, compatibility E2E, build) as the confidence lock criterion for QA-20 completion.
  - **Why this way:** QA-20 remains pending in `.planning/REQUIREMENTS.md`; phase state is at planning for phase 22 in `.planning/STATE.md`; prior phase summary uses this exact chain as release evidence in `.planning/phases/21-accessibility-and-performance-hardening/21-01-SUMMARY.md`; project scripts and Playwright setup are defined in `package.json` and `playwright.config.ts`.
  - **If wrong:** QA-20 could be marked complete without end-to-end evidence, leaving untracked runtime debt at milestone close.
  - **Confidence:** Likely

## Needs External Research

- Whether QA-20 should expand runtime browser coverage beyond current Playwright projects (`chromium`, `mobile-chrome`) in `playwright.config.ts` for this milestone, or keep the existing matrix and lock confidence through deterministic contracts + current E2E scope.
