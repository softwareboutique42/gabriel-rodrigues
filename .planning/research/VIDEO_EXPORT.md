# Research: VIDEO_EXPORT — Browser-side MP4/WebM Capture

**Researched:** 2026-04-02
**Confidence:** MEDIUM — core capture APIs are well-documented; codec availability tables verified via MDN/caniuse; timing strategies verified via W3C spec discussion; file size numbers extrapolated from industry standards and are approximate.

---

## Context: What the Codebase Already Has

The existing `CanvasRenderer` class drives a Three.js `WebGLRenderer` on an `HTMLCanvasElement` via a standard `requestAnimationFrame` loop. The render loop calls `renderer.render(scene, camera)` each frame, which writes pixels directly to the canvas. The export path today generates a standalone HTML file — there is no video capture at all yet.

This is the ideal starting point. The canvas is accessible, Three.js owns it, and the render loop is clean. Video capture can attach to the same canvas without restructuring anything.

---

## Key Findings

### 1. The Native Path: `captureStream()` + `MediaRecorder`

- `HTMLCanvasElement.captureStream(fps)` produces a `MediaStream` from the live canvas. Passing `0` as the fps argument means "I will push frames manually via `track.requestFrame()`"; passing `30` lets the browser sample at up to 30 fps on its own schedule.
- `MediaRecorder` consumes that stream and produces a `Blob` of encoded video chunks.
- This is the lowest-dependency approach: zero libraries, works today in Chrome and Firefox.
- **Output format is always WebM** in Chrome/Firefox. Safari's `MediaRecorder` only accepts `video/mp4;codecs=h264`, not WebM.
- Safari does NOT support `canvas.captureStream()` at all on iOS. Desktop Safari added partial support but it is unreliable in practice.

### 2. Codec Availability by Browser

| Browser            | `captureStream()` | MediaRecorder WebM/VP8 | MediaRecorder WebM/VP9 | MediaRecorder MP4/H.264 |
| ------------------ | ----------------- | ---------------------- | ---------------------- | ----------------------- |
| Chrome 94+         | Yes               | Yes (default)          | Yes                    | No (outputs WebM)       |
| Firefox 133+       | Yes               | Yes                    | Yes                    | No                      |
| Safari 15+ (macOS) | Partial/buggy     | No                     | No                     | Yes (only option)       |
| Safari iOS         | No                | No                     | No                     | No                      |
| Chrome Android     | Yes               | Yes                    | Yes                    | No                      |

**Practical implication:** WebM is the reliable cross-Chromium/Firefox output. Safari desktop can record MP4 but cannot capture canvas. iOS cannot participate in any capture path.

Use `MediaRecorder.isTypeSupported('video/webm;codecs=vp9')` before starting to choose a codec at runtime.

### 3. WebCodecs API: The Modern Alternative

- **WebCodecs** (`VideoEncoder` + a muxer library) is 5-10x faster than real-time and produces true MP4 files.
- Pairs with `mp4-muxer` (pure TypeScript, tiny) for MP4 output, or `webm-muxer` for WebM.
- Pattern: render each frame → call `canvas.toBlob()` or `createImageBitmap()` → wrap in `VideoFrame` → send to `VideoEncoder` → pipe chunks to muxer → finalize file.
- **Browser support as of early 2026:** Chrome 94+, Firefox 133+, Safari 26.1+ (VideoEncoder only recently landed in stable Safari; check `typeof VideoEncoder !== 'undefined'` at runtime).
- Renders faster than real-time because it is not bound to the display refresh rate: you can spin the animation loop at 60 fps artificially even on a slow device.
- This path requires the animation to run in "offline" / "headless" mode (see section 6).

### 4. ffmpeg.wasm

- Downloads ~32 MB WASM binary on first use — a UX dealbreaker for this use case.
- 5-10x slower than native FFmpeg, which is very slow for any video longer than ~15 seconds.
- Only justified if you already have a WebM blob and need to remux it to MP4 without re-encoding (stream copy: near-instant). Even then, the 32 MB download is unreasonable for a portfolio feature.
- **Do not use ffmpeg.wasm as the primary encoding path.** It is a fallback-of-last-resort for Safari.

