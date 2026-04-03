# Phase 33: Bridge and Authority Hardening - Research

**Researched:** 2026-04-03
**Domain:** Slots-to-tutorial bridge contract hardening and authority-boundary enforcement (Casinocraftz host + Slots runtime)
**Confidence:** HIGH

<user_constraints>

## User Constraints (from CONTEXT.md)

### Locked Decisions

- Phase 33 is a hardening phase for bridge contracts and authority boundaries only; it does not add net-new tutorial beats, card mechanics, or gameplay systems.
- BRG-50 is satisfied by evolving the existing bridge contract with explicit versioning and backward compatibility, not by replacing the current bridge channel.
- BRG-51 is satisfied by keeping tutorial and card layers strictly presentation-only relative to Slots authority (RNG, payout, economy, spin lifecycle).
- Existing deterministic progression trigger remains the baseline: tutorial progression advances from `ccz:spin-settled` bridge events emitted from spin-resolved visuals.
- Existing canonical route model remains authoritative: `/en/casinocraftz/`, `/pt/casinocraftz/`, embedded `/{lang}/slots/?host=casinocraftz`, and standalone `/{lang}/slots/`.

### Claude's Discretion

- None explicitly provided in CONTEXT.md.

### Deferred Ideas (OUT OF SCOPE)

- New tutorial steps, new card inventory, new card effect classes, or progression redesign.
- Any Slots authority changes: RNG logic, payout logic, economy rules, reel or outcome semantics.
- New routing families, canonical path changes, or alias expansions.
- Broad UX redesign or copy expansion beyond what is required to document and verify hardened contracts.
- Phase 34+ goals (learning loop clarity, bounded progression UX), Phase 35 parity matrix expansion, and Phase 36 release-confidence closure work.

</user_constraints>

<phase_requirements>

## Phase Requirements

| ID     | Description                                                                                                                         | Research Support                                                                                                                                                                                                                                             |
| ------ | ----------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| BRG-50 | Slots-to-tutorial bridge events are versioned and backward-compatible so host integration remains deterministic across route modes. | Add explicit versioned bridge envelope on sender (`slots/main.ts`), tolerant parser on receiver (`tutorial/main.ts`) that accepts legacy and v1 payloads, and deterministic tests for accepted/unknown/malformed payload handling.                           |
| BRG-51 | Tutorial and card layers remain presentation-only and cannot mutate Slots gameplay authority, economy, payout, or RNG paths.        | Keep authority isolation at module boundaries (`tutorial/cards.ts`, `tutorial/engine.ts`) and extend contracts/browser checks to prove tutorial/card interactions do not change authoritative Slots outputs (`data-slots-*`, seed/outcome/economy envelope). |

</phase_requirements>

## Summary

Phase 33 should be planned as a strict hardening wave over the existing bridge path between embedded Slots and Casinocraftz tutorial runtime. Current implementation already emits and consumes `ccz:spin-settled`, but the payload is unversioned and permissive (`{ type, spinIndex }`), so deterministic compatibility depends on implicit shape rather than an explicit contract. That is the highest-risk gap for BRG-50.

The authority model is mostly healthy today: tutorial/card modules remain presentation-oriented and operate through local dataset/class updates, while Slots authority remains in the Slots runtime. Phase 33 should make this boundary explicit and testable, including negative-path guarantees that malformed/unknown bridge payloads are ignored without mutating tutorial progression or any Slots authoritative state.

Deterministic confidence should continue using existing infrastructure: `node:test` contract suites plus targeted Playwright compatibility checks. No new framework is required. Plan work should focus on bridge schema hardening, safe parser boundaries, and parity-safe regression checks across EN/PT and embedded/standalone host modes.

**Primary recommendation:** Introduce a versioned `ccz:spin-settled` envelope with backward-compatible parsing, codify fail-safe behavior for unknown/malformed bridge payloads, and extend existing contract/E2E suites to prove authority isolation without feature expansion.

