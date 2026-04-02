# Company Canvas — Animated Brand Asset Generator

## What This Is

A feature on Gabriel's personal portfolio site that lets companies enter their name and brand colors, pick from a preset library of sprite-based animation styles, preview the result live, and pay to download a polished MP4/WebM marketing asset. It lives inside an existing Astro + Cloudflare Pages site with Stripe and a Claude AI worker already wired up.

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

### Active

- [ ] Projects page (nav hub) listing Canvas and Slots, replacing top-menu Canvas link
- [ ] Canvas relocated to /en/projects/ → /en/canvas/ hierarchy
- [ ] Slots game research — game concepts, themed machine directions, sprite asset sources
- [ ] Slots foundation — /en/slots/ and /pt/slots/ shell (bilingual, no gameplay)

### Out of Scope

- URL scraping to extract brand identity — complexity vs. value; user picks colors manually instead
- User-uploaded sprites — requires asset pipeline and moderation
- GIF export — MP4/WebM covers the use case and is higher quality
- Server-side headless render — browser-captured export tried first (simpler, no infra)
- AI-generated sprites — preset library is the v1 approach

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

## Current State

- Shipped milestone: v1.0 (2026-04-02)
- Scope delivered: Phase 1-5 roadmap complete (23/23 plans)
- Archive artifacts: `.planning/milestones/v1.0-ROADMAP.md`, `.planning/milestones/v1.0-REQUIREMENTS.md`

## Next Milestone Goals

- Define v1.1 requirements from observed usage and conversion friction
- Prioritize highest-impact UX and performance follow-ups
- Keep roadmap milestone-scoped with fresh requirements and phased validation

## Current Milestone: v1.2 Projects Hub & Slots Foundation

**Goal:** Restructure navigation around a Projects hub, relocate Canvas under it, and research + scaffold a new Slots game with themed machines.

**Target features:**

- Projects page (nav hub) — lists Canvas and Slots, replaces top-menu direct Canvas link
- Slots research — game concepts, themed machine directions, sprite sources / asset libraries
- Slots foundation — /en/slots/ + /pt/slots/ project shell (bilingual, no gameplay yet)

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

_Last updated: 2026-04-02 after v1.2 milestone kickoff_
