# Phase 11: Slots Shell Foundation - Research

**Researched:** 2026-04-02
**Domain:** Astro bilingual route shell delivery with SPA-safe client bootstrap
**Confidence:** HIGH

<user_constraints>

## User Constraints (from CONTEXT.md)

### Locked Decisions

### Shell information architecture

- Slots pages are shell-only and must communicate "in development" immediately above the fold.
- Keep structure simple: hero heading, concise status messaging, and one clear return path to Projects.
- Do not expose fake gameplay controls that imply functional game mechanics.

### Disclaimer contract (SLOT-02)

- Include explicit bilingual disclaimer language that the Slots experience is not gambling and has no real-money wagering.
- Place disclaimer in visible page content (not only metadata/footer).
- Keep wording direct and compliance-forward rather than playful.

### SPA-safe client bootstrap (SLOT-03)

- Follow existing lifecycle discipline: initialize on `astro:page-load` and guard against duplicate listeners across client-side navigations.
- Use cleanup semantics consistent with established patterns (AbortController-based teardown where listeners are attached).
- Keep bootstrap minimal in this phase: lifecycle safety first, feature behavior deferred.

### Route and i18n continuity

- Slots routes remain canonical-only at `/en/slots/` and `/pt/slots/`.
- Preserve language-switch counterpart behavior for `/slots/` using the same path-localization pattern adopted in earlier phases.
- Any new user-facing Slots shell strings must be added with EN/PT parity.

### Claude's Discretion

- Exact shell visual treatment and section spacing, as long as messaging hierarchy stays explicit
- CTA label wording for returning to Projects/Canvas, as long as canonical routes are used
- Implementation detail of bootstrap module organization, while preserving lifecycle guarantees

### Deferred Ideas (OUT OF SCOPE)

- Interactive reel prototype visuals
- Gameplay rules and payout surfaces
- Funnel/analytics instrumentation tied to Slots engagement
  </user_constraints>

<phase_requirements>

## Phase Requirements

| ID      | Description                                                                                                           | Research Support                                                                                                                                                                              |
| ------- | --------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| SLOT-01 | Slots shell pages exist at `/en/slots/` and `/pt/slots/` with bilingual parity and explicit in-development messaging. | Mirrors proven Phase 10 parity structure (`src/pages/en/projects/index.astro`, `src/pages/pt/projects/index.astro`) and existing slots i18n primitives already present in EN/PT locale files. |
| SLOT-02 | Slots shell includes clear non-gambling/no-real-money disclaimer copy in both locales.                                | Existing `slots.disclaimer` keys in EN/PT establish baseline; recommendation tightens wording to explicit "not gambling / no real-money wagering" and visible placement in shell body.        |
| SLOT-03 | Slots client bootstrap follows Astro SPA-safe lifecycle patterns (`astro:page-load` + idempotent init/cleanup).       | Reuse exact lifecycle pattern from canvas/blog scripts: page-level `astro:page-load` hook, DOM presence guard, and script-level `AbortController` + `astro:before-swap` cleanup.              |

</phase_requirements>

## Summary

Phase 11 should be implemented as a strict shell milestone: two canonical routes (`/en/slots/`, `/pt/slots/`) with matched structure, explicit in-development state, and visible non-gambling/no-money disclaimer text. The repository already has most navigation and i18n primitives needed due Phase 9/10 groundwork. No gameplay logic, RNG, payouts, fake slot controls, payment hooks, or analytics should be introduced.

The main technical risk is SPA lifecycle regressions from client scripts that attach listeners multiple times across Astro client-side transitions. Existing project patterns are clear and reusable: initialize from page-local `astro:page-load` hooks, gate initialization by route DOM IDs, and perform teardown with `AbortController` and `astro:before-swap` when listeners are attached.

Testing should stay contract-oriented (Node built-in test runner), matching prior phase style. Add one focused suite for Slots shell contracts that validates route parity, disclaimers, canonical links, and lifecycle wiring by static source checks. Keep Playwright expansion out of this phase (Roadmap Phase 12 responsibility).

