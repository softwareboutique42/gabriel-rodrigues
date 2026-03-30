---
title: 'Block Special Characters in Input: From Regex to Native Validation'
description: 'My 2015 Stack Overflow answer used keypress events to filter characters. In 2026, the input event and native validation do it better.'
date: 2026-03-29
tags: ['html', 'javascript', 'validation', 'stackoverflow']
lang: 'en'
---

# Block Special Characters in Input: From Regex to Native Validation

In 2015, I answered a [question on Stack Overflow in Portuguese](https://pt.stackoverflow.com/questions/91477) about how to restrict input fields to only accept certain characters. It scored 14 upvotes — a common problem with a deceptively tricky solution.

The original approach worked. But it had a blind spot that took years for the community to fully appreciate.

## The 2015 Approach: Catching Keystrokes

Back then, the standard pattern was intercepting the `keypress` event and checking each character against an allowed list:

```javascript
// 2015: Block characters at the keystroke level
input.onkeypress = function (e) {
  var char = String.fromCharCode(e.which || e.keyCode);
  var allowed = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  if (allowed.indexOf(char) === -1) {
    e.preventDefault();
  }
};
```

Or using a regex:

```javascript
input.onkeypress = function (e) {
  var char = String.fromCharCode(e.which);
  if (!/[a-zA-Z0-9]/.test(char)) {
    e.preventDefault();
  }
};
```

It felt satisfying. Type a special character, nothing happens. Clean, immediate feedback.

## The Problem Nobody Mentioned

Keypress-based filtering has a fundamental flaw: **it only catches keyboard input**. In 2015, that covered most cases. But users can also:

- **Paste** text with Ctrl+V or right-click paste
- **Drag and drop** text into the field
- **Use autofill** from the browser or password managers
- **Use speech input** or dictation
- **Use on-screen keyboards** on mobile devices
- **Use IME** (Input Method Editor) for Asian languages

None of these trigger `keypress`. Your carefully filtered input field would happily accept any character through these methods.

## The 2026 Approach: Clean the Value, Don't Block the Input

Modern input filtering uses the `input` event, which fires regardless of how the value changed:

```javascript
// 2026: Clean the value on any change
input.addEventListener('input', () => {
  input.value = input.value.replace(/[^a-zA-Z0-9]/g, '');
});
```

This catches everything — keyboard, paste, autofill, speech, drag-and-drop. Instead of blocking the character before it appears, it removes invalid characters immediately after the value changes.

### Native HTML Validation

For many cases, you don't need JavaScript at all:

```html
<!-- Only allow letters and numbers, validated on submit -->
<input type="text" pattern="[a-zA-Z0-9]+" title="Letters and numbers only" required />

<!-- Hint mobile keyboards to show numeric layout -->
<input type="text" inputmode="numeric" pattern="[0-9]*" />
```

The `pattern` attribute validates on form submission. The `inputmode` attribute suggests which keyboard layout mobile browsers should show — without restricting what the user can type.

### Custom Validation Messages

For a better UX, combine the `input` event with the Constraint Validation API:

```javascript
input.addEventListener('input', () => {
  if (/[^a-zA-Z0-9]/.test(input.value)) {
    input.setCustomValidity('Only letters and numbers are allowed');
  } else {
    input.setCustomValidity('');
  }
});
```

This gives you native browser validation styling and screen reader support for free.

## The Key Takeaway

Don't block keystrokes — validate and clean the input value. The `keypress` event was a product of its time, when keyboards were the only input method that mattered. The `input` event reflects the reality that text enters fields through dozens of channels.

And always remember: client-side validation is for UX. Server-side validation is for security. No amount of JavaScript filtering replaces validating on the server.
