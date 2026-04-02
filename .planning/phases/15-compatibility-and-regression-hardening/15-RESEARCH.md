# Phase 15: Compatibility and Regression Hardening - Research

**Researched:** 2026-04-02
**Domain:** Regression hardening for canonical routing, EN/PT counterpart integrity, and slots gameplay safety contracts
**Confidence:** HIGH

<user_constraints>

## User Constraints (from CONTEXT.md)

### Locked Decisions

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

### Deferred Ideas (OUT OF SCOPE)

- Cross-browser matrix expansion beyond current focused targets
- Performance optimization and chunking follow-up
- Gameplay feature expansion (bonus mechanics, multi-line complexity)
- Analytics instrumentation for gameplay funnel
  </user_constraints>

<phase_requirements>

## Phase Requirements

| ID      | Description                                                                                              | Research Support                                                                                                                          |
| ------- | -------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- | ----------------- | ----------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| COMP-10 | Existing canonical routes (`/en                                                                          | pt/projects/`, `/en                                                                                                                       | pt/canvas/`, `/en | pt/slots/`) remain stable after gameplay integration. | Canonical route assertions and EN/PT counterpart matrix in contract + E2E layers; alias deny-list assertions retained as hard checks. |
| QA-10   | Gameplay logic and route/i18n behavior are regression-locked with contract tests plus focused E2E flows. | Recommended fail-fast gate ordering with exact commands, runtime attribute-first assertions, and focused Chromium compatibility journeys. |

</phase_requirements>

## Project Constraints (from CLAUDE.md)

- Framework/architecture: Astro 6 static site with bilingual file-based routing under `src/pages/en/` and `src/pages/pt/`.
- i18n utilities: `getLangFromUrl()` and `useTranslations()` in `src/i18n/utils.ts` are canonical helpers.
- Route updates must preserve EN/PT parity and update both language surfaces together.
- View-transition safety: client scripts must run via `document.addEventListener('astro:page-load', ...)`.
- Test stack: Playwright E2E in `e2e/`, config in `playwright.config.ts`.
- Node requirement: Node.js >= 22.12.0.

## Summary

Phase 15 should be implemented as strict hardening, not feature work: preserve canonical IA and gameplay behavior from Phases 13-14 while tightening detection speed for regressions impacting COMP-10 and QA-10. The existing test inventory already provides most of the required surface coverage, and live runs confirm those gates currently pass.

The best implementation approach is to formalize and enforce a two-layer fail-fast sequence: run contracts first for deterministic logic, route matrix, alias deny-list, and i18n key integrity; run focused Playwright Chromium E2E second for real runtime navigation/switching behavior; run build last as a static integration sanity check.

**Primary recommendation:** Keep a contract-first + focused-E2E split, with canonical route/i18n matrix assertions treated as blocking contract invariants and mirrored by a single compatibility E2E spec for runtime confirmation.

## Standard Stack

### Core

| Library                   | Version                                                    | Purpose                                                                       | Why Standard                                                                                                     |
| ------------------------- | ---------------------------------------------------------- | ----------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| Node built-in `node:test` | Node 22.22.1 runtime (workspace)                           | Fast deterministic contract tests for route/i18n/gameplay invariants          | Zero extra harness overhead, already used by all slots/compatibility contracts, ideal for fail-fast logic checks |
| `@playwright/test`        | 1.58.2 installed; latest npm 1.59.1 (published 2026-04-01) | Runtime browser verification for canonical routing + language switch behavior | Existing E2E infrastructure and compatibility spec already aligned with COMP-10/QA-10                            |
| `astro`                   | 6.0.8 installed; latest npm 6.1.3 (published 2026-04-01)   | Source of route generation and static build stability checks                  | Canonical route behavior is Astro file-routing dependent; build remains final confidence gate                    |

### Supporting

| Library                     | Version                                  | Purpose                                             | When to Use                                                      |
| --------------------------- | ---------------------------------------- | --------------------------------------------------- | ---------------------------------------------------------------- |
| Playwright Chromium project | From `playwright.config.ts` (`chromium`) | Focused low-noise compatibility regression journeys | Phase-15 focused E2E lane; keep cross-browser expansion deferred |

### Alternatives Considered

| Instead of                          | Could Use                      | Tradeoff                                                                            |
| ----------------------------------- | ------------------------------ | ----------------------------------------------------------------------------------- |
| Contract + focused E2E split        | E2E-only checks                | Slower feedback and poorer failure localization for deterministic logic regressions |
| Chromium-focused compatibility lane | Full browser matrix per commit | Better coverage but higher CI cost/noise; explicitly deferred in context            |

**Installation:**

```bash
npm install
```

**Version verification:**