## Project Constraints (from CLAUDE.md)

- Astro 6 + Tailwind v4 stack is fixed; no stack migration in this phase.
- EN/PT routing remains file-based under `src/pages/en/` and `src/pages/pt/`; parity must be preserved.
- Client scripts must initialize through `astro:page-load` and clean up listeners for SPA navigation safety.
- Playwright (`e2e/`) is the canonical browser validation system.
- Node.js minimum is `>=22.12.0`.
- Conventional commits are enforced.

## Standard Stack

### Core

| Library                                    | Version                           | Purpose                                                                                                              | Why Standard                                                                    |
| ------------------------------------------ | --------------------------------- | -------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------- |
| Node.js built-in test runner (`node:test`) | local `22.22.1`                   | Source-level contract hardening for bridge and authority boundaries.                                                 | Existing `tests/*.test.mjs` suites already use this pattern and run quickly.    |
| Playwright (`@playwright/test`)            | project `1.58.2`, latest `1.59.1` | Browser-level deterministic validation for EN/PT route parity, embed host parity, and tutorial progression behavior. | Existing high-signal compatibility checks are in `e2e/compatibility.spec.ts`.   |
| Astro                                      | project `6.0.8`, latest `6.1.3`   | Runtime/build framework for canonical EN/PT surfaces and embed pages.                                                | Phase validation depends on route generation and client scripts in Astro pages. |
| ESLint                                     | project/latest `10.1.0`           | Guard against contract-hardening regressions and unsafe patterns.                                                    | Existing release chain already includes lint gate.                              |

### Supporting

| Library                                       | Version                        | Purpose                                   | When to Use                                                    |
| --------------------------------------------- | ------------------------------ | ----------------------------------------- | -------------------------------------------------------------- |
| npm scripts (`npm run build`, `npm run lint`) | local npm `10.9.4`             | Deterministic release-evidence chain.     | End-of-phase verification and reproducible evidence capture.   |
| Playwright JSON reporter                      | bundled with Playwright 1.58.2 | Machine-readable browser artifact output. | Capture targeted compatibility evidence in `.planning/debug/`. |

### Alternatives Considered

| Instead of                                  | Could Use                                              | Tradeoff                                                                                                |
| ------------------------------------------- | ------------------------------------------------------ | ------------------------------------------------------------------------------------------------------- |
| Existing `node:test` + Playwright harness   | New schema-testing framework or custom browser harness | Adds non-scope tooling complexity and weakens deterministic continuity with existing phase gates.       |
| Lightweight typed guards for bridge payload | External runtime schema library                        | Extra dependency and integration churn for a narrow envelope; this phase can remain dependency-neutral. |

**Installation:**

```bash
npm install
```

**Version verification:**

```bash
npm view astro version
npm view @playwright/test version
npm view eslint version
```

Verified on 2026-04-03:

- `astro` latest `6.1.3` published `2026-04-01T21:06:17.561Z`
- `@playwright/test` latest `1.59.1` published `2026-04-01T17:59:00.155Z`
- `eslint` latest `10.1.0` published `2026-03-20T15:31:41.125Z`

## Architecture Patterns

### Recommended Project Structure

```text
src/scripts/slots/
└── main.ts                              # bridge sender (emit versioned + legacy-compatible payload path)

src/scripts/casinocraftz/tutorial/
├── main.ts                              # bridge receiver/parser + fail-safe handling
├── engine.ts                            # deterministic step progression state machine
├── cards.ts                             # presentation-only card effects
└── types.ts                             # tutorial/card domain types (authority boundary references)

tests/
├── casinocraftz-tutorial-contract.test.mjs   # bridge + authority-boundary source contracts
├── compatibility-contract.test.mjs           # canonical route/embed invariants
└── slots-i18n-parity-contract.test.mjs       # EN/PT parity hooks and host-mode invariants

e2e/
└── compatibility.spec.ts                 # deterministic browser compatibility matrix slices
```

### Pattern 1: Versioned Bridge Envelope with Backward Compatibility

