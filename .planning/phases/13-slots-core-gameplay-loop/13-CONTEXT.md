# Phase 13: Slots Core Gameplay Loop - Context

**Gathered:** 2026-04-02
**Status:** Ready for planning
**Source:** /gsd:next -> /gsd:discuss-phase 13

<domain>
## Phase Boundary

Implement the first playable Slots round loop using deterministic reel-spin orchestration and payline result evaluation.

In scope:

- Define gameplay state machine for one round (`idle` -> `spinning` -> `result`)
- Implement deterministic spin resolution and reel-stop outcome generation
- Implement payline matching and payout calculation contracts for win/loss paths
- Keep integration inside existing `/en/slots/` and `/pt/slots/` shell routes

Out of scope:

- Credits/bet economy balancing and progression rules (Phase 14)
- Expanded gameplay UX states/copy parity beyond core loop labels (Phase 14)
- Route/i18n compatibility hardening matrix and broad regression gates (Phase 15)
- Real-money wagering, deposits, payouts, and gambling compliance workflows
  </domain>

<decisions>
## Implementation Decisions

### Gameplay state model (SLOT-10)

- Use explicit round lifecycle states and block invalid transitions.
- Keep one active round at a time; ignore or reject spin triggers while already spinning.
- Round output must be represented in a serializable shape suitable for contract tests.

### Determinism contract (SLOT-10)

- For identical input seed/config, reel-stop output and evaluated result must match exactly.
- Determinism must be testable without relying on browser timing.
- Separate random source from evaluation logic so tests can inject fixed outcomes.

### Payline and payout evaluation (SLOT-11)

- Payline evaluation and payout calculation run from resolved reel symbols, never from UI text/state.
- Losses must return zero payout with explicit non-win result metadata.
- Win calculation must return enough structured detail for UI rendering and E2E assertions.

### Integration boundaries

- Reuse existing Slots shell bootstrap (`initSlotsShell`) and keep SPA lifecycle safety rules unchanged.
- Keep canonical routes unchanged: `/en/slots/` and `/pt/slots/`.
- Do not introduce `/projects/slots/*` aliases in this phase.

### Claude's Discretion

- Internal module boundaries (engine/state/helpers) as long as determinism and state invariants are explicit.
- Exact symbol encoding and reel data shape, provided tests can validate outcomes deterministically.
- UI presentation details for core loop status within current shell layout.
  </decisions>

<specifics>
## Specific Ideas

- Prioritize a test-first core engine slice that can run in Node contract tests before UI wiring.
- Prefer deterministic fixture-based reel outcomes for initial win/loss matrix coverage.
- Keep first loop intentionally narrow (single-line or constrained payline set) if it improves correctness and readability.
  </specifics>

<canonical_refs>

## Canonical References

- `.planning/ROADMAP.md`
- `.planning/REQUIREMENTS.md`
- `.planning/PROJECT.md`
- `.planning/phases/11-slots-shell-foundation/11-CONTEXT.md`
- `.planning/phases/11-slots-shell-foundation/11-01-SUMMARY.md`
- `.planning/phases/12-compatibility-and-qa-hardening/12-CONTEXT.md`
- `src/pages/en/slots/index.astro`
- `src/pages/pt/slots/index.astro`
- `src/scripts/slots/main.ts`
- `tests/slots-shell-foundation.test.mjs`
- `tests/compatibility-contract.test.mjs`
- `e2e/compatibility.spec.ts`
  </canonical_refs>

<code_context>

## Existing Code Insights

### Reusable Assets

- `src/scripts/slots/main.ts`: SPA-safe lifecycle wrapper already in place for mounting gameplay behavior.
- `src/i18n/en.json` and `src/i18n/pt.json`: existing Slots key namespace to extend for gameplay states.
- `tests/*contract*.test.mjs`: established node:test contract style for deterministic invariants.

### Established Patterns

- Use `astro:page-load` with root guards and `AbortController` cleanup semantics.
- Keep EN/PT route parity and canonical path discipline from phases 9-12.
- Favor focused contract tests before broader Playwright flows.

### Integration Points

- Slots core loop logic should plug into the existing shell root (`#slots-shell-root`) without changing routing structure.
- Result metadata should be renderable in current Slots page structure and later extendable for Phase 14 economy.
  </code_context>

<deferred>
## Deferred Ideas

- Credits/balance tuning and bet sizing strategy (Phase 14)
- Additional paylines/multi-line complexity after baseline loop correctness
- Analytics events for gameplay funnel
- Visual reel polish and celebratory animation system beyond core correctness
  </deferred>

---

_Phase: 13-slots-core-gameplay-loop_
_Context gathered: 2026-04-02_
