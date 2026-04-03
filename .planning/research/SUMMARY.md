# Project Research Summary

**Project:** v1.8 Casinocraftz and Slots educational progression expansion
**Domain:** Deterministic educational casino simulation integration
**Researched:** 2026-04-03
**Confidence:** HIGH

## Executive Summary

v1.8 should be built as a confidence expansion of the shipped v1.7 foundation, not a stack rewrite or gameplay authority redesign. The product remains a deterministic slots authority embedded into a tutorial and utility-card host, where educational clarity improves through better progression guidance, transparent spin causality, and bounded recap or replay mechanics. Expert implementation in this domain keeps event authority in one runtime and treats host UI as a strict consumer.

The recommended approach is to evolve contracts, not replace them: add a versioned bridge payload while preserving legacy compatibility, centralize iframe message validation, and lock dataset parity with contracts and targeted E2E. Main risks are authority leakage from tutorial into gameplay, EN/PT or host-mode drift, and shipping behavior without matching machine-readable evidence. Mitigation is explicit: event-first progression, mirrored EN/PT delivery, anti-monetization guards, and confidence-lock gates in every phase.

## Key Findings

### Recommended Stack

The existing Astro 6 plus TypeScript plus static Cloudflare deployment stack is sufficient for v1.8. No new framework or runtime dependency is justified by current scope. Reuse the deterministic slots runtime, existing tutorial runtime, and Playwright plus contract harness as release gates.

**Core technologies:**

- Astro 6 static routing and page composition: preserve canonical EN/PT surfaces and SPA lifecycle patterns.
- TypeScript deterministic runtime modules: keep slots engine and controller as sole game-state authority.
- Node test plus Playwright compatibility suite: enforce deterministic state, parity, and bridge behavior before release.

### Expected Features

v1.8 should prioritize learning-loop clarity and observable trust signals over net-new game systems. Build visible step status, next action prompts, transparent spin context, and bounded progression visibility. Keep all additions deterministic and machine-readable.

**Must have (table stakes):**

- Deterministic progression clarity: current step, completion state, and next action prompts.
- Observable transparency panel: seed and outcome context tied to lesson claims.
- Resume-safe progression state and utility card status visibility with EN/PT parity.
- Persistent zero-risk and no-real-money framing on progression touchpoints.

**Should have (differentiators):**

- Spin-to-lesson causality callouts after meaningful transitions.
- Lesson recap checkpoints and bounded near-term unlock map.
- Replay prompt to repeat learning beats under same deterministic context.

**Defer (v2+):**

- Deep psychology curriculum expansion.
- Large card collection or combat-style meta progression.
- Any monetization-adjacent mechanics, dynamic odds adaptation, or locale-staggered rollout.

### Architecture Approach

Preserve hard boundaries: slots engine and controller own spin truth and economy transitions, tutorial engine owns lesson state only, and iframe bridge is the only cross-boundary channel. v1.8 should introduce a versioned spin event envelope with legacy fallback, plus a dedicated bridge validation module, while keeping existing runtime datasets stable as public integration contracts.

**Major components:**

1. Slots authority runtime: deterministic spin resolution, payout, and machine-readable slots datasets.
2. Tutorial and card runtime: progression state machine and educational UI projection only.
3. Bridge and route shells: validated postMessage contract, EN/PT mirrored embedding and dataset parity.

### Critical Pitfalls

1. **Progression bypasses spin-settled authority**: only advance tutorial states from deterministic spin-resolved events.
2. **Educational logic mutates gameplay internals**: keep tutorial and card layers read-only relative to engine or economy authority.
3. **Confidence lock erosion**: every new behavior needs contract assertions and at least one integration evidence path.
4. **Embedded and standalone drift**: define host-only versus shared states explicitly and enforce matrix tests.
5. **Parity or anti-monetization regressions**: treat EN/PT lockstep and zero-risk messaging as non-negotiable release gates.

## Implications for Roadmap

Based on combined research, use a four-phase decomposition for v1.8.

### Phase 1: Contract and Authority Hardening

**Rationale:** Foundation first; all downstream features rely on stable deterministic bridge contracts.
**Delivers:** Versioned spin bridge event, legacy fallback compatibility, dedicated bridge validation layer, and contract tests.
**Addresses:** Deterministic progression triggers and machine-readable integration stability.
**Avoids:** Authority bypass and unversioned contract mutation pitfalls.

