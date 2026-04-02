---
phase: 10-projects-hub-delivery
type: research
---

# Phase 10 Research

## Current State

- Phase 10 scope is locked to HUB-02, HUB-03, and I18N-02.
- Header already routes Projects via `/${lang}/projects/` and treats `/projects`, `/canvas`, `/slots` as the same active surface.
- EN/PT i18n already includes core keys for projects/slots statuses and labels.
- Language switch currently preserves route context by rewriting only the locale prefix.
- Missing deliverable is the actual EN/PT Projects hub pages with clear two-card split for Canvas and Slots.

## Strategy

- Deliver only `/en/projects/` and `/pt/projects/` as the new hub pages.
- Use a two-card hero split: one Canvas card (Live) and one Slots card (Foundation/In Development).
- Keep card CTAs canonical only:
  - Canvas -> `/en/canvas/` and `/pt/canvas/`
  - Slots -> `/en/slots/` and `/pt/slots/`
- Do not add `/projects/*` aliases, redirects, or nested project routes in this phase.
- Keep scope strictly discovery-layer only: no slots gameplay and no Phase 12 hardening work.

## File-Level Changes

- Create `src/pages/en/projects/index.astro`
  - Add EN Projects page with title/subtitle and two-card hero split.
  - Canvas card includes Live status and CTA to `/en/canvas/`.
  - Slots card includes Foundation/In Development status and CTA to `/en/slots/`.
- Create `src/pages/pt/projects/index.astro`
  - Mirror EN structure in PT with equivalent hierarchy and CTAs to `/pt/canvas/` and `/pt/slots/`.
- Update `src/i18n/en.json` only if new strings are introduced by final card copy.
- Update `src/i18n/pt.json` in the same commit for strict parity if EN keys change.
- No change expected in `src/components/LanguageSwitcher.astro` unless a route exception is discovered.

## Risk

- Route drift risk: accidental use of `/projects/canvas` or `/projects/slots` links breaks HUB-03 intent.
- Locale mismatch risk: adding copy in one locale only causes UX inconsistency.
- Context-loss risk: if either locale projects page is missing, language switch from `/projects/` can 404.
- Scope creep risk: adding slots gameplay UI or compatibility hardening tasks violates phase boundary.

## Validation

- Route existence checks:
  - `/en/projects/` loads
  - `/pt/projects/` loads
- Canonical link checks on both projects pages:
  - Canvas CTA points only to `/en/canvas/` or `/pt/canvas/`
  - Slots CTA points only to `/en/slots/` or `/pt/slots/`
  - No `/projects/*` alias links rendered
- Language-switch checks:
  - `/en/projects/` -> switch -> `/pt/projects/`
  - `/pt/projects/` -> switch -> `/en/projects/`
  - `/en/canvas/` <-> `/pt/canvas/` still resolves correctly
- i18n parity check:
  - Any new `projects.*`/`slots.*` keys exist in both EN and PT.

## Acceptance Criteria

- HUB-02: `/en/projects/` and `/pt/projects/` exist with clear Canvas and Slots cards and visible status labels.
- HUB-03: Canvas remains canonical and reachable at `/en/canvas/` and `/pt/canvas/` with no new alias dependency.
- I18N-02: language switch preserves route context for `/projects/` and still resolves correctly for `/canvas/`.
- Explicitly out of scope in implementation and review notes:
  - No slots gameplay
  - No Phase 12 hardening or alias rollout
