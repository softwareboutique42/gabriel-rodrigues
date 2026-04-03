# Phase 18: Slots Animation Runtime Foundation - Research

**Researched:** 2026-04-02
**Domain:** Deterministic slots presentation runtime over authoritative engine transitions
**Confidence:** HIGH

<user_constraints>

## User Constraints (from CONTEXT.md)

### Locked Decisions

### Deterministic authority separation

- Engine and economy remain the only authoritative gameplay sources.
- Animation callbacks must never transition game state or alter result timing.
- Controller emits deterministic visual events keyed by round/spin state and resolved outcome.

### Runtime animation layering

- Introduce a dedicated presentation module boundary between controller events and DOM/canvas animation handling.
- Keep runtime state attributes (`data-slots-*`) as observable compatibility contract surfaces.
- Reel and outcome animations should be interrupt-safe and idempotent across SPA navigations.

### Existing architecture compatibility

- Preserve current `astro:page-load` + AbortController cleanup pattern for listener lifecycle.
- Preserve EN/PT parity for runtime status messaging and state transitions while introducing animation behavior.
- Preserve canonical routes and existing compatibility guarantees from v1.3.

### Testability and reliability baseline

- Expand focused tests for animation event sequencing and state coupling boundaries.
- Avoid brittle purely visual assertions; prefer stable state/event hooks plus targeted user-visible checks.
- Keep phase validation aligned with existing contract + Playwright strategy.

### Claude's Discretion

- Exact module/file split for animation adapter and orchestration utilities.
- Whether to use DOM/CSS animation primitives or a lightweight renderer abstraction in this phase, as long as deterministic boundaries remain intact.
- Exact reel/feedback timing constants and easing choices within acceptable UX and performance limits.

### Deferred Ideas (OUT OF SCOPE)

- Atlas-backed symbol rendering and animated sprite state packs.
- Theme variant switching and theme-specific presentation packs.
- Motion settings UI and reduced-motion intensity profiles.
- Broader cross-browser visual regression matrix.

</user_constraints>

<phase_requirements>

## Phase Requirements

| ID      | Description                                                                                                                                 | Research Support                                                                                                                         |
| ------- | ------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| ANIM-10 | Reel animation lifecycle includes polished spin-up, sustained spin, deterministic stop choreography reflecting existing round state machine | Event contract and reel timeline sequencing sections define deterministic mapping from `SPIN_REQUESTED`/`SPIN_RESOLVED` to visual phases |
| ANIM-11 | Win/loss feedback animations trigger from resolved outcomes without mutating gameplay authority                                             | Outcome event flow and anti-coupling safeguards enforce read-only consumption of resolved engine results                                 |

</phase_requirements>

## Summary

Phase 18 should add a strictly presentation-only runtime that consumes authoritative transitions already produced by `transitionEngineState()` and `resolveRound()`. The existing controller is already the correct choke-point for this: it handles `SPIN_REQUESTED`, debits economy, resolves deterministic result, then applies `SPIN_RESOLVED` with settled economy.

The safest strategy is to introduce a typed visual event stream from the controller and a separate animation runtime module that only observes events and updates visual state. Engine/economy writes remain in the controller/engine path. Existing `data-slots-*` attributes remain the public runtime contract for compatibility tests.

**Primary recommendation:** Implement a controller-owned visual event adapter plus a SPA-safe animation runtime that is strictly read-only against engine/economy state.

## Project Constraints (from CLAUDE.md)

- Use Astro SPA lifecycle rules: initialize via `astro:page-load`, cleanup with AbortController on re-navigation.
- Preserve EN/PT route parity (`/en/*`, `/pt/*`) and mirrored behavior.
- Keep deterministic gameplay authority in existing engine/economy modules; phase is presentation-focused.
- Maintain compatibility with Playwright-based test workflow (`npm run test`).
- Node runtime baseline is `>=22.12.0`.

## Standard Stack

### Core

| Library/Module                                                  | Version           | Purpose                                                      | Why Standard                                       |
| --------------------------------------------------------------- | ----------------- | ------------------------------------------------------------ | -------------------------------------------------- |
| slots engine (`src/scripts/slots/engine/*`)                     | workspace current | Authoritative state and deterministic result resolution      | Already contract-tested and deterministic          |
| slots controller (`src/scripts/slots/controller.ts`)            | workspace current | Boundary between user input/engine/economy and UI projection | Single integration point for visual event emission |
| Astro client lifecycle (`astro:page-load`, `astro:before-swap`) | Astro 6.0.8       | SPA-safe mount/unmount behavior                              | Existing project standard for client scripts       |

