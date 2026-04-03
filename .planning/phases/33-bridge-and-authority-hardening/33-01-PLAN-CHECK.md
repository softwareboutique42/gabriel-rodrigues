# Phase 33 Plan Quality Check — Bridge and Authority Hardening

**Checker:** GSD Plan Checker (gsd-plan-checker mode)
**Date:** 2026-04-03
**Plan:** 33-01-PLAN.md
**Status:** PASS ✅

---

## Goal-Backward Check

### Phase Goal Decomposition

**Phase Goal:** Stabilize deterministic Slots-to-tutorial bridge contracts with versioned compatibility while preserving strict authority boundaries.

**Derived Truths (what must be TRUE for goal achievement):**

1. Bridge envelope is explicitly versioned and parseable by receiver
2. Legacy payloads (unversioned) continue to work without state mutation
3. Unknown versions and malformed events fail-safe (silently ignored)
4. Tutorial progression is triggered only by accepted bridge events
5. Tutorial/card modules do not import or mutate Slots authority (RNG, payout, economy)
6. Bridge behavior is deterministic across EN/PT routes and embedded/standalone host modes
7. Deterministic behavior is proven by contracts and Playwright checks

**Plan Mapping:** Each truth above is addressed by at least one task with concrete action steps.

---

## Requirement Coverage

| Req ID | Description                                                            | Coverage | Task(s)    | Status      |
| ------ | ---------------------------------------------------------------------- | -------- | ---------- | ----------- |
| BRG-50 | Bridge events are versioned and backward-compatible                    | ✅ Full  | 1, 2, 3, 4 | **COVERED** |
| BRG-51 | Tutorial/cards remain presentation-only, cannot mutate Slots authority | ✅ Full  | 2, 3, 4    | **COVERED** |

### BRG-50 Verification Path

- **Source Level:** Task 1 implements versioned envelope (v1) with backward-compatible parser that accepts legacy unversioned payloads
- **Contract Level:** Task 2 adds explicit tests for:
  - V1 versioned payload acceptance
  - Legacy (unversioned) payload acceptance
  - Unknown version (v2+) rejection (return null, no state mutation)
  - Malformed payload handling (null, non-object, missing type, invalid spinIndex)
- **Integration Level:** Task 3 validates deterministic bridge event flow across EN/PT embedded and standalone modes via Playwright
- **Evidence Chain:** Task 4 captures machine-readable Playwright reports and documents requirement closure in `33-VALIDATION.md`, `33-VERIFICATION.md`

### BRG-51 Verification Path

- **Static Analysis:** Task 2 includes source contracts asserting:
  - Tutorial/engine.ts does not import slots/\* modules
  - Tutorial/cards.ts does not import slots/\* modules
  - Tutorial/main.ts does not call Slots RNG/payout/economy functions
- **Dynamic Validation:** Task 3 verifies data-slots-\* attributes remain read-only from tutorial perspective via Chromium browser checks
- **Evidence Chain:** Task 4 documents authority isolation in `33-01-SUMMARY.md`

---

## Task Completeness Audit

| Task | Type | Files                          | Action Specificity                                                           | Verify                    | Done                                  | Status       |
| ---- | ---- | ------------------------------ | ---------------------------------------------------------------------------- | ------------------------- | ------------------------------------- | ------------ |
| 1    | auto | 3 files specified              | ✅ Explicit steps: types def, sender versioning, parser impl                 | ✅ ESLint                 | ✅ Acceptance criteria                | **COMPLETE** |
| 2    | tdd  | 3 test files specified         | ✅ Behavior: 6 test suites covering versioning, compat, fail-safe, isolation | ✅ node --test            | ✅ All suites pass, specific coverage | **COMPLETE** |
| 3    | auto | 1 file (compatibility.spec.ts) | ✅ Refine existing specs, no new features                                    | ✅ Playwright grep + JSON | ✅ EN/PT/host parity verified         | **COMPLETE** |
| 4    | auto | 4 artifact files               | ✅ Execute validation chain, create docs                                     | ✅ Full command chain     | ✅ Artifacts exist and mapped         | **COMPLETE** |

**Task Structure Compliance:** All 4 tasks have required fields for their type:

- Auto tasks: files ✅, action ✅, verify ✅, done ✅
- Behavioral requirements explicit ✅
- Verification commands are executable ✅

