---
phase: 20-animated-symbols-and-theme-variants
validated: 2026-04-03
nyquist_compliant: true
wave_0_complete: true
status: verified
---

# Phase 20 Validation Strategy

## Scope

Validate that animated symbol states and theme variant support remain presentation-only, deterministic-state safe, and SPA-lifecycle safe.

## Validation Commands

1. `npm run lint`
   - Confirms symbol/theme modules and runtime integration follow project lint constraints.

2. `node --test tests/slots-core-determinism-contract.test.mjs tests/slots-interaction-guards-contract.test.mjs tests/slots-i18n-parity-contract.test.mjs tests/slots-animation-event-sequencing-contract.test.mjs tests/slots-sprite-atlas-contract.test.mjs tests/slots-symbol-states-contract.test.mjs tests/slots-theme-variants-contract.test.mjs`
   - Confirms determinism/guards/parity remain intact while symbol-state and theme-variant contracts pass.

3. `npx playwright test e2e/compatibility.spec.ts --project=chromium`
   - Confirms EN/PT runtime compatibility with stable theme/symbol-state observability hooks.

4. `npm run build`
   - Confirms static build integrity and runtime bundling stability.

5. `npm run lint && node --test tests/slots-core-determinism-contract.test.mjs tests/slots-interaction-guards-contract.test.mjs tests/slots-i18n-parity-contract.test.mjs tests/slots-animation-event-sequencing-contract.test.mjs tests/slots-sprite-atlas-contract.test.mjs tests/slots-symbol-states-contract.test.mjs tests/slots-theme-variants-contract.test.mjs && npx playwright test e2e/compatibility.spec.ts --project=chromium && npm run build`
   - Confirms fail-fast integrated gate for phase completion.

## Nyquist Notes

- Add explicit contracts for per-symbol animation-state mapping and per-theme fallback determinism.
- Update `nyquist_compliant` and `wave_0_complete` to true during verification once all checks pass.
