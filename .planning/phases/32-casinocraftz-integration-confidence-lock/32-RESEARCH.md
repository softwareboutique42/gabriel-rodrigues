# Phase 32: Casinocraftz Integration Confidence Lock - Research

**Researched:** 2026-04-03
**Domain:** Integration confidence lock for Casinocraftz shell + embedded/standalone Slots + tutorial/card composition
**Confidence:** HIGH

<user_constraints>

## User Constraints (from CONTEXT.md)

### Locked Decisions

- Phase 32 is a confidence-lock phase only. No net-new gameplay, economy, tutorial-step, or card-mechanic features are in scope.
- Canonical routes remain authoritative: /en/casinocraftz/, /pt/casinocraftz/, embedded /{lang}/slots/?host=casinocraftz, and standalone /{lang}/slots/.
- Tutorial and starter-card systems from Phase 31 stay authority-isolated from Slots internals.
- Play-and-observe progression remains driven by ccz:spin-settled bridge events from spin-resolved visuals.
- Compatibility anchors on machine-readable datasets remain first-class release contracts.
- Release confidence requires evidence across contracts, targeted browser checks, lint, and production build.

### Claude's Discretion

- Prefer extending existing contract and compatibility suites over introducing new test frameworks.
- Prefer deterministic, machine-readable assertions over screenshot or pixel-diff checks.
- Prefer targeted high-signal checks for integrated risk points instead of broad exploratory additions.
- Treat pre-existing lint warnings outside this phase scope as non-blocking unless they affect integrated Casinocraftz confidence.
- Use current chromium-based compatibility coverage as the primary browser lock unless phase planning explicitly broadens the matrix.

### Deferred Ideas (OUT OF SCOPE)

- New tutorial beats, new cards, new card effects, or redesign of progression logic.
- Any gameplay authority changes (engine behavior, RNG, payout tables, economy rules, spin lifecycle semantics).
- New monetization systems, real-money flows, microtransactions, or PvP/collection expansion.
- Broad visual redesign or non-critical UX expansion unrelated to integration confidence.
- New route families or URL scheme changes beyond existing canonical surfaces.

</user_constraints>

<phase_requirements>

## Phase Requirements

| ID     | Description                                                                                                                                 | Research Support                                                                                                                                                                    |
| ------ | ------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| SYS-42 | Integrated Casinocraftz experience preserves fake, free-to-play economy with no real-money or microtransaction drift.                       | Lock economy assertions to deterministic runtime envelopes and route contracts; add explicit anti-monetization guards in compatibility/contract coverage, not new product features. |
| QA-40  | Contract and compatibility coverage protects canonical EN/PT routes, embedded Slots behavior, tutorial flow, and starter-card interactions. | Use existing `node:test` contracts and Playwright compatibility matrix as authoritative lock harness; expand only with parity/risk-point assertions.                                |
| QA-41  | Release verification captures lint, targeted tests, browser checks, and build evidence for integrated milestone.                            | Use release-evidence chain: contracts -> targeted Playwright -> lint -> build -> evidence artifact logging in `.planning/debug/`.                                                   |

</phase_requirements>

## Summary

Phase 32 should be planned as a pure confidence-lock wave over existing capabilities delivered in phases 29-31. The repository already has strong baseline coverage for canonical route integrity, EN/PT host parity, tutorial boundary isolation, and machine-readable Slots runtime datasets. The research evidence shows this baseline is executable today via focused `node:test` contracts and targeted Chromium Playwright compatibility checks.

The highest-value planning move is to formalize deterministic lock gates, not build new behavior. That means preserving current authority boundaries (tutorial/cards do not mutate Slots internals), maintaining route canonicality (`/en|pt/casinocraftz/` + `/en|pt/slots/` + embed host query), and making release evidence reproducible with a small set of explicit commands and artifacts.

A lock phase should treat parity, route integrity, and release evidence as pass/fail contracts. It should avoid broad exploratory testing, screenshot diffs, and speculative refactors. Existing warnings outside phase scope can be documented as known non-blockers only when they do not affect integrated confidence surfaces.

