# Phase 24: Verification Debt Backfill and Closure Guards - Research

**Researched:** 2026-04-03
**Mode:** Autonomous (`/gsd:next` -> `/gsd:plan-phase 24`)

## Objective

Define a deterministic backfill strategy for missing summary validation sections and add closure guards that fail fast on missing validation evidence.

## Current Debt Findings

Validation-section audit currently reports 14 summary files missing a `## Validation` heading across early milestones (`01-*`, `02-*`, `03-*`, `04-05`).

## Existing Guard Surface

- Workflow checks already enumerate missing `## Validation` sections during advancement/closeout.
- Current behavior is informational (warning) and does not always block progression.

## Recommended Strategy

1. Backfill only the `## Validation` section in the identified legacy summaries.
2. Keep evidence concise and source-backed (known commands, test/build status, caveats if unknown).
3. Add a deterministic guard script/test that:
   - Scans required summary files for `## Validation`
   - Returns non-zero exit on missing sections
   - Prints actionable file list
4. Wire guard invocation into milestone closeout and/or verification flow.

## Implementation Targets

- Legacy summary files listed in 24-CONTEXT debt inventory
- A guard utility (planning layer) under `.claude/get-shit-done/bin/` or a test contract under `tests/`
- Workflow touchpoints where closeout validation is enforced (`complete-milestone`, `verify-work`, or equivalent)

## Risks and Mitigations

- Risk: Fabricated historical validation claims.
  - Mitigation: Use explicit "evidence unavailable" notes where data cannot be reconstructed.
- Risk: Overly strict blocking in non-release flows.
  - Mitigation: Scope guard to milestone closeout/release verification paths.

## Planning Input Quality Check

- Scope is bounded to documentation backfill + deterministic release guard behavior.
- Changes remain auditability-focused and avoid runtime/product regressions.
