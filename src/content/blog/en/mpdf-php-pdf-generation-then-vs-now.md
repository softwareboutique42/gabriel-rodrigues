---
title: 'mPDF to Modern PDF Generation: Browser Engines Won'
description: 'My Stack Overflow answer wrestled with mPDF layout and CSS limitations. In 2026, Puppeteer, Playwright, and Gotenberg use real browser engines for pixel-perfect PDFs.'
date: 2026-03-29
tags: ['php', 'pdf', 'stackoverflow', 'tools']
lang: 'en'
---

# mPDF to Modern PDF Generation: Browser Engines Won

I answered a [question on Stack Overflow in Portuguese](https://pt.stackoverflow.com/questions/167610) about mPDF layout and styling issues. It scored 6 upvotes. The question was about getting CSS to work properly in mPDF — tables not aligning, margins not behaving, fonts not rendering. Classic mPDF experience.

## The Then: CSS, But Not Really

mPDF was one of several PHP libraries (alongside TCPDF and DOMPDF) that tried to convert HTML/CSS to PDF. The pitch was compelling: write your document in HTML, get a PDF out. The reality was a subset of CSS with surprising gaps:

```php
$mpdf = new \Mpdf\Mpdf([
    'margin_left' => 15,
    'margin_right' => 15,
    'margin_top' => 16,
    'margin_bottom' => 16,
]);

$html = '
<style>
    /* Some CSS works... */
    table { width: 100%; border-collapse: collapse; }
    td { padding: 8px; border: 1px solid #000; }

    /* But flexbox? No. Grid? No. */
    /* float has quirks, position: absolute is limited */
    /* @media queries? Forget it. */
</style>

<h1>Invoice #1234</h1>
<table>
    <tr><td>Item</td><td>Price</td></tr>
    <tr><td>Widget</td><td>$9.99</td></tr>
</table>';

$mpdf->WriteHTML($html);
$mpdf->Output('invoice.pdf', 'D');
```

Every project that used mPDF had the same arc: excitement ("I can use HTML!"), then frustration ("why doesn't this CSS work?"), then resignation ("I'll just use tables for everything").

The specific issues I addressed in my answer were common: elements not positioning where expected, margins collapsing differently than in browsers, and fonts not embedding correctly. The solution was always some mPDF-specific workaround rather than standard CSS.

## The Now: Real Browser Engines

The breakthrough was simple: instead of reimplementing a CSS engine in PHP, just use an actual browser to render the HTML and export to PDF.

### Puppeteer / Playwright

```javascript
import { chromium } from 'playwright';

const browser = await chromium.launch();
const page = await browser.newPage();

await page.setContent(`
  <html>
    <style>
      body { font-family: 'Inter', sans-serif; }
      .invoice { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
      @media print { .no-print { display: none; } }
    </style>
    <div class="invoice">
      <h1>Invoice #1234</h1>
      <!-- Full CSS support — flexbox, grid, custom fonts, everything -->
    </div>
  </html>
`);

await page.pdf({
  path: 'invoice.pdf',
  format: 'A4',
  printBackground: true,
  margin: { top: '20mm', bottom: '20mm', left: '15mm', right: '15mm' },
});

await browser.close();
```

Every CSS feature that works in Chrome works in your PDF. Flexbox, Grid, custom fonts, gradients, `calc()`, container queries — all of it.

### Gotenberg: PDF as a Service

```bash
# Docker-based PDF generation service
curl --request POST http://localhost:3000/forms/chromium/convert/html \
  --form files=@index.html \
  --form paperWidth=8.27 \
  --form paperHeight=11.7 \
  -o result.pdf
```

Gotenberg wraps Chromium in an HTTP API. Your PHP app sends HTML, gets a PDF back. No browser dependency in your PHP process.

### What About WKHTMLTOPDF?

WKHTMLTOPDF was the intermediate step — it used WebKit to render PDFs but was based on an ancient Qt WebKit fork. It's officially deprecated now. The rendering engine was stuck in 2015-era CSS support, which defeated the whole purpose.

## The Landscape in 2026

| Tool                 | CSS Support             | Best For                                |
| -------------------- | ----------------------- | --------------------------------------- |
| mPDF/DOMPDF          | Partial (no flex/grid)  | Simple documents, PHP-only environments |
| Puppeteer/Playwright | Full (Chromium)         | Pixel-perfect PDFs, complex layouts     |
| Gotenberg            | Full (Chromium via API) | Microservice architecture               |
| WeasyPrint           | Good (Python)           | Server-side without headless browser    |
| WKHTMLTOPDF          | Dated                   | Deprecated, don't use                   |

## What Changed

The lesson from mPDF is about fighting the wrong battle. Reimplementing a CSS rendering engine is an enormous undertaking, and you'll always be years behind browsers. The modern approach is pragmatic: browsers already render HTML/CSS perfectly, so just use them.

My 2016 answer was helping someone work around mPDF's CSS limitations. In 2026, the answer is: don't work around them. Use a tool that supports real CSS. The extra infrastructure cost of running headless Chrome is trivially small compared to the hours spent debugging mPDF layout quirks.
