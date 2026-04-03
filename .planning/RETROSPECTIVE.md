# Project Retrospective

_A living document updated after each milestone. Lessons feed forward into future planning._

---

## Milestone: v1.2 — Projects Hub & Slots Foundation

**Shipped:** 2026-04-02
**Phases:** 4 (9-12) | **Plans:** 4 | **Git range:** `e50c181..d978fbe`
**Files changed:** 30 | **Lines:** +2,751 / -9

### What Was Built

- Projects hub at `/en/projects/` and `/pt/projects/` — bilingual card layout surfacing Canvas and Slots with canonical CTAs
- Header nav swapped from direct Canvas link to Projects with active-surface matching for all three project paths
- Slots shell at `/en/slots/` and `/pt/slots/` — in-development status, non-gambling/no-real-money disclaimers, SPA-safe `initSlotsShell()` lifecycle
- Compatibility regression suite: contract tests for counterpart mapping + alias deny-list, and Playwright E2E for EN/PT discovery and language-switch journeys

### What Worked

- Keeping Phase 12 purely QA (no product changes) meant execution was narrow and predictable
- Two-layer validation (node:test contract gate → Playwright E2E) caught a flaky href-based locator in CI before it could regress
- AbortController + `astro:before-swap` + root guard pattern transferred cleanly from Canvas to Slots with zero SPA lifecycle friction
- Milestone scope was well-defined: four focused phases with clear dependency chain, no backtracking

### What Was Inefficient

- Initial Playwright locator used `a[href="/en/slots/"]` inside SPA — failed due to pointer interception; switching to `getByRole` required a second run
- REQUIREMENTS.md traceability table was left at "Pending" throughout all phases — had to be updated retrospectively at milestone close
- STATE.md was not progressively updated during execution; showed 0% at milestone end

### Patterns Established

- `pathRegex()` helper in Playwright for trailing-slash-tolerant URL assertions — reuse in future E2E specs
- Phase summaries should include a `## Validation` section (detected as verification debt by `gsd-tools`) — add this as standard contract
- Alias routes should be explicitly listed in contract deny-list at phase boundary, not just deferred informally

### Key Lessons

1. Lock counterpart URLs (EN↔PT switches) in contract tests at the phase that introduces the route — waiting until Phase 12 meant earlier regressions were theoretically possible
2. `getByRole` locators are more SPA-stable than href-based selectors — use role-first in all new Playwright tests
3. Mobile-chrome failures in canvas tests (sticky header pointer interception) are a pre-existing baseline issue needing a dedicated fix phase

---

## Milestone: v1.3 — Slots Gameplay Foundation

**Shipped:** 2026-04-02
**Phases:** 5 (13-17) | **Plans:** 5

### What Was Built

- Deterministic Slots gameplay loop on canonical EN/PT routes with seeded reel resolution, explicit lifecycle transitions, and payline payout evaluation
- Session-safe balance and bet loop with invalid-action guards, insufficient-credit handling, and mirrored EN/PT gameplay copy
- Compatibility and regression hardening across gameplay logic, canonical routing, and locale switching
- Verification backfill plus runtime hardening that closed milestone audit debt with direct PT browser-flow coverage and completed UAT

### What Worked

- One-plan-per-phase structure kept milestone scope clear and made dependencies between gameplay, economy, QA, audit backfill, and runtime hardening easy to reason about
- Contract-first gameplay coverage caught deterministic and economy regressions before browser checks needed to expand
- Backfilling verification artifacts before milestone closeout restored audit traceability without reopening gameplay implementation scope
- Treating Phase 17 as targeted debt retirement avoided scope creep while still improving real browser confidence

### What Was Inefficient

- Verification and milestone audit debt surfaced after gameplay shipped, which forced a dedicated backfill phase and a follow-up hardening phase instead of cleaner inline closure
- Milestone closeout required manual cleanup of stale human-readable state after CLI transitions, which creates avoidable planning-file churn
- Summary frontmatter did not provide one-line accomplishment metadata consistently, so milestone aggregation produced weak default output

### Patterns Established

- Every shipped phase should include both a `## Validation` section in the summary and a matching `*-VERIFICATION.md` artifact before milestone closeout
- UAT can stay small and high-signal when derived directly from user-observable milestone debt instead of broad exploratory testing
- Post-audit hardening phases work best when they are explicitly non-functional and avoid touching shipped product logic

### Key Lessons

1. If a milestone audit identifies non-blocking debt that materially affects runtime confidence, close it before archive rather than carrying the warning forward as accepted history
2. Deterministic browser scenarios are worth deriving from seeded runtime behavior up front; otherwise Playwright coverage tends to stop at shallow attribute checks
3. Milestone automation is only trustworthy when human-readable planning files stay in sync with CLI-updated machine state

---

## Cross-Milestone Trends

### Process Evolution

| Milestone | Phases | Plans | Key Change                                            |
| --------- | ------ | ----- | ----------------------------------------------------- |
| v1.0      | 5      | 23    | Initial structure; large plans with many tasks        |
| v1.1      | 3      | 3     | Slimmer plans; one plan per phase                     |
| v1.2      | 4      | 4     | QA hardening as dedicated phase; two-layer test model |

### Cumulative Quality

| Milestone | Contract Tests | E2E Tests | Notable                                 |
| --------- | -------------- | --------- | --------------------------------------- |
| v1.0      | —              | —         | No formal test layer                    |
| v1.1      | node:test      | —         | First contract suite pattern introduced |
| v1.2      | node:test (10) | E2E (9)   | Route + i18n regression coverage added  |

### Top Lessons (Verified Across Milestones)

1. Scoping a dedicated QA/hardening phase at milestone end consistently produces cleaner closure than embedding tests in feature phases
2. Bilingual coverage (EN + PT) should be verified by contract at the phase that introduces new strings — not left to a final pass
