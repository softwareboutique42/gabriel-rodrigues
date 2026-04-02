---
phase: 7
type: research
date: 2026-04-02
requirements_covered:
  - CONV-01
  - CONV-02
  - CONV-03
---

## Current State

Phase 7 is scoped to conversion uplift in the existing paid export flow, not payment architecture changes. The current implementation already has a full path from result canvas to checkout and back:

- Generate result state in `src/scripts/canvas/main.ts` and expose export CTA (`#canvas-download`)
- Open export options modal (`#canvas-export-modal`) with format/ratio/quality choices
- Continue to Stripe checkout via `POST /checkout` and redirect
- Return with `session_id`, call `GET /download`, then auto-run browser export
- Show processing/progress/success/fallback/error status in `#canvas-download-processing`

Current copy and structure are functional but conversion-focused framing is thin:

- Primary paid CTA label is currently `Download $1` (EN/PT)
- Export modal subtitle is configuration-focused, not outcome-focused
- Value framing (what user receives and in which format) is implicit, not explicit before payment
- Post-payment success exists in status messaging, but confirmation-first wording can be clearer before frame-progress starts

Constraints from repository guidance and phase context:

- Keep Astro + existing client script structure (no new frameworks or dependencies)
- Keep SPA-safe event lifecycle (`astro:page-load`, `AbortController`) unchanged
- Maintain EN/PT parity for all user-facing text
- Keep a single dominant CTA path: Generate -> Export Options -> Continue to Checkout -> Download
- Do not add large marketing blocks, dual-path funnel variants, or a dedicated success page

## Implementation Strategy

Implement conversion uplift as a targeted copy-and-state refinement in existing surfaces.

1. CONV-01: Add concise premium value framing before payment

- Add a short, high-signal value cue near export modal header/subtitle and/or just above modal confirm CTA
- Focus cue on deliverable clarity: branded animation video, selected format/ratio/quality, immediate download after payment
- Keep framing compact (1-2 lines) to match the phase decision to avoid a large marketing panel

2. CONV-02: Reduce friction through clearer CTA labels and stage transitions in EN/PT

- Keep one primary action per stage and tighten wording for intent:
  - Result stage CTA: from price-only emphasis toward action + value clarity
  - Modal confirm CTA: preserve checkout intent and remove ambiguity
- Standardize transition labels/status copy so user always knows the next step
- Ensure EN/PT keys are updated in lockstep and bound via existing data attributes in download processing container

3. CONV-03: Clarify post-payment success and immediate next action

- On `session_id` return, set confirmation-first status before export progress starts (e.g., payment confirmed -> preparing export)
- Maintain visible progress once export begins; keep fallback/unsupported/error explicit
- Preserve auto-start export behavior already implemented in `handlePaymentReturn`

Implementation principle: copy-first conversion uplift with minimal DOM/state change, no backend contract changes, and no new dependencies.

## File-Level Changes

Primary files to update:

- `src/scripts/canvas/main.ts`
  - Refine checkout initiation status text sequencing in `handleDownload`
  - Refine post-payment confirmation/progress sequencing in `handlePaymentReturn`
  - Keep existing modal open/close and checkout request mechanics

- `src/pages/en/canvas/index.astro`
  - Add concise value-framing UI text in export modal near title/subtitle or CTA region
  - Ensure attributes needed by JS status mapping are present for any new status keys

- `src/pages/pt/canvas/index.astro`
  - Mirror EN structure exactly for parity

- `src/i18n/en.json`
  - Update/add conversion-focused strings for:
    - pre-payment value cue
    - clarified CTA labels
    - payment-confirmed/preparing/exporting progression

- `src/i18n/pt.json`
  - Add exact PT equivalents for every EN key introduced/changed

Secondary verification surface:

- `e2e/canvas-export.spec.ts`
  - Extend assertions for new status text progression and visible confirmation step
  - Keep current mocked capability approach (no new test infra)

No changes expected to:

- `src/scripts/canvas/export-controller.ts`
- `src/scripts/canvas/export-support.ts`

These already provide capability detection and export execution needed for Phase 7.

## Risk Mitigations

1. EN/PT drift risk

- Mitigation: every changed EN key must have a PT counterpart in same commit
- Verification: run locale coverage checks and manually compare modal/status flow in both routes

2. Conversion copy introducing ambiguity

- Mitigation: maintain one dominant CTA per stage and avoid introducing alternate branches
- Verification: click path test from generate to checkout remains linear

3. Regression in existing export behavior

- Mitigation: keep API contracts (`/checkout`, `/download`) and export engine calls unchanged
- Verification: existing e2e export tests continue passing for supported and unsupported environments

4. Over-scoping into redesign

- Mitigation: constrain UI edits to microcopy and minimal placement adjustments in existing modal/processing panel
- Verification: no new pages, no new components requiring extra dependencies, no payment provider logic changes

## Validation Plan

Automated checks:

- `npm run lint`
- `npm run test -- e2e/canvas-export.spec.ts`
- `npm run test -- e2e/i18n.spec.ts`

Manual verification (EN and PT):

- `/en/canvas/` and `/pt/canvas/`
- Confirm pre-payment value framing is visible before checkout
- Confirm primary CTA wording is clear and sequential at each step
- Complete payment-return simulation with `?session_id=...`:
  - confirmation appears immediately
  - export progress appears next
  - success/fallback/error messages remain explicit

Requirement-to-validation mapping:

- CONV-01: pre-payment value framing visible in export journey (EN/PT)
- CONV-02: simplified, unambiguous primary CTA labels and transitions (EN/PT)
- CONV-03: post-payment state confirms success and next action before/while export starts

## Acceptance Criteria

- Pre-payment export flow clearly communicates premium value and expected deliverable format before checkout (CONV-01)
- CTA and transition copy is simplified to one dominant action per stage, with EN/PT parity (CONV-02)
- Return from checkout immediately shows confirmation and then visible export progress/next action without redirecting away (CONV-03)
- Existing browser export behavior (supported, fallback, unsupported) remains intact
- No new dependencies, no billing/provider redesign, no scope expansion beyond Phase 7 boundary

## Open Questions

1. Price mention strategy in CTA

- Keep explicit `$1` in primary CTA for transparency, or move price into supporting microcopy while CTA emphasizes action?

2. Confirmation phrasing order

- Should post-payment first message emphasize payment confirmation or export initialization, given both happen quickly?

3. PT localization tone

- Prefer more direct imperative copy or slightly descriptive wording for checkout transition while preserving concise style?
