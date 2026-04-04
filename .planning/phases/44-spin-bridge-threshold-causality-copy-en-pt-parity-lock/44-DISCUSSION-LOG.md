# Phase 44: Spin-Bridge Threshold, Causality Copy & EN/PT Parity Lock - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions captured in CONTEXT.md — this log preserves the discussion.

**Date:** 2026-04-04
**Phase:** 44-spin-bridge-threshold-causality-copy-en-pt-parity-lock
**Mode:** discuss
**Areas discussed:** Spin-bridge contract tests, Playwright E2E scope

## Gray Areas Presented

| Area | Options | User Choice |
|---|---|---|
| Spin-bridge tests | Functional (import + call) vs source-grep only | Functional (import + call) |
| Playwright scope | New e2e/casinocraftz.spec.ts vs contract tests only | Yes — new e2e/casinocraftz.spec.ts |

## Codebase Findings

- `recordSpin()` in `engine.ts` already implements 2-spin gate via `requiresSpins: 2`
- `sensory-conditioning-observe` step definition confirmed at line 49 of engine.ts
- `data-casinocraftz-lesson-sensory-conditioning-soon` confirmed in both EN and PT Astro pages
- `tutorial.causality.sensoryReveal` confirmed in i18n files
- 24 existing contract tests passing (source-grep pattern)
- `e2e/` directory exists with Playwright specs; no casinocraftz spec yet

## No Corrections

All assumptions confirmed by user selection.
