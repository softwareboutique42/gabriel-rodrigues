# Phase 2 Validation Plan

## Purpose

Define the automated and manual evidence required to execute and sign off Phase 2 without leaving requirement gaps.

## Validation Matrix

| Requirement | Behavior                                                                     | Validation Type                      | Command / Method                                                                                                                            | Owner Plan                 |
| ----------- | ---------------------------------------------------------------------------- | ------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------- |
| FR-2.1      | Worker returns `mood`, `industryCategory`, `energyLevel` safely              | Contract / unit                      | `node --test tests/animation-quality-contract.test.mjs`                                                                                     | 02-01                      |
| FR-2.2      | Same semantic payload always resolves to same style                          | Unit + browser smoke                 | `node --test tests/animation-quality-contract.test.mjs`; `npx playwright test e2e/canvas.spec.ts --project=chromium`                        | 02-01, 02-04               |
| FR-2.3      | Five moods produce distinct motion presets                                   | Unit + manual review                 | `node --test tests/quality-profiles.test.mjs`; premium checklist comparison                                                                 | 02-02, 02-05               |
| FR-2.4      | Company name dominates across all styles; stagger in Narrative and Spotlight | Browser smoke + manual review        | `npx playwright test e2e/canvas.spec.ts --project=chromium`; premium checklist                                                              | 02-04, 02-05               |
| FR-2.5      | Light backgrounds switch away from additive across all affected styles       | Unit + browser smoke + manual review | `node --test tests/quality-profiles.test.mjs`; `npx playwright test e2e/canvas.spec.ts --project=chromium`; light-background checklist pass | 02-02, 02-03, 02-04, 02-05 |
| FR-2.6      | `visualElements` truncate to 12 chars before sprite creation                 | Unit / contract                      | `node --test tests/animation-quality-contract.test.mjs`                                                                                     | 02-01                      |
| FR-2.7      | Particles and geometric styles show layered depth without seam regressions   | Build + manual review                | `npm run build`; premium checklist notes                                                                                                    | 02-03, 02-05               |
| NFR-9       | Low-concurrency devices cap particles at 400                                 | Unit + browser smoke                 | `node --test tests/quality-profiles.test.mjs`; `npx playwright test e2e/canvas.spec.ts --project=chromium` with forced low concurrency      | 02-02, 02-05               |

## Wave 0 Gaps Closed By Plan Set

- Selector and normalization helper tests are introduced in Plan 02-01.
- Quality-profile helper tests are introduced in Plan 02-02.
- Light-background browser coverage is extended in Plans 02-04 and 02-05.
- Low-concurrency browser coverage is extended in Plan 02-05.
- Manual premium and mood-comparison evidence is collected only at the final checkpoint in Plan 02-05.

## Phase Gate

Phase 2 is ready for sign-off only when all of the following are true:

1. Plans 02-01 through 02-05 have completed their automated verification steps.
2. The manual checklist in `.planning/phases/02-animation-quality/02-PREMIUM-CHECKLIST.md` records a passing premium-bar judgment.
3. No style is left without explicit FR-2.4 and FR-2.5 ownership in the executed plan summaries.

## Commands

- `node --test tests/animation-quality-contract.test.mjs`
- `node --test tests/quality-profiles.test.mjs`
- `npx playwright test e2e/canvas.spec.ts --project=chromium`
- `npm run build`
- `npm run lint`
