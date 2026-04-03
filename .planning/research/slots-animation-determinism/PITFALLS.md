# Domain Pitfalls

**Domain:** Deterministic slots animation + sprite integration
**Researched:** 2026-04-02

## Critical Pitfalls

### Pitfall 1: Simulation/animation coupling

**What goes wrong:** Engine waits on animation callbacks to finalize state.
**Why it happens:** Convenience integration in controller.
**Consequences:** Non-deterministic outcomes, flaky tests, blocked transitions.
**Prevention:** Resolve deterministic result first, emit visual events second.
**Detection:** Same seed/spin produces different observable sequences across runs.

### Pitfall 2: Non-replayable effect randomness

**What goes wrong:** VFX particles/highlights use unseeded RNG.
**Why it happens:** Effects often treated as purely cosmetic.
**Consequences:** Screenshot noise and mismatch in CI snapshots.
**Prevention:** Seed effect pseudo-randomness from event ID or spin seed.
**Detection:** Visual snapshots fail intermittently with no engine diff.

### Pitfall 3: Atlas schema drift

**What goes wrong:** Build outputs different frame keys/order than runtime expects.
**Why it happens:** Unvalidated atlas pipeline.
**Consequences:** Missing symbols, wrong symbol textures, runtime errors.
**Prevention:** Validate atlas manifest against strict runtime schema during build.
**Detection:** Contract test that maps every `SlotSymbol` to a valid frame key fails.

## Moderate Pitfalls

### Pitfall 1: Overly shared animation channels

**What goes wrong:** One effect cancels unrelated effects.
**Prevention:** Introduce channel + priority + cancel policy per effect type.

### Pitfall 2: Excessive visual assertions in E2E

**What goes wrong:** Playwright tests become fragile across environment differences.
**Prevention:** Keep core correctness in contracts; use targeted visual asserts with stable clock and CSS masking.

## Minor Pitfalls

### Pitfall 1: Data-attribute inflation

**What goes wrong:** Too many transient animation fields in DOM attributes.
**Prevention:** Keep DOM attributes focused on authoritative state + few stable visual markers.

## Phase-Specific Warnings

| Phase Topic          | Likely Pitfall                                | Mitigation                                                                      |
| -------------------- | --------------------------------------------- | ------------------------------------------------------------------------------- |
| Atlas onboarding     | Runtime uses raw frame names from art exports | Add adapter map (`SlotSymbol` -> frame key) with schema validation test         |
| Animation layering   | Reel and symbol effects interfere             | Separate state slices per layer with explicit z-order and channel ownership     |
| Effect orchestration | Multiple wins cause timeline collisions       | Use deterministic queue with `spinId`, priority, and cancellation rules         |
| Test expansion       | Visual tests become flaky                     | Freeze clock, disable volatile motion in snapshot mode, keep assertions layered |

## Sources

- Existing tests: `tests/slots-core-determinism-contract.test.mjs`, `tests/slots-interaction-guards-contract.test.mjs`
- https://playwright.dev/docs/clock (HIGH)
- https://playwright.dev/docs/test-snapshots (HIGH)
- https://gafferongames.com/post/fix_your_timestep/ (MEDIUM)
