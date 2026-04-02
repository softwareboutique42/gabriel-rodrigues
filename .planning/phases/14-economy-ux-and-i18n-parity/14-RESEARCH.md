# Phase 14: Economy, UX, and i18n Parity - Research

**Researched:** 2026-04-02
**Domain:** Slots economy loop, interaction guardrails, and EN/PT gameplay parity
**Confidence:** HIGH

<user_constraints>

## User Constraints (from CONTEXT.md)

### Locked Decisions

### Economy loop contract (SLOT-12)

- Balance is a session-scoped in-memory value for this phase (no server persistence required).
- Round start requires a valid bet amount and sufficient credits before `SPIN_REQUESTED` is accepted.
- Round settlement applies payout units from deterministic result to balance using explicit arithmetic flow:
  - pre-spin: `balance -= bet`
  - post-result: `balance += payoutUnits * bet`
- Balance must never become negative through normal UI actions.

### Interaction guardrails (UX-10)

- Spin is blocked while state is `spinning` and when credits are insufficient for selected bet.
- Invalid action attempts must produce explicit user-visible status feedback.
- UI state model must include at least: `idle`, `spinning`, `result`, and `insufficient` feedback pathway.

### i18n parity requirements (I18N-10)

- All new gameplay UI labels and statuses added in this phase require EN/PT key parity in `src/i18n/en.json` and `src/i18n/pt.json`.
- Runtime rendering should consume translation keys instead of hardcoded strings for newly introduced user-facing economy/UX text.
- Contract tests should fail when key parity is missing or empty.

### Integration boundaries

- Keep canonical routes unchanged: `/en/slots/` and `/pt/slots/`.
- Preserve existing SPA lifecycle pattern via `initSlotsShell()` and AbortController cleanup.
- Reuse Phase 13 deterministic engine modules; do not duplicate payout logic in UI layer.

### Claude's Discretion

- Exact bet presets and default starting credits values, as long as they support clear UX and stable tests.
- Controller/module split for economy state handling, provided deterministic engine remains isolated and serializable.
- Presentation structure and visual hierarchy for credits/bet/result panel inside current Slots shell layout.

### Deferred Ideas (OUT OF SCOPE)

- Persisted wallet/profile economy and cross-session balance storage
- Real-money mechanics and Stripe-linked wagering
- Advanced payline complexity and bonus game modes
- Full route compatibility matrix and E2E expansion (Phase 15)
  </user_constraints>

<phase_requirements>

## Phase Requirement Coverage

| ID      | Description                                                                                                                      | Research Support                                                                                                                                                                             |
| ------- | -------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| SLOT-12 | Session-safe credits/bet loop supports placing bets, resolving rounds, and updating balance without negative-state bugs.         | Economy model specifies in-memory ledger, guard-first spin acceptance, arithmetic settlement contract, and invariant tests for non-negative balance and deterministic payout multiplication. |
| I18N-10 | All new Slots gameplay copy and status labels are present in both EN/PT with parity checks.                                      | Parity strategy defines shared keyset, mirrored page usage, empty-string contract tests, and hardcoded-string avoidance in controller rendering.                                             |
| UX-10   | Gameplay interaction states (idle, spinning, result, insufficient credits) are clearly communicated and prevent invalid actions. | Guardrail design extends state/status pipeline, blocks invalid clicks, exposes actionable insufficient feedback, and maps interactions to testable DOM state flags.                          |

</phase_requirements>

## Summary

Phase 14 should be implemented as a thin economy/UX layer around the existing deterministic round engine. The current engine contract already provides stable payout units (`totalPayoutUnits`) and deterministic seed/index progression, so this phase should avoid modifying core payout logic and instead orchestrate bet validation, balance mutation, and status rendering inside the Slots controller boundary.

The current shell already preserves SPA-safe lifecycle behavior via `astro:page-load` initialization and AbortController cleanup in `initSlotsShell()`. The recommended approach is to preserve that lifecycle exactly while adding economy fields and interaction controls to both locale pages using translation keys only. This keeps compatibility risk low and aligns with the canonical route and bilingual requirements.

Primary recommendation: implement a session-scoped economy reducer in the controller layer with explicit pre-spin debit/post-result settlement, add an `insufficient` feedback path in the UI status model, and lock behavior with focused Node contract tests before broader Phase 15 compatibility/E2E hardening.

