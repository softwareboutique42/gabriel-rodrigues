---
phase: 21-accessibility-and-performance-hardening
validated: 2026-04-02
nyquist_compliant: false
wave_0_complete: false
status: planning_ready
---

# Phase 21 Validation Strategy

## Scope

Validate that reduced-motion controls, intensity tiers, and performance fallback guardrails remain presentation-only, deterministic, and EN/PT parity-safe.

## Validation Commands

1. `npm run lint`
   - Confirms motion/guardrail modules and runtime wiring satisfy project lint constraints.

2. `node --test tests/slots-core-determinism-contract.test.mjs tests/slots-interaction-guards-contract.test.mjs tests/slots-i18n-parity-contract.test.mjs tests/slots-animation-event-sequencing-contract.test.mjs tests/slots-symbol-states-contract.test.mjs tests/slots-theme-variants-contract.test.mjs tests/slots-motion-accessibility-contract.test.mjs tests/slots-performance-guardrail-contract.test.mjs`
   - Confirms core determinism/guards/parity remain intact while accessibility/performance contracts pass.

3. `npx playwright test e2e/compatibility.spec.ts --project=chromium`
   - Confirms EN/PT runtime compatibility for reduced-motion/intensity/performance observability hooks.

4. `npm run build`
   - Confirms static build integrity with new runtime modules and assertions.

5. `npm run lint && node --test tests/slots-core-determinism-contract.test.mjs tests/slots-interaction-guards-contract.test.mjs tests/slots-i18n-parity-contract.test.mjs tests/slots-animation-event-sequencing-contract.test.mjs tests/slots-symbol-states-contract.test.mjs tests/slots-theme-variants-contract.test.mjs tests/slots-motion-accessibility-contract.test.mjs tests/slots-performance-guardrail-contract.test.mjs && npx playwright test e2e/compatibility.spec.ts --project=chromium && npm run build`
   - Confirms fail-fast integrated gate for phase completion.

## Nyquist Notes

- Add explicit contracts for reduced-motion/intensity resolution behavior.
- Add explicit contracts for deterministic performance fallback transitions and runtime hook emission.
- Update `nyquist_compliant` and `wave_0_complete` to true during verification once all checks pass.