### Supporting

| Library/Module                 | Version      | Purpose                                                | When to Use                                     |
| ------------------------------ | ------------ | ------------------------------------------------------ | ----------------------------------------------- |
| Playwright                     | 1.58.2       | Browser-level compatibility assertions                 | Validate state/event contract behavior in EN/PT |
| Node test runner (`node:test`) | Node 22.22.1 | Deterministic contract tests for runtime/event mapping | Validate sequencing without visual timing flake |

### Alternatives Considered

| Instead of                   | Could Use                                          | Tradeoff                                                            |
| ---------------------------- | -------------------------------------------------- | ------------------------------------------------------------------- |
| Controller event adapter     | Direct animation calls inside render/update branch | Faster initially but tightly couples presentation to authority flow |
| Typed animation event object | DOM-only implicit state polling                    | Less boilerplate but weaker sequencing guarantees                   |

**Installation:**

```bash
# No new dependency required for Phase 18 foundation.
# Use existing workspace stack.
```

## Architecture Patterns

### Recommended Project Structure

```text
src/scripts/slots/
├── controller.ts                      # Authority + deterministic visual event emission
├── main.ts                            # SPA mount/dispose wiring
├── animation/
│   ├── runtime.ts                     # Mount/dispose animation runtime
│   ├── events.ts                      # Typed visual event contracts
│   ├── reel-timeline.ts               # Spin-up/sustain/stop choreography state machine
│   └── outcome-feedback.ts            # Win/loss emphasis choreography
└── engine/                            # Authoritative gameplay logic (unchanged authority)
```

### Pattern 1: Controller-to-Animation Event Contract

**What:** Emit typed visual events at deterministic controller checkpoints.

**When to use:** At each authoritative transition already present in `controller.ts`.

**Event flow (recommended):**

1. `SPIN_REQUESTED` accepted -> emit `visual:spin-started` with `{ spinIndex, bet, balanceAfterDebit }`.
2. Controller resolves result (`resolveRound`) and applies `SPIN_RESOLVED` -> emit `visual:spin-resolved` with `{ spinIndex, outcome, totalPayoutUnits, stops, seed }`.
3. Blocked spins emit `visual:spin-blocked` with reason (`insufficient` or `spinning`) for non-authoritative feedback.
4. Runtime drives reel timeline and outcome feedback from these events only.

### Pattern 2: Anti-Coupling Safeguards

**What:** Enforce one-way dependency: engine/economy -> controller -> visual runtime.

**Safeguards:**

- Animation modules cannot import engine transition functions.
- Animation callbacks cannot call `transitionEngineState`, `settleRound`, `debitForRound`, or mutate `data-slots-balance/bet` authoritative values.
- Controller remains sole writer for authoritative `data-slots-*` values; animation runtime may write presentation-only attributes (for example, `data-slots-anim-state`, `data-slots-reel-phase`).
- Runtime consumes immutable event payload snapshots to avoid stale mutable references.

### Pattern 3: SPA-Lifecycle Safe Runtime

**What:** `initSlotsShell()` owns both controller and animation runtime lifecycle.

**When to use:** Every slots page load/navigation.

**Contract:**

- Mount on `astro:page-load`.
- Dispose on `astro:before-swap` via existing AbortController chain.
- Idempotent `mount()` and `dispose()` (safe to call multiple times).

### Anti-Patterns to Avoid

- **Animation completion drives authority:** Never gate result settlement or state transition on `transitionend`, RAF completion, or timeout completion.
- **Shared mutable state object between controller and runtime:** Pass serialized event payloads instead.
- **Visual-only assertions as primary tests:** Keep tests anchored on deterministic attributes/events and only add minimal user-visible checks.

## Suggested Implementation Sequence (Phase 18 Only)

