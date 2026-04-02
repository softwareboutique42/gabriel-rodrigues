# Phase 3: Video Export - Research

**Researched:** 2026-04-02
**Domain:** Browser-side video export for Three.js canvas with Stripe-gated download
**Confidence:** MEDIUM-HIGH

## User Constraints

- Scope this phase to FR-3.1 through FR-3.11 plus NFR-2, NFR-3, NFR-5, and NFR-7.
- Build on existing code in src/scripts/canvas.
- Keep browser-only encoding (no server-side rendering pipeline).
- Extend existing Stripe checkout/download flow instead of replacing it.
- Produce codebase-specific architecture decisions, implementation waves, risk mitigation, verification strategy, and file-level dependency ordering.

## Project Constraints (from CLAUDE.md)

- Stack stays Astro 6 + Three.js + Cloudflare Worker + Stripe.
- All client script lifecycle wiring must stay compatible with astro:page-load and AbortController cleanup patterns.
- EN/PT parity is required for all user-facing strings.
- No SSR backend for this feature; static Cloudflare Pages deployment remains unchanged.
- Node baseline is >= 22.12.0.

<phase_requirements>

## Phase Requirements

| ID      | Description                                                             | Research Support                                   |
| ------- | ----------------------------------------------------------------------- | -------------------------------------------------- |
| FR-3.1  | Download current animation as browser-generated WebM                    | Standard Stack, Architecture Pattern 1, Wave 2     |
| FR-3.2  | Stripe-gated export flow                                                | Architecture Pattern 4, Wave 1                     |
| FR-3.3  | CanvasRenderer exportMode + manualElapsed                               | Architecture Pattern 2, File-level recommendations |
| FR-3.4  | preserveDrawingBuffer during export or synchronous requestFrame pattern | Architecture Pattern 3, Risk mitigations           |
| FR-3.5  | Separate offscreen export renderer, live preview unaffected             | Architecture Pattern 1, Wave 2                     |
| FR-3.6  | Default 1920x1080, 30 fps, 12s, WebM                                    | Standard Stack defaults, Wave 2                    |
| FR-3.7  | 100ms warm-up delay                                                     | Architecture Pattern 3, Verification map           |
| FR-3.8  | Progress indicator during capture                                       | Wave 3 UI integration + tests                      |
| FR-3.9  | MediaRecorder capability gate with Safari/iOS fallback                  | Architecture Pattern 5, i18n updates               |
| FR-3.10 | Chrome/Edge WebCodecs + mp4-muxer SHOULD path; close VideoFrame         | Architecture Pattern 6, Wave 4                     |
| FR-3.11 | 30% particle reduction in export mode                                   | Architecture Pattern 2, quality-profiles extension |
| NFR-2   | Export <= 36s for 12s animation on 4-core desktop                       | Performance targets + benchmark verification       |
| NFR-3   | 12s 1080p output <= 10 MB                                               | Codec/bitrate recommendations + acceptance tests   |
| NFR-5   | New client scripts respect astro lifecycle pattern                      | Main script integration guidance                   |
| NFR-7   | No server-side rendering infrastructure                                 | Don’t Hand-Roll and architecture scope             |

</phase_requirements>

## Summary

Phase 3 should be implemented as a browser-only export pipeline layered on top of the existing renderer and payment flow, not as a replacement of current architecture. The current code already has a strong base: deterministic 12-second loop semantics in animations, normalization boundaries in client and worker, and Stripe checkout/download endpoints that return paid config payloads. The gap is export execution: current download returns standalone HTML from src/scripts/canvas/export.ts rather than encoded video.

The most reliable Phase 3 plan for this codebase is: keep Stripe flow, add a dedicated export controller, drive an offscreen renderer with manual elapsed time, capture WebM via MediaRecorder from a second canvas, and present progress/fallback UX in EN/PT. The WebCodecs MP4 path should be implemented as a capability-gated enhancement for Chromium where VideoEncoder exists. Because FR-3.10 explicitly calls out mp4-muxer, use an adapter boundary so this requirement is met now while isolating future migration risk (mp4-muxer is deprecated upstream).

