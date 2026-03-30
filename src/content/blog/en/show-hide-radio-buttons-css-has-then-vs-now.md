---
title: 'Show/Hide Divs with Radio Buttons: CSS :has() Replaces JS'
description: 'My 2015 SO answer used jQuery to show/hide divs based on radio button selection. CSS :has() does this with zero JavaScript in 2026.'
date: 2026-03-29
tags: ['html', 'css', 'javascript', 'stackoverflow']
lang: 'en'
---

# Show/Hide Divs with Radio Buttons: CSS :has() Replaces JS

In 2015, I answered a [question on Stack Overflow in Portuguese](https://pt.stackoverflow.com/questions/80540) about showing or hiding different content sections based on which radio button was selected. It scored 4 upvotes.

## The 2015 Approach: jQuery change Event

```html
<input type="radio" name="plan" value="basic" /> Basic
<input type="radio" name="plan" value="pro" /> Pro

<div id="basic-details">Basic plan content</div>
<div id="pro-details" style="display:none">Pro plan content</div>
```

```javascript
$('input[name="plan"]').on('change', function () {
  $('#basic-details, #pro-details').hide();
  $('#' + this.value + '-details').show();
});
```

Works fine. Standard jQuery conditional display pattern from 2015.

## The 2026 Approach: CSS :has() — Zero JavaScript

The `:has()` selector, now supported in all major browsers, lets you style an element based on what it contains:

```html
<form>
  <input type="radio" name="plan" id="basic" value="basic" />
  <label for="basic">Basic</label>
  <input type="radio" name="plan" id="pro" value="pro" />
  <label for="pro">Pro</label>

  <div class="panel" id="basic-details">Basic plan content</div>
  <div class="panel" id="pro-details">Pro plan content</div>
</form>
```

```css
/* Hide all panels by default */
.panel {
  display: none;
}

/* Show basic panel when basic radio is checked */
form:has(#basic:checked) #basic-details {
  display: block;
}

/* Show pro panel when pro radio is checked */
form:has(#pro:checked) #pro-details {
  display: block;
}
```

No JavaScript. No event listeners. The browser handles the show/hide reactively as the user selects different radios.

### The Checkbox Trick (Still Works)

For single-toggle cases, the pure CSS checkbox trick still works:

```css
#toggle:checked ~ .content {
  display: block;
}
```

But `:has()` is more flexible and works for radio groups, not just checkboxes.

## Key Takeaway

In 2015, conditional display required JavaScript. In 2026, CSS `:has()` handles state-based visibility reactively. The jQuery pattern still works perfectly — but if you want zero JS for this pattern, the platform finally supports it natively.