## User-Focused Implementation Approach

### 1) Session-safe credits/bet model (SLOT-12)

Use a controller-owned economy snapshot (in-memory, per page session):

- `balance`: current credits.
- `bet`: selected stake for next round.
- `minBet`, `maxBet`, `betStep` (or explicit preset chips) to avoid free-form numeric drift.
- `lastDelta`: optional signed round delta for post-result messaging (`+` win or `-` loss).

Recommended event flow:

1. `BET_CHANGED` validates/clamps to allowed value set.
2. `SPIN_CLICKED` runs guard pipeline:
   - if engine state is `spinning`: block and show translated busy/invalid status.
   - if `balance < bet`: set status pathway to `insufficient`, do not transition engine.
   - else continue.
3. Pre-spin debit occurs exactly once before requesting spin:
   - `balance = balance - bet`
4. Resolve deterministic round with existing `resolveRound({ baseSeed, spinIndex })`.
5. Post-result settlement:
   - `winCredits = totalPayoutUnits * bet`
   - `balance = balance + winCredits`
6. Assert invariant after every mutation:
   - `balance >= 0`

Arithmetic contract to preserve:

- Round net: `net = (payoutUnits * bet) - bet`
- Balance progression: `balance_next = balance_prev + net`

### 2) Insufficient-credit guardrails (UX-10)

Add explicit user-visible states while keeping engine determinism untouched:

- Keep engine status (`idle|spinning|result`) from Phase 13 state machine.
- Add a presentation feedback channel (example: `uiStatus`) that can be `idle|spinning|result|insufficient|invalid`.
- Avoid forcing `insufficient` into deterministic engine transitions if it is only a UX guard outcome.

Guardrail rules:

- Disable spin button when engine is spinning.
- Disable spin button when `balance < bet`.
- On blocked click, still render a clear translated status line near controls.
- Update root dataset markers for deterministic assertions, e.g.:
  - `data-slots-state`
  - `data-slots-balance`
  - `data-slots-bet`
  - `data-slots-can-spin`
  - `data-slots-feedback`

This enables robust non-visual tests and avoids fragile text-only assertions.

### 3) EN/PT gameplay copy parity strategy (I18N-10)

Current pages still include hardcoded gameplay strings (`State: ...`, `Outcome: ...`, `Start Round`, mixed EN/PT literals). Phase 14 should migrate all new/edited gameplay text to i18n keys and ensure mirrored usage in both locale pages.

Recommended key groups:

- `slots.gameplay.heading`
- `slots.gameplay.spin`
- `slots.gameplay.status.idle`
- `slots.gameplay.status.spinning`
- `slots.gameplay.status.result`
- `slots.gameplay.status.insufficient`
- `slots.gameplay.status.invalidAction`
- `slots.gameplay.outcome.pending`
- `slots.gameplay.outcome.win`
- `slots.gameplay.outcome.loss`
- `slots.gameplay.balance`
- `slots.gameplay.bet`
- `slots.gameplay.hint.insufficient`

Parity enforcement strategy:

- Add keys in both `src/i18n/en.json` and `src/i18n/pt.json` in the same phase commit.
- Render via translation lookup in both Slots pages.
- Replace controller hardcoded labels with key-driven text assembly (or data attribute + localized format in page script).
- Contract test should fail if key missing, wrong type, or empty in either locale.

### 4) Test strategy for economy arithmetic and interaction states

Add Node contract tests (fast, deterministic) for Phase 14 behavior before Playwright expansion:

- Economy arithmetic tests:
  - debit before spin and credit on result using `payoutUnits * bet`
  - zero payout keeps loss net at `-bet`
  - multi-round balance progression remains deterministic
  - balance never negative under permitted actions
- Interaction-state tests:
  - spin ignored while spinning
  - insufficient balance blocks round request and surfaces status
  - bet changes clamp to allowed range/presets
- i18n parity tests:
  - all new gameplay keys present/nonnull/non-empty in EN/PT
  - locale pages reference shared gameplay key families
  - no new hardcoded gameplay literals in controller/page status nodes

## Standard Stack

### Core

