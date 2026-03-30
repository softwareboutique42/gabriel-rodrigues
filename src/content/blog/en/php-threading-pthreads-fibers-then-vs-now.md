---
title: 'PHP Threading: From pthreads to Fibers, ReactPHP, and Beyond'
description: 'From a Stack Overflow question about PHP threading with pthreads to the modern landscape of PHP 8.1 Fibers, ReactPHP, Amp, and FrankenPHP in 2026.'
date: 2026-03-29
tags: ['php', 'concurrency', 'stackoverflow', 'architecture']
lang: 'en'
---

# PHP Threading: From pthreads to Fibers, ReactPHP, and Beyond

I asked a question on Stack Overflow in Portuguese about threading in PHP — specifically about the pthreads extension. It scored 12, and looking back, the question captured a moment when PHP developers were genuinely confused about concurrency. PHP was a request-response language. You processed one request, sent the response, and the process died. Why would you need threads?

Turns out, people wanted to do things like send emails in the background, process images without blocking, or handle WebSocket connections. The answer in 2015 was complicated. The answer in 2026 is a completely different landscape.

## The 2015 Approach: pthreads

The pthreads extension brought actual POSIX threads to PHP. It required ZTS (Zend Thread Safety) builds of PHP, which most hosting environments didn't provide. Installing it was already a barrier.

```php
class AsyncTask extends Thread {
    private $data;

    public function __construct($data) {
        $this->data = $data;
    }

    public function run() {
        // This runs in a separate thread
        $result = file_get_contents("https://api.example.com/process");
        // Store result somehow...
    }
}

$task = new AsyncTask("payload");
$task->start();
// Do other work...
$task->join();
```

The problems were significant:

- **ZTS requirement.** Most PHP installations were NTS (Non-Thread-Safe). Shared hosting? Forget it. Docker images? You needed a special build.
- **Data sharing was painful.** PHP objects aren't designed for concurrent access. pthreads had to serialize and deserialize data between threads, with special `Threaded` objects that had their own rules.
- **No ecosystem support.** PHP libraries assumed single-threaded execution. Using a database library inside a thread could cause connection pool issues. Using sessions was impossible.
- **Maintenance burden.** pthreads was maintained by one person (Joe Watkins). It was an incredible engineering effort, but it was fighting against PHP's fundamental architecture.

The honest truth in 2015 was: if you needed real concurrency, PHP probably wasn't the right tool.

## What Changed: pthreads Is Dead, Long Live Fibers

The pthreads extension was officially abandoned and doesn't work with PHP 8.x. But PHP's concurrency story has been completely rewritten.

### PHP 8.1 Fibers

Fibers, introduced in PHP 8.1, are cooperative concurrency primitives — lightweight, stackful coroutines:

```php
$fiber = new Fiber(function (): void {
    $value = Fiber::suspend('waiting');
    echo "Resumed with: $value";
});

$result = $fiber->start(); // "waiting"
$fiber->resume('hello');   // "Resumed with: hello"
```

Fibers aren't threads. They don't run in parallel. Instead, they allow a piece of code to suspend itself and be resumed later. This is the foundation that async frameworks build on.

### ReactPHP and Amp

The real concurrency story in PHP is event-loop-based async I/O, powered by Fibers under the hood:

```php
// ReactPHP with Fibers (async/await style)
use React\Http\Browser;
use function React\Async\await;

$browser = new Browser();
$response = await($browser->get('https://api.example.com/data'));
echo $response->getBody();
```

ReactPHP and Amp let you handle thousands of concurrent I/O operations in a single PHP process. HTTP requests, database queries, file operations — they all happen concurrently via the event loop, not threads. The code reads like synchronous code thanks to Fibers.

### Swoole and FrankenPHP

For true parallel execution, **Swoole** (and its fork OpenSwoole) provide coroutines and multi-process architecture as a PHP extension:

```php
Co\run(function() {
    go(function() {
        $result = Co\Http\get('https://api.example.com/a');
    });
    go(function() {
        $result = Co\Http\get('https://api.example.com/b');
    });
    // Both requests run concurrently
});
```

**FrankenPHP**, built on Go's `net/http`, embeds PHP as a library and serves it with Go's goroutine-based concurrency. It supports worker mode, where PHP processes persist between requests, enabling real long-lived connections and background processing.

## The Lesson

PHP's concurrency story went from "use pthreads if you dare" to a rich ecosystem of solutions, each suited to different problems. Need async I/O? ReactPHP or Amp with Fibers. Need a high-performance server with persistent workers? Swoole or FrankenPHP. Need simple background jobs? A queue system with workers is still the most pragmatic choice.

The key insight: PHP didn't need threads. It needed cooperative concurrency for I/O-bound work, which is what most web applications actually do. Fibers provided the primitive, and the ecosystem built the rest.
