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
- ✓ VIS-20/VIS-21/VIS-22 slots shell and presentation upgrade with cabinet framing, stronger HUD hierarchy, and EN/PT parity — v1.6 Phase 26
- ✓ FX-20/FX-21/FX-22 richer effects, motion, and atmosphere polish with deterministic runtime hooks and theme-aware compatibility coverage — v1.6 Phase 27
- ✓ QA-30/QA-31 visual confidence and release verification coverage for refreshed Slots routes — v1.6 Phase 28
- ✓ CCZ-40/CCZ-41 canonical EN/PT Casinocraftz host routes with explicit zero-risk framing — v1.7
- ✓ SLOT-40/SLOT-41 Slots integrated into Casinocraftz with deterministic authority and parity protection — v1.7
- ✓ EDU-40/EDU-41 house-edge-first tutorial shipped with hybrid narrative and direct system explanation flow — v1.7
- ✓ SYS-40/SYS-41 AI Essence and three starter utility cards delivered with deterministic spin-bridge progression — v1.7
- ✓ SYS-42/QA-40/QA-41 integrated confidence lock closed with anti-monetization contracts, EN/PT compatibility checks, and release evidence — v1.7

### Active

- [ ] Define v1.8 requirements and roadmap via /gsd:new-milestone

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

- Active milestone: none
- Latest shipped milestone: v1.7 Casinocraftz Foundation and Slots Integration (completed 2026-04-03)
- Phase progress: milestone complete; awaiting next milestone kickoff
- v1.4 shipped scope: deterministic animation runtime, sprite atlas integration, animated symbol states, presentation-only theme variants, and runtime confidence lock (contracts + compatibility coverage)
- Active surfaces: Canvas at `/en/canvas/`, Projects hub at `/en/projects/`, and playable Slots routes at `/en/slots/` and `/pt/slots/` with deterministic gameplay loop, upgraded runtime observability, refreshed cabinet-style shell presentation, and richer atmosphere/effect states
- Archive artifacts: `.planning/milestones/v1.2-ROADMAP.md`, `.planning/milestones/v1.2-REQUIREMENTS.md`, `.planning/milestones/v1.3-ROADMAP.md`, `.planning/milestones/v1.3-REQUIREMENTS.md`, `.planning/milestones/v1.3-MILESTONE-AUDIT.md`, `.planning/milestones/v1.4-ROADMAP.md`, `.planning/milestones/v1.4-REQUIREMENTS.md`, `.planning/milestones/v1.5-ROADMAP.md`, `.planning/milestones/v1.5-REQUIREMENTS.md`, `.planning/milestones/v1.6-ROADMAP.md`, `.planning/milestones/v1.6-REQUIREMENTS.md`, `.planning/milestones/v1.7-ROADMAP.md`, `.planning/milestones/v1.7-REQUIREMENTS.md`

## Next Milestone Goals

- Define v1.8 product scope and requirements via /gsd:new-milestone.
- Preserve deterministic runtime behavior, EN/PT parity, and anti-monetization guardrails as baseline constraints.
- Continue milestone-bounded delivery with archive-first roadmap and requirements management.

## Current Milestone: v1.8 Deterministic Learning Loop Expansion

**Goal:** Expand learning-loop clarity and progression confidence while preserving deterministic authority boundaries, EN/PT parity, and anti-monetization guarantees.

**Target features:**

- Versioned and backward-compatible bridge contracts between Slots runtime and tutorial progression surfaces
- Deterministic step-causality guidance plus bounded recap/replay UX for learning clarity
- EN/PT and host-mode matrix parity locks across embedded and standalone flows
- Confidence lock with explicit anti-monetization assertions and auditable release evidence chain

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

_Last updated: 2026-04-03 after v1.8 milestone kickoff_
