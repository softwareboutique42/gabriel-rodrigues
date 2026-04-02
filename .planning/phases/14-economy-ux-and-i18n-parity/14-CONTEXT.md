# Phase 14: Economy, UX, and i18n Parity - Context

**Gathered:** 2026-04-02
**Status:** Ready for planning
**Source:** /gsd:next -> /gsd:discuss-phase 14

<domain>
## Phase Boundary

Add a session-safe credits/bet economy loop and bilingual gameplay UX parity on top of the deterministic round engine delivered in Phase 13.

In scope:

- Implement credits/bet flow for round entry, payout settlement, and balance updates (SLOT-12)
- Add gameplay interaction guardrails for invalid actions and low-balance states (UX-10)
- Add EN/PT gameplay copy and labels with parity checks for all new user-facing state text (I18N-10)
- Keep deterministic round result pipeline as source of truth for payout units consumed by economy updates

Out of scope:

- Route/i18n compatibility hardening matrix and broad regression expansion (Phase 15)
- Real-money wagering, deposits, payouts, checkout flows, or gambling compliance work
- Multi-line paytable expansion beyond Phase 13 center-line baseline unless required for UX messaging clarity
- New alias routes under `/projects/slots/*`
  </domain>

<decisions>
## Implementation Decisions

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
  </decisions>

<specifics>
## Specific Ideas

- Use a small bet control model (for example: decrement/increment or fixed chips) to reduce invalid input paths.
- Expose balance and bet values through deterministic data attributes to simplify contract and E2E assertions later.
- Keep insufficient-credit feedback explicit and immediate near the spin control.
  </specifics>

<canonical_refs>

## Canonical References

- `.planning/ROADMAP.md`
- `.planning/REQUIREMENTS.md`
- `.planning/PROJECT.md`
- `.planning/phases/13-slots-core-gameplay-loop/13-CONTEXT.md`
- `.planning/phases/13-slots-core-gameplay-loop/13-RESEARCH.md`
- `.planning/phases/13-slots-core-gameplay-loop/13-01-PLAN.md`
- `.planning/phases/13-slots-core-gameplay-loop/13-01-SUMMARY.md`
- `src/scripts/slots/controller.ts`
- `src/scripts/slots/main.ts`
- `src/scripts/slots/engine/round.ts`
- `src/scripts/slots/engine/payout.ts`
- `src/pages/en/slots/index.astro`
- `src/pages/pt/slots/index.astro`
- `src/i18n/en.json`
- `src/i18n/pt.json`
- `tests/slots-core-determinism-contract.test.mjs`
- `tests/slots-payline-evaluation-contract.test.mjs`
- `tests/slots-shell-foundation.test.mjs`
- `tests/compatibility-contract.test.mjs`
  </canonical_refs>

<code_context>

## Existing Code Insights

### Reusable Assets

- `src/scripts/slots/controller.ts`: current state rendering and spin dispatch point, ideal place for economy guardrails.
- `src/scripts/slots/engine/round.ts`: deterministic result and payout units source for balance settlement.
- `src/scripts/slots/engine/state-machine.ts`: explicit transition guard model to extend with insufficient-credit feedback behavior.

### Established Patterns

- SPA-safe mounting through `astro:page-load` with cleanup from `AbortController`.
- Canonical EN/PT route parity and alias deny-list constraints from phases 11-13.
- Fast node:test contract gates for deterministic and parity checks before broader E2E.

### Integration Points

- Economy state should be applied in controller layer around existing `resolveRound()` lifecycle.
- New EN/PT gameplay copy should map through i18n keys used in slots pages.
- Phase 15 will consume this phase's data hooks for compatibility and UX regression E2E.
  </code_context>

<deferred>
## Deferred Ideas

- Persisted wallet/profile economy and cross-session balance storage
- Real-money mechanics and Stripe-linked wagering
- Advanced payline complexity and bonus game modes
- Full route compatibility matrix and E2E expansion (Phase 15)
  </deferred>

---

_Phase: 14-economy-ux-and-i18n-parity_
_Context gathered: 2026-04-02_
