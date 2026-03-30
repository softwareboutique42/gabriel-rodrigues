---
title: 'Calculating Age in PHP: DateTime::diff Then and Now'
description: 'From a 2015 Stack Overflow answer on calculating age with PHP DateTime to 2026 — the same approach still works, but Carbon and timezone awareness changed the game.'
date: 2026-03-29
tags: ['php', 'datetime', 'stackoverflow', 'web-development']
lang: 'en'
---

# Calculating Age in PHP: DateTime::diff Then and Now

In 2015, I answered a question on Stack Overflow in Portuguese about calculating a person's age in PHP. Classic question — someone had a birth date and wanted to get the number of years. I showed them `DateTime::diff()` and the `y` property on the resulting `DateInterval`. The answer scored 4 upvotes. Simple, correct, useful.

Here's the thing: unlike most of my "then vs now" posts, this one is less about the old answer being wrong and more about the subtleties that most developers still get wrong even when using the right API.

## The 2015 Answer: DateTime::diff()

The approach was straightforward:

```php
$birthDate = new DateTime('1990-05-15');
$today = new DateTime('today');
$age = $birthDate->diff($today)->y;

echo $age; // 35 (in 2026)
```

`DateTime::diff()` returns a `DateInterval` object. The `y` property gives you the number of complete years between the two dates. It handles leap years, variable month lengths, all of it. No manual math with timestamps, no dividing seconds by magic numbers.

This was the correct approach in 2015. And honestly? It's still correct in 2026. PHP's `DateTime` class hasn't changed in any meaningful way for this use case.

## What Most People Were Doing Wrong

Before `DateTime::diff()` became common knowledge, you'd see code like this everywhere:

```php
$age = floor((time() - strtotime($birthDate)) / (365.25 * 24 * 60 * 60));
```

Dividing by 365.25 to "account for leap years." This was approximate at best and wrong at worst — it could be off by a day depending on when the calculation ran relative to the birthday. The `DateTime` approach eliminated that class of bug entirely.

## The 2026 Reality: Still Works, But With Nuances

The core technique hasn't changed. `DateTime::diff()` is still the right way to calculate age in PHP. What has changed is the ecosystem around it and the edge cases developers actually care about.

### Carbon Made It More Ergonomic

Most modern PHP projects use [Carbon](https://carbon.nesbot.com/) (or CarbonImmutable), which extends DateTime with a friendlier API:

```php
use Carbon\Carbon;

$age = Carbon::parse('1990-05-15')->age;
```

One line. `age` is a computed property that does exactly what `DateTime::diff()->y` does, but reads better. In Laravel projects, date fields from Eloquent models are already Carbon instances, so you'd just write `$user->birth_date->age`.

### Timezone Edge Cases Actually Matter Now

In 2015, most PHP apps ran in a single timezone and served users in one country. Nobody worried about what "today" meant across timezones. In 2026, with globally distributed apps, this matters:

```php
// A user born on March 29, 2000
// It's March 29, 2026 in Tokyo but still March 28 in New York

$birth = new DateTime('2000-03-29');
$nowTokyo = new DateTime('now', new DateTimeZone('Asia/Tokyo'));
$nowNY = new DateTime('now', new DateTimeZone('America/New_York'));

$birth->diff($nowTokyo)->y; // Could be 26
$birth->diff($nowNY)->y;    // Could still be 25
```

The question becomes: whose timezone matters? The user's? The server's? The answer depends on your business logic, and most implementations don't think about it.

### Immutability Became the Default

PHP 8.x pushed immutable patterns harder. `DateTimeImmutable` is now preferred over `DateTime` to avoid accidental mutations:

```php
$birth = new DateTimeImmutable('1990-05-15');
$today = new DateTimeImmutable('today');
$age = $birth->diff($today)->y;
```

Same result, but `$birth` and `$today` can't be accidentally modified by other code. Carbon followed suit with `CarbonImmutable`.

## What Hasn't Changed

The fundamental algorithm for "how many complete years between two dates" is the same. There's no AI-powered age calculator. No new web standard for date math. `DateTime::diff()` solved this in PHP 5.3 (released in 2009), and it's still the answer.

## The Lesson

Not every problem needs a new solution every few years. Sometimes the 2015 answer is still the 2026 answer. The difference is context — timezone awareness, immutability preferences, framework ergonomics. The core logic is identical. If you find yourself writing custom date math with timestamps and division, stop. `DateTime::diff()` has been there all along.
