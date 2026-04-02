# Phase 3 Validation Plan

## Purpose

Define the automated and manual evidence required to execute and sign off Phase 3 video export requirements without gaps.

## Validation Matrix

| Requirement | Behavior                                                                     | Validation Type               | Command / Method                                                                                                 | Owner Plan   |
| ----------- | ---------------------------------------------------------------------------- | ----------------------------- | ---------------------------------------------------------------------------------------------------------------- | ------------ |
| FR-3.1      | Paid flow produces browser-generated WebM download                           | Contract + e2e                | `node --test tests/export-contract.test.mjs`; `npx playwright test e2e/canvas-export.spec.ts --project=chromium` | 03-02, 03-05 |
| FR-3.2      | Stripe gate is required before export pipeline runs                          | Build + e2e                   | `npm run build`; `npx playwright test e2e/canvas-export.spec.ts --project=chromium -g "paid"`                    | 03-02        |
| FR-3.3      | Renderer uses exportMode and manualElapsed for deterministic capture         | Contract                      | `node --test tests/export-contract.test.mjs`                                                                     | 03-01        |
| FR-3.4      | Export capture uses preserveDrawingBuffer or equivalent synchronous strategy | Contract + code-path check    | `node --test tests/export-contract.test.mjs -t "drawing buffer"`                                                 | 03-02        |
| FR-3.5      | Offscreen export renderer keeps live preview unaffected                      | e2e                           | `npx playwright test e2e/canvas-export.spec.ts --project=chromium -g "preview"`                                  | 03-02, 03-05 |
| FR-3.6      | Default export profile is 1920x1080, 30 fps, 12 s                            | Contract                      | `node --test tests/export-contract.test.mjs -t "default settings"`                                               | 03-01        |
| FR-3.7      | Export warms up for 100 ms before recording                                  | Contract                      | `node --test tests/export-contract.test.mjs -t "warm up"`                                                        | 03-02        |
| FR-3.8      | Progress indicator is visible and updates during capture                     | e2e                           | `npx playwright test e2e/canvas-export.spec.ts --project=chromium -g "progress"`                                 | 03-02, 03-03 |
| FR-3.9      | Unsupported browsers show guidance/fallback instead of broken export         | e2e                           | `npx playwright test e2e/canvas-export.spec.ts --project=chromium -g "unsupported"`                              | 03-01, 03-03 |
| FR-3.10     | Chromium uses WebCodecs + mp4-muxer path; VideoFrame closes                  | Contract + build              | `node --test tests/export-contract.test.mjs -t "webcodecs mp4"`; `npm run build`                                 | 03-04        |
| FR-3.11     | Export mode applies 30 percent particle reduction                            | Unit                          | `node --test tests/quality-profiles.test.mjs -t "export reduction"`                                              | 03-01        |
| NFR-2       | 12-second export completes in <= 36 s on 4-core desktop                      | Manual benchmark + evidence   | Record 3 timed runs in `.planning/phases/03-video-export/03-BENCHMARK.md`                                        | 03-05        |
| NFR-3       | 12-second 1080p WebM is <= 10 MB                                             | Manual benchmark + evidence   | Record output sizes from same 3 runs in `.planning/phases/03-video-export/03-BENCHMARK.md`                       | 03-05        |
| NFR-5       | Client scripts preserve astro:page-load + AbortController cleanup model      | Static + e2e                  | `npm run lint`; `npx playwright test e2e/navigation.spec.ts --project=chromium`                                  | 03-02, 03-03 |
| NFR-7       | Export remains browser-only with no server rendering pipeline                | Architecture check + contract | `node --test tests/export-contract.test.mjs -t "browser only"`; code review of worker routes                     | 03-01, 03-04 |

## Wave 0 Gaps Closed By Plan Set

- `tests/export-contract.test.mjs` is introduced in 03-01 to establish export contract guardrails.
- `src/scripts/canvas/export-support.ts` and `src/scripts/canvas/export-encoders.ts` are introduced in 03-01 as interface foundations.
- `e2e/canvas-export.spec.ts` is introduced in 03-03 for progress/fallback flow coverage.
- Benchmark evidence artifact `.planning/phases/03-video-export/03-BENCHMARK.md` is created in 03-05 for NFR closure.

## Phase Gate

Phase 3 is ready for sign-off only when all of the following are true:

1. Plans 03-01 through 03-05 complete their automated verification commands successfully.
2. The benchmark artifact `.planning/phases/03-video-export/03-BENCHMARK.md` records three default export runs with pass/fail outcomes for NFR-2 and NFR-3.
3. `e2e/canvas-export.spec.ts` passes for supported and unsupported scenarios.
4. MP4 enhancement tests pass in environments with WebCodecs mocks (FR-3.10).

## Commands

- `node --test tests/export-contract.test.mjs`
- `node --test tests/quality-profiles.test.mjs`
- `npx playwright test e2e/canvas-export.spec.ts --project=chromium`
- `npx playwright test e2e/navigation.spec.ts --project=chromium`
- `npm run build`
- `npm run lint`
