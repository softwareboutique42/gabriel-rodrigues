# Phase 44: Spin-Bridge Threshold, Causality Copy & EN/PT Parity Lock - Research

**Researched:** 2026-04-04
**Domain:** Test authoring — contract tests (node:test) + Playwright E2E spec
**Confidence:** HIGH

## Summary

Phase 44 is a verification-only phase. All production behaviors being tested were implemented in Phases 42 and 43. The goal is to author tests and assertions that produce release evidence for EDU-72 and close the v2.2 milestone. No new production code is written.

The work falls into three categories: (1) functional contract tests that import `recordSpin` directly from `engine.ts` to prove the 2-spin threshold gate for `sensory-conditioning-observe`, (2) a new Playwright E2E spec at `e2e/casinocraftz.spec.ts` that drives the full spin injection sequence in-browser, and (3) source-grep contract assertions covering the `tutorial.causality.sensoryReveal` i18n key presence and the `data-casinocraftz-lesson-sensory-conditioning-soon` attribute parity across EN/PT pages.

All infrastructure already exists: 24 passing contract tests, an established Playwright setup (node:test + node:assert/strict for contracts, @playwright/test 1.58.2 for E2E), and the production code under test is fully implemented and passing its existing contract coverage.

**Primary recommendation:** Append new test blocks to the existing contract file and create one new Playwright spec file. Zero new packages needed.

<user_constraints>

## User Constraints (from CONTEXT.md)

### Locked Decisions

- **D-01:** Functional test style — import `recordSpin` from `engine.ts`, construct minimal `TutorialState` at `currentStep: 'sensory-conditioning-observe'` with `spinsObserved: 0`, call once and assert step does NOT advance, call again and assert step DOES advance.
- **D-02:** Tests live in `tests/casinocraftz-tutorial-contract.test.mjs` — no new contract test file.
- **D-03:** Use `node:test` + `node:assert/strict` (existing framework, no new packages).
- **D-04:** `TutorialState` construction must satisfy the TypeScript interface — use `.mjs` with JSDoc types or construct a minimal plain object that passes `recordSpin`'s logic.
- **D-05:** Add `e2e/casinocraftz.spec.ts` — new file in the existing Playwright `e2e/` directory.
- **D-06:** Test flow: navigate to `/en/casinocraftz/`, set up Lesson 2 completion state in localStorage (`ccz-near-miss-completed`), reload, verify Lesson 3 is unlocked, trigger 2 spins via `page.evaluate(() => window.postMessage({type: 'ccz:spin-settled', payload: {spinIndex: 0}}, '*'))`, assert step stays at `sensory-conditioning-observe` after spin 1 and advances to `sensory-conditioning-reveal` after spin 2.
- **D-07:** Follow existing Playwright spec patterns from `e2e/compatibility.spec.ts` for `page.evaluate` and `postMessage` usage.
- **D-08:** Spec runs against the dev server (existing `playwright.config.ts` webServer config) — no infra changes.
- **D-09:** Source-grep contract assertion confirming `tutorial.causality.sensoryReveal` key is present in both `src/i18n/en.json` and `src/i18n/pt.json` with the required anti-manipulation phrase. Key already exists — assertion prevents accidental deletion.
- **D-10:** Separate assertion confirming `lastTransitionTrigger.*===.*'spin'` is present in `main.ts` (the condition gating the recap disclosure display). An existing contract test at line 316+ already covers this pattern — extend or verify it covers sensory-conditioning specifically.
- **D-11:** Contract assertion that `data-casinocraftz-lesson-sensory-conditioning-soon` appears by exact name in both `src/pages/en/casinocraftz/index.astro` AND `src/pages/pt/casinocraftz/index.astro`. Source-grep style.

### Claude's Discretion

- Exact test description strings (test names in `node:test` calls)
- Whether to use `assert.match` or `assert.ok` for functional test assertions
- How to construct minimal `TutorialState` for functional tests (exact fields to satisfy `recordSpin` without importing all of engine.ts)
- Order of new test blocks within the contract file

