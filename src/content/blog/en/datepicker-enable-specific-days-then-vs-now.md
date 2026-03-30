---
title: 'Datepicker Enable Specific Days: From beforeShowDay to Modern Date Controls'
description: 'My Stack Overflow answer about enabling only specific days in a Bootstrap datepicker scored 5 upvotes. In 2026, native date inputs and headless datepicker libraries handle this with far less code.'
date: 2026-03-29
tags: ['bootstrap', 'forms', 'javascript', 'stackoverflow']
lang: 'en'
---

# Datepicker Enable Specific Days: From beforeShowDay to Modern Date Controls

I answered a question on Stack Overflow in Portuguese about enabling only specific days in a Bootstrap datepicker. It scored 5 upvotes — a common scenario in booking systems, appointment schedulers, and anywhere business rules dictated which dates users could pick.

The `beforeShowDay` callback got the job done. But comparing it to what we have now shows how much friction we used to accept as normal.

## The 2016 Problem: bootstrap-datepicker and beforeShowDay

The standard tool was the `bootstrap-datepicker` jQuery plugin. To restrict which days were selectable, you used the `beforeShowDay` callback:

```javascript
// 2016: bootstrap-datepicker with beforeShowDay
var allowedDates = ['2016-03-15', '2016-03-18', '2016-03-22'];

$('#datepicker').datepicker({
  format: 'yyyy-mm-dd',
  beforeShowDay: function (date) {
    var formatted =
      date.getFullYear() +
      '-' +
      ('0' + (date.getMonth() + 1)).slice(-2) +
      '-' +
      ('0' + date.getDate()).slice(-2);

    if (allowedDates.indexOf(formatted) !== -1) {
      return { enabled: true, classes: 'available-day' };
    }
    return { enabled: false };
  },
});
```

That manual date formatting was required because JavaScript's `Date` object didn't have a built-in ISO format method you could trust across browsers. The `getMonth() + 1` and zero-padding were bugs waiting to happen.

## What Made It Painful

The `beforeShowDay` pattern had several issues:

1. **Called for every visible day** — The callback ran 42 times (6 weeks x 7 days) each time the calendar rendered. With large allowed-date arrays, this was noticeably slow
2. **String comparison for dates** — You had to format dates identically to match them against your list. One format mismatch and the day was disabled with no error
3. **No async support** — If allowed dates came from an API, you had to fetch them all upfront and store them before initializing the datepicker
4. **jQuery plugin dependency chain** — bootstrap-datepicker required jQuery, Bootstrap CSS, and its own CSS and JS files. Four dependencies for a date input

The worst part was debugging. When a day was incorrectly disabled, you had to step through the callback for that specific date and figure out why your string comparison failed. Usually it was a timezone offset shifting the date by one day.

## The 2026 Approach: Native Inputs and Headless Libraries

### Native Date Input with min/max

For simple range restrictions, native HTML handles it:

```html
<!-- 2026: Native date input with constraints -->
<input type="date" min="2026-03-01" max="2026-03-31" required />
```

Browser-native datepickers now look good, support keyboard navigation, and respect `min`/`max` without a single line of JavaScript. On mobile, you get the OS-native date picker for free.

### Headless Datepicker Libraries

For complex rules like "only Tuesdays and Thursdays" or "only dates from this API list," headless datepicker libraries provide the logic without locking you into a UI:

```javascript
// 2026: Headless datepicker with date validation
const allowedDates = new Set(['2026-03-15', '2026-03-18', '2026-03-22']);

const calendar = createCalendar({
  isDateDisabled: (date) => !allowedDates.has(date.toISOString().slice(0, 10)),
  onSelect: (date) => handleSelection(date),
  locale: navigator.language,
});
```

`Set.has()` is O(1) instead of `Array.indexOf()` which was O(n). `toISOString()` gives consistent formatting. The headless approach means you own the markup and styling completely.

### Temporal API

The date formatting nightmare is also solved at the language level:

```javascript
// 2026: Temporal API — no more getMonth() + 1
const date = Temporal.PlainDate.from('2026-03-15');
const formatted = date.toString(); // "2026-03-15" — always
```

No timezone surprises. No month-index off-by-one. Dates are just dates.

## What Changed

The pattern shifted from "big jQuery plugin with callbacks" to "native input for simple cases, headless library for complex ones." The date formatting hell that made `beforeShowDay` so error-prone has been solved by both `Temporal` and consistent `toISOString()` support.

That Stack Overflow answer was a practical fix for a real constraint. But the real lesson is that form controls should be as close to native as possible, and only reach for libraries when business rules demand it.
