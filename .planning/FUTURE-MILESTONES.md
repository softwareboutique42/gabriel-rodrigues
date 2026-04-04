# Casinocraftz — Future Milestones

Reference document for planned milestones v2.2 → v2.13.
GSD execution artifacts (REQUIREMENTS.md, ROADMAP.md) are created per-milestone via `/gsd:new-milestone`.

**Last updated:** 2026-04-04
**Phase continuity:** Continues from Phase 42 (v2.1)

---

## TRACK 1 — Education (Lesson 3)

### v2.2 — Sensory Conditioning Content (Phase 43–44)

**Goal:** Unlock and implement Lesson 3 — dialogue, step progression, spin-bridge observation, unlock trigger (requires Near-Miss complete).

**Starting phase:** 43

**Requirements:**

- `EDU-70`: User can access Lesson 3 after completing Lesson 2 (Near-Miss)
- `EDU-71`: Lesson 3 dialogue explains how sensory triggers (lights, sounds, pacing) condition response without changing odds
- `EDU-72`: Spin-bridge observation gates step advancement (2 spins threshold)
- `EDU-73`: Lesson 3 completion is tracked and persisted (localStorage)

**Phase sketch:**

- Phase 43: Dialogue registry (EN/PT), step definitions, unlock trigger from near-miss completion
- Phase 44: Spin-bridge observation threshold, causality copy, EN/PT parity lock

---

### v2.3 — Sensory Effects Layer (Phase 45–46)

**Goal:** Add demonstrable win-celebration effects (neon pulse, reel glow) to Slots; Dopamine Dampener card actually suppresses them.

**Starting phase:** 45

**Requirements:**

- `FX-70`: Win outcomes trigger visible celebration effect (neon pulse, reel glow)
- `FX-71`: Dopamine Dampener card suppresses win-celebration effects when active
- `FX-72`: Effects system respects `prefers-reduced-motion` and motion-policy guardrails
- `FX-73`: EN/PT parity for effects system

**Phase sketch:**

- Phase 45: Win-celebration CSS animation system (motion-policy-safe, data-slots-outcome hook)
- Phase 46: Dampener Card suppression wiring, before/after demo, EN/PT confidence lock

---

## TRACK 2 — Blackjack (5 milestones)

### v2.4 — Blackjack Foundation (Phase 47–48)

**Goal:** Ship `/en/blackjack/` and `/pt/blackjack/` shell routes with compliance notice; unlock lobby card.

**Starting phase:** 47

**Requirements:**

- `BJ-10`: `/en/blackjack/` and `/pt/blackjack/` routes exist and render
- `BJ-11`: Blackjack lobby card in casinocraftz unlocked (no longer `disabled`)
- `BJ-12`: Compliance disclaimer (no real gambling, no real money) present on page
- `BJ-13`: EN/PT i18n parity for all shell strings

**Phase sketch:**

- Phase 47: Astro pages (EN/PT), BaseLayout, compliance notice, in-dev badge
- Phase 48: Lobby card activated, EN/PT route parity lock

---

### v2.5 — Blackjack Core Engine (Phase 49–50)

**Goal:** Card deck, deal logic, hand evaluation (bust/21/blackjack/push), dealer AI state machine.

**Starting phase:** 49

**Requirements:**

- `BJ-20`: User can receive two cards and see their hand value
- `BJ-21`: User can Hit (draw a card) or Stand (end turn)
- `BJ-22`: Dealer draws automatically (hit < 17, stand ≥ 17)
- `BJ-23`: Hand outcomes resolve correctly (bust/win/push/blackjack)
- `BJ-24`: Ace counts as 11 or 1, whichever avoids bust

**Phase sketch:**

- Phase 49: Deck module, deal, hand evaluator (ace flexibility, bust, blackjack detection)
- Phase 50: Dealer AI, game loop state machine (player-turn → dealer-turn → resolved)

---

### v2.6 — Blackjack Economy (Phase 51–52)

**Goal:** Bet placement UI, AI Essence wallet integration, win/loss/push settlement.

**Starting phase:** 51

**Requirements:**

- `BJ-30`: User can place a bet before dealing (uses AI Essence from shared wallet)
- `BJ-31`: Bet is debited from wallet on deal
- `BJ-32`: Win pays 1:1, natural blackjack pays 3:2, push refunds bet
- `BJ-33`: User cannot deal with insufficient balance (guard + message)
- `BJ-34`: Balance persists across lobby navigation (shared `ccz-wallet` localStorage)

**Phase sketch:**

- Phase 51: Bet input (min 1, max configurable), debit on deal, wallet load/save
- Phase 52: Payout logic, economy state machine, insufficient-funds guard

---

### v2.7 — Blackjack Educational Layer (Phase 53–54)

**Goal:** Real-time probability hints per hand, house edge overlay, educational dialogue system.

**Starting phase:** 53

**Requirements:**

- `BJ-40`: Bust probability for player's current hand shown in real-time
- `BJ-41`: House edge percentage shown as persistent HUD badge
- `BJ-42`: Educational dialogue fires on deal, bust, blackjack, and push (explains psychology/math)
- `BJ-43`: EN/PT i18n for all educational strings

**Phase sketch:**

- Phase 53: Probability display (bust %, dealer likely outcome), house edge badge
- Phase 54: Educational dialogue triggers (narrator + system roles), EN/PT coverage

