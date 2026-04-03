# Phase 23: Analytics Instrumentation Baseline - Research

**Researched:** 2026-04-03
**Mode:** Autonomous (`/gsd:next` -> `/gsd:plan-phase 23`)

## Objective

Define a deterministic, parity-safe analytics instrumentation baseline for Projects and Slots without mutating gameplay authority.

## Existing Surface Map

- Canonical discovery routes are already stable and covered in compatibility E2E:
  - `/en/projects/`, `/pt/projects/`
  - `/en/slots/`, `/pt/slots/`
- Slots runtime root and machine-readable datasets are exposed via `#slots-shell-root` and `data-slots-*` / `data-slots-anim-*` attributes.
- Slots lifecycle is mounted through `initSlotsShell()` and controller/runtime boundaries in:
  - `src/scripts/slots/main.ts`
  - `src/scripts/slots/controller.ts`
  - `src/scripts/slots/animation/runtime.ts`

## Recommended Instrumentation Pattern

1. Add a presentation-only analytics adapter (`src/scripts/analytics/events.ts`) with a no-op-safe emit API.
2. Emit deterministic, schema-locked events at canonical transitions:
   - Projects CTA clicks (`canvas`, `slots`)
   - Slots spin attempt
   - Slots resolved outcome (`win`/`loss`, payout bucket)
   - Slots blocked spin (`insufficient`)
3. Keep payload categorical and parity-safe:
   - `route`, `locale`, `surface`, `event_name`, `outcome_category`, `blocked_reason`
   - no user identifiers, no free-text payload fields
4. Bridge assertions through machine-readable hooks and compatibility checks (no screenshot assertions).

## Risks and Guardrails

- **Risk:** Locale-specific naming drift in event names/payload keys.
  - **Guardrail:** Shared constants and contract tests for event schema + key set.
- **Risk:** Instrumentation accidentally mutates authority state.
  - **Guardrail:** Emit from existing accepted/resolved/blocked boundaries only; no control-flow branching from analytics.
- **Risk:** Browser checks become copy-fragile.
  - **Guardrail:** Assert stable selectors/data hooks and categorical event snapshots.

## Files Likely Involved in Phase 23

- `src/scripts/analytics/events.ts` (new)
- `src/scripts/slots/controller.ts`
- `src/pages/en/projects/index.astro`
- `src/pages/pt/projects/index.astro`
- `tests/slots-analytics-contract.test.mjs` (new)
- `e2e/compatibility.spec.ts`

## Planning Input Quality Check

- Scope is constrained to deterministic instrumentation and verification gates.
- Canonical EN/PT route parity is explicit.
- No dependency on external analytics vendors for v1.5 baseline.
