# Phase 13: Slots Core Gameplay Loop - Research

Researched: 2026-04-02
Domain: Deterministic slots round engine and payline evaluation integrated into existing Astro slots shell
Confidence: HIGH

<user_constraints>

## User Constraints (from CONTEXT.md)

### Locked Decisions

- Use explicit round lifecycle states and block invalid transitions.
- Keep one active round at a time; ignore or reject spin triggers while already spinning.
- Round output must be represented in a serializable shape suitable for contract tests.
- For identical input seed/config, reel-stop output and evaluated result must match exactly.
- Determinism must be testable without relying on browser timing.
- Separate random source from evaluation logic so tests can inject fixed outcomes.
- Payline evaluation and payout calculation run from resolved reel symbols, never from UI text/state.
- Losses must return zero payout with explicit non-win result metadata.
- Win calculation must return enough structured detail for UI rendering and E2E assertions.
- Reuse existing Slots shell bootstrap (`initSlotsShell`) and keep SPA lifecycle safety rules unchanged.
- Keep canonical routes unchanged: `/en/slots/` and `/pt/slots/`.
- Do not introduce `/projects/slots/*` aliases in this phase.

### Claude's Discretion

- Internal module boundaries (engine/state/helpers) as long as determinism and state invariants are explicit.
- Exact symbol encoding and reel data shape, provided tests can validate outcomes deterministically.
- UI presentation details for core loop status within current shell layout.

### Deferred Ideas (OUT OF SCOPE)

- Credits/balance tuning and bet sizing strategy (Phase 14)
- Additional paylines/multi-line complexity after baseline loop correctness
- Analytics events for gameplay funnel
- Visual reel polish and celebratory animation system beyond core correctness

</user_constraints>

<phase_requirements>

## Phase Requirements

| ID      | Description                                                                                         | Research Support                                                                                                             |
| ------- | --------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| SLOT-10 | Functional reel spin system with deterministic stopping behavior and predictable state transitions. | Recommended pure round engine + finite-state reducer with injected seeded RNG and repeatable spin contract tests.            |
| SLOT-11 | Payline evaluation and payout calculation logic produces correct outcomes across win/loss cases.    | Recommended deterministic payline evaluator over resolved symbol matrix with payout table contract tests for win/loss paths. |

</phase_requirements>

## Project Constraints (from CLAUDE.md)

- Astro 6 static site with file-based EN/PT routing under `src/pages/en/` and `src/pages/pt/`.
- Keep bilingual parity when adding user-facing copy (both `src/i18n/en.json` and `src/i18n/pt.json`).
- Use SPA-safe lifecycle (`astro:page-load` + `AbortController`) for all client script behavior.
- Keep static deployment assumptions (no SSR server runtime additions).
- Node.js baseline is `>=22.12.0` (environment currently `22.22.1`).

## Summary

Phase 13 should introduce a small, test-first slots core engine that is deterministic, serializable, and independent from DOM timing. The implementation should split pure game logic (state transitions, spin resolution, payline evaluation) from the UI controller that only dispatches actions and renders snapshots into the existing slots shell root.

The strongest approach for this repo is a reducer-driven round state machine plus a seeded pseudo-random generator that is injected as a dependency. This keeps SLOT-10 determinism enforceable in fast `node:test` contracts while preserving the existing `initSlotsShell()` lifecycle and canonical route/i18n constraints from phases 10-12.

Primary recommendation: implement one deterministic round pipeline (`idle -> spinning -> result`) with a constrained payline set (single center row) and explicit serializable `RoundResult` payload, then validate with dedicated contract tests before any Phase 14 economy UX expansion.

## Standard Stack

### Core

| Library                         | Version                                                 | Purpose                               | Why Standard                                                          |
| ------------------------------- | ------------------------------------------------------- | ------------------------------------- | --------------------------------------------------------------------- |
| TypeScript (repo)               | 5.x via Astro toolchain                                 | Core engine + controller modules      | Already used in `src/scripts/`; enables typed deterministic contracts |
| Node `node:test`                | 22.22.1                                                 | Determinism and payout contract tests | Fast, already used by current contract suites                         |
| Astro client script integration | Astro 6.0.8 (repo), 6.1.3 latest (registry, 2026-04-01) | Lifecycle-safe browser integration    | Existing architecture and SPA safety conventions already established  |

### Supporting

| Library    | Version                                             | Purpose                                           | When to Use                                                               |
| ---------- | --------------------------------------------------- | ------------------------------------------------- | ------------------------------------------------------------------------- |
| Playwright | 1.58.2 (repo), 1.59.1 latest (registry, 2026-04-02) | Focused browser verification of shell integration | Use for route and visible-status smoke checks, not core determinism logic |