---

## Key Links Validation

**Engineering Wiring:** Are artifacts connected, not isolated?

| From                        | To                             | Via                                 | Planned In      | Pattern Match                       |
| --------------------------- | ------------------------------ | ----------------------------------- | --------------- | ----------------------------------- |
| slots/main.ts (sender)      | tutorial/main.ts (receiver)    | ccz:spin-settled versioned envelope | Task 1 + Task 3 | postMessage + addEventListener ✅   |
| slots/main.ts (sender)      | e2e/compatibility.spec.ts      | deterministic state attributes      | Task 3          | data-slots-\* queries ✅            |
| tutorial/main.ts (receiver) | casinocraftz-tutorial-contract | safe parser and fail-safe           | Task 2          | parseSpinSettledBridgeEvent test ✅ |
| tutorial/types.ts           | tutorial/main.ts               | explicit type boundaries            | Task 1          | import CczSpinSettledEvent ✅       |
| tutorial/engine.ts          | slots/main.ts                  | read-only consumer (no feedback)    | Task 2          | static import check ✅              |

**Verdict:** All 5 key links are explicitly planned and have corresponding action steps that wire them together.

---

## Scope Sanity

| Metric         | Value                        | Target                 | Status                                      |
| -------------- | ---------------------------- | ---------------------- | ------------------------------------------- |
| Tasks per plan | 4                            | 2–3 target, <5 blocker | ⚠️ Warning (4 is borderline, but justified) |
| Files modified | 8                            | 5–8 optimal            | ✅ Optimal                                  |
| Complexity     | Bridge hardening + contracts | Medium                 | ✅ Acceptable                               |
| Context budget | ~60–70% estimated            | <80% blocker           | ✅ Safe                                     |

**Justification for 4 Tasks:**

- Task 1: Code changes (3 files, medium complexity)
- Task 2: Test contracts (3 test suites, comprehensive coverage)
- Task 3: Browser validation (existing spec refinement, deterministic focus)
- Task 4: Evidence chain (orchestration and documentation)

Each task is focused and independent-ish (Task 3 depends on Task 1–2 passing, Task 4 depends on all). Split is reasonable for hardening phase.

---

## Dependencies and Graph Validity

**Dependency Structure:**

```
Plan 33-01:
  - wave: 1
  - depends_on: []
  - No forward references ✅
  - No circular dependencies ✅
```

**Task Sequencing Within Plan:**

1. Task 1 → Task 2, 3 (code must be in place first)
2. Task 2, 3 → Task 4 (validation depends on code + tests + browser checks)

**Execution Sequence:** Sequential, but no external blocking dependencies. Phase 33 stands alone (Phase 32 dependency satisfied externally).

---

## Must-Haves Derivation

### Truths (User-Observable)

| Truth                                                           | Observable From                | Derives From     |
| --------------------------------------------------------------- | ------------------------------ | ---------------- |
| Bridge contract is explicitly versioned (v1) and accepts legacy | Code review + test output      | BRG-50           |
| Unknown versions/malformed events ignored without mutation      | Test assertions                | BRG-50           |
| Tutorial progression only from accepted bridge events           | Playwright deterministic flow  | BRG-50 + BRG-51  |
| Tutorial/cards do not import or mutate Slots authority          | Source contracts + Playwright  | BRG-51           |
| Bridge behavior deterministic across EN/PT and host modes       | Playwright cross-locale checks | BRG-50 + BRG-51  |
| No net-new tutorial/card/gameplay features                      | Code diff + task scope         | Scope constraint |

**Verdict:** Truths are user-observable (not implementation detail–focused), specific, and derive directly from requirements.

### Artifacts

- **src/scripts/slots/main.ts** — versioned sender envelope (Task 1, Lines 44–48)
- **src/scripts/casinocraftz/tutorial/main.ts** — tolerant receiver + parser (Task 1, Lines 228+)
- **src/scripts/casinocraftz/tutorial/types.ts** — explicit bridge types (Task 1)
- **tests/casinocraftz-tutorial-contract.test.mjs** — versioning, backward-compat, fail-safe, isolation tests (Task 2, min 50 lines)
- **tests/compatibility-contract.test.mjs** — canonical route authority checks (Task 2, min 40 lines)
- **tests/slots-i18n-parity-contract.test.mjs** — EN/PT and host-mode invariants (Task 2, min 40 lines)
- **e2e/compatibility.spec.ts** — Chromium bridge parity and authority checks (Task 3, min 200 lines)
- **.planning/debug/bridge-validation-report.json** — Playwright JSON evidence (Task 4)
- **.planning/phases/33-bridge-and-authority-hardening/33-VALIDATION.md** — Requirement architecture (Task 4)
- **.planning/phases/33-bridge-and-authority-hardening/33-VERIFICATION.md** — Executed commands and outcomes (Task 4)
- **.planning/phases/33-bridge-and-authority-hardening/33-01-SUMMARY.md** — Requirement closure summary (Task 4)

