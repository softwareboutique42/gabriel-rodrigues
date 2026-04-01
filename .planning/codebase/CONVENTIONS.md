# Coding Conventions

**Analysis Date:** 2026-04-01

## Naming Patterns

**Files:**

- Astro components: PascalCase — `BlogCard.astro`, `BaseLayout.astro`, `ShareBar.astro`
- TypeScript modules: camelCase — `blog-search.ts`, `main.ts`, `renderer.ts`, `versions.ts`
- Animation modules: camelCase noun — `particles.ts`, `geometric.ts`, `constellation.ts`
- Type definition files: singular noun — `types.ts`
- Index barrel files: `index.ts` in each subdirectory

**Functions:**

- camelCase verbs: `getLangFromUrl()`, `useTranslations()`, `getLocalizedPath()`, `setupBlogSearch()`
- Prefixed by purpose: `get*` for data retrieval, `use*` for hook-like helpers, `render*` for DOM mutations, `show*`/`hide*` for visibility, `handle*` for event callbacks, `fetch*` for network calls
- Boolean helpers: `isValidHex()` — `is` prefix for predicates

**Variables:**

- camelCase: `companyName`, `currentConfig`, `animationId`
- Module-level singletons use `let` with `null` initial value: `let renderer: CanvasRenderer | null = null`
- Constants: SCREAMING_SNAKE_CASE — `WORKER_URL`, `LOOP_DURATION`, `DEMO_CONFIG`

**Types/Interfaces:**

- PascalCase: `CompanyConfig`, `AnimationController`, `BaseAnimation`, `Lang`
- Interfaces preferred for object shapes: `interface Props`, `interface CompanyConfig`, `interface Heading`
- Type aliases used for unions: `type Lang = (typeof languages)[number]`

**CSS Classes:**

- Utility-first Tailwind with custom semantic names: `text-neon`, `bg-cyan-dim`, `glow-panel`, `hover-glitch`, `clip-corners`, `nav-active`
- Animation boot classes use a sequential suffix: `anim-boot-1`, `anim-boot-2`

## Code Style

**Formatting:**

- Tool: Prettier with `prettier-plugin-astro`
- Single quotes (`singleQuote: true`)
- Semicolons required (`semi: true`)
- 2-space indent (`tabWidth: 2`)
- Trailing commas everywhere (`trailingComma: "all"`)
- Max line width: 100 characters (`printWidth: 100`)
- Config: `.prettierrc`

**Linting:**

- Tool: ESLint with `@typescript-eslint` and `eslint-plugin-astro`
- TypeScript recommended rules applied to all `*.ts` files
- Unused variable error with `argsIgnorePattern: '^_'` (underscore-prefix exemption)
- Prettier conflicts resolved via `eslint-config-prettier`
- Config: `eslint.config.js`

## Import Organization

**Order (observed pattern):**

1. External packages (`import * as THREE from 'three'`, `import { test, expect } from '@playwright/test'`)
2. Astro built-ins (`import { getCollection } from 'astro:content'`, `import { ClientRouter } from 'astro:transitions'`)
3. Internal types (`import type { CompanyConfig } from './types'`)
4. Internal modules (`import { CanvasRenderer } from './renderer'`)
5. Relative siblings before parents

**Path Aliases:**

- None configured — all imports use relative paths (`'../i18n/utils'`, `'./types'`)

**Type Imports:**

- `import type { ... }` used consistently for type-only imports: `import type { CompanyConfig } from './types'`, `import type { APIRoute, GetStaticPaths } from 'astro'`

## Error Handling

**Patterns:**

- `try/catch` with empty catch blocks for silent failures in non-critical paths:
  ```typescript
  fetch(indexUrl)
    .then((r) => r.json())
    .catch(() => {});
  ```
- Structured catch with fallback when response parsing may fail:
  ```typescript
  const err = await res.json().catch(() => ({ error: 'Unknown error' }));
  ```
- Catch-all (`catch {}` or `catch { showState('error') }`) preferred — no error re-throwing in client scripts
- API responses checked with `if (!res.ok) throw new Error(...)` before parsing
- Build-time fallbacks for missing files:
  ```typescript
  try {
    fontData = fs.readFileSync(fontPath).buffer as ArrayBuffer;
  } catch {
    // fallback logic
  }
  ```

## Logging

**Framework:** None — no logging library is used.

**Patterns:**

- No `console.log` calls found in source (`src/`); silent failures used instead
- Build-time errors surface through Astro's build output

## Comments

**When to Comment:**

- Block-level labels for multi-step DOM construction: `// Top: GR_ branding`, `// Middle: Title`, `// Bottom: Author`
- Intent comments for non-obvious patterns: `// Abort previous listeners to prevent duplicates on SPA re-navigation`
- Section markers in Astro templates: `<!-- Hero: Asymmetric Brutalist -->`, `<!-- Google Tag Manager -->`

**JSDoc/TSDoc:**

- Not used — no JSDoc annotations found in source files

## Function Design

**Size:** Functions are kept small and single-purpose. `initCanvas()` is the largest (~100 lines) and acts as a coordinator calling smaller helpers.

**Parameters:** Prefer named parameter objects via interfaces (`interface Props`) in Astro components. Standalone TS functions use positional args (max 2–3).

**Return Values:**

- Functions that perform side effects return `void`
- Async fetch functions return `Promise<void>`
- Helper utilities return primitive types or typed objects
- Nullable returns typed as `T | null` with explicit null checks before use

## Module Design

**Exports:**

- Named exports preferred: `export function`, `export const`, `export class`, `export interface`
- Default exports only in Astro config files and Playwright config
- `initCanvas()` is the single public surface of `main.ts`; internal helpers are unexported

**Barrel Files:**

- `src/scripts/canvas/animations/index.ts` — exports `createAnimation()` factory
- `src/scripts/canvas/icons/index.ts` — exports icon utilities
- i18n helpers consolidated in `src/i18n/utils.ts`

## Astro Component Conventions

**Props Interface:**

- Always declare `interface Props` in the component frontmatter before destructuring
- Optional props use `?` and are destructured with defaults: `tags = []`, `readingTime`

**i18n Integration:**

- Every component that renders user-visible text calls `getLangFromUrl(Astro.url)` then `useTranslations(lang)` to get the `t()` helper
- Language never hardcoded in shared components — always derived from URL

**View Transitions / SPA Events:**

- Client scripts placed in `<script>` tags at page level (not component level)
- Entry point always `document.addEventListener('astro:page-load', ...)` — never top-level execution
- Cleanup via `AbortController` pattern on `astro:before-swap`:
  ```typescript
  const controller = new AbortController();
  document.addEventListener('astro:before-swap', () => controller.abort(), { once: true });
  // All event listeners added with { signal }
  ```

---

_Convention analysis: 2026-04-01_
