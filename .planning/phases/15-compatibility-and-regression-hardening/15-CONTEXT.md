# Phase 15: Compatibility and Regression Hardening - Context

**Gathered:** 2026-04-02
**Status:** Ready for planning
**Source:** /gsd:next -> /gsd:discuss-phase 15

<domain>
## Phase Boundary

Lock Slots gameplay, route compatibility, and i18n behavior with focused regression coverage after Phases 13-14 feature delivery.

In scope:

- Add compatibility/regression contract coverage for gameplay determinism, payout and balance invariants (COMP-10, QA-10)
- Add focused EN/PT runtime journey checks for Slots discovery and gameplay interaction states
- Verify canonical route stability across `/projects/`, `/canvas/`, and `/slots/` after economy integration
- Ensure language-switch counterpart behavior remains correct for updated slots surfaces

Out of scope:

- New gameplay features (new paylines, bonus rounds, persistence)
- Real-money wagering or payments expansion
- IA redesign, route alias introduction, or navigation architecture changes
- Broad visual redesign/polish work unrelated to compatibility and regression hardening
  </domain>

<decisions>
## Implementation Decisions

### Two-layer regression gate (COMP-10, QA-10)

- Keep fast deterministic contract tests as first gate for logic invariants.
- Add focused Playwright E2E journeys as second gate for runtime route/i18n and interaction behavior.
- Validation order should be fail-fast: contracts first, E2E second, build last.

### Gameplay hardening expectations

- Preserve Phase 13 deterministic engine contracts and Phase 14 economy arithmetic invariants.
- Regression suite must catch incorrect balance mutations, invalid action leakage, and i18n key drift.
- Slots runtime assertions should be based on machine-readable attributes where possible (`data-slots-*`) instead of fragile UI text only.

### Canonical route and locale constraints

- Canonical routes remain unchanged:
  - `/en/projects/`, `/pt/projects/`
  - `/en/canvas/`, `/pt/canvas/`
  - `/en/slots/`, `/pt/slots/`
- Alias route deny-list remains enforced (`/projects/slots/*` and `/projects/canvas/*`).
- Language switch counterpart behavior must remain stable on all three surfaces.

### Scope control

- Phase 15 is hardening-only; do not ship new product capabilities.
- If gaps are found, patch within existing behavior contracts rather than expanding feature scope.

### Claude's Discretion

- Exact split of checks between node:test and Playwright, provided COMP-10 and QA-10 are fully covered.
- Test file naming and helper extraction style.
- Additional low-cost guard assertions that improve failure diagnosis without changing product behavior.
  </decisions>

<specifics>
## Specific Ideas

- Reuse the phase-12 compatibility test patterns and extend them to include updated slots economy UI states.
- Add one deterministic replay check for slots balance progression under repeated rounds.
- Keep E2E scoped to Chromium-focused journeys to reduce noise while still covering compatibility risks.
  </specifics>

<canonical_refs>

## Canonical References

- `.planning/ROADMAP.md`
- `.planning/REQUIREMENTS.md`
- `.planning/PROJECT.md`
- `.planning/phases/12-compatibility-and-qa-hardening/12-CONTEXT.md`
- `.planning/phases/12-compatibility-and-qa-hardening/12-01-SUMMARY.md`
- `.planning/phases/13-slots-core-gameplay-loop/13-01-SUMMARY.md`
- `.planning/phases/14-economy-ux-and-i18n-parity/14-01-SUMMARY.md`
- `src/components/Header.astro`
- `src/components/LanguageSwitcher.astro`
- `src/i18n/utils.ts`
- `src/pages/en/projects/index.astro`
- `src/pages/pt/projects/index.astro`
- `src/pages/en/slots/index.astro`
- `src/pages/pt/slots/index.astro`
- `src/scripts/slots/controller.ts`
- `src/scripts/slots/economy.ts`
- `tests/compatibility-contract.test.mjs`
- `tests/slots-core-determinism-contract.test.mjs`
- `tests/slots-payline-evaluation-contract.test.mjs`
- `tests/slots-economy-contract.test.mjs`
- `tests/slots-interaction-guards-contract.test.mjs`
- `tests/slots-i18n-parity-contract.test.mjs`
- `e2e/compatibility.spec.ts`
  </canonical_refs>

<code_context>

## Existing Code Insights

### Reusable Assets

- `tests/compatibility-contract.test.mjs`: phase-12 compatibility baseline for route and switch invariants.
- `e2e/compatibility.spec.ts`: established EN/PT journey and alias-deny E2E pattern.
- `src/scripts/slots/economy.ts`: pure economy guards useful for deterministic replay assertions.

### Established Patterns

- Contract-first approach with node:test before Playwright execution.
- EN/PT parity and canonical routing enforced by explicit deny-list and counterpart checks.
- SPA-safe script lifecycle (`astro:page-load` + `AbortController`) must remain untouched.

### Integration Points

- Phase 15 should extend compatibility tests to include Phase 14 gameplay/economy state attributes.
- Language switch coverage should include `/en|pt/slots/` while in updated gameplay shell.
- Hardening phase should update only tests and minimal fixes triggered by failing regression gates.
  </code_context>

<deferred>
## Deferred Ideas

- Cross-browser matrix expansion beyond current focused targets
- Performance optimization and chunking follow-up
- Gameplay feature expansion (bonus mechanics, multi-line complexity)
- Analytics instrumentation for gameplay funnel
  </deferred>

---

_Phase: 15-compatibility-and-regression-hardening_
_Context gathered: 2026-04-02_
