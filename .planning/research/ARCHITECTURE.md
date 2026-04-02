# Architecture Patterns

**Domain:** Astro 6 static bilingual portfolio with tools section (Projects Hub + Slots foundation)
**Milestone:** v1.2 Projects Hub & Slots Foundation
**Researched:** 2026-04-02
**Confidence:** HIGH (direct repository inspection)

## Recommended Integration Strategy

Keep the current Canvas runtime and URL stable, and introduce Projects as a navigation and discovery layer:

- Keep canonical Canvas routes as `/en/canvas/` and `/pt/canvas/`.
- Add a new hub at `/en/projects/` and `/pt/projects/`.
- Add Slots shell at `/en/slots/` and `/pt/slots/`.
- Replace top-nav direct Canvas link with Projects.
- Highlight Projects nav item as active for all project routes (`/projects`, `/canvas`, `/slots`).

This avoids breaking existing links, tests, and query-param based Canvas flows while still delivering the new IA (information architecture).

## Integration Map (Existing -> New)

| Existing Area              | Current Behavior                                 | New Integration                                                                 | Risk if Missed                           |
| -------------------------- | ------------------------------------------------ | ------------------------------------------------------------------------------- | ---------------------------------------- |
| Header nav                 | `Home / Resume / Blog / Canvas`                  | `Home / Resume / Blog / Projects`                                               | Users cannot discover Slots; IA mismatch |
| Canvas route               | `/en/canvas/`, `/pt/canvas/`                     | Keep unchanged; linked from Projects cards                                      | Backlink and SEO break if moved          |
| Language switching         | Path swap via `getLocalizedPath`                 | Works automatically if EN/PT mirrors exist for new routes                       | PT/EN switch lands on 404                |
| 404 pretty URL redirect    | Supports `/{lang}/canvas/{company}` -> query URL | Keep support; optionally add `/{lang}/projects/canvas/{company}` alias redirect | Old shared links fail                    |
| Canvas scripts             | Initialized on `astro:page-load`                 | No change; preserve existing init pattern                                       | SPA nav regressions                      |
| E2E navigation assumptions | Tests expect direct routes and nav labels        | Update tests for new Projects nav + add Projects/Slots coverage                 | CI false failures                        |

## Routing Strategy

### 1. Canonical routes (recommended)

- Projects hub: `/en/projects/`, `/pt/projects/`
- Canvas (existing tool): `/en/canvas/`, `/pt/canvas/`
- Slots shell: `/en/slots/`, `/pt/slots/`

### 2. Optional compatibility alias

If product direction still wants nested presentation (`/projects/canvas`) without breaking existing links:

- Add lightweight alias pages:
  - `/en/projects/canvas/` -> client redirect to `/en/canvas/`
  - `/pt/projects/canvas/` -> client redirect to `/pt/canvas/`
- Keep `/en/canvas/` and `/pt/canvas/` as canonical forever (or until a separate migration plan exists).

### 3. 404 redirect continuity

Current 404 script matches only `/(en|pt)/canvas/:company`.
To preserve pretty URL sharing if nested aliases are introduced, extend regex to also accept `/(en|pt)/projects/canvas/:company` and redirect to canonical `/lang/canvas/?company=...`.

## File-Level Candidate Changes

### Must modify

| File                          | Why            | Change Type                                                         |
| ----------------------------- | -------------- | ------------------------------------------------------------------- |
| `src/components/Header.astro` | Nav IA changes | Replace Canvas menu item with Projects; expand active-state matcher |
| `src/i18n/en.json`            | New UI strings | Add `nav.projects`, `projects.*`, `slots.*`                         |
| `src/i18n/pt.json`            | New UI strings | Add PT equivalents for same keys                                    |

### Must create

| File                                | Purpose                                              |
| ----------------------------------- | ---------------------------------------------------- |
| `src/pages/en/projects/index.astro` | EN projects hub listing Canvas + Slots               |
| `src/pages/pt/projects/index.astro` | PT projects hub                                      |
| `src/pages/en/slots/index.astro`    | EN Slots shell (no gameplay)                         |
| `src/pages/pt/slots/index.astro`    | PT Slots shell                                       |
| `src/scripts/slots/main.ts`         | Slots page client initializer (astro:page-load-safe) |

### Should evaluate (compatibility + QA)

