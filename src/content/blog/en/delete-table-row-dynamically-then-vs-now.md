---
title: 'Delete Table Rows Dynamically with JavaScript'
description: 'My 2016 Stack Overflow answer used parentNode.removeChild to delete rows. In 2026, element.remove() and closest() made it a one-liner.'
date: 2026-03-29
tags: ['javascript', 'dom', 'stackoverflow', 'html']
lang: 'en'
---

# Delete Table Rows Dynamically with JavaScript

In 2016, I answered a [question on Stack Overflow in Portuguese](https://pt.stackoverflow.com/questions/133920) about deleting rows from an HTML table dynamically. It scored 6 upvotes. The pattern was everywhere — editable tables where users could add and remove rows.

## The 2016 Approach

```javascript
// 2016: Navigate up the DOM tree to find and remove the row
function deleteRow(button) {
  var row = button.parentNode.parentNode; // button > td > tr
  row.parentNode.removeChild(row);
}
```

```html
<tr>
  <td>Item 1</td>
  <td><button onclick="deleteRow(this)">Delete</button></td>
</tr>
```

The `parentNode.parentNode` chain was fragile — change the HTML structure and the function breaks. `removeChild` also required referencing the parent to remove a child, which always felt backwards.

For tables with many rows, we used event delegation:

```javascript
document.getElementById('myTable').addEventListener('click', function (e) {
  if (e.target.classList.contains('delete-btn')) {
    var row = e.target.parentNode.parentNode;
    row.parentNode.removeChild(row);
  }
});
```

## The 2026 Approach

```javascript
// 2026: Two modern methods make this clean
document.querySelector('table').addEventListener('click', (e) => {
  if (e.target.matches('.delete-btn')) {
    e.target.closest('tr').remove();
  }
});
```

Two key improvements:

**`closest('tr')`** walks up the DOM tree and finds the nearest matching ancestor. No more counting `parentNode` levels. If you add a `<span>` inside the button, it still works.

**`element.remove()`** removes the element directly. No need to reference the parent first.

The event delegation pattern is the same — and it's still the right approach for dynamic tables. But the DOM traversal and removal are now each one method call instead of a chain of `parentNode` references.

## Key Takeaway

The principle hasn't changed: delegate events on the table, traverse up to find the row, remove it. What changed is the API surface. `closest()` and `remove()` turned a fragile `parentNode` chain into self-documenting code. Understanding vanilla DOM manipulation remains foundational — it's what runs under every framework's abstraction.