**What:** Keep the existing channel/event name (`ccz:spin-settled`) but evolve payload shape to include `version`, while accepting legacy `{ type, spinIndex }` payload.

**When to use:** Slots sender emission and tutorial receiver parsing.

**Example:**

```typescript
// Source: planned hardening in src/scripts/slots/main.ts + src/scripts/casinocraftz/tutorial/main.ts
// Sender
window.parent.postMessage(
  {
    type: 'ccz:spin-settled',
    version: 1,
    payload: { spinIndex: event.spinIndex },
  },
  '*',
);

// Receiver (backward-compatible)
if (data?.type !== 'ccz:spin-settled') return;
const spinIndex = data?.version === 1 ? data?.payload?.spinIndex : data?.spinIndex;
if (!Number.isInteger(spinIndex) || spinIndex < 0) return; // fail-safe ignore
```

### Pattern 2: Fail-Safe Validation Boundary

**What:** Unknown version, malformed payload, or non-object message must be ignored with no state mutation.

**When to use:** `window.message` handler in tutorial runtime.

**Example:**

```typescript
// Source: planned hardening in src/scripts/casinocraftz/tutorial/main.ts
const previousState = state;
const bridgeEvent = parseSpinSettledBridgeEvent(event.data);
if (!bridgeEvent) return;
state = recordSpin(state);
if (state === previousState) {
  syncRootDatasets(root, state, essenceState.balance);
}
```

### Pattern 3: Authority Isolation by Design

**What:** Tutorial/cards operate on tutorial state and `data-casinocraftz-*` projection only; Slots authority (`RNG`, payout, economy) is read-only from host perspective.

**When to use:** Any tutorial/card interaction, including bridge-triggered transitions.

**Example:**

```typescript
// Source: src/scripts/casinocraftz/tutorial/cards.ts
root.dataset.casinocraftzActiveCard = cardId;
tutorialZone.classList.add(`ccz-card--${cardId}`);
// No import or mutation of slots authority modules.
```

### Anti-Patterns to Avoid

- Replacing bridge channel name or transport for this phase instead of evolving current contract.
- Advancing tutorial from arbitrary UI events unrelated to bridge spin progression.
- Letting malformed bridge payloads mutate tutorial state.
- Importing Slots authority internals into tutorial/card modules.
- Expanding into new tutorial mechanics/cards under the guise of hardening.

## Concrete File Targets Likely to Change in Execution

Primary execution targets for BRG-50/BRG-51:

- `src/scripts/slots/main.ts`
- `src/scripts/casinocraftz/tutorial/main.ts`
- `tests/casinocraftz-tutorial-contract.test.mjs`
- `e2e/compatibility.spec.ts`

Secondary verification/guard targets (likely touched if contract assertions are strengthened):

- `tests/compatibility-contract.test.mjs`
- `tests/slots-i18n-parity-contract.test.mjs`

Evidence artifact target:

- `.planning/debug/slots-playwright-report.json`

## Don't Hand-Roll

| Problem                     | Don't Build                                  | Use Instead                                                                     | Why                                                                                         |
| --------------------------- | -------------------------------------------- | ------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------- |
| Bridge contract migration   | New message bus/channel or parallel protocol | Evolve existing `ccz:spin-settled` contract with versioning + legacy acceptance | Preserves compatibility and minimizes integration blast radius.                             |
| Browser confidence harness  | Ad-hoc Node scripts as primary gate          | Existing Playwright compatibility scenarios in `e2e/compatibility.spec.ts`      | Already covers canonical EN/PT + host mode behavior with deterministic selectors.           |
| Authority verification      | Informal code review only                    | Source contracts + targeted browser assertions on `data-slots-*` invariants     | Provides auditable, deterministic proof that tutorial/cards do not alter authority outputs. |
| Schema validation framework | Heavy runtime dependency for tiny payload    | Lightweight in-module parser/guard function                                     | Faster rollout, no dependency churn, sufficient for a single event envelope.                |