**Primary recommendation:** Deliver WebM first as mandatory path (FR-3.1 to FR-3.9, FR-3.11), then add WebCodecs MP4 enhancement (FR-3.10) behind runtime gating, all through a new export controller that never mutates the live preview renderer instance.

## Standard Stack

### Core

| Library/API                                     | Version                     | Purpose                             | Why Standard Here                                             |
| ----------------------------------------------- | --------------------------- | ----------------------------------- | ------------------------------------------------------------- |
| MediaRecorder + HTMLCanvasElement.captureStream | Web platform                | Primary WebM export path            | Native browser APIs, no server, aligned with FR-3.1 and NFR-7 |
| Three.js WebGLRenderer (secondary instance)     | 0.183.2 (repo)              | Offscreen export rendering          | Reuses existing animation code and loop behavior              |
| Stripe Checkout/Session verification            | Existing worker integration | Payment gate before file generation | Meets FR-3.2 with extension-only changes                      |
| WebCodecs VideoEncoder                          | Browser capability-gated    | MP4 enhancement path                | Meets FR-3.10 SHOULD requirement on Chrome/Edge               |

### Supporting

| Library/API | Version                       | Purpose                         | When to Use                                                       |
| ----------- | ----------------------------- | ------------------------------- | ----------------------------------------------------------------- |
| mp4-muxer   | 5.2.2 (published 2025-07-02)  | MP4 muxing for WebCodecs output | Only when VideoEncoder path is selected (FR-3.10)                 |
| mediabunny  | 1.40.1 (published 2026-03-24) | Successor to deprecated muxers  | Keep as migration target note; not required for FR compliance now |

### Alternatives Considered

| Instead of                       | Could Use                  | Tradeoff                                                                  |
| -------------------------------- | -------------------------- | ------------------------------------------------------------------------- |
| MediaRecorder WebM primary       | WebCodecs-only primary     | Better control but lower browser coverage and more complexity             |
| mp4-muxer for FR-3.10            | mediabunny directly        | Better long-term maintenance, but FR text explicitly names mp4-muxer path |
| Reusing live renderer for export | Separate renderer instance | Reuse is simpler but violates FR-3.5 and risks preview disruption         |

**Installation**

npm install mp4-muxer

**Version verification (registry):**

- mp4-muxer: 5.2.2, modified 2025-07-02
- webm-muxer: 5.1.4, modified 2025-07-02 (deprecated)
- mediabunny: 1.40.1, modified 2026-03-24

## Architecture Decisions

### AD-01: Export Is a Dedicated Controller, Not Embedded in main.ts

Create a new export orchestration module and keep main.ts as event wiring + state ownership.

- New file: src/scripts/canvas/export-controller.ts
- Responsibilities: capability detection, renderer instantiation for export, progress events, warm-up delay, encoder selection, blob delivery.
- Why: isolates complexity and keeps lifecycle cleanup under control (NFR-5).

### AD-02: Renderer Accepts Deterministic Time Input

CanvasRenderer must support exportMode and manualElapsed.

- Update src/scripts/canvas/renderer.ts:
  - init options include exportMode boolean
  - update loop can consume supplied elapsed value instead of THREE.Clock.getElapsedTime
  - optional particleBudgetScale for FR-3.11 reduction
- Why: deterministic frame stepping is mandatory for stable export timing and file-size predictability.

### AD-03: Two Rendering Contexts

Maintain live preview and export rendering in separate canvases.

- Live preview remains current canvas element.
- Export canvas is detached or hidden element used only by export controller.
- Export renderer enables preserveDrawingBuffer during capture window.
- Why: directly satisfies FR-3.5.

### AD-04: Keep Existing Stripe Route Contract, Add Export Intent

Do not replace /checkout and /download in worker.

- Continue using workers/company-api/src/index.ts and workers/company-api/src/stripe.ts.
- Add optional metadata field export_type=video to session payload (non-breaking).
- Keep current session_id return flow; after payment, trigger video export rather than immediate HTML file for export_type=video.
- Why: FR-3.2 requires extension of existing Stripe integration.

