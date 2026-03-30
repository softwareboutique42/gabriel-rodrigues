---
title: 'Get Current Filename in PHP: From $_SERVER to Modern Routing'
description: 'In 2015, I asked on Stack Overflow how to get the current filename in PHP. The answer was simple then — but modern frameworks made the question mostly irrelevant.'
date: 2026-03-29
tags: ['php', 'stackoverflow', 'basics', 'web-development']
lang: 'en'
---

# Get Current Filename in PHP: From $\_SERVER to Modern Routing

In 2015, I posted a [question on Stack Overflow in Portuguese](https://pt.stackoverflow.com/questions/53464) asking how to get the name of the currently executing PHP file. It got 14 upvotes, which for such a basic question tells me it was something a lot of people needed to look up. The answers covered `$_SERVER['PHP_SELF']`, `__FILE__`, `basename()`, and friends. It was a perfectly reasonable question at the time because PHP applications were often structured as collections of individual files that mapped directly to URLs.

## The Way It Worked Then

PHP in 2015 was still very much in its "one file per page" era for many projects. You had `index.php`, `about.php`, `contact.php`, and you needed to know which file was running for things like active navigation highlighting, logging, or conditional logic.

The common approaches were:

```php
// The full server path to the current file
echo __FILE__;
// /var/www/html/pages/contact.php

// Just the filename
echo basename(__FILE__);
// contact.php

// The URL path (not the filesystem path)
echo $_SERVER['PHP_SELF'];
// /pages/contact.php

// The requested URI including query string
echo $_SERVER['REQUEST_URI'];
// /pages/contact.php?ref=home

// The script name (similar to PHP_SELF but safer)
echo $_SERVER['SCRIPT_FILENAME'];
// /var/www/html/pages/contact.php
```

There was a subtle but important distinction between `__FILE__` and `$_SERVER['PHP_SELF']`. The magic constant `__FILE__` always returned the filesystem path of the file where it was written — even inside an included file. `$_SERVER['PHP_SELF']` returned the URL path of the entry script. This tripped people up constantly when using `include` or `require`.

There was also a security angle. `$_SERVER['PHP_SELF']` was injectable through URL manipulation. If your form action used it unescaped:

```php
<!-- Vulnerable to XSS -->
<form action="<?php echo $_SERVER['PHP_SELF']; ?>">
```

An attacker could craft a URL like `/contact.php/%22%3E%3Cscript%3Ealert(1)%3C/script%3E` and inject arbitrary HTML. This was a well-known vulnerability that caught many beginners off guard.

## How Modern PHP Changed the Question

Here is the thing — in modern PHP development, you almost never need to know the current filename. And the reason is routing.

**Every major PHP framework** — Laravel, Symfony, Slim, even modern WordPress — routes all requests through a single entry point (usually `public/index.php`) and uses a router to dispatch to the correct handler. The URL `/about` does not correspond to an `about.php` file. It corresponds to a route definition:

```php
// Laravel
Route::get('/about', [PageController::class, 'about']);

// Symfony
#[Route('/about', name: 'about')]
public function about(): Response { ... }
```

In this world, the "current filename" is always `index.php`. The meaningful identifier is the route name, not the file path. If you need to know where you are for navigation highlighting, you check the route:

```php
// Laravel Blade template
<li class="{{ request()->routeIs('about') ? 'active' : '' }}">
    <a href="{{ route('about') }}">About</a>
</li>
```

**Where `__FILE__` still matters.** Magic constants did not become useless — they just shifted context. In CLI scripts, `__FILE__` is still the reliable way to resolve paths relative to the script location. PHP 8's `__DIR__` (which is shorthand for `dirname(__FILE__)`) is everywhere in autoloader configurations and config files:

```php
// Composer autoload - this pattern is in every PHP project
require __DIR__ . '/vendor/autoload.php';

// Config relative to project root
$config = parse_ini_file(__DIR__ . '/../config/app.ini');
```

**`$_SERVER['PHP_SELF']` is effectively deprecated in practice.** No modern framework exposes it, and the XSS risk means you should never use it in output without escaping. The safe alternative was always `$_SERVER['SCRIPT_NAME']`, but even that is irrelevant when your router handles URL generation.

## What I Would Tell My 2015 Self

The question was valid — file-based routing was the norm, and knowing your current file mattered. But I would add a footnote: "Learn a framework with a router. Once you do, you will never ask this question again." The shift from file-based to route-based architecture did not just change how we handle URLs. It eliminated an entire category of questions about PHP file introspection that we all spent time answering on Stack Overflow.