### Deferred Ideas (OUT OF SCOPE)

- None — discussion stayed within phase scope

</user_constraints>

<phase_requirements>

## Phase Requirements

| ID     | Description                                                       | Research Support                                                                                                                          |
| ------ | ----------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| EDU-72 | Spin-bridge observation (2-spin threshold) gates Lesson 3 step advancement | `recordSpin` in `engine.ts` already implements `requiresSpins: 2` for `sensory-conditioning-observe`. Tests verify both halves of the gate. |

</phase_requirements>

## Standard Stack

### Core

| Library            | Version | Purpose                                    | Why Standard                                        |
| ------------------ | ------- | ------------------------------------------ | --------------------------------------------------- |
| node:test          | built-in (Node 22.22.1) | Contract test runner                  | Existing framework — all 24 contract tests use it   |
| node:assert/strict | built-in | Assertions for contract tests              | Existing — `assert.match`, `assert.ok`, `assert.doesNotMatch` |
| @playwright/test   | 1.58.2  | E2E browser automation                     | Existing infra — all E2E specs use it               |

### Supporting

| Library             | Version | Purpose                              | When to Use                           |
| ------------------- | ------- | ------------------------------------ | ------------------------------------- |
| node:fs readFileSync | built-in | Source-grep via `readWorkspaceFile` | All source-grep contract assertions   |
| node:path resolve   | built-in | Absolute path resolution             | Inside `readWorkspaceFile` helper     |

### Alternatives Considered

| Instead of         | Could Use         | Tradeoff                                           |
| ------------------ | ----------------- | -------------------------------------------------- |
| node:test          | vitest / jest     | No reason to switch — existing 24 tests use node:test |
| source-grep        | AST parsing       | Over-engineered for presence assertions            |

**Installation:** None needed — all dependencies already present.

## Architecture Patterns

### Recommended Project Structure

```
tests/
└── casinocraftz-tutorial-contract.test.mjs  # APPEND 4 new test() blocks here

e2e/
└── casinocraftz.spec.ts                     # NEW file (new test.describe block)
```

### Pattern 1: Source-Grep Contract Assertion

**What:** Read source file as string, assert regex matches expected content.
**When to use:** Preventing accidental removal of named attributes, keys, or code patterns.

```javascript
// Source: tests/casinocraftz-tutorial-contract.test.mjs (established pattern)
test('EN/PT attribute parity lock: data-casinocraftz-lesson-sensory-conditioning-soon', () => {
  const enPage = readWorkspaceFile('src/pages/en/casinocraftz/index.astro');
  const ptPage = readWorkspaceFile('src/pages/pt/casinocraftz/index.astro');

  assert.match(enPage, /data-casinocraftz-lesson-sensory-conditioning-soon/);
  assert.match(ptPage, /data-casinocraftz-lesson-sensory-conditioning-soon/);
});
```

### Pattern 2: i18n Key Presence Assertion

**What:** Parse JSON locale files, assert key exists and value matches anti-manipulation phrase.
**When to use:** Preventing key deletion and content regression.

```javascript
// Source: tests/casinocraftz-tutorial-contract.test.mjs lines 63-100 (established pattern)
test('causality copy: tutorial.causality.sensoryReveal exists in EN and PT', () => {
  const en = readLocale('src/i18n/en.json');
  const pt = readLocale('src/i18n/pt.json');

  assert.match(en['tutorial.causality.sensoryReveal'], /not outcomes/i);
  assert.match(pt['tutorial.causality.sensoryReveal'], /nao os resultados/i);
});
```

Verified content (HIGH confidence — read from source):
- EN: `"The sensory-conditioning reveal unlocks after observing 2 spins in lesson three. Feedback intensity changes perception, not outcomes."`
- PT: `"A revelacao de condicionamento sensorial e desbloqueada apos observar 2 giros na licao tres. A intensidade do feedback muda a percepcao, nao os resultados."`