### Alternatives Considered

| Instead of                             | Could Use                                       | Tradeoff                                                                       |
| -------------------------------------- | ----------------------------------------------- | ------------------------------------------------------------------------------ |
| Seeded in-process PRNG                 | `Math.random()` and timing-based reel stops     | Non-deterministic; cannot satisfy SLOT-10 repeatability contracts              |
| Pure contract tests + minimal UI smoke | Full animation-heavy E2E for payout correctness | Slower, flaky, and duplicates logic already verified deterministically in Node |

Installation:

```bash
# No new packages required for Phase 13 baseline.
```

Version verification commands run:

```bash
npm view astro version time.modified
npm view @playwright/test version time.modified
node --version
npm --version
```

## Architecture Patterns

### Recommended Project Structure

```text
src/
  scripts/
    slots/
      main.ts                       # existing SPA shell bootstrap; wire controller mount
      controller.ts                 # DOM adapter: events, rendering, lifecycle cleanup
      engine/
        types.ts                    # Symbol, ReelConfig, RoundState, RoundResult contracts
        state-machine.ts            # reducer + transition guards (idle/spinning/result)
        rng.ts                      # seeded RNG factory (deterministic, injectable)
        spin-resolver.ts            # produce reel stops + visible matrix from seed/config
        paylines.ts                 # payline definitions + matcher
        payout.ts                   # payout calculation from matches + paytable
        round.ts                    # orchestrates resolve+evaluate into serializable result
tests/
  slots-core-determinism-contract.test.mjs
  slots-payline-evaluation-contract.test.mjs
```

### Pattern 1: Finite State Round Reducer

What: A small reducer with explicit action types and guard logic.

When to use: For all phase-13 transitions (`idle -> spinning -> result`) and invalid-action rejection.

Contract:

- `SPIN_REQUESTED` valid only from `idle` or `result` (starting a new round)
- `SPIN_RESOLVED` valid only from `spinning`
- `RESET_TO_IDLE` optional utility for tests/dev
- All transitions return serializable state snapshot

### Pattern 2: Deterministic Spin Resolution via Injected RNG

What: `resolveSpin(config, seed, spinIndex, rngFactory)` returns reel stop indexes and matrix.

When to use: Every round resolution; tests can inject fake RNG or use known seed.

Determinism strategy:

- Compose round seed as `${baseSeed}:${spinIndex}` to prevent identical consecutive rounds unless intended.
- Use a stable integer PRNG (for example xorshift32 or mulberry32) implemented locally in `rng.ts`.
- Never read randomness from UI code or browser clock.
- Freeze config object in tests to prevent mutation drift.

### Pattern 3: Pure Payline Evaluation Pipeline

What: Evaluate paylines from resolved symbols only, then map to payout.

When to use: Immediately after `resolveSpin`, before rendering.

Phase-13 baseline recommendation:

- 3x3 matrix, 3 reels, 3 rows
- Single payline: center row (`[1,1,1]`) for correctness-first scope
- Left-to-right contiguous matching, minimum 3-of-a-kind to win
- No wild/scatter in phase 13

Result shape (minimum):

```ts
interface RoundResult {
  seed: string;
  spinIndex: number;
  stops: number[]; // index per reel
  matrix: string[][]; // [row][reel]
  paylinesChecked: number;
  winLines: Array<{
    lineId: string;
    symbol: string;
    count: number;
    payoutUnits: number;
  }>;
  totalPayoutUnits: number; // 0 for loss
  outcome: 'win' | 'loss';
}
```

### Anti-Patterns to Avoid

- Driving payline evaluation from rendered text/DOM nodes.
- Letting animation completion timing decide final reel symbols.
- Mutating shared state/config across rounds without explicit reducer actions.
- Adding economy behavior (credits/bets/insufficient state) in this phase.

## Integration Points with Existing Slots Shell

1. Keep existing route files unchanged:

- `src/pages/en/slots/index.astro`
- `src/pages/pt/slots/index.astro`

2. Keep SPA bootstrap pattern unchanged:

- Continue using `document.addEventListener('astro:page-load', ...)` and `initSlotsShell()`.

3. Extend shell DOM minimally (same root id):

- Preserve `id="slots-shell-root"`.
- Add deterministic loop controls/status inside the existing article block (no route/layout changes).

4. Add controller mount from `main.ts`:

- `initSlotsShell()` should initialize one controller instance and abort listeners on `astro:before-swap`.

## Minimal UI Contract for Phase 13

UI should expose only what SLOT-10/11 need for verification:

- `data-slots-state`: current state (`idle|spinning|result`)
- `data-slots-outcome`: `win|loss` when in result
- `data-slots-payout`: numeric payout units
- `button[data-slots-action="spin"]`: disabled while spinning
- `pre[data-slots-result]` (or equivalent): serialized `RoundResult` for deterministic debugging/assertion

Notes:

- Keep copy additions bilingual if user-visible.
- Avoid introducing balance/bet controls (Phase 14).

## Test Strategy

### Contract-first (required for SLOT-10 and SLOT-11)

Add two dedicated suites:

1. `tests/slots-core-determinism-contract.test.mjs`

- Same `seed+config+spinIndex` => identical `stops`, `matrix`, `outcome`, `payout`.
- Different `spinIndex` with same base seed => deterministic but different sequence.
- Invalid transitions rejected (double spin while spinning).

2. `tests/slots-payline-evaluation-contract.test.mjs`

- Win fixture matrix returns expected line match and payout.
- Loss fixture matrix returns `totalPayoutUnits = 0` and `outcome = 'loss'`.
- Deterministic regression fixtures cover at least 1 win + 1 loss path.

### Integration smoke (phase-13 scope)

Optional but recommended lightweight browser check:

- Add `e2e/slots-core-loop.spec.ts` with one round smoke: click spin, wait for state transition to result, assert `data-slots-outcome` exists.
- Keep deep compatibility matrix in Phase 15.

## Don't Hand-Roll

| Problem                           | Don't Build                         | Use Instead                         | Why                                        |
| --------------------------------- | ----------------------------------- | ----------------------------------- | ------------------------------------------ |
| Async spin lifecycle gating       | Ad-hoc booleans across DOM handlers | Reducer + explicit transition table | Prevents invalid transitions and race bugs |
| Deterministic randomness in tests | Browser-timed randomness hacks      | Seeded PRNG module with injection   | Reproducible and CI-stable                 |
| Win/loss verification via UI text | Locale-coupled string parsing       | Structured `RoundResult` contract   | Language-agnostic and robust               |

Key insight: deterministic pure core plus thin UI adapter gives maximum correctness with minimum Phase 13 scope expansion.

## Common Pitfalls

### Pitfall 1: UI/Core State Drift

What goes wrong: UI says `result` while engine still considers `spinning`.
Why it happens: Multiple mutable state holders.
How to avoid: Engine reducer as single source of truth; UI renders from state snapshot only.
Warning signs: double spin triggers, stale result panel.

### Pitfall 2: Hidden Non-Determinism

What goes wrong: Contract tests pass locally but fail intermittently in CI.
Why it happens: seed mixed with `Date.now()`/`performance.now()` or non-stable object iteration.
How to avoid: Explicit seed composition and pure deterministic functions only.
Warning signs: same fixture producing different stops.

### Pitfall 3: Premature Economy Coupling

What goes wrong: payout logic tied to credits state before Phase 14.
Why it happens: Combining concerns in one module.
How to avoid: phase-13 payout returns `payoutUnits`; credits application deferred.
Warning signs: references to balance/bet in phase-13 engine tests.

## Risks and Edge Cases

- Re-entrant spin input during `spinning` (must be ignored/rejected deterministically).
- Off-by-one indexing in reel window extraction near strip boundaries.
- Mismatch between matrix orientation (`[row][reel]` vs `[reel][row]`) causing false payline evaluation.
- Seed collision if `spinIndex` not incorporated.
- Serialization instability if result includes non-JSON-safe values.

## Explicit Non-Goals (Deferred to Phase 14/15)

Deferred to Phase 14:

- Credits/balance loop (`SLOT-12`)
- Bet sizing and insufficient credit UX state
- Full bilingual gameplay copy parity (`I18N-10`)
- Expanded gameplay interaction UX matrix (`UX-10`)

Deferred to Phase 15:

- Canonical route and i18n hardening matrix (`COMP-10`)
- Full contract+E2E regression gate expansion (`QA-10`)

## State of the Art (for this repository)

| Old Approach                          | Current Approach                                 | When Changed | Impact                                                 |
| ------------------------------------- | ------------------------------------------------ | ------------ | ------------------------------------------------------ |
| Slots shell only (static placeholder) | Deterministic round engine integrated into shell | Phase 13     | Enables first playable loop with reproducible outcomes |
| Route-level compatibility focus only  | Add gameplay deterministic contracts             | Phase 13     | Prevents logic regressions before economy features     |

## Environment Availability

| Dependency     | Required By                                       | Available | Version | Fallback                                                            |
| -------------- | ------------------------------------------------- | --------- | ------- | ------------------------------------------------------------------- |
| Node.js        | Contract tests and TS runtime behavior            | Yes       | 22.22.1 | None                                                                |
| npm            | Script execution and package tooling              | Yes       | 10.9.4  | None                                                                |
| Playwright CLI | Optional integration smoke and existing E2E flows | Yes       | 1.58.2  | Use Node contract-only gate if browser smoke is temporarily skipped |