### 5. CCapture.js and Whammy.js

- CCapture.js has not received meaningful maintenance since 2022; npm issues are unresolved; it uses a modified Whammy.js under the hood. **Do not use.**
- Whammy.js is essentially abandoned and produces low-quality VP8 output with no active maintenance.
- `canvas-record` (dmnsgn) is the actively maintained successor. It wraps MediaRecorder, WebCodecs, and a WASM H264 encoder behind a unified API and handles the frame-by-frame vs real-time modes. It is a reasonable dependency if you want to avoid writing the WebCodecs plumbing yourself.

### 6. Timing and Synchronization

**The core problem:** `MediaRecorder` records wall-clock time. If any frame takes longer than 33 ms to render (at 30 fps), the recording will have stutter/duplicated frames. Three.js WebGL animations with additive blending and particle counts in the hundreds are GPU-bound and will occasionally drop frames.

**Two strategies:**

#### Strategy A — Real-time capture (simpler, lower fidelity)

1. Call `canvas.captureStream(30)`.
2. Create a `MediaRecorder` with `{ mimeType: 'video/webm;codecs=vp9', videoBitsPerSecond: 4_000_000 }`.
3. Start the recorder, let the animation play for N seconds, stop the recorder.
4. Assemble the blob and trigger download.

- Pro: minimal code, no extra dependencies.
- Con: output quality depends entirely on device GPU performance. A slow machine produces stuttery video. The 12-second loop in the V2 animations will record accurately only if the GPU stays above 30 fps throughout.

#### Strategy B — Offline frame-by-frame capture (higher fidelity, requires refactor)

1. Use `canvas.captureStream(0)` so the browser never samples automatically.
2. In the render loop, after each `renderer.render()` call, call `track.requestFrame()` to push the frame to the stream.
3. Or with WebCodecs: drive the animation with a synthetic clock (e.g. increment elapsed by `1/fps` per iteration instead of reading `clock.getElapsedTime()`), render each frame, create a `VideoFrame` from the canvas, encode it.
4. The animation loop becomes a `while` loop (or `setTimeout(0)` loop) rather than `requestAnimationFrame`.

- Pro: deterministic output regardless of GPU speed. 30 fps in = 30 fps out.
- Con: the canvas is "frozen" during export (invisible to user or hidden), and requires the animation clock to be externalizable. The current `CanvasRenderer` uses `THREE.Clock` tied to wall time — this would need a `manualElapsed` parameter.

**Recommendation for this project:** Strategy B (offline) for the WebCodecs path; Strategy A as the fallback for browsers without WebCodecs.

### 7. Recommended UX Pattern

**Pattern used by professional tools (Lottie exporters, Motion Canvas, Animatron):**

1. User clicks "Export Video."
2. A modal/overlay appears: "Generating your video..." with a progress bar (frame N of total).
3. The animation renders offscreen (or in a hidden canvas) at the target duration.
4. Download is triggered automatically when encoding finishes.
5. The live preview canvas continues playing normally during export (use a second offscreen canvas for encoding).

**Anti-pattern to avoid:** Recording in the background while the user watches the preview. This produces output quality that varies with GPU load and makes the UI stutter during recording.

**Duration for marketing assets:** 10–15 seconds is standard for social media loops. The existing V2 animations already have a 12-second `LOOP_DURATION` — that is the right target.

### 8. Practical Export Settings for a Marketing Asset

| Setting    | Recommended Value          | Rationale                                                                                                                        |
| ---------- | -------------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| Resolution | 1920×1080 (1080p)          | Standard for social/LinkedIn/YouTube. Also offer 1080×1080 (square) for Instagram.                                               |
| Frame rate | 30 fps                     | Sufficient for these animation styles. 60 fps doubles file size with minimal perceptible gain for particle/geometric animations. |
| Duration   | 12 s (one loop)            | Matches existing `LOOP_DURATION`. Short loops repeat well on social.                                                             |
| Bitrate    | 4–6 Mbps VP9 WebM          | Results in ~6–9 MB for a 12-second clip. VP9 at 4 Mbps is visually lossless for flat-color animations.                           |
| File size  | ~5–10 MB for WebM          | Acceptable for a download asset. Not a streaming file.                                                                           |
| Container  | WebM primary, MP4 fallback | WebM from MediaRecorder/WebCodecs. MP4 only if Safari support is added later.                                                    |

