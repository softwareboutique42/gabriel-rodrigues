# Phase 31: House Edge Tutorial and Utility Card Systems — Research

**Researched:** 2026-04-03
**Domain:** Tutorial state machines, dialogue systems, progression loops, utility card effects — within Astro/TypeScript/Slots runtime stack
**Confidence:** HIGH

---

<user_constraints>

## User Constraints (from CONTEXT.md)

### Locked Decisions

- Tutorial and utility-card effects must never mutate gameplay authority (engine/, rng, payout, state-machine).
- EN/PT parity is mandatory for all new tutorial cues, dialogue steps, card labels, and Essence counter labels.
- Deterministic behavior must be preserved or extended in backward-compatible form.
- Canonical routes and standalone/embedded parity guarantees from Phase 29/30 must not regress.
- Zero-risk educational framing must remain explicit on all new surfaces.

### Claude's Discretion

- Internal architecture of the tutorial state machine (step-driven vs. event-count-driven).
- Whether AI Essence is exposed as a dataset attribute or only as UI text.
- Dialogue rendering strategy (inline in slots page vs. Casinocraftz host overlay).
- Scope and visual presentation of each utility card's effect on the presentation layer.

### Deferred Ideas (OUT OF SCOPE)

- PvP or collection-driven card battling (SYS-50).
- Additional psychology lessons beyond house edge (EDU-50).
- Real-money wagering, microtransactions, paid card packs.
- Native mobile or Discord clients.

</user_constraints>

---

<phase_requirements>

## Phase Requirements

| ID     | Description                                                                                                                  | Research Support                                                                                                                       |
| ------ | ---------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| EDU-40 | First-run tutorial focuses on house edge as the primary early lesson.                                                        | `data-slots-lesson="house-edge"` panel already exists in EN/PT slots pages; tutorial state machine can advance it step by step.        |
| EDU-41 | Educational delivery combines narrative dialogue with direct real-time system explanations.                                  | Lightweight dialogue engine fed by `SlotsVisualEventStore` subscriptions; direct explanation tied to `data-slots-outcome` transitions. |
| SYS-40 | AI Essence and three starter utility cards (Probability Seer, Dopamine Dampener, House Edge) provide first progression loop. | New parallel Essence counter module; card definitions as pure config objects; effect functions as presentation-layer transforms only.  |
| SYS-41 | Tutorial events, dialogue, and card utilities interact deterministically rather than as disconnected features.               | Tutorial step gating driven by `spinIndex` thresholds and `settleRound` balance changes — no `Math.random()` calls in tutorial logic.  |

</phase_requirements>

---

## Summary

Phase 31 is a **feature-addition phase that operates exclusively above the gameplay authority boundary**. The slots engine, state machine, payout table, and economy module must not be modified. All new behaviour — tutorial steps, dialogue lines, AI Essence accumulation, and utility card effects — is expressed as presentation-layer transforms and data-attribute state that is observable by tests but has no authority path back into `engine/`.

The most important architectural constraint is the **host-context barrier**: the Slots module runs inside a Casinocraftz `<iframe>`. Tutorial overlays that need to react to gameplay events must live _inside the Slots shell_, not in the parent Casinocraftz page. This avoids `postMessage` complexity and keeps event subscriptions synchronous. The existing `hostMode === 'casinocraftz'` gate in `main.ts` is the correct activation point for all Phase 31 Slots-side additions.

All new i18n keys in `en.json` / `pt.json` are the source of truth for EN/PT parity. Source-level contract tests (Node.js `--test`) reading those files directly are the fastest regression guard. Playwright E2E tests in `e2e/compatibility.spec.ts` cover the browser-level user journey.

**Primary recommendation:** Add three new TypeScript modules under `src/scripts/slots/` (tutorial, dialogue, utility-cards) that subscribe to `SlotsVisualEventStore` events; activate them from `main.ts` when `hostMode === 'casinocraftz'`; expose all state as `data-*` attributes on `#slots-shell-root` or named child elements; and add AI Essence as a fourth module under the same directory.

---

## Standard Stack

### Core (no additions required)

| Library / Tool     | Version (verified) | Purpose                         | Why Standard                                   |
| ------------------ | ------------------ | ------------------------------- | ---------------------------------------------- |
| TypeScript         | ≥5                 | Tutorial/dialogue/card logic    | Already the project's sole scripting language  |
| Astro 6 + Tailwind | installed          | Markup, i18n, styling           | Existing stack; slots pages are `.astro` files |
| Node.js `--test`   | built-in           | Source-level contract tests     | Already used in `tests/*.test.mjs`             |
| Playwright         | installed          | Browser-level E2E tutorial flow | Already used in `e2e/`                         |

