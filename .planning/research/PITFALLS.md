# Domain Pitfalls

**Domain:** v1.8 educational loop and progression on top of deterministic Casinocraftz confidence lock
**Researched:** 2026-04-03

## Critical Pitfalls

### Pitfall 1: Progression Logic Bypasses the `ccz:spin-settled` Contract

**What goes wrong:** Tutorial/progression steps advance from UI clicks, timers, or optimistic state instead of spin-settled events.
**Why it happens:** Teams add convenience triggers while extending educational flow.
**Consequences:** EN/PT divergence, nondeterministic progression, and confidence-lock false positives.
**Prevention:** Treat `ccz:spin-settled` as the only progression authority; all new progression reducers must be pure and event-driven.
**Detection:**

- Warning sign: step changes occur without a corresponding spin-settled event marker.
- Warning sign: a replay with identical spin count yields different tutorial/progression states.
- Warning sign: `data-casinocraftz-tutorial-step` transitions in browser traces before runtime state reaches resolved.

### Pitfall 2: Educational Surface Leaks into Gameplay Authority

**What goes wrong:** Tutorial/cards/progression modules start mutating economy, RNG, payout, or spin lifecycle behavior.
**Why it happens:** New educational rewards are implemented by touching existing gameplay internals rather than presentation/state overlays.
**Consequences:** Hard-to-debug authority drift, broken deterministic contracts, and re-verification churn.
**Prevention:** Keep strict module boundary: educational systems can read resolved events and publish `data-casinocraftz-*` state only; no writes to engine authority paths.
**Detection:**

- Warning sign: tutorial/card modules import or call engine/economy mutation functions.
- Warning sign: payout or balance outcomes change when educational layer is toggled on/off for same seed/spin index.
- Warning sign: existing determinism contracts fail while educational tests pass.

### Pitfall 3: Confidence-Lock Signal Erodes During Feature Extension

**What goes wrong:** v1.8 ships behavior changes without equivalent upgrades to deterministic contracts and release evidence.
**Why it happens:** Feature work lands faster than validation architecture updates.
**Consequences:** Regressions slip through, milestone closeout blocks late, and audit confidence drops.
**Prevention:** Require parity between each new progression behavior and at least one machine-readable contract assertion plus one integration check where applicable.
**Detection:**

- Warning sign: new progression datasets or UI states have no test assertions.
- Warning sign: Playwright JSON evidence exists but no deterministic assertion references the newly added states.
- Warning sign: milestone summary claims behavior that cannot be traced to command outputs.

### Pitfall 4: Embedded/Standalone Contract Drift

**What goes wrong:** Educational loop behaves differently between standalone slots and embedded Casinocraftz host mode in ways not intentionally scoped.
**Why it happens:** Host-mode checks are added ad hoc without preserving canonical parity contracts.
**Consequences:** User confusion, flaky compatibility checks, and broken integration assumptions for future modules.
**Prevention:** Explicitly define which progression states are host-only vs shared, and codify both in contracts.
**Detection:**

- Warning sign: `data-slots-host` differs as expected, but progression state/output schema also changes unexpectedly.
- Warning sign: EN/PT embedded route passes while standalone route silently loses machine-readable fields.
- Warning sign: compatibility suite grep targets need repeated emergency edits for unstable selectors.

## Moderate Pitfalls

### Pitfall 1: EN/PT Key Parity Regresses Under Fast Content Changes

**What goes wrong:** New tutorial/card/progression copy is added in one locale with missing or mismatched keys in the other.
**Prevention:** Keep namespace-level parity tests over educational keys (`tutorial.*`, `cards.*`, progression labels/messages) and fail fast in source contracts.
**Detection:** Missing PT or EN key paths, fallback text appearing in one locale, or locale-specific dataset payload differences.

### Pitfall 2: SPA Lifecycle Leaks in Extended Tutorial Runtime

**What goes wrong:** Re-navigation duplicates listeners and progression handlers, causing double increments or repeated card unlock side effects.
**Prevention:** Keep all mounts inside `astro:page-load` flow and wire teardown through `AbortController` abort hooks.
**Detection:** Duplicate `ccz:spin-settled` handling per single spin, repeated analytics/events, or state jumps larger than one deterministic step.

### Pitfall 3: Over-Indexing on Narrative, Under-Indexing on Machine-Readable State

**What goes wrong:** Educational improvements exist visually but are not represented by stable datasets/contracts.
**Prevention:** Every progression milestone must map to explicit `data-*` attributes or deterministic state projections that tests can assert.
**Detection:** E2E checks rely on prose text only; selector fragility spikes when copy changes.

## Minor Pitfalls

### Pitfall 1: Scope Creep into Monetization-Like Mechanics

**What goes wrong:** Reward framing or card language starts resembling paid progression patterns.
**Prevention:** Keep anti-monetization deny-list and zero-risk framing checks active as baseline guards.
**Detection:** New strings reference deposits, purchases, top-ups, or premium reward framing.

### Pitfall 2: Evidence Artifacts Become Non-Reproducible

**What goes wrong:** Commands vary by developer or are run manually without consistent artifact capture.
**Prevention:** Maintain a stable fail-fast command chain and required artifact outputs for each phase closeout.
**Detection:** Missing or stale `.planning/debug` reports relative to milestone dates.

## Phase-Specific Warnings

| Phase Topic                                            | Likely Pitfall                                                                   | Mitigation                                                                                                                                                 |
| ------------------------------------------------------ | -------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Phase A - v1.8 scope and progression contract design   | New progression goals are defined without explicit deterministic event authority | Require each progression feature to name its authoritative trigger (`ccz:spin-settled` or existing deterministic dataset transition) before implementation |
| Phase B - educational loop extension implementation    | Tutorial/reward logic leaks into gameplay authority modules                      | Enforce boundary review checklist on imports and side effects; reject authority mutations from educational modules                                         |
| Phase C - EN/PT and host-mode integration              | Locale and host variants drift in dataset schema and progression semantics       | Add paired EN/PT and embedded/standalone matrix assertions for every new progression state                                                                 |
| Phase D - confidence lock refresh and release evidence | New behaviors are not covered by contracts/E2E evidence                          | Update contract suite and targeted Playwright checks in same PR as feature changes; require JSON artifact regeneration                                     |

## Sources

- Workspace artifacts: `.planning/milestones/v1.7-REQUIREMENTS.md`, `.planning/milestones/v1.7-ROADMAP.md`, `.planning/phases/31-house-edge-tutorial-and-utility-card-systems/31-RESEARCH.md`, `.planning/phases/32-casinocraftz-integration-confidence-lock/32-RESEARCH.md`, `.planning/phases/32-casinocraftz-integration-confidence-lock/32-VALIDATION.md`, `.planning/phases/32-casinocraftz-integration-confidence-lock/32-VERIFICATION.md`, `tests/casinocraftz-tutorial-contract.test.mjs`
- Astro docs (script lifecycle and SPA transitions): https://docs.astro.build/en/guides/view-transitions/ (fetched 2026-04-03)
- MDN `postMessage` security and reliability guidance: https://developer.mozilla.org/en-US/docs/Web/API/Window/postMessage (last modified 2025-11-30)
- MDN `AbortController` cleanup baseline: https://developer.mozilla.org/en-US/docs/Web/API/AbortController (last modified 2025-09-17)
