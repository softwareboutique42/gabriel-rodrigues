# Phase 44: Spin-Bridge Threshold, Causality Copy & EN/PT Parity Lock - Context

**Gathered:** 2026-04-04 (discuss mode)
**Status:** Ready for planning

<domain>
## Phase Boundary

Add contract tests and a Playwright E2E spec that prove the 2-spin observe gate, causality disclosure rendering, and EN/PT attribute parity for Lesson 3 — producing release evidence for EDU-72 and closing the v2.2 milestone. No new production code. All behaviors being tested were implemented in Phase 42/43.

</domain>

<decisions>
## Implementation Decisions

### Spin-Bridge Contract Tests

- **D-01:** Use functional test style (import + call) — import `recordSpin` from `engine.ts`, construct a minimal `TutorialState` at `currentStep: 'sensory-conditioning-observe'` with `spinsObserved: 0`, call `recordSpin` once and assert the step does NOT advance, call again and assert the step DOES advance. This matches the roadmap success criteria language ("does not advance before 2 / advances exactly on the second").
- **D-02:** Tests live in `tests/casinocraftz-tutorial-contract.test.mjs` alongside existing 24 tests — no new test file.
- **D-03:** Use `node:test` + `node:assert/strict` (existing framework, no new packages).
- **D-04:** `TutorialState` construction must satisfy the TypeScript interface — use `.mjs` with JSDoc types or construct a minimal plain object that passes through `recordSpin`'s logic (engine.ts is TypeScript, tests are `.mjs` — import via compiled output or use ts-node if needed; check existing import pattern in test file first).

### Playwright E2E Spec

- **D-05:** Add `e2e/casinocraftz.spec.ts` — new file in the existing Playwright `e2e/` directory.
- **D-06:** Test flow: navigate to `/en/casinocraftz/`, set up Lesson 2 completion state in localStorage (`ccz-near-miss-completed`), reload page, verify Lesson 3 is unlocked, trigger 2 spins via `page.evaluate(() => window.postMessage({type: 'ccz:spin-settled', payload: {spinIndex: 0}}, '*'))`, assert that after spin 1 the step is still `sensory-conditioning-observe` and after spin 2 the step advances to `sensory-conditioning-reveal`.
- **D-07:** Follow existing Playwright spec patterns from `e2e/compatibility.spec.ts` for `page.evaluate` and `postMessage` usage — check that file for the established pattern before writing.
- **D-08:** The spec runs against the dev server (existing `playwright.config.ts` webServer config) — no infra changes needed.

### Causality Disclosure Assertion

- **D-09:** Source-grep contract assertion confirming `tutorial.causality.sensoryReveal` key is present in both `src/i18n/en.json` and `src/i18n/pt.json` with the required anti-manipulation phrase. The key already exists — the assertion prevents accidental deletion.
- **D-10:** Separate assertion confirming `lastTransitionTrigger.*===.*'spin'` is present in `main.ts` (the condition that gates the recap disclosure display). This already has a contract test (line 316+) — extend or verify it covers sensory-conditioning specifically.

### EN/PT Attribute Parity Lock

- **D-11:** Contract assertion that `data-casinocraftz-lesson-sensory-conditioning-soon` appears by exact name in both `src/pages/en/casinocraftz/index.astro` AND `src/pages/pt/casinocraftz/index.astro`. Source-grep style (consistent with existing parity tests). This is the "preventing accidental removal" requirement from the roadmap.

### Claude's Discretion

- Exact test description strings (test names in `node:test` calls)
- Whether to use `assert.match` or `assert.ok` for functional test assertions
- How to construct minimal `TutorialState` for functional tests (exact fields to satisfy `recordSpin` without importing all of engine.ts)
- Order of new test blocks within the contract file

</decisions>

<canonical_refs>

## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Existing test infrastructure

- `tests/casinocraftz-tutorial-contract.test.mjs` — Existing 24 contract tests, source-grep pattern, `readWorkspaceFile` + `assert.match` conventions
- `e2e/compatibility.spec.ts` — Existing Playwright spec with `page.evaluate` and `postMessage` patterns to reuse
- `playwright.config.ts` — Dev server config, test directory, reporter settings

### Production code being tested

- `src/scripts/casinocraftz/tutorial/engine.ts` — `recordSpin()`, `requiresSpins: 2` for `sensory-conditioning-observe`, `CURRICULUM_LESSONS` definition
- `src/scripts/casinocraftz/tutorial/main.ts` — `onSpinMessage` handler, `lastTransitionTrigger: 'spin'` dataset sync, `parseSpinSettledBridgeEvent`
- `src/scripts/casinocraftz/tutorial/types.ts` — `TutorialState` interface (needed to construct test state)
- `src/i18n/en.json` — `tutorial.causality.sensoryReveal` key
- `src/i18n/pt.json` — `tutorial.causality.sensoryReveal` key
- `src/pages/en/casinocraftz/index.astro` — `data-casinocraftz-lesson-sensory-conditioning-soon` attribute
- `src/pages/pt/casinocraftz/index.astro` — `data-casinocraftz-lesson-sensory-conditioning-soon` attribute

### Requirements

- `.planning/REQUIREMENTS.md` — EDU-72 acceptance criteria (spin-bridge observation gates step advancement, 2-spin threshold)

</canonical_refs>

<code_context>

## Existing Code Insights

### Reusable Assets

- `readWorkspaceFile()` helper in contract test file — reuse for all source-grep assertions
- `extractNamespaceKeys()` helper — reuse for i18n parity assertions
- `e2e/compatibility.spec.ts` — `postMessage` dispatch pattern via `page.evaluate`

### Established Patterns

- Contract tests: `readWorkspaceFile(path)` + `assert.match(src, /regex/)` — all 24 existing tests follow this
- Functional tests (new in Phase 44): import `recordSpin` from engine, construct `TutorialState`, call and assert — `engine.ts` is TS compiled via Astro; check if `node --test` can import `.ts` directly or needs compiled output
- Playwright: `page.goto('/en/casinocraftz/')`, `page.evaluate()` for JS execution, `page.locator('[data-casinocraftz-*]')` for element assertions

### Integration Points

- `tests/casinocraftz-tutorial-contract.test.mjs` — append new test blocks at the end
- `e2e/casinocraftz.spec.ts` — new file, follows `e2e/*.spec.ts` naming convention
- Both run in CI: contract tests via `node --test tests/*.test.mjs`, Playwright via `npm run test`

</code_context>

<specifics>
## Specific Ideas

- Spin-bridge functional tests must verify both halves: spin 1 does NOT advance, spin 2 DOES advance — the roadmap explicitly calls out both conditions
- The `data-casinocraftz-lesson-sensory-conditioning-soon` parity assertion should use exact attribute name string (not a partial match) to be a reliable removal guard

</specifics>

<deferred>
## Deferred Ideas

- None — discussion stayed within phase scope

</deferred>

---

_Phase: 44-spin-bridge-threshold-causality-copy-en-pt-parity-lock_
_Context gathered: 2026-04-04_