**Key insight:** Hardening succeeds when transport stays stable and boundaries become explicit. Rewriting channels or adding framework churn increases risk without improving deterministic guarantees.

## Common Pitfalls

### Pitfall 1: Version Field Added but Legacy Path Removed

**What goes wrong:** Older or unchanged listeners stop progressing tutorial state.

**Why it happens:** Sender/receiver are updated asymmetrically.

**How to avoid:** Receiver must parse both legacy `{ spinIndex }` and v1 `{ version: 1, payload.spinIndex }` forms.

**Warning signs:** EN/PT tutorial stalls at `play-and-observe` in embedded host runs.

### Pitfall 2: Unknown/Malformed Payload Still Mutates State

**What goes wrong:** Garbage bridge messages advance steps or unlock cards.

**Why it happens:** Parser defaults values or skips strict shape checks.

**How to avoid:** Reject non-object, unknown-version, and invalid `spinIndex`; do not call progression functions on rejected payloads.

**Warning signs:** Tutorial step changes after synthetic malformed `postMessage` injections.

### Pitfall 3: Authority Boundary Drift via Convenience Imports

**What goes wrong:** Tutorial/card logic starts coupling to Slots authority modules.

**Why it happens:** Quick access to payout/economy internals during hardening edits.

**How to avoid:** Keep tutorial/card modules presentation-only; preserve import deny-list contracts.

**Warning signs:** New imports from Slots authority paths in tutorial/card files.

### Pitfall 4: Embedded/Standalone Determinism Regression

**What goes wrong:** Bridge hardening unintentionally alters standalone Slots behavior.

**Why it happens:** Shared runtime paths touched without host-mode guards.

**How to avoid:** Keep bridge emission gated to `host=casinocraftz`; re-run standalone deterministic checks unchanged.

**Warning signs:** Standalone `/en/slots/` or `/pt/slots/` seed/outcome/state drift.

## Code Examples

Verified patterns from current repository and planned hardening:

### Existing Bridge Sender Baseline

```typescript
// Source: src/scripts/slots/main.ts
if (event.type === 'spin-resolved') {
  window.parent.postMessage({ type: 'ccz:spin-settled', spinIndex: event.spinIndex }, '*');
}
```

### Existing Bridge Receiver Baseline

```typescript
// Source: src/scripts/casinocraftz/tutorial/main.ts
if (event.data?.type !== 'ccz:spin-settled') return;
state = recordSpin(state);
```

### Recommended Hardened Parser Pattern

```typescript
// Source: planned in src/scripts/casinocraftz/tutorial/main.ts
function parseSpinSettledBridgeEvent(data: unknown): { spinIndex: number } | null {
  if (!data || typeof data !== 'object') return null;
  const d = data as Record<string, unknown>;
  if (d.type !== 'ccz:spin-settled') return null;

  if (d.version === 1) {
    const payload = d.payload as Record<string, unknown> | undefined;
    const spinIndex = payload?.spinIndex;
    return Number.isInteger(spinIndex) && Number(spinIndex) >= 0
      ? { spinIndex: Number(spinIndex) }
      : null;
  }

  const legacySpinIndex = d.spinIndex;
  return Number.isInteger(legacySpinIndex) && Number(legacySpinIndex) >= 0
    ? { spinIndex: Number(legacySpinIndex) }
    : null;
}
```

## State of the Art

| Old Approach                                        | Current Approach                                                     | When Changed    | Impact                                                       |
| --------------------------------------------------- | -------------------------------------------------------------------- | --------------- | ------------------------------------------------------------ |
| Implicit bridge payload contract                    | Explicit bridge envelope versioning with legacy tolerance            | Phase 33 target | Safer long-term evolution without host/runtime breakage.     |
| Positive-path progression checks                    | Positive + negative-path deterministic bridge checks                 | Phase 33 target | Prevents malformed input from mutating tutorial state.       |
| Boundary confidence mainly from import regex checks | Boundary confidence from source contracts + runtime invariant checks | Phases 31-33    | Stronger proof that tutorial/cards remain presentation-only. |

