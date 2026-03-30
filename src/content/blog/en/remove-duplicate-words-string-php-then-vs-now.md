---
title: 'Removing Duplicate Words from a String in PHP: Then vs Now'
description: 'My Stack Overflow answer used explode + array_unique + implode to deduplicate words. In 2026, the same pipeline still works — plus regex backreferences and modern alternatives.'
date: 2026-03-29
tags: ['php', 'strings', 'stackoverflow', 'algorithms']
lang: 'en'
---

# Removing Duplicate Words from a String in PHP: Then vs Now

I answered a [question on Stack Overflow in Portuguese](https://pt.stackoverflow.com/questions/118746) about removing duplicate words from a string in PHP. It scored 7 upvotes. The classic approach was a three-function pipeline that every PHP developer has written at least once.

## The Then: The explode-unique-implode Pipeline

The answer was straightforward — split, deduplicate, rejoin:

```php
$string = "the cat sat on the mat the cat";

$words = explode(' ', $string);
$unique = array_unique($words);
$result = implode(' ', $unique);

echo $result;
// "the cat sat on mat"
```

Clean, readable, effective. `array_unique` preserves the first occurrence and removes subsequent duplicates, so word order is maintained.

For case-insensitive deduplication, you'd add a twist:

```php
$string = "The cat THE Cat the CAT";

$words = explode(' ', $string);
$seen = [];
$result = [];

foreach ($words as $word) {
    $lower = mb_strtolower($word);
    if (!isset($seen[$lower])) {
        $seen[$lower] = true;
        $result[] = $word;
    }
}

echo implode(' ', $result);
// "The cat"
```

And there was the regex approach using backreferences:

```php
$string = "the the cat cat sat sat";

// Remove consecutive duplicates only
$result = preg_replace('/\b(\w+)\s+\1\b/i', '$1', $string);
echo $result;
// "the cat sat"
```

The regex version only catches consecutive duplicates though. For non-consecutive ones, you still needed the array approach.

## The Now: Same Core, Better Tools

Here's the thing — this is one of those problems where the 2016 solution is still the 2026 solution. `explode` + `array_unique` + `implode` remains the most readable way to do this in PHP. But the surrounding ecosystem has evolved:

### PHP 8.x String Functions

```php
// str_contains, str_starts_with, str_ends_with (PHP 8.0)
// Make related string checks cleaner
if (str_contains($word, '-')) {
    // Handle hyphenated words
}

// Named arguments make the pipeline more readable
$words = explode(separator: ' ', string: $input);
```

### Array Functions Got Better

```php
// array_unique with sort flags
$unique = array_unique($words, SORT_STRING | SORT_FLAG_CASE);

// Arrow functions for custom filtering
$seen = [];
$unique = array_filter($words, function($word) use (&$seen) {
    $key = mb_strtolower($word);
    return !isset($seen[$key]) && ($seen[$key] = true);
});
```

### The Multi-byte Reality

The original answer assumed ASCII. Real-world Portuguese text has accents:

```php
$string = "São Paulo são paulo São PAULO";

$words = explode(' ', $string);
$seen = [];
$result = [];

foreach ($words as $word) {
    // mb_strtolower handles "São" → "são" correctly
    $normalized = mb_strtolower($word, 'UTF-8');
    if (!isset($seen[$normalized])) {
        $seen[$normalized] = true;
        $result[] = $word;
    }
}

echo implode(' ', $result);
// "São Paulo"
```

### In Other Languages

The same pattern exists everywhere, often more concisely:

```javascript
// JavaScript
const unique = [...new Set(str.split(' '))].join(' ');

// Python
unique = ' '.join(dict.fromkeys(s.split()));
```

JavaScript's `Set` approach is arguably the cleanest one-liner for this problem in any language.

## What I Learned

Not every problem needs a new solution every decade. `explode` + `array_unique` + `implode` is a perfectly good answer in 2016 and in 2026. The lesson is about recognizing when a simple pipeline is good enough versus when you need something more sophisticated.

The real improvements are at the edges: better multi-byte support, named arguments for readability, and knowing when to reach for regex backreferences versus array operations. Sometimes the best code is the code that didn't need to change.
