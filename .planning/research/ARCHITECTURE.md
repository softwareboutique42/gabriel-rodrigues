# Architecture Patterns

**Domain:** Casinocraftz v1.8 integration of deterministic Slots authority with tutorial/card presentation
**Researched:** 2026-04-03

## Recommended Architecture

Keep the existing split as a hard contract:

- Slots runtime remains the only authority for spin state, outcome, seed, payout, and balance transitions.
- Tutorial/card layer remains a consumer of machine-readable signals and never computes or mutates slot outcomes.
- The iframe message bridge is the only cross-boundary integration point between module authority and host tutorial progression.

### Component Boundaries

| Component                                                                                 | Responsibility                                                                     | Communicates With                              |
| ----------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------- | ---------------------------------------------- |
| Slots Engine (`src/scripts/slots/engine/*`)                                               | Deterministic round resolution and state transitions                               | Slots controller only                          |
| Slots Controller (`src/scripts/slots/controller.ts`)                                      | Applies economy rules, updates runtime datasets, emits visual events               | Engine, economy, animation runtime             |
| Slots Runtime Host Adapter (`src/scripts/slots/main.ts`)                                  | Resolves host mode (`standalone` vs `casinocraftz`), emits bridge events to parent | Controller visual events, parent window bridge |
| Tutorial Engine (`src/scripts/casinocraftz/tutorial/engine.ts`)                           | Tutorial progression state machine and card unlock conditions                      | Tutorial mount orchestration only              |
| Tutorial/Card UI (`src/scripts/casinocraftz/tutorial/main.ts`, `cards.ts`, `dialogue.ts`) | Renders tutorial state and cards from deterministic tutorial state                 | Tutorial engine and bridge input               |
| EN/PT Route Shells (`src/pages/en/*`, `src/pages/pt/*`)                                   | Parity of embed paths, datasets, and lifecycle bootstraps                          | Runtime init entrypoints                       |

### Data Flow (v1.8 target)

1. User spins in embedded slots iframe (`/en/slots/?host=casinocraftz` or `/pt/slots/?host=casinocraftz`).
2. Slots controller resolves spin deterministically and writes machine-readable runtime datasets on `#slots-shell-root`.
3. Slots host adapter emits a normalized bridge message to parent window when spin resolves.
4. Tutorial bridge validates message shape and forwards a typed signal to tutorial engine.
5. Tutorial engine updates only tutorial state (`spinsObserved`, step transitions, card unlock), then UI syncs root datasets on host page.
6. EN/PT parity is guaranteed by mirrored page structures and mirrored dataset contracts.

## Integration Points For v1.8

### Integration Point A: Versioned Bridge Contract (recommended)

**What:** Introduce a typed versioned message while preserving current compatibility.

- Keep legacy message: `ccz:spin-settled`.
- Add v1.8 envelope: `ccz:spin-event.v1` with `spinIndex`, `seed`, `outcome`, `totalPayoutUnits`, `host`, `locale`, and `schemaVersion`.
- Tutorial side consumes the v1.8 envelope first, then falls back to legacy payload.

**Why:** Maintains backward compatibility and enables richer, machine-readable tutorial triggers without coupling tutorial logic to slots internals.

### Integration Point B: Bridge Validation Layer

**What:** Add a dedicated tutorial bridge module that validates incoming `postMessage` payloads and origin expectations.

- Narrow accepted message types.
- Ignore malformed payloads safely.
- Expose typed callbacks (`onSpinResolved`) to tutorial main module.

**Why:** Keeps tutorial/card presentation deterministic and robust while preserving authority boundaries.

### Integration Point C: Dataset Contract Preservation

**What:** Treat current runtime datasets as public integration API and lock them via tests.

- Slots must continue exposing: `data-slots-state`, `data-slots-host`, `data-slots-balance`, `data-slots-bet`, `data-slots-outcome`, animation state attributes.
- Casinocraftz host must continue exposing: `data-casinocraftz-tutorial-step`, `data-casinocraftz-essence`, card/action datasets.

**Why:** E2E and contract suites already depend on these hooks for EN/PT parity and machine-readable observability.

## New vs Modified Modules (v1.8)

### New Modules

| Module                                              | Type | Purpose                                                                                                 |
| --------------------------------------------------- | ---- | ------------------------------------------------------------------------------------------------------- |
| `src/scripts/casinocraftz/tutorial/bridge.ts`       | New  | Centralize message validation, event normalization, and subscription lifecycle for iframe bridge events |
| `src/scripts/casinocraftz/tutorial/bridge.types.ts` | New  | Declare versioned bridge payload types and guards (`ccz:spin-event.v1`)                                 |
| `tests/casinocraftz-bridge-contract.test.mjs`       | New  | Enforce message schema compatibility and fallback behavior                                              |

### Modified Modules