**No new npm packages are needed.** Tutorial, dialogue, Essence, and card systems are pure TypeScript state machines that fit completely inside the existing `src/scripts/slots/` module tree.

---

## Architecture Patterns

### Recommended New File Targets

```
src/scripts/slots/
├── tutorial.ts              # Tutorial state machine (step progression)
├── dialogue.ts              # Dialogue engine (line sequencing, narrative framing)
├── essence.ts               # AI Essence counter (accumulation, balance query)
├── utility-cards.ts         # Card definitions + presentation-layer effect functions
tests/
├── casinocraftz-tutorial-contract.test.mjs   # Source parity + state machine unit tests
├── casinocraftz-utility-cards-contract.test.mjs  # Card config immutability + EN/PT parity
src/i18n/
├── en.json                  # New keys: tutorial.*, dialogue.*, card.*, essence.*
├── pt.json                  # Matching PT translations
src/pages/en/slots/index.astro   # Add tutorial overlay zone, card dock, essence meter
src/pages/pt/slots/index.astro   # Mirror of EN additions
```

> The Casinocraftz host pages (`src/pages/{en,pt}/casinocraftz/index.astro`) need no new scripting in Phase 31. They already embed slots via iframe. All new interactive logic stays inside the Slots shell.

### Pattern 1: Tutorial State Machine

**What:** A pure TS module driven by `spinIndex` thresholds and `balance` checkpoints. No `Math.random()`. Outputs a `TutorialState` object.

**When to use:** Activated in `main.ts` when `hostMode === 'casinocraftz'`. Re-evaluated on each `spin-resolved` visual event.

```typescript
// src/scripts/slots/tutorial.ts
export type TutorialStep =
  | 'intro'
  | 'first-spin'
  | 'house-edge-reveal'
  | 'first-win-context'
  | 'complete';

export interface TutorialState {
  step: TutorialStep;
  spinsCompleted: number;
  essenceEarned: number;
}

export function createInitialTutorialState(): TutorialState {
  return { step: 'intro', spinsCompleted: 0, essenceEarned: 0 };
}

export function advanceTutorial(
  state: TutorialState,
  event: { spinIndex: number; outcome: 'win' | 'loss' },
): TutorialState {
  // Deterministic: driven by spinIndex count, no randomness
  if (state.step === 'intro') return { ...state, step: 'first-spin' };
  if (state.step === 'first-spin' && event.spinIndex >= 1)
    return { ...state, step: 'house-edge-reveal', spinsCompleted: 1 };
  if (state.step === 'house-edge-reveal' && event.spinIndex >= 3)
    return { ...state, step: 'first-win-context', spinsCompleted: 3 };
  if (state.step === 'first-win-context' && event.spinIndex >= 5)
    return {
      ...state,
      step: 'complete',
      spinsCompleted: 5,
      essenceEarned: state.essenceEarned + 10,
    };
  return { ...state, spinsCompleted: event.spinIndex };
}
```

### Pattern 2: Dialogue Engine

**What:** A data-driven line sequencer keyed by `TutorialStep`. Lines are looked up by step key and rendered into a designated DOM element. I18n keys are resolved once at mount time from a passed-in locale string.

**When to use:** Subscribe to tutorial state changes; update dialogue DOM node on step transitions only (not every spin).

```typescript
// src/scripts/slots/dialogue.ts
export type DialogueLine = { key: string; fallback: string };
export type DialogueScript = Partial<Record<TutorialStep, DialogueLine[]>>;

export function getDialogueForStep(script: DialogueScript, step: TutorialStep): DialogueLine[] {
  return script[step] ?? [];
}
```

Dialogue copy lives in `en.json` / `pt.json` under `casinocraftz.tutorial.*` and `casinocraftz.dialogue.*` namespaces.

### Pattern 3: AI Essence Counter

**What:** Separate pure module. Accumulates from tutorial completion events. Exposed as `data-casinocraftz-essence` attribute on `#slots-shell-root` and rendered as text in a dedicated meter element.

**Key rule:** Essence is awarded by tutorial progression only, never by gameplay win/loss outcomes. This prevents any appearance of real-money reward mechanics.

