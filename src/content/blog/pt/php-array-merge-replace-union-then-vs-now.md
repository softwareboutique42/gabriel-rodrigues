---
title: 'PHP array_merge vs array_replace vs + Union: O Guia Definitivo'
description: 'Minha resposta no Stack Overflow de 2016 desembaraçou a confusão de merge de arrays em PHP. Em 2026, o operador spread simplificou tudo.'
date: 2026-03-29
tags: ['php', 'stackoverflow', 'arrays', 'desenvolvimento-web']
lang: 'pt'
---

# PHP array_merge vs array_replace vs + Union: O Guia Definitivo

Em 2016, respondi uma pergunta no Stack Overflow em Português sobre a diferença entre `array_merge`, `array_replace` e o operador `+` (union) em PHP. Recebeu 10 votos, e a confusão era real — PHP tem três formas de combinar arrays, e cada uma lida com chaves duplicadas e índices numéricos de maneira diferente.

## A Resposta de 2016: Três Funções, Três Comportamentos

### array_merge — Reindexa Chaves Numéricas

```php
$a = [0 => 'a', 1 => 'b'];
$b = [0 => 'c', 1 => 'd'];

array_merge($a, $b);
// [0 => 'a', 1 => 'b', 2 => 'c', 3 => 'd']
```

Para **chaves numéricas**, `array_merge` reindexa tudo sequencialmente. Para **chaves string**, valores do segundo array sobrescrevem os do primeiro:

```php
$a = ['name' => 'Gabriel', 'role' => 'dev'];
$b = ['name' => 'Updated', 'city' => 'SP'];

array_merge($a, $b);
// ['name' => 'Updated', 'role' => 'dev', 'city' => 'SP']
```

### array_replace — Sobrescreve por Posição

```php
$a = [0 => 'a', 1 => 'b'];
$b = [0 => 'c', 1 => 'd'];

array_replace($a, $b);
// [0 => 'c', 1 => 'd']
```

Diferente de `array_merge`, preserva posições de chaves numéricas e sobrescreve valores no mesmo índice. Funciona igual para chaves string — segundo array vence.

### + (Union) — Primeiro Array Vence

```php
$a = ['name' => 'Gabriel', 'role' => 'dev'];
$b = ['name' => 'Other', 'city' => 'SP'];

$a + $b;
// ['name' => 'Gabriel', 'role' => 'dev', 'city' => 'SP']
```

O operador union mantém valores do primeiro array para chaves duplicadas. Só adiciona chaves que ainda não existem. É o oposto de `array_merge` para chaves string.

## A Atualização de 2026: Operador Spread

PHP 7.4+ introduziu o operador spread para arrays, e PHP 8.1+ estendeu para chaves string:

```php
// PHP 8.1+: Spread com chaves string (último vence)
$defaults = ['theme' => 'dark', 'lang' => 'en', 'debug' => false];
$overrides = ['theme' => 'light', 'debug' => true];

$config = [...$defaults, ...$overrides];
// ['theme' => 'light', 'lang' => 'en', 'debug' => true]
```

Equivalente a `array_merge` mas lê mais naturalmente, especialmente para merge de configurações. É o padrão que a maioria dos devs PHP usa em 2026.

### Quando Usar Cada Um

| Função           | Chaves numéricas | Chaves string  | Caso de uso                   |
| ---------------- | ---------------- | -------------- | ----------------------------- |
| `array_merge`    | Reindexa         | Último vence   | Concatenar listas             |
| `array_replace`  | Preserva posição | Último vence   | Atualizar índices específicos |
| `+` (union)      | Primeiro vence   | Primeiro vence | Aplicar defaults              |
| `[...$a, ...$b]` | Reindexa         | Último vence   | Merge de config (moderno)     |

### O Padrão de Defaults

O caso de uso mais comum é mesclar opções do usuário com defaults. Aqui o operador union brilha:

```php
function createWidget(array $options = []) {
    $defaults = ['width' => 100, 'height' => 50, 'color' => 'blue'];
    $config = $options + $defaults; // Valores do usuário vencem, defaults preenchem
    // ...
}
```

Ou com o spread (semântica último-vence, então defaults vão primeiro):

```php
function createWidget(array $options = []) {
    $config = ['width' => 100, 'height' => 50, 'color' => 'blue', ...$options];
    // ...
}
```

## Conclusão

As funções de combinação de array do PHP não são intercambiáveis — diferem em como lidam com chaves duplicadas e índices numéricos. Em 2026, o operador spread cobre 90% dos casos e lê mais claramente que chamadas de função. Mas entender `+` para defaults e `array_replace` para atualizações posicionais ainda importa quando você encontra os edge cases.