### AD-05: Capability Gating Before Any Capture

Add explicit API checks before starting export.

- WebM gate: window.MediaRecorder + canvas.captureStream + MediaRecorder.isTypeSupported(...)
- MP4 enhancement gate: window.VideoEncoder + selected container support path
- Unsupported path: show EN/PT guidance to use Chrome/Firefox or fallback HTML export.
- Why: FR-3.9 and NFR-7.

### AD-06: Encoder Adapter Boundary

Implement a small internal interface so MP4 path can be switched later without touching UI or render loop.

- Suggested types file: src/scripts/canvas/export-encoders.ts
- Interface: start, appendFrame, finish, cancel
- Implementations: MediaRecorderWebMEncoder and WebCodecsMp4Encoder
- Why: mp4-muxer is deprecated upstream; adapter limits future migration cost.

## Recommended Project Structure

src/scripts/canvas/

- renderer.ts (extend with export timing + options)
- main.ts (wire export button/modal lifecycle and payment-return branching)
- export.ts (retain HTML export fallback only)
- export-controller.ts (new, orchestration)
- export-encoders.ts (new, encoder adapter + implementations)
- export-support.ts (new, capability detection and format selection)
- quality-profiles.ts (extend for export particle scaling helper)

src/pages/en/canvas/

- index.astro (add export progress/modal placeholders)

src/pages/pt/canvas/

- index.astro (mirror UI changes)

src/i18n/

- en.json (add export modal/progress/fallback strings)
- pt.json (add matching translations)

workers/company-api/src/

- index.ts (optional non-breaking metadata field and response hints)
- stripe.ts (optional metadata persistence for export intent)

tests/

- export-contract.test.mjs (new)
- extend quality-profiles.test.mjs for export reduction logic

e2e/

- canvas-export.spec.ts (new, UX/capability/fallback flow)

## File-Level Recommendations and Dependency Ordering

1. src/scripts/canvas/renderer.ts

- Add init options: exportMode, manualElapsed provider, exportPixelRatio, particleScale.
- Add renderFrame(elapsed, delta) method to enable controller-driven stepping.
- Keep start() for live mode unchanged for backwards compatibility.

2. src/scripts/canvas/quality-profiles.ts

- Add getExportParticleBudget(baseCount): apply 30% reduction in export mode.
- Keep mobile cap behavior after reduction to maintain NFR-9 compatibility.

3. src/scripts/canvas/export-support.ts (new)

- Add detectExportCapabilities() and selectBestExportPath() helpers.
- Centralize MediaRecorder.isTypeSupported matrix and fallback messaging keys.

4. src/scripts/canvas/export-encoders.ts (new)

- Implement MediaRecorder WebM path first (required path).
- Implement WebCodecs + mp4-muxer path second (optional enhancement).
- Ensure VideoFrame.close() in WebCodecs implementation.

5. src/scripts/canvas/export-controller.ts (new)

- Build separate canvas + renderer, apply warm-up 100ms, run frame loop for exactly 360 frames at 30 fps.
- Emit progress frame index for UI updates.
- Return Blob + filename metadata.

6. src/scripts/canvas/main.ts

- Integrate payment return branching and export controller invocation.
- Preserve existing HTML export fallback through export.ts.
- Ensure all new listeners use existing AbortController signal.

7. src/pages/en/canvas/index.astro and src/pages/pt/canvas/index.astro

- Add modal/progress UI region, warning text, fallback message region.
- Keep current processing area if reused, but include explicit frame progress line.

8. src/i18n/en.json and src/i18n/pt.json

- Add keys for export format, unsupported browser guidance, progress frame text, keep-tab-active warning, and completion/error states.

9. tests and e2e

- Add unit contract tests first (fast guardrail), then e2e export UX spec.

## Implementation Waves

### Wave 0: Contract and Scaffolding