```bash
npm view @playwright/test version
npm view astro version
```

Verified latest versions at research time:

- `@playwright/test`: 1.59.1 (published 2026-04-01T17:59:00.155Z)
- `astro`: 6.1.3 (published 2026-04-01T21:06:17.561Z)

## Architecture Patterns

### Recommended Project Structure

```text
tests/
├── compatibility-contract.test.mjs                 # Canonical route + counterpart + alias deny invariants
├── slots-core-determinism-contract.test.mjs        # Deterministic round/state contracts
├── slots-payline-evaluation-contract.test.mjs      # Win/loss payout correctness contracts
├── slots-economy-contract.test.mjs                 # Debit/settle arithmetic invariants
├── slots-interaction-guards-contract.test.mjs      # Invalid action blocking rules
└── slots-i18n-parity-contract.test.mjs             # EN/PT key and usage parity
e2e/
└── compatibility.spec.ts                            # Runtime EN/PT route + switch + alias behavior
```

### Pattern 1: Canonical Route and i18n Counterpart Matrix as Contract Invariant

**What:** Keep a fixed route matrix asserting EN/PT counterpart exactness across Projects/Canvas/Slots and deny alias drift.
**When to use:** Always for COMP-10 changes or any page/nav/switcher edits touching these surfaces.
**Example:**

```typescript
const matrix = [
  ['/en/projects/', '/pt/projects/'],
  ['/pt/projects/', '/en/projects/'],
  ['/en/canvas/', '/pt/canvas/'],
  ['/pt/canvas/', '/en/canvas/'],
  ['/en/slots/', '/pt/slots/'],
  ['/pt/slots/', '/en/slots/'],
];
```

// Source: tests/compatibility-contract.test.mjs + e2e/compatibility.spec.ts

### Pattern 2: Attribute-First Runtime Assertions for Slots State

**What:** Prefer stable machine-readable attributes (`data-slots-*`) and deterministic state values instead of text-only assertions.
**When to use:** QA-10 runtime assertions around gameplay status, blocking behavior, and result metadata.
**Example:**

```typescript
root.dataset.slotsState = feedbackKey === 'insufficient' ? 'insufficient' : state.status;
root.dataset.slotsBalance = String(balance);
root.dataset.slotsBet = String(bet);
```

// Source: src/scripts/slots/controller.ts

### Pattern 3: Fail-Fast Validation Ordering

**What:** Run fast contracts first, then focused browser E2E, then build.
**When to use:** Local pre-merge and CI phase gate for Phase 15.
**Example commands:**

```bash
node --test tests/compatibility-contract.test.mjs tests/slots-core-determinism-contract.test.mjs tests/slots-payline-evaluation-contract.test.mjs tests/slots-economy-contract.test.mjs tests/slots-interaction-guards-contract.test.mjs tests/slots-i18n-parity-contract.test.mjs
npx playwright test e2e/compatibility.spec.ts --project=chromium
npm run build
```

### Canonical Route / i18n Counterpart Matrix Assertions

| Surface  | EN canonical    | PT canonical    | Counterpart Rule                                                | Alias Policy             |
| -------- | --------------- | --------------- | --------------------------------------------------------------- | ------------------------ | -------- |
| Projects | `/en/projects/` | `/pt/projects/` | `getLocalizedPath()` flips only first segment (`/en` <-> `/pt`) | Deny `/projects/(canvas  | slots)/` |
| Canvas   | `/en/canvas/`   | `/pt/canvas/`   | Header language switch must resolve exact counterpart           | Deny `/projects/canvas/` |
| Slots    | `/en/slots/`    | `/pt/slots/`    | Header language switch must resolve exact counterpart           | Deny `/projects/slots/`  |

### Anti-Patterns to Avoid

- **Text-only E2E assertions for slots status:** brittle under localization copy updates; use attribute/state assertions first.
- **Single-layer E2E-only regression strategy:** obscures deterministic logic root cause and slows triage.
- **Route alias acceptance by accident:** any introduction of `/projects/canvas/*` or `/projects/slots/*` violates locked constraints.

## Don't Hand-Roll

| Problem                                           | Don't Build                     | Use Instead                                                               | Why                                                                                  |
| ------------------------------------------------- | ------------------------------- | ------------------------------------------------------------------------- | ------------------------------------------------------------------------------------ |
| Custom browser harness for compatibility journeys | Ad-hoc Puppeteer/manual scripts | Existing Playwright test runner + project config                          | Already integrated with web server lifecycle and route assertions; lower maintenance |
| Custom assertion DSL for deterministic contracts  | Bespoke mini test framework     | Node built-in `node:test` + `assert/strict`                               | Current contracts are concise and deterministic without extra abstraction overhead   |
| Dynamic locale route inference heuristics         | Complex route maps              | Existing `getLocalizedPath(path, lang)` behavior + explicit matrix checks | Current counterpart logic is simple, explicit, and already contract-tested           |