1. Define `animation/events.ts` typed event schema and event dispatcher interface.
2. Add deterministic event emission in `controller.ts` at accepted spin start, spin resolved, and blocked spin branches.
3. Implement `animation/reel-timeline.ts` with deterministic reel phases (`spin-up`, `sustain`, `stop`) derived from emitted events.
4. Implement `animation/outcome-feedback.ts` driven only by resolved payload (`outcome`, `totalPayoutUnits`, `winLines`).
5. Implement `animation/runtime.ts` mount/dispose and event subscription cleanup.
6. Integrate runtime mounting in `main.ts` while preserving current AbortController lifecycle.
7. Add deterministic contract tests for event ordering and no-authority-mutation guarantees.
8. Extend Playwright compatibility checks with stable animation hook assertions (`data-slots-anim-*`), avoiding frame-perfect timing checks.

## Don’t Hand-Roll

| Problem                   | Don’t Build                                | Use Instead                                                   | Why                                                   |
| ------------------------- | ------------------------------------------ | ------------------------------------------------------------- | ----------------------------------------------------- |
| Event ordering guarantees | Ad-hoc timeout chains in DOM handlers      | Typed controller event stream with explicit sequence          | Prevents race conditions and hidden coupling          |
| SPA cleanup               | Manual scattered removeEventListener calls | Central AbortController/dispose pattern in runtime            | Prevents duplicate listeners after route swaps        |
| Determinism verification  | Screenshot/timing-only checks              | Contract tests + stable state hooks + targeted E2E assertions | Reduces flaky failures and catches authority coupling |

## Common Pitfalls

### Pitfall 1: Deterministic Coupling Leak

**What goes wrong:** Animation callbacks mutate authority state or influence resolution timing.

**Why it happens:** Convenience callbacks from animation completion are reused for game logic.

**How to avoid:** Restrict authority writes to controller; lint/test for forbidden imports/calls inside animation modules.

**Warning signs:** Different outcomes or balance/state for same seed/spin sequence.

### Pitfall 2: SPA Listener Duplication

**What goes wrong:** Re-navigation stacks listeners, causing duplicate animations and inconsistent phases.

**Why it happens:** Missing cleanup on `astro:before-swap`.

**How to avoid:** Single owner `runtime.dispose()` wired to AbortController signal.

**Warning signs:** One click triggers multiple spin animations after navigation.

### Pitfall 3: Runtime Performance Drift

**What goes wrong:** Reel animation frame pacing stutters under mobile profile.

**Why it happens:** Over-updating DOM/styles every frame or expensive layout reads.

**How to avoid:** Use RAF-batched writes and transform/opacity-only updates for reel/outcome feedback.

**Warning signs:** FPS drops during `spinning` state on mobile Playwright profile.

## Risk Register

| Risk                                                        | Severity | Detection                                                                | Mitigation                                                                             |
| ----------------------------------------------------------- | -------- | ------------------------------------------------------------------------ | -------------------------------------------------------------------------------------- |
| Deterministic coupling between animation and authority      | High     | Contract tests comparing fixed-seed outcomes before/after runtime wiring | One-way dependency rule, forbidden authority mutations in animation modules            |
| SPA lifecycle leaks (duplicate listeners/runtime instances) | High     | E2E re-navigation test checking single animation trigger per spin        | Centralized dispose via AbortController + idempotent mount/dispose                     |
| Runtime performance regression under sustained spin         | Medium   | Mobile Playwright run and local profiling during repeated spins          | RAF batching, no layout thrash, cap per-frame work and avoid heavy effects in Phase 18 |

## Environment Availability

| Dependency     | Required By                                      | Available | Version | Fallback                                |
| -------------- | ------------------------------------------------ | --------- | ------- | --------------------------------------- |
| Node.js        | Local test/build/contract runs                   | Yes       | 22.22.1 | None                                    |
| npm            | Scripts + Playwright invocation                  | Yes       | 10.9.4  | None                                    |
| Playwright CLI | E2E compatibility validation                     | Yes       | 1.58.2  | None                                    |
| Astro CLI      | Build/preview pipeline used by Playwright config | Yes       | 6.0.8   | None                                    |
| ripgrep (`rg`) | Fast code search workflow                        | No        | -       | Use `grep_search`/`file_search` tooling |

**Missing dependencies with no fallback:**

- None.

**Missing dependencies with fallback:**

- `rg` CLI missing; planner/actions should rely on provided workspace search tools or install ripgrep if shell workflow requires it.

## Validation Architecture

### Test Framework