**Verdict:** Artifacts map directly to tasks and deliverables. Reasonable min_lines for test files.

---

## Context Compliance (CONTEXT.md)

### Locked Decisions

| Decision                                                  | How Honored                                                                       | Status       |
| --------------------------------------------------------- | --------------------------------------------------------------------------------- | ------------ |
| Phase 33 is hardening only, not net-new features          | Tasks 1–4 only harden bridge contract; no new tutorial steps, cards, or mechanics | ✅ Respected |
| Bridge versioning via envelope evolution, not replacement | Task 1 keeps channel name `ccz:spin-settled` and evolves payload                  | ✅ Respected |
| Tutorial/cards remain presentation-only                   | Task 2 includes source contracts proving no Slots authority import                | ✅ Respected |
| Existing `ccz:spin-settled` is canonical baseline         | Task 1 adds versioning to current channel, accepts legacy                         | ✅ Respected |
| Deterministic behavior across EN/PT and host modes        | Task 3 validates parity via Playwright                                            | ✅ Respected |
| Preserve zero-risk framing and anti-monetization          | No violation in Tasks 1–4 scope                                                   | ✅ Respected |

### Deferred Ideas

No plan tasks introduce:

- New tutorial steps ✅
- New card inventory or card effects ✅
- Progression redesign ✅
- Slots authority changes ✅
- New routing families ✅
- Broad UX redesign ✅

---

## CLAUDE.md Compliance

| Directive                            | Compliance                                                      | Status         |
| ------------------------------------ | --------------------------------------------------------------- | -------------- |
| Testing: Use Playwright for E2E      | Task 3 uses Playwright (existing pattern) ✅                    | ✅ Pass        |
| Testing: Use node:test for contracts | Task 2 uses node:test ✅                                        | ✅ Pass        |
| Client scripts: Use astro:page-load  | Not modified in Phase 33 scope ✅                               | ✅ Pass        |
| Routing: EN/PT parity-lock           | Task 3 validates EN/PT determinism ✅                           | ✅ Pass        |
| Commits: Conventional commit format  | Plan respects project convention (not verified until execution) | ✅ Likely Pass |
| Linting: ESLint included             | Task 1 verify includes eslint ✅                                | ✅ Pass        |
| Build: npm run build                 | Task 4 includes build verification ✅                           | ✅ Pass        |

---

## Validation Commands Audit

**Commands Specified (in `validation_commands`):**

1. `node --test tests/casinocraftz-tutorial-contract.test.mjs tests/compatibility-contract.test.mjs tests/slots-i18n-parity-contract.test.mjs`
   - ✅ Runs source-level contracts for versioning, backward-compat, fail-safe, isolation
   - ✅ Executable with Node 22.12.0+

2. `npx playwright test e2e/compatibility.spec.ts --project=chromium --workers=1 --grep "casinocraftz embeds slots module with canonical EN/PT host parity|slots runtime compatibility keeps machine-readable gameplay state in EN/PT|casinocraftz tutorial advances to probability reveal after three spins in EN/PT"`
   - ✅ Deterministic subset of Playwright test suite
   - ✅ Targets EN/PT and host-mode parity
   - ✅ Uses single-worker mode for reproducibility

3. `npx playwright test e2e/compatibility.spec.ts --project=chromium --workers=1 --grep "casinocraftz" --reporter=json > .planning/debug/bridge-validation-report.json`
   - ✅ Captures machine-readable JSON evidence
   - ✅ Output path specified correctly

4. `npm run lint`
   - ✅ ESLint gate per CLAUDE.md

5. `npm run build`
   - ✅ Production build verification

**Coverage:**

