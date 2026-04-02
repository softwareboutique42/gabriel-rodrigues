# Phase 17: Slots Runtime Coverage Hardening - Context

**Gathered:** 2026-04-02
**Status:** Ready for planning
**Source:** /gsd:next -> /gsd:discuss-phase 17

<domain>
## Phase Boundary

Strengthen runtime confidence for the Slots milestone by expanding focused browser coverage around PT gameplay transitions, insufficient-credit behavior, and localized runtime messaging.

In scope:

- Expand Playwright runtime journey coverage on `/pt/slots/` to exercise gameplay transitions, not only post-navigation attributes.
- Add explicit browser assertions for insufficient-credit blocking behavior.
- Assert localized runtime messaging directly in browser flow where stable and practical.
- Keep regression hardening aligned to existing canonical routes and current gameplay behavior.

Out of scope:

- New gameplay capabilities (bonus rounds, new paylines, persistence, monetization).
- Route architecture changes or alias introduction.
- Broad cross-browser matrix expansion beyond the focused hardening objective.
- Visual redesign work unrelated to runtime coverage debt.
  </domain>

<decisions>
## Implementation Decisions

### Runtime hardening target areas

- PT runtime flow must include active spin lifecycle checks (`idle -> spinning -> result|insufficient`), not only static attribute presence.
- Insufficient-credit flow must be exercised in-browser through user-like interaction and verified as blocked.
- Localized runtime messaging assertions should target stable translated phrases and state indicators, avoiding brittle styling-coupled checks.

### Test layering and scope control

- Keep this phase hardening-only: prefer extending `e2e/compatibility.spec.ts` and related focused checks over creating broad new suites.
- Preserve fast contract/E2E separation established in prior phases; runtime hardening here focuses Playwright scenarios.
- Assertions should continue prioritizing machine-readable hooks (`data-slots-*`) and pair with copy checks only where needed for localization confidence.

### Canonical compatibility constraints

- Canonical EN/PT routes remain unchanged for Projects, Canvas, and Slots.
- Alias deny constraints remain enforced; this phase must not add route exceptions.
- Existing deterministic gameplay and economy behavior are treated as baseline contracts and must not be altered.

### Claude's Discretion

- Exact test scenario sequencing and helper extraction inside Playwright specs.
- How to force/construct insufficient-credit browser state using existing controls.
- Exact localized text assertions chosen per locale as long as they are stable and meaningful.
  </decisions>

<specifics>
## Specific Ideas

- Add one EN and one PT runtime spin journey assertion set that proves state progression in-browser.
- Add a deterministic path to reach low-balance or invalid spin condition and assert blocked action semantics.
- Validate at least one runtime-rendered localized status string in both EN and PT after state transition.
  </specifics>

<canonical_refs>

## Canonical References

- `.planning/ROADMAP.md`
- `.planning/REQUIREMENTS.md`
- `.planning/STATE.md`
- `.planning/v1.3-MILESTONE-AUDIT.md`
- `.planning/phases/15-compatibility-and-regression-hardening/15-CONTEXT.md`
- `.planning/phases/15-compatibility-and-regression-hardening/15-01-SUMMARY.md`
- `e2e/compatibility.spec.ts`
- `src/pages/en/slots/index.astro`
- `src/pages/pt/slots/index.astro`
- `src/scripts/slots/controller.ts`
- `src/scripts/slots/economy.ts`
- `src/i18n/en.json`
- `src/i18n/pt.json`
- `tests/slots-economy-contract.test.mjs`
- `tests/slots-interaction-guards-contract.test.mjs`
- `tests/slots-i18n-parity-contract.test.mjs`
  </canonical_refs>

<code_context>

## Existing Code Insights

### Reusable Assets

- `e2e/compatibility.spec.ts`: Existing canonical route and Slots runtime coverage baseline to extend.
- `src/scripts/slots/controller.ts`: Runtime state and outcome attributes surfaced for browser assertions.
- `src/scripts/slots/economy.ts`: Guard logic model for insufficient-credit expectations.

### Established Patterns

- Focused Chromium E2E journey pattern for compatibility hardening.
- Machine-readable assertions (`data-slots-*`) preferred over fragile UI-only checks.
- Canonical route and language counterpart expectations already regression-locked and must stay unchanged.

### Integration Points

- Primary integration point is Playwright journey coverage in `e2e/compatibility.spec.ts`.
- Secondary integration point is locale dictionary-backed runtime text rendered on EN/PT slots pages.
  </code_context>

<deferred>
## Deferred Ideas

- Cross-browser expansion beyond focused Chromium journey coverage.
- Additional gameplay features and richer economics.
- Funnel analytics instrumentation and monetization work.
  </deferred>

---

_Phase: 17-slots-runtime-coverage-hardening_
_Context gathered: 2026-04-02_
