---
title: 'CSS word-wrap and Text Overflow: From Hack to Standard'
description: 'My 2015 Stack Overflow answer used word-wrap: break-word as a quick fix. In 2026, CSS handles text overflow with elegance and intelligence.'
date: 2026-03-29
tags: ['css', 'stackoverflow', 'typography', 'web-development']
lang: 'en'
---

# CSS word-wrap and Text Overflow: From Hack to Standard

In 2015, I answered a [question on Stack Overflow in Portuguese](https://pt.stackoverflow.com/questions/95429) about long text breaking out of its container. The classic scenario: a user pastes a URL like `https://example.com/this-is-an-incredibly-long-path-that-never-ends` into a fixed-width div, and the text overflows right through the layout.

The fix was one line of CSS. But the story of how that one line evolved says a lot about where CSS has gone.

## The 2015 Fix: word-wrap: break-word

```css
.container {
  word-wrap: break-word;
}
```

Done. The long text would break at the container boundary instead of overflowing. I explained it in my answer and moved on. It was such a common fix that most developers had it memorized.

But the property name was odd. `word-wrap` was a Microsoft invention from the IE5.5 era that other browsers adopted because it was useful. The CSS spec eventually standardized it under a different name — but most of us kept using the original.

## The 2026 Landscape: Multiple Tools for Text Overflow

CSS now has a proper toolkit for handling text that doesn't fit its container. Each property does something slightly different.

### overflow-wrap (the renamed word-wrap)

```css
.container {
  overflow-wrap: break-word;
}
```

This is what `word-wrap` became in the spec. Same behavior, standards-compliant name. It breaks words only when they would overflow — normal word breaks are preserved.

### word-break: break-all

```css
.container {
  word-break: break-all;
}
```

More aggressive. This breaks between any two characters, not just when overflow would occur. Useful for CJK text or content with mixed scripts, but can break normal English text in awkward places.

### hyphens: auto

```css
.container {
  hyphens: auto;
  lang: en; /* requires lang attribute on the HTML */
}
```

The elegant solution. Instead of breaking mid-word at arbitrary points, the browser inserts a hyphen at a valid hyphenation point. It needs the `lang` attribute to know the language's hyphenation rules.

```html
<p lang="en" style="hyphens: auto;">This extraordinarily long word will be hyphenated properly.</p>
```

### text-wrap: balance and text-wrap: pretty

These are the newest additions, and they change how the browser distributes text across lines:

```css
/* Balances line lengths — great for headings */
h1 {
  text-wrap: balance;
}

/* Avoids orphans on the last line — great for paragraphs */
p {
  text-wrap: pretty;
}
```

`text-wrap: balance` adjusts line breaks so that all lines are roughly the same width. No more headings where the last line has a single lonely word.

`text-wrap: pretty` prevents typographic orphans — single words stranded on the last line of a paragraph. The browser adjusts earlier line breaks to avoid it.

## Quick Reference

| Property                    | What it does                  | When to use                    |
| --------------------------- | ----------------------------- | ------------------------------ |
| `overflow-wrap: break-word` | Breaks words that overflow    | URLs, user-generated content   |
| `word-break: break-all`     | Breaks between any characters | CJK text, mixed-script content |
| `hyphens: auto`             | Adds hyphens at valid points  | Body text, articles            |
| `text-wrap: balance`        | Equalizes line lengths        | Headings, titles               |
| `text-wrap: pretty`         | Prevents orphans              | Paragraphs, body text          |

## The Key Takeaway

In 2015, text overflow was a bug you fixed with one property. In 2026, text layout is something you design. CSS evolved from "break it anywhere so it doesn't overflow" to "break it intelligently so it looks good."

The original `word-wrap: break-word` still works — browsers maintain backward compatibility. But if you're starting a new project, reach for the right tool: `overflow-wrap` for safety, `hyphens` for prose, `text-wrap` for polish.
