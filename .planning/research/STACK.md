# Technology Stack

**Project:** v1.8 Casinocraftz + Slots Integration Expansion
**Researched:** 2026-04-03

## Recommended Stack (Reuse-First)

### Core Platform

| Technology                         | Version/Constraint      | Purpose                                                        | Why for v1.8                                                                                            |
| ---------------------------------- | ----------------------- | -------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------- |
| Astro                              | `^6.0.8` (keep)         | Static site routing and page composition                       | Existing EN/PT route model and View Transition lifecycle already validated in production milestone flow |
| TypeScript (workspace ESM)         | Current workspace setup | Shared runtime contracts and deterministic slots engine typing | Current controller/engine/tutorial boundaries are already contract-tested                               |
| Node.js                            | `>=22.12.0`             | Build/test runtime baseline                                    | Already pinned in `engines`; avoid CI/runtime drift                                                     |
| Cloudflare Pages static deployment | Static output only      | Hosting and route delivery                                     | Matches current architecture constraints (no SSR Node server)                                           |

### Existing Product Runtimes to Preserve

| Runtime Surface             | Technology                                                      | v1.8 Recommendation                                                                                             |
| --------------------------- | --------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------- |
| Canvas feature              | Three.js (`^0.183.2`)                                           | Reuse as-is for canvas surfaces; do not introduce a second rendering framework                                  |
| Slots gameplay + shell      | Existing deterministic TS modules under `src/scripts/slots/*`   | Extend behavior within current engine/controller boundaries; preserve deterministic seed + spin index authority |
| Casinocraftz tutorial/cards | Existing TS modules under `src/scripts/casinocraftz/tutorial/*` | Continue using postMessage bridge (`ccz:spin-settled`) instead of new state-sync dependency                     |

### Payments/Monetization Boundary

| Area                             | Existing Tech                 | v1.8 Policy                                                                           |
| -------------------------------- | ----------------------------- | ------------------------------------------------------------------------------------- |
| Portfolio Canvas monetization    | Stripe (existing integration) | Keep scoped to Canvas export flow only                                                |
| Slots + Casinocraftz experiences | No checkout/payment hooks     | Maintain strict anti-monetization guardrails; no wallet/deposit/purchase dependencies |

## Integration Guidance for v1.8

1. Keep deterministic authority in existing slots engine/state-machine/economy modules; presentation and tutorial systems must remain consumers, never authorities.
2. Keep EN/PT parity by updating both language routes and i18n dictionaries in the same change-set.
3. Keep canonical route policy (`/en/*`, `/pt/*`) and avoid introducing alias route trees that bypass existing parity contracts.
4. Reuse current analytics event schema and storage path; extend only with categorical, non-PII payload fields.
5. Avoid adding UI frameworks (React/Vue/Svelte islands) for v1.8 unless a blocker is proven; current Astro + vanilla TS pipeline is sufficient.

## Dependency Policy (No Unnecessary Additions)

### Allowed by Default

- Existing dependencies already in `package.json`.
- Dev tooling updates that are patch/minor and required for security or CI compatibility.

### Require Explicit Justification

- New runtime libraries for Slots/Casinocraftz rendering or state management.
- New i18n, routing, or analytics SDKs that duplicate current project capabilities.
- Any package that introduces monetization primitives into Slots/Casinocraftz surfaces.

### Explicitly Avoid for v1.8

- Rendering migration (e.g., Pixi rewrite) during milestone scope expansion.
- SSR adapters or server runtime additions that conflict with static deployment constraint.
- Cross-product shared abstraction work that is not tied to a v1.8 shipped requirement.

## Compatibility and Testing Tooling Choices

### Contract Layer (Fast Guardrails)

| Tool                          | Scope                                                                           | Constraint                                                                   |
| ----------------------------- | ------------------------------------------------------------------------------- | ---------------------------------------------------------------------------- |
| `node:test` + `assert/strict` | Source-level contracts in `tests/*.test.mjs`                                    | Keep deterministic, parity, and anti-monetization assertions as release gate |
| Existing contract suites      | Determinism, i18n parity, host embedding, tutorial boundary, analytics, economy | Update tests in same PR as behavior changes to prevent silent contract drift |

### Runtime Layer (Behavior Validation)

| Tool                                      | Scope                                                                          | Constraint                                                                                 |
| ----------------------------------------- | ------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------ |
| Playwright (`@playwright/test` `^1.58.2`) | E2E compatibility journeys under `e2e/compatibility.spec.ts` and related specs | Keep EN/PT parity checks and embedded host flow coverage for every v1.8 release candidate  |
| Playwright projects                       | `chromium`, `mobile-chrome`                                                    | Do not remove mobile coverage; parity regressions often appear in embedded/mobile contexts |
| Web server mode                           | `npm run build && npm run preview` (from `playwright.config.ts`)               | Preserve production-like validation path; avoid dev-server-only confidence                 |

### Known Verification Commands

```bash
# Fast contract gate for deterministic/parity/monetization protections
npm test -- --grep "compatibility|determinism|i18n|economy|tutorial"

# Focused runtime compatibility checks used in v1.7 closeout
npx playwright test e2e/compatibility.spec.ts --project=chromium --workers=1 --grep "casinocraftz embeds slots module with canonical EN/PT host parity|slots runtime compatibility keeps machine-readable gameplay state in EN/PT"

# Full E2E regression with desktop + mobile projects
npm test
```

## v1.8 Stack Recommendation (Opinionated)

Use the existing Astro + TypeScript + deterministic Slots runtime + Playwright/contract testing stack without introducing new core dependencies. Spend v1.8 capacity on feature depth, parity hardening, and release confidence, not stack churn.

## Confidence

| Area                                 | Confidence  | Basis                                                                                                                        |
| ------------------------------------ | ----------- | ---------------------------------------------------------------------------------------------------------------------------- |
| Existing stack reuse                 | HIGH        | Verified from workspace `package.json`, `PROJECT.md`, and shipped v1.7 constraints                                           |
| Deterministic integration boundaries | HIGH        | Verified by contract tests for engine/economy/tutorial bridge                                                                |
| Compatibility/testing tooling        | HIGH        | Verified by current Playwright config/specs and recent execution context                                                     |
| Need for new dependencies            | MEDIUM-HIGH | No current evidence of blocker requiring additional frameworks; validate if v1.8 scope introduces novel runtime requirements |

## Sources

- Workspace project context: `.planning/PROJECT.md`
- Current stack and scripts: `package.json`
- Playwright setup: `playwright.config.ts`
- Compatibility contracts: `tests/compatibility-contract.test.mjs`
- Determinism contracts: `tests/slots-core-determinism-contract.test.mjs`
- EN/PT parity contracts: `tests/slots-i18n-parity-contract.test.mjs`
- Tutorial bridge contracts: `tests/casinocraftz-tutorial-contract.test.mjs`
- Economy contracts: `tests/slots-economy-contract.test.mjs`
- Runtime compatibility journeys: `e2e/compatibility.spec.ts`
