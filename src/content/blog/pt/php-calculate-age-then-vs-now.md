---
title: 'Calcular Idade em PHP: DateTime::diff Antes e Agora'
description: 'De uma resposta de 2015 no Stack Overflow sobre calcular idade com PHP DateTime até 2026 — a mesma abordagem ainda funciona, mas Carbon e timezones mudaram o jogo.'
date: 2026-03-29
tags: ['php', 'datetime', 'stackoverflow', 'desenvolvimento-web']
lang: 'pt'
---

# Calcular Idade em PHP: DateTime::diff Antes e Agora

Em 2015, eu respondi uma pergunta no [Stack Overflow em Português](https://pt.stackoverflow.com/questions/79498) sobre como calcular a idade de uma pessoa em PHP. Pergunta clássica — alguém tinha uma data de nascimento e queria saber o número de anos. Mostrei o `DateTime::diff()` e a propriedade `y` no `DateInterval` resultante. A resposta recebeu 4 upvotes. Simples, correto, útil.

O interessante é: diferente da maioria dos meus posts "antes vs agora", esse é menos sobre a resposta antiga estar errada e mais sobre as sutilezas que a maioria dos devs ainda erra, mesmo usando a API certa.

## A Resposta de 2015: DateTime::diff()

A abordagem era direta:

```php
$dataNascimento = new DateTime('1990-05-15');
$hoje = new DateTime('today');
$idade = $dataNascimento->diff($hoje)->y;

echo $idade; // 35 (em 2026)
```

`DateTime::diff()` retorna um objeto `DateInterval`. A propriedade `y` te dá o número de anos completos entre as duas datas. Ele lida com anos bissextos, meses de tamanhos diferentes, tudo. Sem matemática manual com timestamps, sem dividir segundos por números mágicos.

Essa era a abordagem correta em 2015. E honestamente? Ainda é correta em 2026. A classe `DateTime` do PHP não mudou de nenhuma forma significativa para esse caso de uso.

## O Que a Maioria Fazia de Errado

Antes do `DateTime::diff()` virar conhecimento comum, você via código assim em todo lugar:

```php
$idade = floor((time() - strtotime($dataNascimento)) / (365.25 * 24 * 60 * 60));
```

Dividir por 365.25 para "compensar anos bissextos." Isso era aproximado no melhor dos casos e errado no pior — podia dar diferença de um dia dependendo de quando o cálculo rodava em relação ao aniversário. A abordagem com `DateTime` eliminou essa classe de bug inteiramente.

## A Realidade de 2026: Ainda Funciona, Mas Com Nuances

A técnica central não mudou. `DateTime::diff()` continua sendo a forma correta de calcular idade em PHP. O que mudou foi o ecossistema ao redor e os edge cases que os devs realmente se preocupam.

### Carbon Tornou Tudo Mais Ergonômico

A maioria dos projetos PHP modernos usa [Carbon](https://carbon.nesbot.com/) (ou CarbonImmutable), que estende DateTime com uma API mais amigável:

```php
use Carbon\Carbon;

$idade = Carbon::parse('1990-05-15')->age;
```

Uma linha. `age` é uma propriedade computada que faz exatamente o que `DateTime::diff()->y` faz, mas lê melhor. Em projetos Laravel, campos de data dos models Eloquent já são instâncias Carbon, então você escreveria simplesmente `$usuario->data_nascimento->age`.

### Edge Cases de Timezone Realmente Importam Agora

Em 2015, a maioria das apps PHP rodava em um único fuso horário e atendia usuários de um país. Ninguém se preocupava com o que "hoje" significava em diferentes timezones. Em 2026, com apps distribuídas globalmente, isso importa:

```php
// Um usuário nascido em 29 de março de 2000
// É 29 de março de 2026 em Tóquio mas ainda 28 de março em Nova York

$nasc = new DateTime('2000-03-29');
$agoraTokyo = new DateTime('now', new DateTimeZone('Asia/Tokyo'));
$agoraNY = new DateTime('now', new DateTimeZone('America/New_York'));

$nasc->diff($agoraTokyo)->y; // Pode ser 26
$nasc->diff($agoraNY)->y;    // Pode ainda ser 25
```

A pergunta vira: de quem é o timezone que importa? Do usuário? Do servidor? A resposta depende da sua lógica de negócio, e a maioria das implementações não pensa nisso.

### Imutabilidade Virou o Padrão

PHP 8.x forçou padrões imutáveis com mais intensidade. `DateTimeImmutable` agora é preferido sobre `DateTime` para evitar mutações acidentais:

```php
$nasc = new DateTimeImmutable('1990-05-15');
$hoje = new DateTimeImmutable('today');
$idade = $nasc->diff($hoje)->y;
```

Mesmo resultado, mas `$nasc` e `$hoje` não podem ser acidentalmente modificados por outro código. Carbon seguiu o mesmo caminho com `CarbonImmutable`.

## O Que Não Mudou

O algoritmo fundamental para "quantos anos completos entre duas datas" é o mesmo. Não existe calculadora de idade com IA. Nenhum novo padrão web para matemática de datas. `DateTime::diff()` resolveu isso no PHP 5.3 (lançado em 2009), e ainda é a resposta.

## A Lição

Nem todo problema precisa de uma solução nova a cada poucos anos. Às vezes a resposta de 2015 ainda é a resposta de 2026. A diferença está no contexto — consciência de timezone, preferência por imutabilidade, ergonomia de framework. A lógica central é idêntica. Se você se pegar escrevendo matemática de datas customizada com timestamps e divisão, pare. `DateTime::diff()` sempre esteve lá.
