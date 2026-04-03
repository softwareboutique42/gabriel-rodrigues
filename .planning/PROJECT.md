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
- ✓ Slots gameplay implementation — deterministic reels, paylines, win logic, and guarded economy flow — v1.3
- ✓ EN/PT gameplay runtime messaging and insufficient-credit browser coverage — v1.3

### Active

- [ ] Analytics instrumentation for Projects → Slots funnel and gameplay events
- [ ] Motion accessibility controls (`prefers-reduced-motion` + intensity tiers) for Slots runtime
- [ ] Runtime performance guardrails for animation-heavy gameplay loops

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

| Decision                                          | Rationale                                                      | Outcome         |
| ------------------------------------------------- | -------------------------------------------------------------- | --------------- |
| Preset style library over AI-generated sprites    | Predictable quality, faster v1                                 | ✓ Confirmed     |
| Browser-side MP4 capture                          | Avoids server infra complexity                                 | ✓ Confirmed     |
| Industry + mood as style axes                     | More expressive selection than one dimension                   | ✓ Confirmed     |
| Free preview / paid export                        | Maximizes conversion funnel, Stripe already wired              | ✓ Confirmed     |
| Projects hub replaces direct Canvas nav           | Canvas becomes one of two projects, sets up Slots              | ✓ v1.2          |
| Canonical Canvas routes preserved                 | No alias nesting; redirects deferred                           | ✓ v1.2          |
| Slots scoped to shell + disclaimer only           | Foundation without gameplay scope creep                        | ✓ v1.2          |
| Two-layer compatibility validation                | Contract gate (fast) + E2E journeys (runtime)                  | ✓ v1.2          |
| Deterministic Slots core loop on canonical routes | Preserve IA while shipping playable gameplay                   | ✓ v1.3          |
| Verification backfill before milestone closeout   | Restore audit traceability before archive                      | ✓ v1.3          |
| Runtime hardening after audit findings            | Close non-blocking debt before archive                         | ✓ v1.3          |
| Symbol-state animations remain presentation-only  | Keep payout/economy authority invariant across visual upgrades | ✓ v1.4 Phase 20 |
| Theme variants resolve via deterministic fallback | Allow visual customization without gameplay branching          | ✓ v1.4 Phase 20 |

## Current State

- Active milestone: v1.4 (in progress)
- Phase progress: 3/5 phases complete (18-20 done, 21 next)
- Scope delivered in v1.4 so far: deterministic animation runtime, sprite atlas integration, animated symbol states, and presentation-only theme variants
- Active surfaces: Canvas at `/en/canvas/`, Projects hub at `/en/projects/`, and playable Slots routes at `/en/slots/` and `/pt/slots/` with deterministic gameplay loop and upgraded visual runtime observability
- Archive artifacts: `.planning/milestones/v1.2-ROADMAP.md`, `.planning/milestones/v1.2-REQUIREMENTS.md`, `.planning/milestones/v1.3-ROADMAP.md`, `.planning/milestones/v1.3-REQUIREMENTS.md`, `.planning/milestones/v1.3-MILESTONE-AUDIT.md`

## Next Milestone Goals

- Upgrade Slots visual quality with polished reel/symbol/effect animation systems
- Introduce a production sprite pipeline (atlases + animated symbols + theme variants)
- Preserve deterministic gameplay behavior, EN/PT parity, accessibility motion controls, and runtime performance while visual complexity increases

## Current Milestone: v1.4 Slots Animation & Sprite Upgrade

**Goal:** Improve the Slots experience with richer animation and sprite presentation while keeping deterministic gameplay and strong runtime confidence.

**Target features:**

- Reel spin, stop, win/lose, idle, and UI transition animation polish
- New sprite symbol set with atlas pipeline, animated symbols, and theme variants
- Motion accessibility controls (`prefers-reduced-motion` + in-product intensity levels)
- Performance and regression hardening for animation-heavy runtime paths

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

_Last updated: 2026-04-03 after Phase 20 completion_
