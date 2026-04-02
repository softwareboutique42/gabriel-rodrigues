# Phase 11: Slots Shell Foundation - Context

**Gathered:** 2026-04-02
**Status:** Ready for planning
**Source:** /gsd:next -> /gsd:discuss-phase 11

<domain>
## Phase Boundary

Add bilingual Slots shell routes and SPA-safe bootstrap scaffolding, explicitly limited to foundation-only behavior.

In scope:

- Create `/en/slots/` and `/pt/slots/` shell pages with parity
- Add in-development messaging and explicit non-gambling/no-real-money disclaimer copy in both locales
- Wire client bootstrap to Astro SPA lifecycle (`astro:page-load`) with idempotent init/cleanup
- Keep discovery and locale-switch compatibility with existing Projects/Canvas routing model

Out of scope:

- Gameplay systems (reels, paylines, payouts, RNG, win logic)
- Payments, monetization, or real-money mechanics
- New route alias rollout under `/projects/*`
- Phase 12 compatibility hardening and expanded E2E matrix
  </domain>

<decisions>
## Implementation Decisions

### Shell information architecture

- Slots pages are shell-only and must communicate "in development" immediately above the fold.
- Keep structure simple: hero heading, concise status messaging, and one clear return path to Projects.
- Do not expose fake gameplay controls that imply functional game mechanics.

### Disclaimer contract (SLOT-02)

- Include explicit bilingual disclaimer language that the Slots experience is not gambling and has no real-money wagering.
- Place disclaimer in visible page content (not only metadata/footer).
- Keep wording direct and compliance-forward rather than playful.

### SPA-safe client bootstrap (SLOT-03)

- Follow existing lifecycle discipline: initialize on `astro:page-load` and guard against duplicate listeners across client-side navigations.
- Use cleanup semantics consistent with established patterns (AbortController-based teardown where listeners are attached).
- Keep bootstrap minimal in this phase: lifecycle safety first, feature behavior deferred.

### Route and i18n continuity

- Slots routes remain canonical-only at `/en/slots/` and `/pt/slots/`.
- Preserve language-switch counterpart behavior for `/slots/` using the same path-localization pattern adopted in earlier phases.
- Any new user-facing Slots shell strings must be added with EN/PT parity.

### Deferred Ideas (Backlog)

- Interactive reel prototype visuals
- Gameplay rules and payout surfaces
- Funnel/analytics instrumentation tied to Slots engagement

### Claude's Discretion

- Exact shell visual treatment and section spacing, as long as messaging hierarchy stays explicit
- CTA label wording for returning to Projects/Canvas, as long as canonical routes are used
- Implementation detail of bootstrap module organization, while preserving lifecycle guarantees
  </decisions>

<canonical_refs>

## Canonical References

- .planning/ROADMAP.md
- .planning/REQUIREMENTS.md
- .planning/phases/09-navigation-and-i18n-primitives/09-01-SUMMARY.md
- .planning/phases/10-projects-hub-delivery/10-01-SUMMARY.md
- src/components/Header.astro
- src/components/LanguageSwitcher.astro
- src/i18n/utils.ts
- src/scripts/canvas/main.ts
- src/pages/en/projects/index.astro
- src/pages/pt/projects/index.astro
  </canonical_refs>

<specifics>
## Specific Ideas

- Use a lightweight "Foundation Preview" badge/state block for slots shell status.
- Include one canonical CTA back to Projects and optionally a secondary CTA to Canvas discovery.
- Keep Slots copy short, high-signal, and parity-locked across EN/PT.
  </specifics>
