# Phase 29: Casinocraftz Shell and Route Foundation - Research

**Researched:** 2026-04-03
**Mode:** Autonomous (`/casinocraftz-next` -> `/gsd:plan-phase 29`)

## Objective

Define a safe, canonical route and shell strategy for introducing Casinocraftz as a browser-first educational surface without destabilizing existing Projects/Canvas/Slots behavior.

## Existing Surface Map

- Existing projects discovery pages (`/en/projects/`, `/pt/projects/`) currently route to Canvas and standalone Slots.
- Header active-state behavior treats `/projects`, `/canvas`, and `/slots` as one navigation surface.
- Current contracts explicitly protect counterpart mapping and alias denial for existing routes.
- Slots has a mature shell and deterministic runtime hooks that should remain authoritative until integration work in Phase 30.

## Recommended Strategy

1. Introduce new canonical routes at `/en/casinocraftz/` and `/pt/casinocraftz/` as host pages, not aliases under `/projects/*`.
2. Keep standalone Slots routes intact for now while adding discovery CTA paths toward Casinocraftz.
3. Add a host-shell structure with stable zones and deterministic hooks for future embedded modules.
4. Extend route/nav/i18n contracts so the new canonical surfaces are parity-safe and resistant to alias drift.
5. Keep all language primitives EN/PT mirrored under a dedicated `casinocraftz.*` namespace.

## Likely Implementation Targets

- `src/pages/en/casinocraftz/index.astro`
- `src/pages/pt/casinocraftz/index.astro`
- `src/components/Header.astro`
- `src/pages/en/projects/index.astro`
- `src/pages/pt/projects/index.astro`
- `src/i18n/en.json`
- `src/i18n/pt.json`
- `tests/compatibility-contract.test.mjs`
- `tests/nav-i18n-primitives.test.mjs`
- `e2e/compatibility.spec.ts`

## Risks and Guardrails

- **Risk:** New routes break current canonical parity assumptions.
  - **Guardrail:** Extend counterpart and alias tests in the same phase.
- **Risk:** The shell reads as glamorized casino UI instead of transparent education.
  - **Guardrail:** Keep explicit anti-gambling and zero-risk framing in above-the-fold copy.
- **Risk:** Integration responsibilities leak into Phase 29.
  - **Guardrail:** Limit scope to host shell and routing primitives only.

## Planning Input Quality Check

- Scope cleanly maps to CCZ-40 and CCZ-41.
- Existing architecture supports incremental route additions without framework changes.
- Phase 29 can complete as one focused shell-and-routing wave and unlock parallel execution later.