Missing dependencies with no fallback:

- None.

Missing dependencies with fallback:

- None.

## Validation Architecture

### Test Framework

| Property           | Value                                                                                                         |
| ------------------ | ------------------------------------------------------------------------------------------------------------- |
| Framework          | `node:test` (Node 22.22.1) + Playwright (`@playwright/test` 1.58.2 repo)                                      |
| Config file        | `playwright.config.ts`                                                                                        |
| Quick run command  | `node --test tests/slots-core-determinism-contract.test.mjs tests/slots-payline-evaluation-contract.test.mjs` |
| Full suite command | `npm run test`                                                                                                |

### Phase Requirement Coverage

| Requirement | Validation Focus                                                      | Exact Command                                                  |
| ----------- | --------------------------------------------------------------------- | -------------------------------------------------------------- |
| SLOT-10     | State machine transition invariants and deterministic spin resolution | `node --test tests/slots-core-determinism-contract.test.mjs`   |
| SLOT-11     | Payline matching and payout correctness for win/loss fixtures         | `node --test tests/slots-payline-evaluation-contract.test.mjs` |

### Phase Requirements -> Test Map

| Req ID  | Behavior                                                                           | Test Type     | Automated Command                                                 | File Exists? |
| ------- | ---------------------------------------------------------------------------------- | ------------- | ----------------------------------------------------------------- | ------------ |
| SLOT-10 | `idle -> spinning -> result` only, deterministic stop output for fixed seed/config | unit/contract | `node --test tests/slots-core-determinism-contract.test.mjs -x`   | No (Wave 0)  |
| SLOT-11 | Correct payout/win metadata from resolved reel matrix                              | unit/contract | `node --test tests/slots-payline-evaluation-contract.test.mjs -x` | No (Wave 0)  |

### Sampling Rate

- Per task commit: `node --test tests/slots-core-determinism-contract.test.mjs tests/slots-payline-evaluation-contract.test.mjs`
- Per wave merge: `node --test tests/slots-shell-foundation.test.mjs tests/compatibility-contract.test.mjs tests/slots-core-determinism-contract.test.mjs tests/slots-payline-evaluation-contract.test.mjs`
- Phase gate: `npm run build && npm run test -- e2e/compatibility.spec.ts`

### Wave 0 Gaps

- [ ] `tests/slots-core-determinism-contract.test.mjs` - SLOT-10 deterministic lifecycle coverage
- [ ] `tests/slots-payline-evaluation-contract.test.mjs` - SLOT-11 win/loss payout matrix coverage
- [ ] Optional `e2e/slots-core-loop.spec.ts` - browser smoke for visible state progression

## Open Questions

1. Should Phase 13 allow a new spin directly from `result`, or require explicit reset?

- What we know: both can satisfy SLOT-10 if deterministic and guarded.
- What is unclear: preferred UX behavior before Phase 14 controls.
- Recommendation: allow spin from `result` to keep loop simple and reduce extra UI controls.

2. Should symbol set include wild/scatter now?

- What we know: not required by SLOT-10/11.
- What is unclear: whether future payout table expects special symbols.
- Recommendation: defer wild/scatter to Phase 14+; keep phase-13 evaluator simple and deterministic.

## Sources

### Primary (HIGH confidence)

- Internal context: `.planning/phases/13-slots-core-gameplay-loop/13-CONTEXT.md` (locked decisions/discretion/deferred scope)
- Requirements traceability: `.planning/REQUIREMENTS.md`, `.planning/ROADMAP.md`
- Existing integration surface: `src/pages/en/slots/index.astro`, `src/pages/pt/slots/index.astro`, `src/scripts/slots/main.ts`
- Existing validation baseline: `tests/slots-shell-foundation.test.mjs`, `tests/compatibility-contract.test.mjs`, `e2e/compatibility.spec.ts`
- Project constraints: `CLAUDE.md`

### Secondary (MEDIUM confidence)

- NPM registry metadata (current versions and modified dates): `astro`, `@playwright/test`

### Tertiary (LOW confidence)

- None.

## Metadata

Confidence breakdown:

- Standard stack: HIGH - uses existing repository stack and validated local/runtime versions
- Architecture: HIGH - directly derived from locked phase decisions and current shell/test patterns
- Pitfalls: HIGH - based on deterministic-state-machine failure modes observed in this codebase shape

Research date: 2026-04-02
Valid until: 2026-05-02