**Deprecated/outdated for this phase:**

- Assuming any `ccz:spin-settled` object is valid without schema guard.
- Treating bridge compatibility as EN-only or embedded-only concern.

## Open Questions

1. **Should unknown future bridge versions be fully ignored or logged to diagnostics dataset only?**
   - What we know: Unknown versions must fail safely with no state mutation.
   - What's unclear: Whether to expose a passive diagnostics counter for observability in this phase.
   - Recommendation: Ignore silently for runtime behavior; optional diagnostics can be added only if non-authoritative and parity-safe.

2. **How strict should malformed-bridge browser tests be in this phase?**
   - What we know: Existing E2E suite focuses on deterministic happy path.
   - What's unclear: Whether one malformed-injection check is sufficient or if matrix expansion is required.
   - Recommendation: Add a single high-signal malformed/unknown-version negative test in Chromium as a lock gate; avoid broad matrix expansion.

## Environment Availability

| Dependency     | Required By                          | Available | Version    | Fallback |
| -------------- | ------------------------------------ | --------- | ---------- | -------- |
| Node.js        | `node --test` contracts              | yes       | `v22.22.1` | none     |
| npm            | build/lint/test script orchestration | yes       | `10.9.4`   | none     |
| Playwright CLI | targeted compatibility checks        | yes       | `1.58.2`   | none     |
| Astro CLI      | build/runtime verification           | yes       | `6.0.8`    | none     |
| ESLint CLI     | static regression gate               | yes       | `10.1.0`   | none     |

**Missing dependencies with no fallback:**

- None.

**Missing dependencies with fallback:**

- None.

## Validation Architecture

### Test Framework

| Property           | Value                                                                                                                                       |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------- |
| Framework          | Node.js built-in test runner + Playwright 1.58.2                                                                                            |
| Config file        | `playwright.config.ts`                                                                                                                      |
| Quick run command  | `node --test tests/casinocraftz-tutorial-contract.test.mjs tests/compatibility-contract.test.mjs tests/slots-i18n-parity-contract.test.mjs` |
| Full suite command | `npm run test`                                                                                                                              |

### Phase Requirements -> Test Map

| Req ID | Behavior                                                                             | Test Type      | Automated Command                                                                                                                                                                                                                                                         | File Exists?                                                                                   |
| ------ | ------------------------------------------------------------------------------------ | -------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------ | --- |
| BRG-50 | Bridge uses versioned + backward-compatible deterministic contract across host modes | contract + e2e | `node --test tests/casinocraftz-tutorial-contract.test.mjs tests/compatibility-contract.test.mjs && npx playwright test e2e/compatibility.spec.ts --project=chromium --workers=1 --grep "casinocraftz embeds slots module with canonical EN/PT host parity                | play-and-observe step advances to probability-reveal after 3 spins via postMessage bridge - EN | play-and-observe step advances to probability-reveal after 3 spins via postMessage bridge - PT"` | yes |
| BRG-51 | Tutorial/cards remain presentation-only and cannot mutate Slots authority surfaces   | contract + e2e | `node --test tests/casinocraftz-tutorial-contract.test.mjs tests/slots-i18n-parity-contract.test.mjs && npx playwright test e2e/compatibility.spec.ts --project=chromium --workers=1 --grep "slots runtime compatibility keeps machine-readable gameplay state in EN/PT"` | yes                                                                                            |

### Sampling Rate

