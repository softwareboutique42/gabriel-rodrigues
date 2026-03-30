---
title: 'PHP Date e Verificação de Fim de Semana: De date("w") a DateTimeImmutable'
description: 'De uma resposta no Stack Overflow de 2015 sobre verificar fins de semana em PHP até a era moderna de DateTimeImmutable, Carbon e calendários locale-aware.'
date: 2026-03-29
tags: ['php', 'datetime', 'stackoverflow', 'desenvolvimento-web']
lang: 'pt'
---

# PHP Date e Verificação de Fim de Semana: De date("w") a DateTimeImmutable

Em 2015, alguém no [Stack Overflow em Português](https://pt.stackoverflow.com/questions/86757) perguntou como verificar se uma data cai num fim de semana em PHP. Postei uma resposta que recebeu 6 votos — uma solução limpa e direta usando `date('w')` e `strtotime()`. Funcionava. Era simples. E se você procurar bem, vai encontrar esse exato padrão rodando em produção até hoje.

Mas o tratamento de datas do PHP cresceu muito desde então. Aqui está como era a resposta, por que era suficiente na época, e o que eu escreveria no lugar em 2026.

## A Resposta de 2015: date('w') e strtotime

A abordagem era morta de simples. A função `date()` do PHP com o caractere de formato `'w'` retorna o dia da semana como número: 0 para domingo, 6 para sábado. Combine com `strtotime()` para parsear uma string de data, e você tem verificação de fim de semana em duas linhas:

```php
$dayOfWeek = date('w', strtotime('2015-08-15'));
$isWeekend = ($dayOfWeek == 0 || $dayOfWeek == 6);
```

Só isso. Parseia a string num Unix timestamp, extrai o dia da semana, verifica se é 0 ou 6. Você podia encapsular numa função e pronto.

Para pontos bônus, podia usar `date('N')`, que retorna 1 (segunda) até 7 (domingo) seguindo o padrão ISO-8601. Isso deixava a verificação ligeiramente mais limpa:

```php
$dayOfWeek = date('N', strtotime('2015-08-15'));
$isWeekend = ($dayOfWeek >= 6);
```

Ambas funcionavam. A resposta estava correta, fácil de entender, e cobria os edge cases relevantes.

## Por Que Era Suficiente

`date()` e `strtotime()` do PHP eram o arroz com feijão da manipulação de datas por anos. Todo desenvolvedor PHP conhecia de cor. As funções eram bem documentadas, comportavam-se previsivelmente (na maioria das vezes), e lidavam com formatos comuns sem dor de cabeça.

O principal gotcha era timezone. `strtotime()` usa o timezone padrão definido por `date_default_timezone_set()`, e se você não tinha definido explicitamente, PHP chutava — às vezes mal. Mas para uma verificação "é fim de semana?", problemas de timezone raramente importavam.

## A Realidade de 2026: DateTimeImmutable e Além

PHP moderno tem `DateTimeImmutable`, e não existe mais razão para usar `date()` e `strtotime()` além de scripts descartáveis rápidos:

```php
$date = new DateTimeImmutable('2026-03-29');
$isWeekend = (int) $date->format('N') >= 6;
```

Por que preferir isso? `DateTimeImmutable` é um objeto. Você pode passá-lo adiante, encadear métodos, e — criticamente — ele não muta quando você realiza operações. O antigo `DateTime` era mutável, significando que `$date->modify('+1 day')` alterava o objeto original. Isso causava bugs sutis em todo lugar. `DateTimeImmutable` retorna uma nova instância.

Depois tem o **Carbon**, a biblioteca padrão de fato para datas no ecossistema PHP:

```php
use Carbon\Carbon;

$date = Carbon::parse('2026-03-29');
$isWeekend = $date->isWeekend();
```

Uma chamada de método. Sem números mágicos. Sem lembrar se `'w'` começa de 0 ou 1.

## A Parte Que Ninguém Discutiu: Fins de Semana por Locale

O que torna esse tema genuinamente interessante em 2026: a suposição de que sábado e domingo são "fim de semana" é culturalmente específica. Em muitos países do Oriente Médio, o fim de semana é sexta e sábado. Em alguns, é só sexta.

O `IntlCalendar` do PHP (da extensão `intl`) pode dizer quais dias são fim de semana para um dado locale:

```php
$cal = IntlCalendar::createInstance(null, 'ar_SA');
$cal->setTime($date->getTimestamp() * 1000);
$isWeekend = $cal->isWeekend();
```

Para o locale `ar_SA` (Árabe, Arábia Saudita), `isWeekend()` retorna `true` para sexta e sábado em vez de sábado e domingo. São dados ICU, os mesmos que alimentam internacionalização em Java, APIs `Intl` do JavaScript e maioria das outras plataformas.

Se você está construindo um app de agendamento ou sistema de gestão de férias que atende usuários de múltiplas regiões, hardcodar `day >= 6` é um bug esperando acontecer.

## Conclusão

A progressão de `date('w')` para `DateTimeImmutable` para Carbon para `IntlCalendar` não é apenas sobre novas APIs substituindo antigas. É sobre o escopo crescente do que consideramos "correto."

Em 2015, "essa data cai num fim de semana?" tinha uma resposta. Em 2026, a primeira pergunta é "fim de semana de acordo com quem?" O problema técnico não mudou — aritmética de datas é aritmética de datas. O que mudou é nossa consciência de contexto.

Minha resposta de 2015 ainda funciona se você está construindo para um mercado de locale único. Mas no momento que seu produto cruza uma fronteira cultural, você precisa das ferramentas mais ricas. E o PHP, para seu crédito, as tem agora.