**Primary recommendation:** Plan Phase 32 as a deterministic verification-only wave that strengthens and executes existing contract/E2E gates, then records release evidence artifacts without introducing net-new feature surface.

## Project Constraints (from CLAUDE.md)

- Stack and routing constraints:
  - Astro 6 static site with Tailwind CSS v4.
  - EN/PT file-based routing under `src/pages/en/` and `src/pages/pt/`; maintain both language surfaces when changing pages.
- Client runtime constraint:
  - Client scripts must initialize on `astro:page-load`; use cleanup patterns for re-navigation safety.
- Testing and validation constraints:
  - Playwright E2E is the canonical browser test system (`e2e/`, `playwright.config.ts`).
  - Build/dev/test commands must use project scripts (`npm run lint`, `npm run build`, `npm run test`, etc.).
- Platform/version constraint:
  - Node.js >= 22.12.0.
- Commit/process constraints:
  - Conventional Commit format is enforced.

## Standard Stack

### Core

| Library                                    | Version                                      | Purpose                                                                                                     | Why Standard                                                                                                                       |
| ------------------------------------------ | -------------------------------------------- | ----------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| Node.js built-in test runner (`node:test`) | Node 22.22.1 (local)                         | Fast source-level contract checks for deterministic/parity invariants.                                      | Already used by existing contract tests in `tests/*.test.mjs`; zero extra framework overhead.                                      |
| Playwright (`@playwright/test`)            | project: 1.58.2, latest: 1.59.1 (2026-04-01) | Browser-level compatibility checks for route integrity, embeds, tutorial progression, and runtime datasets. | Existing phase coverage is already concentrated in `e2e/compatibility.spec.ts` with stable selectors and deterministic assertions. |
| Astro build pipeline (`astro`)             | project: 6.0.8, latest: 6.1.3 (2026-04-01)   | Production static build gate for release confidence evidence.                                               | Build success is required milestone evidence and validates integrated route generation.                                            |
| ESLint (`eslint`)                          | project/latest: 10.1.0 (2026-03-20)          | Static hygiene gate in release chain.                                                                       | Existing repository lock workflow already uses lint-before-release posture.                                                        |

### Supporting

| Library                                        | Version                        | Purpose                                                              | When to Use                                                                            |
| ---------------------------------------------- | ------------------------------ | -------------------------------------------------------------------- | -------------------------------------------------------------------------------------- |
| Playwright reporter output (`--reporter=json`) | bundled with Playwright 1.58.2 | Machine-readable release artifact for targeted compatibility checks. | Use for lock-phase evidence capture in `.planning/debug/slots-playwright-report.json`. |

### Alternatives Considered

| Instead of                                     | Could Use                                        | Tradeoff                                                                                                        |
| ---------------------------------------------- | ------------------------------------------------ | --------------------------------------------------------------------------------------------------------------- |
| Existing `node:test` + Playwright lock harness | New test frameworks or visual regression tooling | Adds non-lock scope, increases flake risk, and weakens deterministic/machine-readable focus.                    |
| Targeted Chromium compatibility checks         | Full browser matrix expansion in this phase      | Broader matrix increases runtime and triage noise; context explicitly anchors Chromium as default lock browser. |

**Installation:**

```bash
npm install
```

**Version verification:**

```bash
npm view astro version time --json
npm view @playwright/test version time --json
npm view eslint version time --json
```

Verified on 2026-04-03:

- `astro` latest `6.1.3` published `2026-04-01T21:06:17.561Z`
- `@playwright/test` latest `1.59.1` published `2026-04-01T17:59:00.155Z`
- `eslint` latest `10.1.0` published `2026-03-20T15:31:41.125Z`

## Architecture Patterns

### Recommended Project Structure

