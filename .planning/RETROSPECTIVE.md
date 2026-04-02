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