| Library/Module                            | Version      | Purpose                                                            | Why Standard                                                                                   |
| ----------------------------------------- | ------------ | ------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------- |
| Astro                                     | 6.0.8 (repo) | EN/PT page shell and SPA lifecycle event wiring                    | Existing site architecture and route system already depend on Astro ClientRouter lifecycle.    |
| TypeScript modules in `src/scripts/slots` | repo-local   | Controller/engine separation for deterministic round orchestration | Existing deterministic contracts and clear boundaries already established in Phase 13.         |
| Node built-in test runner (`node:test`)   | Node 22.22.1 | Fast contract tests for deterministic game/economy logic           | Already used by slots contract suites with sub-second runtime and no extra framework overhead. |

### Supporting

| Tool       | Version       | Purpose                    | When to Use                                                |
| ---------- | ------------- | -------------------------- | ---------------------------------------------------------- |
| npm        | 10.9.4        | Script/task execution      | Run lint/build/e2e as wider gate beyond contract tests.    |
| Playwright | 1.58.2 (repo) | Browser-level verification | Keep for Phase 15 route and interaction journey hardening. |

### Alternatives Considered

| Instead of                       | Could Use                             | Tradeoff                                                          |
| -------------------------------- | ------------------------------------- | ----------------------------------------------------------------- |
| Node contract-first for Phase 14 | Playwright-only assertions            | Slower feedback and less deterministic arithmetic/state checks.   |
| Controller-owned session economy | Persisted wallet/localStorage backend | Adds migration/state-sync risks outside scoped Phase 14 contract. |

**Installation:**

```bash
# No new packages required for Phase 14 implementation.
```

## Architecture Patterns

### Recommended Project Structure

```
src/
├── scripts/slots/               # engine + controller runtime
│   ├── controller.ts            # economy + UX orchestration boundary
│   ├── main.ts                  # SPA mount/unmount lifecycle
│   └── engine/                  # deterministic round + payout source of truth
├── pages/en/slots/index.astro   # EN shell + gameplay controls
├── pages/pt/slots/index.astro   # PT shell + gameplay controls
└── i18n/{en,pt}.json            # gameplay copy parity keys

tests/
├── slots-core-determinism-contract.test.mjs
├── slots-payline-evaluation-contract.test.mjs
├── slots-shell-foundation.test.mjs
└── slots-economy-contract.test.mjs           # recommended Phase 14 addition
```

### Pattern 1: Guard-First Spin Pipeline

**What:** Validate action preconditions before any state transition or arithmetic mutation.
**When to use:** Every spin request and bet update.
**Example:**

```ts
function trySpin() {
  if (engine.status === 'spinning') return feedback('spinning');
  if (economy.balance < economy.bet) return feedback('insufficient');

  economy.balance -= economy.bet;
  engine = transitionEngineState(engine, { type: 'SPIN_REQUESTED' });

  const result = resolveRound({ baseSeed, spinIndex: engine.spinIndex });
  engine = transitionEngineState(engine, { type: 'SPIN_RESOLVED', result });

  economy.balance += result.totalPayoutUnits * economy.bet;
  assert(economy.balance >= 0);
}
```

### Pattern 2: Deterministic Engine Isolation

**What:** Keep payout calculation exclusively in engine modules (`round.ts`, `payout.ts`).
**When to use:** Any economy settlement or result UI update.
**Example:**

```ts
const result = resolveRound({ baseSeed, spinIndex });
const payoutUnits = result.totalPayoutUnits;
const winCredits = payoutUnits * bet;
```

### Pattern 3: Dataset-Backed Contract Assertions

**What:** Expose machine-readable UI state for tests.
**When to use:** Economy values, button availability, feedback status.
**Example:**

```ts
root.dataset.slotsBalance = String(balance);
root.dataset.slotsBet = String(bet);
root.dataset.slotsCanSpin = String(balance >= bet && engine.status !== 'spinning');
root.dataset.slotsFeedback = uiStatus;
```

### Anti-Patterns to Avoid

- **Duplicating payout math in UI:** Use `result.totalPayoutUnits`; do not re-derive paylines in controller.
- **Hardcoded gameplay copy in controller/page literals:** use translation keys only for new Phase 14 gameplay states.
- **Allowing free-form bet input without clamping:** creates invalid and flaky economy states.
- **Changing canonical routes for gameplay work:** defer alias/compat routing concerns to Phase 15.

## Don't Hand-Roll

