---
title: 'PHP Number to Words in Portuguese: From Custom Functions to Intl'
description: 'My Stack Overflow answer built a recursive PHP function to spell numbers in Portuguese. In 2026, PHP intl and JS Intl.NumberFormat handle it natively.'
date: 2026-03-29
tags: ['php', 'localization', 'stackoverflow', 'portuguese']
lang: 'en'
---

# PHP Number to Words in Portuguese: From Custom Functions to Intl

Back around 2016, someone on [Stack Overflow in Portuguese](https://pt.stackoverflow.com/questions/127546) asked how to convert numbers to their written form in Portuguese. You know, turning `1542` into "mil quinhentos e quarenta e dois." My answer (scored 9 upvotes) was a recursive PHP function with hardcoded arrays of Portuguese words. It worked, but looking at it now... it was a lot of code for something that should be a library call.

## The Then: Hand-Rolling Number Spelling

The approach was textbook recursive decomposition. You break the number into groups (thousands, hundreds, tens, units) and map each to its Portuguese word:

```php
function numberToWords($number) {
    $units = ['', 'um', 'dois', 'três', 'quatro', 'cinco',
              'seis', 'sete', 'oito', 'nove'];
    $tens = ['', 'dez', 'vinte', 'trinta', 'quarenta', 'cinquenta',
             'sessenta', 'setenta', 'oitenta', 'noventa'];
    $hundreds = ['', 'cento', 'duzentos', 'trezentos', 'quatrocentos',
                 'quinhentos', 'seiscentos', 'setecentos', 'oitocentos',
                 'novecentos'];

    // Special cases: 11-19 in Portuguese
    $specials = ['onze', 'doze', 'treze', 'quatorze', 'quinze',
                 'dezesseis', 'dezessete', 'dezoito', 'dezenove'];

    // Recursive logic handling each magnitude...
    // "cem" vs "cento", "e" connectors, "mil" vs "milhão"...
}
```

The devil was in the details. Portuguese has quirks: "cem" (exactly 100) vs "cento e algo" (101-199). The connector "e" goes between groups but not always. "Um mil" is wrong — it's just "mil." And don't get me started on "milhão" vs "milhões" (singular vs plural for millions).

Every localization edge case was a new `if` statement. And this only covered Portuguese. Need Spanish? Start over. Need currency formatting? Another function.

## The Now: One Line with PHP intl

PHP's `intl` extension wraps ICU (International Components for Unicode), and its `NumberFormatter` class handles this out of the box:

```php
$formatter = new NumberFormatter('pt-BR', NumberFormatter::SPELLOUT);
echo $formatter->format(1542);
// "mil quinhentos e quarenta e dois"

echo $formatter->format(100);
// "cem"

echo $formatter->format(101);
// "cento e um"

// Works for any locale
$en = new NumberFormatter('en-US', NumberFormatter::SPELLOUT);
echo $en->format(1542);
// "one thousand five hundred forty-two"
```

All the edge cases — "cem" vs "cento," singular millions, proper connectors — are handled by ICU's rule-based number formatting. It supports every locale, not just Portuguese.

### JavaScript Does It Too

Since 2020+, browsers and Node.js support this natively:

```javascript
// Not directly spellout, but Intl handles locale-aware formatting
const formatter = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
});
console.log(formatter.format(1542));
// "R$ 1.542,00"

// For spellout, libraries like 'written-number' fill the gap
// Or use the Intl.Segmenter + custom rules approach
```

While JavaScript's `Intl.NumberFormat` doesn't have a direct spellout mode, the locale-aware formatting is built in. For full spellout, libraries leverage the same ICU data underneath.

## What Changed

The real shift wasn't just "use a library." It was the standardization of ICU as the universal localization engine. PHP's intl extension, Java's `java.text`, Python's `babel`, and browser Intl APIs all use the same ICU data. Write-once localization became possible.

My 2016 answer taught me that localization is deceptively complex. Every language has irregular number words, gendered forms, and connector rules that only native speakers notice. The lesson: never hand-roll what ICU already handles. Your recursive function might work for Portuguese, but ICU works for 500+ locales without a single hardcoded string.
