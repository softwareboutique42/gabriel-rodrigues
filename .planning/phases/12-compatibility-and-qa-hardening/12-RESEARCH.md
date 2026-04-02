# Phase 12: Compatibility and QA Hardening - Research

Researched: 2026-04-02
Domain: Regression coverage and compatibility hardening for route IA and locale switching
Confidence: HIGH

## User Constraints (from CONTEXT.md)

### Locked Decisions

- Phase 12 is a hardening phase, not a feature phase.
- Prioritize deterministic regression contracts plus targeted EN/PT flow checks.
- Expand coverage around already-shipped paths instead of adding new surfaces.
- Validate end-to-end user journey continuity for Projects -> Canvas and Projects -> Slots in both locales.
- Ensure top-nav and CTA paths continue to land on canonical locale routes.
- Fail-fast checks should highlight route drift before deploy.
- Lock counterpart switching for /projects/, /canvas/, and /slots/ with EN/PT symmetry checks.
- Keep existing getLocalizedPath route-context behavior as the source contract.
- Regression tests must fail when switch behavior falls back to home or mismatched locale routes.
- Canonical routes remain:
  - /en/projects/, /pt/projects/
  - /en/canvas/, /pt/canvas/
  - /en/slots/, /pt/slots/
- /projects/canvas/_ and /projects/slots/_ aliases remain deferred and must be treated as regression if introduced.

### Claude's Discretion

- Exact test layering split between Node contract tests and Playwright E2E, as long as COMP-01 is met
- Test file organization and helper naming conventions
- Additional small guard checks that improve failure diagnostics without expanding scope

### Deferred Ideas (OUT OF SCOPE)

- Analytics instrumentation for discovery funnel metrics
- Route alias experiments under /projects/\*
- Cross-browser visual polish unrelated to route/i18n compatibility

## Phase Requirements

| ID      | Description                                                                                                                            | Research Support                                                                                                                           |
| ------- | -------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| COMP-01 | Navigation and route changes are regression-locked by E2E coverage for discovery flow (Projects -> Canvas/Slots) and locale switching. | Add layered contract + E2E checks for canonical route targets, language counterpart mapping, and user-visible discovery journeys in EN/PT. |

## Project Constraints (from CLAUDE.md)

- Astro 6 static site with bilingual file-based routes under src/pages/en and src/pages/pt.
- No dynamic [lang] route model.
- Routing/i18n helpers are in src/i18n/utils.ts and should remain source of route-localization behavior.
- Playwright is the E2E framework and runs through npm run test.
- Validation commands available: npm run build, npm run test, node --test for contract suites.
- Node.js minimum is >= 22.12.0 (current environment: 22.22.1).

## Summary

Current coverage is strong for source-level contracts from Phases 9-11, but COMP-01 is not yet fully locked at runtime. Existing node:test files verify static route/link strings and i18n key parity, while existing Playwright coverage is mostly home, resume, blog, and deep canvas behaviors. The missing layer is explicit E2E regression around Projects as the discovery hub and locale counterpart behavior on /projects, /canvas, and /slots.

The implementation strategy for Phase 12 should preserve the current IA and harden only compatibility behavior: keep canonical routes unchanged, add fail-fast tests against alias-route drift, and ensure language switching never falls back to home or wrong locale path for the three critical surfaces.

Primary recommendation: Introduce a two-layer validation model where node:test contracts lock route invariants quickly and a focused Playwright compatibility suite verifies user journeys in EN/PT with strict URL assertions.

## Standard Stack

### Core

| Library              | Version                                                       | Purpose                                   | Why Standard                                                            |
| -------------------- | ------------------------------------------------------------- | ----------------------------------------- | ----------------------------------------------------------------------- |
| node:test (built-in) | Node 22.22.1                                                  | Fast contract checks on source invariants | Already used by Phase 9-11 tests, deterministic and sub-second feedback |
| @playwright/test     | Repo: 1.58.2, Registry latest: 1.59.1 (modified 2026-04-02)   | Runtime browser regression coverage       | Existing E2E baseline and best fit for route/language journey checks    |
| astro preview server | Repo astro 6.0.8, Registry latest 6.1.3 (modified 2026-04-01) | Production-like runtime for E2E           | Matches current Playwright webServer strategy                           |