```text
.planning/phases/32-casinocraftz-integration-confidence-lock/
├── 32-CONTEXT.md         # locked scope and non-negotiables
└── 32-RESEARCH.md        # this research artifact for planner input

tests/
├── compatibility-contract.test.mjs           # canonical route + alias deny-list contracts
├── slots-i18n-parity-contract.test.mjs       # EN/PT parity and runtime seed/shell contract
└── casinocraftz-tutorial-contract.test.mjs   # tutorial/card boundaries and parity

e2e/
└── compatibility.spec.ts   # browser lock checks for embed/standalone/tutorial parity

.planning/debug/
└── slots-playwright-report.json  # machine-readable targeted browser evidence artifact
```

### Pattern 1: Deterministic Contract-First Lock

**What:** Keep source-level assertions on route contracts, host embed invariants, module boundaries, and EN/PT parity before browser execution.
**When to use:** Every lock-phase validation pass and pre-merge check.
**Example:**

```javascript
// Source: tests/compatibility-contract.test.mjs
assert.match(enCasinocraftz, /src="\/en\/slots\/\?host=casinocraftz"/);
assert.match(ptCasinocraftz, /src="\/pt\/slots\/\?host=casinocraftz"/);
assert.doesNotMatch(source, /\/en\/projects\/casinocraftz\//);
```

### Pattern 2: Machine-Readable Runtime Envelope Assertions

**What:** Validate `data-*` runtime state instead of pixels or free-form text snapshots.
**When to use:** Embedded/standalone Slots runtime compatibility and parity locks.
**Example:**

```typescript
// Source: e2e/compatibility.spec.ts
await expect(root).toHaveAttribute('data-slots-host', 'standalone');
await expect(root).toHaveAttribute('data-slots-anim-atlas', 'ready');
await expect(root).toHaveAttribute('data-slots-anim-seq', '0');
```

### Pattern 3: EN/PT Symmetric Route and Tutorial Progression Matrix

**What:** Assert equivalent behavior across `/en/` and `/pt/` canonical routes for shell, embed, spin progression, and tutorial step transitions.
**When to use:** Any integration lock touching routable surfaces or tutorial bridge assumptions.
**Example:**

```typescript
// Source: e2e/compatibility.spec.ts
await expect(enEmbed).toHaveAttribute('src', '/en/slots/?host=casinocraftz');
await expect(ptEmbed).toHaveAttribute('src', '/pt/slots/?host=casinocraftz');
await expect(root).toHaveAttribute('data-casinocraftz-tutorial-step', 'probability-reveal');
```

### Anti-Patterns to Avoid

- **Feature creep in lock phase:** Adding tutorial beats/cards/economy behavior while "testing" invalidates confidence-only scope.
- **Screenshot-driven confidence claims:** Pixel snapshots are brittle and weaker than deterministic dataset/state assertions for this domain.
- **Route alias reintroduction:** Any `/projects/*` alias restoration breaks canonical routing contracts and parity assumptions.
- **Boundary erosion:** Importing or mutating Slots authority internals from tutorial/card modules violates preserved architecture.
- **Untracked evidence:** Running checks without storing command outputs/artifacts makes QA-41 non-auditable.

## Concrete File Targets for 32-01 Plan

- Primary lock test surfaces:
  - `tests/compatibility-contract.test.mjs`
  - `tests/slots-i18n-parity-contract.test.mjs`
  - `tests/casinocraftz-tutorial-contract.test.mjs`
  - `e2e/compatibility.spec.ts`
- Release evidence artifacts/logging:
  - `.planning/debug/slots-playwright-report.json`
  - `.planning/phases/32-casinocraftz-integration-confidence-lock/32-01-SUMMARY.md` (phase execution output, planned)
  - `.planning/phases/32-casinocraftz-integration-confidence-lock/32-VERIFICATION.md` (verification output, planned)
- High-risk runtime integration surfaces to keep under contract:
  - `src/pages/en/casinocraftz/index.astro`
  - `src/pages/pt/casinocraftz/index.astro`
  - `src/pages/en/slots/index.astro`
  - `src/pages/pt/slots/index.astro`
  - `src/scripts/slots/main.ts`

