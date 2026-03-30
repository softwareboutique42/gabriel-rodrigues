---
title: 'Fixed Header: From position:fixed to position:sticky'
description: 'My 2015 SO answer showed position:fixed with body padding hacks. In 2026, position:sticky stays in flow until you need it.'
date: 2026-03-29
tags: ['css', 'layout', 'stackoverflow', 'web-development']
lang: 'en'
---

# Fixed Header: From position:fixed to position:sticky

In 2015, I answered a question on Stack Overflow in Portuguese about making a header stay at the top of the page while scrolling — without JavaScript. It scored 5 upvotes.

## The 2015 Approach: position:fixed

```css
header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 100;
  height: 60px;
}

body {
  padding-top: 60px; /* Compensate for header taking up space */
}
```

It worked, but `position: fixed` removes the element from the document flow. You had to manually add `padding-top` equal to the header height to prevent content from sliding under it. Change the header height and forget to update the padding — content gets obscured.

## The 2026 Approach: position:sticky

`position: sticky` was experimental in 2015 and is fully supported everywhere in 2026:

```css
header {
  position: sticky;
  top: 0;
  z-index: 100;
}
```

No `padding-top` needed. Sticky elements stay in the document flow until they would scroll out of view, then they "stick" to the specified edge. When you scroll back up, they return to their original position.

### scroll-margin-top for Anchor Links

A common problem with fixed/sticky headers: clicking `<a href="#section">` jumps to the target, but the header overlaps it. The modern fix:

```css
:target,
[id] {
  scroll-margin-top: 80px; /* Height of your sticky header + buffer */
}
```

No JavaScript needed. The browser accounts for this offset when jumping to anchor links.

### Container-Specific Sticky

Sticky is scoped to its scroll container. If your sidebar should stick within an article layout:

```css
.sidebar {
  position: sticky;
  top: 1rem;
  align-self: start; /* Critical for flex/grid containers */
}
```

## Key Takeaway

`position: fixed` fights against the document flow. `position: sticky` works with it. The upgrade path is usually just swapping the property and removing the body padding hack — and adding `scroll-margin-top` to handle anchor link offsets cleanly.
