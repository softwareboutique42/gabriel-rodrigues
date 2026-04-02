# Phase 10: Projects Hub Delivery - Context

**Gathered:** 2026-04-02
**Status:** Ready for planning
**Source:** /gsd:next -> /gsd:discuss-phase 10

<domain>
## Phase Boundary

Deliver EN/PT Projects hub pages as the discovery layer for Canvas and Slots while preserving canonical routing.

In scope:

- Build `/en/projects/` and `/pt/projects/` pages with two project cards (Canvas, Slots)
- Establish card content and layout contract for this milestone
- Ensure language-switch behavior preserves projects context
- Keep links canonical to `/canvas` and `/slots` routes

Out of scope:

- Slots gameplay implementation
- Compatibility/E2E hardening work (Phase 12)
- Route alias rollout (`/projects/*`) in this phase
  </domain>

<decisions>
## Implementation Decisions

### Card content strategy

- Use medium-detail cards: title + status + short description + one primary CTA.
- Avoid dual-CTA complexity in this phase.
- Keep copy concise and exploratory in tone.

### Projects page layout and hierarchy

- Ship a two-card hero grid with clear visual split between Canvas and Slots.
- Keep hierarchy simple: page title/subtitle, then primary project cards.
- No dense dashboard/multi-section layout in this phase.

### Link behavior and canonical routes

- Use canonical links only:
  - `/en/canvas/`, `/pt/canvas/`
  - `/en/slots/`, `/pt/slots/`
- `/projects/*` aliases remain deferred backlog per milestone scope lock.
- Do not introduce alias redirects in Phase 10.

### Language-switch behavior

- Switching language on `/projects/` must stay on the `/projects/` counterpart route.
- Preserve user page context during locale switch.
- Do not redirect to homepage or last visited project route.

### Deferred Ideas (Backlog)

- `/projects/canvas/*` and `/projects/slots/*` alias paths (deferred by scope guard)

### Claude's Discretion

- Exact card microcopy and status labels so long as tone remains playful/concise
- Visual details of the two-card split layout
- Whether to include lightweight visual tags (without adding extra CTA complexity)
  </decisions>

<canonical_refs>

## Canonical References

- .planning/ROADMAP.md
- .planning/REQUIREMENTS.md
- .planning/phases/09-navigation-and-i18n-primitives/09-01-SUMMARY.md
- .planning/research/SUMMARY.md
- src/pages/en/index.astro
- src/pages/pt/index.astro
- src/components/Header.astro
- src/i18n/en.json
- src/i18n/pt.json
  </canonical_refs>

<specifics>
## Specific Ideas

- Use one clear CTA per card (`Explore Canvas`, `See Slots`) mapped to canonical routes.
- Keep project status visible on each card (`Live` for Canvas, `Foundation`/`In Development` for Slots).
  </specifics>