**Primary recommendation:** Deliver only EN/PT shell pages + minimal SPA-safe bootstrap + contract tests; defer all interactive slot mechanics and monetization concerns.

## Project Constraints (from CLAUDE.md)

- Astro 6 static site with Tailwind CSS v4 and file-based EN/PT routes.
- New/modified pages must be updated in both language trees (`src/pages/en/`, `src/pages/pt/`).
- i18n strings must be parity-maintained in `src/i18n/en.json` and `src/i18n/pt.json`.
- Client scripts must initialize on `document.addEventListener('astro:page-load', ...)`, not top-level execution.
- Listener cleanup across SPA navigation should follow AbortController teardown pattern (see `src/scripts/canvas/main.ts`).
- Node runtime requirement is `>=22.12.0`.
- Playwright exists for E2E, but contract-style Node tests are already used for planning-phase regression locks.

## Standard Stack

### Core

| Library     | Version in repo      | Current npm (checked 2026-04-02) | Purpose                          | Why Standard                                                                               |
| ----------- | -------------------- | -------------------------------- | -------------------------------- | ------------------------------------------------------------------------------------------ |
| astro       | ^6.0.8               | 6.1.3 (modified 2026-04-01)      | Site framework + SPA transitions | Existing route/layout/lifecycle model is Astro-native; Phase 11 should extend it directly. |
| tailwindcss | ^4.2.2               | 4.2.2 (modified 2026-03-26)      | Utility styling for shell layout | Existing design tokens and utility classes already power Projects/Canvas pages.            |
| node:test   | Node 22.22.1 runtime | N/A (built-in)                   | Contract test runner             | Existing phase tests already use source-contract checks with `node --test`.                |

### Supporting

| Library          | Version in repo | Purpose                 | When to Use                                                             |
| ---------------- | --------------- | ----------------------- | ----------------------------------------------------------------------- |
| @playwright/test | ^1.58.2         | E2E regression coverage | Keep for Phase 12 hardening; not required for Phase 11 shell contracts. |

### Alternatives Considered

| Instead of                        | Could Use                                    | Tradeoff                                                                           |
| --------------------------------- | -------------------------------------------- | ---------------------------------------------------------------------------------- |
| Node contract tests in this phase | Immediate Playwright E2E expansion           | More runtime/setup cost and broader scope; roadmap defers this matrix to Phase 12. |
| Minimal bootstrap module          | Embedding all behavior inline in page script | Harder cleanup/idempotence control and poorer reuse if Slots evolves later.        |

**Installation:**

```bash
npm install
```

## Architecture Patterns

### Recommended Project Structure

```text
src/
├── pages/
│   ├── en/slots/index.astro      # English shell route
│   └── pt/slots/index.astro      # Portuguese shell route
├── scripts/
│   └── slots/main.ts             # Minimal SPA-safe bootstrap for slots shell
└── i18n/
    ├── en.json                   # Add/adjust slots shell copy if needed
    └── pt.json                   # PT parity for every new key

tests/
└── slots-shell-foundation.test.mjs  # SLOT-01/02/03 contract checks
```

### Pattern 1: Page-local SPA bootstrap trigger with route guard

**What:** Attach `astro:page-load` in page script and guard by page-specific DOM marker before calling init.
**When to use:** Every route that needs client script behavior under Astro ClientRouter.

**Example (repository pattern):**

```ts
document.addEventListener('astro:page-load', () => {
  if (document.getElementById('canvas-form')) {
    initCanvas();
  }
});
```

### Pattern 2: Idempotent script init with AbortController

**What:** Abort prior listeners before registering new ones on re-navigation.
**When to use:** Script modules that bind multiple DOM listeners.

**Example (repository pattern):**

