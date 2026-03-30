---
title: 'disabled vs readonly: The HTML Attribute Nobody Gets Right'
description: 'My 2015 Stack Overflow answer showed that disabled="false" still disables. In 2026, the inert attribute adds a third option to the mix.'
date: 2026-03-29
tags: ['html', 'forms', 'stackoverflow', 'accessibility']
lang: 'en'
---

# disabled vs readonly: The HTML Attribute Nobody Gets Right

In 2015, I answered a [question on Stack Overflow in Portuguese](https://pt.stackoverflow.com/questions/6770) about the difference between `disabled` and `readonly`. What surprised most people wasn't the difference between the two — it was learning that `disabled="false"` still disables the input.

## The 2015 Answer: Boolean Attributes Are Weird

Both `disabled` and `readonly` are **boolean attributes** in HTML. Their mere presence means "true." The value doesn't matter:

```html
<!-- All of these disable the input -->
<input disabled />
<input disabled="disabled" />
<input disabled="false" />
<input disabled="goku" />

<!-- The only way to NOT disable: remove the attribute entirely -->
<input />
```

This tripped up developers constantly. You'd write `disabled="false"` expecting it to enable the field, and it would stay disabled. The attribute being present is what matters, not its value.

### The Actual Difference

| Behavior                  | `disabled` | `readonly`     |
| ------------------------- | ---------- | -------------- |
| User can edit             | No         | No             |
| Value submitted with form | **No**     | Yes            |
| Can receive focus         | No         | Yes            |
| Can be tabbed to          | No         | Yes            |
| Visual appearance         | Grayed out | Normal         |
| Works on all inputs       | Yes        | Text-like only |

The critical distinction: **disabled fields are not submitted with the form**. If you have a field showing a calculated value that the server needs, use `readonly`. If the field is truly inactive, use `disabled`.

## The 2026 Perspective: Three Options Now

### The `inert` Attribute

HTML gained a new player: `inert`. Unlike `disabled` (which targets individual form controls), `inert` disables an entire subtree:

```html
<div inert>
  <h2>Payment Section</h2>
  <input type="text" name="card" />
  <button>Pay</button>
  <!-- Everything in here is non-interactive -->
</div>
```

An `inert` subtree is:

- Not focusable (inputs, buttons, links — nothing)
- Not clickable
- Hidden from screen readers (as if it doesn't exist)
- Visually dimmed (in most browsers)

This is perfect for modal dialogs — when the modal is open, mark the background content as `inert` to prevent interaction.

### ARIA Considerations

`disabled` has accessibility implications that `readonly` doesn't. Screen readers announce disabled fields differently:

```html
<!-- Screen reader: "Card number, edit, disabled" -->
<input disabled aria-label="Card number" />

<!-- Screen reader: "Card number, edit, read only" -->
<input readonly aria-label="Card number" />
```

There's also `aria-disabled="true"`, which communicates the disabled state to assistive technology without removing the element from tab order:

```html
<!-- Focusable but announced as disabled -->
<input aria-disabled="true" aria-label="Card number" />
```

Use this when you want screen reader users to find the field and understand why it's disabled (perhaps with an explanation nearby), rather than having it silently disappear from their navigation.

### Quick Decision Guide

- **Field should not be submitted:** `disabled`
- **Field should be submitted but not edited:** `readonly`
- **Entire section should be non-interactive:** `inert`
- **Field should be findable but non-functional:** `aria-disabled="true"`

## Key Takeaway

In 2015, the main confusion was "why does `disabled='false'` still disable?" In 2026, the landscape has expanded. `disabled`, `readonly`, `inert`, and `aria-disabled` each serve different purposes. Pick the wrong one and you'll break either form submission, keyboard navigation, or screen reader experience. Understanding the difference isn't just trivia — it's the foundation of accessible forms.
