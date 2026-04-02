# Technology Stack Research (v1.2)

Project: Projects Hub and Slots Foundation  
Researched: 2026-04-02  
Scope: Only NEW feature support for v1.2 while preserving current Astro static architecture

## Recommendation Summary

Use the existing stack as-is for v1.2. Add no new core runtime framework.

Reason:

- Projects Hub is a static content and navigation change.
- Canvas relocation under a Projects hierarchy is an IA/routing/linking change, not an infrastructure change.
- Slots scope is research plus bilingual shell pages only (no gameplay runtime yet).

Confidence: HIGH for no-core-changes recommendation (fully aligned with project constraints in planning docs).

## Required Stack Changes (Actionable)

- No required package additions.
- Keep existing runtime stack unchanged: Astro static pages, Tailwind styling, i18n JSON, existing Three.js/Canvas route, existing Cloudflare deployment.
- Add only code-level structure:
  - Add Projects pages (EN/PT) as normal Astro routes.
  - Add Slots shell pages (EN/PT) as normal Astro routes.
  - Add i18n keys for Projects and Slots labels/descriptions in both language files.
  - Update header/nav to point to Projects instead of direct Canvas entry.
  - Keep Canvas URL stable to avoid breaking existing links and flows.

## Optional Tools (Not Required)

Use only if they reduce delivery risk for v1.2 without changing runtime architecture:

- Asset research and planning:
  - Figma or Excalidraw for Slots concept boards and themed machine direction.
  - Spreadsheet or markdown matrix for sprite-source licensing tracking.
- Placeholder art workflow:
  - Aseprite or Piskel for temporary symbol sprites (exported as static assets only).
- QA support:
  - Add lightweight Playwright navigation checks for EN/PT routes and hub links.

Do not add these as app runtime dependencies unless they become part of shipped gameplay in a later milestone.

## Avoid List (Do NOT Add in v1.2)

- No new game engine yet (for example PixiJS, Phaser).
- No new frontend framework layer (for example React/Svelte islands) for Projects or Slots shell.
- No new backend services, databases, or stateful APIs.
- No SSR/Node server changes; keep static Cloudflare Pages output.
- No gameplay-specific RNG/audio/physics libraries yet.
- No payment stack changes (Stripe flow is already validated and unrelated to this milestone scope).

## Integration Points

- Routing and pages:
  - Create EN/PT Projects pages under existing language folder structure.
  - Create EN/PT Slots shell pages under existing language folder structure.
  - Keep existing Canvas routes intact.
- Navigation:
  - Replace top-menu direct Canvas link with Projects hub link.
  - Link Projects hub cards/items to Canvas and Slots.
- i18n:
  - Add corresponding EN/PT keys for nav labels, page titles, descriptions, and CTA text.
- Existing Canvas behavior:
  - No change to Canvas runtime stack.
  - If any client script is touched, keep Astro SPA lifecycle pattern already used in the repo.
- Testing:
  - Extend existing Playwright coverage with route and link smoke tests for new pages.

## Minimal Install Delta

None for v1.2 core scope.

## Sources

- .planning/PROJECT.md (v1.2 active scope and constraints)
- .planning/MILESTONES.md (current milestone status)
- .planning/STATE.md (current validated architecture state)
- package.json (current installed stack and scripts)
