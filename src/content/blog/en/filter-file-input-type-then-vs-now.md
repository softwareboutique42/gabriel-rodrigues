---
title: 'Filter File Input by Type: From accept Attributes to File System Access API'
description: 'Back in 2015, I asked on Stack Overflow how to filter file inputs by type. The accept attribute was the answer then — but today we have far more powerful options.'
date: 2026-03-29
tags: ['html', 'forms', 'javascript', 'stackoverflow']
lang: 'en'
---

# Filter File Input by Type: From accept Attributes to File System Access API

In 2015, I posted a question on Stack Overflow in Portuguese asking how to filter which file types a user could select through an `<input type="file">`. The question got 7 upvotes, which tells me other people were wondering the same thing. The answer back then was straightforward — use the `accept` attribute. But a decade later, the landscape for handling file uploads in the browser has changed dramatically.

## The Way It Worked Then

The `accept` attribute on file inputs was the primary tool. You could pass MIME types or file extensions to hint at which files the file picker should show:

```html
<!-- Filter by MIME type -->
<input type="file" accept="image/*" />

<!-- Filter by specific extensions -->
<input type="file" accept=".pdf,.doc,.docx" />

<!-- Combine both approaches -->
<input type="file" accept="image/png, image/jpeg, .webp" />
```

This worked, mostly. The operating system's file dialog would filter the visible files to match your criteria. But it had real limitations. The `accept` attribute is a **suggestion**, not a constraint. Users can switch the file picker to "All Files" and select whatever they want. There was no client-side enforcement — if someone picked a `.exe` when you asked for `.pdf`, your JavaScript had to catch it after the fact.

The validation side was basic too. You would check `file.type` or `file.name` and hope for the best:

```javascript
const input = document.querySelector('input[type="file"]');
input.addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (!file.type.startsWith('image/')) {
    alert('Please select an image file');
    input.value = '';
  }
});
```

This was fragile. File extensions can be renamed. MIME types reported by the browser depend on the OS file association, not the actual file content.

## What We Have Now

The toolbox for file handling in the browser has expanded significantly.

**The File System Access API** gives you programmatic control over which files users can pick, with built-in type filtering that is more robust than the `accept` attribute:

```javascript
async function pickImage() {
  const [handle] = await window.showOpenFilePicker({
    types: [
      {
        description: 'Image files',
        accept: {
          'image/png': ['.png'],
          'image/jpeg': ['.jpg', '.jpeg'],
          'image/webp': ['.webp'],
        },
      },
    ],
    multiple: false,
  });
  const file = await handle.getFile();
  return file;
}
```

This API gives you `FileSystemFileHandle` objects, which means you can also write back to the same file later — something the old `<input type="file">` could never do.

**Magic byte validation** is now a practical client-side technique. Instead of trusting the file extension, you read the first few bytes of the file to verify its actual format:

```javascript
async function isValidPNG(file) {
  const buffer = await file.slice(0, 8).arrayBuffer();
  const bytes = new Uint8Array(buffer);
  // PNG magic bytes: 137 80 78 71 13 10 26 10
  return bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47;
}
```

This is real validation. A renamed `.txt` file with a `.png` extension will fail this check. It is the same technique servers have used for years, now running in the browser.

**Drag-and-drop zones** have become the preferred UX pattern for file uploads. Combined with the `DataTransfer` API and `webkitGetAsEntry()` (now widely supported), you can build upload experiences that handle folders, filter types on drop, and provide instant visual feedback — all without the clunky native file dialog.

## What I Would Tell My 2015 Self

The `accept` attribute still belongs in your HTML — it is the baseline, the progressive enhancement starting point. But if you are building any serious file upload flow today, you should layer on the File System Access API for modern browsers, validate file content with magic bytes instead of trusting extensions, and consider drag-and-drop as the primary interaction. The browser is no longer just a thin wrapper around the OS file picker. It is a capable file handling platform on its own.
