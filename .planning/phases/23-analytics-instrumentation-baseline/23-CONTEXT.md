# Phase 23: Analytics Instrumentation Baseline - Context

**Gathered:** 2026-04-03
**Status:** Ready for planning
**Source:** /gsd:next autonomous kickoff

## Assumptions

- Analytics must be parity-safe across EN/PT canonical routes and must not mutate gameplay authority.
- Runtime hooks should remain machine-readable and stable for contract + Playwright assertions.
- Event payloads must avoid PII and use deterministic categorical fields.

## Candidate Scope

- Projects to Slots discovery instrumentation on canonical EN/PT surfaces.
- Slots gameplay lifecycle instrumentation for spin attempt, resolved outcome, and insufficient-credit block.
- Contract and compatibility hook points for analytics event schema stability.

## Risks

- Event naming drift across locales or routes can break parity and analytics joins.
- Instrumentation may accidentally couple to copy strings instead of stable runtime hooks.

## Verification Intent

- Keep assertions timing-agnostic and selector-stable.
- Validate hook stability in both contract and browser compatibility suites.