- Add export types and capability helper stubs.
- Extend renderer API (no UI behavior change yet).
- Add initial tests asserting new API shape and FR contract constants (1080p, 30 fps, 12s).

Exit criteria:

- Existing tests remain green.
- New contract tests pass.

### Wave 1: Stripe-Gated Flow Extension

- Keep checkout/download endpoints; add optional export intent metadata.
- In main.ts, after paid return, route to video export flow when supported.
- Preserve HTML fallback for unsupported or user-selected path.

Exit criteria:

- Paid flow still works end to end.
- No regression for existing HTML download path.

### Wave 2: WebM Export Core (Mandatory Delivery)

- Implement offscreen renderer + deterministic frame stepping.
- Add warm-up 100ms and progress emission.
- Apply export particle reduction via shared helper.
- Save WebM blob from MediaRecorder chunks.

Exit criteria:

- FR-3.1, FR-3.3, FR-3.4, FR-3.5, FR-3.6, FR-3.7, FR-3.8, FR-3.11 satisfied.

### Wave 3: UX and Browser Fallback Hardening

- Capability gating and clear unsupported-browser message.
- EN/PT copy complete.
- Keep-tab-active warning and error states.

Exit criteria:

- FR-3.9 and NFR-5 satisfied.

### Wave 4: MP4 Enhancement Path

- Add WebCodecs + mp4-muxer encoder implementation with strict resource cleanup.
- Gate only for browsers where path is available.

Exit criteria:

- FR-3.10 satisfied as SHOULD.

### Wave 5: Performance and Size Tuning Gate

- Benchmark speed <= 36s target on 4-core desktop reference.
- Tune bitrate/profile to keep WebM <= 10 MB for default export.

Exit criteria:

- NFR-2 and NFR-3 met with recorded evidence.

## Don’t Hand-Roll

| Problem                       | Don’t Build                  | Use Instead                                       | Why                                      |
| ----------------------------- | ---------------------------- | ------------------------------------------------- | ---------------------------------------- |
| Video container writing       | Custom MP4/WebM binary muxer | MediaRecorder for WebM, mp4-muxer for FR-3.10     | Container correctness is edge-case heavy |
| Codec capability matrix       | Hard-coded UA string checks  | MediaRecorder.isTypeSupported + feature detection | More accurate and maintainable           |
| Payment state machine rewrite | New billing pipeline         | Existing worker checkout/download routes          | FR-3.2 explicitly requires extension     |

**Key insight:** The codebase already has reliable rendering and payment primitives; success depends on deterministic orchestration and capability gating, not inventing new infrastructure.

## Common Pitfalls

### Pitfall 1: Export Uses Live Renderer Instance

- What goes wrong: Preview stutters, dimensions mutate, or animation state diverges.
- Why it happens: Shared clock/canvas/context between interactive and export loops.
- How to avoid: Always instantiate a second renderer/canvas for export.
- Warning signs: UI jank during export and post-export preview artifacts.

### Pitfall 2: Wall-Clock Time During Frame Capture

- What goes wrong: Frame drift and non-deterministic loop seam in output.
- Why it happens: getElapsedTime tied to runtime performance variance.
- How to avoid: manualElapsed increments by 1/30 per captured frame.
- Warning signs: end frame not matching start frame at 12s boundary.

### Pitfall 3: Missing VideoFrame.close in MP4 Path

- What goes wrong: GPU memory growth and eventual encoder stall.
- Why it happens: Unreleased VideoFrame objects.
- How to avoid: close each VideoFrame immediately after encode enqueue.
- Warning signs: increasing memory usage and slowdowns over longer exports.

### Pitfall 4: Missing Capability Gate on Safari/iOS

- What goes wrong: Export button appears to work but produces failure.
- Why it happens: capture/codec APIs unavailable.
- How to avoid: detect support before modal starts and route to fallback message/HTML export.
- Warning signs: immediate NotSupportedError in console.

### Pitfall 5: i18n Drift Between EN/PT