| File                                                      | Reason                                                                                          |
| --------------------------------------------------------- | ----------------------------------------------------------------------------------------------- |
| `src/pages/404.astro`                                     | Preserve/expand pretty URL redirects if introducing `/projects/canvas/*` aliases                |
| `e2e/navigation.spec.ts`                                  | Nav label and route expectations will change                                                    |
| `e2e/i18n.spec.ts`                                        | Add projects route language-switch assertions                                                   |
| `e2e/canvas.spec.ts`                                      | Keep Canvas route coverage; add navigation path via Projects card                               |
| `e2e/canvas-export.spec.ts`                               | Validate unchanged canonical Canvas path after nav change                                       |
| `src/content/blog/en/*.md` and `src/content/blog/pt/*.md` | Optional: update links only if strategy adds canonical route changes (not recommended for v1.2) |

## i18n Integration Points

### Translation utilities already in place

- `getLangFromUrl(url)` resolves `en|pt` from path.
- `useTranslations(lang)` resolves string keys with fallback to default language.
- `getLocalizedPath(path, lang)` powers language switch without per-page logic.

### Required key additions

Add symmetric keys to both `src/i18n/en.json` and `src/i18n/pt.json`:

- `nav.projects`
- `projects.title`
- `projects.subtitle`
- `projects.canvas.title`
- `projects.canvas.description`
- `projects.canvas.cta`
- `projects.slots.title`
- `projects.slots.description`
- `projects.slots.cta`
- `slots.title`
- `slots.subtitle`
- `slots.status`
- `slots.backToProjects`

### Implementation rule

Every new route in `src/pages/en/...` must be created with a matching `src/pages/pt/...` file in the same PR/phase to avoid language switch dead ends.

## Component and Boundary Guidance

### Page-level ownership

- Projects hub owns only navigation/discovery cards.
- Canvas page continues owning brand generation/export UX.
- Slots page owns only foundation shell in v1.2.

### Script boundaries

- Keep Canvas in `src/scripts/canvas/*` untouched.
- Place new Slots logic in `src/scripts/slots/*`.
- Do not prematurely share renderer/game logic between Canvas and Slots.

### SPA transition safety

All new client scripts must run under:

```ts
document.addEventListener('astro:page-load', () => {
  // guard by page root element
});
```

This is required because `BaseLayout` uses `ClientRouter` (view transitions).

## Recommended Phase Build Order

1. **Phase A: i18n and nav primitives**
   - Add translation keys in EN/PT.
   - Update `Header.astro` markup and active-state logic.
   - Outcome: navigation model is ready.

2. **Phase B: Projects hub pages**
   - Create EN/PT Projects pages with links to Canvas and Slots.
   - Validate language switching on hub.
   - Outcome: discovery layer ships with no Canvas behavior changes.

3. **Phase C: Slots foundation shell**
   - Create EN/PT Slots pages.
   - Add `src/scripts/slots/main.ts` with minimal, safe initialization.
   - Outcome: routed shell exists without gameplay complexity.

4. **Phase D: Compatibility hardening**
   - Review/update `src/pages/404.astro` for redirect compatibility.
   - Add/adjust E2E tests for nav, language switch, and Canvas access via Projects flow.
   - Outcome: no regressions to existing flow.

5. **Phase E: Optional alias routes (only if required by product)**
   - Add `/projects/canvas/` aliases that redirect to canonical `/canvas/`.
   - Keep canonical untouched.
   - Outcome: supports hierarchical marketing URLs safely.

## Dependency and Ordering Rationale

- i18n keys before page templates prevent unresolved translation keys.
- Projects hub before Slots shell enables immediate IA changes with minimal technical risk.
- Slots script scaffold after routes keeps implementation thin and isolated.
- Compatibility and tests after structural changes provide fast regression detection.
- Alias routes are optional and should be last because they add routing complexity without enabling core v1.2 value.

## Sources

- `.planning/PROJECT.md`
- `src/pages/en/index.astro`
- `src/pages/en/resume.astro`
- `src/pages/en/blog/index.astro`
- `src/pages/en/blog/[...slug].astro`
- `src/pages/en/canvas/index.astro`
- `src/pages/pt/index.astro`
- `src/pages/pt/resume.astro`
- `src/pages/pt/blog/index.astro`
- `src/pages/pt/blog/[...slug].astro`
- `src/pages/pt/canvas/index.astro`
- `src/i18n/en.json`
- `src/i18n/pt.json`
- `src/i18n/utils.ts`
- `src/components/Header.astro`
- `src/components/LanguageSwitcher.astro`
- `src/layouts/BaseLayout.astro`
- `src/pages/404.astro`
- `e2e/navigation.spec.ts`
- `e2e/i18n.spec.ts`
- `e2e/canvas.spec.ts`
- `e2e/canvas-export.spec.ts`
