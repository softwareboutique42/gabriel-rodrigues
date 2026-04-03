---
phase: 18-slots-animation-runtime-foundation
validated: 2026-04-02
nyquist_compliant: true
wave_0_complete: true
status: verified
---

# Phase 18 Validation Strategy

## Scope

Validate that Slots animation runtime polish is presentation-only, deterministic-state safe, and SPA-lifecycle safe.

## Validation Commands

1. `node --test tests/slots-core-determinism-contract.test.mjs tests/slots-interaction-guards-contract.test.mjs tests/slots-i18n-parity-contract.test.mjs`
   - Confirms core loop determinism, guard behavior, and EN/PT parity remain unchanged by animation runtime integration.

2. `npx playwright test e2e/compatibility.spec.ts --project=chromium`
   - Confirms runtime browser compatibility and state progression remain valid on canonical routes.

3. `npm run build`
   - Confirms static build integrity and no regressions in bundled runtime scripts.

4. `npx playwright test e2e/compatibility.spec.ts --project=chromium && node --test tests/slots-core-determinism-contract.test.mjs tests/slots-interaction-guards-contract.test.mjs tests/slots-i18n-parity-contract.test.mjs && npm run build`
   - Confirms fail-fast integrated validation chain for phase completion gate.

## Nyquist Notes

- Add deterministic visual event sequencing assertions in phase tests as implementation lands.
- Update `nyquist_compliant` and `wave_0_complete` during phase verification when all validation checks pass.
