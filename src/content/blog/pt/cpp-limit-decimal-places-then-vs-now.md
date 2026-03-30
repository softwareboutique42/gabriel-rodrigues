---
title: 'Formatação Decimal em C/C++: De printf a std::format'
description: 'Minha resposta no SO de 2015 usava printf("%.2f"). C++20 trouxe std::format com sintaxe estilo Python para C++.'
date: 2026-03-29
tags: ['cpp', 'formatação', 'stackoverflow', 'funcionalidades']
lang: 'pt'
---

# Formatação Decimal em C/C++: De printf a std::format

Em 2015, respondi uma pergunta no Stack Overflow em Português sobre limitar casas decimais em C e C++. Recebeu 5 votos.

## A Resposta de 2015: Duas Abordagens

**Estilo C com printf:**

```c
double valor = 3.14159;
printf("%.2f\n", valor); // Saída: 3.14
```

**C++ com iomanip:**

```cpp
#include <iostream>
#include <iomanip>

double valor = 3.14159;
std::cout << std::fixed << std::setprecision(2) << valor << std::endl; // 3.14
```

Ambas funcionavam, mas cada uma tinha incômodos. `printf` exigia memorizar especificadores. `iomanip` era verboso, e `std::fixed` + `std::setprecision` persistiam em saídas subsequentes.

## A Abordagem de 2026: std::format

C++20 introduziu `std::format`, trazendo formatação estilo Python para C++:

```cpp
#include <format>

double valor = 3.14159;
std::string resultado = std::format("{:.2f}", valor); // "3.14"
std::println("{:.2f}", valor); // C++23: imprime com quebra de linha
```

Se você conhece `f"{valor:.2f}"` do Python, já sabe `std::format("{:.2f}", valor)`.

### Referência de Especificadores

| Formato   | Resultado para 3.14159 | Significado           |
| --------- | ---------------------- | --------------------- |
| `{:.2f}`  | `3.14`                 | Fixo, 2 decimais      |
| `{:.4f}`  | `3.1416`               | Fixo, 4 decimais      |
| `{:.2e}`  | `3.14e+00`             | Notação científica    |
| `{:8.2f}` | `    3.14`             | Largura 8, 2 decimais |

## Conclusão

`printf("%.2f")` ainda funciona e é a escolha certa em C. Em C++ moderno, `std::format` oferece sintaxe mais limpa, type safety em tempo de compilação e sem risco de vulnerabilidades de format string.