| Problem                                     | Don't Build                                     | Use Instead                                | Why                                                               |
| ------------------------------------------- | ----------------------------------------------- | ------------------------------------------ | ----------------------------------------------------------------- |
| Round outcome randomness/payout logic       | Ad-hoc UI-side RNG and payout math              | Existing `resolveRound()` + payout modules | Determinism and contract test guarantees already exist.           |
| Locale fallback heuristics for missing keys | Runtime silent fallback strings                 | Strict EN/PT key parity contract tests     | Prevents hidden copy drift and untranslated gameplay states.      |
| Cross-session credit persistence            | Custom localStorage/server wallet in this phase | Session-only in-memory balance             | Persistence is explicitly deferred and adds migration complexity. |

**Key insight:** Phase 14 should compose existing deterministic primitives, not extend engine complexity or introduce persistence scope creep.

## Common Pitfalls

### Pitfall 1: Double debit on repeated interaction

**What goes wrong:** Multiple click paths subtract bet more than once per round.
**Why it happens:** Debit performed before robust spin-state guard or repeated listener registration.
**How to avoid:** Guard-first flow + reuse existing AbortController lifecycle in `initSlotsShell()`.
**Warning signs:** Balance drops by `2*bet` on a single visible spin.

### Pitfall 2: Economy/UI drift after result

**What goes wrong:** Outcome text and numeric ledger disagree.
**Why it happens:** Status rendering built from stale state snapshots.
**How to avoid:** Single render function reading current engine + economy snapshot after each transition.
**Warning signs:** Status says win while balance change equals loss net.

### Pitfall 3: EN/PT parity regressions for gameplay strings

**What goes wrong:** One locale misses new status labels or uses stale hardcoded text.
**Why it happens:** Key added in one locale only or direct literals in page/controller.
**How to avoid:** Keyset parity test + no-hardcoded-gameplay-string rule in contract tests.
**Warning signs:** One locale shows mixed-language status labels.

## Constraints Preservation Notes

- Canonical routes must remain unchanged in this phase: `/en/slots/` and `/pt/slots/` only.
- Do not add `/projects/slots/*` alias routes or route remaps.
- Preserve SPA lifecycle pattern already present:
  - page script attaches under `document.addEventListener('astro:page-load', ...)`
  - `initSlotsShell()` aborts prior listeners
  - `astro:before-swap` cleanup remains active
- Keep deterministic source of truth in `src/scripts/slots/engine/round.ts` and related engine modules.

## Explicit Non-Goals (Deferred to Phase 15)

- Compatibility matrix expansion and broad route/i18n hardening (`COMP-10`).
- Full regression gate expansion combining wide contract + E2E coverage (`QA-10`).
- Alias route behavior changes under `/projects/slots/*`.

## Environment Availability

| Dependency                   | Required By                                 | Available               | Version  | Fallback                                         |
| ---------------------------- | ------------------------------------------- | ----------------------- | -------- | ------------------------------------------------ |
| Node.js                      | Contract tests and slots scripts            | Yes                     | v22.22.1 | None                                             |
| npm                          | Project task execution                      | Yes                     | 10.9.4   | None                                             |
| Playwright (repo dependency) | Full browser regression gates (later phase) | Yes (installed in repo) | 1.58.2   | Use Node contract suites for Phase 14 local gate |

**Missing dependencies with no fallback:**

- None identified for Phase 14 scoped implementation/testing.

**Missing dependencies with fallback:**

- None.

## Validation Architecture

### Test Framework

| Property           | Value                                                                                                                                               |
| ------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| Framework          | Node built-in test runner (`node:test`) for contracts; Playwright for broader E2E                                                                   |
| Config file        | none for node:test; Playwright config at `playwright.config.ts`                                                                                     |
| Quick run command  | `node --test tests/slots-core-determinism-contract.test.mjs tests/slots-payline-evaluation-contract.test.mjs tests/slots-shell-foundation.test.mjs` |
| Full suite command | `npm run test`                                                                                                                                      |

### Phase Requirements -> Test Map

