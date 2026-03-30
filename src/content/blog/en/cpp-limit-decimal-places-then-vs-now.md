---
title: 'C/C++ Decimal Formatting: From printf to std::format'
description: 'My 2015 SO answer used printf("%.2f") to limit decimal places. C++20 std::format brought Python-style format strings to C++.'
date: 2026-03-29
tags: ['cpp', 'formatting', 'stackoverflow', 'language-features']
lang: 'en'
---

# C/C++ Decimal Formatting: From printf to std::format

In 2015, I answered a [question on Stack Overflow in Portuguese](https://pt.stackoverflow.com/questions/52810) about limiting decimal places in C and C++. It scored 5 upvotes.

## The 2015 Answer: Two Approaches

**C-style with printf:**

```c
double value = 3.14159;
printf("%.2f\n", value); // Output: 3.14
```

**C++ with iomanip:**

```cpp
#include <iostream>
#include <iomanip>

double value = 3.14159;
std::cout << std::fixed << std::setprecision(2) << value << std::endl; // 3.14
```

Both worked, but each had its annoyances. `printf` required memorizing format specifiers. The `iomanip` approach was verbose and had the quirky behavior of `std::fixed` and `std::setprecision` persisting across subsequent output operations — easy to accidentally affect other output.

## The 2026 Approach: std::format

C++20 introduced `std::format`, which brought Python's f-string-style formatting to C++:

```cpp
#include <format>

double value = 3.14159;
std::string result = std::format("{:.2f}", value); // "3.14"
std::println("{:.2f}", value); // C++23: prints with newline
```

The format string syntax is consistent and learnable. If you know Python's `f"{value:.2f}"`, you already know `std::format("{:.2f}", value)`.

### Format Specifier Reference

| Format    | Result for 3.14159 | Meaning                 |
| --------- | ------------------ | ----------------------- |
| `{:.2f}`  | `3.14`             | Fixed, 2 decimal places |
| `{:.4f}`  | `3.1416`           | Fixed, 4 decimal places |
| `{:.2e}`  | `3.14e+00`         | Scientific notation     |
| `{:.2g}`  | `3.1`              | General (shortest)      |
| `{:8.2f}` | `    3.14`         | Width 8, 2 decimals     |

## Key Takeaway

`printf("%.2f")` still works and is the right choice in C or when interfacing with C APIs. In modern C++, `std::format` offers cleaner syntax, type safety at compile time, and no risk of format string vulnerabilities. C++23's `std::println` makes it even simpler.
