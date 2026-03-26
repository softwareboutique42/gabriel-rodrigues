# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

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
npm run fetch:stackoverflow  # Fetch SO Portuguese profile data → data/stackoverflow.md
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

- `BaseLayout.astro` — root HTML shell, meta tags, OG/Twitter cards, GTM, AdSense, View Transitions
- `BlogPostLayout.astro` — wraps BaseLayout, adds article schema, OG images, ShareBar, AdUnit

### View Transitions (SPA mode)

- Uses Astro `ClientRouter` — pages navigate without full reload
- **All client scripts must use `document.addEventListener('astro:page-load', ...)` instead of top-level execution**
- Use `AbortController` pattern to clean up listeners on re-navigation (see `src/scripts/canvas/main.ts` for reference)

### Canvas Feature

- Three.js animation generator at `/en/canvas/` and `/pt/canvas/`
- 8 animation styles across 2 versions (v1 Classic, v2 Story)
- Calls Cloudflare Worker API (`api/` directory) that uses Claude AI for brand analysis
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
