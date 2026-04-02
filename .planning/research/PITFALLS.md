# Domain Pitfalls

**Domain:** Navigation restructuring + new Slots shell on bilingual Astro static site
**Researched:** 2026-04-02

## Critical Pitfalls

### Pitfall 1: Breaking Existing Canvas URLs During Hierarchy Move

**What goes wrong:** Canvas path moves under Projects without redirect coverage, breaking bookmarks, shared links, and indexed URLs.
**Why it happens:** In static deployments, route file changes do not automatically produce redirect behavior.
**Warning signs:**

- Staging returns 404 for old `/en/canvas/` or `/pt/canvas/` URLs
- Shared links with query params (for example existing company prefill links) stop resolving
- Search Console coverage drops after deploy
  **Prevention:**
- Ship redirects in the same deploy as any path move (`public/_redirects` or Astro redirect config)
- Verify both locales with and without query strings before release
- Keep old route as compatibility stub until redirect checks pass in preview
  **Detection:**
- Route smoke test for old and new paths in EN/PT during milestone validation
- Manual browser check from an old link source (chat/bookmark/history)
  **Mitigation phase:** v1.2 Phase 2 — Canvas hierarchy move + redirect rollout

### Pitfall 2: Nav Active-State Drift Under View Transitions

**What goes wrong:** Header highlight does not match current route (or no item is active) after introducing `/projects/*` hierarchy.
**Why it happens:** Active-state logic built from static path assumptions (`/canvas`) is not updated for new structure and SPA transition behavior.
**Warning signs:**

- Projects page is open but Canvas still appears active
- No active nav item inside `/en/projects/` or `/pt/projects/`
- Active state differs between hard refresh and in-app navigation
  **Prevention:**
- Centralize route-to-nav mapping for home/projects/about/etc. rather than substring checks scattered in markup
- Validate active state for direct loads and transition navigations
- Add explicit tests/checklist entries for EN and PT route variants
  **Detection:**
- Navigation matrix test: hard-load + client-nav for all top-level and project child routes
- Visual QA screenshot diff for header state across routes
  **Mitigation phase:** v1.2 Phase 1 — Projects hub nav restructure

### Pitfall 3: EN/PT Route Parity Break (One Locale Missing or Mismatched)

**What goes wrong:** Slots or Projects page exists in one locale but not the other, or path structures diverge.
**Why it happens:** Brownfield additions are often implemented quickly in one locale first and parity is deferred.
**Warning signs:**

- `/en/slots/` works while `/pt/slots/` 404s (or vice versa)
- Locale switcher links to non-existent counterpart page
- Different nav labels or destinations between locales
  **Prevention:**
- Treat route pairs as atomic deliverables: no phase completion until EN/PT pages both exist
- Maintain one parity checklist covering routes, nav labels, CTAs, and metadata
- Add build-time or CI sanity check for expected locale path pairs
  **Detection:**
- Automated crawl of known locale route pairs
- Manual toggle test using language switcher from every new page
  **Mitigation phase:** v1.2 Phase 3 — Slots shell EN/PT foundation

### Pitfall 4: Translation Key Drift for New Hub/Slots Copy

**What goes wrong:** New UI strings are added in one locale JSON but missing in the other, causing fallback/missing text in production.
**Why it happens:** i18n files are edited manually and parity validation is easy to skip in brownfield increments.
**Warning signs:**

- Raw key names or empty text appears in one locale
- Same component renders different message structure EN vs PT
- PR adds keys in one JSON file only
  **Prevention:**
- Add/update keys in EN and PT in the same commit
- Add a parity diff script (or checklist) for `src/i18n/en.json` and `src/i18n/pt.json`
- Keep a dedicated key namespace for `projects.*` and `slots.*` to simplify auditing
  **Detection:**
- Pre-merge grep/diff check for key parity
- Manual bilingual page walkthrough in preview deployment
  **Mitigation phase:** v1.2 Phase 1 and Phase 3 — nav copy + slots shell copy

### Pitfall 5: Re-Navigation Script Leaks in New Slots Shell

