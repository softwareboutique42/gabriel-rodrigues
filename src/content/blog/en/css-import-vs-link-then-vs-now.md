---
title: 'CSS @import vs link: The Debate That CSS Layers Resurrected'
description: 'My 2015 Stack Overflow question about including stylesheets had a clear answer: use link. In 2026, @import found a new purpose with @layer.'
date: 2026-03-29
tags: ['css', 'performance', 'stackoverflow', 'web-development']
lang: 'en'
---

# CSS @import vs link: The Debate That CSS Layers Resurrected

In 2015, I asked a [question on Stack Overflow in Portuguese](https://pt.stackoverflow.com/questions/100133) about the difference between `@import` and `<link>` for including CSS files. It scored 12 upvotes. The answer was unanimous: don't use `@import`.

## The 2015 Answer: @import Is Slow

The problem was waterfalling. A `<link>` tag lets the browser discover all stylesheets in parallel by scanning the HTML. But `@import` hides dependencies inside CSS files — the browser can't find them until it downloads and parses the parent stylesheet.

```html
<!-- Good: browser discovers both in one HTML parse -->
<link rel="stylesheet" href="reset.css" />
<link rel="stylesheet" href="main.css" />
```

```css
/* Bad: browser discovers reset.css only after downloading main.css */
@import url('reset.css');
/* ... rest of main.css */
```

Steve Souders called `@import` one of the worst CSS performance practices. The advice was simple: always use `<link>`.

## The 2026 Plot Twist: @import and @layer

CSS Cascade Layers changed the equation. The `@layer` feature lets you define explicit cascade priorities, and `@import` is how you assign external files to layers:

```css
/* Import third-party styles into a low-priority layer */
@import url('vendor/normalize.css') layer(reset);
@import url('vendor/component-library.css') layer(components);

/* Your styles automatically win over layered imports */
@layer reset, components, custom;

.button {
  /* This always overrides component-library styles,
     regardless of specificity */
  background: var(--color-neon);
}
```

You can't do this with `<link>` tags alone. While there's a `layer` attribute proposal for `<link>`, `@import` with `layer()` is the established pattern in 2026.

### But Bundlers Make It Moot

In production, build tools (Vite, Lightning CSS, PostCSS) resolve `@import` statements at build time, inlining everything into a single file. The waterfall problem disappears because there's nothing to waterfall — it's all one file.

```css
/* In development: readable @import chains */
@import url('./tokens.css') layer(tokens);
@import url('./reset.css') layer(reset);
@import url('./components.css') layer(components);

/* In production: bundled into one file, zero extra requests */
```

## When to Use Each in 2026

| Method                   | Use when                                                       |
| ------------------------ | -------------------------------------------------------------- |
| `<link>`                 | Loading independent stylesheets that don't need layer ordering |
| `@import` with `layer()` | Controlling cascade priority of external CSS                   |
| Bundler imports          | Always in production (automatic)                               |

## Key Takeaway

In 2015, `@import` was a performance mistake. In 2026, it's a cascade management tool — when paired with `@layer`. The performance concern is valid but academic: bundlers inline everything in production anyway. The real question shifted from "how to load CSS" to "how to control the cascade."