## Don't Hand-Roll

| Problem                                                | Don't Build                                   | Use Instead                                                    | Why                                                                                             |
| ------------------------------------------------------ | --------------------------------------------- | -------------------------------------------------------------- | ----------------------------------------------------------------------------------------------- |
| Integration confidence for route/embed/tutorial parity | Custom ad-hoc browser scripts as primary gate | Existing `e2e/compatibility.spec.ts` targeted checks           | Existing suite already captures deterministic selectors, parity matrix, and bridge progression. |
| Deterministic state verification                       | Visual diff/image snapshot harness            | `data-*` envelope assertions in Playwright/contracts           | State attributes are stable, machine-readable, and lower-flake for lock gates.                  |
| Release evidence tracking                              | Manual copy/paste notes from terminal         | JSON/command artifacts under `.planning/debug/` + summary docs | Ensures repeatable, auditable QA-41 evidence.                                                   |

**Key insight:** Lock phases fail when they invent new test architecture. Reuse and tighten existing deterministic contracts, then run and record evidence consistently.

## Common Pitfalls

### Pitfall 1: Treating Lock Work as Feature Work

**What goes wrong:** New functionality is introduced under test hardening commits.
**Why it happens:** Ambiguous scope boundaries and "quick improvement" impulses.
**How to avoid:** Define explicit file/behavior allowlist for Phase 32 and reject net-new behavior deltas.
**Warning signs:** New user-visible strings, new routes, changed gameplay authority paths, or altered tutorial/card mechanics.

### Pitfall 2: EN/PT Drift Hidden by EN-Only Validation

**What goes wrong:** EN path remains green while PT embed/tutorial/runtime contracts silently diverge.
**Why it happens:** Single-locale smoke checks and missing mirrored assertions.
**How to avoid:** Enforce EN/PT pair assertions for every lock test touching routes, embeds, or datasets.
**Warning signs:** Hardcoded EN labels in PT views, unmatched `/pt/*` iframe `src`, or seed/state mismatch across locales.

### Pitfall 3: Route Integrity Regressions via Alias Reintroduction

**What goes wrong:** Legacy/deferred `/projects/*` aliases leak back and cause navigation inconsistency.
**Why it happens:** Convenience links added without canonicality checks.
**How to avoid:** Keep alias deny-list contracts and explicit canonical route assertions in both source and browser tests.
**Warning signs:** Links resolving to `/projects/canvas`, `/projects/slots`, or `/projects/casinocraftz` variants.

### Pitfall 4: Non-Reproducible Release Evidence

**What goes wrong:** QA-41 claims cannot be audited later.
**Why it happens:** Tests run ad hoc without artifact capture.
**How to avoid:** Standardize command set and write machine-readable outputs for targeted browser checks.
**Warning signs:** Missing `.planning/debug/*` artifacts or missing summary references to exact commands/results.

## Code Examples

Verified patterns from current repository contracts:

### Canonical EN/PT Embed Host Parity

```javascript
// Source: tests/compatibility-contract.test.mjs
assert.match(enCasinocraftz, /src="\/en\/slots\/\?host=casinocraftz"/);
assert.match(ptCasinocraftz, /src="\/pt\/slots\/\?host=casinocraftz"/);
assert.match(slotsMain, /new URLSearchParams\(window\.location\.search\)\.get\('host'\)/);
```

### Tutorial Boundary Isolation

```javascript
// Source: tests/casinocraftz-tutorial-contract.test.mjs
assert.doesNotMatch(cardsSource, /import\s+.*slots/i);
assert.match(slotsMainSource, /ccz:spin-settled/);
```

### Runtime Compatibility Envelope

```typescript
// Source: e2e/compatibility.spec.ts
await expect(root).toHaveAttribute('data-slots-host', 'standalone');
await expect(root).toHaveAttribute('data-slots-theme', 'slots-core-v1');
await expect(root).toHaveAttribute('data-slots-anim-performance', /ok|degraded/);
await expect(page.locator('#slots-gameplay-seed')).toHaveText('Seed: slots-phase-13-en:1');
```