**What goes wrong:** Event listeners or animation loops are duplicated after navigating away and back, causing double handlers, higher CPU use, or inconsistent UI behavior.
**Why it happens:** Astro SPA transitions keep runtime alive; init logic without cleanup/idempotence accumulates listeners.
**Warning signs:**

- Button click fires multiple times after revisiting page
- CPU usage climbs with each revisit
- Duplicate network calls from one interaction
  **Prevention:**
- Follow existing Canvas lifecycle pattern: initialize on `astro:page-load`, cleanup on `astro:before-swap`
- Guard initialization by root-element presence and track/dispose controllers
- Keep shell scripts minimal until gameplay architecture is finalized
  **Detection:**
- Repeat navigation loop test (`hub -> slots -> hub -> slots`) and assert single handler behavior
- Use browser devtools listener counts before/after repeated navigation
  **Mitigation phase:** v1.2 Phase 3 — Slots shell scripting baseline

### Pitfall 6: “Research Docs” Become Non-Actionable Inventory

**What goes wrong:** Slots domain research is collected as broad links/ideas, but does not produce decision-ready constraints for planning v1.3 gameplay.
**Why it happens:** Research phase optimizes for collection volume instead of decision criteria (asset licensing, performance budget, scope boundaries).
**Warning signs:**

- Docs list options but no recommendation or rejection rationale
- No explicit anti-features/out-of-scope section
- Follow-up planning reopens already-researched questions
  **Prevention:**
- Force each research section to end with “recommended choice + why + confidence”
- Include licensing constraints and implementation impact per asset source
- Add a decision log linking research conclusions to planned phase candidates
  **Detection:**
- Readout test: can a planner derive first gameplay phase scope without extra research?
- Cross-check whether requirements can be drafted directly from research outputs
  **Mitigation phase:** v1.2 Phase 4 — Slots domain research deliverables

## Moderate Pitfalls

### Pitfall 1: Weak IA on Projects Hub (Two Links, No Status Context)

**What goes wrong:** Hub ships as a thin link list, reducing discoverability and making Slots look unfinished/confusing.
**Warning signs:** Users bounce back to home quickly; low click-through to Slots.
**Prevention:** Add project cards with short status labels (Live, Research, Coming soon) and concise value copy.
**Mitigation phase:** v1.2 Phase 1 — Projects hub UX framing

### Pitfall 2: Inconsistent Canonical/Meta Between Old and New Paths

**What goes wrong:** Duplicate indexing or incorrect canonical signals when route structure changes.
**Warning signs:** Search console duplicate canonical warnings; mixed OG previews.
**Prevention:** Validate canonical, OG URL, and hreflang consistency for Projects and moved Canvas route.
**Mitigation phase:** v1.2 Phase 2 — path migration QA

## Minor Pitfalls

### Pitfall 1: Breadcrumb/Back-Link Omission from Child Project Pages

**What goes wrong:** Users entering Slots/Canvas from search cannot discover the Projects hub context.
**Warning signs:** Extra back-button churn; low cross-project navigation.
**Prevention:** Include a visible “Back to Projects” affordance on child pages.
**Mitigation phase:** v1.2 Phase 1 and Phase 3

## Phase-Specific Warnings

| Phase Topic                           | Likely Pitfall                                | Mitigation                                                                 |
| ------------------------------------- | --------------------------------------------- | -------------------------------------------------------------------------- |
| Phase 1: Projects hub nav restructure | Active-state drift after hierarchy change     | Centralized route mapping + nav matrix QA (hard-load and transition)       |
| Phase 2: Canvas hierarchy move        | URL breakage and SEO regression               | Ship redirects same deploy + canonical/hreflang verification               |
| Phase 3: Slots shell EN/PT            | Locale parity gaps and script lifecycle leaks | Route pair checklist + cleanup/idempotent script pattern                   |
| Phase 4: Slots research docs          | Research without decisions                    | Require recommendation, confidence, licensing, and next-phase implications |

## Sources

- Internal project constraints from .planning/PROJECT.md (v1.2 scope and bilingual requirements)
- Milestone and state context from .planning/ROADMAP.md and .planning/STATE.md
- Astro view transition lifecycle guidance (official docs, `astro:page-load` / `astro:before-swap` patterns)
- Cloudflare Pages redirect behavior for static route migrations