---

### v2.8 — Blackjack Polish + Confidence Lock (Phase 55–56)

**Goal:** Card flip animations, win/loss feedback, EN/PT compatibility contracts.

**Starting phase:** 55

**Requirements:**

- `BJ-50`: Cards animate on deal (flip reveal)
- `BJ-51`: Win/loss/push states have distinct visual feedback
- `BJ-52`: All interactions respect `prefers-reduced-motion`
- `BJ-53`: EN/PT source contracts and compatibility coverage lock the release

**Phase sketch:**

- Phase 55: Card flip CSS animation, win/loss/push visual states, HUD transitions
- Phase 56: Source contracts, EN/PT compatibility, motion-policy compliance, release evidence

---

## TRACK 3 — Roulette (5 milestones)

### v2.9 — Roulette Foundation (Phase 57–58)

**Goal:** Ship `/en/roulette/` and `/pt/roulette/` shell routes; unlock lobby card.

**Starting phase:** 57

**Requirements:**

- `RL-10`: `/en/roulette/` and `/pt/roulette/` routes exist and render
- `RL-11`: Roulette lobby card in casinocraftz unlocked
- `RL-12`: Compliance disclaimer present
- `RL-13`: EN/PT i18n parity

**Phase sketch:**

- Phase 57: Astro pages (EN/PT), BaseLayout, compliance notice
- Phase 58: Lobby card activated, EN/PT parity lock

---

### v2.10 — Roulette Core Engine (Phase 59–60)

**Goal:** Wheel spin resolution (European 0–36), bet types, payout table.

**Starting phase:** 59

**Requirements:**

- `RL-20`: Wheel spin resolves to a number 0–36 (European single zero)
- `RL-21`: User can place a straight-up bet (single number, 35:1)
- `RL-22`: User can place color bets (red/black, 1:1) and even/odd bets (1:1)
- `RL-23`: User can place dozen bets (1-12, 13-24, 25-36, 2:1)
- `RL-24`: Multiple bets can be placed before a single spin

**Phase sketch:**

- Phase 59: RNG module (deterministic, seeded), spin resolver, payout table
- Phase 60: Bet type registry, multi-bet support, outcome resolution

---

### v2.11 — Roulette Economy (Phase 61–62)

**Goal:** Chip placement UI, wallet integration, multi-bet settlement.

**Starting phase:** 61

**Requirements:**

- `RL-30`: User can place chips on the betting grid (multiple bets per spin)
- `RL-31`: Total bet debited from wallet before spin
- `RL-32`: Each winning bet pays out independently; losses collected
- `RL-33`: User cannot spin with zero bet or insufficient balance
- `RL-34`: Balance persists via shared `ccz-wallet`

**Phase sketch:**

- Phase 61: Chip selector (1/5/10/25), bet placement on grid, wallet debit
- Phase 62: Settlement loop, insufficient-funds guard, wallet save

---

### v2.12 — Roulette Educational Layer (Phase 63–64)

**Goal:** Per-bet probability display, gambler's fallacy nudge, house edge badge.

**Starting phase:** 63

**Requirements:**

- `RL-40`: Win probability shown per bet type in the betting grid
- `RL-41`: House edge percentage (2.7% European) shown as persistent HUD badge
- `RL-42`: Gambler's fallacy nudge fires after 3 consecutive same-color spins
- `RL-43`: EN/PT i18n for all educational strings

**Phase sketch:**

- Phase 63: Probability column per bet type (2.7% single, 48.6% color, etc.)
- Phase 64: Gambler's fallacy nudge trigger, EN/PT strings

---

### v2.13 — Roulette Polish + Confidence Lock (Phase 65–66)

**Goal:** Visual wheel (CSS/SVG), ball animation, winning-number announce, EN/PT contracts.

**Starting phase:** 65

**Requirements:**

- `RL-50`: Wheel visual shows numbered sectors (CSS/SVG)
- `RL-51`: Ball animates before outcome is revealed
- `RL-52`: Winning number highlighted prominently after spin
- `RL-53`: EN/PT source contracts and compatibility coverage lock the release

**Phase sketch:**

- Phase 65: CSS/SVG wheel, ball drop animation, winning-number highlight
- Phase 66: Source contracts, EN/PT compatibility, motion-policy compliance, release evidence

---

## Summary

| Milestone | Name                         | Phases | Track     |
| --------- | ---------------------------- | ------ | --------- |
| v2.2      | Sensory Conditioning Content | 43–44  | Education |
| v2.3      | Sensory Effects Layer        | 45–46  | Education |
| v2.4      | Blackjack Foundation         | 47–48  | Blackjack |
| v2.5      | Blackjack Core Engine        | 49–50  | Blackjack |
| v2.6      | Blackjack Economy            | 51–52  | Blackjack |
| v2.7      | Blackjack Educational Layer  | 53–54  | Blackjack |
| v2.8      | Blackjack Polish             | 55–56  | Blackjack |
| v2.9      | Roulette Foundation          | 57–58  | Roulette  |
| v2.10     | Roulette Core Engine         | 59–60  | Roulette  |
| v2.11     | Roulette Economy             | 61–62  | Roulette  |
| v2.12     | Roulette Educational Layer   | 63–64  | Roulette  |
| v2.13     | Roulette Polish              | 65–66  | Roulette  |

**Total: 12 milestones, 24 phases (43–66)**
