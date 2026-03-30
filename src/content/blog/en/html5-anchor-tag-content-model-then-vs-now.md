---
title: "What's Allowed Inside an Anchor Tag in HTML5"
description: 'My 2016 Stack Overflow answer about putting divs inside links. In 2026, valid HTML and accessible HTML are two different conversations.'
date: 2026-03-29
tags: ['html', 'html5', 'stackoverflow', 'accessibility']
lang: 'en'
---

# What's Allowed Inside an Anchor Tag in HTML5

In 2016, I answered a [question on Stack Overflow in Portuguese](https://pt.stackoverflow.com/questions/107718) that came up all the time: can you put a `<div>` inside an `<a>` tag? The answer was more nuanced than people expected.

## The 2016 Answer: It Depends on the HTML Version

In **HTML4**, the answer was no. The `<a>` element was inline, and inline elements couldn't contain block elements. Putting a `<div>` inside a link was invalid markup.

**HTML5 changed the rules.** The `<a>` element got a **transparent content model** — meaning it can contain anything its parent could contain, except other interactive elements. So if your `<a>` is inside a `<div>`, it can contain block elements like `<div>`, `<p>`, `<h1>`, etc.

```html
<!-- Invalid in HTML4, valid in HTML5 -->
<a href="/product/123">
  <div class="card">
    <h3>Product Name</h3>
    <p>Product description here</p>
    <span class="price">$29.99</span>
  </div>
</a>
```

What you **cannot** put inside an `<a>`:

- Another `<a>` (no nested links)
- `<button>` elements
- `<input>`, `<select>`, `<textarea>` (form controls)
- Any interactive element

The rule is simple: **no interactive content inside interactive content**.

## The 2026 Perspective: Valid Isn't Always Accessible

HTML5 made wrapping block content in `<a>` tags valid. Frameworks embraced it — card components wrapped in links became ubiquitous. But accessibility audits in 2026 reveal a problem that the validator doesn't catch.

### Screen Reader Experience

When a screen reader encounters a link, it reads the **entire accessible name**. For a card wrapped in an `<a>` tag, that means reading every piece of text inside:

> "Link: Product Name Product description here $29.99"

That's a terrible experience. Compare it to a simple link:

> "Link: Product Name"

### The Modern Pattern: Pseudo-Content Click Area

Instead of wrapping the entire card in a link, modern implementations use a positioned pseudo-element to expand the link's click area:

```html
<div class="card">
  <h3><a href="/product/123" class="card-link">Product Name</a></h3>
  <p>Product description here</p>
  <span class="price">$29.99</span>
</div>
```

```css
.card {
  position: relative;
}

.card-link::after {
  content: '';
  position: absolute;
  inset: 0;
}
```

The entire card is clickable, but the screen reader only announces "Link: Product Name." Best of both worlds.

### When Wrapping Is Still Fine

For simple content — an image with a caption, or a short heading — wrapping in `<a>` is perfectly accessible:

```html
<a href="/article/123">
  <article>
    <h3>Article Title</h3>
  </article>
</a>
```

The guideline: if the screen reader announcement sounds natural when read as one sentence, wrapping is fine. If it becomes a paragraph of jumbled text, use the pseudo-element pattern.

## Key Takeaway

HTML5 gave us permission to put block content inside anchor tags. That's a spec question, and the answer is yes. But whether you _should_ is an accessibility question — and the answer depends on how the content sounds when read aloud. Valid HTML isn't always accessible HTML, and in 2026, accessibility isn't optional.
