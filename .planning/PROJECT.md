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

### Active

- [ ] Preset style library with industry + mood as selection axes (3–5 styles)
- [ ] Company name + brand color input that drives animation appearance
- [ ] Sprite-based animations that look polished and professional per style
- [ ] Live canvas preview updates as user changes name/colors/style
- [ ] MP4/WebM export of the animation
- [ ] Export gated behind Stripe payment (free to preview, paid to download)
- [ ] Bilingual UI (EN + PT) for all new UI elements

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

| Decision                                       | Rationale                                         | Outcome   |
| ---------------------------------------------- | ------------------------------------------------- | --------- |
| Preset style library over AI-generated sprites | Predictable quality, faster v1                    | — Pending |
| Browser-side MP4 capture                       | Avoids server infra complexity                    | — Pending |
| Industry + mood as style axes                  | More expressive selection than one dimension      | — Pending |
| Free preview / paid export                     | Maximizes conversion funnel, Stripe already wired | — Pending |

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

_Last updated: 2026-04-01 after initialization_