For reference: a 12-second 1080p clip at 4 Mbps VP9 = ~6 MB.

---

## Recommended Approach for This Project

**Tier 1 (primary path — Chrome, Firefox, Chrome Android):**

Use `canvas.captureStream(0)` + `MediaRecorder` with manual `requestFrame()` calls. This is pure browser APIs, zero dependencies, and produces consistent 30 fps output regardless of GPU speed because the animation clock is advanced synthetically.

Steps:

1. Add an `exportMode: boolean` flag to `CanvasRenderer`. When true, replace `clock.getElapsedTime()` with a counter incremented by `1/30` each tick.
2. Replace the `requestAnimationFrame` loop with a `setTimeout(fn, 0)` loop during export to avoid vsync throttling.
3. Call `canvas.captureStream(0)`, start `MediaRecorder`.
4. Each iteration: render → `track.requestFrame()` → increment counter.
5. After `12 * 30 = 360` frames: stop recorder → assemble blob → `URL.createObjectURL` → trigger `<a download>`.

**Tier 2 (WebCodecs upgrade — same browsers + newer Safari):**

Replace the MediaRecorder step with `VideoEncoder` + `mp4-muxer`. Same synthetic clock loop. Produces a true MP4 file. Add a runtime check: `if ('VideoEncoder' in window)` use this path, otherwise fall back to Tier 1.

**Safari / iOS:**

No reliable video export is possible. Show a fallback message: "Video export is not supported in Safari. Use Chrome or Firefox, or download the animated HTML file." The HTML export already works everywhere.

---

## Risks and Pitfalls to Avoid

### Critical

- **Do not use `clock.getElapsedTime()` during export.** The wall clock advances while frames are being encoded, so later frames will have wrong elapsed values. The synthetic counter is mandatory.
- **Do not use `requestAnimationFrame` during export.** Browsers throttle rAF to display refresh rate and will fire at 60 fps max (often lower in background tabs). Use a plain `while` loop or `Promise`-chained `setTimeout(0)` calls instead.
- **`preserveDrawingBuffer: true` is required** on the Three.js WebGLRenderer if you call `canvas.toDataURL()` or `createImageBitmap()`. Without it, the WebGL back buffer is cleared after each `render()` call and you get blank frames. The current renderer does not set this flag — it must be added for the export path. Alternatively, call `requestFrame()` synchronously inside the render callback before the buffer clears; this avoids the flag but is timing-sensitive.
- **iOS Safari has no captureStream support.** Do not ship a broken export button that silently produces empty files. Gate the feature with a capability check and surface a clear message.

### Moderate

- **Memory: accumulating Blob chunks.** `MediaRecorder` fires `ondataavailable` events with chunks. Push these into an array and assemble at the end with `new Blob(chunks, { type: mimeType })`. Do not try to write to disk chunk-by-chunk in browser.
- **Tab visibility.** If the user switches tabs during export, `setTimeout(0)` will be throttled in some browsers. Show a warning: "Keep this tab active during export."
- **WebCodecs `VideoFrame` must be closed.** Each `VideoFrame` object holds a reference to the canvas pixel data. Call `frame.close()` after encoding it or you will leak GPU memory and the encoder will stall after ~50 frames.
- **Large canvas + high DPR.** At `devicePixelRatio: 2`, a 1080p canvas is actually 2160×2160 pixels internally. For export, force `renderer.setPixelRatio(1)` and `renderer.setSize(1920, 1080)` to get exactly 1080p output without 4K overhead.

### Minor

