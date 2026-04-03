# Milestones

## v1.6 Slots Visual Polish and Atmosphere (Shipped: 2026-04-03)

**Delivered:** A polished Slots presentation refresh with cabinet-style shell design, richer deterministic atmosphere and effects, and release-ready confidence coverage.

**Phases completed:** 3 phases, 3 plans, 9 tasks

**Key accomplishments:**

- Rebuilt the EN/PT Slots experience into a cabinet-style shell with stronger reel framing, HUD hierarchy, and stable controller-owned gameplay anchors.
- Added deterministic effect and atmosphere runtime hooks so charge, sustain, win, loss, blocked, and neon-theme states feel richer without gameplay authority drift.
- Locked the refreshed visual envelope with holistic contracts, stronger compatibility journeys, and a passing release chain across lint, targeted tests, Playwright, and build.

**Requirements:** 8/8 shipped (VIS-20, VIS-21, VIS-22, FX-20, FX-21, FX-22, QA-30, QA-31)

---

## v1.4 milestone (Shipped: 2026-04-03)

**Phases completed:** 5 phases, 5 plans, 8 tasks

**Key accomplishments:**

- Deterministic slots reel lifecycle runtime with presentation-only visual events, outcome feedback wiring, and stable animation observability contracts for EN/PT compatibility paths
- Slots runtime now resolves reduced-motion and intensity deterministically, applies bounded performance fallback tiers, and exposes stable accessibility/performance observability hooks validated across EN/PT contracts and compatibility E2E.
- Deterministic slots runtime confidence lock with stronger sequencing/snapshot contracts and EN/PT parity-safe Playwright coverage for QA-20

---

## v1.3 Slots Gameplay Foundation (Shipped: 2026-04-02)

**Phases completed:** 5 phases, 5 plans, 0 tasks

**Key accomplishments:**

- Delivered the first deterministic Slots gameplay loop with seeded reel resolution, explicit lifecycle control, and contract-backed payout evaluation on canonical EN/PT routes.
- Added session-safe balance and bet guardrails with localized EN/PT gameplay copy, invalid-action blocking, and economy invariants locked by contract tests.
- Locked route, gameplay, and i18n regressions with compatibility contracts, focused Playwright coverage, and verification backfill for requirements traceability.
- Closed the remaining v1.3 runtime confidence debt with PT runtime journey coverage, insufficient-credit Playwright assertions, direct localized runtime messaging checks, and passing UAT.

---

## v1.2 Projects Hub & Slots Foundation (Shipped: 2026-04-02)

**Phases completed:** 4 phases, 4 plans | 30 files changed (+2,751 / -9 lines)

**Git range:** `e50c181..d978fbe`

**Key accomplishments:**

- Replaced Canvas top-menu link with Projects, added active-surface matching for `/projects`, `/canvas`, and `/slots` in both locales, and added EN/PT parity contract tests.
- Delivered `/en/projects/` and `/pt/projects/` hub pages with two-card Canvas/Slots discovery layout and canonical CTA routing — no alias routes introduced.
- Delivered `/en/slots/` and `/pt/slots/` shell pages with explicit in-development + non-gambling/no-real-money disclaimer copy, SPA-safe `initSlotsShell()` lifecycle, and SLOT-01/02/03 contract coverage.
- Added `tests/compatibility-contract.test.mjs` + `e2e/compatibility.spec.ts` to lock counterpart mapping, canonical discovery links, alias deny-list, and EN/PT language-switch journeys across all IA surfaces.

**Requirements:** 9/9 shipped (HUB-01, HUB-02, HUB-03, SLOT-01, SLOT-02, SLOT-03, I18N-01, I18N-02, COMP-01)

---

## v1.1 milestone (Shipped: 2026-04-02)

**Phases completed:** 3 phases, 3 plans, 0 tasks

**Key accomplishments:**

- (none recorded)

---

## v1.0 milestone (Shipped: 2026-04-02)

**Delivered:** Canvas animation generator with deterministic style routing, browser video export, bilingual export UX, and 3 new premium styles.

**Phases completed:** 5 phases, 23 plans, 7 tasks

**Key accomplishments:**

- ParticlesAnimation now computes seam-safe, deterministic closed-form positions from normalized loop progress while eliminating unbounded velocity drift.
- Geometric animation now reuses palette-indexed MeshBasicMaterial instances and computes loop-safe transforms as deterministic functions of normalized progress.
- Browser export now supports Stripe-gated WebM plus Chromium MP4 (WebCodecs) with progress feedback and fallback behavior.
- Added ORBIT, PULSE, and SIGNAL styles end-to-end, including worker schema support and deterministic routing coverage.

---