```ts
let controller: AbortController | null = null;

export function initCanvas(): void {
  if (controller) controller.abort();
  controller = new AbortController();
  const { signal } = controller;

  form.addEventListener('submit', onSubmit, { signal });
}
```

### Pattern 3: Route-exit teardown on Astro swap

**What:** Add one-time cleanup when Astro swaps pages.
**When to use:** When disposing renderers, listeners, or route-bound visual state.

**Example (repository pattern):**

```ts
document.addEventListener('astro:before-swap', () => controller.abort(), { once: true });
```

### Recommended Touch Points for Phase 11

- `src/pages/en/slots/index.astro`
- `src/pages/pt/slots/index.astro`
- `src/scripts/slots/main.ts`
- `src/i18n/en.json` (only if new/clearer disclaimer/status keys are introduced)
- `src/i18n/pt.json` (matching parity for any new EN keys)
- `tests/slots-shell-foundation.test.mjs`

### Anti-Patterns to Avoid

- **Gameplay creep:** Adding reels, spin buttons, outcomes, paytable copy, or pseudo-RNG interactions in this phase.
- **Monetization creep:** Adding Stripe/payment/checkout hooks to Slots shell.
- **Lifecycle violations:** Top-level script execution without `astro:page-load`, or listener registration without abortable cleanup.
- **Route drift:** Introducing `/projects/slots/*` aliases or non-canonical slots routes.
- **Locale drift:** Updating one locale page/key without matching counterpart.

## Don’t Hand-Roll

| Problem                            | Don’t Build                                                  | Use Instead                                                               | Why                                                                                    |
| ---------------------------------- | ------------------------------------------------------------ | ------------------------------------------------------------------------- | -------------------------------------------------------------------------------------- |
| Language counterpart routing       | Custom path switch logic per page                            | Existing `getLocalizedPath()` + `LanguageSwitcher`                        | Already handles EN/PT prefix replacement consistently for projects/canvas/slots paths. |
| SPA lifecycle management           | Ad-hoc global flags / manual removeEventListener bookkeeping | AbortController + `{ signal }` listeners and `astro:before-swap` teardown | Cleaner idempotence and fewer duplicate-handler leaks after client transitions.        |
| Regression locking for shell scope | Full browser E2E suite in this phase                         | Node source-contract tests                                                | Fast, deterministic checks aligned with prior phase contracts and scope lock.          |

**Key insight:** The repo already has validated primitives for routing, i18n parity, and SPA cleanup; Phase 11 should compose these, not invent new abstractions.

## Common Pitfalls

### Pitfall 1: "In development" copy present but disclaimer weak

**What goes wrong:** Page has status messaging but does not explicitly state non-gambling and no real-money wagering.
**Why it happens:** Reusing older playful copy (`slots.disclaimer`) without compliance-forward wording.
**How to avoid:** Use explicit language in visible body content and enforce by contract test assertions.
**Warning signs:** Disclaimer exists only in metadata/footer, or lacks both "not gambling" and "no real money" semantics.

### Pitfall 2: Duplicate event handlers after SPA navigation

**What goes wrong:** Slot shell listeners execute multiple times after route switches.
**Why it happens:** Re-initialization on each `astro:page-load` without aborting prior controller.
**How to avoid:** Abort previous controller at start of init and use `{ signal }` for listener registration.
**Warning signs:** Click actions firing twice or more after visiting away and back.

### Pitfall 3: EN/PT parity drift

**What goes wrong:** One locale page or key diverges from counterpart contract.
**Why it happens:** Implementing route or copy changes in only one language tree.
**How to avoid:** Pair edits and test for key and route parity.
**Warning signs:** Missing key or empty string in one locale JSON; links point to wrong locale prefix.

### Pitfall 4: Scope creep into gameplay visuals

**What goes wrong:** Shell begins accumulating interactive slot components beyond foundation scope.
**Why it happens:** "Just a placeholder" controls that imply mechanics.
**How to avoid:** Keep shell informational with only return/discovery CTAs.
**Warning signs:** New IDs/components like reels, paylines, spin, credits, win amounts.

