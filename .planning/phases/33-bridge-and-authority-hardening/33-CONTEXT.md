# Phase 33: Bridge and Authority Hardening - Context

**Gathered:** 2026-04-03
**Status:** Ready for planning
**Source:** /gsd:discuss-phase for v1.8 kickoff

## Locked Decisions

- Phase 33 is a hardening phase for bridge contracts and authority boundaries only; it does not add net-new tutorial beats, card mechanics, or gameplay systems.
- BRG-50 is satisfied by evolving the existing bridge contract with explicit versioning and backward compatibility, not by replacing the current bridge channel.
- BRG-51 is satisfied by keeping tutorial and card layers strictly presentation-only relative to Slots authority (RNG, payout, economy, spin lifecycle).
- Existing deterministic progression trigger remains the baseline: tutorial progression advances from `ccz:spin-settled` bridge events emitted from spin-resolved visuals.
- Existing canonical route model remains authoritative: `/en/casinocraftz/`, `/pt/casinocraftz/`, embedded `/{lang}/slots/?host=casinocraftz`, and standalone `/{lang}/slots/`.

## Prior Decisions Carried Forward (v1.7)

- Tutorial/card modules remain authority-isolated from Slots runtime internals.
- Play-and-observe progression advances only via `ccz:spin-settled` bridge events.
- Machine-readable datasets on Slots and Casinocraftz roots are first-class compatibility anchors.
- Canonical EN/PT and host-mode route parity is enforced through contract and browser coverage.

## User Constraints and Non-Negotiables

- Preserve deterministic behavior across embedded and standalone host modes.
- Preserve EN/PT parity for bridge-triggered outcomes and exposed machine-readable state.
- Preserve zero-risk framing and anti-monetization posture.
- Keep scope limited to contract hardening and authority boundary protection for this phase.

## In Scope (Phase 33)

- Define and lock a versioned Slots-to-tutorial bridge event contract that remains backward compatible with current listeners.
- Harden bridge validation boundaries so malformed or unknown events fail safely without mutating tutorial or gameplay authority state.
- Make authority boundaries explicit and testable between:
  - Slots authority runtime (source of spin truth and economy truth)
  - Tutorial/card host runtime (consumer/projection only)
- Preserve and verify deterministic behavior of current bridge-triggered progression across EN/PT and host modes.
- Extend contract-level and browser-level verification to prove BRG-50 and BRG-51 without widening feature scope.

## Deferred / Out of Scope

- New tutorial steps, new card inventory, new card effect classes, or progression redesign.
- Any Slots authority changes: RNG logic, payout logic, economy rules, reel or outcome semantics.
- New routing families, canonical path changes, or alias expansions.
- Broad UX redesign or copy expansion beyond what is required to document and verify hardened contracts.
- Phase 34+ goals (learning loop clarity, bounded progression UX), Phase 35 parity matrix expansion, and Phase 36 release-confidence closure work.

## EN/PT and Host-Mode Implications

- Bridge schema and semantics must behave identically in EN and PT; locale may affect displayed copy but not event meaning or authority outcome.
- Host-mode behavior must remain deterministic in both contexts:
  - Embedded mode (`host=casinocraftz`) emits and consumes bridge events.
  - Standalone mode remains stable and must not require bridge participation to keep gameplay deterministic.
- Machine-readable root datasets used by compatibility tests remain stable integration contracts unless a versioned migration path is explicitly defined.

## Concrete Verification Intent

### BRG-50 (Versioned, backward-compatible deterministic bridge)

- Source contracts assert presence of a versioned bridge envelope and explicit backward-compatibility handling for legacy bridge payload shape.
- Source contracts assert bridge listener behavior is deterministic for accepted, unknown-version, and malformed payload cases.
- Browser compatibility checks assert EN/PT embedded flows still advance tutorial progression deterministically from spin-settled events.
- Browser compatibility checks assert standalone Slots behavior remains deterministic and unaffected by bridge contract hardening.

### BRG-51 (Presentation-only tutorial/card authority boundary)

- Source contracts assert tutorial/card modules do not import or mutate Slots authority internals.
- Source contracts assert tutorial/card runtime only reacts to bridge signals and local presentation state.
- Browser checks assert tutorial/card interactions cannot alter authoritative Slots runtime outputs (seed/outcome/economy envelope).
- Regression checks re-assert no authority drift in canonical EN/PT routes and host-mode matrix slices touched by bridge hardening.

## Assumptions to Validate During Planning

- Existing `ccz:spin-settled` event remains the canonical progression trigger and should be wrapped/evolved rather than replaced.
- Current compatibility suites are the primary confidence channel; hardening should extend these suites before adding new harnesses.
- Deterministic dataset anchors (`data-slots-*`, `data-casinocraftz-*`) remain stable public contracts for this phase.

## Exit Condition for Phase 33

- BRG-50 and BRG-51 both have passing source-level and browser-level evidence.
- No net-new feature expansion is introduced.
- EN/PT and host-mode deterministic behavior remains parity-safe on canonical routes.
