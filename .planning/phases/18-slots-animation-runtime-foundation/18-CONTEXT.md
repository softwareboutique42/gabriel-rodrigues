# Phase 18: Slots Animation Runtime Foundation - Context

**Gathered:** 2026-04-02
**Status:** Ready for planning
**Source:** /gsd:next -> /gsd:discuss-phase 18

<domain>
## Phase Boundary

Introduce the first deterministic presentation runtime for Slots that adds polished reel and outcome feedback animations while preserving the authoritative gameplay engine and existing EN/PT behavior.

In scope:

- Add a visual animation layer that maps core state transitions (`idle`, `spinning`, `result`, `insufficient`) to reel and outcome feedback choreography.
- Implement reel lifecycle polish (spin-up, sustained spin, deterministic stop timing) driven by existing controller/engine transitions.
- Implement outcome-driven win/loss feedback animation triggers without mutating payout, economy, or state-machine authority.
- Keep machine-readable runtime hooks and existing contracts stable while animation behavior is integrated.

Out of scope:

- Sprite atlas replacement and symbol art migration (Phase 19+).
- Theme variants and animated symbol state packs (Phase 20).
- Motion accessibility controls and performance budget enforcement (Phase 21).
- Broad regression lock expansion beyond focused phase-level validation updates (Phase 22).
  </domain>

<decisions>
## Implementation Decisions

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
  </decisions>

<specifics>
## Specific Ideas

- Add a typed visual event emitter from controller transitions (spin requested, spin resolved, insufficient blocked).
- Implement reel stop choreography as derived presentation behavior from authoritative result readiness.
- Add win/loss feedback channels that can be disabled or simplified later by reduced-motion controls.
- Keep animation orchestration state serializable or inspectable for easier contract assertions.
  </specifics>

<canonical_refs>

## Canonical References

- `.planning/ROADMAP.md`
- `.planning/REQUIREMENTS.md`
- `.planning/PROJECT.md`
- `.planning/STATE.md`
- `.planning/research/SUMMARY.md`
- `.planning/research/STACK.md`
- `.planning/research/FEATURES.md`
- `.planning/research/ARCHITECTURE.md`
- `.planning/research/PITFALLS.md`
- `.planning/phases/17-slots-runtime-coverage-hardening/17-CONTEXT.md`
- `.planning/phases/17-slots-runtime-coverage-hardening/17-01-SUMMARY.md`
- `.planning/phases/17-slots-runtime-coverage-hardening/17-01-VERIFICATION.md`
- `src/scripts/slots/controller.ts`
- `src/scripts/slots/main.ts`
- `src/scripts/slots/engine/state-machine.ts`
- `src/scripts/slots/engine/round.ts`
- `e2e/compatibility.spec.ts`
- `tests/slots-core-determinism-contract.test.mjs`
- `tests/slots-interaction-guards-contract.test.mjs`
- `tests/slots-i18n-parity-contract.test.mjs`
  </canonical_refs>

<code_context>

## Existing Code Insights

### Reusable Assets

- `src/scripts/slots/controller.ts`: best boundary for emitting visual lifecycle signals from authoritative transitions.
- `src/scripts/slots/main.ts`: existing SPA-safe mount/dispose lifecycle pattern to preserve.
- `e2e/compatibility.spec.ts`: runtime journey checks to extend without breaking established compatibility contracts.

### Established Patterns

- Deterministic core logic is contract-locked; presentation must remain a projection layer.
- Machine-readable data attributes are the current stable runtime observability strategy.
- Focused phase-level hardening with explicit validation evidence is required for clean milestone audits.

### Integration Points

- Controller transition points (`SPIN_REQUESTED`, `SPIN_RESOLVED`, insufficient block path) are the source for animation event hooks.
- Slots pages already carry i18n-backed runtime labels and status messages that animation updates must preserve.
  </code_context>

<deferred>
## Deferred Ideas

- Atlas-backed symbol rendering and animated sprite state packs.
- Theme variant switching and theme-specific presentation packs.
- Motion settings UI and reduced-motion intensity profiles.
- Broader cross-browser visual regression matrix.
  </deferred>

---

_Phase: 18-slots-animation-runtime-foundation_
_Context gathered: 2026-04-02_