- What goes wrong: untranslated labels in one locale.
- Why it happens: only one locale file updated during rapid UI work.
- How to avoid: update both src/i18n/en.json and src/i18n/pt.json in same commit.
- Warning signs: undefined key text in PT page.

## Risk Mitigations

- Mitigation A: Encoder adapter interface to isolate mp4-muxer deprecation risk.
- Mitigation B: Keep HTML export as explicit fallback when video path unsupported or fails.
- Mitigation C: Add export cancellation and cleanup hooks to avoid leaked RAF/timers/contexts.
- Mitigation D: Add deterministic frame-count assertions in unit tests for 12s x 30fps contract.
- Mitigation E: Add benchmark script/checklist for time and size acceptance before phase close.

## Verification Strategy

### Test Framework

| Property           | Value                                         |
| ------------------ | --------------------------------------------- |
| Framework          | Node built-in test runner + Playwright 1.58.2 |
| Config file        | playwright.config.ts                          |
| Quick run command  | node --test tests/\*.mjs                      |
| Full suite command | npm run test                                  |

### Current Baseline

- node --test tests/\*.mjs currently passes (14/14).

### Phase Requirements to Test Map

| Req ID  | Behavior                                           | Test Type                 | Automated Command                                                         | File Exists? |
| ------- | -------------------------------------------------- | ------------------------- | ------------------------------------------------------------------------- | ------------ |
| FR-3.1  | WebM file produced from canvas export              | integration               | node --test tests/export-contract.test.mjs -t "webm path"                 | No - Wave 0  |
| FR-3.2  | Payment required before export                     | e2e                       | npx playwright test e2e/canvas-export.spec.ts -g "paid export"            | No - Wave 1  |
| FR-3.3  | manualElapsed used in export mode                  | unit                      | node --test tests/export-contract.test.mjs -t "manual elapsed"            | No - Wave 0  |
| FR-3.4  | preserveDrawingBuffer/requestFrame strategy active | unit                      | node --test tests/export-contract.test.mjs -t "drawing buffer"            | No - Wave 2  |
| FR-3.5  | Offscreen renderer leaves preview untouched        | e2e                       | npx playwright test e2e/canvas-export.spec.ts -g "preview remains active" | No - Wave 2  |
| FR-3.6  | 1080p 30fps 12s defaults                           | unit                      | node --test tests/export-contract.test.mjs -t "default settings"          | No - Wave 0  |
| FR-3.7  | 100ms warm-up before recording                     | unit                      | node --test tests/export-contract.test.mjs -t "warm up"                   | No - Wave 2  |
| FR-3.8  | Progress indicator updates during capture          | e2e                       | npx playwright test e2e/canvas-export.spec.ts -g "progress"               | No - Wave 3  |
| FR-3.9  | Unsupported browsers show fallback guidance        | e2e                       | npx playwright test e2e/canvas-export.spec.ts -g "unsupported fallback"   | No - Wave 3  |
| FR-3.10 | MP4 via WebCodecs path when available              | integration               | node --test tests/export-contract.test.mjs -t "webcodecs mp4"             | No - Wave 4  |
| FR-3.11 | Export particle count reduced by 30%               | unit                      | node --test tests/quality-profiles.test.mjs -t "export reduction"         | No - Wave 2  |
| NFR-2   | Export completes <= 36s                            | manual benchmark          | manual timed run script in browser                                        | No - Wave 5  |
| NFR-3   | File <= 10 MB at default settings                  | integration/manual        | capture sample and assert blob size                                       | No - Wave 5  |
| NFR-5   | astro lifecycle + abort cleanup retained           | unit/static + e2e nav     | node --test tests/export-contract.test.mjs -t "abort lifecycle"           | No - Wave 1  |
| NFR-7   | Browser-only encoding path                         | code review + integration | node --test tests/export-contract.test.mjs -t "no server encode"          | No - Wave 0  |

### Sampling Rate

- Per task commit: node --test tests/\*.mjs
- Per wave merge: targeted Playwright specs + node tests
- Phase gate: npm run test + manual performance/size benchmark evidence

### Wave 0 Gaps