**Key insight:** Phase 15 is a hardening pass; the safest strategy is expanding/organizing existing proven test primitives, not introducing new infrastructure.

## Common Pitfalls

### Pitfall 1: Runtime checks drift from contract invariants

**What goes wrong:** E2E passes while deterministic logic contracts miss new edge regressions (or vice versa).
**Why it happens:** Assertions duplicated inconsistently between node:test and Playwright.
**How to avoid:** Keep contract suite as source-of-truth for invariants; E2E validates runtime wiring/navigation only.
**Warning signs:** Failures appear only in one lane after route/controller changes.

### Pitfall 2: i18n counterpart behavior silently regresses on one surface

**What goes wrong:** Language switch works for Projects/Canvas but breaks on Slots.
**Why it happens:** Surface-specific header/page edits without full matrix checks.
**How to avoid:** Preserve full 6-row EN/PT matrix in both contract and E2E tests.
**Warning signs:** One matrix row fails while others pass.

### Pitfall 3: Alias route reintroduction through CTA or nav edits

**What goes wrong:** Links begin pointing to deferred `/projects/*` aliases.
**Why it happens:** Convenience linking during UI edits.
**How to avoid:** Keep deny-list assertions in contracts and `not.toHaveURL(/\/projects\/(canvas|slots)\//)` in E2E.
**Warning signs:** Compatibility contract deny-list test fails on page source strings.

## Code Examples

Verified patterns from repository sources:

### Counterpart mapping contract

```typescript
const computed = from.replace(/^\/(en|pt)/, (_m, lang) => (lang === 'en' ? '/pt' : '/en'));
assert.equal(computed, expected);
```

// Source: tests/compatibility-contract.test.mjs

### Focused runtime compatibility loop

```typescript
for (const [fromPath, switchLabel, expectedPath] of matrix) {
  await page.goto(fromPath);
  await page.locator('header').getByRole('link', { name: switchLabel, exact: true }).click();
  await expect(page).toHaveURL(pathRegex(expectedPath));
}
```

// Source: e2e/compatibility.spec.ts

### Slots guard-first spin control

```typescript
const blocked = getSpinBlockReason(economy, state.status);
if (blocked) {
  feedbackKey = blocked === 'insufficient' ? 'insufficient' : 'blockedSpinning';
  renderState(root, state, economy.balance, economy.bet, feedbackKey);
  return;
}
```

// Source: src/scripts/slots/controller.ts

## State of the Art

| Old Approach                                              | Current Approach                                              | When Changed    | Impact                                                      |
| --------------------------------------------------------- | ------------------------------------------------------------- | --------------- | ----------------------------------------------------------- |
| Route compatibility checked mainly by surface spot-checks | Explicit contract matrix + focused E2E counterpart matrix     | Phase 12        | Stronger regression lock on canonical IA                    |
| Slots shell-only validation                               | Determinism + payout + economy + interaction + i18n contracts | Phases 13-14    | Logic regressions caught before browser runtime             |
| Generic broad E2E assumptions                             | Chromium-focused compatibility lane                           | Phase 12 onward | Faster feedback and lower noise for compatibility hardening |

## Open Questions

1. Should Phase 15 add one extra deterministic replay assertion for multi-round balance progression to `tests/slots-economy-contract.test.mjs`?
   - What we know: Context suggests this as a low-cost hardening extension.
   - What's unclear: Whether current suite already satisfies desired replay depth for QA-10 risk tolerance.
   - Recommendation: Add one contract-only replay case if implementation time is minimal; keep E2E unchanged.

## Environment Availability

| Dependency                          | Required By                        | Available | Version                 | Fallback       |
| ----------------------------------- | ---------------------------------- | --------- | ----------------------- | -------------- |
| node                                | `node:test` contract gate          | yes       | v22.22.1                | none           |
| npm                                 | build/install and script execution | yes       | 10.9.4                  | none           |
| npx                                 | Playwright command invocation      | yes       | bundled with npm 10.9.4 | use `npm exec` |
| Playwright CLI (`@playwright/test`) | focused compatibility E2E          | yes       | 1.58.2                  | none           |

**Missing dependencies with no fallback:**

- None

**Missing dependencies with fallback:**

- None

## Validation Architecture

### Test Framework

