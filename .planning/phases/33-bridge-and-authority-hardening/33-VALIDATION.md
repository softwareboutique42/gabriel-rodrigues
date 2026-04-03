# Phase 33 Validation Architecture

## BRG-50: Versioned Bridge with Backward Compatibility

### What was implemented

- `src/scripts/slots/main.ts` emits `{ type: 'ccz:spin-settled', version: 1, payload: { spinIndex } }`
- `src/scripts/casinocraftz/tutorial/main.ts` exports `parseSpinSettledBridgeEvent(data)` which:
  - Accepts v1 envelope: `{ type: 'ccz:spin-settled', version: 1, payload: { spinIndex } }`
  - Accepts legacy unversioned: `{ type: 'ccz:spin-settled', spinIndex }` (no version field)
  - Rejects unknown versions (version >= 2 or unexpected values)
  - Returns null for null, non-object, missing-type, or invalid spinIndex payloads

### Source contracts

- `tests/casinocraftz-tutorial-contract.test.mjs`:
  - "Bridge Versioning: types.ts exports versioned bridge event types"
  - "Bridge Versioning: parseSpinSettledBridgeEvent is exported and handles v1 payload"
  - "Bridge Versioning: parseSpinSettledBridgeEvent handles legacy unversioned payload"
  - "Bridge Versioning: parseSpinSettledBridgeEvent rejects unknown versions and returns null"
  - "Bridge Versioning: parseSpinSettledBridgeEvent rejects null/non-object/missing-type payloads"
  - "Bridge Versioning: onSpinMessage uses safe parser and returns early on null"
- `tests/compatibility-contract.test.mjs`:
  - "bridge event sender in slots/main.ts emits versioned envelope with payload wrapper"
- `tests/slots-i18n-parity-contract.test.mjs`:
  - "BRG-50: tutorial/main.ts bridge handler has no locale-specific branches"
  - "BRG-50: slots/main.ts bridge emit is not wrapped in locale conditions"

### Validation commands

```
node --test tests/casinocraftz-tutorial-contract.test.mjs tests/compatibility-contract.test.mjs tests/slots-i18n-parity-contract.test.mjs
```

### EN/PT and host-mode checkpoints

- EN `/en/casinocraftz/` + embedded `/en/slots/?host=casinocraftz`: versioned postMessage emitted, tutorial advances
- PT `/pt/casinocraftz/` + embedded `/pt/slots/?host=casinocraftz`: versioned postMessage emitted, tutorial advances
- E2E: "casinocraftz tutorial advances to probability reveal after three spins in EN/PT" — 3 spins trigger step transition in both locales

---

## BRG-51: Presentation-Only Authority Boundary

### What was verified

- `tutorial/engine.ts` has no imports from `slots/` module
- `tutorial/cards.ts` has no imports from `slots/` module
- `tutorial/main.ts` has no imports from `slots/rng`, `slots/payout`, or `slots/economy`
- Tutorial bridge handler never receives spinIndex to mutate Slots RNG or payout logic
- No net-new tutorial steps, card mechanics, or gameplay effects introduced

### Source contracts

- `tests/casinocraftz-tutorial-contract.test.mjs`:
  - "Authority Isolation: tutorial engine does not import Slots modules"
  - "Authority Isolation: tutorial cards module does not import Slots modules"
  - "Authority Isolation: tutorial main does not import Slots RNG/payout/economy internals"

### Validation commands

```
node --test tests/casinocraftz-tutorial-contract.test.mjs
```

### Authority isolation checkpoints

- `tutorial/engine.ts`: exportes `createInitialTutorialState`, `advanceTutorialStep`, `recordSpin`, etc. — no Slots imports
- `tutorial/cards.ts`: exportes `STARTER_CARDS`, `applyCard`, `clearCard` — no Slots imports
- `tutorial/main.ts`: bridge event is consumed purely to call `recordSpin(state)` — Slots RNG/payout never mutated
