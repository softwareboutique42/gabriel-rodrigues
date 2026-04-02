---
phase: 03-video-export
type: benchmark-evidence
status: pending-human-verification
updated: 2026-04-02
default_profile:
  width: 1920
  height: 1080
  fps: 30
  duration_seconds: 12
  target_total_frames: 360
requirements:
  - NFR-2
  - NFR-3
---

# Phase 3 Benchmark Evidence

Status: pending human verification

## Automated Preconditions

- node --test tests/export-contract.test.mjs: pass (14/14)
- npx playwright test e2e/canvas-export.spec.ts --project=chromium: pass (2/2)
- npm run lint: pass with one pre-existing warning in .claude tooling file

## Benchmark Runs (Manual)

Use paid-return flow on /en/canvas/ with default export settings and record 3 runs.

| Run | Export Time (s) | File Size (MB) | Browser Video Playback | External Player Playback | Notes |
| --- | --------------- | -------------- | ---------------------- | ------------------------ | ----- |
| 1   | PENDING         | PENDING        | PENDING                | PENDING                  |       |
| 2   | PENDING         | PENDING        | PENDING                | PENDING                  |       |
| 3   | PENDING         | PENDING        | PENDING                | PENDING                  |       |

## Requirement Evaluation

- NFR-2 (<=36s export): PENDING
- NFR-3 (<=10MB default WebM): PENDING
- FR-3.1 browser-produced export artifact: PENDING
- FR-3.5 preview continuity during offscreen export: PENDING

## Manual Verification Steps

1. Run npm run dev.
2. Open /en/canvas/ in Chromium.
3. Complete paid return flow using test payment setup.
4. Export 3 times with default profile.
5. Record elapsed time and output size for each run.
6. Confirm playback in browser video element.
7. Confirm playback in VLC or QuickTime.
8. Update table and mark pass/fail results above.

## Sign-off

- Reviewer: PENDING
- Date: PENDING
- Decision: PENDING
- Follow-up actions: PENDING
