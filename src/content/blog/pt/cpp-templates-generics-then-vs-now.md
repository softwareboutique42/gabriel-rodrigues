---
title: 'Templates C++: De Programação Genérica Básica a Concepts do C++20'
description: 'Minha pergunta no SO de 2015 sobre templates C++. Em 2026, Concepts restringem templates com mensagens de erro claras e intenção expressiva.'
date: 2026-03-29
tags: ['cpp', 'templates', 'stackoverflow', 'funcionalidades']
lang: 'pt'
---

# Templates C++: De Programação Genérica Básica a Concepts do C++20

Em 2015, fiz uma [pergunta no Stack Overflow em Português](https://pt.stackoverflow.com/questions/63573) sobre templates C++ — um dos recursos mais poderosos e intimidantes da linguagem. Recebeu 11 votos, o que me diz que a confusão era compartilhada por muitos.

## O Entendimento de 2015: Funções e Classes Genéricas

Templates permitem escrever código que funciona com múltiplos tipos:

```cpp
template <typename T>
T somar(T a, T b) {
    return a + b;
}

int resultado = somar(3, 4);          // T = int
double resultado2 = somar(3.14, 2.0); // T = double
```

O poder era claro — escreva uma vez, use com qualquer tipo. O problema eram as mensagens de erro. Se você passasse um tipo que não suportava as operações necessárias, o erro era famosamente críptico: páginas de contexto de instanciação de template.

## A Abordagem de 2026: C++20 Concepts

Concepts permitem expressar restrições de tipo explicitamente, com mensagens de erro claras:

```cpp
#include <concepts>

template <std::integral T>
T multiplicar(T a, T b) {
    return a * b;
}
```

Se chamar `multiplicar("olá", "mundo")`, você recebe um erro claro: _"restrições não satisfeitas: std::integral<const char_> não foi satisfeito."\* Não 40 linhas de instanciação de template.

Concepts customizados:

```cpp
template <typename T>
concept Imprimivel = requires(T t) {
    { std::cout << t } -> std::same_as<std::ostream&>;
};

template <Imprimivel T>
void imprimir(T valor) {
    std::cout << valor << '\n';
}
```

## Comparação com Outras Linguagens

| Feature             | C++ Templates           | TypeScript Generics | Rust Generics |
| ------------------- | ----------------------- | ------------------- | ------------- |
| Restrições          | C++20 Concepts          | cláusula `extends`  | trait bounds  |
| Mensagens de erro   | Melhoradas com Concepts | Boas                | Excelentes    |
| Tempo de compilação | Sim                     | Sim (só tipos)      | Sim           |

## Conclusão

Templates C++ eram poderosos mas inacessíveis em 2015 — as mensagens de erro eram uma barreira por si só. C++20 Concepts transformaram restrições de template em linguagem de design. Se está aprendendo C++ hoje, comece com Concepts desde o primeiro dia.