### Supporting

| Library                              | Version      | Purpose                            | When to Use                                  |
| ------------------------------------ | ------------ | ---------------------------------- | -------------------------------------------- |
| Existing helper in src/i18n/utils.ts | Current repo | Counterpart route mapping contract | Contract tests for getLocalizedPath symmetry |

### Alternatives Considered

| Instead of                                  | Could Use                      | Tradeoff                                                                             |
| ------------------------------------------- | ------------------------------ | ------------------------------------------------------------------------------------ |
| Playwright compatibility flows              | More node:test-only assertions | Faster but misses runtime navigation/switch behavior required by COMP-01             |
| New feature tests under canvas.spec.ts only | Dedicated compatibility suite  | Dedicated suite improves signal and avoids coupling with API/mock-heavy canvas tests |

Installation: none required for this phase; use existing dependencies.

## Gaps Versus COMP-01

1. Discovery flow E2E gap

- Current E2E does not verify Projects -> Canvas and Projects -> Slots user flow in EN/PT via top-nav and page CTAs.

2. Locale-switch E2E gap on Phase 10/11 routes

- Current i18n E2E verifies home, resume, blog.
- It does not lock counterpart switching behavior for /projects/, /canvas/, and /slots/.

3. Canonical route drift prevention gap

- Current node:test checks prevent alias links in projects pages, but there is no runtime guard asserting that navigation never resolves to /projects/canvas/_ or /projects/slots/_.

4. Regression signal quality gap

- Existing contract tests are file-content based; they can pass while runtime behavior regresses due to rendering/navigation changes.

## Architecture Patterns

### Recommended Project Structure for Phase 12

- tests/
  - compatibility-contract.test.mjs (new)
- e2e/
  - compatibility.spec.ts (new)

Optional alternative if minimizing new files:

- extend tests/projects-hub-delivery.test.mjs
- extend e2e/i18n.spec.ts and e2e/navigation.spec.ts

### Pattern 1: Contract Lock for Canonical Routing

What: Use node:test to enforce canonical route model and language counterpart mapping logic.
When to use: Fast local checks and CI pre-E2E gate.

Assertions to include:

- getLocalizedPath maps /en/projects/ <-> /pt/projects/, /en/canvas/ <-> /pt/canvas/, /en/slots/ <-> /pt/slots/.
- Header projects entry exists and points to locale canonical projects route.
- Projects and slots page CTAs point only to canonical locale routes.
- Forbidden aliases are absent: /en/projects/canvas/, /pt/projects/canvas/, /en/projects/slots/, /pt/projects/slots/.

### Pattern 2: Focused E2E Compatibility Journeys

What: Use Playwright to lock runtime navigation + switcher behavior with strict URL assertions.
When to use: Confidence for deploy gate and COMP-01 acceptance.

Journey matrix:

- EN: /en/projects/ -> Canvas CTA -> /en/canvas/
- EN: /en/projects/ -> Slots CTA -> /en/slots/
- PT: /pt/projects/ -> Canvas CTA -> /pt/canvas/
- PT: /pt/projects/ -> Slots CTA -> /pt/slots/
- Switch EN/PT counterparts on /projects/, /canvas/, /slots/ and assert exact counterpart URL.

### Anti-Patterns to Avoid

- Testing by translated visible text only for navigation assertions.
- Adding alias routes to make tests pass.
- Expanding into gameplay/monetization assertions outside compatibility scope.

## Recommended Contract + E2E Layering

Layer 1: Contract (fast, deterministic, fail-fast)

- Scope: route invariants, counterpart mapping, no-alias policy.
- Runtime target: Node only.
- Expected duration: very fast.

Layer 2: E2E Compatibility (runtime confidence)

- Scope: discovery journeys and switcher behavior in browser for EN/PT.
- Runtime target: Playwright with built site.
- Expected duration: moderate; run on each merge and release gate.

Layer 3: Existing Canvas deep behavior suite (already present)

- Keep as-is; do not merge compatibility checks into API/mock-heavy canvas test cases.

## Concrete File Touch Points for Test Additions

1. Add tests/compatibility-contract.test.mjs

- Add canonical route matrix assertions and alias forbiddance checks.

2. Add e2e/compatibility.spec.ts

