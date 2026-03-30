---
title: 'PHP Date and Weekend Check: From date("w") to DateTimeImmutable'
description: 'From a 2015 Stack Overflow answer about checking if a date falls on a weekend in PHP to the modern era of DateTimeImmutable, Carbon, and locale-aware calendars.'
date: 2026-03-29
tags: ['php', 'datetime', 'stackoverflow', 'web-development']
lang: 'en'
---

# PHP Date and Weekend Check: From date("w") to DateTimeImmutable

Back in 2015, someone on [Stack Overflow in Portuguese](https://pt.stackoverflow.com/questions/86757) asked how to check whether a given date falls on a weekend in PHP. I posted an answer that scored 6 upvotes — a clean, straightforward solution using `date('w')` and `strtotime()`. It worked. It was simple. And if you squint hard enough, you can still find that exact pattern running in production codebases today.

But PHP's date handling has grown up a lot since then. Here's what the answer looked like, why it was fine for the time, and what I'd write instead in 2026.

## The 2015 Answer: date('w') and strtotime

The approach was dead simple. PHP's `date()` function with the `'w'` format character returns the day of the week as a number: 0 for Sunday, 6 for Saturday. Combine that with `strtotime()` to parse a date string, and you've got a weekend check in two lines:

```php
$dayOfWeek = date('w', strtotime('2015-08-15'));
$isWeekend = ($dayOfWeek == 0 || $dayOfWeek == 6);
```

That's it. Parse the string into a Unix timestamp, extract the day of the week, check if it's 0 or 6. You could wrap it in a function and call it a day.

For bonus points, you could use `date('N')` instead, which returns 1 (Monday) through 7 (Sunday) following the ISO-8601 standard. That made the check slightly cleaner:

```php
$dayOfWeek = date('N', strtotime('2015-08-15'));
$isWeekend = ($dayOfWeek >= 6);
```

Both approaches worked. The answer was correct, easy to understand, and covered the edge cases the asker cared about.

## Why It Was Fine Then

PHP's `date()` and `strtotime()` were the bread and butter of date manipulation for years. Every PHP developer knew them by heart. The functions were well-documented, behaved predictably (mostly), and handled common formats without fuss.

The main gotcha was timezone handling. `strtotime()` uses the default timezone set by `date_default_timezone_set()`, and if you hadn't set one explicitly, PHP would guess — sometimes badly. But for a "is this a weekend?" check, timezone issues rarely mattered. The day of the week doesn't change with timezone unless you're right at midnight on a boundary.

## The 2026 Reality: DateTimeImmutable and Beyond

Modern PHP has `DateTimeImmutable`, and there's really no reason to use `date()` and `strtotime()` anymore for anything beyond quick throwaway scripts. Here's the same weekend check:

```php
$date = new DateTimeImmutable('2026-03-29');
$isWeekend = (int) $date->format('N') >= 6;
```

Why prefer this? `DateTimeImmutable` is an object. You can pass it around, chain methods, and — critically — it won't mutate when you perform operations on it. The old `DateTime` class was mutable, meaning `$date->modify('+1 day')` changed the original object. That caused subtle bugs everywhere. `DateTimeImmutable` returns a new instance instead.

Then there's **Carbon**, the de facto standard library for dates in the PHP ecosystem. It wraps `DateTimeImmutable` and adds a fluent API:

```php
use Carbon\Carbon;

$date = Carbon::parse('2026-03-29');
$isWeekend = $date->isWeekend();
```

One method call. No magic numbers. No remembering whether `'w'` starts from 0 or 1.

## The Part Nobody Talked About: Locale-Aware Weekends

Here's what makes this topic genuinely interesting in 2026. The assumption that Saturday and Sunday are "the weekend" is culturally specific. In many Middle Eastern countries, the weekend is Friday and Saturday. In some countries, it's just Friday. The ISO standard doesn't help you here — it defines Monday as day 1, but says nothing about which days are rest days.

PHP's `IntlCalendar` class (from the `intl` extension) can tell you which days are weekends for a given locale:

```php
$cal = IntlCalendar::createInstance(null, 'ar_SA');
$cal->setTime($date->getTimestamp() * 1000);
$isWeekend = $cal->isWeekend();
```

For the `ar_SA` (Arabic, Saudi Arabia) locale, `isWeekend()` returns `true` for Friday and Saturday instead of Saturday and Sunday. This is locale data from the ICU library, the same data that powers internationalization in Java, JavaScript's `Intl` APIs, and most other platforms.

If you're building a scheduling app, a leave management system, or any product that serves users across regions, hardcoding `day >= 6` is a bug waiting to happen.

## What the Gap Teaches Us

The progression from `date('w')` to `DateTimeImmutable` to Carbon to `IntlCalendar` isn't just about new APIs replacing old ones. It's about the expanding scope of what we consider "correct."

In 2015, "does this date fall on a weekend?" had one answer. In 2026, the first question is "weekend according to whom?" The technical problem didn't change — date arithmetic is date arithmetic. What changed is our awareness of context.

That pattern repeats across all of software development. The naive solution works for the initial audience. Then the audience grows, and the definition of "correct" grows with it.

My 2015 answer still works if you're building a tool for a single-locale market and you know your weekends are Saturday and Sunday. But the moment your product crosses a cultural boundary, you need the richer tools. And PHP, to its credit, has them now.
