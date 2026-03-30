---
title: 'C++ Templates: From Generic Programming Basics to C++20 Concepts'
description: 'My 2015 SO question about C++ templates. In 2026, Concepts constrain templates with clear error messages and expressive intent.'
date: 2026-03-29
tags: ['cpp', 'templates', 'stackoverflow', 'language-features']
lang: 'en'
---

# C++ Templates: From Generic Programming Basics to C++20 Concepts

In 2015, I asked a [question on Stack Overflow in Portuguese](https://pt.stackoverflow.com/questions/63573) about C++ templates — one of the most powerful yet most intimidating features of the language. The question scored 11 upvotes, which tells me the confusion was widely shared.

## The 2015 Understanding: Generic Functions and Classes

Templates allow you to write code that works with multiple types. The basic function template:

```cpp
// Works with int, double, std::string — anything that supports +
template <typename T>
T add(T a, T b) {
    return a + b;
}

int result = add(3, 4);          // T = int
double result2 = add(3.14, 2.0); // T = double
```

Class templates for generic containers:

```cpp
template <typename T>
class Stack {
    std::vector<T> items;
public:
    void push(T item) { items.push_back(item); }
    T pop() { items.pop_back(); return items.back(); }
};

Stack<int> intStack;
Stack<std::string> stringStack;
```

The power was clear — write once, use with any type. The problem was error messages. If you passed a type that didn't support the required operations, the compiler error was famously cryptic: pages of template instantiation context, pointing deep into library internals.

## The 2026 Approach: C++20 Concepts

Concepts let you express type constraints explicitly, with clear error messages:

```cpp
#include <concepts>

// Constraint: T must support + and return a T
template <typename T>
requires std::same_as<decltype(std::declval<T>() + std::declval<T>()), T>
T add(T a, T b) {
    return a + b;
}

// Or with a standard concept:
template <std::integral T>
T multiply(T a, T b) {
    return a * b;
}
```

If you call `multiply("hello", "world")`, you get a clear error: _"constraints not satisfied: std::integral<const char_> was not satisfied."\* Not 40 lines of template instantiation.

Custom concepts:

```cpp
template <typename T>
concept Printable = requires(T t) {
    { std::cout << t } -> std::same_as<std::ostream&>;
};

template <Printable T>
void print(T value) {
    std::cout << value << '\n';
}
```

## Comparison with Other Languages

| Feature        | C++ Templates          | TypeScript Generics | Rust Generics  |
| -------------- | ---------------------- | ------------------- | -------------- |
| Constraints    | C++20 Concepts         | `extends` clause    | `trait` bounds |
| Error messages | Improved with Concepts | Good                | Excellent      |
| Compile-time   | Yes                    | Yes (type-only)     | Yes            |

## Key Takeaway

C++ templates were powerful but unapproachable in 2015 — the error messages alone were a barrier. C++20 Concepts turned template constraints into a design language. If you're learning C++ today, start with Concepts from day one: they make intent explicit and feedback actionable.