- Add Projects discovery path checks in EN/PT.
- Add language switch counterpart checks for /projects/, /canvas/, /slots/.

3. Optional refinement in existing suites

- e2e/i18n.spec.ts: keep home/resume/blog checks; optionally delegate route-surface checks to compatibility.spec.ts only.
- tests/projects-hub-delivery.test.mjs: keep phase-specific contracts; do not overload with all COMP-01 logic.

4. No production IA file changes required for Phase 12

- src/components/Header.astro
- src/components/LanguageSwitcher.astro
- src/i18n/utils.ts
- src/pages/en/projects/index.astro
- src/pages/pt/projects/index.astro
- src/pages/en/slots/index.astro
- src/pages/pt/slots/index.astro

## Risk Controls for Route Alias and Locale-Switch Regressions

1. Route alias deny-list contract

- Explicit negative assertions against /projects/canvas/_ and /projects/slots/_ path generation in source-level route targets.

2. Strict URL assertions in E2E

- Use exact expected path checks for counterpart routes, not regexes that can hide fallbacks.

3. Counterpart matrix test helper

- Centralize matrix entries for six key pairs to avoid missing any locale surface.

4. Two-phase CI gate

- Run contract suite first for quick fail.
- Run compatibility E2E second for runtime validation.

5. Preserve canonical model as invariant

- Any PR introducing /projects/\* aliases for canvas/slots should fail COMP-01 tests.

## Don't Hand-Roll

| Problem                                              | Don't Build                                 | Use Instead                                          | Why                                                               |
| ---------------------------------------------------- | ------------------------------------------- | ---------------------------------------------------- | ----------------------------------------------------------------- |
| Browser flow simulation for route checks             | Custom DOM harness for navigation lifecycle | Playwright route/navigation assertions               | Better confidence for actual routing and language switch behavior |
| Manual string replacement for locale switching tests | Ad-hoc test-specific mapping logic          | Existing getLocalizedPath contract + explicit matrix | Avoids divergence from production route-localization behavior     |

Key insight: COMP-01 requires both static invariants and runtime behavior; neither layer alone is sufficient.

## Common Pitfalls

### Pitfall 1: False confidence from source-only tests

What goes wrong: Contract tests pass while runtime navigation regresses.
Why it happens: String-level assertions do not execute real clicks/transitions.
How to avoid: Add dedicated Playwright compatibility journeys.
Warning signs: Green node:test and broken manual Projects discovery.

### Pitfall 2: Locale switch fallback masked by broad URL regex

What goes wrong: Switcher lands on home or wrong locale route but test still passes.
Why it happens: Assertions only check locale prefix existence.
How to avoid: Assert full expected counterpart path.
Warning signs: Tests matching /pt/ while expected is /pt/canvas/.

### Pitfall 3: Alias-route drift introduced as convenience

What goes wrong: /projects/canvas/ or /projects/slots/ appears and canonical model fragments.
Why it happens: Shortcut route additions bypass compatibility policy.
How to avoid: Explicit deny-list assertions in contract and E2E.
Warning signs: New route files or redirects under projects subtree for canvas/slots.

## Code Examples

### Contract counterpart matrix pattern

Source anchor: current counterpart behavior in src/i18n/utils.ts and LanguageSwitcher usage

- Define matrix:
  - /en/projects/ -> /pt/projects/
  - /pt/projects/ -> /en/projects/
  - /en/canvas/ -> /pt/canvas/
  - /pt/canvas/ -> /en/canvas/
  - /en/slots/ -> /pt/slots/
  - /pt/slots/ -> /en/slots/
- Assert each mapping through getLocalizedPath(path, targetLang).

### E2E discovery flow pattern

- Navigate to locale projects page.
- Click Canvas or Slots CTA.
- Assert exact canonical route reached.
- Verify header Projects remains active affordance where applicable.

## Environment Availability

| Dependency     | Required By                    | Available | Version | Fallback |
| -------------- | ------------------------------ | --------- | ------- | -------- |
| node           | node:test contract suite       | Yes       | 22.22.1 | None     |
| npm            | build and script orchestration | Yes       | 10.9.4  | None     |
| Playwright CLI | E2E compatibility suite        | Yes       | 1.58.2  | None     |

Missing dependencies with no fallback:

- None