| Req ID  | Behavior                                                            | Test Type     | Automated Command                                              | File Exists? |
| ------- | ------------------------------------------------------------------- | ------------- | -------------------------------------------------------------- | ------------ |
| SLOT-12 | Debit/settlement arithmetic and non-negative balance invariants     | unit/contract | `node --test tests/slots-economy-contract.test.mjs`            | No - Wave 0  |
| I18N-10 | EN/PT gameplay key parity and non-empty values                      | contract      | `node --test tests/slots-i18n-parity-contract.test.mjs`        | No - Wave 0  |
| UX-10   | Invalid action guardrails and insufficient-credit interaction state | contract      | `node --test tests/slots-interaction-guards-contract.test.mjs` | No - Wave 0  |

### Sampling Rate

- Per task commit: `node --test tests/slots-core-determinism-contract.test.mjs tests/slots-payline-evaluation-contract.test.mjs tests/slots-shell-foundation.test.mjs`
- Per wave merge: `node --test tests/slots-core-determinism-contract.test.mjs tests/slots-payline-evaluation-contract.test.mjs tests/slots-shell-foundation.test.mjs tests/slots-economy-contract.test.mjs tests/slots-i18n-parity-contract.test.mjs tests/slots-interaction-guards-contract.test.mjs`
- Phase gate: `node --test tests/slots-core-determinism-contract.test.mjs tests/slots-payline-evaluation-contract.test.mjs tests/slots-shell-foundation.test.mjs tests/slots-economy-contract.test.mjs tests/slots-i18n-parity-contract.test.mjs tests/slots-interaction-guards-contract.test.mjs && npm run test`

### Wave 0 Gaps

- [ ] `tests/slots-economy-contract.test.mjs` - covers SLOT-12 arithmetic and invariants
- [ ] `tests/slots-i18n-parity-contract.test.mjs` - covers I18N-10 gameplay key parity and empty-value checks
- [ ] `tests/slots-interaction-guards-contract.test.mjs` - covers UX-10 blocking behavior and feedback states

## Sources

### Primary (HIGH confidence)

- Repository context: `.planning/phases/14-economy-ux-and-i18n-parity/14-CONTEXT.md`
- Requirements mapping: `.planning/REQUIREMENTS.md`
- Milestone sequencing and Phase 15 deferrals: `.planning/ROADMAP.md`
- Project constraints and architecture: `CLAUDE.md`, `.planning/PROJECT.md`
- Current implementation references:
  - `src/scripts/slots/controller.ts`
  - `src/scripts/slots/main.ts`
  - `src/scripts/slots/engine/round.ts`
  - `src/scripts/slots/engine/state-machine.ts`
  - `src/scripts/slots/engine/payout.ts`
  - `src/pages/en/slots/index.astro`
  - `src/pages/pt/slots/index.astro`
  - `src/i18n/en.json`
  - `src/i18n/pt.json`
- Existing contracts:
  - `tests/slots-core-determinism-contract.test.mjs`
  - `tests/slots-payline-evaluation-contract.test.mjs`
  - `tests/slots-shell-foundation.test.mjs`
  - `tests/compatibility-contract.test.mjs`
- Environment verification and command validation executed on 2026-04-02:
  - `node --version` => `v22.22.1`
  - `npm --version` => `10.9.4`
  - `node --test tests/slots-core-determinism-contract.test.mjs tests/slots-payline-evaluation-contract.test.mjs tests/slots-shell-foundation.test.mjs` => pass

### Secondary (MEDIUM confidence)

- None required; recommendations are grounded in repository contracts and current code constraints.

### Tertiary (LOW confidence)

- None.

## Project Constraints (from CLAUDE.md)

- Use Astro 6 static architecture and existing routing/i18n pattern under `src/pages/en` and `src/pages/pt`.
- Update EN/PT pages and i18n dictionaries together when user-facing copy changes.
- Keep client scripts SPA-safe: initialize logic from `astro:page-load` and clean listeners with AbortController.
- Maintain canonical route behavior; no new alias route conventions introduced by this phase.
- Node runtime baseline: >= 22.12.0.
- Playwright remains the project E2E framework; phase work can use fast contract suites for local verification.

## Metadata

**Confidence breakdown:**

- Standard stack: HIGH - all recommendations use existing in-repo stack and verified local runtime.
- Architecture: HIGH - aligned with current Slots controller/engine boundaries and Phase 14 locked decisions.
- Pitfalls: HIGH - derived directly from observable current implementation gaps and known deterministic/SPA constraints.

**Research date:** 2026-04-02
**Valid until:** 2026-05-02
