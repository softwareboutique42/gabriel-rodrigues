---
title: 'Java Date Formatting in Portuguese: From SimpleDateFormat to java.time'
description: 'From a Stack Overflow question about formatting dates in Brazilian Portuguese with SimpleDateFormat to the modern java.time API and a comparison with JS Temporal.'
date: 2026-03-29
tags: ['java', 'datetime', 'localization', 'stackoverflow']
lang: 'en'
---

# Java Date Formatting in Portuguese: From SimpleDateFormat to java.time

I asked a question on Stack Overflow in Portuguese about formatting dates in Brazilian Portuguese using Java. The question scored 13 — localization was (and still is) a real stumbling block for developers who need their apps to display "segunda-feira, 15 de março de 2026" instead of "Monday, March 15, 2026."

The core problem hasn't changed: you need locale-aware date formatting. But the tools we use for it are fundamentally different now.

## The 2015 Approach: SimpleDateFormat

Back then, `SimpleDateFormat` was the go-to class for date formatting in Java. To get Portuguese output, you passed a `Locale`:

```java
SimpleDateFormat sdf = new SimpleDateFormat(
    "EEEE, dd 'de' MMMM 'de' yyyy",
    new Locale("pt", "BR")
);
String formatted = sdf.format(new Date());
// "segunda-feira, 15 de março de 2026"
```

This worked, but `SimpleDateFormat` was a minefield:

- **Not thread-safe.** Sharing an instance across threads caused silent data corruption. I've seen production bugs where dates from one request leaked into another because someone cached a `SimpleDateFormat` in a static field.
- **Mutable `Date` objects.** `java.util.Date` was mutable, so passing a date to a method meant that method could modify your date. Defensive copying was everywhere.
- **Calendar gymnastics.** Doing arithmetic — adding days, finding the first day of the month — required `Calendar`, which was verbose, confusing, and also mutable.
- **Timezone confusion.** `Date` stored a timestamp but printed in the JVM's default timezone. `SimpleDateFormat` had its own timezone setting. Getting consistent timezone behavior required careful configuration.

For something as simple as "show today's date in Portuguese," you had to dodge a surprising number of traps.

## What Changed: java.time

Java 8 (2014) introduced the `java.time` package, inspired by Joda-Time. By 2026, it's the only date/time API you should be using in Java:

```java
LocalDate today = LocalDate.now();
DateTimeFormatter formatter = DateTimeFormatter.ofPattern(
    "EEEE, dd 'de' MMMM 'de' yyyy",
    new Locale("pt", "BR")
);
String formatted = today.format(formatter);
// "segunda-feira, 15 de março de 2026"
```

The code looks similar, but the underlying design is completely different:

- **Immutable.** `LocalDate`, `LocalDateTime`, `ZonedDateTime` — all immutable. No defensive copying. No thread-safety issues.
- **Thread-safe formatters.** `DateTimeFormatter` is immutable and thread-safe. Cache it in a static field without worry.
- **Clear type system.** `LocalDate` has no time. `LocalTime` has no date. `ZonedDateTime` has both plus a timezone. The type tells you what information is present.
- **Fluent arithmetic.** `today.plusDays(7)`, `today.withDayOfMonth(1)`, `today.minusMonths(3)` — readable and returns a new instance.

### Built-in Localized Styles

You don't even need custom patterns for common formats:

```java
DateTimeFormatter formatter = DateTimeFormatter.ofLocalizedDate(FormatStyle.FULL)
    .withLocale(new Locale("pt", "BR"));

LocalDate.now().format(formatter);
// "segunda-feira, 29 de março de 2026"
```

The JDK knows the correct date format for Brazilian Portuguese. Let it handle the pattern.

## Cross-Language Comparison: JavaScript Temporal

JavaScript went through its own date evolution. `Intl.DateTimeFormat` has handled localized formatting for years:

```javascript
const date = new Date();
const formatted = new Intl.DateTimeFormat('pt-BR', {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
  year: 'numeric',
}).format(date);
// "segunda-feira, 29 de março de 2026"
```

And the `Temporal` API, now available in modern browsers and runtimes, brings Java-like immutable date types to JavaScript:

```javascript
const today = Temporal.Now.plainDateISO();
const formatted = today.toLocaleString('pt-BR', {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
  year: 'numeric',
});
```

The pattern is converging: immutable date objects, clear type distinctions (date vs. time vs. datetime vs. zoned), and built-in locale-aware formatting. Java got there first with `java.time`, JavaScript followed with `Temporal`.

## The Lesson

The original question was about a formatting pattern — a syntax problem. But the real issue was that Java's date/time API was badly designed. `SimpleDateFormat` worked for the happy path and broke in every other scenario. The `java.time` API didn't just fix formatting — it fixed the entire mental model around dates, times, and timezones.

When a platform redesigns a fundamental API, pay attention. The migration cost is real, but the bugs you'll never write are worth it.
