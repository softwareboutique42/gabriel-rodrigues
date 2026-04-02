# Phase 9: Navigation and i18n Primitives - Context

**Gathered:** 2026-04-02  
**Status:** Ready for planning  
**Source:** /gsd:next -> /gsd:discuss-phase 9

<domain>
## Phase Boundary

Establish navigation and bilingual string primitives for the v1.2 IA shift to Projects-first discovery.

In scope:

- Replace top-nav Canvas entry with Projects
- Define active-state path rules for Projects nav item
- Define EN/PT copy tone and key conventions for nav/projects/slots labels used by downstream phases

Out of scope:

- Projects page implementation details (Phase 10)
- Slots shell page implementation (Phase 11)
- Compatibility/E2E hardening (Phase 12)
  </domain>

<decisions>
## Implementation Decisions

### Header behavior and IA

- Replace Canvas with Projects in top navigation now (single entry).
- Do not keep dual Canvas+Projects nav entries during transition.
- Projects becomes the canonical discovery entry for Canvas and Slots.

### Active-state rules

- Projects nav item is active on:
  - `/projects/`
  - `/canvas/`
  - `/slots/`
- This applies to both locale trees (`/en/*` and `/pt/*`).

### i18n key conventions and copy tone

- Use experimental/playful tone for labels and short descriptors in EN/PT.
- Keep keys predictable and grouped by surface (`nav.*`, `projects.*`, `slots.*`).
- Ensure EN/PT key parity in the same commit for every new key.

### Claude's Discretion

- Exact key names under `projects.*` and `slots.*` for Phase 9 scaffolding
- Exact phrasing as long as playful tone is preserved and text remains concise
- Whether helper subtitle/descriptor keys are introduced in Phase 9 or deferred to Phase 10
  </decisions>

<canonical_refs>

## Canonical References

### Milestone and phase contracts

- .planning/ROADMAP.md — Phase 9 goal/success criteria
- .planning/REQUIREMENTS.md — HUB-01 and I18N-01
- .planning/PROJECT.md — v1.2 milestone framing

### Research inputs

- .planning/research/SUMMARY.md — build order and risk guidance
- .planning/research/ARCHITECTURE.md — integration points for nav + i18n
- .planning/research/STACK.md — no new dependency constraint

### Expected code touchpoints for planning

- src/components/Header.astro
- src/i18n/en.json
- src/i18n/pt.json
  </canonical_refs>

<specifics>
## Specific Ideas

- Active-state logic should be centralized and route-prefix based to avoid drift under SPA transitions.
- Keep Phase 9 implementation minimal: primitives only, no full page content delivery.
  </specifics>
