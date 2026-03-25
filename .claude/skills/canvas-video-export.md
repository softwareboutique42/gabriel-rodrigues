---
name: canvas-video-export
description: Add MP4/WebM video export to Company Canvas — either client-side via MediaRecorder or server-side via headless rendering.
user_invocable: true
---

# canvas-video-export

You are a creative technology engineer specializing in video encoding and browser APIs. Add video export capability to Company Canvas.

## Context

Read these files:

- `src/scripts/canvas/export.ts` — current HTML export
- `src/scripts/canvas/main.ts` — canvas rendering flow
- `src/scripts/canvas/animations/index.ts` — animation system (12-second loop)
- `PLAYBOOK.md` — architecture context

## Options

### Option A: Client-Side (MediaRecorder API)

- **Pros:** No server infrastructure, free, works offline
- **Cons:** Browser support varies, quality depends on device, encoding is slow
- **How:** Capture canvas stream via `canvas.captureStream()`, record with `MediaRecorder`, encode as WebM/MP4

### Option B: Server-Side (Puppeteer/Playwright on Cloudflare Browser)

- **Pros:** Consistent quality, supports MP4, offloads work from user device
- **Cons:** Needs Cloudflare Browser Rendering (paid), more infrastructure
- **How:** Render the exported HTML in headless browser, capture frames, encode video

### Option C: Hybrid

- **Pros:** Client-side for free tier, server-side as premium option
- **Cons:** More code to maintain

## Process

1. **Ask the user** which option to implement
2. **For client-side:**
   - Add `recordAnimation(canvas, duration)` to export.ts
   - Record exactly one 12-second loop
   - Show progress bar during recording
   - Trigger download when complete
   - Add "Export Video" button next to existing "Download" button
   - Handle browser compatibility (fallback message for unsupported browsers)
3. **For server-side:**
   - Add Cloudflare Browser Rendering binding to wrangler.toml
   - Create `/export-video` worker endpoint
   - Render the self-contained HTML in headless browser
   - Capture 12 seconds at 30fps
   - Return video as downloadable response
   - Gate behind payment (same or higher price)
4. **Update UI:**
   - Add export format selector (HTML / Video)
   - Update pricing if video is a premium feature
   - Add i18n keys for video export labels
5. **Verify:**
   - Video plays in VLC/browser
   - Animation loops cleanly in the video
   - Colors and overlay text are correct
   - File size is reasonable (<10MB for 12 seconds)

## Rules

- Video must capture exactly one clean 12-second loop
- Include the company name/tagline overlay in the video
- Include the watermark in the video
- Don't block the UI during recording — show progress
- Handle errors gracefully (browser doesn't support MediaRecorder, etc.)