- Source-level contracts ✅
- Browser determinism ✅
- EN/PT parity ✅
- Machine-readable evidence ✅
- Code quality (lint) ✅
- Release readiness (build) ✅

---

## Risk Assessment

| Risk                                                                | Severity | Mitigation                                                                                           | Status        |
| ------------------------------------------------------------------- | -------- | ---------------------------------------------------------------------------------------------------- | ------------- |
| Parser implementation doesn't handle all backward-compat edge cases | Medium   | Task 2 includes exhaustive test cases (null, undefined, non-object, missing type, invalid spinIndex) | ✅ Mitigated  |
| Authority import violations not caught by static checks             | Low      | Task 2 combines static checks + source code review patterns from Phase 32                            | ✅ Acceptable |
| Playwright specs timeout or are flaky on deterministic timing       | Low      | Plan uses existing compatibility suite baseline and single-worker mode                               | ✅ Acceptable |
| Feature creep: Task 1 accidentally introduces UI changes            | Low      | Action steps are code-only (no DOM changes), parser is library logic                                 | ✅ Acceptable |
| Evidence artifacts incomplete                                       | Low      | Task 4 explicitly creates validation, verification, and summary docs with clear purpose              | ✅ Acceptable |

---

## Verdict

| Dimension                   | Result                    | Notes                                                                                                |
| --------------------------- | ------------------------- | ---------------------------------------------------------------------------------------------------- |
| **Requirement Coverage**    | ✅ PASS                   | Both BRG-50 and BRG-51 fully addressed across 4 tasks with clear evidence paths                      |
| **Task Completeness**       | ✅ PASS                   | All tasks have required fields, specific actions, executable verifications, measurable done criteria |
| **Key Links**               | ✅ PASS                   | 5/5 engineering connections planned and wired through task actions                                   |
| **Scope Sanity**            | ⚠️ WARNING (non-blocking) | 4 tasks (borderline), but justified complexity and well-scoped per task                              |
| **Dependencies**            | ✅ PASS                   | No circular, forward, or external blocking deps; valid execution graph                               |
| **Must-Haves**              | ✅ PASS                   | Truths are user-observable, artifacts are concrete, key_links are explicit                           |
| **Context Compliance**      | ✅ PASS                   | Locked decisions respected, deferred ideas excluded, discretion areas handled                        |
| **CLAUDE.md Compliance**    | ✅ PASS                   | Follows project conventions for testing, routing, linting, build                                     |
| **Validation Architecture** | ✅ PASS                   | Commands cover source, browser, parity, evidence, and release gates                                  |

### Overall Verdict: **PASS** ✅

**Plan is ready for execution.**

---

## Required Follow-ups

### Before Execution

1. **Verify Phase 32 baseline:** Confirm Phase 32 (casinocraftz-integration-confidence-lock) was completed and `32-01-SUMMARY.md` exists. Phase 33 depends on Phase 32 infrastructure being stable.
2. **Existing fixture patterns:** Task 2 should reference and reuse any existing fixture setup from Phase 32 `tests/compatibility-contract.test.mjs` to maintain test fixture consistency.

### During Execution

3. **Parser edge cases:** When implementing Task 1's parser in `src/scripts/casinocraftz/tutorial/main.ts`, pay close attention to:
   - Return type consistency (null vs. undefined)
   - Spinindex comparison (>= 0 vs. > 0)
   - Backward-compat order (check v1 first, then legacy)

4. **Test file organization:** Task 2 may need to split large test suites across multiple describe blocks if >100 lines to maintain readability.

### After Execution

5. **Evidence artifacts:** Confirm `.planning/debug/bridge-validation-report.json` is valid JSON and machine-readable. If Playwright reporter fails, use fallback TAP format.

6. **Requirement closure:** Ensure `33-VALIDATION.md` and `33-01-SUMMARY.md` explicitly map each test/assertion back to BRG-50 and BRG-51 for audit trail.

---

## Summary

Phase 33 plan is **well-structured, complete, and ready**. It addresses all requirements (BRG-50, BRG-51) with balanced scope, explicit evidence paths, and proper project compliance. Four tasks with high specificity and clear acceptance criteria position Phase 33 for confident execution and deterministic verification.

**No blockers. Recommended for approval.**

---

_Checked: 2026-04-03 by gsd-plan-checker_
_Mode: goal-backward validation_