| Module                                          | Change                                                                                                 |
| ----------------------------------------------- | ------------------------------------------------------------------------------------------------------ |
| `src/scripts/slots/main.ts`                     | Emit versioned bridge payload in embedded host mode while keeping legacy `ccz:spin-settled`            |
| `src/scripts/casinocraftz/tutorial/main.ts`     | Replace direct `window.message` handling with validated bridge subscription                            |
| `src/pages/en/casinocraftz/index.astro`         | Keep parity datasets and ensure tutorial bootstrap continues to mount bridge-aware runtime             |
| `src/pages/pt/casinocraftz/index.astro`         | Mirror EN changes exactly                                                                              |
| `tests/casinocraftz-tutorial-contract.test.mjs` | Extend boundary assertions for new bridge module and preserved slots decoupling                        |
| `e2e/compatibility.spec.ts`                     | Add assertions for v1.8 bridge compatibility while keeping existing parity and machine-readable checks |

## Patterns to Follow

### Pattern 1: Authority-First, UI-Second

**What:** Resolve game truth in slots authority before any bridge/event UI side effects.
**When:** All spin-related interactions.
**Instead of:** Letting tutorial or animation completion define authoritative result state.

### Pattern 2: Backward-Compatible Event Evolution

**What:** Add event versions instead of replacing event contracts.
**When:** Any cross-frame bridge upgrade.
**Instead of:** Breaking `ccz:spin-settled` consumers.

### Pattern 3: EN/PT Lockstep Surface Contracts

**What:** Every integration dataset and embed path change is mirrored in both language pages and tested in the same milestone.
**When:** Any host/page/runtime integration change.
**Instead of:** Shipping EN-first drift.

## Anti-Patterns to Avoid

### Anti-Pattern 1: Tutorial-Derived Slot Outcomes

**What:** Deriving slot result or payout from tutorial-side counters/messages.
**Why bad:** Breaks deterministic authority boundary and creates desync risk.
**Instead:** Tutorial consumes slots authoritative outcome signals only.

### Anti-Pattern 2: Locale-Specific Integration Logic

**What:** Branching bridge logic based on EN/PT DOM differences.
**Why bad:** Creates parity drift and fragile tests.
**Instead:** Keep one shared integration runtime with locale-only copy differences.

### Anti-Pattern 3: Unversioned Message Mutation

**What:** Changing payload shape of existing message type in place.
**Why bad:** Silent breakage in existing tests and host consumers.
**Instead:** Version message type and support a compatibility window.

## Recommended Build Order (v1.8)

1. **Define bridge contract types and guards**
   - Implement `bridge.types.ts` with schema guard functions and legacy fallback shape.
   - Add unit/contract tests for valid/invalid payloads.

2. **Add tutorial bridge module**
   - Implement `bridge.ts` to own `window.message` subscription and cleanup.
   - Refactor tutorial main mount to consume typed bridge events.

3. **Upgrade slots host adapter emission**
   - Extend `src/scripts/slots/main.ts` to emit `ccz:spin-event.v1` and legacy `ccz:spin-settled` together in embedded mode.
   - Preserve standalone behavior and existing dataset writes unchanged.

4. **Apply EN/PT host page parity updates**
   - If any dataset or bootstrap attributes are added, mirror in both Casinocraftz pages in the same commit.
   - Confirm embed path parity remains `/en/slots/?host=casinocraftz` and `/pt/slots/?host=casinocraftz`.

5. **Expand contract tests**
   - Extend tutorial and compatibility contract suites to assert bridge module boundaries and fallback compatibility.

6. **Expand E2E parity checks**
   - Keep existing machine-readable runtime assertions.
   - Add bridge-specific assertions proving tutorial progression under v1.8 event and legacy fallback.

7. **Regression pass (required gate)**
   - Run targeted compatibility tests covering:
     - embedded host parity (EN/PT),
     - machine-readable runtime state hooks,
     - tutorial progression via bridge events.

## Scalability Considerations

| Concern                 | At current scope                  | At next module (v1.8+)           | At multi-module platform                       |
| ----------------------- | --------------------------------- | -------------------------------- | ---------------------------------------------- |
| Cross-frame contracts   | Single legacy event               | Versioned contract + guards      | Shared bridge SDK per module                   |
| Deterministic integrity | Enforced by slots-only authority  | Enforced + typed bridge          | Enforced + signed telemetry envelopes          |
| EN/PT parity drift      | Contract tests                    | Contract + E2E parity gating     | CI parity diff checks across all module shells |
| Runtime observability   | Dataset hooks + Playwright checks | Same + bridge payload assertions | Central telemetry schema validation            |

## Sources

- Workspace implementation review:
  - `src/scripts/slots/main.ts`
  - `src/scripts/slots/controller.ts`
  - `src/scripts/casinocraftz/tutorial/main.ts`
  - `src/scripts/casinocraftz/tutorial/engine.ts`
  - `src/pages/en/casinocraftz/index.astro`
  - `src/pages/pt/casinocraftz/index.astro`
- Workspace contract coverage:
  - `tests/casinocraftz-tutorial-contract.test.mjs`
  - `tests/compatibility-contract.test.mjs`
  - `e2e/compatibility.spec.ts`
