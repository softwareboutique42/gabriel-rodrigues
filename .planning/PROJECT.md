# Company Canvas — Animated Brand Asset Generator

## What This Is

A feature on Gabriel's personal portfolio site that lets companies enter their name and brand colors, pick from a preset library of sprite-based animation styles, preview the result live, and pay to download a polished MP4/WebM marketing asset. A bilingual Projects hub exposes Canvas and a forthcoming Slots game as the two experiences. It lives inside an existing Astro + Cloudflare Pages site with Stripe and a Claude AI worker already wired up.

## Core Value

Companies get a branded, download-ready animation asset in under a minute — no design tools, no agency, no waiting.

## Requirements

### Validated

- ✓ Canvas page exists at `/en/canvas/` and `/pt/canvas/` — existing
- ✓ Cloudflare Worker with Claude AI brand analysis — existing
- ✓ Stripe payment integration — existing
- ✓ Three.js animation runtime — existing
- ✓ KV caching for brand analysis responses — existing
- ✓ Preset style library with industry + mood as selection axes — v1.0
- ✓ Company name + brand color input drives animation appearance — v1.0
- ✓ Sprite-based animations polished by style family and loop-safe — v1.0
- ✓ Live canvas preview updates from name/color/style changes — v1.0
- ✓ MP4/WebM export of generated animation — v1.0
- ✓ Stripe-gated download flow (free preview, paid export) — v1.0
- ✓ Bilingual EN/PT coverage for export UX strings — v1.0
- ✓ Projects hub at `/en/projects/` and `/pt/projects/` listing Canvas and Slots — v1.2
- ✓ Header nav replaced direct Canvas link with Projects — v1.2
- ✓ Slots shell at `/en/slots/` and `/pt/slots/` with non-gambling disclaimer — v1.2
- ✓ EN/PT route-switch, discovery flow, and alias-deny regression coverage — v1.2

### Active

- [ ] Slots gameplay implementation — functional reels, paylines, win logic, game economy

### Out of Scope

- URL scraping to extract brand identity — complexity vs. value; user picks colors manually instead
- User-uploaded sprites — requires asset pipeline and moderation
- GIF export — MP4/WebM covers the use case and is higher quality
- Server-side headless render — browser-captured export tried first (simpler, no infra)
- AI-generated sprites — preset library is the v1 approach
- `/projects/canvas/*` alias routes — canonical routes preserved at `/en/canvas/` without nested path; reduces routing complexity
- Slots gameplay in v1.2 — foundation-only milestone; gameplay deferred to future milestone
- Analytics instrumentation — deferred for v1.2 scope control

## Context

- Site is an Astro 6 static site deployed to Cloudflare Pages
- Canvas feature already exists with basic Three.js animations (8 styles, v1 Classic / v2 Story)
- Claude AI worker (`api/`) performs brand analysis from company name
- Stripe is already integrated for payment gating
- All pages have EN + PT versions — any new UI must be added to both
- Client scripts must use `astro:page-load` event (View Transitions / SPA mode)
- Bilingual content in `src/i18n/en.json` and `src/i18n/pt.json`

## Constraints

- **Tech stack**: Astro 6, Three.js, Cloudflare Workers, Stripe — no new frameworks
- **i18n**: Every user-facing string must have EN + PT versions
- **Export**: Browser-side capture first (no server-side video rendering infra)
- **Billing**: Stripe already integrated — extend existing payment flow, don't replace it
- **Deployment**: Static output only — no SSR, no Node server

## Key Decisions

| Decision                                       | Rationale                                         | Outcome     |
| ---------------------------------------------- | ------------------------------------------------- | ----------- |
| Preset style library over AI-generated sprites | Predictable quality, faster v1                    | ✓ Confirmed |
| Browser-side MP4 capture                       | Avoids server infra complexity                    | ✓ Confirmed |
| Industry + mood as style axes                  | More expressive selection than one dimension      | ✓ Confirmed |
| Free preview / paid export                     | Maximizes conversion funnel, Stripe already wired | ✓ Confirmed |
| Projects hub replaces direct Canvas nav        | Canvas becomes one of two projects, sets up Slots | ✓ v1.2      |
| Canonical Canvas routes preserved              | No alias nesting; redirects deferred              | ✓ v1.2      |
| Slots scoped to shell + disclaimer only        | Foundation without gameplay scope creep           | ✓ v1.2      |
| Two-layer compatibility validation             | Contract gate (fast) + E2E journeys (runtime)     | ✓ v1.2      |

## Current State

- Shipped milestone: v1.2 (2026-04-02)
- Scope delivered: Phases 9-12 complete (4/4 plans)
- Active surfaces: Canvas at `/en/canvas/`, Projects hub at `/en/projects/`, Slots shell at `/en/slots/` (EN + PT)
- Archive artifacts: `.planning/milestones/v1.2-ROADMAP.md`, `.planning/milestones/v1.2-REQUIREMENTS.md`

## Next Milestone Goals

- Ship playable Slots core loop with deterministic reels, paylines, and win evaluation
- Add lightweight game economy configuration with controlled progression rules
- Preserve EN/PT parity and canonical route behavior while introducing gameplay flows

## Current Milestone: v1.3 Slots Gameplay Foundation

**Goal:** Make the Slots game work well by shipping the first complete gameplay loop on top of the existing shell routes.

**Target features:**

- Reels, paylines, and outcome evaluation with deterministic loop behavior
- Core economy rules (bet sizing, payout table, session-safe credits)
- Bilingual EN/PT gameplay copy and interaction parity

## Evolution

This document evolves at phase transitions and milestone boundaries.

**After each phase transition** (via `/gsd:transition`):

1. Requirements invalidated? → Move to Out of Scope with reason
2. Requirements validated? → Move to Validated with phase reference
3. New requirements emerged? → Add to Active
4. Decisions to log? → Add to Key Decisions
5. "What This Is" still accurate? → Update if drifted

**After each milestone** (via `/gsd:complete-milestone`):

1. Full review of all sections
2. Core Value check — still the right priority?
3. Audit Out of Scope — reasons still valid?
4. Update Context with current state

---

_Last updated: 2026-04-02 after v1.3 milestone kickoff_
