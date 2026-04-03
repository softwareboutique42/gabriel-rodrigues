---
phase: 19-sprite-atlas-integration-and-ui-motion
validated: 2026-04-02
nyquist_compliant: true
wave_0_complete: true
status: verified
---

# Phase 19 Validation Strategy

## Scope

Validate that sprite atlas integration and idle/UI motion polish remain presentation-only, deterministic-state safe, and SPA-lifecycle safe.

## Validation Commands

1. `npm run lint`
   - Confirms new atlas/motion modules and runtime integration follow project lint constraints.

2. `node --test tests/slots-core-determinism-contract.test.mjs tests/slots-interaction-guards-contract.test.mjs tests/slots-i18n-parity-contract.test.mjs tests/slots-animation-event-sequencing-contract.test.mjs tests/slots-sprite-atlas-contract.test.mjs`
   - Confirms determinism/guards/parity stay intact while atlas + idle motion contracts pass.

3. `npx playwright test e2e/compatibility.spec.ts --project=chromium`
   - Confirms browser runtime compatibility for EN/PT with stable atlas/motion observability hooks.

4. `npm run build`
   - Confirms static build integrity and runtime bundling stability.

5. `npm run lint && node --test tests/slots-core-determinism-contract.test.mjs tests/slots-interaction-guards-contract.test.mjs tests/slots-i18n-parity-contract.test.mjs tests/slots-animation-event-sequencing-contract.test.mjs tests/slots-sprite-atlas-contract.test.mjs && npx playwright test e2e/compatibility.spec.ts --project=chromium && npm run build`
   - Confirms fail-fast integrated gate for phase completion.

## Nyquist Notes

- Add explicit atlas-schema and symbol-frame mapping contract assertions.
- Update `nyquist_compliant` and `wave_0_complete` to true during verification once all checks pass.
