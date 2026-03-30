---
title: 'Progress Bar with AJAX and PHP: From Polling to Streams'
description: 'My 2015 Stack Overflow question about real-time progress bars used AJAX polling. In 2026, Server-Sent Events and ReadableStream do it natively.'
date: 2026-03-29
tags: ['php', 'javascript', 'ajax', 'stackoverflow']
lang: 'en'
---

# Progress Bar with AJAX and PHP: From Polling to Streams

In 2015, I asked a [question on Stack Overflow in Portuguese](https://pt.stackoverflow.com/questions/68587) about how to show a real-time progress bar during a long-running PHP process. The question scored 16 upvotes — a sign that "how do I show the user what's happening on the server?" was a universal challenge.

## The 2015 Approach: AJAX Polling

The standard solution involved three moving parts:

1. **Start the process** — an AJAX call triggers a long-running PHP script
2. **Store progress** — the PHP script writes its progress to a session variable or temp file
3. **Poll for updates** — a second AJAX call runs on a `setInterval`, reading the progress value

```javascript
// 2015: Start the process
$.post('/process.php', { data: formData });

// Poll every 500ms
var pollInterval = setInterval(function () {
  $.get('/progress.php', function (data) {
    $('#progress-bar').css('width', data.percent + '%');
    if (data.percent >= 100) {
      clearInterval(pollInterval);
    }
  });
}, 500);
```

```php
// progress.php
session_start();
echo json_encode(['percent' => $_SESSION['progress'] ?? 0]);
```

It worked, but it was wasteful. Every 500ms, the browser sent a full HTTP request just to ask "are we there yet?" — even when nothing had changed.

## The 2026 Approach: Server-Sent Events

Server-Sent Events (SSE) let the server push updates to the browser over a single, long-lived HTTP connection:

```javascript
// 2026: One connection, server pushes updates
const source = new EventSource('/process-stream.php');

source.onmessage = (event) => {
  const data = JSON.parse(event.data);
  progressBar.style.width = `${data.percent}%`;

  if (data.percent >= 100) {
    source.close();
  }
};
```

```php
// process-stream.php
header('Content-Type: text/event-stream');
header('Cache-Control: no-cache');

for ($i = 0; $i <= 100; $i += 10) {
    echo "data: " . json_encode(['percent' => $i]) . "\n\n";
    ob_flush();
    flush();
    sleep(1); // Simulate work
}
```

No polling. No wasted requests. The server sends data when it has something to report.

### fetch() with ReadableStream

For more control, you can stream responses with the Fetch API:

```javascript
const response = await fetch('/process-stream', { method: 'POST', body: formData });
const reader = response.body.getReader();
const decoder = new TextDecoder();

while (true) {
  const { done, value } = await reader.read();
  if (done) break;

  const text = decoder.decode(value);
  const data = JSON.parse(text);
  progressBar.style.width = `${data.percent}%`;
}
```

This approach works with any backend — Node.js, Go, Python — not just PHP. And it handles binary data too, not just text events.

### WebSocket for Bidirectional

If you need the client to send messages _during_ the process (pause, cancel, adjust parameters), WebSocket is the right tool:

```javascript
const ws = new WebSocket('wss://api.example.com/process');

ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  progressBar.style.width = `${data.percent}%`;
};

// Cancel the process mid-flight
cancelButton.onclick = () => ws.send(JSON.stringify({ action: 'cancel' }));
```

## Quick Comparison

| Approach       | Direction       | Overhead                 | Complexity | Best for                     |
| -------------- | --------------- | ------------------------ | ---------- | ---------------------------- |
| AJAX polling   | Client → Server | High (repeated requests) | Low        | Legacy systems               |
| SSE            | Server → Client | Low (single connection)  | Low        | Progress bars, notifications |
| ReadableStream | Server → Client | Low                      | Medium     | Streaming responses          |
| WebSocket      | Bidirectional   | Low                      | Higher     | Interactive processes        |

## Key Takeaway

In 2015, showing server progress meant polling — asking the server every few hundred milliseconds if anything changed. In 2026, the server tells _you_ when something changes. SSE is the simplest upgrade path for progress bars, and it works with minimal backend changes. The polling pattern isn't wrong, but it's solving a problem that the platform now handles natively.
