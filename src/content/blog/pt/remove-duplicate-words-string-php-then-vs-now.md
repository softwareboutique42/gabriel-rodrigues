---
title: 'Removendo Palavras Duplicadas de uma String em PHP: Antes e Agora'
description: 'Minha resposta no Stack Overflow usava explode + array_unique + implode pra deduplicar palavras. Em 2026, o mesmo pipeline ainda funciona — mais regex com backreferences e alternativas modernas.'
date: 2026-03-29
tags: ['php', 'strings', 'stackoverflow', 'algoritmos']
lang: 'pt'
---

# Removendo Palavras Duplicadas de uma String em PHP: Antes e Agora

Respondi uma pergunta no Stack Overflow em Português sobre remover palavras duplicadas de uma string em PHP. Recebeu 7 votos. A abordagem clássica era um pipeline de três funções que todo dev PHP já escreveu pelo menos uma vez.

## O Antes: O Pipeline explode-unique-implode

A resposta era direta — separar, deduplicar, juntar:

```php
$string = "o gato sentou no tapete o gato";

$words = explode(' ', $string);
$unique = array_unique($words);
$result = implode(' ', $unique);

echo $result;
// "o gato sentou no tapete"
```

Limpo, legível, eficaz. `array_unique` preserva a primeira ocorrência e remove duplicatas subsequentes, então a ordem das palavras é mantida.

Pra deduplicação case-insensitive, adicionava um truque:

```php
$string = "O gato O Gato o GATO";

$words = explode(' ', $string);
$seen = [];
$result = [];

foreach ($words as $word) {
    $lower = mb_strtolower($word);
    if (!isset($seen[$lower])) {
        $seen[$lower] = true;
        $result[] = $word;
    }
}

echo implode(' ', $result);
// "O gato"
```

E tinha a abordagem com regex usando backreferences:

```php
$string = "o o gato gato sentou sentou";

// Remove duplicatas consecutivas apenas
$result = preg_replace('/\b(\w+)\s+\1\b/iu', '$1', $string);
echo $result;
// "o gato sentou"
```

A versão regex só pega duplicatas consecutivas. Pra não-consecutivas, ainda precisava da abordagem com array.

## O Agora: Mesmo Core, Ferramentas Melhores

A real é que esse é um daqueles problemas onde a solução de 2016 ainda é a solução de 2026. `explode` + `array_unique` + `implode` continua sendo a forma mais legível de fazer isso em PHP. Mas o ecossistema ao redor evoluiu:

### Funções de String do PHP 8.x

```php
// str_contains, str_starts_with, str_ends_with (PHP 8.0)
// Tornam checagens de string relacionadas mais limpas
if (str_contains($word, '-')) {
    // Trata palavras hifenizadas
}

// Named arguments tornam o pipeline mais legível
$words = explode(separator: ' ', string: $input);
```

### Funções de Array Melhoraram

```php
// array_unique com flags de ordenação
$unique = array_unique($words, SORT_STRING | SORT_FLAG_CASE);

// Arrow functions pra filtragem customizada
$seen = [];
$unique = array_filter($words, function($word) use (&$seen) {
    $key = mb_strtolower($word);
    return !isset($seen[$key]) && ($seen[$key] = true);
});
```

### A Realidade Multi-byte

A resposta original assumia ASCII. Texto real em português tem acentos:

```php
$string = "São Paulo são paulo São PAULO";

$words = explode(' ', $string);
$seen = [];
$result = [];

foreach ($words as $word) {
    // mb_strtolower lida com "São" → "são" corretamente
    $normalized = mb_strtolower($word, 'UTF-8');
    if (!isset($seen[$normalized])) {
        $seen[$normalized] = true;
        $result[] = $word;
    }
}

echo implode(' ', $result);
// "São Paulo"
```

### Em Outras Linguagens

O mesmo padrão existe em todo lugar, geralmente mais conciso:

```javascript
// JavaScript
const unique = [...new Set(str.split(' '))].join(' ');

// Python
unique = ' '.join(dict.fromkeys(s.split()));
```

A abordagem com `Set` do JavaScript é provavelmente o one-liner mais limpo pra esse problema em qualquer linguagem.

## O Que Aprendi

Nem todo problema precisa de uma solução nova a cada década. `explode` + `array_unique` + `implode` é uma resposta perfeitamente boa em 2016 e em 2026. A lição é sobre reconhecer quando um pipeline simples é bom o suficiente versus quando você precisa de algo mais sofisticado.

As melhorias reais estão nas bordas: melhor suporte multi-byte, named arguments pra legibilidade, e saber quando usar regex com backreferences versus operações com array. Às vezes o melhor código é o código que não precisou mudar.
