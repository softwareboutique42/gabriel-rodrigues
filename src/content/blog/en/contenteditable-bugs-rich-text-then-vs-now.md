---
title: 'contenteditable Bugs: How Browser Pain Created Modern Editors'
description: 'My Stack Overflow answer tackled Firefox padding bugs in contenteditable. In 2026, Tiptap, ProseMirror, and Lexical exist because nobody should hand-roll rich text.'
date: 2026-03-29
tags: ['html', 'browsers', 'stackoverflow', 'editors']
lang: 'en'
---

# contenteditable Bugs: How Browser Pain Created Modern Editors

Around 2016, I answered a [question on Stack Overflow in Portuguese](https://pt.stackoverflow.com/questions/138651) about using `contenteditable` as a textarea alternative and dealing with a Firefox-specific padding bug. The answer scored 9 upvotes. The question was simple enough: how do you make a div editable and style it like a textarea? The reality was anything but simple.

## The Then: Fighting Each Browser Individually

The `contenteditable` attribute sounds magical. Add it to any element and it becomes editable:

```html
<div contenteditable="true" class="editor">Type here...</div>
```

But in practice? Every browser implemented it differently. My answer dealt with Firefox adding mysterious extra padding inside contenteditable elements. The fix was CSS:

```css
[contenteditable] {
  /* Firefox padding fix */
  -moz-appearance: textfield-multiline;
  padding: 8px;
}

/* Remove the extra <br> Firefox inserts */
[contenteditable]:empty::before {
  content: attr(placeholder);
  color: #999;
}
```

That was just the tip of the iceberg. Here's what building on contenteditable actually meant in 2016:

- **Chrome** wrapped text in `<div>` tags when you pressed Enter
- **Firefox** inserted `<br>` elements instead
- **Safari** used `<div>` but with different whitespace handling
- **IE/Edge** wrapped in `<p>` tags
- Pasting content from Word brought in mountains of garbage HTML
- Undo/redo behavior was completely inconsistent
- Cursor positioning after programmatic DOM changes was a nightmare

Every rich text editor built on contenteditable was essentially a collection of browser-specific hacks. I remember spending days debugging why a cursor would jump to the wrong position in Firefox after inserting a formatted node.

## The Now: Abstraction Layers That Actually Work

In 2026, the answer to "how do I build a rich text editor?" is never "use contenteditable directly." It's "pick a framework":

### ProseMirror / Tiptap

```javascript
import { Editor } from '@tiptap/core';
import StarterKit from '@tiptap/starter-kit';

const editor = new Editor({
  element: document.querySelector('.editor'),
  extensions: [StarterKit],
  content: '<p>Start typing...</p>',
});
```

Tiptap (built on ProseMirror) gives you a schema-based document model. The contenteditable div is still there underneath, but you never touch it directly. ProseMirror's transaction system handles all the cross-browser normalization.

### Lexical (Meta)

```javascript
import { createEditor } from 'lexical';

const editor = createEditor({
  namespace: 'MyEditor',
  onError: (error) => console.error(error),
});
```

Lexical takes it further — it actually replaces contenteditable's default behavior entirely, intercepting every keystroke and DOM mutation to maintain its own state tree.

### What They All Share

Every modern editor framework follows the same pattern: **don't trust the browser's contenteditable implementation.** They maintain their own document model, translate user inputs into model operations, and then reconcile the DOM. It's the same concept as React's virtual DOM, applied to text editing.

## The Lesson

My 2016 answer was a band-aid on a fundamental problem. contenteditable was designed for simple editing, but we tried to build Google Docs on top of it. The bugs and inconsistencies weren't edge cases — they were the feature working as designed across different browser engines.

The fact that three major editor frameworks (ProseMirror, Lexical, Slate) all converged on "maintain your own model, don't trust the DOM" tells you everything about how painful the raw API was. Sometimes the best solution isn't fixing the bugs — it's building an abstraction that makes them irrelevant.