| Property           | Value                                                                                                                                                                                                                                                                                |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Framework          | Node built-in `node:test` + Playwright 1.58.2                                                                                                                                                                                                                                        |
| Config file        | `playwright.config.ts`                                                                                                                                                                                                                                                               |
| Quick run command  | `node --test tests/compatibility-contract.test.mjs tests/slots-core-determinism-contract.test.mjs tests/slots-payline-evaluation-contract.test.mjs tests/slots-economy-contract.test.mjs tests/slots-interaction-guards-contract.test.mjs tests/slots-i18n-parity-contract.test.mjs` |
| Full suite command | `npx playwright test e2e/compatibility.spec.ts --project=chromium && npm run build`                                                                                                                                                                                                  |

### Phase Requirements -> Test Map

| Req ID  | Behavior                                                                                                                     | Test Type      | Automated Command                                                                                                                                                                                                                                                                                                                                        | File Exists? |
| ------- | ---------------------------------------------------------------------------------------------------------------------------- | -------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------ |
| COMP-10 | Canonical route stability + EN/PT counterpart integrity + alias deny-list                                                    | contract + e2e | `node --test tests/compatibility-contract.test.mjs && npx playwright test e2e/compatibility.spec.ts --project=chromium`                                                                                                                                                                                                                                  | yes          |
| QA-10   | Regression lock for gameplay determinism, payouts, economy, interaction guards, i18n parity, and runtime route/i18n behavior | contract + e2e | `node --test tests/slots-core-determinism-contract.test.mjs tests/slots-payline-evaluation-contract.test.mjs tests/slots-economy-contract.test.mjs tests/slots-interaction-guards-contract.test.mjs tests/slots-i18n-parity-contract.test.mjs tests/compatibility-contract.test.mjs && npx playwright test e2e/compatibility.spec.ts --project=chromium` | yes          |

### Recommended Contract + E2E Split (Fail-Fast)

1. Contract gate (block immediately on invariant breaks):
   - `tests/compatibility-contract.test.mjs`
   - `tests/slots-core-determinism-contract.test.mjs`
   - `tests/slots-payline-evaluation-contract.test.mjs`
   - `tests/slots-economy-contract.test.mjs`
   - `tests/slots-interaction-guards-contract.test.mjs`
   - `tests/slots-i18n-parity-contract.test.mjs`
2. Focused runtime gate (only after contracts pass):
   - `e2e/compatibility.spec.ts` on `--project=chromium`
3. Build gate last:
   - `npm run build`

### Sampling Rate

- **Per task commit:** `node --test tests/compatibility-contract.test.mjs tests/slots-core-determinism-contract.test.mjs tests/slots-payline-evaluation-contract.test.mjs tests/slots-economy-contract.test.mjs tests/slots-interaction-guards-contract.test.mjs tests/slots-i18n-parity-contract.test.mjs`
- **Per wave merge:** `npx playwright test e2e/compatibility.spec.ts --project=chromium && npm run build`
- **Phase gate:** contracts + focused E2E + build all green before `/gsd:verify-work`

### Wave 0 Gaps

- None - existing test infrastructure covers COMP-10 and QA-10.

## Sources

### Primary (HIGH confidence)

- `.planning/phases/15-compatibility-and-regression-hardening/15-CONTEXT.md` - locked decisions/scope/deferred constraints for this phase
- `.planning/REQUIREMENTS.md` - authoritative COMP-10 and QA-10 requirement text
- `tests/compatibility-contract.test.mjs` - canonical matrix + alias deny contract pattern
- `e2e/compatibility.spec.ts` - focused runtime compatibility journeys
- `tests/slots-core-determinism-contract.test.mjs` - deterministic state/seed contracts
- `tests/slots-payline-evaluation-contract.test.mjs` - payout correctness contracts
- `tests/slots-economy-contract.test.mjs` - debit/settle arithmetic invariants
- `tests/slots-interaction-guards-contract.test.mjs` - invalid action blocking contracts
- `tests/slots-i18n-parity-contract.test.mjs` - EN/PT key and page-usage parity contracts
- `src/scripts/slots/controller.ts` - runtime `data-slots-*` state source
- `src/i18n/utils.ts` - counterpart path helper
- `playwright.config.ts` - E2E project/webServer config
- `CLAUDE.md` - repository constraints

### Secondary (MEDIUM confidence)

- npm registry metadata (`npm view`) for latest `@playwright/test` and `astro` versions and publish timestamps

### Tertiary (LOW confidence)

- None

## Metadata

**Confidence breakdown:**

- Standard stack: HIGH - directly verified from workspace config and npm registry metadata.
- Architecture: HIGH - derived from current passing tests and production code paths.
- Pitfalls: HIGH - tied to known failure modes directly represented in existing contract/E2E assertions.

**Research date:** 2026-04-02
**Valid until:** 2026-05-02