## State of the Art

| Old Approach                                   | Current Approach                                                        | When Changed                     | Impact                                                      |
| ---------------------------------------------- | ----------------------------------------------------------------------- | -------------------------------- | ----------------------------------------------------------- |
| Broad route assumptions and ad-hoc checks      | Canonical route contracts + alias deny-list tests                       | Phases 29-30                     | Reduced route drift and explicit canonicality guarantees.   |
| Tutorial logic validated only by source review | Contract + browser progression checks via `ccz:spin-settled` bridge     | Phase 31                         | Deterministic, cross-layer proof of integrated progression. |
| Manual release confidence narrative            | Command-backed evidence chain (contracts + targeted e2e + lint + build) | Phase 31 -> Phase 32 lock target | Auditable QA gate for integrated milestone sign-off.        |

**Deprecated/outdated:**

- Relying on route alias links under `/projects/*` for canonical product surfaces.
- Treating screenshot similarity as primary confidence metric for deterministic runtime contracts.

## Open Questions

1. **Should mobile-chrome be included in lock gate or remain optional evidence?**
   - What we know: Current context defaults Chromium desktop as primary lock browser.
   - What's unclear: Whether QA-41 sign-off requires explicit mobile parity execution in this phase.
   - Recommendation: Keep Chromium required; optionally run mobile-chrome as non-blocking evidence unless planner explicitly widens gate.

2. **How strict should lint warning policy be for lock sign-off?**
   - What we know: `npm run lint` currently reports one pre-existing warning in `.claude/get-shit-done/bin/lib/state.cjs` unrelated to Phase 32 surfaces.
   - What's unclear: Whether milestone gate requires warning-free lint or no new lock-surface warnings.
   - Recommendation: Treat existing out-of-scope warning as known non-blocker; fail gate on new warnings/errors touching integrated Casinocraftz/Slots/tutorial surfaces.

## Environment Availability

| Dependency     | Required By                           | Available | Version | Fallback |
| -------------- | ------------------------------------- | --------- | ------- | -------- |
| Node.js        | `node --test`, npm scripts            | yes       | 22.22.1 | none     |
| npm            | lint/build/test script orchestration  | yes       | 10.9.4  | none     |
| Playwright CLI | targeted compatibility browser checks | yes       | 1.58.2  | none     |
| ESLint CLI     | release lint gate                     | yes       | 10.1.0  | none     |

**Missing dependencies with no fallback:**

- None.

**Missing dependencies with fallback:**

- None.

## Validation Architecture

### Test Framework

| Property           | Value                                                                                                                                       |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------- |
| Framework          | Node.js built-in test runner (`node:test`) + Playwright 1.58.2                                                                              |
| Config file        | `playwright.config.ts`                                                                                                                      |
| Quick run command  | `node --test tests/compatibility-contract.test.mjs tests/slots-i18n-parity-contract.test.mjs tests/casinocraftz-tutorial-contract.test.mjs` |
| Full suite command | `npm run test -- --project=chromium --workers=1`                                                                                            |

### Phase Requirements -> Test Map

| Req ID | Behavior                                                                                 | Test Type            | Automated Command                                                                                                                                                                                                                               | File Exists?                                                                                                                                |
| ------ | ---------------------------------------------------------------------------------------- | -------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------- | --- |
| SYS-42 | Preserve fake/free-to-play framing and no monetization drift on integrated routes        | contract + e2e smoke | `node --test tests/compatibility-contract.test.mjs tests/casinocraftz-tutorial-contract.test.mjs`                                                                                                                                               | yes                                                                                                                                         |
| QA-40  | Protect canonical EN/PT routes, embed behavior, tutorial flow, starter-card interactions | contract + e2e       | `node --test tests/compatibility-contract.test.mjs tests/slots-i18n-parity-contract.test.mjs tests/casinocraftz-tutorial-contract.test.mjs && npx playwright test e2e/compatibility.spec.ts --project=chromium --workers=1 --grep "casinocraftz | tutorial                                                                                                                                    | slots runtime compatibility"` | yes |
| QA-41  | Capture release verification evidence (lint, targeted tests, browser checks, build)      | release gate         | `npm run lint && npm run build && npx playwright test e2e/compatibility.spec.ts --project=chromium --workers=1 --grep "casinocraftz embeds slots module with canonical EN/PT host parity                                                        | slots runtime compatibility keeps machine-readable gameplay state in EN/PT" --reporter=json > .planning/debug/slots-playwright-report.json` | yes                           |

