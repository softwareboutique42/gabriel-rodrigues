# Phase 7: Export Funnel Conversion Uplift - Context

**Gathered:** 2026-04-02
**Status:** Ready for planning
**Source:** /gsd:next -> /gsd:discuss-phase 7

<domain>
## Phase Boundary

Improve paid export conversion by refining pre-checkout value framing, CTA flow wording, and post-payment success behavior.

In scope:

- Pre-payment value communication in export journey
- CTA copy/flow transitions from generate to checkout to export
- Post-payment confirmation and auto-start behavior

Out of scope:

- New payment providers or billing model redesign
- New export formats beyond current capabilities
- Analytics dashboard implementation
  </domain>

<decisions>
## Implementation Decisions

### Premium value framing before payment

- Keep value framing minimal (no expanded marketing block).
- Do not add a large pre-checkout marketing panel.
- Preserve lightweight UX with concise copy only where needed for confidence.

### CTA copy and flow transitions

- Standardize a single primary path:
  Generate -> Export Options -> Continue to Checkout -> Download
- Avoid dual-path or alternate quick-flow branches in this phase.
- Keep one dominant action at each step to reduce decision friction.

### Post-payment success state

- Show immediate success confirmation and auto-start export.
- Keep status/progress visible while export begins.
- Avoid redirecting to a separate success page.

### Claude's Discretion

- Exact microcopy strings (within EN/PT parity rules)
- Placement and visual treatment of concise trust/value cues
- Specific progress/status wording variants that preserve the chosen flow
  </decisions>

<canonical_refs>

## Canonical References

### Phase and requirement contracts

- .planning/ROADMAP.md — Phase 7 goal, dependencies, and success criteria
- .planning/REQUIREMENTS.md — CONV-01, CONV-02, CONV-03 requirement definitions
- .planning/PROJECT.md — milestone intent and constraints

### Existing funnel/export surfaces

- src/scripts/canvas/main.ts — export modal flow and CTA event wiring
- src/pages/en/canvas/index.astro — EN funnel UI structure and controls
- src/pages/pt/canvas/index.astro — PT funnel UI structure and controls
- src/i18n/en.json — EN copy keys
- src/i18n/pt.json — PT copy keys

### Prior phase dependencies

- .planning/phases/06-vertical-style-pack-foundation/06-01-SUMMARY.md — completed Phase 6 behavior and constraints
  </canonical_refs>

<specifics>
## Specific Ideas

- Use concise value cues close to the checkout CTA instead of introducing long explanatory blocks.
- Keep conversion flow legible with one primary CTA per stage.
- Prioritize immediate user feedback after payment: confirmation first, then visible export progress.
  </specifics>

<deferred>
## Deferred Ideas

- Expanded pre-checkout marketing/comparison section
- Dual CTA funnels in the same flow
- Dedicated success page redirect flow
  </deferred>

---

_Phase: 07-export-funnel-conversion-uplift_
_Context gathered: 2026-04-02 via /gsd:next_