```typescript
// src/scripts/essence.ts
export interface EssenceState {
  balance: number;
}
export function createInitialEssenceState(): EssenceState {
  return { balance: 0 };
}
export function awardEssence(state: EssenceState, amount: number): EssenceState {
  return { balance: state.balance + amount };
}
```

### Pattern 4: Utility Cards

**What:** Three card definitions as immutable config objects. Each card has an `id`, `name` i18n key, `description` i18n key, and an `applyEffect(root: HTMLElement): () => void` function that adds a `data-casinocraftz-card-{id}-active` attribute and any visual-only class names. Returns a cleanup function.

**Authority rule:** `applyEffect` may only write to `data-casinocraftz-*` attributes and CSS classes. It must never call `mountSlotsController`, `resolveRound`, `adjustBet`, or any `economy.ts` export.

```typescript
// src/scripts/slots/utility-cards.ts
export interface UtilityCard {
  id: 'probability-seer' | 'dopamine-dampener' | 'house-edge';
  nameKey: string; // e.g. 'casinocraftz.card.probabilitySeer.name'
  descriptionKey: string;
  applyEffect: (root: HTMLElement) => () => void; // returns cleanup
}
```

The three cards:

| Card              | Effect (presentation only)                                                                  | data-attr set                                            |
| ----------------- | ------------------------------------------------------------------------------------------- | -------------------------------------------------------- |
| Probability Seer  | Reveals computed win-probability overlay derived from `DEFAULT_PAYTABLE`                    | `data-casinocraftz-card-probability-seer-active="true"`  |
| Dopamine Dampener | Adds `card--dampened` class to reel windows, reducing win animation intensity               | `data-casinocraftz-card-dopamine-dampener-active="true"` |
| House Edge        | Reveals EV calculation panel (derived from existing `slots.education.houseEdge*` i18n keys) | `data-casinocraftz-card-house-edge-active="true"`        |

### Pattern 5: `main.ts` Activation Gate

Extend the existing `casinocraftz` host gate in `main.ts`:

```typescript
if (hostMode === 'casinocraftz') {
  // existing: show house-edge lesson panel
  // NEW: mount tutorial state machine, dialogue engine, essence counter, card dock
  mountCasinocraftzTutorialLayer(root, mountedController.visualEvents, signal);
}
```

All new modules receive `signal: AbortSignal` and clean up their event subscriptions on abort. This preserves the SPA navigation safety requirement.

### Anti-Patterns to Avoid

- **Touching `engine/` from tutorial code:** Never. Tutorial reads `spinIndex` from `SlotsVisualEvent.spinIndex`, not from the engine state directly.
- **Hardcoded EN/PT strings in `.ts` files:** Always pass i18n-resolved strings in from the Astro page via `data-*` attributes (matching existing `data-slots-msg-*` pattern) or read from a passed locale object at mount time.
- **postMessage from Casinocraftz host to iframe:** Unnecessary for Phase 31 since all new logic lives inside the Slots shell. Introducing this would increase complexity and testing surface without benefit.
- **`Math.random()` in tutorial progression:** All state transitions must be `spinIndex`-driven so they are reproducible in tests.
- **Persisting tutorial state in `localStorage`:** Use `sessionStorage` only (or in-memory). Tests need predictable first-run state on every page load. Document why in the session flag check.
- **Mixing AI Essence accumulation with `economy.ts` balance:** Essence must stay in a separate module. They represent different currencies with different semantics.

---

## Don't Hand-Roll

| Problem               | Don't Build                  | Use Instead                                           | Why                                                 |
| --------------------- | ---------------------------- | ----------------------------------------------------- | --------------------------------------------------- |
| Event subscription    | Custom event bus             | Existing `SlotsVisualEventStore.subscribe()`          | Already immutable, tested, abort-safe               |
| i18n at runtime       | Custom i18n lookup           | Same `data-*` attribute pattern as `data-slots-msg-*` | Consistent with existing parity enforcement pattern |
| Spin probability math | Custom probability calc      | Read from existing `DEFAULT_PAYTABLE` in `payout.ts`  | Source of truth is already there                    |
| Animation intensity   | Custom CSS toggling          | Extend existing `data-slots-anim-*` attribute pattern | Animation runtime already reads these               |
| Test contracts        | Full browser test for parity | Node.js `--test` source-level file reads              | Faster, deterministic, works offline                |

---

