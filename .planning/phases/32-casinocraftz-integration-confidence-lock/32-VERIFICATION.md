# Phase 32 Verification

## Scope

Phase 32 Plan 01 confidence-lock execution for SYS-42, QA-40, QA-41.

## Validation Commands And Results

1. `node --test tests/compatibility-contract.test.mjs tests/slots-i18n-parity-contract.test.mjs tests/casinocraftz-tutorial-contract.test.mjs`
   - Result: PASS
   - Evidence: 13 tests passed, 0 failed.

2. `CI=1 npx playwright test e2e/compatibility.spec.ts --project=chromium --workers=1 --grep "casinocraftz embeds slots module with canonical EN/PT host parity|slots runtime compatibility keeps machine-readable gameplay state in EN/PT|casinocraftz tutorial advances to probability reveal after three spins in EN/PT"`
   - Result: PASS
   - Evidence: 2 tests passed, 0 failed.

3. `CI=1 npx playwright test e2e/compatibility.spec.ts --project=chromium --workers=1 --grep "casinocraftz" --reporter=json > .planning/debug/slots-playwright-report.json`
   - Result: PASS
   - Evidence: JSON report generated; stats show expected=7, unexpected=0, errors=0.

4. `npm run lint`
   - Result: PASS with warning
   - Warning: pre-existing out-of-scope warning in `.claude/get-shit-done/bin/lib/state.cjs` (unused eslint-disable directive).

5. `npm run build`
   - Result: PASS
   - Evidence: Astro static build completed successfully.

## Requirement Closure

- SYS-42: Closed by contract coverage guarding free-to-play/non-monetized integrated surfaces and canonical route boundaries.
- QA-40: Closed by deterministic contract assertions plus Chromium compatibility checks over EN/PT embedded and standalone envelopes.
- QA-41: Closed by reproducible command chain and captured machine-readable artifact at `.planning/debug/slots-playwright-report.json`.

## Notes

- A transient Playwright failure was observed when reusing an existing local server (`504 Outdated Optimize Dep` console errors). Running in CI mode (`CI=1`) forced a fresh web server lifecycle and produced stable green evidence.