## Code Examples

### Minimal slots page script wiring

```astro
<script>
  import { initSlotsShell } from '../../../scripts/slots/main';

  document.addEventListener('astro:page-load', () => {
    if (document.getElementById('slots-shell-root')) {
      initSlotsShell();
    }
  });
</script>
```

### Minimal idempotent slots bootstrap

```ts
let controller: AbortController | null = null;

export function initSlotsShell(): void {
  if (controller) controller.abort();
  controller = new AbortController();
  const { signal } = controller;

  const root = document.getElementById('slots-shell-root');
  if (!root) return;

  document.addEventListener('astro:before-swap', () => controller?.abort(), {
    once: true,
    signal,
  });
}
```

## State of the Art

| Old Approach                                                | Current Approach                                                       | When Changed                           | Impact                                                                            |
| ----------------------------------------------------------- | ---------------------------------------------------------------------- | -------------------------------------- | --------------------------------------------------------------------------------- |
| Direct Canvas nav entry and weaker slots placeholder text   | Projects hub IA + explicit slots foundation status and canonical links | Phases 9-10 (2026-04-02)               | Slots can now ship as route shell with established discovery and i18n primitives. |
| Route scripts risking duplicate handlers on SPA transitions | `astro:page-load` trigger + AbortController cleanup discipline         | Existing Astro SPA conventions in repo | Enables safe incremental client behavior without listener leaks.                  |

## Open Questions

1. Should existing `slots.disclaimer` locale values be replaced with stronger compliance wording or should new keys be introduced?
   - What we know: Current keys exist in EN/PT and pass parity checks.
   - What is unclear: Whether current wording satisfies stakeholder/legal threshold for "not gambling" clarity.
   - Recommendation: Resolve wording before implementation and lock with explicit regex assertions in test.

2. Should Slots shell include a secondary CTA to Canvas in addition to return-to-Projects?
   - What we know: Context allows CTA wording discretion while maintaining canonical routes.
   - What is unclear: Desired IA emphasis for this phase.
   - Recommendation: Keep one primary return-to-Projects CTA; add optional secondary Canvas CTA only if copy remains concise.

## Environment Availability

| Dependency     | Required By                                 | Available | Version  | Fallback          |
| -------------- | ------------------------------------------- | --------- | -------- | ----------------- |
| Node.js        | Contract test execution (`node --test`)     | Yes       | v22.22.1 | None needed       |
| npm            | Build/lint/test commands                    | Yes       | 10.9.4   | None needed       |
| ripgrep (`rg`) | Fast workspace search during implementation | No        | —        | Use `find`/`grep` |

**Missing dependencies with no fallback:**

- None.

**Missing dependencies with fallback:**

- `rg` not installed; use `find` and `grep` in task execution.

## Validation Architecture

### Test Framework

| Property           | Value                                                                                                                                        |
| ------------------ | -------------------------------------------------------------------------------------------------------------------------------------------- |
| Framework          | Node built-in test runner (`node:test`) + static source contract assertions                                                                  |
| Config file        | none                                                                                                                                         |
| Quick run command  | `node --test tests/slots-shell-foundation.test.mjs`                                                                                          |
| Full suite command | `node --test tests/nav-i18n-primitives.test.mjs tests/projects-hub-delivery.test.mjs tests/slots-shell-foundation.test.mjs && npm run build` |

### Phase Requirements to Test Map

