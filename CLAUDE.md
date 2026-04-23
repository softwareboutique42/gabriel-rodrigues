# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.
### 1. Think Before Coding

**Don't assume. Don't hide confusion. Surface tradeoffs.**

Before implementing:
- State your assumptions explicitly. If uncertain, ask.
- If multiple interpretations exist, present them - don't pick silently.
- If a simpler approach exists, say so. Push back when warranted.
- If something is unclear, stop. Name what's confusing. Ask.

### 2. Simplicity First

**Minimum code that solves the problem. Nothing speculative.**

- No features beyond what was asked.
- No abstractions for single-use code.
- No "flexibility" or "configurability" that wasn't requested.
- No error handling for impossible scenarios.
- If you write 200 lines and it could be 50, rewrite it.

Ask yourself: "Would a senior engineer say this is overcomplicated?" If yes, simplify.

### 3. Surgical Changes

**Touch only what you must. Clean up only your own mess.**

When editing existing code:
- Don't "improve" adjacent code, comments, or formatting.
- Don't refactor things that aren't broken.
- Match existing style, even if you'd do it differently.
- If you notice unrelated dead code, mention it - don't delete it.

When your changes create orphans:
- Remove imports/variables/functions that YOUR changes made unused.
- Don't remove pre-existing dead code unless asked.

The test: Every changed line should trace directly to the user's request.

### 4. Goal-Driven Execution

**Define success criteria. Loop until verified.**

Transform tasks into verifiable goals:
- "Add validation" → "Write tests for invalid inputs, then make them pass"
- "Fix the bug" → "Write a test that reproduces it, then make it pass"
- "Refactor X" → "Ensure tests pass before and after"

For multi-step tasks, state a brief plan:
```
1. [Step] → verify: [check]
2. [Step] → verify: [check]
3. [Step] → verify: [check]
```

Strong success criteria let you loop independently. Weak criteria ("make it work") require constant clarification.

## Build & Dev Commands

```bash
npm run dev          # Start dev server
npm run build        # Production build (static output)
npm run preview      # Preview production build
npm run lint         # ESLint check
npm run lint:fix     # ESLint auto-fix
npm run format       # Prettier format all files
npm run format:check # Prettier check formatting
npm run test         # Run Playwright E2E tests
npm run test:ui      # Playwright tests with UI
npm run test:headed  # Playwright tests in headed browser
```

## Architecture

**Astro 6 static site** with Tailwind CSS v4, deployed to Cloudflare Pages. Bilingual (EN/PT) with file-based routing.

### Routing & i18n

- All pages live under `src/pages/en/` and `src/pages/pt/` — no shared route with dynamic `[lang]`
- Translation strings in `src/i18n/en.json` and `src/i18n/pt.json`
- Helpers: `getLangFromUrl()` and `useTranslations()` from `src/i18n/utils.ts`
- When adding/modifying a page, update both language versions

### Content Collections

- Blog posts in `src/content/blog/{en,pt}/` as `.md` files
- Schema defined in `src/content.config.ts`
- Each post needs both EN and PT versions

### Layouts

- `BaseLayout.astro` — root HTML shell, meta tags, OG/Twitter cards, GTM, View Transitions
- `BlogPostLayout.astro` — wraps BaseLayout, adds article schema, OG images, ShareBar

### View Transitions (SPA mode)

- Uses Astro `ClientRouter` — pages navigate without full reload
- **All client scripts must use `document.addEventListener('astro:page-load', ...)` instead of top-level execution**
- Use `AbortController` pattern to clean up listeners on re-navigation (see `src/scripts/canvas/main.ts` for reference)

### Canvas Feature

- Three.js animation generator at `/en/canvas/` and `/pt/canvas/`
- 8 animation styles across 2 versions (v1 Classic, v2 Story)
- Calls Cloudflare Worker API (`workers/company-api/`) that fetches brand data from Wikipedia + DuckDuckGo
- Worker uses Stripe for payments and KV for caching

### OG Image Generation

- `src/pages/og/[...slug].png.ts` generates 1200×630 PNG per blog post at build time using satori + sharp
- Images served at `/og/{lang}/blog/{slug}.png`

### Styling

- Tailwind CSS v4 with custom theme in `src/styles/global.css`
- Design tokens: `--color-neon` (#8eff71), `--color-cyan` (#00e5ff), dark background (#0e0e0e)
- Monospace font: JetBrains Mono

## Commit Conventions

- **Conventional Commits enforced** via commitlint + husky pre-commit hook
- Format: `type(scope): description` (e.g., `feat: add share buttons`, `fix: canvas dropdown bug`)
- Use `npm run commit` (Commitizen) or write conventional commit messages manually
- Do not skip hooks with `--no-verify`

## Testing

- Playwright E2E tests in `e2e/` directory
- Config in `playwright.config.ts`
- Tests run against the dev server

## Key Dependencies

- `satori` + `sharp` — OG image generation
- `three` — Canvas 3D animations
- `@fontsource/jetbrains-mono` — Local font files
- Node.js >= 22.12.0

## Design Context

### Users

- Visitors exploring Gabriel Rodrigues' portfolio to evaluate resume, projects, and blog content.
- Typical session intent is quick validation and browsing: check credibility, scan work quality, and test interactive demos.
- Primary user context is desktop-first technical audience, with mobile support required for lightweight exploration.

### Brand Personality

- 3-word personality: tech, nerdy, gambling-flavored.
- Emotional goals: confidence in technical depth, curiosity to explore, and playful tension from arcade/casino-inspired interaction cues.
- Voice should stay direct and practical, with personality expressed through visual system more than verbose copy.

### Aesthetic Direction

- Preferred mode: dark-first and consistent across all routes.
- Visual language: tactical/terminal-inspired futuristic UI, disciplined neon accents, and purposeful motion.
- Keep the current signature direction (HUD + scanline + clipped geometry) while improving consistency and accessibility.
- Anti-patterns: generic SaaS cards, pastel minimalism, and disconnected page-by-page visual styles.

### Design Principles

1. One system everywhere: shared tokens and interaction patterns across resume, blog, and projects.
2. Dark by default, readable always: preserve atmosphere without sacrificing contrast or legibility.
3. Accent with intent: neon/cyan/gold are semantic accents, never decorative noise.
4. Motion communicates state: animations should clarify transitions and hierarchy, with reduced-motion respect.
5. Portfolio utility first: visual flair should support scanning, testing, and trust-building.
