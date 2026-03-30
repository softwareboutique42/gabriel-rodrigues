---
title: 'Fallback Image: Handling Broken Images Gracefully'
description: 'My 2015 SO question used onerror to swap broken image src. In 2026, picture element, skeleton loading, and CSS handle this more elegantly.'
date: 2026-03-29
tags: ['html', 'images', 'ux', 'stackoverflow']
lang: 'en'
---

# Fallback Image: Handling Broken Images Gracefully

In 2015, I asked a [question on Stack Overflow in Portuguese](https://pt.stackoverflow.com/questions/131006) about showing a fallback image when the original fails to load. It scored 8 upvotes — a universal problem for any site with user-uploaded content or external image URLs.

## The 2015 Approach: onerror

```html
<img src="avatar.jpg" onerror="this.src='/images/default-avatar.png'" />
```

Or more defensively (to prevent infinite loops if the fallback also fails):

```javascript
img.onerror = function () {
  this.onerror = null; // Prevent infinite loop
  this.src = '/images/default-avatar.png';
};
```

Simple and effective. Still works in 2026.

## The 2026 Approaches

### picture Element with Multiple Sources

For format fallbacks (AVIF → WebP → PNG):

```html
<picture>
  <source srcset="avatar.avif" type="image/avif" />
  <source srcset="avatar.webp" type="image/webp" />
  <img src="avatar.jpg" alt="User avatar" loading="lazy" />
</picture>
```

The browser picks the first format it supports. If all sources fail, the `<img>` fallback applies — and you can still add `onerror` on the `<img>` element.

### CSS Broken Image Styling

CSS can style broken images specifically:

```css
img {
  /* Shown when image loads */
  background: transparent;
}

img::after {
  /* Shown when image breaks — displays the alt text area */
  content: attr(alt);
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f0f0f0;
  color: #666;
  font-size: 0.875rem;
}
```

### Skeleton Loading Pattern

Modern UX shows a placeholder skeleton while the image loads, then transitions to the real image:

```html
<div class="avatar-container loading">
  <img src="avatar.jpg" alt="User" onload="this.parentNode.classList.remove('loading')" />
</div>
```

```css
.avatar-container.loading {
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
}

@keyframes shimmer {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}
```

## Key Takeaway

The `onerror` handler is still the right tool for programmatic fallbacks. But in 2026, you have additional options: `<picture>` for format fallbacks, CSS `::after` for styled broken states, and skeleton loading for perceived performance. The right choice depends on whether you need a fallback image or just graceful degradation.