- **VP9 encode time** on a mid-range laptop at 1080p/30fps is roughly 0.5–1x real-time in software (i.e., a 12-second clip takes 6–12 seconds to encode). Show a progress indicator.
- **`mp4-muxer` AVC size limit.** The library has a maximum frame size of ~9.4 MP (fine for 1080p which is 2.07 MP). Not a concern at these resolutions.
- **`isTypeSupported` must be called before creating the MediaRecorder.** Not all browsers support `video/webm;codecs=vp9`. Fall back to `video/webm;codecs=vp8` or plain `video/webm`.

---

## Browser Compatibility Summary

| Feature                         | Chrome 94+ | Firefox 133+ | Safari 15+ (macOS) | iOS Safari   |
| ------------------------------- | ---------- | ------------ | ------------------ | ------------ |
| `canvas.captureStream()`        | Yes        | Yes          | Partial (buggy)    | No           |
| `MediaRecorder` WebM/VP9        | Yes        | Yes          | No                 | No           |
| `MediaRecorder` MP4/H.264       | No         | No           | Yes                | No           |
| `VideoEncoder` (WebCodecs)      | Yes        | Yes          | Yes (v26.1+)       | Yes (v26.1+) |
| MP4 via WebCodecs + mp4-muxer   | Yes        | Yes          | Yes (v26.1+)       | Yes (v26.1+) |
| WebM via WebCodecs + webm-muxer | Yes        | Yes          | No                 | No           |

**Effective coverage with Tier 1 (WebM MediaRecorder):** Chrome + Firefox = ~65–70% of desktop users. Chrome Android adds mobile coverage.

**Effective coverage with Tier 2 (WebCodecs MP4):** All Chromium + Firefox + Safari 26.1+ on both desktop and iOS.

Note: Safari 26.1 is a future version (as of research date). The WebCodecs VideoEncoder support was confirmed shipping in Safari Technology Preview; stable release timing is uncertain. The gate `typeof VideoEncoder !== 'undefined'` will handle this gracefully at runtime.

---

## Sources

- [MDN: MediaStream Recording API](https://developer.mozilla.org/en-US/docs/Web/API/MediaStream_Recording_API)
- [MDN: MediaRecorder.isTypeSupported()](https://developer.mozilla.org/en-US/docs/Web/API/MediaRecorder/isTypeSupported_static)
- [Chrome Developers: Capture a MediaStream from canvas](https://developer.chrome.com/blog/capture-stream)
- [Can I use: MediaRecorder API](https://caniuse.com/mediarecorder)
- [Can I use: WebCodecs API](https://caniuse.com/webcodecs)
- [Can I use: Media Capture from DOM Elements (captureStream)](https://caniuse.com/mediacapture-fromelement)
- [devtails.xyz: Save HTML Canvas to MP4 via WebCodecs (10x faster than real-time)](https://devtails.xyz/adam/how-to-save-html-canvas-to-mp4-using-web-codecs-api)
- [devtails.xyz: Record HTML Canvas with MediaRecorder](https://devtails.xyz/@adam/how-to-record-html-canvas-using-mediarecorder-and-export-as-video)
- [Theodo: Saving Canvas Animations with MediaRecorder](https://blog.theodo.com/2023/03/saving-canvas-animations/)
- [npm: mp4-muxer](https://www.npmjs.com/package/mp4-muxer)
- [npm: webm-muxer](https://www.npmjs.com/package/webm-muxer)
- [GitHub: canvas-record (dmnsgn)](https://github.com/dmnsgn/canvas-record)
- [GitHub: spite/ccapture.js — maintenance status](https://github.com/spite/ccapture.js/issues)
- [W3C mediacapture-record issue: non-realtime frame-by-frame recording](https://github.com/w3c/mediacapture-record/issues/213)
- [WebKit Bug 181663: canvas.captureStream on iOS](https://bugs.webkit.org/show_bug.cgi?id=181663)
- [media-codings.com: Cross-browser compatible media recording](https://media-codings.com/articles/recording-cross-browser-compatible-media)
- [xjavascript.com: Save Canvas as MP4 with WebM workaround](https://www.xjavascript.com/blog/save-canvas-data-as-mp4-javascript/)
- [WebCodecs + webm-muxer + Three.js: Rendering Videos in Browser](https://dev.to/rendley/rendering-videos-in-the-browser-using-webcodecs-api-328n)