### Sampling Rate

- **Per task commit:** `node --test tests/compatibility-contract.test.mjs tests/slots-i18n-parity-contract.test.mjs tests/casinocraftz-tutorial-contract.test.mjs`
- **Per wave merge:** `npx playwright test e2e/compatibility.spec.ts --project=chromium --workers=1 --grep "casinocraftz|tutorial|slots runtime compatibility"`
- **Phase gate:** `npm run lint && npm run build && npx playwright test e2e/compatibility.spec.ts --project=chromium --workers=1 --grep "casinocraftz embeds slots module with canonical EN/PT host parity|slots runtime compatibility keeps machine-readable gameplay state in EN/PT" --reporter=json > .planning/debug/slots-playwright-report.json`

### Wave 0 Gaps

- None - existing test infrastructure already covers Phase 32 lock requirements.

## Sources

### Primary (HIGH confidence)

- `.planning/phases/32-casinocraftz-integration-confidence-lock/32-CONTEXT.md` - locked scope, non-negotiables, and out-of-scope rules.
- `.planning/ROADMAP.md` - phase goal, dependencies, and requirement mapping.
- `.planning/REQUIREMENTS.md` - SYS-42, QA-40, QA-41 definitions.
- `.planning/phases/31-house-edge-tutorial-and-utility-card-systems/31-01-SUMMARY.md` - phase-31 baseline outputs and prior validation chain.
- `tests/compatibility-contract.test.mjs` - route/alias/embed contract baseline.
- `tests/slots-i18n-parity-contract.test.mjs` - EN/PT parity and runtime envelope contracts.
- `tests/casinocraftz-tutorial-contract.test.mjs` - tutorial/card boundary and parity contracts.
- `e2e/compatibility.spec.ts` - browser parity, embed, tutorial progression, and runtime compatibility checks.
- `playwright.config.ts` - active Playwright test architecture and webServer config.
- `package.json` - project scripts and pinned versions.
- `npm view astro version time --json` - latest registry version/date validation.
- `npm view @playwright/test version time --json` - latest registry version/date validation.
- `npm view eslint version time --json` - latest registry version/date validation.
- Runtime command evidence executed on 2026-04-03:
  - `node --test tests/compatibility-contract.test.mjs tests/slots-i18n-parity-contract.test.mjs tests/casinocraftz-tutorial-contract.test.mjs` (13/13 pass)
  - `npx playwright test e2e/compatibility.spec.ts --project=chromium --workers=1 --grep "casinocraftz embeds slots module with canonical EN/PT host parity|slots runtime compatibility keeps machine-readable gameplay state in EN/PT"` (2/2 pass)
  - `npm run lint` (0 errors, 1 pre-existing out-of-scope warning)
  - `npm run build` (success, static build complete)

### Secondary (MEDIUM confidence)

- None.

### Tertiary (LOW confidence)

- None.

## Metadata

**Confidence breakdown:**

- Standard stack: HIGH - verified against repository usage and npm registry current versions.
- Architecture: HIGH - directly derived from implemented contracts/tests and phase context.
- Pitfalls: HIGH - evidenced by lock-scope constraints and observed failure modes (e.g., flaky/non-deterministic evidence paths).

**Research date:** 2026-04-03
**Valid until:** 2026-05-03
