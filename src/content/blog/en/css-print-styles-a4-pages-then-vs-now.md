---
title: 'CSS Print Styles for A4 Pages: From @media print to Paged.js'
description: 'My 2015 SO question about CSS print styles. In 2026, @page rules and Paged.js give you precise control over printed output.'
date: 2026-03-29
tags: ['css', 'print', 'stackoverflow', 'layout']
lang: 'en'
---

# CSS Print Styles for A4 Pages: From @media print to Paged.js

In 2015, I asked a question on Stack Overflow in Portuguese about styling a page for A4 print output with CSS. It scored 9 upvotes.

## The 2015 Approach: @media print

```css
@media print {
  body {
    margin: 0;
    padding: 0;
  }

  .no-print {
    display: none;
  }

  /* A4 size */
  @page {
    size: A4;
    margin: 2cm;
  }
}
```

The main frustrations:

- Browsers added their own margins on top of your CSS margins
- Page breaks were unpredictable — tables would split mid-row
- Headers and footers were hard to control without browser settings
- Testing required printing or using print preview

## The 2026 Approach

### @page and page-break properties

`@page` rules are better supported now, and the `break-before`/`break-after` properties replaced the deprecated `page-break-*` properties:

```css
@page {
  size: A4 portrait;
  margin: 2cm 2.5cm;
}

/* Ensure chapters start on a new page */
h1 {
  break-before: page;
}

/* Prevent tables from splitting mid-row */
tr {
  break-inside: avoid;
}

/* Keep headings with their following content */
h2,
h3 {
  break-after: avoid;
}
```

### Paged.js for Complex Print Layouts

For invoices, reports, and books that need true pagination control, [Paged.js](https://pagedjs.org/) is a polyfill that brings W3C CSS Paged Media spec to any browser:

```html
<script src="paged.js"></script>
```

With Paged.js you can define page margins, headers, footers, running headers, and page numbers — all in CSS, without fighting browser print behavior.

### Browser Print to PDF

Modern browsers produce excellent PDF output with Ctrl+P → "Save as PDF." Combined with careful print CSS, this eliminates the need for server-side PDF generation (Puppeteer, wkhtmltopdf) for many use cases.

## Key Takeaway

Print CSS was a frustrating second-class citizen in 2015. In 2026, `break-before`/`break-after` replaced the old `page-break-*` properties, `@page` is better supported, and Paged.js fills the gaps for complex layouts. For simple print styling, pure CSS is enough.