### Phase 2: Learning Loop Clarity and Bounded Progression UX

**Rationale:** Once contracts are stable, add user-visible v1.8 value without touching gameplay authority.
**Delivers:** Step status and next action UI, causality explanations, recap checkpoints, bounded unlock map, and replay prompt.
**Implements:** Tutorial and card presentation enhancements driven by bridge-fed deterministic signals.
**Avoids:** Narrative-only upgrades with no machine-readable projection.

### Phase 3: EN/PT and Host-Mode Parity Integration

**Rationale:** Parity must be built concurrently with feature work to prevent late rework.
**Delivers:** Mirrored EN/PT datasets and copy, embedded and standalone behavior matrix checks, and route-shell parity updates.
**Uses:** Existing Astro EN/PT route model and compatibility contracts.
**Avoids:** Locale-specific logic branches and host-mode schema drift.

### Phase 4: Confidence Lock, Anti-Monetization, and Release Evidence

**Rationale:** Final gate protects domain promises and milestone auditability.
**Delivers:** Updated deterministic contracts, targeted Playwright parity runs, anti-monetization deny-list assertions, and regenerated debug artifacts.
**Addresses:** Release confidence and reproducible proof for v1.8 closeout.
**Avoids:** Silent regressions and non-reproducible validation evidence.

### Phase Ordering Rationale

- Contracts before UX prevents ambiguous ownership and state drift.
- UX before parity lock would create EN/PT rework risk, so parity is integrated as a dedicated phase with matrix validation.
- Confidence lock closes last to verify final behavior, not intermediate assumptions.

### Recommended Requirement Categories for v1.8

- Deterministic authority and bridge contracts.
- Tutorial progression and educational transparency UX.
- Utility card and bounded progression state visibility.
- EN/PT parity and host-mode compatibility matrix.
- Anti-monetization and zero-risk framing protections.
- Confidence-lock testing and release evidence artifacts.

### Research Flags

Phases likely needing deeper research during planning:

- **Phase 2:** medium research need for pedagogical clarity patterns and persistence edge cases under SPA navigation.
- **Phase 3:** medium research need for exhaustive embedded versus standalone parity matrix definition.

Phases with standard patterns (can likely skip deep research):

- **Phase 1:** strong existing architecture and contract patterns already validated in workspace.
- **Phase 4:** established confidence-lock workflow and command chain already documented and used.

## Confidence Assessment

| Area         | Confidence  | Notes                                                                                   |
| ------------ | ----------- | --------------------------------------------------------------------------------------- |
| Stack        | HIGH        | Workspace and milestone history strongly support reuse-first strategy.                  |
| Features     | HIGH        | Directly aligned with documented v1.7 outcomes and explicit v1.8 anti-scope boundaries. |
| Architecture | HIGH        | Detailed module boundaries and migration path are concrete and testable.                |
| Pitfalls     | MEDIUM-HIGH | Risks are well identified, but some rely on process discipline during implementation.   |

**Overall confidence:** HIGH

### Gaps to Address

- Define exact schema for progression persistence and resume semantics before Phase 2 implementation.
- Confirm final anti-monetization string and interaction deny-list for all new progression surfaces in EN and PT.
- Decide whether bridge telemetry fields remain local-only or feed existing analytics schema for v1.8 evidence.

## Sources

### Primary (HIGH confidence)

- .planning/research/STACK.md
- .planning/research/FEATURES.md
- .planning/research/ARCHITECTURE.md
- .planning/research/PITFALLS.md
- .planning/PROJECT.md

### Secondary (MEDIUM confidence)

- tests/casinocraftz-tutorial-contract.test.mjs
- tests/compatibility-contract.test.mjs
- e2e/compatibility.spec.ts

### Tertiary (LOW confidence)

- https://docs.astro.build/en/guides/view-transitions/
- https://developer.mozilla.org/en-US/docs/Web/API/Window/postMessage
- https://developer.mozilla.org/en-US/docs/Web/API/AbortController

---

_Research completed: 2026-04-03_
_Ready for roadmap: yes_
