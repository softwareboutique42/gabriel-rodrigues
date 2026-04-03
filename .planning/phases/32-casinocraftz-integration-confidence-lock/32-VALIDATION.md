# Phase 32 Validation Plan

## Purpose

Define confidence-lock validation architecture for Phase 32 requirements SYS-42, QA-40, and QA-41 without expanding product scope.

## Scope Guard

- Confidence-lock only: no net-new gameplay, economy, tutorial-step, card-mechanic, or route-family behavior.
- Validation coverage is limited to deterministic contract and compatibility checks on existing integrated surfaces.

## Validation Matrix

| Requirement | Behavior                                                                                                                     | Validation Type | Command / Method                                                                                                                                                                                                                                                                                     | Owner Plan                                                                 |
| ----------- | ---------------------------------------------------------------------------------------------------------------------------- | --------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----- |
| SYS-42      | Integrated Casinocraftz surface preserves fake, free-to-play framing and blocks monetization drift on EN/PT canonical routes | Contract        | `node --test tests/compatibility-contract.test.mjs tests/casinocraftz-tutorial-contract.test.mjs`                                                                                                                                                                                                    | 32-01                                                                      |
| QA-40       | Canonical EN/PT routes and embed host parity remain locked for Casinocraftz and standalone Slots surfaces                    | Contract + E2E  | `node --test tests/compatibility-contract.test.mjs tests/slots-i18n-parity-contract.test.mjs` and `npx playwright test e2e/compatibility.spec.ts --project=chromium --workers=1 --grep "casinocraftz embeds slots module with canonical EN/PT host parity                                            | slots runtime compatibility keeps machine-readable gameplay state in EN/PT | casinocraftz tutorial advances to probability reveal after three spins in EN/PT"`                                                                                                                                                                                                       | 32-01 |
| QA-40       | Tutorial progression and starter-card authority boundaries remain deterministic and isolated from Slots authority internals  | Contract + E2E  | `node --test tests/casinocraftz-tutorial-contract.test.mjs` and `npx playwright test e2e/compatibility.spec.ts --project=chromium --workers=1 --grep "casinocraftz tutorial advances to probability reveal after three spins in EN/PT"`                                                              | 32-01                                                                      |
| QA-41       | Release confidence evidence is reproducible and auditable (contracts, browser checks, lint, build, JSON artifact)            | Release Gate    | `node --test tests/compatibility-contract.test.mjs tests/slots-i18n-parity-contract.test.mjs tests/casinocraftz-tutorial-contract.test.mjs && npx playwright test e2e/compatibility.spec.ts --project=chromium --workers=1 --grep "casinocraftz embeds slots module with canonical EN/PT host parity | slots runtime compatibility keeps machine-readable gameplay state in EN/PT | casinocraftz tutorial advances to probability reveal after three spins in EN/PT" && npx playwright test e2e/compatibility.spec.ts --project=chromium --workers=1 --grep "casinocraftz" --reporter=json > .planning/debug/slots-playwright-report.json && npm run lint && npm run build` | 32-01 |

## Command Order (Fail Fast)

1. `node --test tests/compatibility-contract.test.mjs tests/slots-i18n-parity-contract.test.mjs tests/casinocraftz-tutorial-contract.test.mjs`
2. `npx playwright test e2e/compatibility.spec.ts --project=chromium --workers=1 --grep "casinocraftz embeds slots module with canonical EN/PT host parity|slots runtime compatibility keeps machine-readable gameplay state in EN/PT|casinocraftz tutorial advances to probability reveal after three spins in EN/PT"`
3. `npx playwright test e2e/compatibility.spec.ts --project=chromium --workers=1 --grep "casinocraftz" --reporter=json > .planning/debug/slots-playwright-report.json`
4. `npm run lint`
5. `npm run build`

## Validation Artifacts

- `.planning/debug/slots-playwright-report.json`
- `.planning/phases/32-casinocraftz-integration-confidence-lock/32-VALIDATION.md`
- `.planning/phases/32-casinocraftz-integration-confidence-lock/32-VERIFICATION.md`
- `.planning/phases/32-casinocraftz-integration-confidence-lock/32-01-SUMMARY.md`

## Completion Criteria

- SYS-42 passes via deterministic anti-monetization and free-to-play contract assertions.
- QA-40 passes via deterministic EN/PT route, embed, runtime envelope, and tutorial progression parity checks.
- QA-41 passes via reproducible execution chain and captured machine-readable evidence.