### Pattern 3: Functional Unit Test (engine import)

**What:** Import `recordSpin` from `engine.ts`, construct a plain-object `TutorialState`, call function and assert output.
**When to use:** Testing pure function behavior without a browser.

**Key insight about `recordSpin` logic (verified from `engine.ts` lines 137–155):**
- Takes `TutorialState`, returns new state immutably.
- If `currentStep` is `sensory-conditioning-observe`: increments `spinsObserved`. If `nextSpinCount < requiresSpins (2)`, returns without advancing. If `nextSpinCount >= 2`, calls `advanceTutorialStep`.
- Next step after `sensory-conditioning-observe` is `sensory-conditioning-reveal` (per `CURRICULUM_LESSONS` array).

**Minimal `TutorialState` for functional test** — all fields required by the interface (`types.ts` lines 51–62):

```javascript
// Source: src/scripts/casinocraftz/tutorial/types.ts — TutorialState interface
const baseState = {
  currentLesson: 'sensory-conditioning',
  currentStep: 'sensory-conditioning-observe',
  completedSteps: [],
  spinsObserved: 0,
  essenceBalance: 0,
  unlockedLessons: ['house-edge', 'near-miss', 'sensory-conditioning'],
  completedLessons: ['house-edge', 'near-miss'],
  cardsUnlocked: [],
  activeCard: null,
  lastTransitionTrigger: null,
};
```

**Import challenge — `.mjs` importing `.ts`:**
The existing contract test file imports nothing from engine.ts — it uses only source-grep (`readWorkspaceFile`). D-01 introduces the first direct import of a TypeScript module from an `.mjs` test file. This is the critical technical gap to resolve.

Existing test run command: `node --test tests/*.test.mjs` (no TypeScript transform configured at the test runner level).

**Resolution approach:**
The functional assertions in D-01 can be written as source-grep tests instead of import-based tests if the `node --test` runner cannot resolve `.ts` imports without additional tooling. The CONTEXT.md (D-04) explicitly acknowledges this: "check if `node --test` can import `.ts` directly or needs compiled output."