## Common Pitfalls

### Pitfall 1: Tutorial overlay in parent Casinocraftz page instead of Slots shell

**What goes wrong:** Tutorial overlay in `src/pages/en/casinocraftz/index.astro` cannot observe gameplay events because gameplay runs inside the iframe. Developer adds `postMessage` to bridge — now there are two message protocols to maintain, two lifecycle chains, and E2E test complexity doubles.

**Why it happens:** The Casinocraftz host page looks like the "right place" to put Casinocraftz-specific UX, but gameplay events are iframe-internal.

**How to avoid:** Keep all tutorial and card UX inside the Slots shell. Gate it with `if (hostMode === 'casinocraftz')`. The Slots page **is** the tutorial surface when embedd.

### Pitfall 2: Tutorial step mutation from card activation instead of gameplay events

**What goes wrong:** Card activation clicks directly call `advanceTutorial()`, bypassing the `spin-resolved` event chain. Tests pass individually but don't reflect user reality. Step count diverges from `spinIndex`.

**How to avoid:** Tutorial step advances only on `spin-resolved` events. Cards are activated/deactivated as tutorial rewards but never themselves advance the step counter.

### Pitfall 3: EN/PT copy drift between `en.json` and `pt.json`

**What goes wrong:** New `casinocraftz.tutorial.*` keys are added to `en.json` but the PT equivalents are added with slightly different key paths. Source contract test catches it only if the test explicitly enumerates every key.

**How to avoid:** Source contract test should assert that every key in `en.json` matching `casinocraftz.tutorial.*`, `casinocraftz.dialogue.*`, `casinocraftz.card.*`, `casinocraftz.essence.*` has an exact match in `pt.json`.

### Pitfall 4: `astro:page-load` not used for tutorial mount

**What goes wrong:** `initSlotsShell()` is already wired to `astro:page-load`. If new tutorial code calls `mountCasinocraftzTutorialLayer()` at module top-level instead of inside `initSlotsShell()`, two tutorial instances spawn after SPA navigation.

**How to avoid:** All mount calls live inside `initSlotsShell()`. `mountCasinocraftzTutorialLayer()` receives the `AbortSignal` from the existing `AbortController`.

### Pitfall 5: Utility card `applyEffect` leaking DOM state after SPA navigation

**What goes wrong:** Card effect adds a class to reel windows. SPA navigation re-renders the page but not the reel DOM. On re-visit, a stale card effect persists without the card being logically "active".

**How to avoid:** `applyEffect` returns a cleanup function. The tutorial layer's `signal.addEventListener('abort', cleanup)` call ensures cleanup on navigation. This mirrors `runtime.ts` `dispose()` pattern exactly.

---

## EN/PT Parity Requirements

Phase 31 adds new i18n surface area. Required key namespaces in both `en.json` and `pt.json`:

```
casinocraftz.tutorial.step.intro
casinocraftz.tutorial.step.firstSpin
casinocraftz.tutorial.step.houseEdgeReveal
casinocraftz.tutorial.step.firstWinContext
casinocraftz.tutorial.step.complete
casinocraftz.dialogue.*          (one key per dialogue line per step)
casinocraftz.card.probabilitySeer.name
casinocraftz.card.probabilitySeer.description
casinocraftz.card.probabilitySeer.effectHint
casinocraftz.card.dopamineDampener.name
casinocraftz.card.dopamineDampener.description
casinocraftz.card.dopamineDampener.effectHint
casinocraftz.card.houseEdge.name
casinocraftz.card.houseEdge.description
casinocraftz.card.houseEdge.effectHint
casinocraftz.essence.label
casinocraftz.essence.unit
```

Slots pages need corresponding `data-casinocraftz-*` attributes passing these resolved strings in from Astro `t()` calls (matching existing `data-slots-msg-*` pattern for parity testability).

---

## Deterministic Constraints Inventory

| Feature                     | Determinism Source                         | Test Approach                                               |
| --------------------------- | ------------------------------------------ | ----------------------------------------------------------- |
| Tutorial step advancement   | `spinIndex` from `spin-resolved` event     | Unit test: feed fixed event sequence, assert step sequence  |
| AI Essence awarding         | Fired only at `step === 'complete'`        | Unit test: replay N spins, assert exactly 10 Essence        |
| Probability Seer overlay    | Derived from `DEFAULT_PAYTABLE` (constant) | Source contract: assert overlay text matches computed value |
| Dialogue line order         | `DialogueScript[step]` array index         | Unit test: same step always yields same line array          |
| Card activation → data-attr | Pure DOM write, no side effects            | Source contract: assert attribute presence in markup        |

