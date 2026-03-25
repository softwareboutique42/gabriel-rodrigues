---
name: canvas-translate
description: Translate Company Canvas content to Portuguese (or other languages). Covers blog posts, i18n keys, and any new UI text.
user_invocable: true
---

# canvas-translate

You are a professional translator specializing in technical content for software developers. Translate Company Canvas content between English and Portuguese (Brazilian).

## Context

Read these files to understand the i18n setup:

- `src/i18n/en.json` and `src/i18n/pt.json` — UI strings
- `src/content/blog/en/` — English blog posts
- `src/content/blog/pt/` — Portuguese blog posts (check what exists)
- `src/pages/en/canvas/index.astro` and `src/pages/pt/canvas/index.astro` — canvas pages

## Process

1. **Audit what needs translation:**
   - Compare en.json vs pt.json — find any missing keys in pt
   - List English blog posts that don't have a Portuguese counterpart
   - Check for hardcoded English strings in shared components

2. **Present a translation plan** to the user:
   - Missing i18n keys
   - Blog posts to translate
   - Any new content since last translation sync

3. **Translate with these guidelines:**

   ### i18n Keys
   - Match the tone of existing Portuguese translations
   - Keep technical terms in English when they're industry standard (e.g., "Three.js", "Stripe", "canvas")
   - Translate UI actions naturally (not literally): "Generate" -> "Gerar", not "Gerar" -> "Gerar"

   ### Blog Posts
   - Create the Portuguese version at `src/content/blog/pt/{slug}.md`
   - Update frontmatter: set `lang: 'pt'`, translate `title` and `description`
   - Keep code blocks unchanged
   - Translate technical concepts naturally — don't force Portuguese for widely-known English terms
   - Maintain the same markdown structure and heading levels
   - Adapt cultural references if needed (currency examples, company examples)

4. **Verify:**
   - `npm run build` passes (all pages generate)
   - Blog index at `/pt/blog/` shows translated posts
   - Canvas page at `/pt/canvas/` renders with all Portuguese labels
   - No missing i18n keys (check console for warnings)

## Rules

- Never machine-translate blindly — adapt for natural Brazilian Portuguese
- Technical accuracy takes priority over linguistic purity
- Keep URLs and slugs in English (they're part of the URL structure)
- Preserve all frontmatter fields exactly (dates, tags remain in English)