| Property           | Value                                                                                                         |
| ------------------ | ------------------------------------------------------------------------------------------------------------- |
| Framework          | Playwright 1.58.2 + Node `node:test`                                                                          |
| Config file        | `playwright.config.ts`                                                                                        |
| Quick run command  | `node --test tests/slots-core-determinism-contract.test.mjs tests/slots-interaction-guards-contract.test.mjs` |
| Full suite command | `npm run test`                                                                                                |

### Phase Requirements -> Test Map

| Req ID  | Behavior                                                                     | Test Type               | Automated Command                                                                                                                               | What It Proves                                                                                            |
| ------- | ---------------------------------------------------------------------------- | ----------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| ANIM-10 | Reel lifecycle follows deterministic spin start/resolution events            | Contract + targeted E2E | `node --test tests/slots-core-determinism-contract.test.mjs` and `npm run test -- e2e/compatibility.spec.ts -g "slots runtime compatibility"`   | Engine determinism remains stable; reel lifecycle wiring does not alter authoritative transition outcomes |
| ANIM-11 | Win/loss feedback triggers from resolved outcomes without authority mutation | Contract + targeted E2E | `node --test tests/slots-interaction-guards-contract.test.mjs` and `npm run test -- e2e/compatibility.spec.ts -g "slots runtime compatibility"` | Outcome feedback is derived from resolved state and localized runtime remains stable in EN/PT             |

### Command Set (explicit)

| Command                                                                                                                                                 | Proves                                                                                                     |
| ------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| `npm run lint`                                                                                                                                          | New runtime modules and integration points follow project lint constraints and avoid accidental API misuse |
| `node --test tests/slots-core-determinism-contract.test.mjs tests/slots-interaction-guards-contract.test.mjs tests/slots-i18n-parity-contract.test.mjs` | Determinism, interaction guards, and EN/PT parity contracts remain intact after animation runtime wiring   |
| `npm run test -- e2e/compatibility.spec.ts -g "slots runtime compatibility"`                                                                            | Browser-level slots flow still exposes stable machine-readable state and localized UX while animations run |
| `npm run test -- e2e/compatibility.spec.ts -g "insufficient-credit flow"`                                                                               | Insufficient-credit path remains deterministic and blocked-spin behavior is unchanged                      |

### Sampling Rate

- **Per task commit:** `node --test tests/slots-core-determinism-contract.test.mjs tests/slots-interaction-guards-contract.test.mjs`
- **Per wave merge:** `node --test tests/slots-core-determinism-contract.test.mjs tests/slots-interaction-guards-contract.test.mjs tests/slots-i18n-parity-contract.test.mjs` plus targeted Playwright specs
- **Phase gate:** `npm run lint` and `npm run test`

### Wave 0 Gaps

- Add `tests/slots-animation-event-sequencing-contract.test.mjs` for strict event order assertions.
- Add stable `data-slots-anim-*` hooks in runtime to support deterministic E2E checks without timing flake.

## Open Questions

1. Should Phase 18 expose visual events via internal pub/sub only, or also mirror to `CustomEvent`s on root for test tooling?
2. What exact deterministic reel stop offsets (per reel staggering) should be considered UX-acceptable while remaining seed-independent?

## Sources

### Primary (HIGH confidence)

- `.planning/phases/18-slots-animation-runtime-foundation/18-CONTEXT.md` (locked decisions and scope)
- `.planning/REQUIREMENTS.md` (ANIM-10, ANIM-11 definitions)
- `src/scripts/slots/controller.ts` (authoritative integration boundary)
- `src/scripts/slots/main.ts` (SPA lifecycle pattern)
- `src/scripts/slots/engine/state-machine.ts` and `src/scripts/slots/engine/round.ts` (deterministic authority flow)
- `e2e/compatibility.spec.ts` and `playwright.config.ts` (existing browser validation strategy)
- `CLAUDE.md` (project directives)

### Secondary (MEDIUM confidence)

- `.planning/research/STACK.md` and `.planning/research/ARCHITECTURE.md` (current internal recommendations)

## Metadata

**Confidence breakdown:**

- Standard stack: HIGH - uses already-installed project stack and verified local versions.
- Architecture: HIGH - derived from current controller/engine/main boundaries in repository.
- Pitfalls: HIGH - directly aligned with known SPA/event-loop and determinism risks in current code shape.

**Research date:** 2026-04-02
**Valid until:** 2026-05-02
