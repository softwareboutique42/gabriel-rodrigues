# Phase 34: Learning Loop Clarity and Bounded Progression UX - Context

**Gathered:** 2026-04-03
**Status:** Ready for planning

<domain>
## Phase Boundary

Improve the explanatory clarity of existing tutorial surfaces so users understand _why_ tutorial transitions occur and can clearly see card progression state. All changes live inside existing gameplay surfaces (`casinocraftz/index.astro`, `tutorial/main.ts`, `tutorial/dialogue.ts`, `tutorial/engine.ts`, `tutorial/types.ts`, `i18n/*.json`). No new routes, no new gameplay mechanics, no new card systems.

</domain>

<decisions>
## Implementation Decisions

### Step Causality Explanations (LEARN-50)

- **D-01:** Causality context is delivered **inline in dialogue copy** — `DIALOGUE_REGISTRY` entries are updated so the first message of each spin-triggered step explains what triggered it (e.g., the `probability-reveal` step dialogue opens with a line like "You've now observed 3 spins. Here's what the math shows."). No separate annotation element.
- **D-02:** Only **spin-triggered transitions** get causality context. Button-driven transitions (Next button clicks) do not need a "why" — the user initiated them explicitly. Currently the only spin-triggered transition is `play-and-observe` → `probability-reveal` (after 3 spins).

### Recap / Replay Prompts (LEARN-51)

- **D-03:** Two recap elements are present, selectively placed:
  - **Replay button** ("Revisit lesson"): visible on every step from `house-edge-intro` onward. Clicking it re-renders the current step's dialogue from the start without resetting any state (spin count, essence, cards).
  - **Collapsible "Why did this happen?" summary**: appears only after spin-triggered transitions (i.e., after `probability-reveal` is entered via bridge events). The summary statically describes the trigger condition.
- **D-04:** Replay button and collapsible summary live inside the existing tutorial zone `[data-casinocraftz-zone="tutorial"]`. No new DOM zones added.

### Card Lock / Unlock State Transparency (PROG-50)

- **D-05:** Each card in the `[data-casinocraftz-zone="cards"]` section gets a **status badge/chip** on the card header — a small inline pill/chip that reads `LOCKED` or `UNLOCKED`. The badge is styled to use the existing design system tokens (e.g., `text-text-muted` / border for locked; `text-neon` for unlocked).
- **D-06:** Badge is rendered dynamically by `renderCards()` in `main.ts` based on `state.cardsUnlocked` — no build-time hardcoding.

### Claude's Discretion

- Exact EN/PT copy for causality dialogue lines and collapsible summary content. Match the existing tone in `dialogue.ts` (narrator: informal/direct; system: factual/terse).
- Badge styling details (exact class names, pill shape) — use existing Tailwind token conventions (`font-mono text-[10px] uppercase tracking-wider`).
- Whether the collapsible state is tracked via a `<details>` element (simplest, no JS needed) or a JS toggle — prefer `<details>/<summary>` for zero-JS simplicity inside existing render functions.
- Whether replay button copy is i18n-keyed or uses a simple existing key fallback pattern (prefer i18n-keyed).

</decisions>

<canonical_refs>

## Canonical References

**Downstream agents MUST read these before planning or implementing.**

No external specs — requirements fully captured in decisions above.

### Planning Artifacts

- `.planning/REQUIREMENTS.md` — LEARN-50, LEARN-51, PROG-50 requirement definitions
- `.planning/ROADMAP.md` §Phase 34 — Goal, success criteria, key risks
- `.planning/phases/33-bridge-and-authority-hardening/33-01-SUMMARY.md` — Prior phase decisions and authority boundary patterns

### Source Files to Read

- `src/scripts/casinocraftz/tutorial/engine.ts` — Step definitions, `advanceTutorialStep()`, `recordSpin()`, step order
- `src/scripts/casinocraftz/tutorial/dialogue.ts` — `DIALOGUE_REGISTRY` — all EN/PT messages to update
- `src/scripts/casinocraftz/tutorial/main.ts` — `renderDialogue()`, `renderCards()`, `proceedStep()`, `onSpinMessage()` — where new recap/badge elements are added
- `src/scripts/casinocraftz/tutorial/types.ts` — `TutorialStepId`, `TutorialState`, `DialogueMessage`
- `src/pages/en/casinocraftz/index.astro` — Current shell HTML structure and dataset anchors
- `src/pages/pt/casinocraftz/index.astro` — PT parity file (must be kept in sync)
- `src/i18n/en.json` and `src/i18n/pt.json` — Translation strings for new replay/badge copy

</canonical_refs>

<code_context>

## Existing Code Insights

### Reusable Assets

- `[data-casinocraftz-zone="tutorial"]` — existing dialogue + CTA zone in shell; replay button and collapsible summary added here
- `[data-casinocraftz-zone="cards"]` — existing cards zone; badge added inside each `[data-casinocraftz-card]` element
- `renderDialogue()` in `main.ts` — re-rendering dialogue from top already works; replay button just calls it
- `renderCards()` in `main.ts` — already has `state.cardsUnlocked` access; badge logic added here

### Established Patterns

- Dataset anchors (`data-casinocraftz-*`) are the primary machine-readable state surface — new elements should use consistent dataset naming
- Dialogue is built entirely by JS (`renderDialogue`) — no static HTML content in the zone
- Cards are built entirely by JS (`renderCards`) — no static HTML in the cards zone
- EN/PT parity: copy in `DIALOGUE_REGISTRY` carries EN/PT variants; i18n keys handle shell copy

### Integration Points

- `renderDialogue()` creates DOM nodes — replay button is added as a sibling after the message nodes
- `onSpinMessage()` triggers `proceedStep()` indirectly through `recordSpin()` — collapsible summary should appear when step changes via spin (trackable by diffing `state.currentStep` before/after in `onSpinMessage`)
- `renderCards()` receives `state` — badge reads `state.cardsUnlocked.includes(card.id)` (same predicate already used for button disabled state)

</code_context>

<specifics>
## Specific Ideas

- Replay button: simple JS onclick that calls `renderDialogue(dialogueZone, state.currentStep, lang)` — no state mutation required
- Collapsible summary: `<details>/<summary>` element for zero-JS progressively enhanced disclosure; summary text statically describes the trigger ("You observed 3 spins on the slot machine. That's enough to see the pattern.")
- Badge chip: `<span>` inside card header row, inline with the label. `LOCKED` in muted/secondary token; `UNLOCKED` in neon token for contrast
- Collapsible appears only when a flag is set (e.g., `state.lastTransitionWasSpin: boolean` or by checking step progression diff) — Claude's discretion on clean implementation

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope.

</deferred>

---

_Phase: 34-learning-loop-clarity-and-bounded-progression-ux_
_Context gathered: 2026-04-03_