Missing dependencies with fallback:

- None

## Validation Architecture

### Test Framework

| Property           | Value                                             |
| ------------------ | ------------------------------------------------- |
| Framework          | node:test + Playwright 1.58.2                     |
| Config file        | playwright.config.ts                              |
| Quick run command  | node --test tests/compatibility-contract.test.mjs |
| Full suite command | npm run test                                      |

### Phase Requirements to Test Map

| Req ID  | Behavior                                                                        | Test Type | Automated Command                                                | File Exists?            |
| ------- | ------------------------------------------------------------------------------- | --------- | ---------------------------------------------------------------- | ----------------------- |
| COMP-01 | EN/PT Projects discovery flow reaches canonical Canvas and Slots routes         | e2e       | npx playwright test e2e/compatibility.spec.ts --project=chromium | No (create in Phase 12) |
| COMP-01 | Language switcher resolves exact counterparts for /projects/, /canvas/, /slots/ | e2e       | npx playwright test e2e/compatibility.spec.ts --project=chromium | No (create in Phase 12) |
| COMP-01 | Canonical route model intact and alias routes absent in targets                 | contract  | node --test tests/compatibility-contract.test.mjs                | No (create in Phase 12) |

### Exact Commands and Expected Assertions

1. Contract gate

- Command: node --test tests/compatibility-contract.test.mjs
- Expected assertions:
  - getLocalizedPath returns exact EN/PT counterpart for projects, canvas, slots paths.
  - Header projects nav href remains /{lang}/projects/.
  - Projects and Slots CTA href values remain canonical locale routes.
  - No /projects/canvas/ or /projects/slots/ aliases appear in route targets.

2. Compatibility E2E gate

- Command: npx playwright test e2e/compatibility.spec.ts --project=chromium
- Expected assertions:
  - /en/projects/ canvas CTA -> /en/canvas/.
  - /en/projects/ slots CTA -> /en/slots/.
  - /pt/projects/ canvas CTA -> /pt/canvas/.
  - /pt/projects/ slots CTA -> /pt/slots/.
  - Language switch from each of /projects/, /canvas/, /slots/ lands on exact counterpart path.

3. Full regression check

- Command: npm run test
- Expected assertions:
  - New compatibility suite passes with existing navigation, i18n, and canvas suites.
  - No route compatibility regressions across both configured Playwright projects.

### Sampling Rate

- Per task commit: node --test tests/compatibility-contract.test.mjs
- Per wave merge: npx playwright test e2e/compatibility.spec.ts --project=chromium
- Phase gate: npm run test

### Wave 0 Gaps

- tests/compatibility-contract.test.mjs - add COMP-01 route invariant contracts
- e2e/compatibility.spec.ts - add COMP-01 discovery and counterpart runtime checks

## Sources

### Primary (HIGH confidence)

- Repository context and decisions:
  - .planning/phases/12-compatibility-and-qa-hardening/12-CONTEXT.md
  - .planning/ROADMAP.md
  - .planning/REQUIREMENTS.md
- Existing implementation and tests:
  - tests/nav-i18n-primitives.test.mjs
  - tests/projects-hub-delivery.test.mjs
  - tests/slots-shell-foundation.test.mjs
  - e2e/navigation.spec.ts
  - e2e/i18n.spec.ts
  - e2e/canvas.spec.ts
  - src/components/Header.astro
  - src/components/LanguageSwitcher.astro
  - src/i18n/utils.ts
  - src/pages/en/projects/index.astro
  - src/pages/pt/projects/index.astro
  - src/pages/en/slots/index.astro
  - src/pages/pt/slots/index.astro
- Tooling/config:
  - CLAUDE.md
  - package.json
  - playwright.config.ts

### Secondary (MEDIUM confidence)

- npm registry metadata:
  - npm view @playwright/test version time.modified
  - npm view astro version time.modified

### Tertiary (LOW confidence)

- None

## Metadata

Confidence breakdown:

- Standard stack: HIGH - based on current repo scripts/config plus npm registry checks.
- Architecture: HIGH - directly derived from current IA, constraints, and existing test boundaries.
- Pitfalls: HIGH - observed from current gap between source-only contracts and runtime E2E scope.

Research date: 2026-04-02
Valid until: 2026-05-02