- tests/export-contract.test.mjs (new)
- e2e/canvas-export.spec.ts (new)
- Optional: scripts/bench/export-benchmark.md for reproducible NFR-2/NFR-3 measurement notes

## Environment Availability

| Dependency                 | Required By                | Available              | Version           | Fallback                        |
| -------------------------- | -------------------------- | ---------------------- | ----------------- | ------------------------------- |
| Node.js                    | Tests/build tooling        | Yes                    | v22.22.1          | None                            |
| npm                        | Dependency install/scripts | Yes                    | 10.9.4            | None                            |
| Playwright CLI             | E2E verification           | Yes                    | 1.58.2            | None                            |
| Browser MediaRecorder APIs | Runtime export             | Unknown in CLI context | Browser-dependent | Capability gate + HTML fallback |
| Browser WebCodecs APIs     | MP4 enhancement path       | Unknown in CLI context | Browser-dependent | WebM path                       |

**Missing dependencies with no fallback:**

- None identified at repository tooling level.

**Missing dependencies with fallback:**

- WebCodecs runtime support varies by browser; fallback is WebM MediaRecorder export.

## State of the Art

| Old Approach               | Current Approach                                | When Changed        | Impact                                          |
| -------------------------- | ----------------------------------------------- | ------------------- | ----------------------------------------------- |
| HTML file export only      | Browser video export (WebM + optional MP4 path) | Planned for Phase 3 | Paid download becomes direct social-ready asset |
| Time from THREE.Clock only | Deterministic manualElapsed in export mode      | Planned for Phase 3 | Stable loop seam and reproducible output        |
| Single renderer instance   | Dual renderer model (preview + export)          | Planned for Phase 3 | Preview remains interactive during capture      |

**Deprecated/outdated:**

- mp4-muxer and webm-muxer are upstream-deprecated (npm advisory). Keep mp4-muxer only to satisfy FR-3.10 wording now; isolate behind adapter for future migration.

## Open Questions

1. Should paid users receive both HTML and video artifacts or video-only for Phase 3?

- What we know: current paid path returns HTML immediately.
- What is unclear: product expectation for coexistence vs replacement.
- Recommendation: keep HTML fallback and add explicit user choice only if scope allows.

2. Do we need audio track support in this phase?

- What we know: requirements specify animation export only.
- What is unclear: if future roadmap expects soundtrack overlays.
- Recommendation: keep video-only architecture now; adapter can expand later.

3. What exact bitrate profile should be default to guarantee <= 10 MB across devices?

- What we know: target is strict at 1080p/12s.
- What is unclear: browser encoder variance.
- Recommendation: run Wave 5 benchmark matrix and lock conservative default.

## Sources

### Primary (HIGH confidence)

- Repository code: src/scripts/canvas/renderer.ts, src/scripts/canvas/main.ts, src/scripts/canvas/export.ts, workers/company-api/src/index.ts, workers/company-api/src/stripe.ts, src/pages/en/canvas/index.astro, src/pages/pt/canvas/index.astro
- MDN HTMLCanvasElement.captureStream API (last modified 2025-06-23)
- MDN MediaRecorder.isTypeSupported (last modified 2025-05-05)
- W3C MediaStream Recording Editor Draft (2026-03-16)

### Secondary (MEDIUM confidence)

- MDN VideoEncoder page (last modified 2024-05-08)
- npm registry metadata for mp4-muxer, webm-muxer, mediabunny
- mediabunny official docs (quick start and writing media files)

### Tertiary (LOW confidence)

- Legacy Chrome captureStream blog post (2016; useful conceptual notes but outdated support table)

## Metadata

**Confidence breakdown:**

- Standard stack: MEDIUM-HIGH (repo + official web API docs + npm metadata)
- Architecture: HIGH (directly derived from current code structure and FR requirements)
- Pitfalls: MEDIUM-HIGH (spec docs + known browser API behavior)

**Research date:** 2026-04-02
**Valid until:** 2026-05-02 (or earlier if browser support landscape changes significantly)
