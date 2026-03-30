---
title: 'PHP array_merge vs array_replace vs + Union: The Definitive Guide'
description: 'My 2016 Stack Overflow answer untangled PHP array merging confusion. In 2026, the spread operator simplified everything.'
date: 2026-03-29
tags: ['php', 'stackoverflow', 'arrays', 'web-development']
lang: 'en'
---

# PHP array_merge vs array_replace vs + Union: The Definitive Guide

In 2016, I answered a [question on Stack Overflow in Portuguese](https://pt.stackoverflow.com/questions/131621) about the difference between `array_merge`, `array_replace`, and the `+` (union) operator in PHP. It scored 10 upvotes, and the confusion it addressed was real — PHP has three ways to combine arrays, and each handles duplicate keys and numeric indexes differently.

## The 2016 Answer: Three Functions, Three Behaviors

### array_merge — Reindexes Numeric Keys

```php
$a = [0 => 'a', 1 => 'b'];
$b = [0 => 'c', 1 => 'd'];

array_merge($a, $b);
// [0 => 'a', 1 => 'b', 2 => 'c', 3 => 'd']
```

For **numeric keys**, `array_merge` reindexes everything sequentially. For **string keys**, the second array's values overwrite the first's:

```php
$a = ['name' => 'Gabriel', 'role' => 'dev'];
$b = ['name' => 'Updated', 'city' => 'SP'];

array_merge($a, $b);
// ['name' => 'Updated', 'role' => 'dev', 'city' => 'SP']
```

### array_replace — Overwrites by Key Position

```php
$a = [0 => 'a', 1 => 'b'];
$b = [0 => 'c', 1 => 'd'];

array_replace($a, $b);
// [0 => 'c', 1 => 'd']
```

Unlike `array_merge`, it preserves numeric key positions and overwrites values at the same index. Works the same for string keys — second array wins.

### + (Union) — First Array Wins

```php
$a = ['name' => 'Gabriel', 'role' => 'dev'];
$b = ['name' => 'Other', 'city' => 'SP'];

$a + $b;
// ['name' => 'Gabriel', 'role' => 'dev', 'city' => 'SP']
```

The union operator keeps the first array's values for duplicate keys. It only adds keys that don't already exist. This is the opposite of `array_merge` for string keys.

## The 2026 Update: Spread Operator

PHP 7.4+ introduced the spread operator for arrays, and PHP 8.1+ extended it to string keys:

```php
// PHP 8.1+: Spread with string keys (last wins)
$defaults = ['theme' => 'dark', 'lang' => 'en', 'debug' => false];
$overrides = ['theme' => 'light', 'debug' => true];

$config = [...$defaults, ...$overrides];
// ['theme' => 'light', 'lang' => 'en', 'debug' => true]
```

This is equivalent to `array_merge` but reads more naturally, especially for configuration merging. It's the pattern most PHP developers reach for in 2026.

### When to Use Each

| Function         | Numeric keys       | String keys | Use case                  |
| ---------------- | ------------------ | ----------- | ------------------------- |
| `array_merge`    | Reindexes          | Last wins   | Concatenating lists       |
| `array_replace`  | Preserves position | Last wins   | Updating specific indexes |
| `+` (union)      | First wins         | First wins  | Applying defaults         |
| `[...$a, ...$b]` | Reindexes          | Last wins   | Config merging (modern)   |

### The Defaults Pattern

The most common real-world use case is merging user options with defaults. Here the union operator shines:

```php
function createWidget(array $options = []) {
    $defaults = ['width' => 100, 'height' => 50, 'color' => 'blue'];
    $config = $options + $defaults; // User values win, defaults fill gaps
    // ...
}
```

Or with the spread operator (last-wins semantics, so defaults go first):

```php
function createWidget(array $options = []) {
    $config = ['width' => 100, 'height' => 50, 'color' => 'blue', ...$options];
    // ...
}
```

## Key Takeaway

PHP's array combining functions aren't interchangeable — they differ in how they handle duplicate keys and numeric indexes. In 2026, the spread operator covers 90% of cases and reads more clearly than function calls. But understanding `+` for defaults and `array_replace` for positional updates still matters when you hit the edge cases.