No `Math.random()` calls in any tutorial, dialogue, Essence, or card module. The existing RNG is confined to `engine/rng.ts` and must not be imported by Phase 31 modules.

---

## Validation Architecture

### Test Framework

| Property           | Value                                                                                                          |
| ------------------ | -------------------------------------------------------------------------------------------------------------- |
| Framework          | Node.js built-in `--test` (contract tests) + Playwright (E2E)                                                  |
| Config file        | `playwright.config.ts` (E2E); no config for Node tests                                                         |
| Quick run command  | `node --test tests/casinocraftz-tutorial-contract.test.mjs tests/casinocraftz-utility-cards-contract.test.mjs` |
| Full suite command | `node --test tests/*.test.mjs && npx playwright test e2e/compatibility.spec.ts`                                |

### Phase Requirements → Test Map

| Req ID | Behavior                                                       | Test Type | Automated Command                                                 | File Exists? |
| ------ | -------------------------------------------------------------- | --------- | ----------------------------------------------------------------- | ------------ |
| EDU-40 | Tutorial debuts house-edge lesson in first-run flow            | E2E       | `npx playwright test e2e/compatibility.spec.ts --grep "tutorial"` | ❌ Wave 0    |
| EDU-40 | Tutorial state machine step transitions are deterministic      | unit      | `node --test tests/casinocraftz-tutorial-contract.test.mjs`       | ❌ Wave 0    |
| EDU-41 | Dialogue lines render per-step, EN/PT parity                   | source    | `node --test tests/casinocraftz-tutorial-contract.test.mjs`       | ❌ Wave 0    |
| SYS-40 | Starter cards have EN/PT i18n key coverage                     | source    | `node --test tests/casinocraftz-utility-cards-contract.test.mjs`  | ❌ Wave 0    |
| SYS-40 | Essence counter increments on tutorial completion (not on win) | unit      | `node --test tests/casinocraftz-tutorial-contract.test.mjs`       | ❌ Wave 0    |
| SYS-41 | Card activation does not advance tutorial step                 | unit      | `node --test tests/casinocraftz-tutorial-contract.test.mjs`       | ❌ Wave 0    |
| SYS-41 | All new data-attr hooks present in EN/PT slots pages           | source    | `node --test tests/casinocraftz-tutorial-contract.test.mjs`       | ❌ Wave 0    |

**Regression guard (existing — must pass unmodified):**

```bash
node --test tests/slots-core-determinism-contract.test.mjs tests/slots-economy-contract.test.mjs tests/compatibility-contract.test.mjs
npx playwright test e2e/compatibility.spec.ts --grep "casinocraftz embeds slots"
```

### Sampling Rate

- **Per task commit:** `node --test tests/casinocraftz-tutorial-contract.test.mjs tests/casinocraftz-utility-cards-contract.test.mjs tests/slots-core-determinism-contract.test.mjs tests/slots-economy-contract.test.mjs`
- **Per wave merge:** Full `node --test tests/*.test.mjs`
- **Phase gate:** Full node test suite + `npx playwright test e2e/compatibility.spec.ts` green before phase close

### Wave 0 Gaps

- [ ] `tests/casinocraftz-tutorial-contract.test.mjs` — covers EDU-40, EDU-41, SYS-40, SYS-41 (source + unit)
- [ ] `tests/casinocraftz-utility-cards-contract.test.mjs` — covers card config parity + authority boundary assertions
- [ ] New i18n keys added to `en.json` and `pt.json` (tutorial, dialogue, card, essence namespaces)
- [ ] New `data-casinocraftz-*` markup zones in `src/pages/en/slots/index.astro` and `src/pages/pt/slots/index.astro`

---

## Environment Availability

Step 2.6: No external tools beyond current stack required. Node.js, TypeScript, Playwright, and Tailwind are all installed. SKIPPED further audit — code/config-only additions.

---

## Code Examples

### Extending `main.ts` host gate

```typescript
// src/scripts/slots/main.ts (addition to existing casinocraftz gate)
if (hostMode === 'casinocraftz') {
  const houseEdgeLesson = root.querySelector('[data-slots-lesson="house-edge"]');
  if (houseEdgeLesson instanceof HTMLElement) {
    houseEdgeLesson.classList.remove('hidden');
    houseEdgeLesson.setAttribute('aria-hidden', 'false');
  }
  // NEW in Phase 31:
  mountCasinocraftzTutorialLayer(root, mountedController.visualEvents, signal);
}
```

