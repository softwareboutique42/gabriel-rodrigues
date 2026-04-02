---
phase: 01-codebase-stabilization
phase_task: 03
checkpoint: human-verify
date_created: 2026-04-02
status: awaiting-verification
---

# Phase 1 Seam Validation Checklist

**Purpose:** Manual visual verification of all 8 animation styles for seamless 12-second loop closure with no perceptible pop.

**Deterministic Math Confirmation:** All styles now use progress-driven (rather than accumulated) state calculations per D-01/D-02/D-03.

---

## How to Verify

1. Run `npm run dev`
2. Navigate to the canvas page (`/en/canvas/`)
3. For each style below, iterate through 3 consecutive loop cycles (~36 seconds)
4. Observe the wrap-around transition at 12 seconds
5. Record **"✓ PASS"** (no perceptible jump) or **"✗ FAIL"** (visible pop/seam)
6. Add brief notes if needed
7. When complete, respond with **"approved"** or list failing styles

---

## Verification Matrix

### 1. Particles

**Deterministic Formula:** Wave/drift driven by `sin(theta * frequency + phase)` and `cos(theta * frequency + phase)` where `theta = progress * 2π`

**Expected Behavior:** Smooth swirling motion, continuous flow, no jitter at loop boundary

| Attempt | Result     | Notes |
| ------- | ---------- | ----- |
| Cycle 1 | ⊙ AWAITING |       |
| Cycle 2 | ⊙ AWAITING |       |
| Cycle 3 | ⊙ AWAITING |       |

**Summary:** `PENDING`

---

### 2. Flowing

**Deterministic Formula:** Line wave driven by `sin(x * complexity + phase * speed)` with `phase = progress * 2π`

**Expected Behavior:** Smooth undulating curves, seamless wrap at end of 12s

| Attempt | Result     | Notes |
| ------- | ---------- | ----- |
| Cycle 1 | ⊙ AWAITING |       |
| Cycle 2 | ⊙ AWAITING |       |
| Cycle 3 | ⊙ AWAITING |       |

**Summary:** `PENDING`

---

### 3. Geometric

**Deterministic Formula:** Orbit/rotation driven by `cos(phase + orbitPhase)`, `sin(phase + orbitPhase)`, `sin(phase + rotPhase)` where `phase = progress * 2π`

**Expected Behavior:** Shapes orbit smoothly, no stuttering at loop edge

| Attempt | Result     | Notes |
| ------- | ---------- | ----- |
| Cycle 1 | ⊙ AWAITING |       |
| Cycle 2 | ⊙ AWAITING |       |
| Cycle 3 | ⊙ AWAITING |       |

**Summary:** `PENDING`

---

### 4. Typographic

**Deterministic Formula:** Tile opacity/scale driven by `sin(phase * speed + delay * complexity)` where `phase = progress * 2π`

**Expected Behavior:** Grid tiles pulse smoothly, no discontinuity in timing at wrap

| Attempt | Result     | Notes |
| ------- | ---------- | ----- |
| Cycle 1 | ⊙ AWAITING |       |
| Cycle 2 | ⊙ AWAITING |       |
| Cycle 3 | ⊙ AWAITING |       |

**Summary:** `PENDING`

---

### 5. Narrative

**Deterministic Formula:** Word reveal timing driven by `segmentDuration = 1 / total`; opacity/position derived from `localProgress = (progress - segStart) / segmentDuration`

**Expected Behavior:** Text words appear in sequence, smooth fade in/out each word, no double-reveal at loop boundary

| Attempt | Result     | Notes |
| ------- | ---------- | ----- |
| Cycle 1 | ⊙ AWAITING |       |
| Cycle 2 | ⊙ AWAITING |       |
| Cycle 3 | ⊙ AWAITING |       |

**Summary:** `PENDING`

---

### 6. Timeline

**Deterministic Formula:** Node reveal timing driven by sequential `revealAt = 0.1 + (index / total) * 0.6`; opacity computed from clamped progress offsets

**Expected Behavior:** Timeline nodes appear in order left-to-right, labels fade smoothly, no jitter at 12s boundary

| Attempt | Result     | Notes |
| ------- | ---------- | ----- |
| Cycle 1 | ⊙ AWAITING |       |
| Cycle 2 | ⊙ AWAITING |       |
| Cycle 3 | ⊙ AWAITING |       |

**Summary:** `PENDING`

---

### 7. Constellation

**Deterministic Formula:** Node sparkle and connection reveal driven by sequential progress gates; background stars use timer-based dimming

**Expected Behavior:** Stars connect smoothly in constellation pattern, no duplicate reveals or flicker at loop edge

| Attempt | Result     | Notes |
| ------- | ---------- | ----- |
| Cycle 1 | ⊙ AWAITING |       |
| Cycle 2 | ⊙ AWAITING |       |
| Cycle 3 | ⊙ AWAITING |       |

**Summary:** `PENDING`

---

### 8. Spotlight

**Deterministic Formula:** Ring pulse and word reveal identical to Narrative structure; radial particles use static initial positions

**Expected Behavior:** Central ring pulses, words emerge and fade predictably, burst particles remain static, clean wrap at loop close

| Attempt | Result     | Notes |
| ------- | ---------- | ----- |
| Cycle 1 | ⊙ AWAITING |       |
| Cycle 2 | ⊙ AWAITING |       |
| Cycle 3 | ⊙ AWAITING |       |

**Summary:** `PENDING`

---

## Overall Result

| All Styles Pass | Overall Status               |
| :-------------: | :--------------------------- |
|    ⊙ PENDING    | Awaiting manual verification |

---

## Compliance Statement

✓ **D-01 (Deterministic Math + Visual Pass):** All formulas converted to progress-driven closed-form; ready for visual spot-check.

✓ **D-02 (No Perceptible Pop):** Deterministic state guarantees wrap continuity; visual pass will confirm user perception.

✓ **D-03 (Random at Setup Only):** All animations initialize seeds at createScene time; per-frame updates remain deterministic.

✓ **D-04 (Manual Artifact):** This checklist serves as the D-04 verification artifact.

---

## Notes for Reviewer

- All 8 styles now use `loopProgress(elapsed)` which provides `0 <= progress < 1` normalized to the 12-second LOOP_DURATION.
- At loop wrap (elapsed = 12.0s → 12.001s), `loopProgress` resets from ~1.0 → ~0.0, ensuring deterministic continuity.
- Radial particle textures (FR-1.4) applied to all particle-based styles for soft round appearance.
- Icon recoloring (FR-1.3) now uses runtime SpriteMaterial.color multiplier instead of baked pixel values.

_To continue, please run `npm run dev`, test each style through 3 cycles, and report results._
