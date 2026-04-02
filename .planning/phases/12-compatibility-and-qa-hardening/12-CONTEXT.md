# Phase 12: Compatibility and QA Hardening - Context

**Gathered:** 2026-04-02
**Status:** Ready for planning
**Source:** /gsd:next -> /gsd:discuss-phase 12

<domain>
## Phase Boundary

Lock route, navigation, and locale behavior introduced in Phases 9-11 through compatibility checks and regression-focused QA coverage.

In scope:

- Add regression coverage for discovery flows from Projects to Canvas and Slots in EN/PT
- Verify language-switch counterpart behavior for `/projects/`, `/canvas/`, and `/slots/`
- Confirm canonical route stability and prevent alias-route drift (`/projects/*` aliases remain out)
- Add compatibility checks that preserve existing behavior across current route IA

Out of scope:

- New product features, copy rewrites, or IA redesign
- Slots gameplay or monetization implementation
- Introducing canonical route changes or new route aliases
- Performance tuning unrelated to compatibility regressions
  </domain>

<decisions>
## Implementation Decisions

### QA strategy shape (COMP-01)

- Phase 12 is a hardening phase, not a feature phase.
- Prioritize deterministic regression contracts plus targeted EN/PT flow checks.
- Expand coverage around already-shipped paths instead of adding new surfaces.

### Discovery flow compatibility coverage

- Validate end-to-end user journey continuity for `Projects -> Canvas` and `Projects -> Slots` in both locales.
- Ensure top-nav and CTA paths continue to land on canonical locale routes.
- Fail-fast checks should highlight route drift before deploy.

### Locale-switch hardening

- Lock counterpart switching for `/projects/`, `/canvas/`, and `/slots/` with EN/PT symmetry checks.
- Keep existing `getLocalizedPath` route-context behavior as the source contract.
- Regression tests must fail when switch behavior falls back to home or mismatched locale routes.

### Canonical route enforcement

- Canonical routes remain:
  - `/en/projects/`, `/pt/projects/`
  - `/en/canvas/`, `/pt/canvas/`
  - `/en/slots/`, `/pt/slots/`
- `/projects/canvas/*` and `/projects/slots/*` aliases remain deferred and must be treated as regression if introduced.

### Deferred Ideas (Backlog)

- Analytics instrumentation for discovery funnel metrics
- Route alias experiments under `/projects/*`
- Cross-browser visual polish unrelated to route/i18n compatibility

### Claude's Discretion

- Exact test layering split between Node contract tests and Playwright E2E, as long as COMP-01 is met
- Test file organization and helper naming conventions
- Additional small guard checks that improve failure diagnostics without expanding scope
  </decisions>

<canonical_refs>

## Canonical References

- .planning/ROADMAP.md
- .planning/REQUIREMENTS.md
- .planning/phases/09-navigation-and-i18n-primitives/09-01-SUMMARY.md
- .planning/phases/10-projects-hub-delivery/10-01-SUMMARY.md
- .planning/phases/11-slots-shell-foundation/11-01-SUMMARY.md
- src/components/Header.astro
- src/components/LanguageSwitcher.astro
- src/i18n/utils.ts
- src/pages/en/projects/index.astro
- src/pages/pt/projects/index.astro
- src/pages/en/canvas/index.astro
- src/pages/pt/canvas/index.astro
- src/pages/en/slots/index.astro
- src/pages/pt/slots/index.astro
- tests/nav-i18n-primitives.test.mjs
- tests/projects-hub-delivery.test.mjs
- tests/slots-shell-foundation.test.mjs
- e2e/navigation.spec.ts
- e2e/i18n.spec.ts
- e2e/canvas.spec.ts
  </canonical_refs>

<specifics>
## Specific Ideas

- Keep Phase 12 outputs centered on regression confidence: focused failing signals and fast local verification loops.
- Prefer explicit path assertions over fuzzy text-only checks for route compatibility.
- Ensure EN/PT path-pair matrices are complete for projects, canvas, and slots.
  </specifics>
