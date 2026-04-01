# Technology Stack

**Analysis Date:** 2026-04-01

## Languages

**Primary:**

- TypeScript - All source files in `src/`, Cloudflare Worker in `workers/company-api/src/`
- Astro (`.astro`) - Page and layout templates in `src/pages/`, `src/layouts/`, `src/components/`

**Secondary:**

- CSS - Custom theme tokens and global styles in `src/styles/global.css`
- Markdown (`.md`) - Blog content in `src/content/blog/en/` and `src/content/blog/pt/`
- JavaScript (`.mjs`) - Astro config in `astro.config.mjs`

## Runtime

**Environment:**

- Node.js >= 22.12.0 (enforced via `engines` field in `package.json`)
- Cloudflare Workers runtime for `workers/company-api/` (compatibility date: 2025-03-01)

**Package Manager:**

- npm
- Lockfile: `package-lock.json` present (used in CI via `npm ci`)

## Frameworks

**Core:**

- Astro 6.x (`^6.0.8`) - Static site generator with SPA-mode view transitions (`ClientRouter`)
- Tailwind CSS v4 (`^4.2.2`) - Utility-first CSS via Vite plugin (`@tailwindcss/vite`)

**Testing:**

- Playwright (`^1.58.2`) - E2E tests in `e2e/` directory, config in `playwright.config.ts`

**Build/Dev:**

- Vite (bundled with Astro) - Dev server and build pipeline, configured via `astro.config.mjs`
- Wrangler (`^4.0.0`) - Cloudflare Worker dev/deploy, configured via `workers/company-api/wrangler.toml`

## Key Dependencies

**Critical:**

- `astro` `^6.0.8` - Core framework; all routing, content, and OG generation depend on it
- `three` `^0.183.2` - 3D canvas animations at `/en/canvas/` and `/pt/canvas/`; source in `src/scripts/canvas/`
- `satori` `^0.26.0` - Renders JSX-like objects to SVG for OG image generation at build time (`src/pages/og/[...slug].png.ts`)
- `sharp` `^0.34.5` - Converts satori SVG output to PNG for OG images

**Infrastructure:**

- `@astrojs/sitemap` `^3.7.1` - Generates `/sitemap-index.xml` at build time
- `@astrojs/rss` `^4.0.18` - Generates RSS feeds for blog content
- `@fontsource/jetbrains-mono` `^5.2.8` - Self-hosted monospace font; WOFF file read at build time for OG images
- `@fontsource/space-grotesk` `^5.2.10` - Self-hosted sans-serif body font
- `@anthropic-ai/sdk` `^0.39.0` - Listed in `workers/company-api/package.json` but worker calls Anthropic REST API directly via `fetch`; SDK is not imported in worker source

**Dev Tooling:**

- `husky` `^9.1.7` - Git hooks configured in `.husky/`
- `@commitlint/cli` + `@commitlint/config-conventional` `^20.5.0` - Conventional commit enforcement
- `commitizen` `^4.3.1` + `cz-conventional-changelog` `^3.3.0` - Interactive commit helper (`npm run commit`)
- `lint-staged` `^16.4.0` - Runs linting/formatting on staged files before commit
- `eslint` `^10.1.0` + `eslint-plugin-astro` + `@typescript-eslint/eslint-plugin` - Configured in `eslint.config.js`
- `prettier` `^3.8.1` + `prettier-plugin-astro` - Configured in `.prettierrc`
- `turndown` `^7.2.2` - HTML-to-Markdown utility (present in devDependencies)

## Configuration

**Environment:**

- Site output is fully static (`output: 'static'` in `astro.config.mjs`)
- Worker secrets (`ANTHROPIC_API_KEY`, `STRIPE_SECRET_KEY`) are set via `wrangler secret put` — never stored in files
- Worker public vars defined in `workers/company-api/wrangler.toml`: `ALLOWED_ORIGINS`, `STRIPE_PUBLISHABLE_KEY`
- No `.env` files detected in the project root

**Build:**

- `astro.config.mjs` - Astro build config; site URL, output mode, Vite plugins, integrations
- `tsconfig.json` - TypeScript config (not read; standard Astro project includes it)
- `src/content.config.ts` - Content collection schema for blog posts
- `workers/company-api/wrangler.toml` - Cloudflare Worker deployment config

**Formatting:**

- Prettier: `semi: true`, `singleQuote: true`, `tabWidth: 2`, `trailingComma: 'all'`, `printWidth: 100`
- Config in `.prettierrc`

## Platform Requirements

**Development:**

- Node.js >= 22.12.0
- npm (lockfile present)
- Wrangler CLI for worker development (`workers/company-api/`)

**Production:**

- Static site hosted on GitHub Pages (deployed via `.github/workflows/deploy.yml`)
- Cloudflare Worker (`company-canvas-api`) deployed separately via Wrangler
- Cloudflare KV namespace (`CONFIG_CACHE`, id `4ad154bfd20a4e7bbbfdee395f886a29`) for caching brand configs

---

_Stack analysis: 2026-04-01_