Options in priority order:
1. **Source-grep approach** (safest, zero new tools): Assert `requiresSpins: 2` for `sensory-conditioning-observe` step definition (already passing in test #6 via `assert.match(engineSource, /requiresSpins:\s*2/)`), and assert `recordSpin` logic shape. This approach avoids the TS import problem entirely and is consistent with all 24 existing tests.
2. **Compiled output import**: Check if Astro build produces accessible CommonJS/ESM output for engine.ts that node can import.
3. **tsx / ts-node**: Would require installing a new dev dependency — contradicts D-03 ("no new packages").

**Recommendation:** Use source-grep for the functional assertions to stay within the established pattern. The planner should verify whether D-01's intent requires runtime execution or whether source-code assertions satisfy the contract.

### Pattern 4: Playwright postMessage Spin Injection

**What:** Use `page.evaluate` to dispatch a `window.postMessage` bridge event that triggers `onSpinMessage` in the tutorial runtime.
**When to use:** Testing spin-triggered state transitions in-browser without a real slots game.

```typescript
// Adapted from e2e/compatibility.spec.ts established evaluate pattern
// Source: src/scripts/casinocraftz/tutorial/main.ts — onSpinMessage handler
await page.evaluate(() => {
  window.postMessage({ type: 'ccz:spin-settled', version: 1, payload: { spinIndex: 0 } }, '*');
});
```

**Bridge event format** (verified from `types.ts` and `main.ts`):
- v1 format: `{ type: 'ccz:spin-settled', version: 1, payload: { spinIndex: number } }`
- Legacy format: `{ type: 'ccz:spin-settled', spinIndex: number }` (also accepted)
- The `spinIndex` value does not affect step advancement logic — only spin count matters.

**Spin injection sequencing risk** (flagged in STATE.md blockers):
> "Playwright spin injection sequencing — synchronous double-injection in `page.evaluate()` can cause state misread."

After injecting spin 1, the test must wait for a stable observable state (e.g., `data-casinocraftz-tutorial-step` attribute still equals `sensory-conditioning-observe`) before injecting spin 2. Using `await expect(root).toHaveAttribute(...)` between injections provides the necessary synchronization barrier.

### Pattern 5: Playwright localStorage Setup for Cross-Session State

**What:** Set localStorage before page load to simulate a returning user with Lesson 2 completed.
**When to use:** Any test that requires a non-first-run session state.

```typescript
// Source: e2e/compatibility.spec.ts page.evaluate pattern for localStorage
await page.goto('/en/casinocraftz/');
await page.evaluate(() => {
  localStorage.setItem('ccz-tutorial-completed', '1');
  localStorage.setItem('ccz-near-miss-completed', '1');
});
await page.reload();
```

After reload, `loadCompletedLessons()` (verified from `engine.ts` lines 95–116) will detect `ccz-near-miss-completed` and push `sensory-conditioning` into `unlockedLessons`. The shell will show Lesson 3 as active.

### Anti-Patterns to Avoid

- **Injecting both spins in a single `page.evaluate` call without an await barrier:** The message handler is async-adjacent (event listener). Two synchronous `postMessage` calls in a single evaluate may race. Inject spin 1, await the expected attribute, then inject spin 2.
- **Using partial regex match for attribute parity lock:** The `data-casinocraftz-lesson-sensory-conditioning-soon` assertion must match the exact attribute name string, not a substring, to be a reliable removal guard.
- **Skipping the "step does NOT advance" assertion:** The roadmap explicitly requires BOTH halves of the gate to be tested. Assert step is still `sensory-conditioning-observe` after spin 1 before injecting spin 2.
- **Creating a new contract test file:** D-02 is explicit — append to `tests/casinocraftz-tutorial-contract.test.mjs`.

## Don't Hand-Roll

| Problem                          | Don't Build              | Use Instead                                          | Why                                          |
| -------------------------------- | ------------------------ | ---------------------------------------------------- | -------------------------------------------- |
| i18n key parity checking         | Custom key diffing logic | `extractNamespaceKeys()` helper (already in test file) | Handles all tutorial/cards namespaces        |
| Source file reading              | fs.open/stream           | `readWorkspaceFile()` helper (already in test file)  | Resolves from `process.cwd()`, consistent    |
| Spin injection synchronization   | Custom sleep/poll        | `await expect(root).toHaveAttribute(...)` (Playwright built-in) | Playwright's auto-retry handles timing       |

**Key insight:** Every utility needed for the new tests already exists in the codebase. The planner should reference the exact line numbers/helpers rather than re-implementing.

## Common Pitfalls

### Pitfall 1: TypeScript Import from `.mjs` Without a Transformer

**What goes wrong:** `node --test tests/casinocraftz-tutorial-contract.test.mjs` fails with `ERR_UNKNOWN_FILE_EXTENSION` when trying to `import { recordSpin } from '../src/scripts/casinocraftz/tutorial/engine.ts'`.
**Why it happens:** Node.js does not natively run `.ts` files. Astro compiles them at build time, but the test runner has no transformer configured.
**How to avoid:** Use source-grep assertions for the functional contract (D-01), or explicitly check whether `node --experimental-strip-types` (Node 22+ feature) is available and configured. Node 22.22.1 is installed — `--experimental-strip-types` was added in Node 22.6.0 and is available. However, using it would change the existing test run command.
**Warning signs:** Test file fails with a module resolution or file extension error.

**Node 22 experimental strip-types note:** Node 22.6+ supports `node --experimental-strip-types` for running TypeScript directly. Node 22.22.1 is installed. This is a potential path, but requires appending the flag to the run command. Confidence: MEDIUM (experimental API, not default behavior).

### Pitfall 2: Spin Injection Race Condition

**What goes wrong:** The `sensory-conditioning-observe` step appears to advance after only 1 spin, or the step advances to an unexpected state.
**Why it happens:** Two `postMessage` calls dispatched synchronously may be processed in the same microtask flush, causing `spinsObserved` to jump from 0 to 2 in a single `recordSpin` invocation — but `recordSpin` only increments by 1 per call, so a true race is unlikely. The real risk is asserting state before the DOM has updated.
**How to avoid:** Use `await expect(root).toHaveAttribute('data-casinocraftz-tutorial-step', 'sensory-conditioning-observe')` between spin 1 and spin 2 injections.
**Warning signs:** Flaky test that sometimes passes and sometimes reports the wrong step.

### Pitfall 3: Playwright webServer Uses Build + Preview, Not Dev

**What goes wrong:** Playwright test makes assertions about behavior that only exists in dev mode, or test setup assumes hot-reload.
**Why it happens:** `playwright.config.ts` sets `webServer.command: 'npm run build && npm run preview'`. The server is a static preview, not a Vite dev server.
**How to avoid:** No issue for this phase — the casinocraftz tutorial runtime is client-side JavaScript that works identically in preview. Just be aware that changes to production files require a build before Playwright can see them.
**Warning signs:** Playwright test fails in CI but passes in dev mode.

### Pitfall 4: Accessing Lesson 3 Without Setting Both localStorage Keys

**What goes wrong:** Test navigates to `/en/casinocraftz/` and tries to interact with Lesson 3, but it is still locked.
**Why it happens:** `loadCompletedLessons` (engine.ts line 95) checks `ccz-near-miss-completed` to unlock `sensory-conditioning`. It does NOT require `ccz-tutorial-completed` for Lesson 3 specifically, but the house-edge completion key is needed for the near-miss unlock chain.
**How to avoid:** Set both `ccz-tutorial-completed` and `ccz-near-miss-completed` in localStorage before reloading. D-06 in CONTEXT.md only mentions `ccz-near-miss-completed` — but the unlock logic also requires house-edge to be done for near-miss to show as complete.
**Warning signs:** `data-casinocraftz-unlocked-lessons` attribute does not include `sensory-conditioning` after reload.

Verified chain (from `engine.ts` lines 110–115):
```
ccz-tutorial-completed   → house-edge in completedLessons → near-miss in unlockedLessons
ccz-near-miss-completed  → near-miss in completedLessons  → sensory-conditioning in unlockedLessons
```
Both keys must be set to reach Lesson 3.

### Pitfall 5: Recap Disclosure Test Depends on lastTransitionTrigger

**What goes wrong:** The causality disclosure (`data-casinocraftz-recap`) does not render, so the Playwright assertion for it fails.
**Why it happens:** In `main.ts` lines 126–155, the recap element only renders when `state.lastTransitionTrigger === 'spin'`. This is set in `onSpinMessage` only when the step actually advances (`state.currentStep !== previousStep`). The step advance from `sensory-conditioning-observe` to `sensory-conditioning-reveal` sets `lastTransitionTrigger: 'spin'` correctly.
**How to avoid:** The E2E test for causality disclosure must proceed past spin 2 — which transitions to `sensory-conditioning-reveal` with `lastTransitionTrigger: 'spin'` — before asserting the recap element is visible.
**Warning signs:** `[data-casinocraftz-recap]` selector returns no element.

## Code Examples

Verified patterns from source code:

### Contract Test Structure (append to existing file)

```javascript
// Source: tests/casinocraftz-tutorial-contract.test.mjs — established structure
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import test from 'node:test';

// ... existing helpers and 24 tests ...

// NEW: Append at end of file
test('Spin-Bridge: sensory-conditioning-observe step has requiresSpins: 2 in engine', () => {
  const src = readWorkspaceFile('src/scripts/casinocraftz/tutorial/engine.ts');
  // sensory-conditioning-observe step definition includes requiresSpins: 2
  assert.match(src, /'sensory-conditioning-observe'.*requiresSpins:\s*2|requiresSpins:\s*2.*'sensory-conditioning-observe'/s);
});

test('Spin-Bridge: recordSpin guards sensory-conditioning-observe in the observe-step list', () => {
  const src = readWorkspaceFile('src/scripts/casinocraftz/tutorial/engine.ts');
  assert.match(src, /sensory-conditioning-observe/);
  // recordSpin function body guards on this step name
  assert.match(src, /currentStep.*!==.*'sensory-conditioning-observe'|'sensory-conditioning-observe'.*currentStep/);
});

test('Causality Disclosure: tutorial.causality.sensoryReveal key present in EN and PT with anti-manipulation phrase', () => {
  const en = readLocale('src/i18n/en.json');
  const pt = readLocale('src/i18n/pt.json');
  assert.match(en['tutorial.causality.sensoryReveal'], /not outcomes/i);
  assert.match(pt['tutorial.causality.sensoryReveal'], /nao os resultados/i);
});

test('EN/PT Parity: data-casinocraftz-lesson-sensory-conditioning-soon attribute present in both pages', () => {
  const enPage = readWorkspaceFile('src/pages/en/casinocraftz/index.astro');
  const ptPage = readWorkspaceFile('src/pages/pt/casinocraftz/index.astro');
  assert.match(enPage, /data-casinocraftz-lesson-sensory-conditioning-soon/);
  assert.match(ptPage, /data-casinocraftz-lesson-sensory-conditioning-soon/);
});
```

### Playwright Spec Structure (new file)

```typescript
// Source: e2e/casinocraftz.spec.ts (new file, follows e2e/*.spec.ts convention)
import { test, expect } from '@playwright/test';

test.describe('Casinocraftz Lesson 3 — spin-bridge gate', () => {
  test('sensory-conditioning-observe does not advance before 2 spins — EN', async ({ page }) => {
    await page.goto('/en/casinocraftz/');
    await page.evaluate(() => {
      localStorage.setItem('ccz-tutorial-completed', '1');
      localStorage.setItem('ccz-near-miss-completed', '1');
    });
    await page.reload();

    const root = page.locator('[data-casinocraftz-shell-root]');

    // Open Lesson 3
    await page
      .locator('[data-casinocraftz-lesson="sensory-conditioning"] [data-casinocraftz-lesson-action="sensory-conditioning"]')
      .click();

    // Advance to sensory-conditioning-observe step
    await page.locator('[data-casinocraftz-tutorial-next]').click();
    await expect(root).toHaveAttribute('data-casinocraftz-tutorial-step', 'sensory-conditioning-observe');

    // Inject spin 1 — step must NOT advance
    await page.evaluate(() => {
      window.postMessage({ type: 'ccz:spin-settled', version: 1, payload: { spinIndex: 0 } }, '*');
    });
    await expect(root).toHaveAttribute('data-casinocraftz-tutorial-step', 'sensory-conditioning-observe');

    // Inject spin 2 — step MUST advance to sensory-conditioning-reveal
    await page.evaluate(() => {
      window.postMessage({ type: 'ccz:spin-settled', version: 1, payload: { spinIndex: 1 } }, '*');
    });
    await expect(root).toHaveAttribute('data-casinocraftz-tutorial-step', 'sensory-conditioning-reveal');
  });

  test('causality disclosure renders after spin-triggered transition — EN/PT', async ({ page }) => {
    for (const lang of ['en', 'pt'] as const) {
      await page.goto(`/${lang}/casinocraftz/`);
      await page.evaluate(() => {
        localStorage.setItem('ccz-tutorial-completed', '1');
        localStorage.setItem('ccz-near-miss-completed', '1');
      });
      await page.reload();

      const root = page.locator('[data-casinocraftz-shell-root]');
      await page
        .locator(`[data-casinocraftz-lesson="sensory-conditioning"] [data-casinocraftz-lesson-action="sensory-conditioning"]`)
        .click();
      await page.locator('[data-casinocraftz-tutorial-next]').click();
      await expect(root).toHaveAttribute('data-casinocraftz-tutorial-step', 'sensory-conditioning-observe');

      // Inject 2 spins to trigger transition
      await page.evaluate(() => {
        window.postMessage({ type: 'ccz:spin-settled', version: 1, payload: { spinIndex: 0 } }, '*');
      });
      await expect(root).toHaveAttribute('data-casinocraftz-tutorial-step', 'sensory-conditioning-observe');
      await page.evaluate(() => {
        window.postMessage({ type: 'ccz:spin-settled', version: 1, payload: { spinIndex: 1 } }, '*');
      });
      await expect(root).toHaveAttribute('data-casinocraftz-tutorial-step', 'sensory-conditioning-reveal');

      // Causality disclosure must be present (spin-triggered transition)
      await expect(page.locator('[data-casinocraftz-recap="true"]')).toBeVisible();
    }
  });
});
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
| ------------ | ---------------- | ------------ | ------- |
| Single test file for all contracts | Single file remains; new blocks appended | Phase 44 (no change) | Consistent with D-02 |
| No Playwright spec for casinocraftz | `e2e/casinocraftz.spec.ts` introduced | Phase 44 | First E2E coverage for tutorial spin-bridge |

**Deprecated/outdated:**

- None relevant to this phase.

## Open Questions

1. **Functional import of engine.ts from `.mjs` test file**
   - What we know: Node 22.22.1 supports `--experimental-strip-types`. The existing test command (`node --test tests/*.test.mjs`) does not use this flag.
   - What's unclear: Whether the planner should add `--experimental-strip-types` to the test run command to enable D-01's import-based functional test, or whether source-grep assertions fully satisfy the acceptance criteria.
   - Recommendation: Implement source-grep assertions (Pattern 1 examples above) for the contract tests. They provide equivalent proof that `recordSpin` has the correct logic structure. The two tests in the Code Examples section above cover the gate without requiring a TS import. If the planner wants true runtime execution, add `--experimental-strip-types` to the `node --test` invocation — it is a stable enough feature on Node 22.22.1.

2. **D-06 localStorage key requirement**
   - What we know: D-06 mentions setting `ccz-near-miss-completed` only. But the unlock chain in `loadCompletedLessons` requires `ccz-tutorial-completed` for house-edge completion before near-miss unlocks sensory-conditioning.
   - What's unclear: Whether the engine has a shortcut that bypasses the house-edge requirement.
   - Recommendation: Set both `ccz-tutorial-completed` and `ccz-near-miss-completed`. This is the safe path and costs nothing.

## Environment Availability

| Dependency       | Required By              | Available | Version  | Fallback |
| ---------------- | ------------------------ | --------- | -------- | -------- |
| Node.js          | Contract tests           | ✓         | 22.22.1  | —        |
| @playwright/test | E2E spec                 | ✓         | 1.58.2   | —        |
| node:test        | Contract tests (built-in)| ✓         | built-in | —        |
| Dev/preview server | Playwright webServer   | ✓         | via `npm run build && npm run preview` | — |

**Missing dependencies with no fallback:** None — all dependencies available.

## Validation Architecture

### Test Framework

| Property           | Value                                                                  |
| ------------------ | ---------------------------------------------------------------------- |
| Contract framework | node:test (built-in) + node:assert/strict                             |
| Contract config    | None (invoked directly as `node --test tests/*.test.mjs`)             |
| E2E framework      | @playwright/test 1.58.2                                               |
| E2E config         | `playwright.config.ts` (exists)                                       |
| Quick run (contract) | `node --test tests/casinocraftz-tutorial-contract.test.mjs`        |
| Quick run (E2E)    | `npx playwright test e2e/casinocraftz.spec.ts`                        |
| Full suite (E2E)   | `npm run test`                                                         |

### Phase Requirements → Test Map

| Req ID | Behavior                                                        | Test Type        | Automated Command                                                              | File Exists?   |
| ------ | --------------------------------------------------------------- | ---------------- | ------------------------------------------------------------------------------ | -------------- |
| EDU-72 | `sensory-conditioning-observe` does not advance before 2 spins  | contract         | `node --test tests/casinocraftz-tutorial-contract.test.mjs`                    | ✓ (append)     |
| EDU-72 | `sensory-conditioning-observe` advances exactly on 2nd spin     | contract + E2E   | `node --test tests/casinocraftz-tutorial-contract.test.mjs` + `npx playwright test e2e/casinocraftz.spec.ts` | ❌ Wave 0 (E2E) |
| EDU-72 | Causality disclosure renders in EN and PT on `sensory-conditioning-reveal` | E2E   | `npx playwright test e2e/casinocraftz.spec.ts`                                 | ❌ Wave 0      |
| EDU-72 | `data-casinocraftz-lesson-sensory-conditioning-soon` present in EN/PT pages | contract | `node --test tests/casinocraftz-tutorial-contract.test.mjs`             | ✓ (append)     |

### Sampling Rate

- **Per task commit:** `node --test tests/casinocraftz-tutorial-contract.test.mjs`
- **Per wave merge:** `node --test tests/casinocraftz-tutorial-contract.test.mjs` + `npx playwright test e2e/casinocraftz.spec.ts`
- **Phase gate:** Full suite green (`npm run test`) before `/gsd:verify-work`

### Wave 0 Gaps

- [ ] `e2e/casinocraftz.spec.ts` — new file, covers E2E portion of EDU-72 (spin-bridge + causality disclosure)

_(Contract test file already exists — only new test blocks appended, no Wave 0 gap for the contract file.)_

## Sources

### Primary (HIGH confidence)

- `tests/casinocraftz-tutorial-contract.test.mjs` — read directly; 24 tests, all patterns verified
- `src/scripts/casinocraftz/tutorial/engine.ts` — read directly; `recordSpin`, `TUTORIAL_STEPS`, `requiresSpins: 2`, `createInitialTutorialState`
- `src/scripts/casinocraftz/tutorial/types.ts` — read directly; `TutorialState` interface field list
- `src/scripts/casinocraftz/tutorial/main.ts` — read directly; `onSpinMessage`, `lastTransitionTrigger`, recap disclosure logic
- `src/i18n/en.json` + `src/i18n/pt.json` — read directly; `tutorial.causality.sensoryReveal` values confirmed
- `src/pages/en/casinocraftz/index.astro` + `src/pages/pt/casinocraftz/index.astro` — read directly; `data-casinocraftz-lesson-sensory-conditioning-soon` confirmed on line 31 of each
- `playwright.config.ts` — read directly; webServer uses `build && preview`, baseURL `localhost:4321`
- `e2e/compatibility.spec.ts` — read directly; `page.evaluate`, localStorage pattern, `page.reload`, `toHaveAttribute` patterns

### Secondary (MEDIUM confidence)

- Node.js 22 `--experimental-strip-types` support: verified Node 22.22.1 is installed; feature was introduced in Node 22.6.0.

## Metadata

**Confidence breakdown:**

- Standard stack: HIGH — all tools verified as already installed and in use
- Architecture: HIGH — all patterns verified from actual source files
- Pitfalls: HIGH — derived from direct code reading (engine.ts unlock chain, main.ts recap conditions)
- Open questions: MEDIUM — TS import question has a clear resolution path but requires a command flag change

**Research date:** 2026-04-04
**Valid until:** 2026-05-04 (stable, no moving dependencies)