| Req ID  | Behavior                                                                             | Test Type                                    | Automated Command                                                                 | File Exists? |
| ------- | ------------------------------------------------------------------------------------ | -------------------------------------------- | --------------------------------------------------------------------------------- | ------------ |
| SLOT-01 | EN/PT `/slots/` pages exist with in-development shell parity                         | contract (static source)                     | `node --test tests/slots-shell-foundation.test.mjs --test-name-pattern "SLOT-01"` | No - Wave 0  |
| SLOT-02 | Visible bilingual non-gambling/no-real-money disclaimer copy                         | contract (static source + locale key checks) | `node --test tests/slots-shell-foundation.test.mjs --test-name-pattern "SLOT-02"` | No - Wave 0  |
| SLOT-03 | `astro:page-load` wiring + idempotent init/cleanup (`AbortController`, cleanup hook) | contract (source lifecycle assertions)       | `node --test tests/slots-shell-foundation.test.mjs --test-name-pattern "SLOT-03"` | No - Wave 0  |

### Suggested Assertions for tests/slots-shell-foundation.test.mjs

- **SLOT-01 page parity assertions**
  - EN and PT slot pages both import BaseLayout and use locale translations.
  - EN page links only to canonical `/en/projects/` (and optional `/en/canvas/` if added).
  - PT page links only to canonical `/pt/projects/` (and optional `/pt/canvas/` if added).
  - No `/projects/slots/` alias links.
- **SLOT-02 disclaimer assertions**
  - EN/PT locale keys for slots shell disclaimer/status exist and are non-empty.
  - EN disclaimer text includes semantics for both non-gambling and no real money.
  - PT disclaimer text includes semantics for both sem aposta/jogo de azar and sem dinheiro real.
  - Disclaimer key is rendered in both shell pages as visible content block.
- **SLOT-03 lifecycle assertions**
  - Slot pages use `document.addEventListener('astro:page-load', ...)`.
  - Slot pages guard init with shell-root DOM presence check.
  - `src/scripts/slots/main.ts` declares `AbortController` state and aborts previous controller at init start.
  - Slot bootstrap attaches at least one cleanup path on `astro:before-swap`.

### Sampling Rate

- **Per task commit:** `node --test tests/slots-shell-foundation.test.mjs`
- **Per wave merge:** `node --test tests/nav-i18n-primitives.test.mjs tests/projects-hub-delivery.test.mjs tests/slots-shell-foundation.test.mjs`
- **Phase gate:** `node --test tests/nav-i18n-primitives.test.mjs tests/projects-hub-delivery.test.mjs tests/slots-shell-foundation.test.mjs && npm run build`

### Wave 0 Gaps

- [ ] `tests/slots-shell-foundation.test.mjs` - new contract coverage for SLOT-01/02/03
- [ ] No additional framework/config needed (Node test runner already in use)

## Sources

### Primary (HIGH confidence)

- Repository source contracts and phase docs:
  - `.planning/phases/11-slots-shell-foundation/11-CONTEXT.md`
  - `.planning/REQUIREMENTS.md`
  - `.planning/ROADMAP.md`
  - `.planning/STATE.md`
  - `CLAUDE.md`
  - `src/scripts/canvas/main.ts`
  - `src/scripts/blog-search.ts`
  - `src/i18n/utils.ts`
  - `src/components/LanguageSwitcher.astro`
  - `src/components/Header.astro`
  - `src/pages/en/projects/index.astro`
  - `src/pages/pt/projects/index.astro`
  - `src/pages/en/canvas/index.astro`
  - `src/pages/pt/canvas/index.astro`
  - `tests/nav-i18n-primitives.test.mjs`
  - `tests/projects-hub-delivery.test.mjs`

### Secondary (MEDIUM confidence)

- npm registry metadata checked via:
  - `npm view astro version time.modified`
  - `npm view tailwindcss version time.modified`
  - `npm view three version time.modified`
  - `npm view @playwright/test version time.modified`

### Tertiary (LOW confidence)

- None.

## Metadata

**Confidence breakdown:**

- Standard stack: HIGH - confirmed from repository + npm registry lookup.
- Architecture: HIGH - derived from existing implemented patterns in current codebase.
- Pitfalls: HIGH - directly tied to roadmap/context constraints and observed repository practices.

**Research date:** 2026-04-02
**Valid until:** 2026-05-02