### Contract test pattern (source parity)

```javascript
// tests/casinocraftz-tutorial-contract.test.mjs
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const en = JSON.parse(readFileSync(resolve(process.cwd(), 'src/i18n/en.json'), 'utf8'));
const pt = JSON.parse(readFileSync(resolve(process.cwd(), 'src/i18n/pt.json'), 'utf8'));

const TUTORIAL_KEYS = [
  'casinocraftz.tutorial.step.intro',
  'casinocraftz.tutorial.step.firstSpin',
  'casinocraftz.tutorial.step.houseEdgeReveal',
  'casinocraftz.tutorial.step.firstWinContext',
  'casinocraftz.tutorial.step.complete',
  'casinocraftz.essence.label',
  'casinocraftz.essence.unit',
];

test('EDU-40: tutorial i18n keys present in both EN and PT', () => {
  for (const key of TUTORIAL_KEYS) {
    assert.ok(key in en, `missing EN key: ${key}`);
    assert.ok(key in pt, `missing PT key: ${key}`);
    assert.ok(en[key].length > 0, `empty EN value: ${key}`);
    assert.ok(pt[key].length > 0, `empty PT value: ${key}`);
  }
});
```

---

## Open Questions

1. **Dialogue overlay placement inside iframe**
   - What we know: Tutorial overlays should live in the Slots shell (inside iframe context).
   - What's unclear: Whether dialogue should render as an absolutely-positioned panel above the reel frame or as an inline contextual block below the house-edge lesson panel.
   - Recommendation: Start with an inline contextual block (simpler, no z-index hazards). The planner can choose position.

2. **First-run detection mechanism**
   - What we know: `sessionStorage` avoids cross-session state and keeps tests predictable.
   - What's unclear: Whether "first-run" should reset when navigating away and back (session scoped) or persist per canonical route visit.
   - Recommendation: Session-scoped (`sessionStorage`) with an explicit `data-casinocraftz-tutorial-first-run="true"` attribute reset at `initSlotsShell()` start when `hostMode === 'casinocraftz'`. Tests control first-run by clearing sessionStorage before navigation.

3. **Utility card unlock gating**
   - What we know: Cards are "starter" cards — the name implies they unlock during or after the tutorial.
   - What's unclear: Whether all three unlock at step `complete` simultaneously, or if Probability Seer/Dopamine Dampener unlock at intermediate steps.
   - Recommendation: The planner should decide. Research supports either design (both are straightforward to implement deterministically).

---

## Sources

### Primary (HIGH confidence)

- Direct codebase inspection: `src/scripts/slots/` module tree, `main.ts`, `controller.ts`, `economy.ts`, `animation/events.ts`
- Direct codebase inspection: `src/pages/{en,pt}/slots/index.astro`, `src/pages/{en,pt}/casinocraftz/index.astro`
- Direct codebase inspection: `src/i18n/en.json`, `src/i18n/pt.json`
- Direct codebase inspection: `tests/*.test.mjs` — Node.js `--test` contract patterns
- Direct codebase inspection: `e2e/compatibility.spec.ts` — Playwright E2E patterns
- Live test run: `node --test tests/slots-core-determinism-contract.test.mjs tests/slots-economy-contract.test.mjs` — 6/6 pass confirmed

### Secondary (MEDIUM confidence)

- CONTEXT.md, ROADMAP.md, REQUIREMENTS.md, STATE.md — phase framing and constraints verified

---

## Metadata

**Confidence breakdown:**

- Standard stack: HIGH — no new packages; existing TypeScript, Astro, Node test, Playwright all confirmed in repo
- Architecture: HIGH — all extension points verified by direct code inspection; host gate, visual event store, i18n pattern, dataset attribute contracts
- Pitfalls: HIGH — each pitfall derived from observed code patterns, not speculation
- EN/PT parity: HIGH — key namespaces enumerated; contract test pattern verified against existing test structure
- Determinism constraints: HIGH — `spinIndex`-driven tutorial verified as the only non-random approach consistent with existing test idioms

**Research date:** 2026-04-03
**Valid until:** 2026-05-03 (stable stack; no fast-moving dependencies)