- **Per task commit:** `node --test tests/casinocraftz-tutorial-contract.test.mjs tests/compatibility-contract.test.mjs tests/slots-i18n-parity-contract.test.mjs`
- **Per wave merge:** `npx playwright test e2e/compatibility.spec.ts --project=chromium --workers=1 --grep "casinocraftz embeds slots module with canonical EN/PT host parity|play-and-observe step advances to probability-reveal after 3 spins via postMessage bridge - EN|play-and-observe step advances to probability-reveal after 3 spins via postMessage bridge - PT|slots runtime compatibility keeps machine-readable gameplay state in EN/PT"`
- **Phase gate:** `node --test tests/casinocraftz-tutorial-contract.test.mjs tests/compatibility-contract.test.mjs tests/slots-i18n-parity-contract.test.mjs && npx playwright test e2e/compatibility.spec.ts --project=chromium --workers=1 --grep "casinocraftz embeds slots module with canonical EN/PT host parity|play-and-observe step advances to probability-reveal after 3 spins via postMessage bridge - EN|play-and-observe step advances to probability-reveal after 3 spins via postMessage bridge - PT|slots runtime compatibility keeps machine-readable gameplay state in EN/PT" && npx playwright test e2e/compatibility.spec.ts --project=chromium --workers=1 --grep "casinocraftz" --reporter=json > .planning/debug/slots-playwright-report.json && npm run lint && npm run build`

### Wave 0 Gaps

- [ ] Add explicit source contracts for bridge envelope version handling (legacy + v1 + malformed + unknown version) in `tests/casinocraftz-tutorial-contract.test.mjs`.
- [ ] Add one targeted browser negative-path test in `e2e/compatibility.spec.ts` that injects malformed/unknown bridge payload and asserts tutorial step remains stable.
- [ ] Add explicit authority non-mutation assertion after tutorial/card interactions by re-checking Slots deterministic envelope in `e2e/compatibility.spec.ts`.

## Recommended Validation Command List

1. `node --test tests/casinocraftz-tutorial-contract.test.mjs tests/compatibility-contract.test.mjs tests/slots-i18n-parity-contract.test.mjs`
2. `npx playwright test e2e/compatibility.spec.ts --project=chromium --workers=1 --grep "casinocraftz embeds slots module with canonical EN/PT host parity|play-and-observe step advances to probability-reveal after 3 spins via postMessage bridge - EN|play-and-observe step advances to probability-reveal after 3 spins via postMessage bridge - PT|slots runtime compatibility keeps machine-readable gameplay state in EN/PT"`
3. `npx playwright test e2e/compatibility.spec.ts --project=chromium --workers=1 --grep "casinocraftz" --reporter=json > .planning/debug/slots-playwright-report.json`
4. `npm run lint`
5. `npm run build`

## Sources

### Primary (HIGH confidence)

- Repository sources inspected directly:
  - `src/scripts/slots/main.ts`
  - `src/scripts/casinocraftz/tutorial/main.ts`
  - `src/scripts/casinocraftz/tutorial/engine.ts`
  - `src/scripts/casinocraftz/tutorial/cards.ts`
  - `tests/casinocraftz-tutorial-contract.test.mjs`
  - `tests/compatibility-contract.test.mjs`
  - `tests/slots-i18n-parity-contract.test.mjs`
  - `e2e/compatibility.spec.ts`
  - `src/pages/en/casinocraftz/index.astro`
  - `src/pages/pt/casinocraftz/index.astro`
  - `playwright.config.ts`
  - `package.json`
- Phase and requirement context:
  - `.planning/phases/33-bridge-and-authority-hardening/33-CONTEXT.md`
  - `.planning/REQUIREMENTS.md`
  - `.planning/ROADMAP.md`
  - `CLAUDE.md`

### Secondary (MEDIUM confidence)

- npm registry metadata (latest package versions and publish timestamps) via `npm view` for `astro`, `@playwright/test`, `eslint`.

### Tertiary (LOW confidence)

- None.

## Metadata

**Confidence breakdown:**

- Standard stack: HIGH - based on local project configuration plus npm registry verification.
- Architecture: HIGH - based on direct repository code and test surface inspection.
- Pitfalls: HIGH - derived from current bridge implementation gaps and existing deterministic test patterns.

**Research date:** 2026-04-03
**Valid until:** 2026-05-03 (30 days)
